-- Faith Over Flesh — Stronger Than Yesterday
-- 8-week beginner program for men: new to lifting or coming back after time away.
-- Two versions:
--   3 Days: full body Monday, Wednesday, Friday
--   4 Days: upper/lower Monday, Tuesday, Thursday, Friday
-- Shows only in Faith Over Flesh (edition = 'men'), under Beginner.
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

delete from workout_programs where title like 'Stronger Than Yesterday%';

do $$
declare
  prog uuid;
  d uuid;
begin

  insert into workout_programs (title, description, weeks, days_per_week, level, sort_order, track, level_key, location, edition, guide)
  values ('Stronger Than Yesterday — 3 Days', $q$Forgetting what is behind and pressing forward (Philippians 3:13-14). Three full-body days a week to build strength, confidence, and habits that last.$q$, 8, 3, 'Beginner', 13, 'Stronger Than Yesterday', 'beginner', 'gym', 'men', $q$Welcome. This program is built for men who are new to lifting or coming back after time away.

How the 8 weeks work
Weeks 1–2, Learn: use light weights and focus on form. Finish each set feeling like you could do 3–4 more good reps.
Weeks 3–6, Build: when you hit the top of the rep range on every set, add a little weight next time. Finish each set with 2–3 reps left.
Weeks 7–8, Finish strong: push a little harder, finishing sets with 1–2 good reps left. Form still comes first.

Warm-up: 5 minutes of easy cardio, then the warm-up sets listed on your first lift.

Rest 90 seconds to 2 minutes between sets. If something hurts (sharp pain, not effort), stop and swap the exercise.

Sunday is rest. Walk, stretch, worship, and recover.$q$) returning id into prog;

  -- Monday: Full Body A: Squat, Press & Pull
  insert into program_days (program_id, day_number, day_label, title, rest_note)
  values (prog, 1, 'Monday', $q$Full Body A: Squat, Press & Pull$q$, $q$Full-body day. Rest 90 seconds to 2 minutes between sets. Learn the movement before you load it.$q$) returning id into d;
  insert into program_exercises (program_day_id, name, sets, reps, note, section, superset_group, sort_order) values
    (d, $q$Goblet Squat$q$, 3, $q$8–10$q$, $q$Hold the dumbbell at your chest, sit between your heels, chest tall. Warm-up: 1 × 8 light$q$, 'workout', null, 1),
    (d, $q$Dumbbell Bench Press$q$, 3, $q$8–10$q$, $q$Lower with control to chest level, press up and slightly back$q$, 'workout', null, 2),
    (d, $q$Lat Pulldown$q$, 3, $q$10–12$q$, $q$Pull to your upper chest, lead with your elbows$q$, 'workout', null, 3),
    (d, $q$Dumbbell Romanian Deadlift$q$, 3, $q$10$q$, $q$Push your hips back, soft knees, flat back$q$, 'workout', null, 4),
    (d, $q$Seated Dumbbell Shoulder Press$q$, 2, $q$10–12$q$, null, 'workout', null, 5),
    (d, $q$Plank$q$, 3, $q$30 sec$q$, $q$Squeeze glutes, brace like someone’s about to poke your stomach$q$, 'abs', null, 6),
    (d, $q$Incline Treadmill Walk$q$, 1, $q$10 min$q$, $q$Easy to moderate pace$q$, 'cardio', null, 7);

  -- Wednesday: Full Body B: Legs, Rows & Incline
  insert into program_days (program_id, day_number, day_label, title, rest_note)
  values (prog, 2, 'Wednesday', $q$Full Body B: Legs, Rows & Incline$q$, $q$Full-body day. Rest 90 seconds to 2 minutes between sets.$q$) returning id into d;
  insert into program_exercises (program_day_id, name, sets, reps, note, section, superset_group, sort_order) values
    (d, $q$Leg Press$q$, 3, $q$10–12$q$, $q$Feet shoulder-width, lower until knees reach about 90 degrees. Warm-up: 1 × 10 light$q$, 'workout', null, 1),
    (d, $q$Seated Cable Row$q$, 3, $q$10–12$q$, $q$Sit tall, pull to your stomach, squeeze your shoulder blades$q$, 'workout', null, 2),
    (d, $q$Incline Dumbbell Press$q$, 3, $q$10$q$, null, 'workout', null, 3),
    (d, $q$Walking Lunges$q$, 2, $q$10 each leg$q$, $q$Long steps, back knee toward the floor$q$, 'workout', null, 4),
    (d, $q$Face Pulls$q$, 2, $q$15$q$, $q$Pull to your forehead, elbows high$q$, 'workout', null, 5),
    (d, $q$Dead Bug$q$, 3, $q$8 each side$q$, $q$Low back pressed into the floor$q$, 'abs', null, 6),
    (d, $q$Stationary Bike$q$, 1, $q$10 min$q$, $q$Easy pace$q$, 'cardio', null, 7);

  -- Friday: Full Body C: Hinge, Push & Arms
  insert into program_days (program_id, day_number, day_label, title, rest_note)
  values (prog, 3, 'Friday', $q$Full Body C: Hinge, Push & Arms$q$, $q$Full-body day. Rest 2 minutes on deadlifts, 90 seconds on the rest.$q$) returning id into d;
  insert into program_exercises (program_day_id, name, sets, reps, note, section, superset_group, sort_order) values
    (d, $q$Trap Bar or Dumbbell Deadlift$q$, 3, $q$6–8$q$, $q$Push the floor away, stand tall, lower with control. Warm-up: 10 light, 5 moderate$q$, 'workout', null, 1),
    (d, $q$Machine Chest Press$q$, 3, $q$10–12$q$, null, 'workout', null, 2),
    (d, $q$One-Arm Dumbbell Row$q$, 3, $q$10 each arm$q$, $q$Support yourself on a bench, pull to your hip$q$, 'workout', null, 3),
    (d, $q$Dumbbell Step-Ups$q$, 2, $q$10 each leg$q$, $q$Drive through the front heel$q$, 'workout', null, 4),
    (d, $q$Cable Lateral Raise$q$, 2, $q$12–15$q$, null, 'workout', null, 5),
    (d, $q$Dumbbell Curl$q$, 2, $q$12$q$, null, 'workout', $q$A$q$, 6),
    (d, $q$Rope Triceps Pushdown$q$, 2, $q$12$q$, null, 'workout', $q$A$q$, 7),
    (d, $q$Side Plank$q$, 2, $q$20 sec each side$q$, null, 'abs', null, 8);

  insert into workout_programs (title, description, weeks, days_per_week, level, sort_order, track, level_key, location, edition, guide)
  values ('Stronger Than Yesterday — 4 Days', $q$Forgetting what is behind and pressing forward (Philippians 3:13-14). Four days a week, upper and lower, to build strength, confidence, and habits that last.$q$, 8, 4, 'Beginner', 14, 'Stronger Than Yesterday', 'beginner', 'gym', 'men', $q$Welcome. This program is built for men who are new to lifting or coming back after time away.

How the 8 weeks work
Weeks 1–2, Learn: use light weights and focus on form. Finish each set feeling like you could do 3–4 more good reps.
Weeks 3–6, Build: when you hit the top of the rep range on every set, add a little weight next time. Finish each set with 2–3 reps left.
Weeks 7–8, Finish strong: push a little harder, finishing sets with 1–2 good reps left. Form still comes first.

Warm-up: 5 minutes of easy cardio, then the warm-up sets listed on your first lift.

Rest 90 seconds to 2 minutes between sets. If something hurts (sharp pain, not effort), stop and swap the exercise.

Sunday is rest. Walk, stretch, worship, and recover.$q$) returning id into prog;

  -- Monday: Upper A: Chest, Back & Shoulders
  insert into program_days (program_id, day_number, day_label, title, rest_note)
  values (prog, 1, 'Monday', $q$Upper A: Chest, Back & Shoulders$q$, $q$Upper day. Rest 90 seconds to 2 minutes between sets.$q$) returning id into d;
  insert into program_exercises (program_day_id, name, sets, reps, note, section, superset_group, sort_order) values
    (d, $q$Dumbbell Bench Press$q$, 3, $q$8–10$q$, $q$Warm-up: 1 × 10 light$q$, 'workout', null, 1),
    (d, $q$Lat Pulldown$q$, 3, $q$10–12$q$, $q$Pull to your upper chest, lead with your elbows$q$, 'workout', null, 2),
    (d, $q$Seated Dumbbell Shoulder Press$q$, 3, $q$10$q$, null, 'workout', null, 3),
    (d, $q$Seated Cable Row$q$, 3, $q$10–12$q$, null, 'workout', null, 4),
    (d, $q$Dumbbell Curl$q$, 2, $q$12$q$, null, 'workout', $q$A$q$, 5),
    (d, $q$Rope Triceps Pushdown$q$, 2, $q$12$q$, null, 'workout', $q$A$q$, 6),
    (d, $q$Plank$q$, 3, $q$30 sec$q$, null, 'abs', null, 7);

  -- Tuesday: Lower A: Squat & Hinge
  insert into program_days (program_id, day_number, day_label, title, rest_note)
  values (prog, 2, 'Tuesday', $q$Lower A: Squat & Hinge$q$, $q$Leg day. Rest 2 minutes on squats and RDLs, 90 seconds on the rest.$q$) returning id into d;
  insert into program_exercises (program_day_id, name, sets, reps, note, section, superset_group, sort_order) values
    (d, $q$Goblet Squat$q$, 3, $q$8–10$q$, $q$Chest tall, sit between your heels. Warm-up: 1 × 8 light$q$, 'workout', null, 1),
    (d, $q$Dumbbell Romanian Deadlift$q$, 3, $q$10$q$, $q$Push your hips back, flat back$q$, 'workout', null, 2),
    (d, $q$Leg Press$q$, 2, $q$12$q$, null, 'workout', null, 3),
    (d, $q$Lying Leg Curl$q$, 2, $q$12$q$, null, 'workout', null, 4),
    (d, $q$Standing Calf Raise$q$, 3, $q$12$q$, $q$Pause at the bottom$q$, 'workout', null, 5),
    (d, $q$Dead Bug$q$, 3, $q$8 each side$q$, null, 'abs', null, 6),
    (d, $q$Incline Treadmill Walk$q$, 1, $q$10 min$q$, $q$Easy to moderate pace$q$, 'cardio', null, 7);

  -- Thursday: Upper B: Incline, Rows & Arms
  insert into program_days (program_id, day_number, day_label, title, rest_note)
  values (prog, 3, 'Thursday', $q$Upper B: Incline, Rows & Arms$q$, $q$Upper day. Rest 90 seconds to 2 minutes between sets.$q$) returning id into d;
  insert into program_exercises (program_day_id, name, sets, reps, note, section, superset_group, sort_order) values
    (d, $q$Incline Dumbbell Press$q$, 3, $q$10$q$, $q$Warm-up: 1 × 10 light$q$, 'workout', null, 1),
    (d, $q$One-Arm Dumbbell Row$q$, 3, $q$10 each arm$q$, null, 'workout', null, 2),
    (d, $q$Machine Chest Press$q$, 2, $q$12$q$, null, 'workout', null, 3),
    (d, $q$Face Pulls$q$, 2, $q$15$q$, $q$Elbows high$q$, 'workout', null, 4),
    (d, $q$Dumbbell Lateral Raise$q$, 2, $q$15$q$, null, 'workout', null, 5),
    (d, $q$Hammer Curl$q$, 2, $q$12$q$, null, 'workout', $q$A$q$, 6),
    (d, $q$Overhead Cable Triceps Extension$q$, 2, $q$12$q$, null, 'workout', $q$A$q$, 7),
    (d, $q$Side Plank$q$, 2, $q$20 sec each side$q$, null, 'abs', null, 8);

  -- Friday: Lower B: Deadlift & Lunge
  insert into program_days (program_id, day_number, day_label, title, rest_note)
  values (prog, 4, 'Friday', $q$Lower B: Deadlift & Lunge$q$, $q$Leg day. Rest 2 minutes on deadlifts, 90 seconds on the rest.$q$) returning id into d;
  insert into program_exercises (program_day_id, name, sets, reps, note, section, superset_group, sort_order) values
    (d, $q$Trap Bar or Dumbbell Deadlift$q$, 3, $q$6–8$q$, $q$Push the floor away, stand tall. Warm-up: 10 light, 5 moderate$q$, 'workout', null, 1),
    (d, $q$Walking Lunges$q$, 2, $q$10 each leg$q$, null, 'workout', null, 2),
    (d, $q$Leg Extension$q$, 2, $q$12–15$q$, null, 'workout', null, 3),
    (d, $q$Seated Leg Curl$q$, 2, $q$12$q$, null, 'workout', null, 4),
    (d, $q$Seated Calf Raise$q$, 3, $q$15$q$, null, 'workout', null, 5),
    (d, $q$Cable Crunch$q$, 2, $q$12$q$, null, 'abs', null, 6),
    (d, $q$Stationary Bike$q$, 1, $q$10 min$q$, $q$Easy pace$q$, 'cardio', null, 7);
end $$;
