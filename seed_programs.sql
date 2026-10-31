-- Eden Strong — seed real workout program data
-- Run this AFTER schema.sql. Builds two named challenge tracks — Rooted & Rising
-- (Foundation Track) and Vessel & Valor (Challenge Track) — at 3/4/5-day splits,
-- using the workout days already designed for each track. Vessel & Valor also
-- gets a 6-day option (not in the original source — see note below).
--
-- Rotation notes NOT modeled in this seed (manual for now — see README):
--   - Vessel & Valor 3-Day: rotate Chest/Tri + Shoulders into Day 3 every other
--     week; swap Legs/Glutes in for Legs/Quads monthly
--   - Vessel & Valor 4-Day: rotate Chest/Tri + Shoulders into Day 2 or 4 biweekly
--   - Vessel & Valor 5-Day: rotate Shoulders in for Day 5 (Chest/Tri) every other week

-- ── Helper functions: Vessel & Valor days ──────────────────────────────────

create or replace function seed_legs_quads(p_day_id uuid) returns void as $$
begin
  insert into program_exercises (program_day_id, name, sets, reps, superset_group, sort_order) values
    (p_day_id, 'Bulgarian Split Squat Jump', 4, '15 each leg', 'A', 1),
    (p_day_id, 'Loaded Seated Jump', 4, '10', 'A', 2),
    (p_day_id, 'Romanian Deadlifts', 5, '15', 'B', 3),
    (p_day_id, 'Single Leg Calf Raises', 5, '12 each leg', 'B', 4),
    (p_day_id, 'Sissy Squat', 4, '10', null, 5),
    (p_day_id, 'Alternating Single Leg Step Ups', 4, '12 each leg', 'C', 6),
    (p_day_id, 'Split Squats', 4, '10 each leg', 'C', 7),
    (p_day_id, 'Leg Extensions', 4, '20', 'D', 8),
    (p_day_id, 'Dumbbell Calf Jumps', 4, '20', 'D', 9),
    (p_day_id, '1.5 Goblet Squats', 4, '12', null, 10);
end;
$$ language plpgsql;

create or replace function seed_back_biceps(p_day_id uuid) returns void as $$
begin
  insert into program_exercises (program_day_id, name, sets, reps, superset_group, sort_order) values
    (p_day_id, 'Symmetrical Stance Row', 4, '15', 'A', 1),
    (p_day_id, 'Rear Delt Kickback', 4, '10', 'A', 2),
    (p_day_id, 'Seated Row', 4, '15', null, 3),
    (p_day_id, 'Pushup to Shoulder Tap', 4, '10', null, 4),
    (p_day_id, 'Seated Hammer Curls', 4, '12', 'B', 5),
    (p_day_id, 'Drag Curls', 4, '12', 'B', 6),
    (p_day_id, 'Zottman Curls', 4, '10', null, 7),
    (p_day_id, 'Iso Hold Bicep Curl', 4, '15 each arm', 'C', 8),
    (p_day_id, 'Straight Arm Pulldown', 4, '20', 'C', 9),
    (p_day_id, 'Cable Face Pulls', 3, '20', null, 10);
end;
$$ language plpgsql;

create or replace function seed_legs_glutes(p_day_id uuid) returns void as $$
begin
  insert into program_exercises (program_day_id, name, sets, reps, superset_group, sort_order) values
    (p_day_id, 'Jump Squats', 4, '25', 'A', 1),
    (p_day_id, 'Alternating Jumping Lunges', 4, '10', 'A', 2),
    (p_day_id, 'Feet Elevated Single Leg Glute Bridge', 5, '12 each leg', 'B', 3),
    (p_day_id, 'Deadlift Pulses', 5, '15', 'B', 4),
    (p_day_id, 'Hip Thrusts', 4, '20', null, 5),
    (p_day_id, 'Lateral Lunges', 4, '12', null, 6),
    (p_day_id, 'Dumbbell Squat to Sumo Deadlift', 4, '15', null, 7),
    (p_day_id, '1.5 Banded Goblet Squats', 4, '10', 'C', 8),
    (p_day_id, 'Banded Fire Hydrants to Donkey Kicks', 4, '10 each side', 'C', 9),
    (p_day_id, 'Hyperextensions', 4, '15', null, 10);
