-- Eden Strong — Tap Cook
-- Run ONCE in the Supabase SQL editor, AFTER migration_editions.sql
-- (it uses public.my_edition() and the couples table from that file).
-- Safe to re-run: every change checks whether it's already there.

-- ─────────────────────────────────────────────────────────────
-- 1. Extra recipe fields
-- ─────────────────────────────────────────────────────────────
alter table recipes add column if not exists minutes int;
alter table recipes add column if not exists serves int default 2;
alter table recipes add column if not exists tags text[] default '{}';            -- protein | recovery | energy
alter table recipes add column if not exists ingredient_keys text[] default '{}'; -- keys from src/lib/kitchen.js
alter table recipes add column if not exists steps jsonb default '[]';            -- [{ "text": "...", "timer": 600, "who": 1 }]
alter table recipes add column if not exists verse_text text;
alter table recipes add column if not exists verse_ref text;
alter table recipes add column if not exists cook_together boolean default false; -- steps split between two cooks
alter table recipes add column if not exists edition text
  check (edition in ('women', 'men', 'together'));                                -- NULL = every edition

-- Recipes follow the same rule as programs and devotions: shared ones plus
-- the member's own edition.
drop policy if exists "Anyone can read recipes" on recipes;
drop policy if exists "Members read shared recipes and their edition's recipes" on recipes;
create policy "Members read shared recipes and their edition's recipes"
  on recipes for select
  using (edition is null or edition = public.my_edition());

-- ─────────────────────────────────────────────────────────────
-- 2. The member's kitchen: pantry + grocery list
-- ─────────────────────────────────────────────────────────────
create table if not exists kitchen_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  list text not null check (list in ('pantry', 'grocery')),
  item text not null,
  label text,
  created_at timestamptz default now(),
  unique (user_id, list, item)
);

-- The signed-in member's linked spouse, or NULL.
create or replace function public.my_partner_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select case when partner_a = auth.uid() then partner_b else partner_a end
  from couples
  where (partner_a = auth.uid() or partner_b = auth.uid())
    and partner_b is not null
  limit 1
$$;

grant execute on function public.my_partner_id() to authenticated;

alter table kitchen_items enable row level security;

drop policy if exists "Members and spouses read the kitchen" on kitchen_items;
create policy "Members and spouses read the kitchen"
  on kitchen_items for select
  using (user_id = auth.uid() or user_id = public.my_partner_id());

drop policy if exists "Members add to their own kitchen" on kitchen_items;
create policy "Members add to their own kitchen"
  on kitchen_items for insert
  with check (user_id = auth.uid());

drop policy if exists "Members and spouses remove kitchen items" on kitchen_items;
create policy "Members and spouses remove kitchen items"
  on kitchen_items for delete
  using (user_id = auth.uid() or user_id = public.my_partner_id());

-- ─────────────────────────────────────────────────────────────
-- 3. Starter recipes
-- ─────────────────────────────────────────────────────────────
-- Calories and macros are per serving and approximate. Edit freely in the
-- Table Editor. Each insert skips itself if a recipe with that title exists.

