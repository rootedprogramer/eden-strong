import { supabase } from './supabaseClient';

export const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

// Order and labels for the sections of a workout day
export const SECTIONS = [
  { key: 'mobility', label: 'Mobility', tone: 'sage' },
  { key: 'workout', label: 'Workout', tone: 'ink' },
  { key: 'abs', label: 'Ab circuit', tone: 'gold' },
  { key: 'core', label: 'Deep core finisher', tone: 'gold' },
  { key: 'cardio', label: 'Cardio', tone: 'olive' },
  { key: 'stretch', label: 'Stretch', tone: 'rose' },
];

export function sectionOf(ex) {
  const s = ex.section || 'workout';
  return s === 'main' ? 'workout' : s;
}

// '30 sec' → 30, '20 min' → 1200, '45 seconds' → 45. Rep counts → null.
export function parseSeconds(reps) {
  if (!reps) return null;
  const m = String(reps).match(/(\d+)\s*(sec|second|s\b|min|minute)/i);
  if (!m) return null;
  return /min/i.test(m[2]) ? Number(m[1]) * 60 : Number(m[1]);
}

// '12-8' → 12, '15 each leg' → 15
export function plannedReps(reps) {
  const m = String(reps || '').match(/\d+/);
  return m ? Number(m[0]) : null;
}

export function prescription(ex) {
  const n = ex.sets || 1;
  const reps = ex.reps && ex.reps !== 'circuit' ? ex.reps : null;
  if (!reps) return `${n} ${n === 1 ? 'round' : 'rounds'}`;
  return `${n} ${n === 1 ? 'set' : 'sets'} of ${reps}`;
}

export function formatClock(total) {
  const s = Math.max(0, Math.round(total));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

// Turns a YouTube link into an embeddable URL; returns null for other links
export function youtubeEmbed(url) {
  if (!url) return null;
  const m = url.match(/(?:youtu\.be\/|v=|shorts\/|embed\/)([\w-]{11})/);
  return m ? `https://www.youtube.com/embed/${m[1]}?playsinline=1&rel=0` : null;
}

// Loads the member's current workout day: program, day, ordered exercises
// (with any video/thumbnail attached), and whether a workout was completed today.
export async function loadToday() {
  const { data: userData } = await supabase.auth.getUser();
  const uid = userData?.user?.id;
  if (!uid) return { uid: null };

  const { data: enrollment } = await supabase
    .from('program_enrollments')
    .select('id, program_id, current_day, workout_programs(*)')
    .eq('user_id', uid)
    .eq('active', true)
    .maybeSingle();
  if (!enrollment) return { uid, enrollment: null };

  const program = enrollment.workout_programs || {};
  const perWeek = program.days_per_week || 1;
  const index = Math.max(0, (enrollment.current_day || 1) - 1);
  const week = Math.floor(index / perWeek) + 1;
  const dayNumber = (index % perWeek) + 1;

  const { data: day } = await supabase
    .from('program_days')
    .select('*, program_exercises(*)')
    .eq('program_id', enrollment.program_id)
    .eq('day_number', dayNumber)
    .maybeSingle();

  const rank = Object.fromEntries(SECTIONS.map((s, i) => [s.key, i]));
  const exercises = [...(day?.program_exercises || [])].sort(
    (a, b) => (rank[sectionOf(a)] ?? 1) - (rank[sectionOf(b)] ?? 1) || (a.sort_order || 0) - (b.sort_order || 0)
  );

  const names = [...new Set(exercises.map((e) => e.name))];
  let media = {};
  if (names.length) {
    const { data: rows } = await supabase.from('exercise_media').select('*').in('name', names);
    media = Object.fromEntries((rows || []).map((r) => [r.name, r]));
  }

  const { data: doneToday } = await supabase
    .from('workout_completions')
    .select('id, program_day_id')
    .eq('user_id', uid)
    .eq('completed_on', todayISO());

  return {
    uid,
    enrollment,
    program,
    week,
    dayNumber,
    day,
    exercises: exercises.map((e) => ({ ...e, media: media[e.name] || null })),
    completedToday: (doneToday || []).length > 0,
  };
}
