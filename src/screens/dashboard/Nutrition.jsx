import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { COLORS, FONTS } from '../../brand/tokens';
import WeekStrip from '../../components/WeekStrip';
import { supabase } from '../../lib/supabaseClient';

const todayISO = () => new Date().toISOString().slice(0, 10);

export default function Nutrition() {
  const [goal, setGoal] = useState(null);
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLogForm, setShowLogForm] = useState(false);
  const [form, setForm] = useState({ name: '', calories: '', protein: '', fat: '', carbs: '' });

  const load = async () => {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    if (!userId) return;

    const { data: goalData } = await supabase
      .from('nutrition_goals')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    setGoal(goalData);

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

  const totals = meals.reduce(
    (acc, m) => ({
      calories: acc.calories + (m.calories || 0),
      protein: acc.protein + (m.protein || 0),
      fat: acc.fat + (m.fat || 0),
      carbs: acc.carbs + (m.carbs || 0),
    }),
    { calories: 0, protein: 0, fat: 0, carbs: 0 }
  );

  const logMeal = async (e) => {
    e.preventDefault();
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    if (!userId || !form.name) return;

    await supabase.from('meal_logs').insert({
      user_id: userId,
      name: form.name,
      calories: Number(form.calories) || 0,
      protein: Number(form.protein) || 0,
      fat: Number(form.fat) || 0,
      carbs: Number(form.carbs) || 0,
      log_date: todayISO(),
      logged_at: new Date().toISOString(),
    });

    setForm({ name: '', calories: '', protein: '', fat: '', carbs: '' });
    setShowLogForm(false);
    load();
  };

  const remaining = goal ? Math.max(goal.calories - totals.calories, 0) : null;

  return (
    <div style={{ padding: '24px 24px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontFamily: FONTS.display, fontSize: 26, color: COLORS.ink, fontStyle: 'italic' }}>
          Nutrition
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          <Link to="/dashboard/nutrition/daily-bread" style={{ fontFamily: FONTS.body, fontSize: 13, fontWeight: 600, color: COLORS.gold, textDecoration: 'none' }}>
            Daily Bread
          </Link>
          <Link to="/dashboard/nutrition/recipes" style={{ fontFamily: FONTS.body, fontSize: 13, color: COLORS.gold, textDecoration: 'none' }}>
            Recipe Book
          </Link>
        </div>
      </div>

      <WeekStrip />

      {!loading && !goal && (
        <div style={{ marginTop: 20, padding: 18, borderRadius: 16, background: '#fff', border: `1px solid ${COLORS.line}` }}>
          <div style={{ fontFamily: FONTS.body, fontSize: 13, color: COLORS.mute, lineHeight: 1.5 }}>
            No nutrition goals set yet. Set daily calorie and macro targets to start tracking.
          </div>
          <GoalForm userIdLoader={load} />
        </div>
      )}

      {goal && (
        <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontFamily: FONTS.body, fontSize: 13, color: COLORS.mute }}>Today</div>
            <div style={{ fontFamily: FONTS.display, fontSize: 24, color: COLORS.ink, fontStyle: 'italic' }}>
              {totals.calories} calories
            </div>
          </div>
          <div
            style={{
              width: 84, height: 84, borderRadius: '50%',
              border: `6px solid ${COLORS.line}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              textAlign: 'center',
            }}
          >
            <div>
              <div style={{ fontFamily: FONTS.display, fontSize: 18, color: COLORS.ink, fontStyle: 'italic' }}>{remaining}</div>
              <div style={{ fontFamily: FONTS.body, fontSize: 9, color: COLORS.mute }}>left</div>
            </div>
          </div>
        </div>
      )}

      {goal && (
        <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {['protein', 'fat', 'carbs'].map((macro) => (
            <div key={macro} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: FONTS.body, fontSize: 13, color: COLORS.ink, textTransform: 'capitalize' }}>{macro}</span>
              <span style={{ fontFamily: FONTS.body, fontSize: 13, color: COLORS.mute }}>
                {totals[macro]}g / {goal[macro]}g
              </span>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: 28 }}>
        <div style={{ fontFamily: FONTS.body, fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', color: COLORS.mute }}>
          Today's meals
        </div>
        <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {meals.map((m) => (
            <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 14px', borderRadius: 12, background: '#fff', border: `1px solid ${COLORS.line}` }}>
              <span style={{ fontFamily: FONTS.body, fontSize: 14, color: COLORS.ink }}>{m.name}</span>
              <span style={{ fontFamily: FONTS.body, fontSize: 13, color: COLORS.mute }}>{m.calories} cal</span>
            </div>
          ))}
          {meals.length === 0 && (
            <div style={{ fontFamily: FONTS.body, fontSize: 13, color: COLORS.mute }}>Nothing logged yet today.</div>
          )}
        </div>
      </div>

      {!showLogForm && (
        <button
          onClick={() => setShowLogForm(true)}
          style={{
            marginTop: 20, fontFamily: FONTS.body, fontSize: 14, fontWeight: 500, color: COLORS.bg,
            background: COLORS.ink, border: 'none', padding: '12px 20px', borderRadius: 999, cursor: 'pointer',
          }}
        >
          Log Meal
        </button>
      )}

      {showLogForm && (
        <form onSubmit={logMeal} style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <input placeholder="Meal name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={inputStyle} />
          <div style={{ display: 'flex', gap: 8 }}>
            <input placeholder="Calories" type="number" value={form.calories} onChange={(e) => setForm({ ...form, calories: e.target.value })} style={{ ...inputStyle, flex: 1 }} />
            <input placeholder="Protein (g)" type="number" value={form.protein} onChange={(e) => setForm({ ...form, protein: e.target.value })} style={{ ...inputStyle, flex: 1 }} />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input placeholder="Fat (g)" type="number" value={form.fat} onChange={(e) => setForm({ ...form, fat: e.target.value })} style={{ ...inputStyle, flex: 1 }} />
            <input placeholder="Carbs (g)" type="number" value={form.carbs} onChange={(e) => setForm({ ...form, carbs: e.target.value })} style={{ ...inputStyle, flex: 1 }} />
          </div>
          <button type="submit" style={{ fontFamily: FONTS.body, fontSize: 14, fontWeight: 500, color: COLORS.bg, background: COLORS.gold, border: 'none', padding: '12px 20px', borderRadius: 999, cursor: 'pointer' }}>
            Save meal
          </button>
        </form>
      )}
    </div>
  );
}

function GoalForm({ userIdLoader }) {
  const [values, setValues] = useState({ calories: '', protein: '', fat: '', carbs: '' });
  const save = async (e) => {
    e.preventDefault();
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    if (!userId) return;
    await supabase.from('nutrition_goals').upsert({
      user_id: userId,
      calories: Number(values.calories) || 0,
      protein: Number(values.protein) || 0,
      fat: Number(values.fat) || 0,
      carbs: Number(values.carbs) || 0,
    });
    userIdLoader();
  };
  return (
    <form onSubmit={save} style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <input placeholder="Daily calories" type="number" value={values.calories} onChange={(e) => setValues({ ...values, calories: e.target.value })} style={inputStyle} />
      <div style={{ display: 'flex', gap: 8 }}>
        <input placeholder="Protein (g)" type="number" value={values.protein} onChange={(e) => setValues({ ...values, protein: e.target.value })} style={{ ...inputStyle, flex: 1 }} />
        <input placeholder="Fat (g)" type="number" value={values.fat} onChange={(e) => setValues({ ...values, fat: e.target.value })} style={{ ...inputStyle, flex: 1 }} />
        <input placeholder="Carbs (g)" type="number" value={values.carbs} onChange={(e) => setValues({ ...values, carbs: e.target.value })} style={{ ...inputStyle, flex: 1 }} />
      </div>
      <button type="submit" style={{ fontFamily: FONTS.body, fontSize: 13, fontWeight: 500, color: COLORS.bg, background: COLORS.ink, border: 'none', padding: '10px 16px', borderRadius: 999, cursor: 'pointer' }}>
        Save goals
      </button>
    </form>
  );
}

const inputStyle = {
  fontFamily: FONTS.body,
  fontSize: 14,
  padding: '12px 14px',
  borderRadius: 12,
  border: `1px solid ${COLORS.line}`,
  background: '#fff',
  color: COLORS.ink,
  outline: 'none',
};
