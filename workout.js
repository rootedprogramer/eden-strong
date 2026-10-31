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

export const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// Monday = 1 … Sunday = 7
export function weekdayNumber(date = new Date()) {
  return ((date.getDay() + 6) % 7) + 1;
}

// Which program day falls on a given weekday (1–7), or null for a rest day.
// Days with a weekday label (e.g. Grit & Glory's 'Tuesday') use that label.
// Otherwise Day 1 is Monday, Day 2 is Tuesday, and so on.
export function dayForWeekday(days, weekday) {
  const name = WEEKDAYS[weekday - 1].toLowerCase();
  const labelled = days.filter((d) => d.day_label);
  if (labelled.length) return labelled.find((d) => d.day_label.toLowerCase() === name) || null;
  return days.find((d) => d.day_number === weekday) || null;
}

// The weekday a program day falls on (1–7)
export function weekdayForDay(day) {
  if (day.day_label) {
    const i = WEEKDAYS.findIndex((w) => w.toLowerCase() === day.day_label.toLowerCase());
    if (i >= 0) return i + 1;
  }
  return day.day_number;
}

function mondayOf(date) {
  const d = new Date(date);
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() - (weekdayNumber(d) - 1));
  return d;
}

// Sorts exercises by section, attaches videos/thumbnails
async function prepareExercises(list) {
  const rank = Object.fromEntries(SECTIONS.map((s, i) => [s.key, i]));
  const exercises = [...(list || [])].sort(
    (a, b) => (rank[sectionOf(a)] ?? 1) - (rank[sectionOf(b)] ?? 1) || (a.sort_order || 0) - (b.sort_order || 0)
  );
  const names = [...new Set(exercises.map((e) => e.name))];
  let media = {};
  if (names.length) {
    const { data: rows } = await supabase.from('exercise_media').select('*').in('name', names);
    media = Object.fromEntries((rows || []).map((r) => [r.name, r]));
  }
  return exercises.map((e) => ({ ...e, media: media[e.name] || null }));
}

// Loads one program day (with exercises) by its id
export async function loadDayById(dayId) {
  const { data: day } = await supabase.from('program_days').select('*, program_exercises(*)').eq('id', dayId).maybeSingle();
  if (!day) return null;
  const { data: program } = await supabase.from('workout_programs').select('*').eq('id', day.program_id).maybeSingle();
  return { day, program: program || {}, exercises: await prepareExercises(day.program_exercises) };
}

// The member's schedule for today, based on the calendar:
// Monday is Day 1, Tuesday is Day 2, etc. (or each day's weekday label).
// Returns today's day (or null on a rest day) and the next workout day.
export async function loadToday() {
  const { data: userData } = await supabase.auth.getUser();
  const uid = userData?.user?.id;
  if (!uid) return { uid: null };

  const { data: enrollment } = await supabase
    .from('program_enrollments')
    .select('id, program_id, current_day, started_at, workout_programs(*)')
    .eq('user_id', uid)
    .eq('active', true)
    .maybeSingle();
  if (!enrollment) return { uid, enrollment: null };

  const program = enrollment.workout_programs || {};
  const { data: dayRows } = await supabase.from('program_days').select('*').eq('program_id', enrollment.program_id);
  const days = (dayRows || []).sort((a, b) => a.day_number - b.day_number);

  const now = new Date();
  const weekday = weekdayNumber(now);
  const start = enrollment.started_at ? new Date(enrollment.started_at) : now;
  const weeksIn = Math.floor((mondayOf(now) - mondayOf(start)) / (7 * 86400000)) + 1;
  const week = Math.max(1, Math.min(weeksIn, program.weeks || weeksIn));

  const todayDay = dayForWeekday(days, weekday);
  let nextDay = null;
  for (let i = 1; i <= 7 && !nextDay; i++) {
    const wd = ((weekday - 1 + i) % 7) + 1;
    const d = dayForWeekday(days, wd);
    if (d) nextDay = { ...d, weekday: wd };
  }

  let day = null;
  let exercises = [];
  if (todayDay) {
    const { data: full } = await supabase.from('program_days').select('*, program_exercises(*)').eq('id', todayDay.id).maybeSingle();
    day = full || todayDay;
    exercises = await prepareExercises(full?.program_exercises);
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
    days,
    week,
    weekday,
    day,
    dayNumber: day?.day_number ?? null,
    nextDay,
    exercises,
    completedToday: (doneToday || []).some((c) => !day || c.program_day_id === day.id),
  };
}
