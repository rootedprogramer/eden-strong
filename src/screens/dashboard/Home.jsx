import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { COLORS, FONTS } from '../../brand/tokens';
import Sprig from '../../components/Sprig';
import WeekStrip from '../../components/WeekStrip';
import { supabase } from '../../lib/supabaseClient';

const todayISO = () => new Date().toISOString().slice(0, 10);

export default function DashboardHome() {
  const [profile, setProfile] = useState(null);
  const [todayWorkout, setTodayWorkout] = useState(null);
  const [programTitle, setProgramTitle] = useState(null);
  const [nutrition, setNutrition] = useState({ goal: null, consumed: 0 });
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;
      if (!userId) {
        setLoading(false);
        return;
      }

      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();
      setProfile(profileData);

      // Today's scheduled workout from the user's active program, if one exists.
      const { data: activeEnrollment } = await supabase
        .from('program_enrollments')
        .select('program_id, current_day, workout_programs(title)')
        .eq('user_id', userId)
        .eq('active', true)
        .maybeSingle();

      if (activeEnrollment) {
        setProgramTitle(activeEnrollment.workout_programs?.title || null);
        const { data: dayData } = await supabase
          .from('program_days')
          .select('*, program_exercises(*)')
          .eq('program_id', activeEnrollment.program_id)
          .eq('day_number', activeEnrollment.current_day)
          .maybeSingle();
        setTodayWorkout(dayData);
      }

      // Nutrition summary for today
      const { data: goalData } = await supabase
        .from('nutrition_goals')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      const { data: mealsToday } = await supabase
        .from('meal_logs')
        .select('calories')
        .eq('user_id', userId)
        .eq('log_date', todayISO());
      const consumed = (mealsToday || []).reduce((sum, m) => sum + (m.calories || 0), 0);
      setNutrition({ goal: goalData, consumed });

      // Habits for today
      const { data: habitRows } = await supabase
        .from('habits')
        .select('*, habit_completions(id, completed_date)')
        .eq('user_id', userId)
        .order('sort_order', { ascending: true });
      setHabits(habitRows || []);

      setLoading(false);
    })();
  }, []);

  const habitDoneToday = (habit) =>
    (habit.habit_completions || []).some((c) => c.completed_date === todayISO());

  return (
    <div style={{ padding: '48px 24px 24px' }}>
      <Sprig size={30} color={COLORS.gold} />
      <div style={{ fontFamily: FONTS.display, fontSize: 28, color: COLORS.ink, fontStyle: 'italic', marginTop: 16 }}>
        {loading ? 'Welcome back' : `Welcome back, ${profile?.name || 'friend'}`}
      </div>

      <WeekStrip />

      <Link
        to="/dashboard/devotion"
        style={{
          display: 'block',
          marginTop: 24,
          padding: 18,
          borderRadius: 16,
          background: COLORS.ink,
          textDecoration: 'none',
        }}
      >
        <div style={{ fontFamily: FONTS.body, fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: COLORS.sage }}>
          Start here
        </div>
        <div style={{ fontFamily: FONTS.display, fontSize: 18, color: COLORS.bg, fontStyle: 'italic', marginTop: 6 }}>
          Today's devotion & Bible reading
        </div>
      </Link>

      {/* Jump back in — active program card, same role as the reference app's "Jump back in" */}
      <div style={{ marginTop: 24 }}>
        <div style={{ fontFamily: FONTS.body, fontSize: 12, letterSpacing: '0.14em', textTransform: 'uppercase', color: COLORS.mute }}>
          {programTitle ? 'Jump back in' : "Then, today's workout"}
        </div>

        {!loading && !todayWorkout && (
          <div style={{ marginTop: 12, padding: 20, borderRadius: 16, background: '#fff', border: `1px solid ${COLORS.line}` }}>
            <div style={{ fontFamily: FONTS.display, fontSize: 18, color: COLORS.ink, fontStyle: 'italic' }}>
              No active program yet
            </div>
            <div style={{ fontFamily: FONTS.body, fontSize: 13, color: COLORS.mute, marginTop: 6, lineHeight: 1.5 }}>
              Choose a structured program built for your season to get started.
            </div>
            <Link
              to="/dashboard/program"
              style={{
                display: 'inline-block', marginTop: 14, fontFamily: FONTS.body, fontSize: 13, fontWeight: 500,
                color: COLORS.bg, background: COLORS.ink, padding: '10px 18px', borderRadius: 999, textDecoration: 'none',
              }}
            >
              Browse programs
            </Link>
          </div>
        )}

        {todayWorkout && (
          <div style={{ marginTop: 12, padding: 20, borderRadius: 16, background: '#fff', border: `1px solid ${COLORS.line}` }}>
            {programTitle && (
              <div style={{ fontFamily: FONTS.body, fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: COLORS.mute }}>
                {programTitle}
              </div>
            )}
            <div style={{ fontFamily: FONTS.display, fontSize: 20, color: COLORS.ink, fontStyle: 'italic', marginTop: 4 }}>
              {todayWorkout.title || `Day ${todayWorkout.day_number}`}
            </div>
            <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {(todayWorkout.program_exercises || []).slice(0, 4).map((ex) => (
                <div key={ex.id} style={{ display: 'flex', justifyContent: 'space-between', fontFamily: FONTS.body, fontSize: 14, color: COLORS.ink }}>
                  <span>{ex.name}</span>
                  <span style={{ color: COLORS.mute }}>{ex.sets}×{ex.reps}</span>
                </div>
              ))}
            </div>
            <Link
              to="/dashboard/log"
              style={{
                display: 'inline-block', marginTop: 16, fontFamily: FONTS.body, fontSize: 13, fontWeight: 500,
                color: COLORS.bg, background: COLORS.gold, padding: '10px 18px', borderRadius: 999, textDecoration: 'none',
              }}
            >
              Log today's workout
            </Link>
          </div>
        )}
      </div>

      {/* Nutrition summary */}
      <Link
        to="/dashboard/nutrition"
        style={{ display: 'block', marginTop: 24, padding: 18, borderRadius: 16, background: '#fff', border: `1px solid ${COLORS.line}`, textDecoration: 'none' }}
      >
        <div style={{ fontFamily: FONTS.body, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: COLORS.mute }}>
          Nutrition today
        </div>
        {nutrition.goal ? (
          <div style={{ fontFamily: FONTS.display, fontSize: 20, color: COLORS.ink, fontStyle: 'italic', marginTop: 6 }}>
            {nutrition.consumed} / {nutrition.goal.calories} calories
          </div>
        ) : (
          <div style={{ fontFamily: FONTS.body, fontSize: 13, color: COLORS.mute, marginTop: 6 }}>
            Set your nutrition goals to start tracking
          </div>
        )}
      </Link>

      {/* Habits snippet */}
      {habits.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontFamily: FONTS.body, fontSize: 12, letterSpacing: '0.14em', textTransform: 'uppercase', color: COLORS.mute }}>
              Habits
            </div>
            <Link to="/dashboard/habits" style={{ fontFamily: FONTS.body, fontSize: 12, color: COLORS.gold, textDecoration: 'none' }}>
              View all
            </Link>
          </div>
          <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {habits.slice(0, 3).map((h) => (
              <div
                key={h.id}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px 14px', borderRadius: 12, background: '#fff', border: `1px solid ${COLORS.line}`,
                }}
              >
                <span style={{ fontFamily: FONTS.body, fontSize: 14, color: COLORS.ink }}>{h.title}</span>
                <span
                  style={{
                    width: 18, height: 18, borderRadius: '50%',
                    border: `1.5px solid ${habitDoneToday(h) ? COLORS.gold : COLORS.line}`,
                    background: habitDoneToday(h) ? COLORS.gold : 'transparent',
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
