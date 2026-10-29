import { supabase } from './supabaseClient';

// Loads every program and fills in track, level, and location even when the
// database doesn't have those columns set yet, so programs always show up.
//   track:    the part of the title before the dash ('Grit & Glory — 5 Days' → 'Grit & Glory')
//   location: 'gym' unless set
//   level:    level_key if set; otherwise taken from the track's lowest-day
//             program's level text ('Beginner–Intermediate' → beginner)
export async function loadPrograms() {
  const { data, error } = await supabase.from('workout_programs').select('*');
  if (error) return { programs: [], error };

  const rows = (data || []).map((p) => ({
    ...p,
    track: p.track || String(p.title || '').split(/\s[—–-]\s/)[0].trim(),
    location: p.location || 'gym',
  }));

  const levelFromText = (text) => {
    const first = String(text || '').toLowerCase().split(/[^a-z]/)[0];
    return ['beginner', 'intermediate', 'advanced'].includes(first) ? first : 'beginner';
  };

  const trackLevel = {};
  [...rows]
    .sort((a, b) => (a.days_per_week || 0) - (b.days_per_week || 0))
    .forEach((p) => {
      if (!trackLevel[p.track]) trackLevel[p.track] = p.level_key || levelFromText(p.level);
    });

  const programs = rows.map((p) => ({ ...p, level_key: p.level_key || trackLevel[p.track] }));
  return { programs, error: null };
}
