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
