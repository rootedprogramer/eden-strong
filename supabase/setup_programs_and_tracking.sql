-- ═══════════════════════════════════════════════════════════════════════════
-- Eden Strong — ONE-STEP SETUP for programs, workouts, and progress
-- Paste this whole file into the Supabase SQL Editor and click Run.
-- Safe to run more than once.
--
-- It does four things, in order:
--   1. Adds Grit & Glory (3, 5, and 6 days). Re-running resets anyone
--      enrolled in Grit & Glory back to day 1.
--   2. Sorts programs into Beginner (Rooted & Rising) and Experienced
--      (Vessel & Valor, Grit & Glory), all under Gym.
--   3. Adds workout sections, mobility and stretch moves, exercise videos,
--      and set tracking.
--   4. Adds progress charts, PR goals, and private progress photos.
-- ═══════════════════════════════════════════════════════════════════════════


-- ───────────────────────── seed_grit_and_glory.sql ─────────────────────────
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


-- ───────────────────────── program_browsing.sql ─────────────────────────
-- Eden Strong — program browsing (Programs → Gym/Home → level → sessions per week)
-- Run once in the Supabase SQL editor, after the program seed files.
-- Safe to run again.

alter table workout_programs add column if not exists track text;      -- e.g. 'Grit & Glory'
alter table workout_programs add column if not exists level_key text;  -- beginner | experienced
alter table workout_programs add column if not exists location text default 'gym'; -- gym | home
alter table workout_programs add column if not exists image text;      -- photo for the program page, e.g. '/programs/grit.jpg'

-- Track name is the part of the title before the dash: 'Grit & Glory — 5 Days' → 'Grit & Glory'
update workout_programs set track = split_part(title, ' — ', 1) where track is null;

-- Two levels. Change these if you want a different setup.
update workout_programs set level_key = 'beginner'    where track = 'Rooted & Rising';
update workout_programs set level_key = 'experienced' where track in ('Vessel & Valor', 'Grit & Glory');
update workout_programs set level_key = 'experienced' where level_key in ('intermediate', 'advanced');

-- Everything is a gym program for now. When you add home (dumbbell-only) programs:
--   update workout_programs set location = 'home' where track = 'Your Home Program';
update workout_programs set location = 'gym' where location is null;


-- ───────────────────────── workout_tracking.sql ─────────────────────────
-- Eden Strong — workout sections, exercise videos, and set tracking
-- Run once in the Supabase SQL editor, AFTER every program seed file
-- (seed_programs.sql, seed_grit_and_glory.sql). Safe to run again.
-- If you re-run a program seed later, run this file again afterward too.

-- ── 1. Sections: mobility, workout, abs, core, cardio, stretch ──────────────
alter table program_exercises add column if not exists section text default 'workout';
update program_exercises set section = 'workout' where section is null or section = 'main';

-- Cardio machines get their own Cardio section
update program_exercises set section = 'cardio'
where section = 'workout' and name ~* '(treadmill|stairmaster|elliptical|^bike|stationary bike|rower)';

-- Ab work on Glutes & Abs days becomes the Ab circuit
update program_exercises e set section = 'abs'
from program_days d
where e.program_day_id = d.id and d.title ~* 'abs' and e.section = 'workout'
  and e.name ~* '(bicycle|flutter|plank|crunch|leg raise|dead bug|hollow)';

-- ── 2. Mobility warm-up and stretch cool-down for every day ─────────────────
-- Picked by the day's focus. Edit the lists below to change them.
delete from program_exercises where section in ('mobility', 'stretch');

create or replace function es_add_bookends(d uuid, kind text) returns void as $$
declare
  mob text[][];
  str text[][];
  i int;
begin
  if kind = 'lower' then
    mob := array[['Foam Roll Quads','2','30 sec'],['Foam Roll Glutes','2','30 sec'],['Forward Leg Swings','2','30 sec'],['Lateral Leg Swings','2','30 sec'],['90/90 Hip Switches','1','30 sec']];
    str := array[['Standing Hamstring Stretch','1','30 sec'],['Standing Quad Stretch','2','30 sec'],['Pigeon Stretch','2','30 sec'],['Butterfly Stretch','1','30 sec'],['Child''s Pose','1','30 sec']];
  elsif kind = 'back' then
    mob := array[['Cat-Cow','1','30 sec'],['Wall Angels','1','30 sec'],['Neck Circles','1','30 sec'],['Band Pull-Aparts','1','15']];
    str := array[['Kneeling Lat Stretch','1','30 sec'],['Lying Spinal Twist','2','30 sec'],['Child''s Pose with Side Reach','2','30 sec']];
  elsif kind = 'full' then
    mob := array[['Jumping Jacks','1','30 sec'],['Inchworms','1','30 sec'],['World''s Greatest Stretch','1','30 sec'],['Arm Circles','1','30 sec']];
    str := array[['Cobra Stretch','1','30 sec'],['Lying Spinal Twist','2','30 sec'],['Standing Quad Stretch','1','30 sec'],['Child''s Pose','1','30 sec']];
  else -- upper body
    mob := array[['Arm Circles','1','30 sec'],['Wall Angels','1','30 sec'],['Band Pull-Aparts','1','15'],['Thread the Needle','2','30 sec']];
    str := array[['Doorway Chest Stretch','1','30 sec'],['Cross-Body Shoulder Stretch','1','30 sec'],['Bicep Wall Stretch','2','30 sec'],['Overhead Tricep Stretch','2','30 sec']];
  end if;

  for i in 1..array_length(mob, 1) loop
    insert into program_exercises (program_day_id, name, sets, reps, section, sort_order)
    values (d, mob[i][1], mob[i][2]::int, mob[i][3], 'mobility', -100 + i);
  end loop;
  for i in 1..array_length(str, 1) loop
    insert into program_exercises (program_day_id, name, sets, reps, section, sort_order)
    values (d, str[i][1], str[i][2]::int, str[i][3], 'stretch', 300 + i);
  end loop;
