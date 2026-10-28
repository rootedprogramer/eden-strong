# Eden Strong

Faith-rooted fitness web app. React + Vite + Supabase, deployed on Netlify.

## What's built

- **Landing page** (`/`) — brand intro + founding member CTA
- **Sign up / Sign in** (`/signup`, `/signin`) — Supabase email/password auth
- **Onboarding** (`/onboarding`) — 8-screen flow: 3 verse slides → brand → name capture → path select (postpartum / motherhood / healing & rebuilding / building strength) → path follow-up → personalized welcome
- **Dashboard** (`/dashboard`) — icon-only bottom nav with 5 tabs: **Home, Nutrition, Community, Progress, Habits**
  - **Home** — week strip, "Start here" prompt into today's devotion, "Jump back in" active-program card, nutrition summary, habits snippet. Devotion and the workout program aren't separate nav tabs — they're one tap from Home, same pattern as a typical fitness app's dashboard.
    - `/dashboard/devotion` — daily scripture + reflection + journal prompt, marked complete to advance to the next day
    - `/dashboard/program` — browse & enroll in multi-week structured programs
    - `/dashboard/log` — log how a workout went, auto-advances the user's program day
    - `/dashboard/profile` — name, path, founding member status, sign out
  - **Nutrition** — daily calorie/macro goals, meal logging, remaining-calories ring; Recipe Book (`/dashboard/nutrition/recipes`) for one-tap meal logging from published recipes
  - **Community** — post feed with likes and a comment count; anyone can read, users manage their own posts/likes
  - **Progress** — Progress / PRs / Photos sub-tabs. Progress uses a generic "My Charts" metric tracker (weight, measurements, anything user-defined). PRs reads from a `personal_records` table (not yet auto-populated from workout logs — see Next Steps). Photos is a placeholder pending Supabase Storage setup
  - **Habits** — add/track daily habits with a streak count per habit, toggle today's completion

All brand tokens (colors, fonts, copy, the 4 onboarding paths) live in `src/brand/tokens.js` — this is the single source of truth if anything needs to change.

## Three editions: Women, Men, Together

Eden Strong is three separate experiences under one app. Members pick **Eden Strong Women**, **Eden Strong Men**, or **Eden Strong Together** on the landing page, and from then on they only see that edition's name, colors, goals, and community feed.

- Edition names, descriptions, and the goals inside each edition live in `src/brand/tokens.js` (`EDITIONS`, `GOALS`, `FOLLOW_UPS`). The Men and Together goals are drafts; edit them freely.
- Edition colors live in `src/theme/theme.js`.
- **Run `supabase/migration_editions.sql` once** in the SQL editor (after `schema.sql`). It adds `user_profiles.edition`, sets existing members to `women`, separates the community feeds, and adds couple linking.
- Programs and devotions with `edition` left empty show in all three editions. To make one belong to a single edition: `update workout_programs set edition = 'men' where title = '...';`
- Together: each spouse signs up with their own login. One taps "Create an invite code" on their Profile page, the other enters it.

## Setup

```bash
npm install
cp .env.example .env
```

Fill in `.env` with your Supabase project's URL and anon key (Supabase dashboard → Project Settings → API).

Then, in order, run these in your Supabase project's SQL editor:

1. **`supabase/schema.sql`** — creates all tables:
   - `user_profiles` — onboarding selections, RLS-scoped to each user
   - `workout_programs`, `program_days`, `program_exercises` — the structured program catalog (publicly readable; `superset_group` marks exercises meant to be paired)
   - `program_enrollments` — tracks which program + day each user is on
   - `workout_logs` — free-text log entries
   - `daily_devotions` — scripture + reflection + journal prompt, publicly readable
   - `devotion_progress` — tracks which devotion day each user is on
2. **`supabase/seed_programs.sql`** — populates two named challenge tracks at 3/4/5-day splits each: **Vessel & Valor** (Challenge Track — superset-heavy, advanced) and **Rooted & Rising** (Foundation Track — steadier, non-superset). Vessel & Valor also gets a 6-day option, which wasn't in the original two programs — flagged in the file as our own addition
3. **`supabase/seed_devotions.sql`** — populates the first 7 days of devotional content (KJV scripture + original reflections + journal prompts)

`recipes`, `habits`, `community_posts`, and `personal_records` all start empty — there's no seed file for these since the content is yours to add (your own recipes, the habits you want available, etc.).

**Rotation logic not yet modeled:** the original split design called for rotating Chest/Tri and Shoulders into the 3-day and 4-day splits periodically, and swapping Shoulders in for the 5-day split's Chest/Tri day every other week. The seed data uses the base rotation only — that periodic-swap logic would need either a small scheduling table or manual adjustment for now.

**Devotion content beyond day 7:** only a starting week is seeded. Add more rows to `daily_devotions` as you write them, or let me know when you're ready to build out further weeks — happy to help draft more scripture + reflection pairings.

## Run locally

```bash
npm run dev
```

## Deploy to Netlify

1. Push this repo to GitHub
2. In Netlify: New site from Git → select the repo
3. Build command: `npm run build`, publish directory: `dist`
4. Add the same `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as environment variables in Netlify's site settings (Site configuration → Environment variables)
5. Deploy, then point your domain (e.g. `edenstrong.app`) at the Netlify site under Domain management

## Next steps once this is live

- [ ] Stripe integration for the $10/mo founding member checkout (currently just a label on the profile screen — no payment flow wired up yet)
- [ ] Path-specific dashboard variations (currently all 4 paths share the same dashboard/program catalog, filtered manually)
- [ ] Swap in real photography/imagery if you want anything beyond the current text+icon look
- [ ] Add your own recipes to `recipes`, habits to `habits` (or let users add their own — currently per-user via the Habits screen)
- [ ] PRs aren't auto-detected yet — logging a heavier weight in `LogWorkout` doesn't yet write to `personal_records`. Worth wiring up so PRs populate automatically like the reference app's "New Weight PR!" banner
- [ ] Progress photos need Supabase Storage (a bucket + upload flow) — not set up yet
- [ ] Community feed has no moderation tools (report/delete-by-admin) — fine for a small trusted group, worth adding before it scales
- [ ] Comment posting UI isn't built yet — `post_comments` table exists and comment counts show, but there's no way to actually write a comment yet
