-- Fidoryn — Faith Forged
-- Intermediate plans, four versions:
--   4 Days · Upper/Lower (gym)        Mon, Tue, Thu, Sat
--   5 Days · Push/Pull/Legs + Upper/Lower (gym)   Mon, Tue, Wed, Fri, Sat
--   4 Days · Full Body (gym)          Mon, Tue, Thu, Sat, optional Fri cardio
--   4 Days · Full Body at Home        Mon, Tue, Thu, Sat, optional Fri cardio
-- Listed under Experienced (the app has Beginner and Experienced levels).
-- Shows only in Fidoryn (edition = 'men').
-- Run once in the Supabase SQL Editor (it's also part of setup_programs_and_tracking.sql).
-- Safe to run again: it replaces any earlier copy (anyone enrolled would pick it again).

alter table workout_programs  add column if not exists guide text;
alter table workout_programs  add column if not exists track text;
alter table workout_programs  add column if not exists level_key text;
alter table workout_programs  add column if not exists location text default 'gym';
alter table workout_programs  add column if not exists edition text;
alter table program_days      add column if not exists day_label text;
alter table program_days      add column if not exists rest_note text;
alter table program_exercises add column if not exists note text;
alter table program_exercises add column if not exists section text default 'workout';

delete from workout_programs where title like 'Faith Forged%';

do $$
declare
  prog uuid;
  d uuid;
begin

  insert into workout_programs (title, description, weeks, days_per_week, level, sort_order, track, level_key, location, edition, guide)
  values ($q$Faith Forged — 4 Days · Upper/Lower$q$, $q$The trial of your faith is more precious than gold, though it be tried with fire (1 Peter 1:7). Intermediate training to forge real strength, four days a week: two upper days and two lower days at the gym.$q$, 12, 4, $q$Experienced$q$, 17, $q$Faith Forged$q$, 'experienced', 'gym', 'men', $q$Warm-up: do 5–10 minutes of easy cardio or movement, then lighter practice sets for the first major exercise.

Effort: choose a weight or variation that leaves about 1–3 controlled reps in reserve on most sets. Rest longer if you need to keep good form.

Progression: when every set reaches the top of the listed rep range with good form, add a little weight (or pick a slightly harder variation) and work back up through the range.

Choices: where two exercise options are listed, pick one and keep it for several weeks so your progress is easy to track.

The rest time for each exercise is in its notes.$q$) returning id into prog;

  -- Monday: Upper A: Chest, Back & Shoulders
  insert into program_days (program_id, day_number, day_label, title, rest_note)
  values (prog, 1, 'Monday', $q$Upper A: Chest, Back & Shoulders$q$, $q$About 50–70 minutes.$q$) returning id into d;
  insert into program_exercises (program_day_id, name, sets, reps, note, section, superset_group, sort_order) values
    (d, $q$Barbell or Machine Bench Press$q$, 3, $q$6–10$q$, $q$Rest 2–3 min$q$, 'workout', null, 1),
    (d, $q$Seated Cable Row$q$, 3, $q$8–12$q$, $q$Rest 2 min$q$, 'workout', null, 2),
    (d, $q$Dumbbell Shoulder Press$q$, 3, $q$8–12$q$, $q$Rest 2 min$q$, 'workout', null, 3),
    (d, $q$Lat Pulldown$q$, 3, $q$8–12$q$, $q$Rest 2 min$q$, 'workout', null, 4),
    (d, $q$Dumbbell Lateral Raise$q$, 2, $q$12–15$q$, $q$Rest 60–90 sec$q$, 'workout', null, 5),
    (d, $q$Cable Triceps Pressdown$q$, 2, $q$10–15$q$, $q$Rest 60–90 sec$q$, 'workout', null, 6),
    (d, $q$Dumbbell Curl$q$, 2, $q$10–15$q$, $q$Rest 60–90 sec$q$, 'workout', null, 7);

  -- Tuesday: Lower A: Squat & Hinge
  insert into program_days (program_id, day_number, day_label, title, rest_note)
  values (prog, 2, 'Tuesday', $q$Lower A: Squat & Hinge$q$, null) returning id into d;
  insert into program_exercises (program_day_id, name, sets, reps, note, section, superset_group, sort_order) values
    (d, $q$Back Squat or Leg Press$q$, 3, $q$6–10$q$, $q$Rest 2–3 min$q$, 'workout', null, 1),
    (d, $q$Romanian Deadlift$q$, 3, $q$8–10$q$, $q$Rest 2–3 min$q$, 'workout', null, 2),
    (d, $q$Reverse Lunge$q$, 2, $q$8–10 per leg$q$, $q$Rest 90–120 sec$q$, 'workout', null, 3),
    (d, $q$Seated Leg Curl$q$, 3, $q$10–15$q$, $q$Rest 90 sec$q$, 'workout', null, 4),
    (d, $q$Calf Raise$q$, 3, $q$10–15$q$, $q$Rest 60–90 sec$q$, 'workout', null, 5),
    (d, $q$Plank$q$, 3, $q$30–45 sec$q$, $q$Rest 60 sec$q$, 'abs', null, 6);

  -- Thursday: Upper B: Incline, Rows & Arms
  insert into program_days (program_id, day_number, day_label, title, rest_note)
  values (prog, 3, 'Thursday', $q$Upper B: Incline, Rows & Arms$q$, null) returning id into d;
  insert into program_exercises (program_day_id, name, sets, reps, note, section, superset_group, sort_order) values
    (d, $q$Incline Dumbbell Press$q$, 3, $q$8–12$q$, $q$Rest 2 min$q$, 'workout', null, 1),
    (d, $q$Chest-Supported Row$q$, 3, $q$8–12$q$, $q$Rest 2 min$q$, 'workout', null, 2),
    (d, $q$Machine Chest Press$q$, 2, $q$10–12$q$, $q$Rest 90–120 sec$q$, 'workout', null, 3),
    (d, $q$Assisted Pull-Up or Lat Pulldown$q$, 3, $q$8–12$q$, $q$Rest 2 min$q$, 'workout', null, 4),
    (d, $q$Face Pull$q$, 2, $q$12–15$q$, $q$Rest 60–90 sec$q$, 'workout', null, 5),
    (d, $q$Overhead Triceps Extension$q$, 2, $q$10–15$q$, $q$Rest 60–90 sec$q$, 'workout', null, 6),
    (d, $q$Hammer Curl$q$, 2, $q$10–15$q$, $q$Rest 60–90 sec$q$, 'workout', null, 7);

  -- Saturday: Lower B: Deadlift & Glutes
  insert into program_days (program_id, day_number, day_label, title, rest_note)
  values (prog, 4, 'Saturday', $q$Lower B: Deadlift & Glutes$q$, null) returning id into d;
  insert into program_exercises (program_day_id, name, sets, reps, note, section, superset_group, sort_order) values
    (d, $q$Trap-Bar or Conventional Deadlift$q$, 3, $q$5–8$q$, $q$Rest 2–3 min$q$, 'workout', null, 1),
    (d, $q$Hack Squat or Goblet Squat$q$, 3, $q$8–12$q$, $q$Rest 2 min$q$, 'workout', null, 2),
    (d, $q$Hip Thrust$q$, 3, $q$8–12$q$, $q$Rest 2 min$q$, 'workout', null, 3),
    (d, $q$Leg Extension$q$, 2, $q$10–15$q$, $q$Rest 90 sec$q$, 'workout', null, 4),
    (d, $q$Calf Raise$q$, 3, $q$10–15$q$, $q$Rest 60–90 sec$q$, 'workout', null, 5),
    (d, $q$Dead Bug$q$, 3, $q$8–10 per side$q$, $q$Rest 60 sec$q$, 'abs', null, 6);

  insert into workout_programs (title, description, weeks, days_per_week, level, sort_order, track, level_key, location, edition, guide)
  values ($q$Faith Forged — 5 Days · Push/Pull/Legs + Upper/Lower$q$, $q$The trial of your faith is more precious than gold, though it be tried with fire (1 Peter 1:7). Intermediate training to forge real strength, five days a week at the gym: push, pull, and legs, then an upper and a lower day.$q$, 12, 5, $q$Experienced$q$, 18, $q$Faith Forged$q$, 'experienced', 'gym', 'men', $q$Warm-up: do 5–10 minutes of easy cardio or movement, then lighter practice sets for the first major exercise.

Effort: choose a weight or variation that leaves about 1–3 controlled reps in reserve on most sets. Rest longer if you need to keep good form.

Progression: when every set reaches the top of the listed rep range with good form, add a little weight (or pick a slightly harder variation) and work back up through the range.

Choices: where two exercise options are listed, pick one and keep it for several weeks so your progress is easy to track.

The rest time for each exercise is in its notes.$q$) returning id into prog;

  -- Monday: Push: Chest, Shoulders & Triceps
  insert into program_days (program_id, day_number, day_label, title, rest_note)
  values (prog, 1, 'Monday', $q$Push: Chest, Shoulders & Triceps$q$, $q$About 45–70 minutes.$q$) returning id into d;
  insert into program_exercises (program_day_id, name, sets, reps, note, section, superset_group, sort_order) values
    (d, $q$Bench Press$q$, 3, $q$6–10$q$, $q$Rest 2–3 min$q$, 'workout', null, 1),
    (d, $q$Incline Dumbbell Press$q$, 3, $q$8–12$q$, $q$Rest 2 min$q$, 'workout', null, 2),
    (d, $q$Machine Shoulder Press$q$, 3, $q$8–12$q$, $q$Rest 2 min$q$, 'workout', null, 3),
    (d, $q$Dumbbell Lateral Raise$q$, 3, $q$12–15$q$, $q$Rest 60–90 sec$q$, 'workout', null, 4),
    (d, $q$Cable Triceps Pressdown$q$, 3, $q$10–15$q$, $q$Rest 60–90 sec$q$, 'workout', null, 5);

  -- Tuesday: Pull: Back & Biceps
  insert into program_days (program_id, day_number, day_label, title, rest_note)
  values (prog, 2, 'Tuesday', $q$Pull: Back & Biceps$q$, null) returning id into d;
  insert into program_exercises (program_day_id, name, sets, reps, note, section, superset_group, sort_order) values
    (d, $q$Lat Pulldown or Assisted Pull-Up$q$, 3, $q$8–12$q$, $q$Rest 2 min$q$, 'workout', null, 1),
    (d, $q$Seated Cable Row$q$, 3, $q$8–12$q$, $q$Rest 2 min$q$, 'workout', null, 2),
    (d, $q$Chest-Supported Row$q$, 2, $q$8–12$q$, $q$Rest 90–120 sec$q$, 'workout', null, 3),
    (d, $q$Face Pull$q$, 3, $q$12–15$q$, $q$Rest 60–90 sec$q$, 'workout', null, 4),
    (d, $q$Dumbbell Curl$q$, 3, $q$10–15$q$, $q$Rest 60–90 sec$q$, 'workout', null, 5);

  -- Wednesday: Legs: Squat & Hinge
  insert into program_days (program_id, day_number, day_label, title, rest_note)
  values (prog, 3, 'Wednesday', $q$Legs: Squat & Hinge$q$, null) returning id into d;
  insert into program_exercises (program_day_id, name, sets, reps, note, section, superset_group, sort_order) values
    (d, $q$Squat or Leg Press$q$, 3, $q$6–10$q$, $q$Rest 2–3 min$q$, 'workout', null, 1),
    (d, $q$Romanian Deadlift$q$, 3, $q$8–10$q$, $q$Rest 2–3 min$q$, 'workout', null, 2),
    (d, $q$Reverse Lunge$q$, 2, $q$8–10 per leg$q$, $q$Rest 90–120 sec$q$, 'workout', null, 3),
    (d, $q$Seated Leg Curl$q$, 3, $q$10–15$q$, $q$Rest 90 sec$q$, 'workout', null, 4),
    (d, $q$Calf Raise$q$, 3, $q$10–15$q$, $q$Rest 60–90 sec$q$, 'workout', null, 5),
    (d, $q$Plank$q$, 3, $q$30–45 sec$q$, $q$Rest 60 sec$q$, 'abs', null, 6);

  -- Friday: Upper: Chest, Back & Arms
  insert into program_days (program_id, day_number, day_label, title, rest_note)
  values (prog, 4, 'Friday', $q$Upper: Chest, Back & Arms$q$, null) returning id into d;
  insert into program_exercises (program_day_id, name, sets, reps, note, section, superset_group, sort_order) values
    (d, $q$Incline Machine or Dumbbell Press$q$, 3, $q$8–12$q$, $q$Rest 2 min$q$, 'workout', null, 1),
    (d, $q$One-Arm Cable Row$q$, 3, $q$8–12 per side$q$, $q$Rest 2 min$q$, 'workout', null, 2),
    (d, $q$Machine Chest Press$q$, 2, $q$10–12$q$, $q$Rest 90–120 sec$q$, 'workout', null, 3),
    (d, $q$Lat Pulldown$q$, 2, $q$10–12$q$, $q$Rest 90–120 sec$q$, 'workout', null, 4),
    (d, $q$Dumbbell Lateral Raise$q$, 2, $q$12–15$q$, $q$Rest 60–90 sec$q$, 'workout', null, 5),
    (d, $q$Cable Triceps Pressdown$q$, 2, $q$10–15$q$, $q$Rest 60–90 sec$q$, 'workout', null, 6),
    (d, $q$Cable Curl$q$, 2, $q$10–15$q$, $q$Rest 60–90 sec$q$, 'workout', null, 7);

  -- Saturday: Lower: Deadlift & Glutes
  insert into program_days (program_id, day_number, day_label, title, rest_note)
  values (prog, 5, 'Saturday', $q$Lower: Deadlift & Glutes$q$, null) returning id into d;
  insert into program_exercises (program_day_id, name, sets, reps, note, section, superset_group, sort_order) values
    (d, $q$Trap-Bar or Conventional Deadlift$q$, 3, $q$5–8$q$, $q$Rest 2–3 min$q$, 'workout', null, 1),
    (d, $q$Hack Squat or Goblet Squat$q$, 3, $q$8–12$q$, $q$Rest 2 min$q$, 'workout', null, 2),
    (d, $q$Hip Thrust$q$, 3, $q$8–12$q$, $q$Rest 2 min$q$, 'workout', null, 3),
    (d, $q$Leg Extension$q$, 2, $q$10–15$q$, $q$Rest 90 sec$q$, 'workout', null, 4),
    (d, $q$Seated Leg Curl$q$, 2, $q$10–15$q$, $q$Rest 90 sec$q$, 'workout', null, 5),
    (d, $q$Calf Raise$q$, 3, $q$10–15$q$, $q$Rest 60–90 sec$q$, 'workout', null, 6);

  insert into workout_programs (title, description, weeks, days_per_week, level, sort_order, track, level_key, location, edition, guide)
  values ($q$Faith Forged — 4 Days · Full Body$q$, $q$The trial of your faith is more precious than gold, though it be tried with fire (1 Peter 1:7). Intermediate training to forge real strength, four full-body gym days a week, spread out for recovery, plus an optional cardio and mobility day.$q$, 12, 4, $q$Experienced$q$, 19, $q$Faith Forged$q$, 'experienced', 'gym', 'men', $q$Warm-up: do 5–10 minutes of easy cardio or movement, then lighter practice sets for the first major exercise.

Effort: choose a weight or variation that leaves about 1–3 controlled reps in reserve on most sets. Rest longer if you need to keep good form.

Progression: when every set reaches the top of the listed rep range with good form, add a little weight (or pick a slightly harder variation) and work back up through the range.

Choices: where two exercise options are listed, pick one and keep it for several weeks so your progress is easy to track.

The rest time for each exercise is in its notes.$q$) returning id into prog;

  -- Monday: Full Body A
  insert into program_days (program_id, day_number, day_label, title, rest_note)
  values (prog, 1, 'Monday', $q$Full Body A$q$, $q$About 45–65 minutes.$q$) returning id into d;
  insert into program_exercises (program_day_id, name, sets, reps, note, section, superset_group, sort_order) values
    (d, $q$Leg Press$q$, 3, $q$8–12$q$, $q$Rest 2 min$q$, 'workout', null, 1),
    (d, $q$Machine Chest Press$q$, 3, $q$8–12$q$, $q$Rest 2 min$q$, 'workout', null, 2),
    (d, $q$Seated Cable Row$q$, 3, $q$8–12$q$, $q$Rest 2 min$q$, 'workout', null, 3),
    (d, $q$Romanian Deadlift$q$, 2, $q$8–10$q$, $q$Rest 2 min$q$, 'workout', null, 4),
    (d, $q$Dumbbell Lateral Raise$q$, 2, $q$12–15$q$, $q$Rest 60–90 sec$q$, 'workout', null, 5),
    (d, $q$Dead Bug$q$, 2, $q$8–10 per side$q$, $q$Rest 60 sec$q$, 'abs', null, 6);

  -- Tuesday: Full Body B
  insert into program_days (program_id, day_number, day_label, title, rest_note)
  values (prog, 2, 'Tuesday', $q$Full Body B$q$, null) returning id into d;
  insert into program_exercises (program_day_id, name, sets, reps, note, section, superset_group, sort_order) values
    (d, $q$Goblet Squat$q$, 3, $q$8–12$q$, $q$Rest 2 min$q$, 'workout', null, 1),
    (d, $q$Lat Pulldown$q$, 3, $q$8–12$q$, $q$Rest 2 min$q$, 'workout', null, 2),
    (d, $q$Dumbbell Incline Press$q$, 3, $q$8–12$q$, $q$Rest 2 min$q$, 'workout', null, 3),
    (d, $q$Seated Leg Curl$q$, 2, $q$10–15$q$, $q$Rest 90 sec$q$, 'workout', null, 4),
    (d, $q$Cable Triceps Pressdown$q$, 2, $q$10–15$q$, $q$Rest 60–90 sec$q$, 'workout', null, 5),
    (d, $q$Dumbbell Curl$q$, 2, $q$10–15$q$, $q$Rest 60–90 sec$q$, 'workout', null, 6);

  -- Thursday: Full Body C
  insert into program_days (program_id, day_number, day_label, title, rest_note)
  values (prog, 3, 'Thursday', $q$Full Body C$q$, null) returning id into d;
  insert into program_exercises (program_day_id, name, sets, reps, note, section, superset_group, sort_order) values
    (d, $q$Hack Squat or Leg Press$q$, 3, $q$8–12$q$, $q$Rest 2 min$q$, 'workout', null, 1),
    (d, $q$Dumbbell Shoulder Press$q$, 3, $q$8–12$q$, $q$Rest 2 min$q$, 'workout', null, 2),
    (d, $q$Chest-Supported Row$q$, 3, $q$8–12$q$, $q$Rest 2 min$q$, 'workout', null, 3),
    (d, $q$Hip Thrust$q$, 2, $q$8–12$q$, $q$Rest 2 min$q$, 'workout', null, 4),
    (d, $q$Face Pull$q$, 2, $q$12–15$q$, $q$Rest 60–90 sec$q$, 'workout', null, 5),
    (d, $q$Plank$q$, 2, $q$30–45 sec$q$, $q$Rest 60 sec$q$, 'abs', null, 6);

  -- Saturday: Full Body D
  insert into program_days (program_id, day_number, day_label, title, rest_note)
  values (prog, 4, 'Saturday', $q$Full Body D$q$, null) returning id into d;
  insert into program_exercises (program_day_id, name, sets, reps, note, section, superset_group, sort_order) values
    (d, $q$Trap-Bar Deadlift$q$, 3, $q$5–8$q$, $q$Rest 2–3 min$q$, 'workout', null, 1),
    (d, $q$Machine Chest Press$q$, 3, $q$8–12$q$, $q$Rest 2 min$q$, 'workout', null, 2),
    (d, $q$One-Arm Cable Row$q$, 3, $q$8–12 per side$q$, $q$Rest 90–120 sec$q$, 'workout', null, 3),
    (d, $q$Reverse Lunge$q$, 2, $q$8–10 per leg$q$, $q$Rest 90–120 sec$q$, 'workout', null, 4),
    (d, $q$Calf Raise$q$, 2, $q$10–15$q$, $q$Rest 60–90 sec$q$, 'workout', null, 5),
    (d, $q$Pallof Press$q$, 2, $q$8–12 per side$q$, $q$Rest 60 sec$q$, 'abs', null, 6);

  -- Friday: Optional: Cardio & Mobility
  insert into program_days (program_id, day_number, day_label, title, rest_note)
  values (prog, 5, 'Friday', $q$Optional: Cardio & Mobility$q$, $q$Optional day. 20–30 minutes of easy-to-moderate cardio, then gentle mobility.$q$) returning id into d;
  insert into program_exercises (program_day_id, name, sets, reps, note, section, superset_group, sort_order) values
    (d, $q$Walking, Cycling, or Elliptical$q$, 1, $q$20–30 min$q$, $q$Easy to moderate pace$q$, 'cardio', null, 1),
    (d, $q$Mobility Flow$q$, 1, $q$5–10 min$q$, $q$Comfortable range of motion$q$, 'stretch', null, 2);

  insert into workout_programs (title, description, weeks, days_per_week, level, sort_order, track, level_key, location, edition, guide)
  values ($q$Faith Forged — 4 Days · Full Body at Home$q$, $q$The trial of your faith is more precious than gold, though it be tried with fire (1 Peter 1:7). Intermediate training to forge real strength, four full-body days a week at home with a backpack, a sturdy chair, and a band if you have one, plus an optional walk and mobility day.$q$, 12, 4, $q$Experienced$q$, 20, $q$Faith Forged$q$, 'experienced', 'home', 'men', $q$Warm-up: do 5–10 minutes of easy cardio or movement, then lighter practice sets for the first major exercise.

Effort: choose a weight or variation that leaves about 1–3 controlled reps in reserve on most sets. Rest longer if you need to keep good form.

Progression: when every set reaches the top of the listed rep range with good form, add a little weight (or pick a slightly harder variation) and work back up through the range.

Choices: where two exercise options are listed, pick one and keep it for several weeks so your progress is easy to track.

The rest time for each exercise is in its notes.

At home: secure the backpack contents, use a stable chair, and skip step-ups if your step isn't sturdy. If an exercise causes pain, stop and pick a comfortable alternative.$q$) returning id into prog;

  -- Monday: Full Body A
  insert into program_days (program_id, day_number, day_label, title, rest_note)
  values (prog, 1, 'Monday', $q$Full Body A$q$, $q$About 35–55 minutes.$q$) returning id into d;
  insert into program_exercises (program_day_id, name, sets, reps, note, section, superset_group, sort_order) values
    (d, $q$Backpack Squat$q$, 3, $q$8–12$q$, $q$Rest 2 min$q$, 'workout', null, 1),
    (d, $q$Push-Up or Incline Push-Up$q$, 3, $q$8–12$q$, $q$Rest 90–120 sec$q$, 'workout', null, 2),
    (d, $q$One-Arm Backpack Row (Supported on Chair)$q$, 3, $q$8–12 per side$q$, $q$Rest 90 sec$q$, 'workout', null, 3),
    (d, $q$Backpack Romanian Deadlift$q$, 2, $q$8–12$q$, $q$Rest 2 min$q$, 'workout', null, 4),
    (d, $q$Backpack Lateral Raise or Band Pull-Apart$q$, 2, $q$12–15$q$, $q$Rest 60–90 sec$q$, 'workout', null, 5),
    (d, $q$Dead Bug$q$, 2, $q$8–10 per side$q$, $q$Rest 60 sec$q$, 'abs', null, 6);

  -- Tuesday: Full Body B
  insert into program_days (program_id, day_number, day_label, title, rest_note)
  values (prog, 2, 'Tuesday', $q$Full Body B$q$, null) returning id into d;
  insert into program_exercises (program_day_id, name, sets, reps, note, section, superset_group, sort_order) values
    (d, $q$Reverse Lunge$q$, 3, $q$8–10 per leg$q$, $q$Rest 90–120 sec$q$, 'workout', null, 1),
    (d, $q$Feet-Elevated or Standard Push-Up$q$, 3, $q$6–12$q$, $q$Rest 90–120 sec$q$, 'workout', null, 2),
    (d, $q$Backpack Bent-Over Row$q$, 3, $q$8–12$q$, $q$Rest 90 sec$q$, 'workout', null, 3),
    (d, $q$Single-Leg Glute Bridge$q$, 2, $q$8–12 per leg$q$, $q$Rest 90 sec$q$, 'workout', null, 4),
    (d, $q$Backpack Curl$q$, 2, $q$10–15$q$, $q$Rest 60–90 sec$q$, 'workout', null, 5),
    (d, $q$Side Plank$q$, 2, $q$20–40 sec per side$q$, $q$Rest 60 sec$q$, 'abs', null, 6);

  -- Thursday: Full Body C
  insert into program_days (program_id, day_number, day_label, title, rest_note)
  values (prog, 3, 'Thursday', $q$Full Body C$q$, null) returning id into d;
  insert into program_exercises (program_day_id, name, sets, reps, note, section, superset_group, sort_order) values
    (d, $q$Backpack Split Squat$q$, 3, $q$8–10 per leg$q$, $q$Rest 90–120 sec$q$, 'workout', null, 1),
    (d, $q$Pike Push-Up or Elevated Push-Up$q$, 3, $q$6–10$q$, $q$Rest 90–120 sec$q$, 'workout', null, 2),
    (d, $q$One-Arm Backpack Row (Supported on Chair)$q$, 3, $q$8–12 per side$q$, $q$Rest 90 sec$q$, 'workout', null, 3),
    (d, $q$Backpack Good Morning or Hip Hinge$q$, 2, $q$10–12$q$, $q$Rest 90 sec$q$, 'workout', null, 4),
    (d, $q$Calf Raise (Holding a Chair)$q$, 2, $q$12–20$q$, $q$Rest 60 sec$q$, 'workout', null, 5),
    (d, $q$Bird-Dog$q$, 2, $q$8–10 per side$q$, $q$Rest 60 sec$q$, 'abs', null, 6);

  -- Saturday: Full Body D
  insert into program_days (program_id, day_number, day_label, title, rest_note)
  values (prog, 4, 'Saturday', $q$Full Body D$q$, null) returning id into d;
  insert into program_exercises (program_day_id, name, sets, reps, note, section, superset_group, sort_order) values
    (d, $q$Backpack Deadlift$q$, 3, $q$8–12$q$, $q$Rest 2 min$q$, 'workout', null, 1),
    (d, $q$Push-Up or Incline Push-Up$q$, 3, $q$8–12$q$, $q$Rest 90–120 sec$q$, 'workout', null, 2),
    (d, $q$Backpack Row$q$, 3, $q$8–12$q$, $q$Rest 90 sec$q$, 'workout', null, 3),
    (d, $q$Step-Up to a Low, Sturdy Step$q$, 2, $q$8–10 per leg$q$, $q$Rest 90 sec$q$, 'workout', null, 4),
    (d, $q$Backpack Overhead Press or Light Bottle Press$q$, 2, $q$8–12$q$, $q$Rest 90 sec$q$, 'workout', null, 5),
    (d, $q$Plank$q$, 2, $q$30–45 sec$q$, $q$Rest 60 sec$q$, 'abs', null, 6);

  -- Friday: Optional: Cardio & Mobility
  insert into program_days (program_id, day_number, day_label, title, rest_note)
  values (prog, 5, 'Friday', $q$Optional: Cardio & Mobility$q$, $q$Optional day. A brisk walk, then gentle mobility.$q$) returning id into d;
  insert into program_exercises (program_day_id, name, sets, reps, note, section, superset_group, sort_order) values
    (d, $q$Brisk Walk$q$, 1, $q$20–30 min$q$, $q$Easy to moderate pace$q$, 'cardio', null, 1),
    (d, $q$Mobility Flow$q$, 1, $q$5–10 min$q$, $q$Comfortable range of motion$q$, 'stretch', null, 2);
end $$;
