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
--   5. Adds the 24 Fuel Your Strength recipes to the Recipe Book.
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


-- ───────────────────────── seed_recipes.sql ─────────────────────────
-- Eden Strong — High-Protein Recipe Collection ("Fuel Your Strength")
-- 24 recipes: smoothies, snacks, breakfasts, lunches, dinners, and desserts.
-- Run once in the Supabase SQL Editor. Safe to run again: it replaces these
-- 24 recipes by title and leaves any other recipes alone.
-- Nutrition numbers are the collection's per-serving estimates.

alter table recipes add column if not exists category text;    -- Smoothies, Snacks, Breakfasts, Lunches, Dinners, Desserts
alter table recipes add column if not exists servings text;    -- e.g. '1 serving', '1 snack'
alter table recipes add column if not exists tip text;         -- the Eden Strong tip
alter table recipes add column if not exists sort_order int;
alter table recipes add column if not exists image text;       -- optional photo URL

delete from recipes where title in ($r$Berry Cheesecake Protein Smoothie$r$,
  $r$Chocolate Peanut Butter Banana Smoothie$r$,
  $r$Peaches & Cream Smoothie$r$,
  $r$Mocha Morning Smoothie$r$,
  $r$Cinnamon Apple Yogurt Dip$r$,
  $r$Savory Cottage Cheese Crunch Bowl$r$,
  $r$Turkey & Pickle Roll-Ups$r$,
  $r$Chocolate Strawberry Yogurt Bark$r$,
  $r$Veggie Egg-White Breakfast Scramble$r$,
  $r$Protein Overnight Oats$r$,
  $r$Breakfast Taco Plate$r$,
  $r$Lemon Blueberry Protein Pancakes$r$,
  $r$Chicken Caesar Crunch Wrap$r$,
  $r$Tuna & White Bean Lemon Salad$r$,
  $r$Turkey Taco Protein Bowl$r$,
  $r$Creamy Tomato Chickpea Chicken Soup$r$,
  $r$Garlic-Lime Chicken & Rice Plate$r$,
  $r$Turkey Meatballs with Marinara$r$,
  $r$Sheet-Pan Salmon & Potatoes$r$,
  $r$Lean Beef & Broccoli Stir-Fry$r$,
  $r$Chocolate Cheesecake Yogurt Cup$r$,
  $r$Strawberries & Vanilla Cheesecake Dip$r$,
  $r$Frozen Banana Protein Bites$r$,
  $r$Apple Cinnamon Protein Crumble for One$r$);

insert into recipes (category, sort_order, title, calories, protein, servings, ingredients, directions, tip) values
($r$Smoothies$r$, 1, $r$Berry Cheesecake Protein Smoothie$r$, 250, 30, $r$1 serving$r$,
 $r$1 cup unsweetened almond milk (or milk of choice)
¾ cup plain nonfat Greek yogurt
½ cup frozen mixed berries
½ scoop vanilla protein powder
¼ tsp vanilla extract
Ice as needed$r$,
 $r$Blend everything until creamy, adding ice or a splash of milk to adjust thickness.
Taste and add a little lemon zest for a cheesecake-style flavor.$r$,
 $r$Use frozen berries for a thick texture without needing extra sweetener.$r$),
($r$Smoothies$r$, 2, $r$Chocolate Peanut Butter Banana Smoothie$r$, 300, 30, $r$1 serving$r$,
 $r$1 cup unsweetened almond milk
1 scoop chocolate protein powder
½ medium banana, frozen
1 tsp peanut butter
1 tsp unsweetened cocoa powder
Ice$r$,
 $r$Blend until smooth.
Add a pinch of salt to bring out the chocolate-peanut flavor.$r$,
 $r$Measure the peanut butter—one teaspoon adds flavor while keeping portions predictable.$r$),
($r$Smoothies$r$, 3, $r$Peaches & Cream Smoothie$r$, 240, 28, $r$1 serving$r$,
 $r$¾ cup nonfat Greek yogurt
¾ cup frozen peaches
½ cup unsweetened milk of choice
½ scoop vanilla protein powder
Pinch of cinnamon$r$,
 $r$Blend until silky.
Add cold water or ice to reach your preferred consistency.$r$,
 $r$Cinnamon and ripe fruit add sweetness without much added sugar.$r$),
