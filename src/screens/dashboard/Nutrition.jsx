import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Pencil, Plus, Search, Trash2, ChevronRight, History } from 'lucide-react';
import { COLORS, FONTS, tint } from '../../brand/tokens';
import WeekStrip from '../../components/WeekStrip';
import Sheet, { fieldLabel, fieldInput, primaryButton } from '../../components/Sheet';
import { loadMyMealPlan } from './MealPlan';
import { WEEKDAYS, weekdayNumber, todayISO } from '../../lib/workout';
import { SPLITS, macrosFor, pctFromGoal, splitIdFor, scaleFood, searchFoods } from '../../lib/nutrition';
import { supabase } from '../../lib/supabaseClient';

const MACROS = [
  ['protein', 'Protein'],
  ['carbs', 'Carbs'],
  ['fat', 'Fat'],
];

export default function Nutrition() {
  const [params, setParams] = useSearchParams();
  const [uid, setUid] = useState(null);
  const [goal, setGoal] = useState(null);
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sheet, setSheet] = useState(params.get('goals') ? 'goal' : null); // 'goal' | 'log'

  const load = async () => {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    if (!userId) return;
    setUid(userId);
    const { data: goalData } = await supabase.from('nutrition_goals').select('*').eq('user_id', userId).maybeSingle();
    setGoal(goalData && goalData.calories ? goalData : null);
    const { data: mealsToday } = await supabase
      .from('meal_logs')
      .select('*')
      .eq('user_id', userId)
      .eq('log_date', todayISO())
      .order('logged_at', { ascending: true });
    setMeals(mealsToday || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const closeSheet = () => {
    setSheet(null);
    if (params.get('goals')) setParams({}, { replace: true });
  };

  const totals = meals.reduce(
    (t, m) => ({
      calories: t.calories + (m.calories || 0),
      protein: t.protein + (m.protein || 0),
      fat: t.fat + (m.fat || 0),
      carbs: t.carbs + (m.carbs || 0),
    }),
    { calories: 0, protein: 0, fat: 0, carbs: 0 }
  );

  const removeMeal = async (m) => {
    await supabase.from('meal_logs').delete().eq('id', m.id);
    load();
  };

  return (
    <div style={{ padding: '24px 18px 40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0, fontFamily: FONTS.display, fontSize: 30, fontWeight: 500, color: COLORS.ink }}>Nutrition</h1>
        <div style={{ display: 'flex', gap: 16 }}>
          <Link to="/dashboard/nutrition/daily-bread" style={{ fontFamily: FONTS.body, fontSize: 13, fontWeight: 600, color: COLORS.gold, textDecoration: 'none' }}>
            Daily Bread
          </Link>
          <Link to="/dashboard/nutrition/recipes" style={{ fontFamily: FONTS.body, fontSize: 13, fontWeight: 600, color: COLORS.gold, textDecoration: 'none' }}>
            Recipe Book
          </Link>
        </div>
      </div>

      <WeekStrip />

      <MealPlanCard />

      {/* Today's numbers */}
      {!loading && !goal && (
        <button onClick={() => setSheet('goal')} style={{ ...cardStyle, marginTop: 20, width: '100%', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ flex: 1 }}>
            <span style={{ display: 'block', fontFamily: FONTS.body, fontSize: 15, fontWeight: 600, color: COLORS.ink }}>Set your daily calories</span>
            <span style={{ display: 'block', fontFamily: FONTS.body, fontSize: 13, color: COLORS.mute, marginTop: 4, lineHeight: 1.5 }}>
              Pick a calorie goal and protein, carbs, and fat are worked out for you.
            </span>
          </span>
          <ChevronRight size={20} color={COLORS.mute} />
        </button>
      )}

      {goal && (
        <div style={{ ...cardStyle, marginTop: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <CalorieRing eaten={totals.calories} goal={goal.calories} />
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: FONTS.body, fontSize: 13, color: COLORS.mute }}>Eaten today</div>
              <div style={{ fontFamily: FONTS.body, fontSize: 24, fontWeight: 700, color: COLORS.ink }}>{totals.calories.toLocaleString()}</div>
              <div style={{ fontFamily: FONTS.body, fontSize: 13, color: COLORS.mute }}>of {goal.calories.toLocaleString()} calories</div>
              <button onClick={() => setSheet('goal')} style={{ marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 999, border: `1px solid ${COLORS.line}`, background: 'transparent', color: COLORS.ink, fontFamily: FONTS.body, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                <Pencil size={13} /> Edit goal
              </button>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 18 }}>
            {MACROS.map(([key, label]) => {
              const target = goal[key] || 0;
              const pct = target ? Math.min(100, Math.round((totals[key] / target) * 100)) : 0;
              return (
                <div key={key}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: FONTS.body, fontSize: 13 }}>
                    <span style={{ color: COLORS.ink, fontWeight: 600 }}>{label}</span>
                    <span style={{ color: COLORS.mute }}>{totals[key]}g of {target}g</span>
                  </div>
                  <div style={{ height: 6, borderRadius: 3, background: COLORS.line, marginTop: 6 }}>
                    <div style={{ width: `${pct}%`, height: 6, borderRadius: 3, background: COLORS.gold }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Today's food */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 28 }}>
        <h2 style={{ margin: 0, fontFamily: FONTS.display, fontSize: 24, fontWeight: 500, color: COLORS.ink }}>Today’s food</h2>
        <button onClick={() => setSheet('log')} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 999, border: 'none', background: COLORS.ink, color: COLORS.bg, fontFamily: FONTS.body, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          <Plus size={15} /> Log food
        </button>
      </div>
      <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {meals.map((m) => (
          <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 8px 12px 14px', borderRadius: 14, background: COLORS.surface, border: `1px solid ${COLORS.line}` }}>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: 'block', fontFamily: FONTS.body, fontSize: 14, fontWeight: 600, color: COLORS.ink }}>{m.name}</span>
              <span style={{ display: 'block', fontFamily: FONTS.body, fontSize: 12, color: COLORS.mute, marginTop: 2 }}>
                {m.protein || 0}g protein, {m.carbs || 0}g carbs, {m.fat || 0}g fat
              </span>
            </span>
            <span style={{ fontFamily: FONTS.body, fontSize: 14, fontWeight: 600, color: COLORS.ink, whiteSpace: 'nowrap' }}>{m.calories} cal</span>
            <button onClick={() => removeMeal(m)} aria-label={`Remove ${m.name}`} style={{ background: 'none', border: 'none', color: COLORS.mute, cursor: 'pointer', padding: 6 }}>
              <Trash2 size={16} />
            </button>
          </div>
        ))}
        {!loading && meals.length === 0 && (
          <div style={{ fontFamily: FONTS.body, fontSize: 14, color: COLORS.mute }}>Nothing logged yet today.</div>
        )}
      </div>

      {sheet === 'goal' && <GoalSheet uid={uid} goal={goal} onClose={closeSheet} onSaved={() => { closeSheet(); load(); }} />}
      {sheet === 'log' && <LogFoodSheet uid={uid} onClose={() => setSheet(null)} onSaved={() => { setSheet(null); load(); }} />}
    </div>
  );
}

function CalorieRing({ eaten, goal }) {
  const r = 40;
  const c = 2 * Math.PI * r;
  const pct = goal ? Math.min(1, eaten / goal) : 0;
  const left = Math.max(0, goal - eaten);
  return (
    <div style={{ position: 'relative', width: 100, height: 100, flexShrink: 0 }}>
      <svg width="100" height="100" viewBox="0 0 100 100" aria-hidden="true">
        <circle cx="50" cy="50" r={r} fill="none" stroke={COLORS.line} strokeWidth="8" />
        <circle cx="50" cy="50" r={r} fill="none" stroke={COLORS.gold} strokeWidth="8" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - pct)} transform="rotate(-90 50 50)" />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontFamily: FONTS.body, fontSize: 18, fontWeight: 700, color: COLORS.ink }}>{left.toLocaleString()}</span>
        <span style={{ fontFamily: FONTS.body, fontSize: 11, color: COLORS.mute }}>left</span>
      </div>
    </div>
  );
}

/* ───────────── Goal: calories plus a macro balance ───────────── */

function GoalSheet({ uid, goal, onClose, onSaved }) {
  const startPct = pctFromGoal(goal);
  const [calories, setCalories] = useState(goal?.calories ? String(goal.calories) : '2000');
  const [splitId, setSplitId] = useState(splitIdFor(startPct));
  const [custom, setCustom] = useState(startPct);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const pct = splitId === 'custom' ? custom : SPLITS.find((s) => s.id === splitId);
  const pctTotal = Number(pct.protein) + Number(pct.carbs) + Number(pct.fat);
  const grams = macrosFor(calories, { protein: Number(pct.protein) || 0, carbs: Number(pct.carbs) || 0, fat: Number(pct.fat) || 0 });
  const cal = Number(calories) || 0;

  const save = async () => {
    setError('');
    if (cal < 800 || cal > 6000) return setError('Enter a daily goal between 800 and 6,000 calories.');
    if (pctTotal !== 100) return setError(`Your percentages add up to ${pctTotal}%. Adjust them to total 100%.`);
    setSaving(true);
    const { error: err } = await supabase.from('nutrition_goals').upsert({
      user_id: uid,
      calories: cal,
      protein: grams.protein,
      carbs: grams.carbs,
      fat: grams.fat,
      protein_pct: Number(pct.protein),
      carbs_pct: Number(pct.carbs),
      fat_pct: Number(pct.fat),
    });
    setSaving(false);
    if (err) return setError('Your goal didn’t save. Try again.');
    onSaved();
  };

  return (
    <Sheet title="Daily goal" onClose={onClose}>
      <label style={fieldLabel} htmlFor="goal-calories">Calories per day</label>
      <input
        id="goal-calories"
        inputMode="numeric"
        value={calories}
        onChange={(e) => setCalories(e.target.value.replace(/[^\d]/g, ''))}
        style={{ ...fieldInput, fontSize: 22, fontWeight: 700 }}
      />
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
        {[1600, 1800, 2000, 2200, 2500, 2800].map((n) => (
          <button key={n} onClick={() => setCalories(String(n))} style={chip(Number(calories) === n)}>{n.toLocaleString()}</button>
        ))}
      </div>

      <div style={{ ...fieldLabel, marginTop: 18 }}>Macro balance</div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {[...SPLITS, { id: 'custom', label: 'Custom' }].map((s) => (
          <button key={s.id} onClick={() => setSplitId(s.id)} style={chip(splitId === s.id)}>{s.label}</button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginTop: 14 }}>
        {MACROS.map(([key, label]) => (
          <div key={key} style={{ padding: '12px 8px', borderRadius: 14, background: COLORS.surface, border: `1px solid ${COLORS.line}`, textAlign: 'center' }}>
            <div style={{ fontFamily: FONTS.body, fontSize: 20, fontWeight: 700, color: COLORS.ink }}>{grams[key]}g</div>
            <div style={{ fontFamily: FONTS.body, fontSize: 12, color: COLORS.mute, marginTop: 2 }}>{label}</div>
            {splitId === 'custom' ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginTop: 6 }}>
                <input
                  aria-label={`${label} percent`}
                  inputMode="numeric"
                  value={custom[key]}
                  onChange={(e) => setCustom((c) => ({ ...c, [key]: e.target.value.replace(/[^\d]/g, '').slice(0, 2) }))}
                  style={{ width: 40, padding: '4px 6px', borderRadius: 8, border: `1px solid ${COLORS.line}`, background: COLORS.bg, color: COLORS.ink, fontFamily: FONTS.body, fontSize: 13, textAlign: 'center' }}
                />
                <span style={{ fontFamily: FONTS.body, fontSize: 12, color: COLORS.mute }}>%</span>
              </div>
            ) : (
              <div style={{ fontFamily: FONTS.body, fontSize: 12, color: COLORS.mute, marginTop: 2 }}>{pct[key]}%</div>
            )}
          </div>
        ))}
      </div>
      {splitId === 'custom' && (
        <div style={{ fontFamily: FONTS.body, fontSize: 12, color: pctTotal === 100 ? COLORS.mute : '#B0413E', marginTop: 8 }}>
          Total: {pctTotal}% (needs to be 100%)
        </div>
      )}
      <p style={{ fontFamily: FONTS.body, fontSize: 12, color: COLORS.mute, lineHeight: 1.5, margin: '12px 0 0' }}>
        Change your calories anytime and your protein, carbs, and fat update to match. Talk with your doctor before big changes to how you eat.
      </p>
      {error && <p style={{ fontFamily: FONTS.body, fontSize: 13, color: '#B0413E', margin: '10px 0 0' }}>{error}</p>}
      <button onClick={save} disabled={saving} style={primaryButton}>{saving ? 'Saving…' : 'Save goal'}</button>
    </Sheet>
  );
}

/* ───────────── Log food: search, recent, or enter by hand ───────────── */

function LogFoodSheet({ uid, onClose, onSaved }) {
  const [mode, setMode] = useState('search'); // 'search' | 'manual'
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');
  const [picked, setPicked] = useState(null);
  const [recent, setRecent] = useState([]);
  const timer = useRef(null);

  useEffect(() => {
    (async () => {
      const since = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
      const { data } = await supabase
        .from('meal_logs')
        .select('name, calories, protein, carbs, fat, logged_at')
        .eq('user_id', uid)
        .gte('log_date', since)
        .order('logged_at', { ascending: false })
        .limit(40);
      const seen = new Set();
      setRecent((data || []).filter((m) => (seen.has(m.name) ? false : seen.add(m.name))).slice(0, 6));
    })();
  }, [uid]);

  useEffect(() => {
    clearTimeout(timer.current);
    if (query.trim().length < 2) { setResults(null); setError(''); return; }
    timer.current = setTimeout(async () => {
      setSearching(true);
      setError('');
      try {
        setResults(await searchFoods(query));
      } catch {
        setError('Food search isn’t working right now. You can enter it by hand instead.');
        setResults([]);
      }
      setSearching(false);
    }, 450);
    return () => clearTimeout(timer.current);
  }, [query]);

  const save = async (entry) => {
    await supabase.from('meal_logs').insert({
      user_id: uid,
      name: entry.name,
      calories: Math.round(Number(entry.calories) || 0),
      protein: Math.round(Number(entry.protein) || 0),
      carbs: Math.round(Number(entry.carbs) || 0),
      fat: Math.round(Number(entry.fat) || 0),
      log_date: todayISO(),
      logged_at: new Date().toISOString(),
    });
    onSaved();
  };

  if (picked) return <AmountSheet food={picked} onBack={() => setPicked(null)} onClose={onClose} onSave={save} />;

  return (
    <Sheet title="Log food" onClose={onClose}>
      <div style={{ display: 'flex', gap: 6 }}>
        <button onClick={() => setMode('search')} style={chip(mode === 'search')}>Search foods</button>
        <button onClick={() => setMode('manual')} style={chip(mode === 'manual')}>Enter by hand</button>
      </div>

      {mode === 'search' && (
        <>
          <div style={{ position: 'relative', marginTop: 14 }}>
            <Search size={18} color={COLORS.mute} style={{ position: 'absolute', left: 12, top: 14 }} />
            <input
              autoFocus
              aria-label="Search foods"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Grilled chicken, Greek yogurt, a brand…"
              style={{ ...fieldInput, paddingLeft: 38 }}
            />
          </div>

          <div style={{ maxHeight: '46vh', overflowY: 'auto', marginTop: 10 }}>
            {!results && recent.length > 0 && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: FONTS.body, fontSize: 12, fontWeight: 600, color: COLORS.mute, margin: '6px 0' }}>
                  <History size={14} /> Recent
                </div>
                {recent.map((m) => (
                  <ResultRow key={m.name} title={m.name} sub={`${m.calories} cal, ${m.protein || 0}g protein`} action="Add" onClick={() => save(m)} />
                ))}
              </>
            )}
            {searching && <p style={muted}>Searching…</p>}
            {error && <p style={{ ...muted, color: '#B0413E' }}>{error}</p>}
            {results && !searching && results.length === 0 && !error && (
              <p style={muted}>No matches. Try a simpler name, or enter it by hand.</p>
            )}
            {(results || []).map((f) => (
              <ResultRow
                key={f.id}
                title={f.name}
                sub={`${f.brand ? `${f.brand}, ` : ''}${Math.round(f.per100.calories)} cal per 100 g`}
                onClick={() => setPicked(f)}
              />
            ))}
          </div>
          {results && results.length > 0 && (
            <p style={{ ...muted, fontSize: 11 }}>Nutrition from the USDA and Open Food Facts databases. Values are estimates.</p>
          )}
        </>
      )}

      {mode === 'manual' && <ManualForm onSave={save} />}
    </Sheet>
  );
}

