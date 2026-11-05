-- Fidoryn — Unbreakable Kingdom
-- Expert upper/lower plan, 6 days a week (Monday–Saturday), at the gym or at home.
-- Each half of the body gets a strength, hypertrophy, and volume day every week.
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

delete from workout_programs where title like 'Unbreakable Kingdom%';

do $$
declare
  prog uuid;
  d uuid;
begin

  insert into workout_programs (title, description, weeks, days_per_week, level, sort_order, track, level_key, location, edition, guide)
  values ($q$Unbreakable Kingdom — 6 Days · Gym$q$, $q$We are receiving a kingdom that cannot be shaken (Hebrews 12:28). Six days of upper/lower training at the gym: a strength day, a hypertrophy day, and a volume day for each half of your body every week.$q$, 12, 6, $q$Experienced$q$, 15, $q$Unbreakable Kingdom$q$, 'experienced', 'gym', 'men', $q$Warm-up: start each workout with 5–10 minutes of easy movement, then do 2–4 lighter ramp-up sets before the first demanding lift.

Effort: keep most working sets about 1–3 reps short of failure. Don't grind reps on squats, deadlifts, presses, or unsupported rows.

Progression: once every set reaches the top of its rep range with controlled form, increase the resistance slightly. At home, add backpack weight, use a stronger band, or choose a harder variation.

Recovery: Sunday is rest. If performance, sleep, or soreness gets worse for several sessions, reduce the load or drop a set for a while.

The rest time for each exercise is in its notes.$q$) returning id into prog;

  -- Monday: Upper A: Strength
  insert into program_days (program_id, day_number, day_label, title, rest_note)
  values (prog, 1, 'Monday', $q$Upper A: Strength$q$, $q$About 60–90 minutes. Strength day: heavy, controlled, full rest.$q$) returning id into d;
  insert into program_exercises (program_day_id, name, sets, reps, note, section, superset_group, sort_order) values
    (d, $q$Barbell Bench Press$q$, 4, $q$4–6$q$, $q$Rest 3 min$q$, 'workout', null, 1),
    (d, $q$Weighted Pull-Up or Heavy Lat Pulldown$q$, 4, $q$5–8$q$, $q$Rest 2–3 min$q$, 'workout', null, 2),
    (d, $q$Barbell Overhead Press$q$, 3, $q$5–8$q$, $q$Rest 2–3 min$q$, 'workout', null, 3),
    (d, $q$Barbell or Chest-Supported Row$q$, 3, $q$6–8$q$, $q$Rest 2 min$q$, 'workout', null, 4),
    (d, $q$Cable Lateral Raise$q$, 3, $q$12–15$q$, $q$Rest 60–90 sec$q$, 'workout', null, 5),
    (d, $q$Cable Triceps Pressdown$q$, 2, $q$10–15$q$, $q$Rest 60–90 sec$q$, 'workout', null, 6);

  -- Tuesday: Lower A: Strength
  insert into program_days (program_id, day_number, day_label, title, rest_note)
  values (prog, 2, 'Tuesday', $q$Lower A: Strength$q$, $q$Strength day: heavy, controlled, full rest.$q$) returning id into d;
  insert into program_exercises (program_day_id, name, sets, reps, note, section, superset_group, sort_order) values
    (d, $q$Back Squat$q$, 4, $q$4–6$q$, $q$Rest 3 min$q$, 'workout', null, 1),
    (d, $q$Romanian Deadlift$q$, 3, $q$6–8$q$, $q$Rest 2–3 min$q$, 'workout', null, 2),
    (d, $q$Leg Press$q$, 3, $q$8–10$q$, $q$Rest 2 min$q$, 'workout', null, 3),
    (d, $q$Seated Leg Curl$q$, 3, $q$8–12$q$, $q$Rest 90 sec$q$, 'workout', null, 4),
    (d, $q$Standing Calf Raise$q$, 3, $q$8–12$q$, $q$Rest 60–90 sec$q$, 'workout', null, 5),
    (d, $q$Ab-Wheel Rollout$q$, 3, $q$8–12$q$, $q$Rest 60–90 sec$q$, 'abs', null, 6);

  -- Wednesday: Upper B: Hypertrophy
  insert into program_days (program_id, day_number, day_label, title, rest_note)
  values (prog, 3, 'Wednesday', $q$Upper B: Hypertrophy$q$, $q$Hypertrophy day: moderate weight, more reps, chase the muscle.$q$) returning id into d;
  insert into program_exercises (program_day_id, name, sets, reps, note, section, superset_group, sort_order) values
    (d, $q$Incline Dumbbell Press$q$, 4, $q$8–12$q$, $q$Rest 2 min$q$, 'workout', null, 1),
    (d, $q$Chest-Supported Row$q$, 4, $q$8–12$q$, $q$Rest 2 min$q$, 'workout', null, 2),
    (d, $q$Machine Chest Press$q$, 3, $q$10–15$q$, $q$Rest 90 sec$q$, 'workout', null, 3),
    (d, $q$Neutral-Grip Lat Pulldown$q$, 3, $q$10–12$q$, $q$Rest 90 sec$q$, 'workout', null, 4),
    (d, $q$Rear-Delt Cable Fly$q$, 3, $q$12–20$q$, $q$Rest 60–90 sec$q$, 'workout', null, 5),
    (d, $q$Dumbbell Curl$q$, 3, $q$10–15$q$, $q$Rest 60–90 sec$q$, 'workout', null, 6);

  -- Thursday: Lower B: Hypertrophy
  insert into program_days (program_id, day_number, day_label, title, rest_note)
  values (prog, 4, 'Thursday', $q$Lower B: Hypertrophy$q$, $q$Hypertrophy day: moderate weight, more reps, chase the muscle.$q$) returning id into d;
  insert into program_exercises (program_day_id, name, sets, reps, note, section, superset_group, sort_order) values
    (d, $q$Hack Squat$q$, 4, $q$8–12$q$, $q$Rest 2–3 min$q$, 'workout', null, 1),
    (d, $q$Barbell Hip Thrust$q$, 3, $q$8–12$q$, $q$Rest 2 min$q$, 'workout', null, 2),
    (d, $q$Bulgarian Split Squat$q$, 3, $q$8–10 per leg$q$, $q$Rest 90–120 sec$q$, 'workout', null, 3),
    (d, $q$Lying Leg Curl$q$, 3, $q$10–15$q$, $q$Rest 90 sec$q$, 'workout', null, 4),
    (d, $q$Seated Calf Raise$q$, 4, $q$10–15$q$, $q$Rest 60–90 sec$q$, 'workout', null, 5),
    (d, $q$Cable Crunch$q$, 3, $q$10–15$q$, $q$Rest 60–90 sec$q$, 'abs', null, 6);

  -- Friday: Upper C: Volume
  insert into program_days (program_id, day_number, day_label, title, rest_note)
  values (prog, 5, 'Friday', $q$Upper C: Volume$q$, $q$Volume day: steady reps, shorter rest, finish strong.$q$) returning id into d;
  insert into program_exercises (program_day_id, name, sets, reps, note, section, superset_group, sort_order) values
    (d, $q$Close-Grip Bench Press$q$, 3, $q$6–10$q$, $q$Rest 2–3 min$q$, 'workout', null, 1),
    (d, $q$One-Arm Cable Row$q$, 3, $q$8–12 per side$q$, $q$Rest 90–120 sec$q$, 'workout', null, 2),
    (d, $q$Seated Dumbbell Shoulder Press$q$, 3, $q$8–12$q$, $q$Rest 2 min$q$, 'workout', null, 3),
    (d, $q$Assisted Pull-Up or Pulldown$q$, 3, $q$8–12$q$, $q$Rest 2 min$q$, 'workout', null, 4),
    (d, $q$Dumbbell Lateral Raise$q$, 3, $q$12–20$q$, $q$Rest 60–90 sec$q$, 'workout', null, 5),
    (d, $q$Cable Curl$q$, 3, $q$10–15$q$, $q$Rest 60–90 sec after both$q$, 'workout', $q$A$q$, 6),
    (d, $q$Overhead Triceps Extension$q$, 3, $q$10–15$q$, $q$Rest 60–90 sec after both$q$, 'workout', $q$A$q$, 7);

  -- Saturday: Lower C: Volume
  insert into program_days (program_id, day_number, day_label, title, rest_note)
  values (prog, 6, 'Saturday', $q$Lower C: Volume$q$, $q$Volume day: steady reps, shorter rest, finish strong.$q$) returning id into d;
  insert into program_exercises (program_day_id, name, sets, reps, note, section, superset_group, sort_order) values
    (d, $q$Front Squat$q$, 3, $q$6–10$q$, $q$Rest 2–3 min$q$, 'workout', null, 1),
    (d, $q$Trap-Bar Deadlift$q$, 3, $q$5–8$q$, $q$Rest 3 min$q$, 'workout', null, 2),
    (d, $q$Walking Lunge$q$, 2, $q$10–12 per leg$q$, $q$Rest 90–120 sec$q$, 'workout', null, 3),
    (d, $q$Leg Extension$q$, 3, $q$12–15$q$, $q$Rest 90 sec$q$, 'workout', null, 4),
    (d, $q$Seated Leg Curl$q$, 2, $q$12–15$q$, $q$Rest 90 sec$q$, 'workout', null, 5),
    (d, $q$Calf Press$q$, 3, $q$12–20$q$, $q$Rest 60–90 sec$q$, 'workout', null, 6),
    (d, $q$Hanging Knee Raise$q$, 3, $q$10–15$q$, $q$Rest 60–90 sec$q$, 'abs', null, 7);

  insert into workout_programs (title, description, weeks, days_per_week, level, sort_order, track, level_key, location, edition, guide)
  values ($q$Unbreakable Kingdom — 6 Days · Home$q$, $q$We are receiving a kingdom that cannot be shaken (Hebrews 12:28). The full six-day upper/lower plan built for home: adjustable dumbbells or a loaded backpack, bands, a sturdy bench or chair, and a pull-up bar if you have one.$q$, 12, 6, $q$Experienced$q$, 16, $q$Unbreakable Kingdom$q$, 'experienced', 'home', 'men', $q$Warm-up: start each workout with 5–10 minutes of easy movement, then do 2–4 lighter ramp-up sets before the first demanding lift.

Effort: keep most working sets about 1–3 reps short of failure. Don't grind reps on squats, deadlifts, presses, or unsupported rows.

Progression: once every set reaches the top of its rep range with controlled form, increase the resistance slightly. At home, add backpack weight, use a stronger band, or choose a harder variation.

Recovery: Sunday is rest. If performance, sleep, or soreness gets worse for several sessions, reduce the load or drop a set for a while.

The rest time for each exercise is in its notes.$q$) returning id into prog;

  -- Monday: Upper A: Strength
  insert into program_days (program_id, day_number, day_label, title, rest_note)
  values (prog, 1, 'Monday', $q$Upper A: Strength$q$, $q$About 45–75 minutes. Strength day: heavy, controlled, full rest.$q$) returning id into d;
  insert into program_exercises (program_day_id, name, sets, reps, note, section, superset_group, sort_order) values
    (d, $q$Weighted or Feet-Elevated Push-Up$q$, 4, $q$6–10$q$, $q$Rest 2–3 min$q$, 'workout', null, 1),
    (d, $q$Pull-Up or Band-Assisted Pull-Up$q$, 4, $q$5–8$q$, $q$Rest 2–3 min$q$, 'workout', null, 2),
    (d, $q$Dumbbell Overhead Press$q$, 3, $q$6–10$q$, $q$Rest 2 min$q$, 'workout', null, 3),
    (d, $q$One-Arm Dumbbell or Backpack Row$q$, 3, $q$8–10 per side$q$, $q$Rest 90–120 sec$q$, 'workout', null, 4),
    (d, $q$Band Lateral Raise$q$, 3, $q$12–20$q$, $q$Rest 60–90 sec$q$, 'workout', null, 5),
    (d, $q$Band Triceps Pressdown$q$, 2, $q$10–15$q$, $q$Rest 60–90 sec$q$, 'workout', null, 6);

  -- Tuesday: Lower A: Strength
  insert into program_days (program_id, day_number, day_label, title, rest_note)
  values (prog, 2, 'Tuesday', $q$Lower A: Strength$q$, $q$Strength day: heavy, controlled, full rest.$q$) returning id into d;
  insert into program_exercises (program_day_id, name, sets, reps, note, section, superset_group, sort_order) values
    (d, $q$Dumbbell or Backpack Front Squat$q$, 4, $q$6–10$q$, $q$Rest 2–3 min$q$, 'workout', null, 1),
    (d, $q$Dumbbell Romanian Deadlift$q$, 4, $q$6–10$q$, $q$Rest 2–3 min$q$, 'workout', null, 2),
    (d, $q$Bulgarian Split Squat$q$, 3, $q$8–10 per leg$q$, $q$Rest 90–120 sec$q$, 'workout', null, 3),
    (d, $q$Sliding or Band Leg Curl$q$, 3, $q$8–12$q$, $q$Rest 90 sec$q$, 'workout', null, 4),
    (d, $q$Single-Leg Calf Raise$q$, 3, $q$10–15 per leg$q$, $q$Rest 60–90 sec$q$, 'workout', null, 5),
    (d, $q$Weighted Dead Bug$q$, 3, $q$8–10 per side$q$, $q$Rest 60 sec$q$, 'abs', null, 6);

  -- Wednesday: Upper B: Hypertrophy
  insert into program_days (program_id, day_number, day_label, title, rest_note)
  values (prog, 3, 'Wednesday', $q$Upper B: Hypertrophy$q$, $q$Hypertrophy day: moderate weight, more reps, chase the muscle.$q$) returning id into d;
  insert into program_exercises (program_day_id, name, sets, reps, note, section, superset_group, sort_order) values
    (d, $q$Dumbbell Floor Press$q$, 4, $q$8–12$q$, $q$Rest 2 min$q$, 'workout', null, 1),
    (d, $q$Pull-Up or Band Pulldown$q$, 4, $q$8–12$q$, $q$Rest 2 min$q$, 'workout', null, 2),
    (d, $q$Feet-Elevated Push-Up$q$, 3, $q$8–15$q$, $q$Rest 90–120 sec$q$, 'workout', null, 3),
    (d, $q$Chest-Supported Dumbbell Row$q$, 3, $q$10–15$q$, $q$Rest 90 sec$q$, 'workout', null, 4),
    (d, $q$Band Rear-Delt Fly$q$, 3, $q$12–20$q$, $q$Rest 60–90 sec$q$, 'workout', null, 5),
    (d, $q$Dumbbell Curl$q$, 3, $q$10–15$q$, $q$Rest 60–90 sec$q$, 'workout', null, 6);

  -- Thursday: Lower B: Hypertrophy
  insert into program_days (program_id, day_number, day_label, title, rest_note)
  values (prog, 4, 'Thursday', $q$Lower B: Hypertrophy$q$, $q$Hypertrophy day: moderate weight, more reps, chase the muscle.$q$) returning id into d;
  insert into program_exercises (program_day_id, name, sets, reps, note, section, superset_group, sort_order) values
    (d, $q$Heels-Elevated Goblet Squat$q$, 4, $q$10–15$q$, $q$Rest 2 min$q$, 'workout', null, 1),
    (d, $q$Dumbbell Hip Thrust$q$, 4, $q$8–15$q$, $q$Rest 2 min$q$, 'workout', null, 2),
    (d, $q$Reverse Lunge$q$, 3, $q$10–12 per leg$q$, $q$Rest 90–120 sec$q$, 'workout', null, 3),
    (d, $q$Single-Leg Romanian Deadlift$q$, 3, $q$8–12 per leg$q$, $q$Rest 90 sec$q$, 'workout', null, 4),
    (d, $q$Seated Band Leg Curl$q$, 3, $q$12–20$q$, $q$Rest 60–90 sec$q$, 'workout', null, 5),
    (d, $q$Calf Raise on a Step$q$, 4, $q$12–20$q$, $q$Rest 60–90 sec$q$, 'workout', null, 6),
    (d, $q$Side Plank$q$, 3, $q$30–45 sec per side$q$, $q$Rest 60 sec$q$, 'abs', null, 7);

  -- Friday: Upper C: Volume
  insert into program_days (program_id, day_number, day_label, title, rest_note)
  values (prog, 5, 'Friday', $q$Upper C: Volume$q$, $q$Volume day: steady reps, shorter rest, finish strong.$q$) returning id into d;
  insert into program_exercises (program_day_id, name, sets, reps, note, section, superset_group, sort_order) values
    (d, $q$Close-Grip Push-Up$q$, 3, $q$8–15$q$, $q$Rest 90–120 sec$q$, 'workout', null, 1),
    (d, $q$One-Arm Band or Dumbbell Row$q$, 4, $q$10–15 per side$q$, $q$Rest 90 sec$q$, 'workout', null, 2),
    (d, $q$Pike Push-Up or Dumbbell Shoulder Press$q$, 3, $q$6–12$q$, $q$Rest 2 min$q$, 'workout', null, 3),
    (d, $q$Pull-Up or Band Pulldown$q$, 3, $q$8–12$q$, $q$Rest 2 min$q$, 'workout', null, 4),
    (d, $q$Band Lateral Raise$q$, 3, $q$15–20$q$, $q$Rest 60–90 sec$q$, 'workout', null, 5),
    (d, $q$Band Curl$q$, 3, $q$12–20$q$, $q$Rest 60–90 sec after both$q$, 'workout', $q$A$q$, 6),
    (d, $q$Band Triceps Extension$q$, 3, $q$12–20$q$, $q$Rest 60–90 sec after both$q$, 'workout', $q$A$q$, 7);

  -- Saturday: Lower C: Volume
  insert into program_days (program_id, day_number, day_label, title, rest_note)
  values (prog, 6, 'Saturday', $q$Lower C: Volume$q$, $q$Volume day: steady reps, shorter rest, finish strong.$q$) returning id into d;
  insert into program_exercises (program_day_id, name, sets, reps, note, section, superset_group, sort_order) values
    (d, $q$Bulgarian Split Squat$q$, 4, $q$8–12 per leg$q$, $q$Rest 2 min$q$, 'workout', null, 1),
    (d, $q$Dumbbell or Backpack Deadlift$q$, 3, $q$8–12$q$, $q$Rest 2 min$q$, 'workout', null, 2),
    (d, $q$Step-Up to a Sturdy Step$q$, 3, $q$8–12 per leg$q$, $q$Rest 90 sec$q$, 'workout', null, 3),
    (d, $q$Single-Leg Glute Bridge$q$, 3, $q$10–15 per leg$q$, $q$Rest 90 sec$q$, 'workout', null, 4),
    (d, $q$Band Leg Curl$q$, 3, $q$12–20$q$, $q$Rest 60–90 sec$q$, 'workout', null, 5),
    (d, $q$Single-Leg Calf Raise$q$, 4, $q$12–20 per leg$q$, $q$Rest 60–90 sec$q$, 'workout', null, 6),
    (d, $q$Reverse Crunch$q$, 3, $q$12–20$q$, $q$Rest 60 sec$q$, 'abs', null, 7);
end $$;
