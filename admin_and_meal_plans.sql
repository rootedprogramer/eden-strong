-- Eden Strong — Admin tools and meal plans
-- Run once in the Supabase SQL Editor, AFTER setup_programs_and_tracking.sql.
-- Safe to run again.
--
-- ▶ BEFORE YOU RUN: put your own login email in the line marked "YOUR EMAIL"
--   near the bottom. That makes you the first admin. You can make John an
--   admin from inside the app afterward (Admin → Members).

-- ─────────────────────────────────────────────────────────────
-- 1. Who's an admin
-- ─────────────────────────────────────────────────────────────
create table if not exists admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  added_at timestamptz default now()
);
alter table admins enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from admins where user_id = auth.uid())
$$;
grant execute on function public.is_admin() to authenticated;

drop policy if exists "Members see their own admin status" on admins;
create policy "Members see their own admin status" on admins for select
  using (user_id = auth.uid() or public.is_admin());

-- ─────────────────────────────────────────────────────────────
-- 2. Content admins can create, edit, and delete
-- ─────────────────────────────────────────────────────────────
alter table recipes add column if not exists category text;
alter table recipes add column if not exists servings text;
alter table recipes add column if not exists tip text;
alter table recipes add column if not exists sort_order int;
alter table recipes add column if not exists image text;
alter table recipes add column if not exists edition text;
alter table workout_programs add column if not exists edition text;
alter table workout_programs add column if not exists guide text;
alter table workout_programs add column if not exists core_note text;
alter table workout_programs add column if not exists track text;
alter table workout_programs add column if not exists level_key text;
alter table workout_programs add column if not exists location text default 'gym';
alter table workout_programs add column if not exists image text;
alter table program_days add column if not exists day_label text;
alter table program_days add column if not exists rest_note text;
alter table program_days add column if not exists focus_note text;
alter table program_exercises add column if not exists note text;
alter table program_exercises add column if not exists section text default 'workout';

do $$
declare t text;
begin
  foreach t in array array['workout_programs', 'program_days', 'program_exercises', 'recipes', 'exercise_media', 'daily_devotions'] loop
    if to_regclass('public.' || t) is not null then
      execute format('alter table %I enable row level security', t);
      execute format('drop policy if exists "Admins manage %s" on %I', t, t);
      execute format('create policy "Admins manage %s" on %I for all using (public.is_admin()) with check (public.is_admin())', t, t);
    end if;
  end loop;
end $$;

-- Admins can see every member's profile and program
drop policy if exists "Admins view all profiles" on user_profiles;
create policy "Admins view all profiles" on user_profiles for select using (public.is_admin());

drop policy if exists "Admins manage enrollments" on program_enrollments;
create policy "Admins manage enrollments" on program_enrollments for all
  using (public.is_admin()) with check (public.is_admin());

-- ─────────────────────────────────────────────────────────────
-- 3. Give the recipes from Tap Cook a category
-- ─────────────────────────────────────────────────────────────
update recipes set category = 'Breakfasts' where category is null and title in
  ('Veggie egg scramble', 'Berry overnight oats', 'Peanut butter banana yogurt bowl');
update recipes set category = 'Lunches' where category is null and title in
  ('Chicken avocado wraps', 'Chickpea Greek salad', 'Black bean quesadillas', 'Turkey taco bowls');
update recipes set category = 'Dinners' where category is null and title in
  ('Build-your-own burrito bowls', 'Date-night steak and roasted vegetables', 'Garlic shrimp stir-fry',
   'Lemon garlic salmon with quinoa', 'Sheet-pan chicken and sweet potatoes', 'Turkey zucchini skillet');

-- ─────────────────────────────────────────────────────────────
-- 4. Meal plans
-- ─────────────────────────────────────────────────────────────
create table if not exists meal_plans (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  edition text,                                   -- null = any edition
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now()
);

create table if not exists meal_plan_items (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references meal_plans(id) on delete cascade,
  day_number int not null check (day_number between 1 and 7),   -- 1 = Monday … 7 = Sunday
  meal text not null,                                           -- Breakfast, Snack, Lunch, Dinner, Dessert
  recipe_id uuid not null references recipes(id) on delete cascade,
  sort_order int default 0
);

create table if not exists meal_plan_assignments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_id uuid not null references meal_plans(id) on delete cascade,
  assigned_by uuid references auth.users(id) on delete set null,
  assigned_at timestamptz default now(),
  active boolean default true
);

alter table meal_plans enable row level security;
alter table meal_plan_items enable row level security;
alter table meal_plan_assignments enable row level security;

drop policy if exists "Admins manage meal plans" on meal_plans;
create policy "Admins manage meal plans" on meal_plans for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "Members see their assigned meal plan" on meal_plans;
create policy "Members see their assigned meal plan" on meal_plans for select using (
  exists (select 1 from meal_plan_assignments a where a.plan_id = meal_plans.id and a.user_id = auth.uid() and a.active)
);

