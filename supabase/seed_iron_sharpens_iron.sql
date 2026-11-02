-- Faith Over Flesh — Iron Sharpens Iron
-- 8 weeks, 6 days a week, for men. Push / pull / legs twice a week:
-- Monday–Wednesday are strength days (heavy compound lifts, lower reps),
-- Thursday–Saturday are volume days (more sets and reps for size).
-- Sunday is rest.
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

delete from workout_programs where title like 'Iron Sharpens Iron%';

do $$
declare
  prog uuid;
  d uuid;
begin
  insert into workout_programs (title, description, weeks, days_per_week, level, sort_order, track, level_key, location, edition, guide)
  values (
    'Iron Sharpens Iron — 6 Days',
    'As iron sharpens iron, so one man sharpens another (Proverbs 27:17). Heavy strength days early in the week, high-volume size days at the end, and a deload to finish strong.',
    8, 6, 'Experienced', 12, 'Iron Sharpens Iron', 'experienced', 'gym', 'men',
    $q$How the 8 weeks work
Weeks 1–2, Foundation: learn your working weights. Stop most sets with 3 good reps left (RIR 3).
Weeks 3–5, Build: add weight or reps each week. Stop with about 2 reps left (RIR 2).
Weeks 6–7, Push: your heaviest weeks. Stop with 1 rep left on the last set of each lift (RIR 1). Never grind ugly reps.
Week 8, Deload: same workouts, half the sets, about 70% of your Week 7 weights. Let your body catch up and come back stronger.

Progressing: when you hit the top of the rep range on every set with clean form, add 5 lb to upper-body lifts and 10 lb to lower-body lifts next time.

Warm-up: 5 minutes of easy cardio, then 2–4 lighter ramp-up sets before your first big lift.

Sunday is rest. Walk, stretch, worship, and recover.$q$
  ) returning id into prog;

  -- Monday: Push Strength
  insert into program_days (program_id, day_number, day_label, title, rest_note)
  values (prog, 1, 'Monday', 'Push Strength: Chest, Shoulders & Triceps',
    'Strength day. Rest 2–3 minutes on bench and overhead press, 90 seconds on everything else.') returning id into d;
  insert into program_exercises (program_day_id, name, sets, reps, superset_group, note, section, sort_order) values
    (d, 'Barbell Bench Press', 4, '5–6', null, 'Use a spotter or safety arms on heavy sets', 'workout', 1),
    (d, 'Standing Overhead Press', 3, '6–8', null, 'Squeeze glutes and brace so your lower back doesn''t arch', 'workout', 2),
    (d, 'Incline Dumbbell Press', 3, '8–10', null, null, 'workout', 3),
    (d, 'Weighted Dips', 3, '8–10', null, 'Bodyweight until you can do 12 clean reps', 'workout', 4),
    (d, 'Cable Lateral Raise', 3, '12–15', 'A', null, 'workout', 5),
    (d, 'Overhead Cable Triceps Extension', 3, '10–12', 'A', null, 'workout', 6),
    (d, 'Cable Crunch', 3, '12–15', null, null, 'abs', 7);

  -- Tuesday: Pull Strength
  insert into program_days (program_id, day_number, day_label, title, rest_note)
  values (prog, 2, 'Tuesday', 'Pull Strength: Back & Biceps',
    'Strength day. Rest 3 minutes between deadlift sets, 2 minutes on pull-ups and rows.') returning id into d;
  insert into program_exercises (program_day_id, name, sets, reps, superset_group, note, section, sort_order) values
    (d, 'Conventional Deadlift', 4, '4–5', null, 'Reset every rep. Flat back, bar close to your shins', 'workout', 1),
    (d, 'Weighted Pull-Ups', 4, '6–8', null, 'Use an assisted machine or band if needed', 'workout', 2),
    (d, 'Barbell Row', 3, '6–8', null, 'Pull to your lower ribs, no body swing', 'workout', 3),
    (d, 'Face Pulls', 3, '15', null, null, 'workout', 4),
    (d, 'Barbell Curl', 3, '8–10', 'A', null, 'workout', 5),
    (d, 'Hammer Curl', 3, '10–12', 'A', null, 'workout', 6),
    (d, 'Incline Treadmill Walk', 1, '15 min', null, 'Steady pace you can hold a conversation at', 'cardio', 7);

  -- Wednesday: Legs Strength
  insert into program_days (program_id, day_number, day_label, title, rest_note)
  values (prog, 3, 'Wednesday', 'Legs Strength: Squat Focus',
    'Strength day. Rest 3 minutes between squat sets, 90 seconds to 2 minutes on the rest.') returning id into d;
  insert into program_exercises (program_day_id, name, sets, reps, superset_group, note, section, sort_order) values
    (d, 'Barbell Back Squat', 4, '5–6', null, 'Depth you can control with a neutral back. Use safety pins', 'workout', 1),
    (d, 'Romanian Deadlift', 3, '8', null, 'Push hips back, feel the hamstrings stretch', 'workout', 2),
    (d, 'Walking Lunges', 3, '10 each leg', null, null, 'workout', 3),
    (d, 'Lying Leg Curl', 3, '10–12', null, null, 'workout', 4),
    (d, 'Standing Calf Raise', 4, '10–12', null, 'Pause one second at the bottom', 'workout', 5),
    (d, 'Hanging Leg Raise', 3, '12', null, 'Bent-knee raises are fine to start', 'abs', 6);

  -- Thursday: Push Volume
  insert into program_days (program_id, day_number, day_label, title, rest_note)
  values (prog, 4, 'Thursday', 'Push Volume: Chest, Shoulders & Triceps',
    'Size day. Rest 60–90 seconds. Chase the pump and keep every rep controlled.') returning id into d;
  insert into program_exercises (program_day_id, name, sets, reps, superset_group, note, section, sort_order) values
    (d, 'Incline Barbell Bench Press', 4, '8–10', null, null, 'workout', 1),
    (d, 'Seated Dumbbell Shoulder Press', 3, '10–12', null, null, 'workout', 2),
    (d, 'Cable Fly', 3, '12–15', 'A', null, 'workout', 3),
    (d, 'Push-Ups', 3, 'to failure', 'A', 'Stop when your form breaks', 'workout', 4),
    (d, 'Dumbbell Lateral Raise', 3, '15', null, 'Last set: drop the weight and keep going', 'workout', 5),
    (d, 'Close-Grip Bench Press', 3, '8–10', 'B', null, 'workout', 6),
    (d, 'Rope Triceps Pushdown', 3, '12–15', 'B', null, 'workout', 7),
    (d, 'Plank', 3, '45 sec', null, null, 'abs', 8);

  -- Friday: Pull Volume
  insert into program_days (program_id, day_number, day_label, title, rest_note)
  values (prog, 5, 'Friday', 'Pull Volume: Back & Biceps',
    'Size day. Rest 60–90 seconds. Think about pulling with your elbows, not your hands.') returning id into d;
  insert into program_exercises (program_day_id, name, sets, reps, superset_group, note, section, sort_order) values
    (d, 'Lat Pulldown', 4, '10–12', null, null, 'workout', 1),
    (d, 'Chest-Supported Row', 3, '10–12', null, null, 'workout', 2),
    (d, 'Single-Arm Cable Row', 3, '12 each arm', null, null, 'workout', 3),
    (d, 'Reverse Pec Deck', 3, '15', null, null, 'workout', 4),
    (d, 'Dumbbell Shrugs', 3, '12', null, 'Hold the top for a second', 'workout', 5),
    (d, 'Incline Dumbbell Curl', 3, '10–12', 'A', null, 'workout', 6),
    (d, 'Cable Curl', 3, '12–15', 'A', null, 'workout', 7),
    (d, 'Stairmaster', 1, '15 min', null, 'Moderate pace', 'cardio', 8);

  -- Saturday: Legs Volume
  insert into program_days (program_id, day_number, day_label, title, rest_note)
  values (prog, 6, 'Saturday', 'Legs Volume: Quads, Hamstrings & Glutes',
    'Size day. Rest 90 seconds on the big lifts, 60 seconds on the rest. Finish with bike sprints.') returning id into d;
  insert into program_exercises (program_day_id, name, sets, reps, superset_group, note, section, sort_order) values
    (d, 'Leg Press', 4, '10–12', null, null, 'workout', 1),
    (d, 'Bulgarian Split Squat', 3, '10 each leg', null, null, 'workout', 2),
    (d, 'Leg Extension', 3, '12–15', 'A', null, 'workout', 3),
    (d, 'Seated Leg Curl', 3, '12–15', 'A', null, 'workout', 4),
    (d, 'Barbell Hip Thrust', 3, '10', null, null, 'workout', 5),
    (d, 'Seated Calf Raise', 4, '15', null, null, 'workout', 6),
    (d, 'Ab Wheel Rollout', 3, '10', null, 'From your knees. Stop before your lower back sags', 'abs', 7),
    (d, 'Bike Sprints', 1, '10 min', null, '20 seconds all-out, 40 seconds easy, 10 rounds', 'cardio', 8);
end $$;
