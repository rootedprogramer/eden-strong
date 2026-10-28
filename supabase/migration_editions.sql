-- Eden Strong — three editions (Women / Men / Together)
-- Run this ONCE in the Supabase SQL editor, after schema.sql.
-- Safe to run on a project that already has members: everyone who signed up
-- before this came in through the women's version, so they're set to 'women'.

-- ─────────────────────────────────────────────────────────────
-- 1. Which edition each member belongs to
-- ─────────────────────────────────────────────────────────────
-- `edition` is the top-level switch: women | men | together.
-- The existing `path` column stays as the member's goal inside their edition
-- (postpartum, mom, healing, strength for Women; new goals for Men/Together).
alter table user_profiles
  add column if not exists edition text
  check (edition in ('women', 'men', 'together'));

update user_profiles set edition = 'women' where edition is null;

-- Helper: the signed-in member's edition. SECURITY DEFINER so RLS policies on
-- other tables can call it without tripping over user_profiles' own RLS.
create or replace function public.my_edition()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select edition from user_profiles where id = auth.uid()
$$;

grant execute on function public.my_edition() to authenticated;

-- ─────────────────────────────────────────────────────────────
-- 2. Completely separate community feeds
-- ─────────────────────────────────────────────────────────────
alter table community_posts add column if not exists edition text;
update community_posts set edition = 'women' where edition is null;
alter table community_posts alter column edition set not null;
alter table community_posts
  add constraint community_posts_edition_check
  check (edition in ('women', 'men', 'together'));

drop policy if exists "Anyone can read posts" on community_posts;
create policy "Members read their own edition's posts"
  on community_posts for select
  using (edition = public.my_edition());

drop policy if exists "Users can create their own posts" on community_posts;
create policy "Members post only into their own edition"
  on community_posts for insert
  with check (auth.uid() = user_id and edition = public.my_edition());

-- Likes and comments follow the post they belong to, so nobody can read
-- another edition's activity by querying these tables directly.
drop policy if exists "Anyone can read likes" on post_likes;
create policy "Members read likes in their edition"
  on post_likes for select
  using (exists (
    select 1 from community_posts p
    where p.id = post_likes.post_id and p.edition = public.my_edition()
  ));

drop policy if exists "Anyone can read comments" on post_comments;
create policy "Members read comments in their edition"
  on post_comments for select
  using (exists (
    select 1 from community_posts p
    where p.id = post_comments.post_id and p.edition = public.my_edition()
  ));

drop policy if exists "Users can create their own comments" on post_comments;
create policy "Members comment only in their edition"
  on post_comments for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from community_posts p
      where p.id = post_comments.post_id and p.edition = public.my_edition()
    )
  );

-- ─────────────────────────────────────────────────────────────
-- 3. Programs and devotions per edition
-- ─────────────────────────────────────────────────────────────
-- edition NULL = shared by all three (that's every existing row for now).
-- To make a program or devotion belong to one edition only, set its edition:
--   update workout_programs set edition = 'men' where title = '...';
alter table workout_programs add column if not exists edition text
  check (edition in ('women', 'men', 'together'));
alter table daily_devotions add column if not exists edition text
  check (edition in ('women', 'men', 'together'));

drop policy if exists "Anyone can read programs" on workout_programs;
create policy "Members read shared programs and their edition's programs"
  on workout_programs for select
  using (edition is null or edition = public.my_edition());

drop policy if exists "Anyone can read devotions" on daily_devotions;
create policy "Members read shared devotions and their edition's devotions"
  on daily_devotions for select
  using (edition is null or edition = public.my_edition());

-- ─────────────────────────────────────────────────────────────
-- 4. Couples for Eden Strong Together
-- ─────────────────────────────────────────────────────────────
-- Each spouse has their own login. One creates an invite code, the other
-- enters it, and the two accounts are linked.
create table if not exists couples (
  id uuid primary key default gen_random_uuid(),
  invite_code text unique not null
    default upper(substr(md5(random()::text || clock_timestamp()::text), 1, 6)),
  partner_a uuid not null references auth.users(id) on delete cascade,
  partner_b uuid references auth.users(id) on delete set null,
  created_at timestamptz default now()
);

create unique index if not exists couples_partner_a_once on couples (partner_a);
create unique index if not exists couples_partner_b_once on couples (partner_b);

alter table couples enable row level security;

create policy "Spouses can view their couple"
  on couples for select
  using (auth.uid() = partner_a or auth.uid() = partner_b);

create policy "Together members can start a couple"
  on couples for insert
  with check (auth.uid() = partner_a and public.my_edition() = 'together');

-- Joining goes through this function so the code can be looked up without
-- letting anyone browse other couples' codes.
create or replace function public.join_couple(code text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  c couples;
begin
  if public.my_edition() is distinct from 'together' then
    raise exception 'Only Eden Strong Together members can link as a couple.';
  end if;
  if exists (select 1 from couples where partner_a = auth.uid() or partner_b = auth.uid()) then
    raise exception 'You''re already linked or have your own invite code.';
  end if;

  select * into c from couples where invite_code = upper(trim(code)) for update;
  if c.id is null then
    raise exception 'That code wasn''t found. Double-check it with your spouse.';
  end if;
  if c.partner_b is not null then
    raise exception 'That code has already been used.';
  end if;

  update couples set partner_b = auth.uid() where id = c.id;
  return c.id;
end;
$$;

grant execute on function public.join_couple(text) to authenticated;

-- Spouses can see each other's profile (name, etc.) once linked.
create policy "Spouses can view each other's profile"
  on user_profiles for select
  using (exists (
    select 1 from couples
    where (partner_a = auth.uid() and partner_b = user_profiles.id)
       or (partner_b = auth.uid() and partner_a = user_profiles.id)
  ));
