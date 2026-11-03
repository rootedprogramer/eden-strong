import { supabase } from './supabaseClient';

// Today's devotion for a member. Each brand can have its own year of
// devotions (edition = 'women' etc.); shared devotions (no edition) fill in
// for brands that don't have their own yet. After the last day, it starts over.
export async function loadDevotion(uid, editionId) {
  const { data: progress } = await supabase.from('devotion_progress').select('current_day').eq('user_id', uid).maybeSingle();
  const currentDay = progress?.current_day || 1;

  const pick = (rows) => (rows || []).find((r) => r.edition === editionId) || (rows || []).find((r) => !r.edition) || null;

  const { data: rows } = await supabase.from('daily_devotions').select('*').eq('day_number', currentDay);
  let devotion = pick(rows);

  if (!devotion) {
    // Past the end of the library: start the cycle again
    const { data: all } = await supabase.from('daily_devotions').select('day_number, edition');
    const mine = (all || []).filter((r) => r.edition === editionId);
    const pool = mine.length ? mine : (all || []).filter((r) => !r.edition);
    const total = pool.reduce((m, r) => Math.max(m, r.day_number), 0);
    if (total) {
      const wrapped = ((currentDay - 1) % total) + 1;
      const { data: again } = await supabase.from('daily_devotions').select('*').eq('day_number', wrapped);
      devotion = pick(again);
    }
  }

  const { data: count } = await supabase.from('daily_devotions').select('day_number, edition');
  const totalDays = (count || []).filter((r) => r.edition === (devotion?.edition ?? null)).length || null;

  return { devotion, currentDay, totalDays };
}
