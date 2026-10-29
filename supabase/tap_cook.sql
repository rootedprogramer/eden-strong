-- Eden Strong - Daily Bread
-- Run ONCE in the Supabase SQL editor, AFTER migration_editions.sql
-- (it uses public.my_edition() and the couples table from that file).
-- Safe to re-run: every change checks whether it's already there.

-- -------------------------------------------------------------
-- 1. Extra recipe fields
-- -------------------------------------------------------------
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
drop policy if exists "Members read shared and own edition recipes" on recipes;
create policy "Members read shared and own edition recipes"
  on recipes for select
  using (edition is null or edition = public.my_edition());

-- -------------------------------------------------------------
-- 2. The member's kitchen: pantry + grocery list
-- -------------------------------------------------------------
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

-- 3. Starter recipes. Each one is skipped if a recipe with that title already exists.
-- Calories and macros are per serving and approximate.

INSERT INTO recipes (title, minutes, serves, calories, protein, fat, carbs, tags, ingredient_keys, ingredients, steps, verse_text, verse_ref, cook_together, edition)
SELECT $q$Berry overnight oats$q$, 5, 1, 380, 22, 8, 56,
  ARRAY[$q$energy$q$]::text[], ARRAY[$q$oats$q$,$q$milk$q$,$q$greek_yogurt$q$,$q$berries$q$,$q$honey$q$]::text[],
  $q$1/2 cup oats
1/2 cup milk
1/2 cup Greek yogurt
1/2 cup berries
1 tsp honey$q$,
  $q$[
 {
  "text": "Stir the oats, milk, yogurt, and honey together in a jar."
 },
 {
  "text": "Top with berries, cover, and refrigerate overnight."
 },
 {
  "text": "Eat cold or warm it up in the morning."
 }
]$q$::jsonb,
  $q$My God shall supply all your need.$q$, $q$Philippians 4:19$q$, false, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipes WHERE title = $q$Berry overnight oats$q$);

INSERT INTO recipes (title, minutes, serves, calories, protein, fat, carbs, tags, ingredient_keys, ingredients, steps, verse_text, verse_ref, cook_together, edition)
SELECT $q$Black bean quesadillas$q$, 15, 2, 450, 22, 16, 52,
  ARRAY[$q$energy$q$]::text[], ARRAY[$q$tortillas$q$,$q$black_beans$q$,$q$cheese$q$,$q$salsa$q$]::text[],
  $q$4 tortillas
1 can black beans, rinsed and lightly mashed
1 cup shredded cheese
Salsa for dipping$q$,
  $q$[
 {
  "text": "Spread beans and cheese over half of each tortilla and fold."
 },
 {
  "text": "Cook in a dry skillet over medium heat until golden on the bottom.",
  "timer": 180
 },
 {
  "text": "Flip and cook the other side until the cheese melts.",
  "timer": 180
 },
 {
  "text": "Cut into wedges and serve with salsa."
 }
]$q$::jsonb,
  $q$Whether therefore ye eat, or drink, or whatsoever ye do, do all to the glory of God.$q$, $q$1 Corinthians 10:31$q$, false, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipes WHERE title = $q$Black bean quesadillas$q$);

INSERT INTO recipes (title, minutes, serves, calories, protein, fat, carbs, tags, ingredient_keys, ingredients, steps, verse_text, verse_ref, cook_together, edition)
SELECT $q$Build-your-own burrito bowls$q$, 30, 2, 560, 38, 18, 62,
  ARRAY[$q$protein$q$]::text[], ARRAY[$q$chicken$q$,$q$rice$q$,$q$black_beans$q$,$q$avocado$q$,$q$lime$q$,$q$salsa$q$]::text[],
  $q$2 chicken breasts
1 1/2 cups cooked rice
1 can black beans
1 avocado
1 lime
Salsa
Chili powder, cumin, salt$q$,
  $q$[
 {
  "who": 1,
  "text": "Start the rice.",
  "timer": 900
 },
 {
  "who": 2,
  "text": "Season the chicken with chili powder, cumin, and salt and cook in a skillet.",
  "timer": 720
 },
 {
  "who": 1,
  "text": "Warm the beans with a pinch of salt."
 },
 {
  "who": 2,
  "text": "Rest and slice the chicken.",
  "timer": 180
 },
 {
  "who": 1,
  "text": "Slice the avocado and cut the lime into wedges."
 },
 {
  "text": "Build your bowls however each of you likes them."
 }
]$q$::jsonb,
  $q$Breaking bread at home, they took their food with gladness and singleness of heart.$q$, $q$Acts 2:46$q$, true, $q$together$q$
