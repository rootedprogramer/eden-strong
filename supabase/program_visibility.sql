-- Eden Strong — which brands see which programs
-- A program can be shown to any combination of the three brands:
--   edition  = one brand only ('women', 'men', or 'together')
--   editions = a list of brands, e.g. {women,together}
--   both empty = every brand
-- Run once in the Supabase SQL Editor (it's also part of setup_programs_and_tracking.sql).
-- Safe to run again.

alter table workout_programs add column if not exists edition text;
alter table workout_programs add column if not exists editions text[];

-- Faith Over Flesh has its own programs, so the original programs are for
-- Eden Strong and One Accord. Change these in Admin → Programs anytime.
update workout_programs
set editions = array['women', 'together']
where edition is null and editions is null
  and coalesce(track, split_part(title, ' — ', 1)) in ('Rooted & Rising', 'Vessel & Valor', 'Grit & Glory', 'Strong & Steadfast');

drop policy if exists "Members read shared programs and their edition's programs" on workout_programs;
drop policy if exists "Members read programs for their edition" on workout_programs;
create policy "Members read programs for their edition"
  on workout_programs for select
  using (
    edition = public.my_edition()
    or (edition is null and (editions is null or public.my_edition() = any(editions)))
  );
