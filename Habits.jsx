import { useEffect, useState } from 'react';
import { COLORS, FONTS } from '../../brand/tokens';
import { supabase } from '../../lib/supabaseClient';

const todayISO = () => new Date().toISOString().slice(0, 10);

export default function Habits() {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newHabit, setNewHabit] = useState('');
  const [showAdd, setShowAdd] = useState(false);

  const load = async () => {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    if (!userId) return;
    const { data } = await supabase
      .from('habits')
      .select('*, habit_completions(id, completed_date)')
      .eq('user_id', userId)
      .order('sort_order', { ascending: true });
    setHabits(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const addHabit = async (e) => {
    e.preventDefault();
    if (!newHabit.trim()) return;
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    if (!userId) return;
    await supabase.from('habits').insert({ user_id: userId, title: newHabit.trim(), sort_order: habits.length });
    setNewHabit('');
    setShowAdd(false);
    load();
  };

  const isDoneToday = (habit) =>
    (habit.habit_completions || []).some((c) => c.completed_date === todayISO());

  const toggleToday = async (habit) => {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    if (!userId) return;

    if (isDoneToday(habit)) {
      await supabase
        .from('habit_completions')
        .delete()
        .eq('habit_id', habit.id)
        .eq('completed_date', todayISO());
    } else {
      await supabase.from('habit_completions').insert({
        habit_id: habit.id,
        user_id: userId,
        completed_date: todayISO(),
      });
    }
    load();
  };

  const streak = (habit) => (habit.habit_completions || []).length;

  return (
    <div style={{ padding: '24px 24px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontFamily: FONTS.display, fontSize: 26, color: COLORS.ink, fontStyle: 'italic' }}>
          Habits
        </div>
        <button
          onClick={() => setShowAdd((s) => !s)}
          style={{ fontFamily: FONTS.body, fontSize: 20, color: COLORS.gold, background: 'none', border: 'none', cursor: 'pointer' }}
        >
          +
        </button>
      </div>
      <div style={{ fontFamily: FONTS.body, fontSize: 13, color: COLORS.mute, marginTop: 6 }}>
        {new Date().toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
      </div>

      {showAdd && (
        <form onSubmit={addHabit} style={{ marginTop: 14, display: 'flex', gap: 8 }}>
          <input
            placeholder="e.g. Drink water, No sugar"
            value={newHabit}
            onChange={(e) => setNewHabit(e.target.value)}
            style={{ flex: 1, fontFamily: FONTS.body, fontSize: 14, padding: '10px 14px', borderRadius: 12, border: `1px solid ${COLORS.line}` }}
          />
          <button type="submit" style={{ fontFamily: FONTS.body, fontSize: 13, fontWeight: 500, color: COLORS.bg, background: COLORS.ink, border: 'none', padding: '10px 16px', borderRadius: 999, cursor: 'pointer' }}>
            Add
          </button>
        </form>
      )}

      <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {loading && <div style={{ fontFamily: FONTS.body, fontSize: 13, color: COLORS.mute }}>Loading…</div>}
        {!loading && habits.length === 0 && (
          <div style={{ fontFamily: FONTS.body, fontSize: 13, color: COLORS.mute }}>
            No habits yet — add one above to start building streaks.
          </div>
        )}
        {habits.map((h) => (
          <div
            key={h.id}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '14px 16px', borderRadius: 12, background: COLORS.surface, border: `1px solid ${COLORS.line}`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontFamily: FONTS.body, fontSize: 12, color: COLORS.gold, fontWeight: 600 }}>
                🔥{streak(h)}
              </span>
              <span style={{ fontFamily: FONTS.body, fontSize: 14, color: COLORS.ink }}>{h.title}</span>
            </div>
            <button
              onClick={() => toggleToday(h)}
              style={{
                width: 24, height: 24, borderRadius: '50%', cursor: 'pointer',
                border: `1.5px solid ${isDoneToday(h) ? COLORS.gold : COLORS.line}`,
                background: isDoneToday(h) ? COLORS.gold : 'transparent',
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