WHERE NOT EXISTS (SELECT 1 FROM recipes WHERE title = $q$Build-your-own burrito bowls$q$);

INSERT INTO recipes (title, minutes, serves, calories, protein, fat, carbs, tags, ingredient_keys, ingredients, steps, verse_text, verse_ref, cook_together, edition)
SELECT $q$Chicken avocado wraps$q$, 20, 2, 480, 36, 20, 38,
  ARRAY[$q$protein$q$]::text[], ARRAY[$q$chicken$q$,$q$tortillas$q$,$q$avocado$q$,$q$tomato$q$,$q$spinach$q$]::text[],
  $q$2 chicken breasts
2 large tortillas
1 avocado
1 tomato, sliced
1 handful spinach
Salt, pepper, and a squeeze of lime if you have it$q$,
  $q$[
 {
  "text": "Season the chicken and cook in a skillet over medium-high heat.",
  "timer": 360
 },
 {
  "text": "Flip and cook until done through.",
  "timer": 360
 },
 {
  "text": "Rest the chicken, then slice it.",
  "timer": 180
 },
 {
  "text": "Mash the avocado onto the tortillas, add spinach, tomato, and chicken, and roll up."
 }
]$q$::jsonb,
  $q$Give us this day our daily bread.$q$, $q$Matthew 6:11$q$, false, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipes WHERE title = $q$Chicken avocado wraps$q$);

INSERT INTO recipes (title, minutes, serves, calories, protein, fat, carbs, tags, ingredient_keys, ingredients, steps, verse_text, verse_ref, cook_together, edition)
SELECT $q$Chickpea Greek salad$q$, 15, 2, 340, 13, 14, 42,
  ARRAY[$q$energy$q$]::text[], ARRAY[$q$chickpeas$q$,$q$cucumber$q$,$q$tomato$q$,$q$onion$q$,$q$lemon$q$]::text[],
  $q$1 can chickpeas, rinsed
1 cucumber, chopped
2 tomatoes, chopped
1/4 red onion, thinly sliced
1 lemon
2 tbsp olive oil, oregano, salt and pepper$q$,
  $q$[
 {
  "text": "Chop the cucumber, tomatoes, and onion and add to a bowl with the chickpeas."
 },
 {
  "text": "Whisk the lemon juice, oil, oregano, salt, and pepper. Pour over and toss."
 },
 {
  "text": "Let it sit a few minutes so the flavors come together.",
  "timer": 300
 }
]$q$::jsonb,
  $q$Man shall not live by bread alone, but by every word that proceedeth out of the mouth of God.$q$, $q$Matthew 4:4$q$, false, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipes WHERE title = $q$Chickpea Greek salad$q$);

INSERT INTO recipes (title, minutes, serves, calories, protein, fat, carbs, tags, ingredient_keys, ingredients, steps, verse_text, verse_ref, cook_together, edition)
SELECT $q$Date-night steak and roasted vegetables$q$, 40, 2, 520, 40, 20, 36,
  ARRAY[$q$protein$q$,$q$recovery$q$]::text[], ARRAY[$q$lean_beef$q$,$q$sweet_potato$q$,$q$broccoli$q$,$q$garlic$q$]::text[],
  $q$2 sirloin steaks
2 sweet potatoes, cubed
2 cups broccoli florets
3 cloves garlic
2 tbsp olive oil, salt and pepper$q$,
  $q$[
 {
  "who": 1,
  "text": "Heat the oven to 425 F. Toss the sweet potatoes in oil and salt and roast.",
  "timer": 1200
 },
 {
  "who": 2,
  "text": "Pat the steaks dry and season well. Let them sit at room temperature.",
  "timer": 900
 },
 {
  "who": 1,
  "text": "Add the broccoli and smashed garlic to the pan and roast until crisp at the edges.",
  "timer": 600
 },
 {
  "who": 2,
  "text": "Sear the steaks in a hot skillet, flipping once, to your liking.",
  "timer": 480
 },
 {
  "who": 2,
  "text": "Rest the steaks before slicing.",
  "timer": 300
 },
 {
  "who": 1,
  "text": "Set the table and plate the vegetables."
 }
]$q$::jsonb,
  $q$Two are better than one.$q$, $q$Ecclesiastes 4:9$q$, true, $q$together$q$
WHERE NOT EXISTS (SELECT 1 FROM recipes WHERE title = $q$Date-night steak and roasted vegetables$q$);

