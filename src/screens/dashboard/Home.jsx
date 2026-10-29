import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Flame, ChevronRight, MoreVertical } from 'lucide-react';
import { COLORS, FONTS, HOME_TILES, SUPPORT_EMAIL, tint } from '../../brand/tokens';
import Sprig from '../../components/Sprig';
import HomeTile from '../../components/HomeTile';
import { supabase } from '../../lib/supabaseClient';

const todayISO = () => new Date().toISOString().slice(0, 10);

export default function DashboardHome() {
  const [userId, setUserId] = useState(null);
  const [program, setProgram] = useState(null); // { title, week, day, dayTitle }
  const [nutrition, setNutrition] = useState({ goal: null, totals: { calories: 0, carbs: 0, fat: 0, protein: 0 } });
  const [habits, setHabits] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadHabits = async (uid) => {
    const { data } = await supabase
      .from('habits')
      .select('*, habit_completions(id, completed_date)')
      .eq('user_id', uid)
      .order('sort_order', { ascending: true });
    setHabits(data || []);
  };

  useEffect(() => {
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData?.user?.id;
      if (!uid) return setLoading(false);
      setUserId(uid);

      // Active program and where the member is in it
      const { data: enrollment } = await supabase
        .from('program_enrollments')
        .select('program_id, current_day, workout_programs(title, days_per_week)')
        .eq('user_id', uid)
        .eq('active', true)
        .maybeSingle();

      if (enrollment) {
        const perWeek = enrollment.workout_programs?.days_per_week || 1;
        const index = Math.max(0, (enrollment.current_day || 1) - 1);
        const week = Math.floor(index / perWeek) + 1;
        const day = (index % perWeek) + 1;
        const { data: dayData } = await supabase
          .from('program_days')
          .select('title')
          .eq('program_id', enrollment.program_id)
          .eq('day_number', day)
          .maybeSingle();
        setProgram({ title: enrollment.workout_programs?.title, week, day, dayTitle: dayData?.title });
      }

      // Today's nutrition
      const { data: goal } = await supabase.from('nutrition_goals').select('*').eq('user_id', uid).maybeSingle();
      const { data: meals } = await supabase
        .from('meal_logs')
        .select('calories, carbs, fat, protein')
        .eq('user_id', uid)
        .eq('log_date', todayISO());
      const totals = (meals || []).reduce(
        (t, m) => ({
          calories: t.calories + (m.calories || 0),
          carbs: t.carbs + (m.carbs || 0),
          fat: t.fat + (m.fat || 0),
          protein: t.protein + (m.protein || 0),
        }),
        { calories: 0, carbs: 0, fat: 0, protein: 0 }
      );
      setNutrition({ goal, totals });

      await loadHabits(uid);

      const { data: recipeRows } = await supabase.from('recipes').select('id, title, calories').limit(2);
      setRecipes(recipeRows || []);

      setLoading(false);
    })();
  }, []);

  const doneToday = (h) => (h.habit_completions || []).some((c) => c.completed_date === todayISO());

  const toggleHabit = async (h) => {
    if (!userId) return;
    if (doneToday(h)) {
      await supabase.from('habit_completions').delete().eq('habit_id', h.id).eq('completed_date', todayISO());
    } else {
      await supabase.from('habit_completions').insert({ habit_id: h.id, user_id: userId, completed_date: todayISO() });
    }
    loadHabits(userId);
  };

  const calGoal = nutrition.goal?.calories || 0;
  const calPct = calGoal ? Math.min(100, Math.round((nutrition.totals.calories / calGoal) * 100)) : 0;

  return (
    <div style={{ padding: '20px 18px 32px' }}>
      {/* Dashboard heading + week */}
      <SectionHead title="Dashboard" action={<Pill to="/dashboard/habits">View all</Pill>} />
      <WeekRow />

      {/* Faith first: today's devotion, styled like the reference's banner */}
      <Link
        to="/dashboard/devotion"
        style={{
          display: 'flex',
          marginTop: 22,
          borderRadius: 18,
          overflow: 'hidden',
          background: '#fff',
          border: `1px solid ${COLORS.line}`,
          textDecoration: 'none',
        }}
      >
        <div style={{ width: 96, flexShrink: 0, background: COLORS.ink, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '14px 8px' }}>
          <Sprig size={30} color={COLORS.rose} />
          <span style={{ fontFamily: FONTS.body, fontSize: 11, fontWeight: 600, color: COLORS.rose, textAlign: 'center', lineHeight: 1.2 }}>
            Start here
          </span>
        </div>
        <div style={{ flex: 1, padding: '16px 14px 16px 18px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: FONTS.display, fontSize: 20, color: COLORS.ink, lineHeight: 1.15 }}>
              Today’s devotion and Bible reading
            </div>
            <div style={{ fontFamily: FONTS.body, fontSize: 12, color: COLORS.mute, marginTop: 4 }}>
              A few quiet minutes before anything else
            </div>
          </div>
          <ChevronRight size={20} color={COLORS.ink} />
        </div>
      </Link>

      {/* Jump back in */}
      <SectionHead
        title="Jump back in"
        style={{ marginTop: 28 }}
        action={
          <Pill to="/dashboard/log" icon={<Plus size={15} strokeWidth={2.25} />}>
            Log activity
          </Pill>
        }
      />
      {!loading && program && (
        <Link to="/dashboard/workout" style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 14, textDecoration: 'none' }}>
          <div style={{ width: 74, height: 60, borderRadius: 12, background: COLORS.olive, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sprig size={30} color="#fff" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: FONTS.body, fontSize: 15, fontWeight: 600, color: COLORS.ink, lineHeight: 1.25 }}>
              {program.title}
            </div>
            <div style={{ fontFamily: FONTS.body, fontSize: 13, color: COLORS.mute, marginTop: 3 }}>
              Week {program.week}, Day {program.day}{program.dayTitle ? `: ${program.dayTitle}` : ''}
            </div>
          </div>
          <MoreVertical size={18} color={COLORS.ink} />
        </Link>
      )}
      {!loading && !program && (
        <div style={{ marginTop: 14, fontFamily: FONTS.body, fontSize: 14, color: COLORS.mute }}>
          You haven’t started a program yet.
        </div>
      )}
      <Link to="/dashboard/program" style={{ display: 'inline-block', marginTop: 14, fontFamily: FONTS.body, fontSize: 14, fontWeight: 500, color: COLORS.mute }}>
        {program ? 'View all programs' : 'Choose a program'}
      </Link>

      {/* Nutrition */}
      <SectionHead title="Nutrition" style={{ marginTop: 28 }} />
      <Link to="/dashboard/nutrition" style={{ display: 'block', marginTop: 12, padding: '16px 18px 18px', borderRadius: 18, background: COLORS.ink, textDecoration: 'none' }}>
        <div style={{ height: 6, borderRadius: 3, background: tint('#ffffff', 18) }}>
          <div style={{ width: `${calPct}%`, height: 6, borderRadius: 3, background: COLORS.rose }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', marginTop: 14, gap: 8 }}>
          <div style={{ flex: 1.4, color: '#fff', fontFamily: FONTS.body }}>
            <span style={{ fontSize: 24, fontWeight: 600 }}>{nutrition.totals.calories}</span>
            <span style={{ fontSize: 13, opacity: 0.8 }}> / {calGoal ? calGoal.toLocaleString() : '—'}</span>
            <div style={{ fontSize: 13, opacity: 0.85 }}>calories</div>
          </div>
          {['carbs', 'fat', 'protein'].map((k) => (
            <div key={k} style={{ flex: 1, textAlign: 'center', color: '#fff', fontFamily: FONTS.body }}>
              <div style={{ fontSize: 18, fontWeight: 600 }}>{nutrition.totals[k]}g</div>
              <div style={{ fontSize: 12, opacity: 0.85 }}>{k}</div>
            </div>
          ))}
        </div>
        {!calGoal && !loading && (
          <div style={{ marginTop: 10, fontFamily: FONTS.body, fontSize: 12, color: 'rgba(255,255,255,0.75)' }}>
            Tap to set your daily goals
          </div>
        )}
      </Link>

      {/* Habits */}
      <SectionHead
        title="Habits"
        style={{ marginTop: 28 }}
        action={
          <Link to="/dashboard/habits" style={{ fontFamily: FONTS.body, fontSize: 14, fontWeight: 500, color: COLORS.mute }}>
            View all
          </Link>
        }
      />
      {!loading && habits.length === 0 && (
        <Link to="/dashboard/habits" style={{ display: 'block', marginTop: 12, padding: 16, borderRadius: 16, border: `1px dashed ${COLORS.line}`, fontFamily: FONTS.body, fontSize: 14, color: COLORS.mute }}>
          Add a daily habit to track, like drinking water or reading Scripture.
        </Link>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10, marginTop: 12 }}>
        {habits.slice(0, 4).map((h) => {
          const done = doneToday(h);
          return (
            <button
              key={h.id}
              onClick={() => toggleHabit(h)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '16px 14px',
                borderRadius: 16,
                border: 'none',
                background: COLORS.ink,
                color: '#fff',
                cursor: 'pointer',
                textAlign: 'left',
                minHeight: 60,
              }}
            >
              <Flame size={16} color={done ? COLORS.rose : '#fff'} style={{ flexShrink: 0 }} />
              <span style={{ flex: 1, fontFamily: FONTS.body, fontSize: 14, fontWeight: 500, lineHeight: 1.25 }}>{h.title}</span>
              <span
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  flexShrink: 0,
                  border: `2px solid ${done ? COLORS.rose : '#fff'}`,
                  background: done ? COLORS.rose : 'transparent',
                }}
              />
            </button>
          );
        })}
      </div>

      {/* Big photo cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 30 }}>
        {HOME_TILES.map((t) => (
          <HomeTile key={t.id} {...t} />
        ))}
      </div>

      {/* Two-up row, like "Yoga on demand" */}
      {recipes.length > 0 && (
        <>
          <div style={{ fontFamily: FONTS.display, fontSize: 28, color: COLORS.ink, marginTop: 30 }}>From the recipe book</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12, marginTop: 12 }}>
            {recipes.map((r, i) => (
              <Link key={r.id} to="/dashboard/nutrition/recipes" style={{ textDecoration: 'none' }}>
                <div style={{ aspectRatio: '4 / 3', borderRadius: 16, background: i % 2 ? COLORS.sage : COLORS.gold, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Sprig size={34} color="#fff" />
                </div>
                <div style={{ fontFamily: FONTS.body, fontSize: 14, fontWeight: 600, color: COLORS.ink, marginTop: 8, lineHeight: 1.25 }}>{r.title}</div>
                {r.calories != null && (
                  <div style={{ fontFamily: FONTS.body, fontSize: 12, color: COLORS.mute, marginTop: 2 }}>{r.calories} calories</div>
                )}
              </Link>
            ))}
          </div>
        </>
      )}

      {/* Questions */}
      <div style={{ marginTop: 30, padding: '22px 20px', borderRadius: 20, background: '#fff', border: `1px solid ${COLORS.line}`, textAlign: 'center' }}>
        <div style={{ fontFamily: FONTS.display, fontSize: 28, color: COLORS.ink }}>Questions?</div>
        {SUPPORT_EMAIL ? (
          <div style={{ fontFamily: FONTS.body, fontSize: 14, color: COLORS.ink, marginTop: 8, lineHeight: 1.5 }}>
            Email us at{' '}
            <a href={`mailto:${SUPPORT_EMAIL}`} style={{ color: COLORS.gold, fontWeight: 500 }}>{SUPPORT_EMAIL}</a>
          </div>
        ) : (
          <div style={{ fontFamily: FONTS.body, fontSize: 14, color: COLORS.ink, marginTop: 8, lineHeight: 1.5 }}>
            Post in the <Link to="/dashboard/community" style={{ color: COLORS.gold, fontWeight: 500 }}>Community</Link> anytime.
          </div>
        )}
        <div style={{ fontFamily: FONTS.body, fontSize: 13, color: COLORS.mute, marginTop: 8 }}>
          Lex and John are here to help.
        </div>
      </div>
    </div>
  );
}