end; $$ language plpgsql;

do $$
declare r record;
begin
  for r in select id, coalesce(title, '') as t from program_days loop
    perform es_add_bookends(r.id,
      case
        when r.t ~* 'back' then 'back'
        when r.t ~* '(hiit|core|conditioning|cardio)' then 'full'
        when r.t ~* '(leg|glute|lower|quad)' then 'lower'
        else 'upper'
      end);
  end loop;
end $$;

drop function es_add_bookends(uuid, text);

-- ── 3. Exercise videos and thumbnails ───────────────────────────────────────
-- One row per exercise name, so the same video shows up in every program.
-- video_url can be a YouTube link or a direct video file (e.g. Supabase Storage).
create table if not exists exercise_media (
  name text primary key,
  video_url text,
  thumbnail_url text
);
alter table exercise_media enable row level security;
drop policy if exists "Members can read exercise media" on exercise_media;
create policy "Members can read exercise media" on exercise_media for select using (true);

-- ── 4. Set-by-set tracking ──────────────────────────────────────────────────
create table if not exists exercise_sets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  program_exercise_id uuid references program_exercises(id) on delete set null,
  exercise_name text not null,
  log_date date not null,
  set_number int not null,
  reps int,
  weight numeric,
  seconds int,
  done boolean default false,
  created_at timestamptz default now(),
  unique (user_id, program_exercise_id, log_date, set_number)
);
alter table exercise_sets enable row level security;
drop policy if exists "Members manage their own sets" on exercise_sets;
create policy "Members manage their own sets" on exercise_sets for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table if not exists exercise_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  program_exercise_id uuid references program_exercises(id) on delete cascade,
  log_date date not null,
  comment text,
  unique (user_id, program_exercise_id, log_date)
);
alter table exercise_notes enable row level security;
drop policy if exists "Members manage their own notes" on exercise_notes;
create policy "Members manage their own notes" on exercise_notes for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table if not exists workout_completions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  program_id uuid references workout_programs(id) on delete cascade,
  program_day_id uuid references program_days(id) on delete set null,
  completed_on date not null default current_date,
  created_at timestamptz default now()
);
alter table workout_completions enable row level security;
drop policy if exists "Members manage their own completions" on workout_completions;
create policy "Members manage their own completions" on workout_completions for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);


-- ───────────────────────── progress_tracking.sql ─────────────────────────
-- Eden Strong — Progress tab: charts, PR goals, and progress photos
-- Run once in the Supabase SQL editor (after workout_tracking.sql). Safe to run again.

-- ── Charts (Weight, Waist, Body fat…). Entries live in metric_logs. ─────────
create table if not exists progress_charts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  unit text,
  created_at timestamptz default now(),
  unique (user_id, name)
);
alter table progress_charts enable row level security;
drop policy if exists "Members manage their own charts" on progress_charts;
create policy "Members manage their own charts" on progress_charts for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Old placeholder rows the previous version created with a value of 0
delete from metric_logs where value = 0;

-- ── Goals for personal records ──────────────────────────────────────────────
create table if not exists pr_goals (
  user_id uuid not null references auth.users(id) on delete cascade,
  exercise_name text not null,
  goal numeric,
  primary key (user_id, exercise_name)
);
alter table pr_goals enable row level security;
drop policy if exists "Members manage their own PR goals" on pr_goals;
create policy "Members manage their own PR goals" on pr_goals for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ── Progress photos (private: only the member can see their own) ───────────
create table if not exists progress_photos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  path text not null,              -- location in the progress-photos storage bucket
  taken_on date not null default current_date,
  created_at timestamptz default now()
);
alter table progress_photos enable row level security;
drop policy if exists "Members manage their own photos" on progress_photos;
create policy "Members manage their own photos" on progress_photos for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

insert into storage.buckets (id, name, public)
values ('progress-photos', 'progress-photos', false)
on conflict (id) do nothing;

-- Each member's photos go in a folder named with their user id
drop policy if exists "Members upload their own progress photos" on storage.objects;
create policy "Members upload their own progress photos" on storage.objects for insert to authenticated
  with check (bucket_id = 'progress-photos' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Members view their own progress photos" on storage.objects;
create policy "Members view their own progress photos" on storage.objects for select to authenticated
  using (bucket_id = 'progress-photos' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Members delete their own progress photos" on storage.objects;
create policy "Members delete their own progress photos" on storage.objects for delete to authenticated
  using (bucket_id = 'progress-photos' and (storage.foldername(name))[1] = auth.uid()::text);