INSERT INTO recipes (title, minutes, serves, calories, protein, fat, carbs, tags, ingredient_keys, ingredients, steps, verse_text, verse_ref, cook_together, edition)
SELECT $q$Garlic shrimp stir-fry$q$, 20, 2, 430, 32, 8, 55,
  ARRAY[$q$protein$q$]::text[], ARRAY[$q$shrimp$q$,$q$broccoli$q$,$q$bell_pepper$q$,$q$rice$q$,$q$soy_sauce$q$,$q$garlic$q$]::text[],
  $q$3/4 lb shrimp, peeled
2 cups broccoli florets
1 bell pepper, sliced
1 1/2 cups cooked rice
3 tbsp soy sauce
2 cloves garlic, minced
1 tbsp oil$q$,
  $q$[
 {
  "text": "Start the rice if it isn't cooked yet.",
  "timer": 900
 },
 {
  "text": "Heat the oil in a large skillet. Stir-fry the broccoli and pepper.",
  "timer": 240
 },
 {
  "text": "Add the shrimp and garlic. Cook until the shrimp turn pink.",
  "timer": 180
 },
 {
  "text": "Stir in the soy sauce and serve over rice."
 }
]$q$::jsonb,
  $q$Taste and see that the Lord is good.$q$, $q$Psalm 34:8$q$, false, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipes WHERE title = $q$Garlic shrimp stir-fry$q$);

INSERT INTO recipes (title, minutes, serves, calories, protein, fat, carbs, tags, ingredient_keys, ingredients, steps, verse_text, verse_ref, cook_together, edition)
SELECT $q$Lemon garlic salmon with quinoa$q$, 25, 2, 480, 36, 18, 40,
  ARRAY[$q$protein$q$,$q$recovery$q$]::text[], ARRAY[$q$salmon$q$,$q$quinoa$q$,$q$lemon$q$,$q$garlic$q$,$q$spinach$q$]::text[],
  $q$2 salmon fillets
3/4 cup quinoa
1 lemon
2 cloves garlic, minced
2 handfuls spinach
1 tbsp olive oil, salt and pepper$q$,
  $q$[
 {
  "text": "Rinse the quinoa and simmer it in 1\u00bd cups water, covered.",
  "timer": 900
 },
 {
  "text": "Season the salmon. Sear skin-side down in the oil over medium-high heat.",
  "timer": 240
 },
 {
  "text": "Flip, add the garlic and the juice of half the lemon, and cook until flaky.",
  "timer": 180
 },
 {
  "text": "Stir the spinach into the hot quinoa until wilted. Serve with the salmon and lemon wedges."
 }
]$q$::jsonb,
  $q$Every good gift and every perfect gift is from above.$q$, $q$James 1:17$q$, false, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipes WHERE title = $q$Lemon garlic salmon with quinoa$q$);

INSERT INTO recipes (title, minutes, serves, calories, protein, fat, carbs, tags, ingredient_keys, ingredients, steps, verse_text, verse_ref, cook_together, edition)
SELECT $q$Peanut butter banana yogurt bowl$q$, 5, 1, 410, 26, 14, 46,
  ARRAY[$q$energy$q$,$q$recovery$q$]::text[], ARRAY[$q$greek_yogurt$q$,$q$banana$q$,$q$peanut_butter$q$,$q$honey$q$]::text[],
  $q$1 cup Greek yogurt
1 banana, sliced
1 tbsp peanut butter
1 tsp honey$q$,
  $q$[
 {
  "text": "Spoon the yogurt into a bowl."
 },
 {
  "text": "Top with banana, a spoonful of peanut butter, and a drizzle of honey."
 }
]$q$::jsonb,
  $q$Those who hope in the Lord will renew their strength.$q$, $q$Isaiah 40:31$q$, false, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipes WHERE title = $q$Peanut butter banana yogurt bowl$q$);

INSERT INTO recipes (title, minutes, serves, calories, protein, fat, carbs, tags, ingredient_keys, ingredients, steps, verse_text, verse_ref, cook_together, edition)
SELECT $q$Sheet-pan chicken and sweet potatoes$q$, 35, 2, 430, 38, 12, 40,
  ARRAY[$q$protein$q$,$q$recovery$q$]::text[], ARRAY[$q$chicken$q$,$q$sweet_potato$q$,$q$broccoli$q$]::text[],
  $q$2 chicken breasts, cubed