($r$Smoothies$r$, 4, $r$Mocha Morning Smoothie$r$, 260, 30, $r$1 serving$r$,
 $r$1 cup chilled coffee
½ cup nonfat Greek yogurt
1 scoop chocolate protein powder
½ small frozen banana
Ice$r$,
 $r$Blend all ingredients until frothy.
Use decaf coffee if you prefer to limit caffeine.$r$,
 $r$Great when you want a coffee-shop flavor at home.$r$),
($r$Snacks$r$, 5, $r$Cinnamon Apple Yogurt Dip$r$, 190, 20, $r$1 snack$r$,
 $r$¾ cup plain nonfat Greek yogurt
½ apple, sliced
Cinnamon
½ tsp honey, optional$r$,
 $r$Stir cinnamon and optional honey into yogurt.
Dip apple slices into the yogurt.$r$,
 $r$Add vanilla extract for more dessert-like flavor.$r$),
($r$Snacks$r$, 6, $r$Savory Cottage Cheese Crunch Bowl$r$, 200, 24, $r$1 snack$r$,
 $r$¾ cup low-fat cottage cheese
½ cup chopped cucumber and tomatoes
Black pepper, dill, and lemon juice
A few whole-grain crackers, optional$r$,
 $r$Top cottage cheese with vegetables and seasonings.
Serve with crackers if you want extra crunch.$r$,
 $r$Try everything-bagel seasoning or smoked paprika.$r$),
($r$Snacks$r$, 7, $r$Turkey & Pickle Roll-Ups$r$, 160, 20, $r$1 snack$r$,
 $r$3 oz sliced lean turkey
1 light cheese stick or ½ oz reduced-fat cheese
Dill pickle spears
Mustard$r$,
 $r$Spread a little mustard on turkey slices.
Wrap turkey around cheese and pickle spears.$r$,
 $r$Choose lower-sodium turkey if you are watching sodium.$r$),
($r$Snacks$r$, 8, $r$Chocolate Strawberry Yogurt Bark$r$, 150, 15, $r$1 portion$r$,
 $r$½ cup plain nonfat Greek yogurt
½ cup sliced strawberries
1 tsp mini chocolate chips
A few drops vanilla extract$r$,
 $r$Mix vanilla into yogurt and spread on parchment in a thin layer.
Scatter berries and chocolate chips over the top; freeze until firm.
Break into pieces and enjoy promptly.$r$,
 $r$Freeze in small portions so it is easy to grab.$r$),
($r$Breakfasts$r$, 9, $r$Veggie Egg-White Breakfast Scramble$r$, 250, 30, $r$1 serving$r$,
 $r$1 whole egg
¾ cup liquid egg whites
1 cup spinach, mushrooms, and peppers
Cooking spray
1 slice whole-grain toast, optional; add approx. 80–110 calories$r$,
 $r$Sauté vegetables in a nonstick pan with cooking spray.
Add egg and egg whites; scramble until fully set.
Season with pepper, garlic powder, and a little cheese if desired.$r$,
 $r$Keep the yolk for flavor and nutrients, and use egg whites to boost protein.$r$),
($r$Breakfasts$r$, 10, $r$Protein Overnight Oats$r$, 330, 30, $r$1 serving$r$,
 $r$½ cup rolled oats
½ cup nonfat Greek yogurt
½ cup milk of choice
½ scoop vanilla protein powder
½ cup berries
Cinnamon$r$,
 $r$Stir oats, yogurt, milk, protein powder, and cinnamon in a jar.
Refrigerate at least 4 hours or overnight.
Top with berries before eating.$r$,
 $r$If the mixture is too thick in the morning, loosen with a splash of milk.$r$),
($r$Breakfasts$r$, 11, $r$Breakfast Taco Plate$r$, 300, 28, $r$1 serving$r$,
 $r$1 small whole-wheat tortilla
1 egg
½ cup egg whites
¼ cup salsa
¼ cup black beans
Cilantro or hot sauce$r$,
 $r$Scramble egg and egg whites in a nonstick skillet.
Warm tortilla and fill with eggs, beans, and salsa.
Add cilantro or hot sauce.$r$,
 $r$Black beans add fiber and make the meal more satisfying.$r$),
