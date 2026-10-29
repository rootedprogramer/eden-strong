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