end;
$$ language plpgsql;

create or replace function seed_hiit_cardio(p_day_id uuid) returns void as $$
begin
  insert into program_exercises (program_day_id, name, sets, reps, superset_group, sort_order) values
    (p_day_id, 'Marching Hip Lift', 6, '30 seconds', null, 1),
    (p_day_id, 'Heisman''s', 6, '30 seconds', null, 2),
    (p_day_id, 'Plank Skiers', 6, '30 seconds', null, 3),
    (p_day_id, 'Banded Dumbbell Swing', 6, '30 seconds', null, 4),
    (p_day_id, 'Curtsy Lunge', 6, '30 seconds', null, 5),
    (p_day_id, 'Up and Down Squats', 6, '30 seconds', null, 6),
    (p_day_id, 'Burpee Tuck Jump', 6, '30 seconds', null, 7),
    (p_day_id, 'Plank Hip Dips', 6, '30 seconds', null, 8),
    (p_day_id, 'Pushup to Squat', 6, '30 seconds', null, 9),
    (p_day_id, 'Hand to Toe Touch', 6, '30 seconds', null, 10);
end;
$$ language plpgsql;

create or replace function seed_chest_triceps(p_day_id uuid) returns void as $$
begin
  insert into program_exercises (program_day_id, name, sets, reps, superset_group, sort_order) values
    (p_day_id, 'Plank Jacks', 4, '20', 'A', 1),
    (p_day_id, 'Box Jumps', 4, '10', 'A', 2),
    (p_day_id, 'Single to Double Arm Chest Press', 4, '10', 'B', 3),
    (p_day_id, 'Skull Crushers', 4, '12-15', 'B', 4),
    (p_day_id, 'Tricep Pressdowns', 4, '15', null, 5),
    (p_day_id, 'Alternating Chest Press', 3, '10 each arm', 'C', 6),
    (p_day_id, 'Cable Overhead Tricep Extension', 3, '15', 'C', 7),
    (p_day_id, 'Wide Grip Pushups', 3, '10', 'D', 8),
    (p_day_id, 'Close Grip Pushups', 3, '10', 'D', 9);
end;
$$ language plpgsql;

create or replace function seed_shoulders(p_day_id uuid) returns void as $$
begin
  insert into program_exercises (program_day_id, name, sets, reps, superset_group, sort_order) values
    (p_day_id, 'Seated Shoulder Press', 5, '10', 'A', 1),
    (p_day_id, 'Seated Lateral Raises', 5, '10', 'A', 2),
    (p_day_id, 'Single Arm Kneeling Arnold Press', 4, '10 each arm', null, 3),
    (p_day_id, 'Upright Row', 4, '15', null, 4),
    (p_day_id, 'Military Press', 4, '10', 'B', 5),
    (p_day_id, 'Front Raise', 4, '10', 'B', 6),
    (p_day_id, 'Cable Y Raise', 4, '12', 'C', 7),
    (p_day_id, 'Cable Face Pulls', 4, '20', 'C', 8),
    (p_day_id, 'Barbell Snatch', 4, '12', null, 9);
end;
$$ language plpgsql;

-- ── Helper functions: Rooted & Rising days ─────────────────────────────────

create or replace function seed_rooted_legs_glutes(p_day_id uuid) returns void as $$
begin
  insert into program_exercises (program_day_id, name, sets, reps, superset_group, sort_order) values
    (p_day_id, 'DB Squat', 4, '10', null, 1),
    (p_day_id, 'DB RDL', 4, '12', null, 2),
    (p_day_id, 'DB Hip Thrust', 3, '15', null, 3),
    (p_day_id, 'DB Walking Lunge', 3, '12 each', null, 4),
    (p_day_id, 'DB Calf Raises', 4, '15', null, 5);
end;
$$ language plpgsql;

