-- Eden Strong — Supabase schema
-- Run this in the Supabase SQL editor for a fresh project.

-- User profile: onboarding selections
create table if not exists user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  path text,           -- 'postpartum' | 'mom' | 'healing' | 'strength'
  path_detail text,     -- their follow-up answer
  onboarded_at timestamptz
);

alter table user_profiles enable row level security;

create policy "Users can view their own profile"
  on user_profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on user_profiles for all
  using (auth.uid() = id);

-- Structured workout programs (publicly readable catalog)
create table if not exists workout_programs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  weeks int not null,
  days_per_week int not null,
  level text,           -- e.g. 'Beginner', 'Intermediate'
  path text,             -- which onboarding path this program targets, if any
  sort_order int default 0
);

alter table workout_programs enable row level security;

create policy "Anyone can read programs"
  on workout_programs for select
  using (true);

-- Individual scheduled days within a program
create table if not exists program_days (
  id uuid primary key default gen_random_uuid(),
  program_id uuid references workout_programs(id) on delete cascade,
  day_number int not null,
  title text
);

alter table program_days enable row level security;

create policy "Anyone can read program days"
  on program_days for select
  using (true);

-- Exercises within a given program day
create table if not exists program_exercises (
  id uuid primary key default gen_random_uuid(),
  program_day_id uuid references program_days(id) on delete cascade,
  name text not null,
  sets int,
  reps text,             -- text to allow ranges like "8-12" or "to failure"
  superset_group text,    -- e.g. 'A', 'B' — exercises sharing a letter are performed as a superset
  sort_order int default 0
);

alter table program_exercises enable row level security;

create policy "Anyone can read program exercises"
  on program_exercises for select
  using (true);

-- A user's enrollment in a program, tracking current progress
create table if not exists program_enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  program_id uuid references workout_programs(id) on delete cascade,
  current_day int default 1,
  active boolean default true,
  started_at timestamptz default now()
);

alter table program_enrollments enable row level security;

create policy "Users manage their own enrollments"
  on program_enrollments for all
  using (auth.uid() = user_id);

-- Daily devotion / Bible reading content — its own section, not tied to workout days
create table if not exists daily_devotions (
  id uuid primary key default gen_random_uuid(),
  day_number int not null unique,  -- sequential day in the devotion library, cycles or extends over time
  scripture_ref text not null,      -- e.g. 'Psalm 46:1-3'
  scripture_text text not null,     -- KJV (public domain) text of the passage
  reflection text not null,         -- short devotional writing tying the passage to strength/renewal
  prompt text,                      -- a short question for personal reflection/journaling
  path text                         -- optional: target a specific onboarding path, null = for everyone
);

alter table daily_devotions enable row level security;

create policy "Anyone can read devotions"
  on daily_devotions for select
  using (true);

-- Tracks which devotion day each user is on + a log of completions
create table if not exists devotion_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade unique,
  current_day int default 1,
  last_completed_at timestamptz
);

alter table devotion_progress enable row level security;

create policy "Users manage their own devotion progress"
  on devotion_progress for all
  using (auth.uid() = user_id);

-- ── Nutrition ────────────────────────────────────────────────────────────

create table if not exists nutrition_goals (
  user_id uuid primary key references auth.users(id) on delete cascade,
  calories int not null default 0,
  protein int not null default 0,
  fat int not null default 0,
  carbs int not null default 0
);

alter table nutrition_goals enable row level security;

create policy "Users manage their own nutrition goals"
  on nutrition_goals for all
  using (auth.uid() = user_id);

create table if not exists meal_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  calories int default 0,
  protein int default 0,
  fat int default 0,
  carbs int default 0,
  log_date date not null,       -- the calendar day this meal counts toward
  logged_at timestamptz default now()
);

alter table meal_logs enable row level security;

create policy "Users manage their own meal logs"
  on meal_logs for all
  using (auth.uid() = user_id);

-- Publicly readable recipe catalog
create table if not exists recipes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  calories int,
  protein numeric,
  fat numeric,
  carbs numeric,
  ingredients text,
  directions text
);

alter table recipes enable row level security;

create policy "Anyone can read recipes"
  on recipes for select
  using (true);

-- ── Community ────────────────────────────────────────────────────────────

create table if not exists community_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  author_name text,
  content text not null,
  created_at timestamptz default now()
);

alter table community_posts enable row level security;

create policy "Anyone can read posts"
  on community_posts for select
  using (true);

create policy "Users can create their own posts"
  on community_posts for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own posts"
  on community_posts for delete
  using (auth.uid() = user_id);

create table if not exists post_likes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references community_posts(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  unique (post_id, user_id)
);

alter table post_likes enable row level security;

create policy "Anyone can read likes"
  on post_likes for select
  using (true);

create policy "Users manage their own likes"
  on post_likes for all
  using (auth.uid() = user_id);

create table if not exists post_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references community_posts(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  author_name text,
  content text not null,
  created_at timestamptz default now()
);

alter table post_comments enable row level security;

create policy "Anyone can read comments"
  on post_comments for select
  using (true);

create policy "Users can create their own comments"
  on post_comments for insert
  with check (auth.uid() = user_id);

-- ── Progress ─────────────────────────────────────────────────────────────

-- Generic metric tracker — powers "My Charts" (weight, measurements, anything)
create table if not exists metric_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  metric_name text not null,
  value numeric not null,
  log_date date not null
);

alter table metric_logs enable row level security;

create policy "Users manage their own metric logs"
  on metric_logs for all
  using (auth.uid() = user_id);

create table if not exists personal_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  exercise_name text not null,
  weight numeric not null,
  achieved_at timestamptz default now()
);

alter table personal_records enable row level security;

create policy "Users manage their own PRs"
  on personal_records for all
  using (auth.uid() = user_id);

-- ── Habits ───────────────────────────────────────────────────────────────

create table if not exists habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  sort_order int default 0
);

alter table habits enable row level security;

create policy "Users manage their own habits"
  on habits for all
  using (auth.uid() = user_id);

create table if not exists habit_completions (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid references habits(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  completed_date date not null,
  unique (habit_id, completed_date)
);

alter table habit_completions enable row level security;

create policy "Users manage their own habit completions"
  on habit_completions for all
  using (auth.uid() = user_id);

-- Free-form workout log entries
create table if not exists workout_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  note text,
  feeling text,
  logged_at timestamptz default now()
);

alter table workout_logs enable row level security;

create policy "Users manage their own logs"
  on workout_logs for all
  using (auth.uid() = user_id);
