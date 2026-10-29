import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Check, ChevronLeft, ChevronRight, Pause, Play, RotateCcw, Users } from 'lucide-react';
import { COLORS, FONTS, tint } from '../../brand/tokens';
import SubHeader from '../../components/SubHeader';
import { supabase } from '../../lib/supabaseClient';
import { BASICS, MEAL_BLESSING, labelFor, loadKitchen, addToGrocery } from '../../lib/kitchen';

const todayISO = () => new Date().toISOString().slice(0, 10);

// One recipe: what you need, then a big-text, one-step-at-a-time cooking mode
// with timers, ending in a mealtime blessing and "Log this meal".
export default function CookRecipe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(undefined);
  const [kitchen, setKitchen] = useState({ uid: null, pantry: new Set() });
  const [step, setStep] = useState(-1); // -1 = overview, steps.length = finished
  const [added, setAdded] = useState(false);
  const [logging, setLogging] = useState(false);

  useEffect(() => {
    (async () => {
      const [{ data }, k] = await Promise.all([
        supabase.from('recipes').select('*').eq('id', id).maybeSingle(),
        loadKitchen(),
      ]);
      setRecipe(data || null);
      setKitchen(k);
    })();
  }, [id]);

  useWakeLock(step >= 0);

  if (recipe === undefined) return <><SubHeader title="Recipe" /><Note>Loading…</Note></>;
  if (recipe === null) return <><SubHeader title="Recipe" /><Note>This recipe isn’t available. It may have been removed.</Note></>;

  const steps = Array.isArray(recipe.steps) ? recipe.steps : [];
  const missing = (recipe.ingredient_keys || []).filter((k) => !kitchen.pantry.has(k));

  const logMeal = async () => {
    setLogging(true);
    if (kitchen.uid) {
      await supabase.from('meal_logs').insert({
        user_id: kitchen.uid,
        name: recipe.title,
        calories: recipe.calories,
        protein: recipe.protein,
        fat: recipe.fat,
        carbs: recipe.carbs,
        log_date: todayISO(),
        logged_at: new Date().toISOString(),
      });
    }
    navigate('/dashboard/nutrition');
  };

  // ── Cooking mode ──
  if (step >= 0 && step < steps.length) {
    const s = steps[step];
    return (
      <>
        <SubHeader title={recipe.title} />
        <div style={{ padding: '8px 20px 32px', display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 220px)' }}>
          <Progress current={step} total={steps.length} />
          <div style={{ marginTop: 10, fontFamily: FONTS.body, fontSize: 13, color: COLORS.mute }}>
            Step {step + 1} of {steps.length}
          </div>
          {recipe.cook_together && s.who && (
            <div style={{ marginTop: 14, alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 999, background: tint(s.who === 1 ? COLORS.gold : COLORS.olive, 16), fontFamily: FONTS.body, fontSize: 13, fontWeight: 600, color: COLORS.ink }}>
              <Users size={14} /> Cook {s.who}
            </div>
          )}
          <p style={{ margin: '18px 0 0', fontFamily: FONTS.display, fontSize: 30, lineHeight: 1.3, color: COLORS.ink }}>
            {s.text}
          </p>
          {s.timer > 0 && <StepTimer key={step} seconds={s.timer} />}

          <div style={{ marginTop: 'auto', paddingTop: 32, display: 'flex', gap: 10 }}>
            <button onClick={() => setStep(step - 1)} style={{ ...outlineButton, flex: '0 0 auto' }} aria-label="Previous step">
              <ChevronLeft size={20} />
            </button>
            <button onClick={() => setStep(step + 1)} style={{ ...darkButton, flex: 1 }}>
              {step === steps.length - 1 ? 'Done cooking' : 'Next step'} <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </>
    );
  }

  // ── Finished: blessing + log ──
  if (step >= steps.length && steps.length) {
    return (
      <>
        <SubHeader title={recipe.title} />
        <div style={{ padding: '24px 22px 32px', textAlign: 'center' }}>
          <div style={{ fontFamily: FONTS.body, fontSize: 14, fontWeight: 600, color: COLORS.gold }}>Before you eat</div>
          <p style={{ margin: '14px auto 0', maxWidth: 380, fontFamily: FONTS.display, fontStyle: 'italic', fontSize: 25, lineHeight: 1.4, color: COLORS.ink }}>
            {MEAL_BLESSING}
          </p>
          <button onClick={logMeal} disabled={logging} style={{ ...darkButton, width: '100%', marginTop: 32 }}>
            {logging ? 'Logging…' : 'Log this meal'}
          </button>
          <button onClick={() => navigate('/dashboard/nutrition/daily-bread')} style={{ ...outlineButton, width: '100%', marginTop: 10 }}>
            Not now
          </button>
          <Note style={{ textAlign: 'center' }}>
            Logs one serving: {recipe.calories} cal, {recipe.protein}g protein.
          </Note>
        </div>
      </>
    );
  }

  // ── Overview ──
  const lines = (recipe.ingredients || '').split('\n').filter(Boolean);
  return (
    <>
      <SubHeader title="Recipe" />
      <div style={{ padding: '4px 20px 32px' }}>
        <h1 style={{ margin: 0, fontFamily: FONTS.display, fontSize: 34, fontWeight: 500, lineHeight: 1.1, color: COLORS.ink }}>
          {recipe.title}
        </h1>
        <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: '4px 16px', fontFamily: FONTS.body, fontSize: 13, color: COLORS.mute }}>
          {recipe.minutes && <span>{recipe.minutes} min</span>}
          {recipe.serves && <span>Serves {recipe.serves}</span>}
          {recipe.cook_together && <span style={{ color: COLORS.gold }}>Steps split between two cooks</span>}
        </div>

        {recipe.verse_text && (
          <figure style={{ margin: '22px 0 0', paddingLeft: 14, borderLeft: `2px solid ${COLORS.gold}` }}>
            <blockquote style={{ margin: 0, fontFamily: FONTS.display, fontStyle: 'italic', fontSize: 20, lineHeight: 1.4, color: COLORS.ink }}>
              {recipe.verse_text}
            </blockquote>
            <figcaption style={{ marginTop: 6, fontFamily: FONTS.body, fontSize: 12, color: COLORS.mute }}>{recipe.verse_ref}</figcaption>
          </figure>
        )}

        <div style={{ marginTop: 22, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
          {[['Calories', recipe.calories, ''], ['Protein', recipe.protein, 'g'], ['Carbs', recipe.carbs, 'g'], ['Fat', recipe.fat, 'g']].map(([label, v, unit]) => (
            <div key={label} style={{ padding: '10px 6px', borderRadius: 12, background: '#fff', border: `1px solid ${COLORS.line}`, textAlign: 'center' }}>
              <div style={{ fontFamily: FONTS.display, fontSize: 22, color: COLORS.ink }}>{v ?? '–'}{v != null ? unit : ''}</div>
              <div style={{ fontFamily: FONTS.body, fontSize: 11, color: COLORS.mute }}>{label}</div>
            </div>
          ))}
        </div>
        <Note style={{ padding: '6px 0 0', fontSize: 12 }}>Per serving, approximate.</Note>

        <h2 style={sectionHeading}>Ingredients</h2>
        {missing.length > 0 ? (
          <div style={{ marginTop: 10, padding: '12px 14px', borderRadius: 14, background: tint(COLORS.rose, 18), display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
            <span style={{ fontFamily: FONTS.body, fontSize: 14, color: COLORS.ink, lineHeight: 1.4 }}>
              Not in your kitchen: {missing.map(labelFor).join(', ').toLowerCase()}
            </span>
            {added ? (
              <span style={{ fontFamily: FONTS.body, fontSize: 13, color: COLORS.olive, display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap' }}>
                <Check size={14} /> Added
              </span>
            ) : (
              <button
                onClick={async () => { await addToGrocery(kitchen.uid, missing); setAdded(true); }}
                style={{ ...darkButton, padding: '8px 14px', fontSize: 13, whiteSpace: 'nowrap' }}
              >
                Add to list
              </button>
            )}
          </div>
        ) : (
          <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 6, fontFamily: FONTS.body, fontSize: 14, color: COLORS.olive }}>
            <Check size={16} /> You have everything
          </div>
        )}
        <ul style={{ margin: '14px 0 0', paddingLeft: 18, fontFamily: FONTS.body, fontSize: 15, color: COLORS.ink, lineHeight: 1.7 }}>
          {lines.map((l, i) => <li key={i}>{l}</li>)}
        </ul>
        <Note style={{ padding: '6px 0 0', fontSize: 12 }}>{BASICS} assumed.</Note>

        {steps.length > 0 ? (
          <button onClick={() => setStep(0)} style={{ ...darkButton, width: '100%', marginTop: 28 }}>
            Start cooking
          </button>
        ) : (
          recipe.directions && (
            <>
              <h2 style={sectionHeading}>Directions</h2>
              <div style={{ marginTop: 10, fontFamily: FONTS.body, fontSize: 15, color: COLORS.ink, lineHeight: 1.6, whiteSpace: 'pre-line' }}>{recipe.directions}</div>
            </>
          )
        )}
      </div>
    </>
  );
}

// Countdown for steps like "roast 20 minutes". Buzzes the phone when done.
function StepTimer({ seconds }) {
  const [left, setLeft] = useState(seconds);
  const [running, setRunning] = useState(false);
  const endsAt = useRef(null);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => {
      const remaining = Math.max(0, Math.round((endsAt.current - Date.now()) / 1000));
      setLeft(remaining);
      if (remaining === 0) {
        setRunning(false);
        try { navigator.vibrate?.([300, 150, 300]); } catch {}
      }
    }, 250);
    return () => clearInterval(t);
  }, [running]);

  const start = () => { endsAt.current = Date.now() + left * 1000; setRunning(true); };
  const done = left === 0;
  const mm = Math.floor(left / 60);
  const ss = String(left % 60).padStart(2, '0');

  return (
    <div style={{ marginTop: 24, padding: '16px 18px', borderRadius: 18, background: done ? tint(COLORS.olive, 18) : '#fff', border: `1px solid ${done ? COLORS.olive : COLORS.line}`, display: 'flex', alignItems: 'center', gap: 14 }}>
      <div style={{ flex: 1 }} aria-live="polite">
        <div style={{ fontFamily: FONTS.display, fontSize: 40, lineHeight: 1, color: COLORS.ink, fontVariantNumeric: 'tabular-nums' }}>
          {done ? 'Time’s up' : `${mm}:${ss}`}
        </div>
      </div>
      {!done && (
        <button onClick={running ? () => setRunning(false) : start} style={{ ...darkButton, padding: '10px 16px' }} aria-label={running ? 'Pause timer' : 'Start timer'}>
          {running ? <Pause size={18} /> : <Play size={18} />} {running ? 'Pause' : 'Start'}
        </button>
      )}
      <button onClick={() => { setRunning(false); setLeft(seconds); }} style={{ ...outlineButton, padding: 10 }} aria-label="Reset timer">
        <RotateCcw size={18} />
      </button>
    </div>
  );
}