drop policy if exists "Admins manage meal plan items" on meal_plan_items;
create policy "Admins manage meal plan items" on meal_plan_items for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "Members see their meal plan items" on meal_plan_items;
create policy "Members see their meal plan items" on meal_plan_items for select using (
  exists (select 1 from meal_plan_assignments a where a.plan_id = meal_plan_items.plan_id and a.user_id = auth.uid() and a.active)
);

drop policy if exists "Admins manage meal plan assignments" on meal_plan_assignments;
create policy "Admins manage meal plan assignments" on meal_plan_assignments for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "Members see their own meal plan assignment" on meal_plan_assignments;
create policy "Members see their own meal plan assignment" on meal_plan_assignments for select using (user_id = auth.uid());

-- ─────────────────────────────────────────────────────────────
-- 5. Admin actions
-- ─────────────────────────────────────────────────────────────

-- Everyone who has signed up, with their current program and meal plan
create or replace function public.admin_members()
returns table (id uuid, name text, email text, edition text, program_id uuid, program_title text, plan_id uuid, plan_title text, is_admin boolean, joined_at timestamptz)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Only admins can see the member list.';
  end if;
  return query
  select u.id, p.name, u.email::text, p.edition,
         e.program_id, wp.title,
         a.plan_id, mp.title,
         exists (select 1 from admins ad where ad.user_id = u.id),
         u.created_at
  from auth.users u
  left join user_profiles p on p.id = u.id
  left join lateral (select pe.program_id from program_enrollments pe where pe.user_id = u.id and pe.active order by pe.started_at desc limit 1) e on true
  left join workout_programs wp on wp.id = e.program_id
  left join lateral (select ma.plan_id from meal_plan_assignments ma where ma.user_id = u.id and ma.active order by ma.assigned_at desc limit 1) a on true
  left join meal_plans mp on mp.id = a.plan_id
  order by u.created_at desc;
end;
$$;
grant execute on function public.admin_members() to authenticated;

-- Put a member on a program (pass null to take them off their program)
create or replace function public.admin_assign_program(member uuid, program uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then raise exception 'Only admins can assign programs.'; end if;
  update program_enrollments set active = false where user_id = member and active;
  if program is not null then
    insert into program_enrollments (user_id, program_id, current_day, active, started_at)
    values (member, program, 1, true, now());
  end if;
end;
$$;
grant execute on function public.admin_assign_program(uuid, uuid) to authenticated;

-- Give a member a meal plan (pass null to remove it)
create or replace function public.admin_assign_meal_plan(member uuid, plan uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then raise exception 'Only admins can assign meal plans.'; end if;
  update meal_plan_assignments set active = false where user_id = member and active;
  if plan is not null then
    insert into meal_plan_assignments (user_id, plan_id, assigned_by) values (member, plan, auth.uid());
  end if;
end;
$$;
grant execute on function public.admin_assign_meal_plan(uuid, uuid) to authenticated;

-- Make someone an admin, or remove them (you can't remove yourself)
create or replace function public.admin_set_admin(member uuid, make_admin boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then raise exception 'Only admins can change admins.'; end if;
  if make_admin then
    insert into admins (user_id) values (member) on conflict do nothing;
  else
    if member = auth.uid() then raise exception 'You can’t remove yourself as an admin.'; end if;
    delete from admins where user_id = member;
  end if;
end;
$$;
grant execute on function public.admin_set_admin(uuid, boolean) to authenticated;

-- Copy a program with all its days and exercises (handy for making a
-- 4-day version from a 3-day one). Returns the new program's id.
create or replace function public.admin_duplicate_program(source uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_prog uuid;
  d record;
  new_day uuid;
begin
  if not public.is_admin() then raise exception 'Only admins can copy programs.'; end if;
  insert into workout_programs (title, description, weeks, days_per_week, level, sort_order, guide, core_note, track, level_key, location, image, edition)
  select title || ' (copy)', description, weeks, days_per_week, level, sort_order, guide, core_note, track, level_key, location, image, edition
  from workout_programs where id = source
  returning id into new_prog;

  for d in select * from program_days where program_id = source order by day_number loop
    insert into program_days (program_id, day_number, day_label, title, rest_note, focus_note)
    values (new_prog, d.day_number, d.day_label, d.title, d.rest_note, d.focus_note)
    returning id into new_day;
    insert into program_exercises (program_day_id, name, sets, reps, superset_group, note, section, sort_order)
    select new_day, name, sets, reps, superset_group, note, section, sort_order
    from program_exercises where program_day_id = d.id;
  end loop;
  return new_prog;
end;
$$;
grant execute on function public.admin_duplicate_program(uuid) to authenticated;

-- ─────────────────────────────────────────────────────────────
-- 6. Make yourself the first admin
-- ─────────────────────────────────────────────────────────────
insert into admins (user_id)
select id from auth.users where lower(email) = lower('YOUR EMAIL HERE')   -- ◀ YOUR EMAIL
on conflict do nothing;

select coalesce(string_agg(u.email, ', '), 'NO ADMINS YET: put your email in the line marked YOUR EMAIL and run again') as "Admins"
from admins a join auth.users u on u.id = a.user_id;
