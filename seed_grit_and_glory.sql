-- Eden Strong — Grit & Glory program
-- Run once in the Supabase SQL editor (after schema.sql and migration_editions.sql).
-- Safe to run again: it removes any earlier copy of Grit & Glory first
-- (anyone already enrolled in it would need to pick it again).
--
-- Adds three versions:
--   Grit & Glory — 3 Days  (Tue / Thu / Sat glute days)
--   Grit & Glory — 5 Days  (glute days plus back and upper body days)
--   Grit & Glory — 6 Days  (glute days plus back, upper body, and conditioning days)
-- Every day ends with a deep core finisher.

-- ── New columns for workout notes (used by the Today's workout screen) ──────
alter table workout_programs  add column if not exists guide text;      -- warm-up, effort, form rules
alter table workout_programs  add column if not exists core_note text;  -- how to do the core finisher
alter table program_days      add column if not exists day_label text;  -- e.g. 'Tuesday'
alter table program_days      add column if not exists rest_note text;
alter table program_days      add column if not exists focus_note text;
alter table program_exercises add column if not exists note text;       -- e.g. 'only if recovered'
alter table program_exercises add column if not exists section text default 'main'; -- 'main' or 'core'

-- ── Remove any earlier copy ─────────────────────────────────────────────────
delete from workout_programs where title like 'Grit & Glory%';

-- ── Helpers ────────────────────────────────────────────────────────────────
create or replace function gg_day(p_prog uuid, p_num int, p_label text, p_title text, p_rest text, p_focus text)
returns uuid as $$
declare d uuid;
begin
  insert into program_days (program_id, day_number, day_label, title, rest_note, focus_note)
  values (p_prog, p_num, p_label, p_title, p_rest, p_focus) returning id into d;
  return d;
end; $$ language plpgsql;

create or replace function gg_heavy(d uuid) returns void as $$
begin
  insert into program_exercises (program_day_id, name, sets, reps, superset_group, note, sort_order) values
    (d, 'Booty Builder Hip Thrust', 4, '6–10', null, 'If the machine is out, do barbell hip thrusts off a bench', 1),
    (d, 'Booty Builder Squat Machine', 3, '8–12', null, null, 2),
    (d, 'Romanian Deadlift (RDL)', 3, '8–12', null, null, 3),
    (d, 'Booty Builder Hip Abductor', 2, '15–20', null, null, 4);
end; $$ language plpgsql;

create or replace function gg_legs(d uuid) returns void as $$
begin
  insert into program_exercises (program_day_id, name, sets, reps, superset_group, note, sort_order) values
    (d, 'Leg Press', 3, '8–12', null, null, 1),
    (d, 'Booty Builder Split Squat', 2, '8–12 each leg', null, null, 2),
    (d, 'Booty Builder Deadlift', 3, '10–12', null, null, 3),
    (d, 'Booty Builder Adductor', 2, '12–15', null, null, 4);
end; $$ language plpgsql;

create or replace function gg_shape(d uuid) returns void as $$
begin
  insert into program_exercises (program_day_id, name, sets, reps, superset_group, note, sort_order) values
    (d, 'Seated Leg Curl', 3, '10–15', null, null, 1),
    (d, 'Booty Builder Lunge Machine', 2, '8–12 each leg', null, null, 2),
    (d, 'Hip Thrust Machine', 2, '10–12', null, 'Barbell hip thrusts if the machine is out', 3),
    (d, 'Cable Glute Kickbacks', 2, '12–15 each leg', null, 'Only if recovered', 4);
end; $$ language plpgsql;

create or replace function gg_back_bi(d uuid) returns void as $$
begin
  insert into program_exercises (program_day_id, name, sets, reps, superset_group, sort_order) values
    (d, 'Symmetrical Stance Row', 4, '15', 'A', 1),
    (d, 'Rear Delt Kickback', 4, '10', 'A', 2),
    (d, 'Seated Row', 4, '15', null, 3),
    (d, 'Pushup to Shoulder Tap', 4, '10', null, 4),
    (d, 'Seated Hammer Curls', 4, '12', 'B', 5),
    (d, 'Drag Curls', 4, '12', 'B', 6),
    (d, 'Zottman Curls', 4, '10', null, 7),
    (d, 'Iso Hold Bicep Curl', 4, '15 each arm', 'C', 8),
    (d, 'Straight Arm Pulldown', 4, '20', 'C', 9),
    (d, 'Cable Face Pulls', 3, '20', null, 10);
end; $$ language plpgsql;

create or replace function gg_upper(d uuid) returns void as $$
begin
  insert into program_exercises (program_day_id, name, sets, reps, superset_group, sort_order) values
    (d, 'Seated Shoulder Press', 5, '10', 'A', 1),
    (d, 'Seated Lateral Raises', 5, '10', 'A', 2),
    (d, 'Single to Double Arm Chest Press', 4, '10', null, 3),
    (d, 'Single Arm Kneeling Arnold Press', 4, '10 each arm', null, 4),
    (d, 'Alternating Chest Press', 3, '10 each arm', 'B', 5),
    (d, 'Front Raise', 4, '10', 'B', 6),
    (d, 'Cable Y Raise', 4, '12', 'C', 7),
    (d, 'Cable Face Pulls', 4, '20', 'C', 8),
    (d, 'Wide Grip Pushups', 3, '10', 'D', 9),
    (d, 'Close Grip Pushups', 3, '10', 'D', 10);
end; $$ language plpgsql;

create or replace function gg_conditioning(d uuid) returns void as $$
begin
  insert into program_exercises (program_day_id, name, sets, reps, superset_group, sort_order) values
    (d, 'Push Up', 3, 'circuit', 'A', 1),
    (d, 'Alt Curtsy Lunge', 3, 'circuit', 'A', 2),
    (d, 'Burpees', 3, 'circuit', 'A', 3),
    (d, 'Bicycle Abs', 3, '45 seconds', 'A', 4),
    (d, 'Squat Jumps', 3, '30 seconds', 'A', 5),
    (d, 'Spider Climbers', 3, '30 seconds', 'A', 6),
    (d, 'Lying Double Leg Raise', 3, '45 seconds', 'A', 7),
    (d, 'Stairmaster', 1, '20 min', null, 8);
end; $$ language plpgsql;

-- Deep core finishers: three circuits that rotate through the week
create or replace function gg_core(d uuid, which text) returns void as $$
begin
  if which = 'A' then
    insert into program_exercises (program_day_id, name, sets, reps, section, sort_order) values
      (d, 'Weighted Dead Bug', 3, '10 each side', 'core', 101),
      (d, 'Pallof Press', 3, '12 each side', 'core', 102),
      (d, 'Hollow Body Hold', 3, '30 seconds', 'core', 103);
  elsif which = 'B' then
    insert into program_exercises (program_day_id, name, sets, reps, section, sort_order) values
      (d, 'Bird Dog with 3-Second Pause', 3, '10 each side', 'core', 101),
      (d, 'Copenhagen Side Plank', 3, '20 seconds each side', 'core', 102),
      (d, 'Bear Crawl Hold', 3, '40 seconds', 'core', 103);
  else
    insert into program_exercises (program_day_id, name, sets, reps, section, sort_order) values
      (d, 'Stir the Pot', 3, '8 each direction', 'core', 101),
      (d, 'Suitcase Carry', 3, '40 steps each side', 'core', 102),
      (d, 'Slow Leg Lowers', 3, '10', 'core', 103);
  end if;
end; $$ language plpgsql;

-- ── Build both versions ─────────────────────────────────────────────────────
do $$
declare
  prog uuid;
  d uuid;
  g text := 'Warm-up: 5 minutes of easy cardio, movement prep, and 2–4 progressively heavier warm-up sets before your first major lift.

Effort: finish most working sets with 1–3 good reps left in the tank. Your final reps should be challenging, but your form shouldn’t fall apart.

Hip thrusts: pause at the top and squeeze your glutes. Don’t arch your lower back to get extra height.
Squats and leg press: use a comfortable, controlled range of motion. Keep your pelvis against the leg press backrest.
RDLs: push your hips backward, keep your spine neutral, and feel the stretch through your hamstrings and glutes.
Split squats and lunges: keep your hips level and your stance stable. Don’t force depth.
Abductions and adductions: control both directions. No bouncing your way through the reps!';
  c text := '3 rounds as a circuit, 60 seconds rest between rounds. Exhale and pull your belly button toward your spine, keep your ribs down, and keep your low back flat. If your belly domes or your back arches, shorten the hold.';
  heavy_rest text := 'Main growth day. Rest 2–3 minutes between heavy sets.';
  heavy_focus text := 'Heavy, controlled reps with a strong glute contraction.';
  legs_rest text := 'Rest 2–3 minutes on leg press, 90–120 seconds on split squats, 90 seconds on the rest.';
  legs_focus text := 'Stable positioning, full controlled reps, and progressive overload.';
  shape_rest text := 'Moderate loads, controlled movement.';
  shape_focus text := 'Glute stimulus without exhausting yourself before next week.';
begin
  -- 3 Days
  insert into workout_programs (title, description, weeks, days_per_week, level, sort_order, guide, core_note)
  values ('Grit & Glory — 3 Days', 'Heavy weight, hard sets, real progressive overload. Fewer exercises, nothing easy about them.', 6, 3, 'Experienced', 8, g, c)
  returning id into prog;
  d := gg_day(prog, 1, 'Tuesday', 'Heavy Glutes', heavy_rest, heavy_focus);           perform gg_heavy(d); perform gg_core(d, 'B');
  d := gg_day(prog, 2, 'Thursday', 'Glutes & Legs', legs_rest, legs_focus);           perform gg_legs(d);  perform gg_core(d, 'A');
  d := gg_day(prog, 3, 'Saturday', 'Glute Shape & Volume', shape_rest, shape_focus);  perform gg_shape(d); perform gg_core(d, 'C');

  -- 5 Days (Friday off; every day still ends with a deep core finisher)
  insert into workout_programs (title, description, weeks, days_per_week, level, sort_order, guide, core_note)
  values ('Grit & Glory — 5 Days', 'The glute days plus back and upper body in between, with Friday off before your Saturday glute day.', 6, 5, 'Experienced', 9, g, c)
  returning id into prog;
  d := gg_day(prog, 1, 'Monday', 'Back & Biceps', null, null);                        perform gg_back_bi(d); perform gg_core(d, 'A');
  d := gg_day(prog, 2, 'Tuesday', 'Heavy Glutes', heavy_rest, heavy_focus);           perform gg_heavy(d);   perform gg_core(d, 'B');
  d := gg_day(prog, 3, 'Wednesday', 'Shoulders & Chest', null, null);                 perform gg_upper(d);   perform gg_core(d, 'C');
  d := gg_day(prog, 4, 'Thursday', 'Glutes & Legs', legs_rest, legs_focus);           perform gg_legs(d);    perform gg_core(d, 'A');
  d := gg_day(prog, 5, 'Saturday', 'Glute Shape & Volume', shape_rest, shape_focus);  perform gg_shape(d);   perform gg_core(d, 'C');

  -- 6 Days
  insert into workout_programs (title, description, weeks, days_per_week, level, sort_order, guide, core_note)
  values ('Grit & Glory — 6 Days', 'The glute days plus back, upper body, and conditioning in between, so your lower body gets time to recover.', 6, 6, 'Experienced', 10, g, c)
  returning id into prog;
  d := gg_day(prog, 1, 'Monday', 'Back & Biceps', null, null);                        perform gg_back_bi(d);      perform gg_core(d, 'A');
  d := gg_day(prog, 2, 'Tuesday', 'Heavy Glutes', heavy_rest, heavy_focus);           perform gg_heavy(d);        perform gg_core(d, 'B');
  d := gg_day(prog, 3, 'Wednesday', 'Shoulders & Chest', null, null);                 perform gg_upper(d);        perform gg_core(d, 'C');
  d := gg_day(prog, 4, 'Thursday', 'Glutes & Legs', legs_rest, legs_focus);           perform gg_legs(d);         perform gg_core(d, 'A');
  d := gg_day(prog, 5, 'Friday', 'Core & Conditioning', null, null);                  perform gg_conditioning(d); perform gg_core(d, 'B');
  d := gg_day(prog, 6, 'Saturday', 'Glute Shape & Volume', shape_rest, shape_focus);  perform gg_shape(d);        perform gg_core(d, 'C');
end $$;

-- ── Browsing info (level and location) ──────────────────────────────────────
alter table workout_programs add column if not exists track text;
alter table workout_programs add column if not exists level_key text;
alter table workout_programs add column if not exists location text default 'gym';
alter table workout_programs add column if not exists image text;
update workout_programs set track = 'Grit & Glory', level_key = 'experienced', location = 'gym'
where title like 'Grit & Glory%';

-- ── Clean up helpers ────────────────────────────────────────────────────────
drop function gg_day(uuid, int, text, text, text, text);
drop function gg_heavy(uuid);
drop function gg_legs(uuid);
drop function gg_shape(uuid);
drop function gg_back_bi(uuid);
drop function gg_upper(uuid);
drop function gg_conditioning(uuid);
drop function gg_core(uuid, text);