function ResultRow({ title, sub, onClick, action }) {
  return (
    <button onClick={onClick} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '12px 4px', background: 'none', border: 'none', borderBottom: `1px solid ${COLORS.line}`, textAlign: 'left', cursor: 'pointer' }}>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: 'block', fontFamily: FONTS.body, fontSize: 14, fontWeight: 600, color: COLORS.ink, lineHeight: 1.3 }}>{title}</span>
        <span style={{ display: 'block', fontFamily: FONTS.body, fontSize: 12, color: COLORS.mute, marginTop: 2 }}>{sub}</span>
      </span>
      {action ? (
        <span style={{ fontFamily: FONTS.body, fontSize: 13, fontWeight: 600, color: COLORS.gold }}>{action}</span>
      ) : (
        <ChevronRight size={18} color={COLORS.mute} />
      )}
    </button>
  );
}

// Pick how much: grams, ounces, or a listed serving. Nutrition updates live.
function AmountSheet({ food, onBack, onClose, onSave }) {
  const units = [...food.servings.map((s) => ({ id: `s:${s.label}`, label: s.label, grams: s.grams })), { id: 'g', label: 'grams', grams: 1 }, { id: 'oz', label: 'ounces', grams: 28.35 }];
  const [unitId, setUnitId] = useState(units[0].id);
  const unit = units.find((u) => u.id === unitId);
  const [amount, setAmount] = useState(unit.id === 'g' ? '100' : '1');
  const grams = (Number(amount) || 0) * unit.grams;
  const n = scaleFood(food.per100, grams);

  const changeUnit = (id) => {
    setUnitId(id);
    setAmount(id === 'g' ? '100' : id === 'oz' ? '4' : '1');
  };

  const amountLabel = unit.id === 'g' ? `${amount} g` : unit.id === 'oz' ? `${amount} oz` : `${amount} × ${unit.label.replace(/^1 /, '')}`;

  return (
    <Sheet title="How much?" onClose={onClose}>
      <button onClick={onBack} style={{ background: 'none', border: 'none', padding: 0, color: COLORS.gold, fontFamily: FONTS.body, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
        ‹ Back to results
      </button>
      <div style={{ fontFamily: FONTS.body, fontSize: 16, fontWeight: 600, color: COLORS.ink, marginTop: 10, lineHeight: 1.3 }}>{food.name}</div>
      {food.brand && <div style={{ fontFamily: FONTS.body, fontSize: 13, color: COLORS.mute, marginTop: 2 }}>{food.brand}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr', gap: 8, marginTop: 14 }}>
        <input aria-label="Amount" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ''))} style={{ ...fieldInput, fontSize: 18, fontWeight: 700, textAlign: 'center' }} />
        <select aria-label="Unit" value={unitId} onChange={(e) => changeUnit(e.target.value)} style={fieldInput}>
          {units.map((u) => <option key={u.id} value={u.id}>{u.label}</option>)}
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, marginTop: 14 }}>
        {[['Calories', n.calories, ''], ['Protein', n.protein, 'g'], ['Carbs', n.carbs, 'g'], ['Fat', n.fat, 'g']].map(([label, v, u]) => (
          <div key={label} style={{ padding: '10px 4px', borderRadius: 12, background: tint(COLORS.gold, 14), textAlign: 'center' }}>
            <div style={{ fontFamily: FONTS.body, fontSize: 17, fontWeight: 700, color: COLORS.ink }}>{v}{u}</div>
            <div style={{ fontFamily: FONTS.body, fontSize: 11, color: COLORS.mute, marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>

      <button
        onClick={() => onSave({ name: `${food.name} (${amountLabel})`, ...n })}
        disabled={!grams}
        style={{ ...primaryButton, opacity: grams ? 1 : 0.5 }}
      >
        Add to today
      </button>
    </Sheet>
  );
}

function ManualForm({ onSave }) {
  const [f, setF] = useState({ name: '', calories: '', protein: '', carbs: '', fat: '' });
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: k === 'name' ? e.target.value : e.target.value.replace(/[^\d.]/g, '') }));
  // Fills calories in from the macros if they're left blank
  const fromMacros = Math.round((Number(f.protein) || 0) * 4 + (Number(f.carbs) || 0) * 4 + (Number(f.fat) || 0) * 9);
  const calories = f.calories !== '' ? Number(f.calories) : fromMacros;
  return (
    <div style={{ marginTop: 14 }}>
      <label style={fieldLabel} htmlFor="m-name">Food</label>
      <input id="m-name" value={f.name} onChange={set('name')} placeholder="Chicken burrito bowl" style={fieldInput} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginTop: 10 }}>
        {[['calories', 'Calories'], ['protein', 'Protein (g)'], ['carbs', 'Carbs (g)'], ['fat', 'Fat (g)']].map(([k, label]) => (
          <div key={k}>
            <label style={fieldLabel} htmlFor={`m-${k}`}>{label}</label>
            <input id={`m-${k}`} inputMode="decimal" value={f[k]} onChange={set(k)} placeholder={k === 'calories' && fromMacros ? String(fromMacros) : ''} style={fieldInput} />
          </div>
        ))}
      </div>
      {f.calories === '' && fromMacros > 0 && (
        <p style={{ ...muted, fontSize: 12 }}>Calories filled in from your protein, carbs, and fat: {fromMacros}.</p>
      )}
      <button
        onClick={() => onSave({ ...f, calories })}
        disabled={!f.name.trim()}
        style={{ ...primaryButton, opacity: f.name.trim() ? 1 : 0.5 }}
      >
        Add to today
      </button>
    </div>
  );
}