2 medium sweet potatoes, cubed
2 cups broccoli florets
2 tbsp olive oil
1 tsp garlic powder, 1 tsp paprika, salt and pepper$q$,
  $q$[
 {
  "text": "Heat the oven to 425 F and line a sheet pan."
 },
 {
  "text": "Toss the sweet potatoes with half the oil and seasoning. Spread on the pan and roast.",
  "timer": 900
 },
 {
  "text": "Toss the chicken and broccoli with the rest of the oil and seasoning. Add to the pan and roast until the chicken is cooked through.",
  "timer": 1200
 },
 {
  "text": "Divide between two plates."
 }
]$q$::jsonb,
  $q$O give thanks unto the Lord, for he is good.$q$, $q$Psalm 107:1$q$, false, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipes WHERE title = $q$Sheet-pan chicken and sweet potatoes$q$);

INSERT INTO recipes (title, minutes, serves, calories, protein, fat, carbs, tags, ingredient_keys, ingredients, steps, verse_text, verse_ref, cook_together, edition)
SELECT $q$Turkey taco bowls$q$, 25, 3, 520, 40, 14, 58,
  ARRAY[$q$protein$q$]::text[], ARRAY[$q$ground_turkey$q$,$q$rice$q$,$q$black_beans$q$,$q$salsa$q$]::text[],
  $q$1 lb ground turkey
1 1/2 cups cooked rice
1 can black beans, rinsed
1/2 cup salsa
2 tsp chili powder, 1 tsp cumin, salt$q$,
  $q$[
 {
  "text": "Start the rice if it isn't cooked yet.",
  "timer": 900
 },
 {
  "text": "Brown the turkey in a skillet over medium-high heat, breaking it up as it cooks.",
  "timer": 420
 },
 {
  "text": "Stir in the spices, beans, and salsa. Simmer until warmed through.",
  "timer": 300
 },
 {
  "text": "Spoon rice into bowls and top with the turkey mixture."
 }
]$q$::jsonb,
  $q$Give us this day our daily bread.$q$, $q$Matthew 6:11$q$, false, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipes WHERE title = $q$Turkey taco bowls$q$);

INSERT INTO recipes (title, minutes, serves, calories, protein, fat, carbs, tags, ingredient_keys, ingredients, steps, verse_text, verse_ref, cook_together, edition)
SELECT $q$Turkey zucchini skillet$q$, 25, 3, 360, 30, 16, 18,
  ARRAY[$q$protein$q$]::text[], ARRAY[$q$ground_turkey$q$,$q$zucchini$q$,$q$onion$q$,$q$canned_tomatoes$q$,$q$garlic$q$]::text[],
  $q$1 lb ground turkey
2 zucchini, diced
1 onion, diced
1 can diced tomatoes
2 cloves garlic, minced
1 tsp Italian seasoning, salt and pepper$q$,
  $q$[
 {
  "text": "Brown the turkey and onion in a large skillet.",
  "timer": 420
 },
 {
  "text": "Add the garlic and zucchini and cook until the zucchini softens.",
  "timer": 300
 },
 {
  "text": "Stir in the tomatoes and seasoning. Simmer to thicken.",
  "timer": 480
 },
 {
  "text": "Serve on its own or over rice."
 }
]$q$::jsonb,
  $q$O give thanks unto the Lord, for he is good.$q$, $q$Psalm 107:1$q$, false, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipes WHERE title = $q$Turkey zucchini skillet$q$);

INSERT INTO recipes (title, minutes, serves, calories, protein, fat, carbs, tags, ingredient_keys, ingredients, steps, verse_text, verse_ref, cook_together, edition)
SELECT $q$Veggie egg scramble$q$, 10, 1, 320, 24, 21, 7,
  ARRAY[$q$protein$q$,$q$energy$q$]::text[], ARRAY[$q$eggs$q$,$q$spinach$q$,$q$bell_pepper$q$,$q$cheese$q$]::text[],
  $q$3 eggs
1 handful spinach
1/2 bell pepper, diced
2 tbsp shredded cheese
1 tsp olive oil, salt and pepper$q$,
  $q$[
 {
  "text": "Warm the oil in a nonstick pan and cook the pepper until soft.",
  "timer": 180
 },
 {
  "text": "Add the spinach and stir until wilted."
 },
 {
  "text": "Whisk the eggs with a pinch of salt, pour in, and stir gently until just set.",
  "timer": 120
 },
 {
  "text": "Top with cheese and serve."
 }
]$q$::jsonb,
  $q$This is the day which the Lord hath made, we will rejoice and be glad in it.$q$, $q$Psalm 118:24$q$, false, NULL
WHERE NOT EXISTS (SELECT 1 FROM recipes WHERE title = $q$Veggie egg scramble$q$);
