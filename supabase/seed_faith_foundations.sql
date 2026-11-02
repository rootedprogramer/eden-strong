-- Faith Over Flesh — Faith Foundations
-- 12-week hypertrophy program, 6 days a week, for men.
-- Monday Push A, Tuesday Pull A, Wednesday Legs A, Thursday Push B,
-- Friday Pull B, Saturday Legs B. Sunday is rest.
-- Shows only in Faith Over Flesh (edition = 'men'), under Experienced.
-- Run once in the Supabase SQL Editor (it's also part of setup_programs_and_tracking.sql).
-- Safe to run again: it replaces any earlier copy (anyone enrolled would pick it again).

alter table workout_programs  add column if not exists guide text;
alter table workout_programs  add column if not exists core_note text;
alter table workout_programs  add column if not exists track text;
alter table workout_programs  add column if not exists level_key text;
alter table workout_programs  add column if not exists location text default 'gym';
alter table workout_programs  add column if not exists image text;
alter table workout_programs  add column if not exists edition text;
alter table program_days      add column if not exists day_label text;
alter table program_days      add column if not exists rest_note text;
alter table program_days      add column if not exists focus_note text;
alter table program_exercises add column if not exists note text;
alter table program_exercises add column if not exists section text default 'workout';

-- Also removes the earlier draft of the men's program (Iron Sharpens Iron)
delete from workout_programs where title like 'Iron Sharpens Iron%' or title like 'Faith Foundations%';

do $$
declare
  prog uuid;
  d uuid;
begin
  insert into workout_programs (title, description, weeks, days_per_week, level, sort_order, track, level_key, location, edition, guide)
  values (
    'Faith Foundations — 6 Days',
    'Twelve weeks of hypertrophy training built on a firm foundation: push, pull, and legs twice a week, with Sunday to rest. Train hard, recover well, and build on the rock (Matthew 7:24–25).',
    12, 6, 'Experienced', 12, 'Faith Foundations', 'experienced', 'gym', 'men',
    $q$RIR means reps in reserve: how many more good reps you could still do at the end of a set. RIR 2 means stop with about two left in the tank. RIR 1 means one left. RIR 0 means nothing left with good form.

Warm-up sets come before your first working set where they're listed, for example 10 light, 6 moderate, 3 heavier. They don't count toward your working sets.

Rest the full time listed on each exercise. Heavy lifts need 2–3 minutes so every set counts.

Going up: when you hit the top of the rep range on every set with good form, add a little weight next time.

Sunday is rest. Walk, stretch, worship, and recover.$q$
  ) returning id into prog;


  -- Monday: Push A: Chest, Shoulders & Triceps
  insert into program_days (program_id, day_number, day_label, title, rest_note)
  values (prog, 1, 'Monday', $q$Push A: Chest, Shoulders & Triceps$q$, $q$Push day. Rest times are listed on each exercise. Do the warm-up sets before your first working set.$q$) returning id into d;
  insert into program_exercises (program_day_id, name, sets, reps, note, section, sort_order) values
    (d, $q$Bench Press or Machine Chest Press$q$, 3, $q$6–8$q$, $q$RIR 2. Rest 3 min. Warm-up: 10 light, 6 moderate, 3 heavier$q$, 'workout', 1),
    (d, $q$Incline Dumbbell Press$q$, 3, $q$8–10$q$, $q$RIR 2. Rest 2–3 min. Warm-up: 1 × 8 light$q$, 'workout', 2),
    (d, $q$Cable or Machine Fly$q$, 2, $q$10–15$q$, $q$RIR 1–2. Rest 90 sec$q$, 'workout', 3),
    (d, $q$Machine Shoulder Press$q$, 3, $q$6–10$q$, $q$RIR 2. Rest 2–3 min. Warm-up: 1 × 8 light$q$, 'workout', 4),
    (d, $q$Dumbbell Lateral Raise$q$, 3, $q$12–20$q$, $q$RIR 1. Rest 60–90 sec$q$, 'workout', 5),
    (d, $q$Triceps Pressdown$q$, 3, $q$8–12$q$, $q$RIR 1–2. Rest 90 sec$q$, 'workout', 6),
    (d, $q$Overhead Cable Triceps Extension$q$, 2, $q$10–15$q$, $q$RIR 1. Rest 90 sec$q$, 'workout', 7);

  -- Tuesday: Pull A: Back, Rear Delts & Biceps
  insert into program_days (program_id, day_number, day_label, title, rest_note)
  values (prog, 2, 'Tuesday', $q$Pull A: Back, Rear Delts & Biceps$q$, $q$Pull day. Rest times are listed on each exercise. Pull with your elbows, not your hands.$q$) returning id into d;
  insert into program_exercises (program_day_id, name, sets, reps, note, section, sort_order) values
    (d, $q$Lat Pulldown$q$, 3, $q$6–10$q$, $q$RIR 2. Rest 2–3 min. Warm-up: 10 light, 5 moderate$q$, 'workout', 1),
    (d, $q$Chest-Supported Row$q$, 3, $q$6–10$q$, $q$RIR 2. Rest 2–3 min. Warm-up: 1 × 8 light$q$, 'workout', 2),
    (d, $q$1-Arm Cable Lat Pulldown$q$, 2, $q$8–12$q$, $q$RIR 1–2. Rest 90 sec$q$, 'workout', 3),
    (d, $q$Seated Cable Row$q$, 2, $q$8–12$q$, $q$RIR 1–2. Rest 2 min$q$, 'workout', 4),
    (d, $q$Reverse Pec Deck$q$, 3, $q$12–20$q$, $q$RIR 1. Rest 60–90 sec$q$, 'workout', 5),
    (d, $q$Incline Dumbbell Curl$q$, 2, $q$8–12$q$, $q$RIR 1–2. Rest 90 sec. A curl machine works too$q$, 'workout', 6),
    (d, $q$Hammer Curls$q$, 2, $q$10–15$q$, $q$RIR 1. Rest 60–90 sec$q$, 'workout', 7);

  -- Wednesday: Legs A: Quads, Hamstrings, Glutes & Calves
  insert into program_days (program_id, day_number, day_label, title, rest_note)
  values (prog, 3, 'Wednesday', $q$Legs A: Quads, Hamstrings, Glutes & Calves$q$, $q$Leg day. Rest the full 3 minutes on squats and RDLs so every working set counts.$q$) returning id into d;
  insert into program_exercises (program_day_id, name, sets, reps, note, section, sort_order) values
    (d, $q$Hack Squat or Squat$q$, 3, $q$5–8$q$, $q$RIR 2. Rest 3 min. Warm-up: 10 light, 6 moderate, 3 heavier$q$, 'workout', 1),
    (d, $q$Leg Press$q$, 3, $q$8–12$q$, $q$RIR 2. Rest 2–3 min$q$, 'workout', 2),
    (d, $q$Romanian Deadlift$q$, 3, $q$6–10$q$, $q$RIR 2. Rest 3 min. Warm-up: 1 × 8 light$q$, 'workout', 3),
    (d, $q$Leg Extension$q$, 2, $q$10–15$q$, $q$RIR 1. Rest 90 sec$q$, 'workout', 4),
    (d, $q$Seated or Lying Leg Curl$q$, 3, $q$8–15$q$, $q$RIR 1. Rest 90 sec$q$, 'workout', 5),
    (d, $q$Standing Calf Raise$q$, 3, $q$8–15$q$, $q$RIR 1. Rest 90 sec$q$, 'workout', 6),
    (d, $q$Knee Crunches$q$, 2, $q$10–15$q$, $q$RIR 1–2. Rest 60–90 sec$q$, 'abs', 7);

  -- Thursday: Push B: Chest, Shoulders & Triceps
  insert into program_days (program_id, day_number, day_label, title, rest_note)
  values (prog, 4, 'Thursday', $q$Push B: Chest, Shoulders & Triceps$q$, $q$Push day. On triceps pressdowns, take only the final set to 0–1 reps in reserve.$q$) returning id into d;
  insert into program_exercises (program_day_id, name, sets, reps, note, section, sort_order) values
    (d, $q$Incline Machine Press$q$, 3, $q$6–10$q$, $q$RIR 2. Rest 2–3 min. Warm-up: 10 light, 5 moderate$q$, 'workout', 1),
    (d, $q$Machine Chest Press$q$, 3, $q$8–12$q$, $q$RIR 1–2. Rest 2–3 min$q$, 'workout', 2),
    (d, $q$Cable Fly$q$, 2, $q$10–15$q$, $q$RIR 1. Rest 90 sec$q$, 'workout', 3),
    (d, $q$Machine Shoulder Press$q$, 2, $q$8–12$q$, $q$RIR 1–2. Rest 2 min$q$, 'workout', 4),
    (d, $q$Cable Lateral Raise$q$, 4, $q$12–20$q$, $q$RIR 1. Rest 60–90 sec$q$, 'workout', 5),
    (d, $q$Overhead Cable Triceps Extension$q$, 3, $q$8–12$q$, $q$RIR 1. Rest 90 sec$q$, 'workout', 6),
    (d, $q$Triceps Pressdown$q$, 2, $q$10–15$q$, $q$RIR 0–1 on the final set only. Rest 90 sec$q$, 'workout', 7);

  -- Friday: Pull B: Back, Rear Delts & Biceps
  insert into program_days (program_id, day_number, day_label, title, rest_note)
  values (prog, 5, 'Friday', $q$Pull B: Back, Rear Delts & Biceps$q$, $q$Pull day. Rest times are listed on each exercise. Control the lowering on every rep.$q$) returning id into d;
  insert into program_exercises (program_day_id, name, sets, reps, note, section, sort_order) values
    (d, $q$Neutral-Grip Lat Pulldown$q$, 3, $q$8–12$q$, $q$RIR 2. Rest 2–3 min. Warm-up: 10 light, 5 moderate$q$, 'workout', 1),
    (d, $q$T-Bar Row or Machine Row$q$, 3, $q$6–10$q$, $q$RIR 2. Rest 2–3 min. Warm-up: 1 × 8 light$q$, 'workout', 2),
    (d, $q$1-Arm Machine or Cable Row$q$, 2, $q$8–12$q$, $q$RIR 1–2. Rest 90 sec$q$, 'workout', 3),
    (d, $q$Straight-Arm Pulldown$q$, 2, $q$10–15$q$, $q$RIR 1. Rest 90 sec$q$, 'workout', 4),
    (d, $q$Reverse Pec Deck$q$, 3, $q$12–20$q$, $q$RIR 1. Rest 60–90 sec$q$, 'workout', 5),
    (d, $q$Curl Machine$q$, 3, $q$8–12$q$, $q$RIR 1. Rest 90 sec$q$, 'workout', 6),
    (d, $q$Hammer Curl$q$, 2, $q$10–15$q$, $q$RIR 1. Rest 90 sec$q$, 'workout', 7);

  -- Saturday: Legs B: Quads, Hamstrings, Glutes & Calves
  insert into program_days (program_id, day_number, day_label, title, rest_note)
  values (prog, 6, 'Saturday', $q$Legs B: Quads, Hamstrings, Glutes & Calves$q$, $q$Leg day. Rest the full 3 minutes on the first lift and RDLs.$q$) returning id into d;
  insert into program_exercises (program_day_id, name, sets, reps, note, section, sort_order) values
    (d, $q$Hack Squat or Leg Press$q$, 3, $q$6–10$q$, $q$RIR 2. Rest 3 min. Warm-up: 10 light, 5 moderate$q$, 'workout', 1),
    (d, $q$Bulgarian Split Squat$q$, 2, $q$8–12 per leg$q$, $q$RIR 2. Rest 2 min$q$, 'workout', 2),
    (d, $q$Romanian Deadlift$q$, 3, $q$8–12$q$, $q$RIR 2. Rest 3 min$q$, 'workout', 3),
    (d, $q$Seated Leg Curl$q$, 3, $q$10–15$q$, $q$RIR 1. Rest 90 sec$q$, 'workout', 4),
    (d, $q$Leg Extension$q$, 3, $q$10–15$q$, $q$RIR 1. Rest 90 sec$q$, 'workout', 5),
    (d, $q$Hip Thrust or Glute Machine$q$, 2, $q$8–12$q$, $q$RIR 1–2. Rest 2 min$q$, 'workout', 6),
    (d, $q$Seated Calf Raise$q$, 3, $q$10–15$q$, $q$RIR 1. Rest 90 sec$q$, 'workout', 7),
    (d, $q$Cable Crunch$q$, 2, $q$10–15$q$, $q$RIR 1. Rest 60–90 sec$q$, 'abs', 8);
end $$;