create or replace function seed_rooted_legs(p_day_id uuid) returns void as $$
begin
  insert into program_exercises (program_day_id, name, sets, reps, superset_group, sort_order) values
    (p_day_id, 'DB Squat', 4, '10', null, 1),
    (p_day_id, 'DB Bulgarian Split Squat', 3, '10 each', null, 2),
    (p_day_id, 'DB Goodmorning', 3, '10', null, 3),
    (p_day_id, 'DB Leg Extension', 3, '12-8', null, 4),
    (p_day_id, 'DB Lying Leg Curl', 3, '12-8', null, 5),
    (p_day_id, 'DB Calf Raises', 4, '15', null, 6);
end;
$$ language plpgsql;

create or replace function seed_rooted_upper_body(p_day_id uuid) returns void as $$
begin
  insert into program_exercises (program_day_id, name, sets, reps, superset_group, sort_order) values
    (p_day_id, 'DB Seated Shoulder Press', 4, '12', null, 1),
    (p_day_id, 'DB Chest Press from Mat', 4, '10', null, 2),
    (p_day_id, 'DB Tricep Kickback', 4, '12', null, 3),
    (p_day_id, 'DB Bicep Curl', 4, '12', null, 4),
    (p_day_id, 'DB Reverse Fly', 3, '10', null, 5);
end;
$$ language plpgsql;

create or replace function seed_rooted_arms_chest_shoulders(p_day_id uuid) returns void as $$
begin
  insert into program_exercises (program_day_id, name, sets, reps, superset_group, sort_order) values
    (p_day_id, 'DB Seated Shoulder Press', 4, '12', null, 1),
    (p_day_id, 'DB Chest Press from Mat', 4, '10', null, 2),
    (p_day_id, 'DB Tricep Kickback', 4, '12', null, 3),
    (p_day_id, 'DB Bicep Curl & Underhand Front Raise', 4, '10', null, 4),
    (p_day_id, 'DB Reverse Fly', 3, '10', null, 5);
end;
$$ language plpgsql;

create or replace function seed_rooted_glutes_abs(p_day_id uuid) returns void as $$
begin
  insert into program_exercises (program_day_id, name, sets, reps, superset_group, sort_order) values
    (p_day_id, 'DB Hip Thrust', 3, '15', null, 1),
    (p_day_id, 'DB RDL', 4, '12', null, 2),
    (p_day_id, 'DB Alt Step Ups', 3, '15 each', null, 3),
    (p_day_id, 'Banded Standing Hip Abduction', 3, '20', null, 4),
    (p_day_id, 'Bicycle Abs Timed', 3, '45 seconds', 'A', 5),
    (p_day_id, 'Flutter Kicks Timed', 3, '30 seconds', 'A', 6),
    (p_day_id, 'Plank Knee Taps', 3, '30 seconds', 'A', 7);
end;
$$ language plpgsql;

create or replace function seed_rooted_back(p_day_id uuid) returns void as $$
begin
  insert into program_exercises (program_day_id, name, sets, reps, superset_group, sort_order) values
    (p_day_id, 'DB Pullover', 3, '12-10', null, 1),
    (p_day_id, 'DB Pullover Drop Set', 2, '8', null, 2),
    (p_day_id, 'DB Supinated Row', 3, '12', null, 3),
    (p_day_id, 'DB Upright Row', 3, '12', null, 4),
    (p_day_id, 'DB Hammer Curl', 3, '10', null, 5),
    (p_day_id, 'DB Single Arm Supinated Row', 3, '20', null, 6),
    (p_day_id, 'DB Reverse Fly', 4, '12', null, 7),
    (p_day_id, 'Treadmill Walk', 1, '20 min', null, 8);
end;
$$ language plpgsql;

create or replace function seed_rooted_core_conditioning(p_day_id uuid) returns void as $$
begin
  insert into program_exercises (program_day_id, name, sets, reps, superset_group, sort_order) values
    (p_day_id, 'Push Up', 3, '', 'A', 1),
    (p_day_id, 'Alt Curtsy Lunge', 3, '', 'A', 2),
    (p_day_id, 'Burpees', 3, '', 'A', 3),
    (p_day_id, 'Bicycle Abs', 3, '45 seconds', 'A', 4),
    (p_day_id, 'Squat Jumps Timed', 3, '30 seconds', 'A', 5),
    (p_day_id, 'Spider Climbers', 3, '30 seconds', 'A', 6),
    (p_day_id, 'Lying Double Leg Raise', 3, '45 seconds', 'A', 7),
    (p_day_id, 'Stairmaster', 1, '20 min', null, 8);