($r$Breakfasts$r$, 12, $r$Lemon Blueberry Protein Pancakes$r$, 320, 30, $r$1 serving$r$,
 $r$½ cup low-fat cottage cheese
1 egg
⅓ cup rolled oats
½ scoop vanilla protein powder
¼ cup blueberries
Lemon zest$r$,
 $r$Blend cottage cheese, egg, oats, and protein powder until mostly smooth.
Fold in blueberries and lemon zest.
Cook small pancakes on a lightly greased nonstick skillet over medium-low heat until cooked through.$r$,
 $r$Cook small pancakes gently; protein-rich batter browns quickly.$r$),
($r$Lunches$r$, 13, $r$Chicken Caesar Crunch Wrap$r$, 380, 40, $r$1 serving$r$,
 $r$4 oz cooked chicken breast, chopped
1 high-fiber tortilla
1 cup chopped romaine
1 tbsp light Caesar dressing
1 tbsp grated Parmesan
Black pepper$r$,
 $r$Toss romaine with dressing and Parmesan.
Add chicken to tortilla, top with lettuce, fold, and toast seam-side down in a dry skillet if desired.$r$,
 $r$Add extra lettuce for volume and crunch.$r$),
($r$Lunches$r$, 14, $r$Tuna & White Bean Lemon Salad$r$, 330, 35, $r$1 serving$r$,
 $r$1 can light tuna in water, drained (about 4 oz)
½ cup rinsed cannellini beans
Chopped celery and red onion
Lemon juice
1 tsp olive oil
Parsley, pepper, and Dijon mustard$r$,
 $r$Mix tuna, beans, celery, and onion.
Dress with lemon, olive oil, Dijon, parsley, and pepper.
Serve over greens or with whole-grain toast.$r$,
 $r$Beans add fiber and make a small can of tuna more filling.$r$),
($r$Lunches$r$, 15, $r$Turkey Taco Protein Bowl$r$, 400, 38, $r$1 serving$r$,
 $r$4 oz cooked lean ground turkey
½ cup cooked rice
½ cup black beans
½ cup lettuce, tomato, and salsa
2 tbsp plain Greek yogurt
Taco seasoning$r$,
 $r$Brown turkey with taco seasoning until fully cooked.
Build a bowl with rice, beans, vegetables, and turkey.
Top with salsa and Greek yogurt.$r$,
 $r$Greek yogurt makes a tangy, protein-rich swap for sour cream.$r$),
($r$Lunches$r$, 16, $r$Creamy Tomato Chickpea Chicken Soup$r$, 360, 38, $r$1 serving$r$,
 $r$4 oz cooked shredded chicken
½ cup chickpeas, rinsed
1 cup low-sodium broth
½ cup crushed tomatoes
¼ cup plain Greek yogurt
Spinach, garlic, Italian seasoning$r$,
 $r$Simmer broth, tomatoes, garlic, chickpeas, and seasoning for 8–10 minutes.
Stir in chicken and spinach until hot and wilted.
Remove from heat; temper yogurt with a spoonful of hot broth, then stir it in gently.$r$,
 $r$Do not boil after adding yogurt, which can cause curdling.$r$),
($r$Dinners$r$, 17, $r$Garlic-Lime Chicken & Rice Plate$r$, 500, 45, $r$1 serving$r$,
 $r$5 oz cooked chicken breast
¾ cup cooked rice
1½ cups roasted or steamed vegetables
1 tsp olive oil
Lime juice, garlic, cumin, paprika$r$,
 $r$Season chicken with garlic, cumin, paprika, and lime; cook to 165°F / 74°C.
Serve with rice and vegetables tossed with measured olive oil.
Finish with fresh lime juice.$r$,
 $r$Make extra chicken and rice for an easy next-day lunch.$r$),
($r$Dinners$r$, 18, $r$Turkey Meatballs with Marinara$r$, 450, 40, $r$1 serving$r$,
 $r$5 oz lean ground turkey
2 tbsp breadcrumbs
1 tbsp egg white
Garlic, oregano, and pepper
¾ cup marinara
1 cup cooked zucchini noodles or ¾ cup cooked pasta$r$,
 $r$Mix turkey, breadcrumbs, egg white, and seasonings; form meatballs.
Bake at 400°F / 205°C until the center reaches 165°F / 74°C.
Warm in marinara and serve with zucchini noodles or pasta.$r$,
 $r$Choose pasta when you need more workout fuel; zucchini noodles keep the meal lighter.$r$),
