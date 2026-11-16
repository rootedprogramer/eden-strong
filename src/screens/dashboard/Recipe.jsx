import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { NotebookPen } from 'lucide-react';
import { COLORS, FONTS, tint, toneColor } from '../../brand/tokens';
import SubHeader from '../../components/SubHeader';
import Sprig from '../../components/Sprig';
import { supabase } from '../../lib/supabaseClient';
import { todayISO } from '../../lib/workout';
import { toneFor, guessCategory } from './RecipeBook';
import { BrandMark } from '../../components/BrandArt';
import { formatServings, itemNutrition } from '../../lib/mealPlans';

export default function Recipe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const planServings = Number(params.get('servings')) || 1;
  const [r, setR] = useState(undefined);
  const [logging, setLogging] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('recipes').select('*').eq('id', id).maybeSingle();
      setR(data ? { ...data, category: guessCategory(data) } : null);
    })();
  }, [id]);

  if (r === undefined) return <SubHeader title="Recipe" />;
  if (r === null) return <><SubHeader title="Recipe" /><p style={{ padding: '0 18px', fontFamily: FONTS.body, color: COLORS.mute }}>This recipe wasn’t found.</p></>;

  const lines = (text) => String(text || '').split('\n').map((s) => s.trim()).filter(Boolean);
  const ingredients = lines(r.ingredients);
  const steps = lines(r.directions);

  // From a meal plan that calls for more than one serving, log the plan's portion
  const portion = itemNutrition({ recipe: r, servings: planServings });

  const log = async () => {
    setLogging(true);
    const { data: userData } = await supabase.auth.getUser();
    const uid = userData?.user?.id;
    if (uid) {
      await supabase.from('meal_logs').insert({
        user_id: uid,
        name: planServings !== 1 ? `${r.title} (${formatServings(planServings)})` : r.title,
        calories: portion.calories,
        protein: portion.protein,
        fat: portion.fat,
        carbs: portion.carbs,
        log_date: todayISO(),
        logged_at: new Date().toISOString(),
      });
    }
    navigate('/dashboard/nutrition');
  };

  return (
    <>
      <SubHeader title={r.category || 'Recipe'} />
      <div style={{ position: 'relative', height: 220, background: toneColor(toneFor(r.category)), overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {r.image ? <img src={r.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <BrandMark kind="small" size={70} color="#fff" />}
      </div>

      <div style={{ padding: '18px 18px 40px' }}>
        <h1 style={{ margin: 0, fontFamily: FONTS.display, fontSize: 32, fontWeight: 500, color: COLORS.ink, lineHeight: 1.1 }}>{r.title}</h1>

        <div style={{ fontFamily: FONTS.body, fontSize: 15, fontWeight: 600, color: COLORS.ink, marginTop: 10, lineHeight: 1.5 }}>
          {r.servings ? `Makes ${r.servings}` : r.serves ? `Serves ${r.serves}` : 'Serves 1'}
          <span style={{ display: 'block', fontWeight: 400, color: COLORS.mute }}>Nutrition is per serving</span>
        </div>

        {planServings !== 1 && (
          <div style={{ marginTop: 14, padding: '12px 14px', borderRadius: 16, background: tint(COLORS.gold, 16), fontFamily: FONTS.body, fontSize: 14, color: COLORS.ink, lineHeight: 1.5 }}>
            <span style={{ fontWeight: 700 }}>Your meal plan: {formatServings(planServings)}.</span>{' '}
            {[portion.calories != null && `${portion.calories} calories`, portion.protein != null && `${Math.round(portion.protein)}g protein`].filter(Boolean).join(', ')}
          </div>
        )}

        {r.calories != null && (
          <div style={{ fontFamily: FONTS.body, fontSize: 26, fontWeight: 700, color: COLORS.ink, marginTop: 18 }}>{r.calories} calories</div>
        )}
        <MacroRings r={r} />

        <h2 style={h2}>Ingredients</h2>
        <ul style={{ margin: '10px 0 0', padding: 0, listStyle: 'none' }}>
          {ingredients.map((item, i) => (
            <li key={i} style={{ padding: '5px 0', fontFamily: FONTS.body, fontSize: 16, fontWeight: 500, color: COLORS.ink, lineHeight: 1.45 }}>{item}</li>
          ))}
        </ul>

        {steps.length > 0 && (
          <>
            <h2 style={h2}>Directions</h2>
            <ol style={{ margin: '10px 0 0', padding: 0, listStyle: 'none' }}>
              {steps.map((step, i) => (
                <li key={i} style={{ display: 'flex', gap: 12, padding: '8px 0', fontFamily: FONTS.body, fontSize: 16, color: COLORS.ink, lineHeight: 1.55 }}>
                  {steps.length > 1 && <span style={{ fontWeight: 700, color: COLORS.gold, minWidth: 18 }}>{i + 1}.</span>}
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </>
        )}

        {r.tip && (
          <div style={{ marginTop: 18, padding: '14px 16px', borderRadius: 16, background: tint(COLORS.sage, 22), fontFamily: FONTS.body, fontSize: 14, color: COLORS.ink, lineHeight: 1.55 }}>
            <span style={{ fontWeight: 700 }}>Tip: </span>{r.tip}
          </div>
        )}

        <p style={{ fontFamily: FONTS.body, fontSize: 12, color: COLORS.mute, lineHeight: 1.5, marginTop: 12, textAlign: 'center' }}>
          Nutrition is an estimate and varies with brands, portions, and swaps.
        </p>
        <div style={{ height: 70 }} />
      </div>

      <button
        onClick={log}
        disabled={logging}
        style={{
          position: 'fixed', right: 16, bottom: 'calc(84px + env(safe-area-inset-bottom, 0px))', zIndex: 20,
          display: 'flex', alignItems: 'center', gap: 10, padding: '14px 22px', borderRadius: 999, border: 'none',
          background: COLORS.deep, color: '#fff', boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
          fontFamily: FONTS.body, fontSize: 16, fontWeight: 600, cursor: 'pointer',
        }}
      >
        <NotebookPen size={20} aria-hidden="true" />
        {logging ? 'Logging…' : 'Log this meal'}
      </button>
    </>
  );
}

// Protein, fat and carb rings. Each ring fills by that macro's share of the calories.
function MacroRings({ r }) {
  const rings = [
    ['Protein', r.protein, 4],
    ['Fat', r.fat, 9],
    ['Carbs', r.carbs, 4],
  ].filter(([, v]) => v != null);
  if (!rings.length) return null;
  const total = rings.reduce((t, [, v, k]) => t + Number(v) * k, 0) || Number(r.calories) || 1;
  const kcal = Math.max(total, Number(r.calories) || 0);
  return (
    <div style={{ display: 'flex', gap: 18, marginTop: 14, flexWrap: 'wrap' }}>
      {rings.map(([label, v, k]) => {
        const share = Math.min(1, (Number(v) * k) / kcal);
        const R = 40, C = 2 * Math.PI * R;
        return (
          <div key={label} style={{ position: 'relative', width: 96, height: 96 }}>
            <svg width="96" height="96" viewBox="0 0 96 96" aria-hidden="true">
              <circle cx="48" cy="48" r={R} fill="none" stroke={tint(COLORS.ink, 18)} strokeWidth="6" />
              <circle cx="48" cy="48" r={R} fill="none" stroke={COLORS.ink} strokeWidth="6" strokeLinecap="round"
                strokeDasharray={`${share * C} ${C}`} transform="rotate(-90 48 48)" />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: FONTS.body, color: COLORS.ink }}>
              <span style={{ fontSize: 17, fontWeight: 700 }}>{Math.round(Number(v) * 10) / 10}g</span>
              <span style={{ fontSize: 12, fontWeight: 600 }}>{label}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

const h2 = { margin: '28px 0 0', fontFamily: FONTS.body, fontSize: 16, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: COLORS.ink };