function Progress({ current, total }) {
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= current ? COLORS.gold : COLORS.line }} />
      ))}
    </div>
  );
}

// Keeps the screen awake while cooking, where the browser allows it.
function useWakeLock(active) {
  useEffect(() => {
    if (!active || !('wakeLock' in navigator)) return;
    let lock;
    navigator.wakeLock.request('screen').then((l) => { lock = l; }).catch(() => {});
    return () => { lock?.release().catch(() => {}); };
  }, [active]);
}

function Note({ children, style }) {
  return <div style={{ padding: '16px 0 0', fontFamily: FONTS.body, fontSize: 14, color: COLORS.mute, lineHeight: 1.5, ...style }}>{children}</div>;
}

const sectionHeading = { margin: '28px 0 0', fontFamily: FONTS.display, fontSize: 26, fontWeight: 500, color: COLORS.ink };

const darkButton = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
  fontFamily: FONTS.body, fontSize: 15, fontWeight: 600, color: COLORS.bg, background: COLORS.ink,
  border: 'none', padding: '14px 20px', borderRadius: 999, cursor: 'pointer',
};

const outlineButton = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
  fontFamily: FONTS.body, fontSize: 15, fontWeight: 500, color: COLORS.ink, background: 'transparent',
  border: `1px solid ${COLORS.line}`, padding: '14px 18px', borderRadius: 999, cursor: 'pointer',
};
