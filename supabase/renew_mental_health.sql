-- Renew: daily check-ins and a private journal.
-- Private on purpose: each member can only see their own rows. There is no admin
-- policy here, so admins cannot read anyone's check-ins or journal either.
-- Safe to run again.

create table if not exists mind_checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  check_date date not null,
  mood int not null check (mood between 1 and 5),
  feelings text[] default '{}',
  note text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (user_id, check_date)
);

create table if not exists mind_journal (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  title text,
  body text not null,
  prompt text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table mind_checkins enable row level security;
alter table mind_journal enable row level security;

drop policy if exists "Own check-ins" on mind_checkins;
create policy "Own check-ins" on mind_checkins for all using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "Own journal" on mind_journal;
create policy "Own journal" on mind_journal for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create index if not exists mind_checkins_user on mind_checkins (user_id, check_date);
create index if not exists mind_journal_user on mind_journal (user_id, created_at desc);

select 'Renew is ready' as status;
