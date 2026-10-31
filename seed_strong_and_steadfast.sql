-- Eden Strong — Strong & Steadfast
-- 12-week hypertrophy program: push / pull / legs, twice each week.
-- Monday Push A, Tuesday Pull A, Wednesday Legs A, Thursday Push B,
-- Friday Pull B, Saturday Legs B. Sunday is rest: easy walk, stretching, meal prep.
-- Run once in the Supabase SQL Editor (it's also part of setup_programs_and_tracking.sql).
-- Safe to run again: it replaces any earlier copy (anyone enrolled would pick it again).

alter table workout_programs  add column if not exists guide text;
alter table workout_programs  add column if not exists core_note text;
alter table workout_programs  add column if not exists track text;
alter table workout_programs  add column if not exists level_key text;
alter table workout_programs  add column if not exists location text default 'gym';
alter table workout_programs  add column if not exists image text;
alter table program_days      add column if not exists day_label text;
alter table program_days      add column if not exists rest_note text;
alter table program_days      add column if not exists focus_note text;
alter table program_exercises add column if not exists note text;
alter table program_exercises add column if not exists section text default 'workout';

delete from workout_programs where title like 'Strong & Steadfast%';

do $$
declare
  prog uuid;
  d uuid;
begin
  insert into workout_programs (title, description, weeks, days_per_week, level, sort_order, track, level_key, location, guide)
  values (
    'Strong & Steadfast — 6 Days',
    'Two push, two pull, and two leg days with cardio built in. Built for growing muscle, so eat enough to fuel it.',
    12, 6, 'Experienced', 11, 'Strong & Steadfast', 'experienced', 'gym',
    $q$RIR means reps in reserve: how many more good reps you could still do at the end of a set. RIR 2 means stop with about two left in the tank. RIR 0–1 means you're right at the edge.

Warm-up sets on your first big lift: 10 light reps, 6 moderate, 3 heavier, then start your working sets.

Go up in weight when you hit the top of the rep range with good form.

Sunday is rest: an easy walk, stretching, and meal prep.$q$
  ) returning id into prog;


  -- Monday: Push A
  insert into program_days (program_id, day_number, day_label, title, rest_note)
  values (prog, 1, 'Monday', $q$Push A$q$, $q$Chest, shoulders, triceps. Warm-up (5 min): arm circles, band pull-aparts, shoulder rotations, light chest stretch, 2–3 min easy treadmill.$q$) returning id into d;
  insert into program_exercises (program_day_id, name, sets, reps, note, section, sort_order) values
    (d, $q$Bench Press / Machine Chest Press$q$, 3, $q$6–8$q$, $q$RIR 2, rest 3 min. Warm-up sets: 10 light, 6 moderate, 3 heavier$q$, 'workout', 1),
    (d, $q$Incline Dumbbell Press$q$, 3, $q$8–10$q$, $q$RIR 2, rest 2–3 min$q$, 'workout', 2),
    (d, $q$Cable / Machine Fly$q$, 2, $q$10–15$q$, $q$RIR 1–2, rest 90 sec$q$, 'workout', 3),
    (d, $q$Machine Shoulder Press$q$, 2, $q$8–12$q$, $q$RIR 2, rest 2 min$q$, 'workout', 4),
    (d, $q$Cable Lateral Raise$q$, 3, $q$12–20$q$, $q$RIR 1, rest 60–90 sec$q$, 'workout', 5),
    (d, $q$Triceps Pressdown$q$, 3, $q$10–15$q$, $q$RIR 1–2, rest 90 sec$q$, 'workout', 6),
    (d, $q$Incline Treadmill Walk$q$, 1, $q$15–20 min$q$, $q$Moderate pace: able to talk, but definitely working.$q$, 'cardio', 200);

  -- Tuesday: Pull A
  insert into program_days (program_id, day_number, day_label, title, rest_note)
  values (prog, 2, 'Tuesday', $q$Pull A$q$, $q$Back, rear delts, biceps. Hourglass upper-body focus. Warm-up (5 min): band rows, lat stretch, shoulder circles, easy treadmill.$q$) returning id into d;
  insert into program_exercises (program_day_id, name, sets, reps, note, section, sort_order) values
    (d, $q$Lat Pulldown$q$, 3, $q$6–10$q$, $q$RIR 2, rest 2–3 min$q$, 'workout', 1),
    (d, $q$Chest-Supported Row$q$, 3, $q$6–10$q$, $q$RIR 2, rest 2–3 min$q$, 'workout', 2),
    (d, $q$1-Arm Cable Lat Pulldown$q$, 2, $q$8–12 each side$q$, $q$RIR 1–2, rest 90 sec$q$, 'workout', 3),
    (d, $q$Seated Cable Row$q$, 2, $q$8–12$q$, $q$RIR 1–2, rest 2 min$q$, 'workout', 4),
    (d, $q$Reverse Pec Deck$q$, 3, $q$12–20$q$, $q$RIR 1, rest 60–90 sec$q$, 'workout', 5),
    (d, $q$Incline Dumbbell Curl$q$, 2, $q$8–12$q$, $q$RIR 1–2, rest 90 sec$q$, 'workout', 6),
    (d, $q$Incline Treadmill or Stair Climber$q$, 1, $q$15–20 min$q$, null, 'cardio', 200);

  -- Wednesday: Legs A
  insert into program_days (program_id, day_number, day_label, title, rest_note)
  values (prog, 3, 'Wednesday', $q$Legs A$q$, $q$Quads, glutes, hamstrings. Quad + glute focus Go up in weight. Warm-up (7 min): 3–5 min treadmill, bodyweight squats × 10, glute bridges × 15, leg swings × 10 each, hip circles, walking lunges.$q$) returning id into d;
  insert into program_exercises (program_day_id, name, sets, reps, note, section, sort_order) values
    (d, $q$Hip Thrust$q$, 3, $q$8–10$q$, $q$RIR 2, rest 1:30. Warm-up sets: 10 light, 6 moderate, 3 heavier$q$, 'workout', 1),
    (d, $q$Leg Press$q$, 3, $q$8–12$q$, $q$RIR 2, rest 2–3 min. Feet slightly higher for more glutes$q$, 'workout', 2),
    (d, $q$Bulgarian Split Squat$q$, 3, $q$8–12 each leg$q$, $q$RIR 2, rest 2 min. Slight forward lean = more glutes$q$, 'workout', 3),
    (d, $q$Leg Extension$q$, 2, $q$10–15$q$, $q$RIR 1, rest 90 sec$q$, 'workout', 4),
    (d, $q$Seated / Lying Leg Curl$q$, 3, $q$10–15$q$, $q$RIR 1, rest 90 sec$q$, 'workout', 5),
    (d, $q$Hip Abduction Machine$q$, 3, $q$15–25$q$, $q$RIR 1, rest 60–90 sec. Control it, no bouncing$q$, 'workout', 6),
    (d, $q$Dead Bug$q$, 2, $q$8–10 each side$q$, null, 'abs', 7),
    (d, $q$Ab Crunch Machine$q$, 2, $q$10–15$q$, null, 'abs', 8),
    (d, $q$Easy Incline Treadmill Walk$q$, 1, $q$10–15 min$q$, $q$Incline 11 at speed 3. Keep it easier after leg day.$q$, 'cardio', 200);

  -- Thursday: Push B
  insert into program_days (program_id, day_number, day_label, title, rest_note)
  values (prog, 4, 'Thursday', $q$Push B$q$, $q$Shoulders, chest, triceps. Hourglass shoulder focus. Warm-up: 5 minutes.$q$) returning id into d;
  insert into program_exercises (program_day_id, name, sets, reps, note, section, sort_order) values
    (d, $q$Incline Machine Press$q$, 3, $q$6–10$q$, $q$RIR 2, rest 1:30$q$, 'workout', 1),
    (d, $q$Machine Chest Press$q$, 2, $q$8–12$q$, $q$RIR 1–2, rest 1:30$q$, 'workout', 2),
    (d, $q$Machine Shoulder Press$q$, 3, $q$8–12$q$, $q$RIR 1–2, rest 1:30$q$, 'workout', 3),
    (d, $q$Cable Lateral Raise$q$, 4, $q$12–20$q$, $q$RIR 1, rest 60–90 sec$q$, 'workout', 4),
    (d, $q$Cable Fly$q$, 2, $q$10–15$q$, $q$RIR 1, rest 90 sec$q$, 'workout', 5),
    (d, $q$Overhead Cable Triceps Extension$q$, 3, $q$10–15$q$, $q$RIR 1, rest 90 sec$q$, 'workout', 6),
    (d, $q$HIIT Intervals$q$, 1, $q$10–12 min$q$, $q$30 sec hard, 60 sec easy, 7–8 rounds. Bike, elliptical, rower, or treadmill.$q$, 'cardio', 200);

  -- Friday: Pull B
  insert into program_days (program_id, day_number, day_label, title, rest_note)
  values (prog, 5, 'Friday', $q$Pull B$q$, $q$Back, rear delts, biceps. V-taper / small-waist illusion. Warm-up: 5 minutes.$q$) returning id into d;
  insert into program_exercises (program_day_id, name, sets, reps, note, section, sort_order) values
    (d, $q$Neutral-Grip Lat Pulldown$q$, 3, $q$8–12$q$, $q$RIR 2, rest 2–3 min$q$, 'workout', 1),
    (d, $q$T-Bar Row / Machine Row$q$, 3, $q$6–10$q$, $q$RIR 2, rest 2–3 min$q$, 'workout', 2),
    (d, $q$1-Arm Machine / Cable Row$q$, 2, $q$8–12$q$, $q$RIR 1–2, rest 90 sec$q$, 'workout', 3),
    (d, $q$Straight-Arm Pulldown$q$, 2, $q$10–15$q$, $q$RIR 1, rest 90 sec$q$, 'workout', 4),
    (d, $q$Reverse Pec Deck$q$, 3, $q$12–20$q$, $q$RIR 1, rest 60–90 sec$q$, 'workout', 5),
    (d, $q$Preacher Curl$q$, 2, $q$8–12$q$, $q$RIR 1, rest 90 sec$q$, 'workout', 6),
    (d, $q$Hammer Curl$q$, 2, $q$10–15$q$, $q$RIR 1, rest 90 sec$q$, 'workout', 7),
    (d, $q$Incline Treadmill Walk$q$, 1, $q$20–25 min$q$, null, 'cardio', 200);

  -- Saturday: Legs B
  insert into program_days (program_id, day_number, day_label, title, rest_note)
  values (prog, 6, 'Saturday', $q$Legs B$q$, $q$Glutes, hamstrings, quads. The priority lower-body day. Warm-up (7 min): treadmill, glute bridges × 15, bodyweight RDL × 10, bodyweight Bulgarian split squats, hip circles, leg swings.$q$) returning id into d;
  insert into program_exercises (program_day_id, name, sets, reps, note, section, sort_order) values
    (d, $q$Hip Thrust / Glute Drive Machine$q$, 4, $q$6–10$q$, $q$RIR 1–2, rest 2–3 min. Pause and squeeze at the top$q$, 'workout', 1),
    (d, $q$Romanian Deadlift$q$, 3, $q$8–12$q$, $q$RIR 2, rest 3 min$q$, 'workout', 2),
    (d, $q$Bulgarian Split Squat$q$, 3, $q$8–12 each leg$q$, $q$RIR 2, rest 2 min. Longer stride, slight forward lean$q$, 'workout', 3),
    (d, $q$Leg Press$q$, 3, $q$10–15$q$, $q$RIR 1–2, rest 2 min. Higher, wider foot position$q$, 'workout', 4),
    (d, $q$Seated Leg Curl$q$, 3, $q$10–15$q$, $q$RIR 1, rest 90 sec$q$, 'workout', 5),
    (d, $q$Cable Kickback$q$, 3, $q$12–20 each leg$q$, $q$RIR 1, rest 60–90 sec$q$, 'workout', 6),
    (d, $q$Hip Abduction Machine$q$, 3, $q$15–25$q$, $q$RIR 0–1, rest 60 sec. Final set can be brutal 🍑$q$, 'workout', 7),
    (d, $q$Reverse Crunch$q$, 2, $q$10–15$q$, null, 'abs', 8),
    (d, $q$Dead Bug$q$, 2, $q$8–10 each side$q$, null, 'abs', 9),
    (d, $q$Plank$q$, 2, $q$30–45 seconds$q$, null, 'abs', 10),
    (d, $q$Easy Incline Walk$q$, 1, $q$15–20 min$q$, $q$Or 8–10 min of HIIT, only if you recovered well. The easy walk is the better pick for glute growth most weeks.$q$, 'cardio', 200);
end $$;