const cardStyle = { padding: 18, borderRadius: 18, background: COLORS.surface, border: `1px solid ${COLORS.line}` };
const muted = { fontFamily: FONTS.body, fontSize: 13, color: COLORS.mute, lineHeight: 1.5, margin: '10px 0 0' };
const chip = (on) => ({
  padding: '8px 14px',
  borderRadius: 999,
  border: `1px solid ${on ? COLORS.ink : COLORS.line}`,
  background: on ? COLORS.ink : COLORS.surface,
  color: on ? COLORS.bg : COLORS.ink,
  fontFamily: FONTS.body,
  fontSize: 13,
  fontWeight: 600,
  cursor: 'pointer',
});

// Shows the member's assigned meal plan, with today's meals, when they have one
function MealPlanCard() {
  const [data, setData] = useState(undefined);
  useEffect(() => { loadMyMealPlan().then(setData); }, []);
  if (!data) return null;
  const today = weekdayNumber();
  const meals = data.items.filter((i) => i.day_number === today);
  return (
    <Link to="/dashboard/nutrition/plan" style={{ display: 'block', marginTop: 20, padding: 18, borderRadius: 18, background: COLORS.deep, textDecoration: 'none' }}>
      <div style={{ fontFamily: FONTS.body, fontSize: 12, fontWeight: 600, color: COLORS.rose }}>Your meal plan</div>
      <div style={{ fontFamily: FONTS.display, fontSize: 24, color: '#fff', marginTop: 4 }}>{data.plan.title}</div>
      <div style={{ fontFamily: FONTS.body, fontSize: 13, color: 'rgba(255,255,255,0.85)', marginTop: 8, lineHeight: 1.5 }}>
        {meals.length
          ? `${WEEKDAYS[today - 1]}: ${meals.map((m) => m.recipe.title).join(', ')}`
          : `Nothing planned for ${WEEKDAYS[today - 1]}. Tap to see the week.`}
      </div>
    </Link>
  );
}
