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