function SectionHead({ title, action, style }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, ...style }}>
      <div style={{ fontFamily: FONTS.display, fontSize: 30, fontWeight: 500, color: COLORS.ink, lineHeight: 1.05 }}>{title}</div>
      {action}
    </div>
  );
}

function Pill({ to, icon, children }) {
  return (
    <Link
      to={to}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '9px 16px',
        borderRadius: 999,
        background: COLORS.ink,
        color: COLORS.bg,
        fontFamily: FONTS.body,
        fontSize: 13,
        fontWeight: 600,
        whiteSpace: 'nowrap',
      }}
    >
      {icon}
      {children}
    </Link>
  );
}

// Sunday-start week with today as a dark rounded square, like the reference.
function WeekRow() {
  const today = new Date();
  const start = new Date(today);
  start.setDate(today.getDate() - today.getDay());
  const labels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginTop: 18 }}>
      {labels.map((l, i) => {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        const isToday = d.toDateString() === today.toDateString();
        return (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <span style={{ fontFamily: FONTS.body, fontSize: 13, fontWeight: 600, color: COLORS.mute }}>{l}</span>
            <span
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: FONTS.body,
                fontSize: 17,
                fontWeight: 600,
                background: isToday ? COLORS.ink : 'transparent',
                color: isToday ? COLORS.bg : COLORS.ink,
              }}
            >
              {d.getDate()}
            </span>
          </div>
        );
      })}
    </div>
  );
}