($r$Dinners$r$, 19, $r$Sheet-Pan Salmon & Potatoes$r$, 500, 35, $r$1 serving$r$,
 $r$5 oz salmon fillet
6 oz baby potatoes, halved
1–2 cups green beans or broccoli
1 tsp olive oil
Lemon, dill, garlic, pepper$r$,
 $r$Toss potatoes and vegetables with oil and seasonings; roast at 425°F / 220°C until nearly tender.
Add salmon and lemon; roast until salmon reaches 145°F / 63°C or flakes easily.
Serve with fresh dill and lemon.$r$,
 $r$Salmon provides omega-3 fats; calorie-conscious does not mean fat-free.$r$),
($r$Dinners$r$, 20, $r$Lean Beef & Broccoli Stir-Fry$r$, 460, 38, $r$1 serving$r$,
 $r$5 oz lean sirloin, thinly sliced
2 cups broccoli
½ cup cooked rice
1 tbsp low-sodium soy sauce
Garlic, ginger, rice vinegar
1 tsp cornstarch mixed with 2 tbsp water
Cooking spray or 1 tsp oil$r$,
 $r$Sear beef in a hot pan until browned; remove briefly.
Stir-fry broccoli with garlic and ginger, adding a splash of water to steam.
Return beef to pan; add soy, vinegar, and cornstarch slurry. Simmer until glossy and beef is cooked to preference.
Serve over rice.$r$,
 $r$Slice beef thinly across the grain for a more tender result.$r$),
($r$Desserts$r$, 21, $r$Chocolate Cheesecake Yogurt Cup$r$, 180, 20, $r$1 serving$r$,
 $r$¾ cup plain nonfat Greek yogurt
1 tsp cocoa powder
½ tsp vanilla
1–2 tsp powdered sweetener or sweetener of choice
1 tsp mini chocolate chips, optional$r$,
 $r$Whisk yogurt, cocoa, vanilla, and sweetener until smooth.
Chill for 10 minutes and top with chocolate chips if using.$r$,
 $r$A little espresso powder intensifies the chocolate flavor.$r$),
($r$Desserts$r$, 22, $r$Strawberries & Vanilla Cheesecake Dip$r$, 170, 18, $r$1 serving$r$,
 $r$½ cup low-fat cottage cheese
¼ cup nonfat Greek yogurt
½ tsp vanilla
Sweetener to taste
1 cup strawberries$r$,
 $r$Blend cottage cheese, yogurt, vanilla, and sweetener until smooth.
Serve as a dip for sliced strawberries.$r$,
 $r$Blending makes cottage cheese creamy and cheesecake-like.$r$),
($r$Desserts$r$, 23, $r$Frozen Banana Protein Bites$r$, 190, 12, $r$1 serving$r$,
 $r$½ medium banana, sliced
¼ cup Greek yogurt
1 tsp peanut butter
1 tsp mini chocolate chips$r$,
 $r$Stir peanut butter into yogurt.
Sandwich a little yogurt mixture between banana slices or spoon it on top.
Sprinkle with chocolate chips and freeze until firm.$r$,
 $r$Let sit for 2–3 minutes before eating for a softer texture.$r$),
($r$Desserts$r$, 24, $r$Apple Cinnamon Protein Crumble for One$r$, 230, 18, $r$1 serving$r$,
 $r$1 small apple, diced
¼ cup rolled oats
½ scoop vanilla protein powder
1 tbsp powdered peanut butter
Cinnamon
1–2 tbsp water$r$,
 $r$Place apple and cinnamon in a small oven-safe dish with a splash of water; microwave 1–2 minutes to soften.
Mix oats, protein powder, powdered peanut butter, and enough water to make crumbs.
Scatter topping over apple and bake at 350°F / 175°C for 10–15 minutes, or until golden.$r$,
 $r$Check that the topping does not dry out; add a teaspoon of water if needed.$r$);