insert into recipes (title, minutes, serves, calories, protein, fat, carbs, tags, ingredient_keys, ingredients, steps, verse_text, verse_ref, cook_together, edition)
select * from (values
(
  'Sheet-pan chicken and sweet potatoes', 35, 2, 430, 38, 12, 40,
  array['protein','recovery'], array['chicken','sweet_potato','broccoli'],
  E'2 chicken breasts, cut into chunks\n2 medium sweet potatoes, cubed\n2 cups broccoli florets\n2 tbsp olive oil\n1 tsp garlic powder, 1 tsp paprika, salt and pepper',
  '[{"text":"Heat the oven to 425°F and line a sheet pan."},
    {"text":"Toss the sweet potatoes with half the oil and seasoning. Spread on the pan and roast.","timer":900},
    {"text":"Toss the chicken and broccoli with the rest of the oil and seasoning. Add to the pan and roast until the chicken is cooked through.","timer":1200},
    {"text":"Divide between two plates."}]'::jsonb,
  'O give thanks unto the Lord; for he is good.', 'Psalm 107:1', false, null
),
(
  'Turkey taco bowls', 25, 3, 520, 40, 14, 58,
  array['protein'], array['ground_turkey','rice','black_beans','salsa'],
  E'1 lb ground turkey\n1½ cups cooked rice\n1 can black beans, rinsed\n½ cup salsa\n2 tsp chili powder, 1 tsp cumin, salt',
  '[{"text":"Start the rice if it isn''t cooked yet.","timer":900},
    {"text":"Brown the turkey in a skillet over medium-high heat, breaking it up as it cooks.","timer":420},
    {"text":"Stir in the spices, beans, and salsa. Simmer until warmed through.","timer":300},
    {"text":"Spoon rice into bowls and top with the turkey mixture."}]'::jsonb,
  'Give us this day our daily bread.', 'Matthew 6:11', false, null
),
(
  'Veggie egg scramble', 10, 1, 320, 24, 21, 7,
  array['protein','energy'], array['eggs','spinach','bell_pepper','cheese'],
  E'3 eggs\n1 handful spinach\n½ bell pepper, diced\n2 tbsp shredded cheese\n1 tsp olive oil, salt and pepper',
  '[{"text":"Warm the oil in a nonstick pan and cook the pepper until soft.","timer":180},
    {"text":"Add the spinach and stir until wilted."},
    {"text":"Whisk the eggs with a pinch of salt, pour in, and stir gently until just set.","timer":120},
    {"text":"Top with cheese and serve."}]'::jsonb,
  'This is the day which the Lord hath made; we will rejoice and be glad in it.', 'Psalm 118:24', false, null
),
(
  'Berry overnight oats', 5, 1, 380, 22, 8, 56,
  array['energy'], array['oats','milk','greek_yogurt','berries','honey'],
  E'½ cup oats\n½ cup milk\n½ cup Greek yogurt\n½ cup berries\n1 tsp honey',
  '[{"text":"Stir the oats, milk, yogurt, and honey together in a jar."},
    {"text":"Top with berries, cover, and refrigerate overnight."},
    {"text":"Eat cold or warm it up in the morning."}]'::jsonb,
  'My God shall supply all your need.', 'Philippians 4:19', false, null
),
(
  'Lemon garlic salmon with quinoa', 25, 2, 480, 36, 18, 40,
  array['protein','recovery'], array['salmon','quinoa','lemon','garlic','spinach'],
  E'2 salmon fillets\n¾ cup quinoa\n1 lemon\n2 cloves garlic, minced\n2 handfuls spinach\n1 tbsp olive oil, salt and pepper',
  '[{"text":"Rinse the quinoa and simmer it in 1½ cups water, covered.","timer":900},
    {"text":"Season the salmon. Sear skin-side down in the oil over medium-high heat.","timer":240},
    {"text":"Flip, add the garlic and the juice of half the lemon, and cook until flaky.","timer":180},
    {"text":"Stir the spinach into the hot quinoa until wilted. Serve with the salmon and lemon wedges."}]'::jsonb,
  'Every good gift and every perfect gift is from above.', 'James 1:17', false, null
),
(
  'Garlic shrimp stir-fry', 20, 2, 430, 32, 8, 55,
  array['protein'], array['shrimp','broccoli','bell_pepper','rice','soy_sauce','garlic'],
  E'¾ lb shrimp, peeled\n2 cups broccoli florets\n1 bell pepper, sliced\n1½ cups cooked rice\n3 tbsp soy sauce\n2 cloves garlic, minced\n1 tbsp oil',
  '[{"text":"Start the rice if it isn''t cooked yet.","timer":900},
    {"text":"Heat the oil in a large skillet. Stir-fry the broccoli and pepper.","timer":240},
    {"text":"Add the shrimp and garlic. Cook until the shrimp turn pink.","timer":180},
    {"text":"Stir in the soy sauce and serve over rice."}]'::jsonb,
  'Taste and see that the Lord is good.', 'Psalm 34:8', false, null
),
(
  'Chickpea Greek salad', 15, 2, 340, 13, 14, 42,
  array['energy'], array['chickpeas','cucumber','tomato','onion','lemon'],
  E'1 can chickpeas, rinsed\n1 cucumber, chopped\n2 tomatoes, chopped\n¼ red onion, thinly sliced\n1 lemon\n2 tbsp olive oil, oregano, salt and pepper',
  '[{"text":"Chop the cucumber, tomatoes, and onion and add to a bowl with the chickpeas."},
    {"text":"Whisk the lemon juice, oil, oregano, salt, and pepper. Pour over and toss."},
    {"text":"Let it sit a few minutes so the flavors come together.","timer":300}]'::jsonb,
  'Man shall not live by bread alone, but by every word that proceedeth out of the mouth of God.', 'Matthew 4:4', false, null
),
(
  'Black bean quesadillas', 15, 2, 450, 22, 16, 52,
  array['energy'], array['tortillas','black_beans','cheese','salsa'],
  E'4 tortillas\n1 can black beans, rinsed and lightly mashed\n1 cup shredded cheese\nSalsa for dipping',
  '[{"text":"Spread beans and cheese over half of each tortilla and fold."},
    {"text":"Cook in a dry skillet over medium heat until golden on the bottom.","timer":180},
    {"text":"Flip and cook the other side until the cheese melts.","timer":180},
    {"text":"Cut into wedges and serve with salsa."}]'::jsonb,
  'Whether therefore ye eat, or drink, or whatsoever ye do, do all to the glory of God.', '1 Corinthians 10:31', false, null
),
(
  'Peanut butter banana yogurt bowl', 5, 1, 410, 26, 14, 46,
  array['energy','recovery'], array['greek_yogurt','banana','peanut_butter','honey'],
  E'1 cup Greek yogurt\n1 banana, sliced\n1 tbsp peanut butter\n1 tsp honey',
  '[{"text":"Spoon the yogurt into a bowl."},
    {"text":"Top with banana, a spoonful of peanut butter, and a drizzle of honey."}]'::jsonb,
  'Those who hope in the Lord will renew their strength.', 'Isaiah 40:31', false, null
),
(
  'Turkey zucchini skillet', 25, 3, 360, 30, 16, 18,
  array['protein'], array['ground_turkey','zucchini','onion','canned_tomatoes','garlic'],
  E'1 lb ground turkey\n2 zucchini, diced\n1 onion, diced\n1 can diced tomatoes\n2 cloves garlic, minced\n1 tsp Italian seasoning, salt and pepper',
  '[{"text":"Brown the turkey and onion in a large skillet.","timer":420},
    {"text":"Add the garlic and zucchini and cook until the zucchini softens.","timer":300},
    {"text":"Stir in the tomatoes and seasoning. Simmer to thicken.","timer":480},
    {"text":"Serve on its own or over rice."}]'::jsonb,
  'O give thanks unto the Lord; for he is good.', 'Psalm 107:1', false, null
),
(
  'Chicken avocado wraps', 20, 2, 480, 36, 20, 38,
  array['protein'], array['chicken','tortillas','avocado','tomato','spinach'],
  E'2 chicken breasts\n2 large tortillas\n1 avocado\n1 tomato, sliced\n1 handful spinach\nSalt, pepper, and a squeeze of lime if you have it',
  '[{"text":"Season the chicken and cook in a skillet over medium-high heat.","timer":360},
    {"text":"Flip and cook until done through.","timer":360},
    {"text":"Rest the chicken, then slice it.","timer":180},
    {"text":"Mash the avocado onto the tortillas, add spinach, tomato, and chicken, and roll up."}]'::jsonb,
  'Give us this day our daily bread.', 'Matthew 6:11', false, null
),
(
  'Date-night steak and roasted vegetables', 40, 2, 520, 40, 20, 36,
  array['protein','recovery'], array['lean_beef','sweet_potato','broccoli','garlic'],
  E'2 sirloin steaks\n2 sweet potatoes, cubed\n2 cups broccoli florets\n3 cloves garlic\n2 tbsp olive oil, salt and pepper',
  '[{"who":1,"text":"Heat the oven to 425°F. Toss the sweet potatoes in oil and salt and roast.","timer":1200},
    {"who":2,"text":"Pat the steaks dry and season well. Let them sit at room temperature.","timer":900},
    {"who":1,"text":"Add the broccoli and smashed garlic to the pan and roast until crisp at the edges.","timer":600},
    {"who":2,"text":"Sear the steaks in a hot skillet, flipping once, to your liking.","timer":480},
    {"who":2,"text":"Rest the steaks before slicing.","timer":300},
    {"who":1,"text":"Set the table and plate the vegetables."}]'::jsonb,
  'Two are better than one.', 'Ecclesiastes 4:9', true, 'together'
),
(
  'Build-your-own burrito bowls', 30, 2, 560, 38, 18, 62,
  array['protein'], array['chicken','rice','black_beans','avocado','lime','salsa'],
  E'2 chicken breasts\n1½ cups cooked rice\n1 can black beans\n1 avocado\n1 lime\nSalsa\nChili powder, cumin, salt',
  '[{"who":1,"text":"Start the rice.","timer":900},
    {"who":2,"text":"Season the chicken with chili powder, cumin, and salt and cook in a skillet.","timer":720},
    {"who":1,"text":"Warm the beans with a pinch of salt."},
    {"who":2,"text":"Rest and slice the chicken.","timer":180},
    {"who":1,"text":"Slice the avocado and cut the lime into wedges."},
    {"text":"Build your bowls however each of you likes them."}]'::jsonb,
  'Breaking bread at home, they took their food with gladness and singleness of heart.', 'Acts 2:46', true, 'together'
)
) as v(title, minutes, serves, calories, protein, fat, carbs, tags, ingredient_keys, ingredients, steps, verse_text, verse_ref, cook_together, edition)
where not exists (select 1 from recipes r where r.title = v.title);