end;
$$ language plpgsql;

-- ── Build the programs ──────────────────────────────────────────────────────

do $$
declare
  prog_id uuid;
  day_id uuid;
begin

  -- ═══ VESSEL & VALOR — Challenge Track ═══

  insert into workout_programs (title, description, weeks, days_per_week, level, sort_order)
  values ('Vessel & Valor — 3 Days', 'This track demands more. It will test your endurance, push your limits, and build the body God designed you to inhabit.', 6, 3, 'Intermediate–Advanced', 1)
  returning id into prog_id;
  insert into program_days (program_id, day_number, title) values (prog_id, 1, 'Legs') returning id into day_id;
  perform seed_legs_quads(day_id);
  insert into program_days (program_id, day_number, title) values (prog_id, 2, 'Back & Biceps') returning id into day_id;
  perform seed_back_biceps(day_id);
  insert into program_days (program_id, day_number, title) values (prog_id, 3, 'Glutes & Lower Body') returning id into day_id;
  perform seed_legs_glutes(day_id);

  insert into workout_programs (title, description, weeks, days_per_week, level, sort_order)
  values ('Vessel & Valor — 4 Days', 'Valor is not the absence of fear — it''s showing up anyway. This track will challenge every part of you.', 6, 4, 'Intermediate–Advanced', 2)
  returning id into prog_id;
  insert into program_days (program_id, day_number, title) values (prog_id, 1, 'Legs') returning id into day_id;
  perform seed_legs_quads(day_id);
  insert into program_days (program_id, day_number, title) values (prog_id, 2, 'Back & Biceps') returning id into day_id;
  perform seed_back_biceps(day_id);
  insert into program_days (program_id, day_number, title) values (prog_id, 3, 'HIIT / Cardio') returning id into day_id;
  perform seed_hiit_cardio(day_id);
  insert into program_days (program_id, day_number, title) values (prog_id, 4, 'Glutes / Lower Body') returning id into day_id;
  perform seed_legs_glutes(day_id);

  insert into workout_programs (title, description, weeks, days_per_week, level, sort_order)
  values ('Vessel & Valor — 5 Days', 'You are the temple. Train it accordingly. This is where strength meets surrender.', 6, 5, 'Advanced', 3)
  returning id into prog_id;
  insert into program_days (program_id, day_number, title) values (prog_id, 1, 'Legs') returning id into day_id;
  perform seed_legs_quads(day_id);
  insert into program_days (program_id, day_number, title) values (prog_id, 2, 'Back & Biceps') returning id into day_id;
  perform seed_back_biceps(day_id);
  insert into program_days (program_id, day_number, title) values (prog_id, 3, 'HIIT / Cardio') returning id into day_id;
  perform seed_hiit_cardio(day_id);
  insert into program_days (program_id, day_number, title) values (prog_id, 4, 'Glutes / Lower Body') returning id into day_id;
  perform seed_legs_glutes(day_id);
  insert into program_days (program_id, day_number, title) values (prog_id, 5, 'Chest / Triceps') returning id into day_id;
  perform seed_chest_triceps(day_id);

  -- 6-day is not in the original Vessel & Valor source — this extension is
  -- ours, added for anyone wanting a full week. Reword or drop it if you'd
  -- rather stay faithful to just the 3 original day-counts.
  insert into workout_programs (title, description, weeks, days_per_week, level, sort_order)
  values ('Vessel & Valor — 6 Days', 'The full week, fully surrendered — every muscle group, every day, all in.', 6, 6, 'Advanced', 4)
  returning id into prog_id;
  insert into program_days (program_id, day_number, title) values (prog_id, 1, 'Legs') returning id into day_id;
  perform seed_legs_quads(day_id);
  insert into program_days (program_id, day_number, title) values (prog_id, 2, 'Back & Biceps') returning id into day_id;
  perform seed_back_biceps(day_id);
  insert into program_days (program_id, day_number, title) values (prog_id, 3, 'HIIT / Cardio') returning id into day_id;
  perform seed_hiit_cardio(day_id);
  insert into program_days (program_id, day_number, title) values (prog_id, 4, 'Glutes / Lower Body') returning id into day_id;
  perform seed_legs_glutes(day_id);
  insert into program_days (program_id, day_number, title) values (prog_id, 5, 'Chest / Triceps') returning id into day_id;
  perform seed_chest_triceps(day_id);
  insert into program_days (program_id, day_number, title) values (prog_id, 6, 'Shoulders') returning id into day_id;
  perform seed_shoulders(day_id);

  -- ═══ ROOTED & RISING — Foundation Track ═══

  insert into workout_programs (title, description, weeks, days_per_week, level, sort_order)
  values ('Rooted & Rising — 3 Days', 'Built on obedience and consistency. This track honors where you are and builds from the root up.', 6, 3, 'Beginner', 5)
  returning id into prog_id;
  insert into program_days (program_id, day_number, title) values (prog_id, 1, 'Legs & Glutes') returning id into day_id;
  perform seed_rooted_legs_glutes(day_id);
  insert into program_days (program_id, day_number, title) values (prog_id, 2, 'Upper Body') returning id into day_id;
  perform seed_rooted_upper_body(day_id);
  insert into program_days (program_id, day_number, title) values (prog_id, 3, 'Glutes & Abs') returning id into day_id;
  perform seed_rooted_glutes_abs(day_id);

  insert into workout_programs (title, description, weeks, days_per_week, level, sort_order)
  values ('Rooted & Rising — 4 Days', 'Four days of purposeful training. Discipline is an act of worship.', 6, 4, 'Beginner–Intermediate', 6)
  returning id into prog_id;
  insert into program_days (program_id, day_number, title) values (prog_id, 1, 'Legs') returning id into day_id;
  perform seed_rooted_legs(day_id);
  insert into program_days (program_id, day_number, title) values (prog_id, 2, 'Arms, Chest & Shoulders') returning id into day_id;
  perform seed_rooted_arms_chest_shoulders(day_id);
  insert into program_days (program_id, day_number, title) values (prog_id, 3, 'Glutes & Abs') returning id into day_id;
  perform seed_rooted_glutes_abs(day_id);
  insert into program_days (program_id, day_number, title) values (prog_id, 4, 'Back') returning id into day_id;
  perform seed_rooted_back(day_id);

  insert into workout_programs (title, description, weeks, days_per_week, level, sort_order)
  values ('Rooted & Rising — 5 Days', 'Five days of disciplined training. Her strength is not her own — it is given, and she stewards it well.', 6, 5, 'Intermediate', 7)
  returning id into prog_id;
  insert into program_days (program_id, day_number, title) values (prog_id, 1, 'Legs') returning id into day_id;
  perform seed_rooted_legs(day_id);
  insert into program_days (program_id, day_number, title) values (prog_id, 2, 'Arms, Chest & Shoulders') returning id into day_id;
  perform seed_rooted_arms_chest_shoulders(day_id);
  insert into program_days (program_id, day_number, title) values (prog_id, 3, 'Glutes & Abs') returning id into day_id;
  perform seed_rooted_glutes_abs(day_id);
  insert into program_days (program_id, day_number, title) values (prog_id, 4, 'Back') returning id into day_id;
  perform seed_rooted_back(day_id);
  insert into program_days (program_id, day_number, title) values (prog_id, 5, 'Core & Conditioning') returning id into day_id;
  perform seed_rooted_core_conditioning(day_id);

end $$;

-- Clean up helper functions — no longer needed after seeding
drop function seed_legs_quads(uuid);
drop function seed_back_biceps(uuid);
drop function seed_legs_glutes(uuid);
drop function seed_hiit_cardio(uuid);
drop function seed_chest_triceps(uuid);
drop function seed_shoulders(uuid);
drop function seed_rooted_legs_glutes(uuid);
drop function seed_rooted_legs(uuid);
drop function seed_rooted_upper_body(uuid);
drop function seed_rooted_arms_chest_shoulders(uuid);
drop function seed_rooted_glutes_abs(uuid);
drop function seed_rooted_back(uuid);
drop function seed_rooted_core_conditioning(uuid);

