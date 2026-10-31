-- Eden Strong — High-Protein Recipe Collection ("Fuel Your Strength")
-- 24 recipes: smoothies, snacks, breakfasts, lunches, dinners, and desserts.
-- Run once in the Supabase SQL Editor. Safe to run again: it replaces these
-- 24 recipes by title and leaves any other recipes alone.
-- Nutrition numbers are the collection's per-serving estimates.

alter table recipes add column if not exists category text;    -- Smoothies, Snacks, Breakfasts, Lunches, Dinners, Desserts
alter table recipes add column if not exists servings text;    -- e.g. '1 serving', '1 snack'
alter table recipes add column if not exists tip text;         -- the Eden Strong tip
alter table recipes add column if not exists sort_order int;
alter table recipes add column if not exists image text;       -- optional photo URL

delete from recipes where title in ($r$Berry Cheesecake Protein Smoothie$r$,
  $r$Chocolate Peanut Butter Banana Smoothie$r$,
  $r$Peaches & Cream Smoothie$r$,
  $r$Mocha Morning Smoothie$r$,
  $r$Cinnamon Apple Yogurt Dip$r$,
  $r$Savory Cottage Cheese Crunch Bowl$r$,
  $r$Turkey & Pickle Roll-Ups$r$,
  $r$Chocolate Strawberry Yogurt Bark$r$,
  $r$Veggie Egg-White Breakfast Scramble$r$,
  $r$Protein Overnight Oats$r$,
  $r$Breakfast Taco Plate$r$,
  $r$Lemon Blueberry Protein Pancakes$r$,
  $r$Chicken Caesar Crunch Wrap$r$,
  $r$Tuna & White Bean Lemon Salad$r$,
  $r$Turkey Taco Protein Bowl$r$,
  $r$Creamy Tomato Chickpea Chicken Soup$r$,
  $r$Garlic-Lime Chicken & Rice Plate$r$,
  $r$Turkey Meatballs with Marinara$r$,
  $r$Sheet-Pan Salmon & Potatoes$r$,
  $r$Lean Beef & Broccoli Stir-Fry$r$,
  $r$Chocolate Cheesecake Yogurt Cup$r$,
  $r$Strawberries & Vanilla Cheesecake Dip$r$,
  $r$Frozen Banana Protein Bites$r$,
  $r$Apple Cinnamon Protein Crumble for One$r$);

insert into recipes (category, sort_order, title, calories, protein, servings, ingredients, directions, tip) values
($r$Smoothies$r$, 1, $r$Berry Cheesecake Protein Smoothie$r$, 250, 30, $r$1 serving$r$,
 $r$1 cup unsweetened almond milk (or milk of choice)
¾ cup plain nonfat Greek yogurt
½ cup frozen mixed berries
½ scoop vanilla protein powder
¼ tsp vanilla extract
Ice as needed$r$,
 $r$Blend everything until creamy, adding ice or a splash of milk to adjust thickness.
Taste and add a little lemon zest for a cheesecake-style flavor.$r$,
 $r$Use frozen berries for a thick texture without needing extra sweetener.$r$),
($r$Smoothies$r$, 2, $r$Chocolate Peanut Butter Banana Smoothie$r$, 300, 30, $r$1 serving$r$,
 $r$1 cup unsweetened almond milk
1 scoop chocolate protein powder
½ medium banana, frozen
1 tsp peanut butter
1 tsp unsweetened cocoa powder
Ice$r$,
 $r$Blend until smooth.
Add a pinch of salt to bring out the chocolate-peanut flavor.$r$,
 $r$Measure the peanut butter—one teaspoon adds flavor while keeping portions predictable.$r$),
($r$Smoothies$r$, 3, $r$Peaches & Cream Smoothie$r$, 240, 28, $r$1 serving$r$,
 $r$¾ cup nonfat Greek yogurt
¾ cup frozen peaches
½ cup unsweetened milk of choice
½ scoop vanilla protein powder
Pinch of cinnamon$r$,
 $r$Blend until silky.
Add cold water or ice to reach your preferred consistency.$r$,
 $r$Cinnamon and ripe fruit add sweetness without much added sugar.$r$),
($r$Smoothies$r$, 4, $r$Mocha Morning Smoothie$r$, 260, 30, $r$1 serving$r$,
 $r$1 cup chilled coffee
½ cup nonfat Greek yogurt
1 scoop chocolate protein powder
½ small frozen banana
Ice$r$,
 $r$Blend all ingredients until frothy.
Use decaf coffee if you prefer to limit caffeine.$r$,
 $r$Great when you want a coffee-shop flavor at home.$r$),
($r$Snacks$r$, 5, $r$Cinnamon Apple Yogurt Dip$r$, 190, 20, $r$1 snack$r$,
 $r$¾ cup plain nonfat Greek yogurt
½ apple, sliced
Cinnamon
½ tsp honey, optional$r$,
 $r$Stir cinnamon and optional honey into yogurt.
Dip apple slices into the yogurt.$r$,
 $r$Add vanilla extract for more dessert-like flavor.$r$),
($r$Snacks$r$, 6, $r$Savory Cottage Cheese Crunch Bowl$r$, 200, 24, $r$1 snack$r$,
 $r$¾ cup low-fat cottage cheese
½ cup chopped cucumber and tomatoes
Black pepper, dill, and lemon juice
A few whole-grain crackers, optional$r$,
 $r$Top cottage cheese with vegetables and seasonings.
Serve with crackers if you want extra crunch.$r$,
 $r$Try everything-bagel seasoning or smoked paprika.$r$),
($r$Snacks$r$, 7, $r$Turkey & Pickle Roll-Ups$r$, 160, 20, $r$1 snack$r$,
 $r$3 oz sliced lean turkey
1 light cheese stick or ½ oz reduced-fat cheese
Dill pickle spears
Mustard$r$,
 $r$Spread a little mustard on turkey slices.
Wrap turkey around cheese and pickle spears.$r$,
 $r$Choose lower-sodium turkey if you are watching sodium.$r$),
($r$Snacks$r$, 8, $r$Chocolate Strawberry Yogurt Bark$r$, 150, 15, $r$1 portion$r$,
 $r$½ cup plain nonfat Greek yogurt
½ cup sliced strawberries
1 tsp mini chocolate chips
A few drops vanilla extract$r$,
 $r$Mix vanilla into yogurt and spread on parchment in a thin layer.
Scatter berries and chocolate chips over the top; freeze until firm.
Break into pieces and enjoy promptly.$r$,
 $r$Freeze in small portions so it is easy to grab.$r$),
($r$Breakfasts$r$, 9, $r$Veggie Egg-White Breakfast Scramble$r$, 250, 30, $r$1 serving$r$,
 $r$1 whole egg
¾ cup liquid egg whites
1 cup spinach, mushrooms, and peppers
Cooking spray
1 slice whole-grain toast, optional; add approx. 80–110 calories$r$,
 $r$Sauté vegetables in a nonstick pan with cooking spray.
Add egg and egg whites; scramble until fully set.
Season with pepper, garlic powder, and a little cheese if desired.$r$,
 $r$Keep the yolk for flavor and nutrients, and use egg whites to boost protein.$r$),
($r$Breakfasts$r$, 10, $r$Protein Overnight Oats$r$, 330, 30, $r$1 serving$r$,
 $r$½ cup rolled oats
½ cup nonfat Greek yogurt
½ cup milk of choice
½ scoop vanilla protein powder
½ cup berries
Cinnamon$r$,
 $r$Stir oats, yogurt, milk, protein powder, and cinnamon in a jar.
Refrigerate at least 4 hours or overnight.
Top with berries before eating.$r$,
 $r$If the mixture is too thick in the morning, loosen with a splash of milk.$r$),
($r$Breakfasts$r$, 11, $r$Breakfast Taco Plate$r$, 300, 28, $r$1 serving$r$,
 $r$1 small whole-wheat tortilla
1 egg
½ cup egg whites
¼ cup salsa
¼ cup black beans
Cilantro or hot sauce$r$,
 $r$Scramble egg and egg whites in a nonstick skillet.
Warm tortilla and fill with eggs, beans, and salsa.
Add cilantro or hot sauce.$r$,
 $r$Black beans add fiber and make the meal more satisfying.$r$),
($r$Breakfasts$r$, 12, $r$Lemon Blueberry Protein Pancakes$r$, 320, 30, $r$1 serving$r$,
 $r$½ cup low-fat cottage cheese
1 egg
⅓ cup rolled oats
½ scoop vanilla protein powder
¼ cup blueberries
Lemon zest$r$,
 $r$Blend cottage cheese, egg, oats, and protein powder until mostly smooth.
Fold in blueberries and lemon zest.
Cook small pancakes on a lightly greased nonstick skillet over medium-low heat until cooked through.$r$,
 $r$Cook small pancakes gently; protein-rich batter browns quickly.$r$),
($r$Lunches$r$, 13, $r$Chicken Caesar Crunch Wrap$r$, 380, 40, $r$1 serving$r$,
 $r$4 oz cooked chicken breast, chopped
1 high-fiber tortilla
1 cup chopped romaine
1 tbsp light Caesar dressing
1 tbsp grated Parmesan
Black pepper$r$,
 $r$Toss romaine with dressing and Parmesan.
Add chicken to tortilla, top with lettuce, fold, and toast seam-side down in a dry skillet if desired.$r$,
 $r$Add extra lettuce for volume and crunch.$r$),
($r$Lunches$r$, 14, $r$Tuna & White Bean Lemon Salad$r$, 330, 35, $r$1 serving$r$,
 $r$1 can light tuna in water, drained (about 4 oz)
½ cup rinsed cannellini beans
Chopped celery and red onion
Lemon juice
1 tsp olive oil
Parsley, pepper, and Dijon mustard$r$,
 $r$Mix tuna, beans, celery, and onion.
Dress with lemon, olive oil, Dijon, parsley, and pepper.
Serve over greens or with whole-grain toast.$r$,
 $r$Beans add fiber and make a small can of tuna more filling.$r$),
($r$Lunches$r$, 15, $r$Turkey Taco Protein Bowl$r$, 400, 38, $r$1 serving$r$,
 $r$4 oz cooked lean ground turkey
½ cup cooked rice
½ cup black beans
½ cup lettuce, tomato, and salsa
2 tbsp plain Greek yogurt
Taco seasoning$r$,
 $r$Brown turkey with taco seasoning until fully cooked.
Build a bowl with rice, beans, vegetables, and turkey.
Top with salsa and Greek yogurt.$r$,
 $r$Greek yogurt makes a tangy, protein-rich swap for sour cream.$r$),
($r$Lunches$r$, 16, $r$Creamy Tomato Chickpea Chicken Soup$r$, 360, 38, $r$1 serving$r$,
 $r$4 oz cooked shredded chicken
½ cup chickpeas, rinsed
1 cup low-sodium broth
½ cup crushed tomatoes
¼ cup plain Greek yogurt
Spinach, garlic, Italian seasoning$r$,
 $r$Simmer broth, tomatoes, garlic, chickpeas, and seasoning for 8–10 minutes.
Stir in chicken and spinach until hot and wilted.
Remove from heat; temper yogurt with a spoonful of hot broth, then stir it in gently.$r$,
 $r$Do not boil after adding yogurt, which can cause curdling.$r$),
($r$Dinners$r$, 17, $r$Garlic-Lime Chicken & Rice Plate$r$, 500, 45, $r$1 serving$r$,
 $r$5 oz cooked chicken breast
¾ cup cooked rice
1½ cups roasted or steamed vegetables
1 tsp olive oil
Lime juice, garlic, cumin, paprika$r$,
 $r$Season chicken with garlic, cumin, paprika, and lime; cook to 165°F / 74°C.
Serve with rice and vegetables tossed with measured olive oil.
Finish with fresh lime juice.$r$,
 $r$Make extra chicken and rice for an easy next-day lunch.$r$),
($r$Dinners$r$, 18, $r$Turkey Meatballs with Marinara$r$, 450, 40, $r$1 serving$r$,
 $r$5 oz lean ground turkey
2 tbsp breadcrumbs
1 tbsp egg white
Garlic, oregano, and pepper
¾ cup marinara
1 cup cooked zucchini noodles or ¾ cup cooked pasta$r$,
 $r$Mix turkey, breadcrumbs, egg white, and seasonings; form meatballs.
Bake at 400°F / 205°C until the center reaches 165°F / 74°C.
Warm in marinara and serve with zucchini noodles or pasta.$r$,
 $r$Choose pasta when you need more workout fuel; zucchini noodles keep the meal lighter.$r$),
($r$Dinners$r$, 19, $r$Sheet-Pan Salmon & Potatoes$r$, 500, 35, $r$1 serving$r$,
 $r$5 oz salmon fillet
6 oz baby potatoes, halved
1–2 cups green beans or broccoli
1 tsp olive oil
Lemon, dill, garlic, pepper$r$,
 $r$Toss potatoes and vegetables with oil and seasonings; roast at 425°F / 220°C until nearly tender.
Add salmon and lemon; roast until salmon reaches 145°F / 63°C or flakes easily.
Serve with fresh dill and lemon.$r$,
 $r$Salmon provides omega-3 fats; calorie-conscious does not mean fat-free.$r$),
($r$Dinners$r$, 20, $r$Lean Beef & Broccoli Stir-Fry$r$, 460, 38, $r$1 serving$r$,
 $r$5 oz lean sirloin, thinly sliced
2 cups broccoli
½ cup cooked rice
1 tbsp low-sodium soy sauce
Garlic, ginger, rice vinegar
1 tsp cornstarch mixed with 2 tbsp water
Cooking spray or 1 tsp oil$r$,
 $r$Sear beef in a hot pan until browned; remove briefly.
Stir-fry broccoli with garlic and ginger, adding a splash of water to steam.
Return beef to pan; add soy, vinegar, and cornstarch slurry. Simmer until glossy and beef is cooked to preference.
Serve over rice.$r$,
 $r$Slice beef thinly across the grain for a more tender result.$r$),
($r$Desserts$r$, 21, $r$Chocolate Cheesecake Yogurt Cup$r$, 180, 20, $r$1 serving$r$,
 $r$¾ cup plain nonfat Greek yogurt
1 tsp cocoa powder
½ tsp vanilla
1–2 tsp powdered sweetener or sweetener of choice
1 tsp mini chocolate chips, optional$r$,
 $r$Whisk yogurt, cocoa, vanilla, and sweetener until smooth.
Chill for 10 minutes and top with chocolate chips if using.$r$,
 $r$A little espresso powder intensifies the chocolate flavor.$r$),
($r$Desserts$r$, 22, $r$Strawberries & Vanilla Cheesecake Dip$r$, 170, 18, $r$1 serving$r$,
 $r$½ cup low-fat cottage cheese
¼ cup nonfat Greek yogurt
½ tsp vanilla
Sweetener to taste
1 cup strawberries$r$,
 $r$Blend cottage cheese, yogurt, vanilla, and sweetener until smooth.
Serve as a dip for sliced strawberries.$r$,
 $r$Blending makes cottage cheese creamy and cheesecake-like.$r$),
($r$Desserts$r$, 23, $r$Frozen Banana Protein Bites$r$, 190, 12, $r$1 serving$r$,
 $r$½ medium banana, sliced
¼ cup Greek yogurt
1 tsp peanut butter
1 tsp mini chocolate chips$r$,
 $r$Stir peanut butter into yogurt.
Sandwich a little yogurt mixture between banana slices or spoon it on top.
Sprinkle with chocolate chips and freeze until firm.$r$,
 $r$Let sit for 2–3 minutes before eating for a softer texture.$r$),
($r$Desserts$r$, 24, $r$Apple Cinnamon Protein Crumble for One$r$, 230, 18, $r$1 serving$r$,
 $r$1 small apple, diced
¼ cup rolled oats
½ scoop vanilla protein powder
1 tbsp powdered peanut butter
Cinnamon
1–2 tbsp water$r$,
 $r$Place apple and cinnamon in a small oven-safe dish with a splash of water; microwave 1–2 minutes to soften.
Mix oats, protein powder, powdered peanut butter, and enough water to make crumbs.
Scatter topping over apple and bake at 350°F / 175°C for 10–15 minutes, or until golden.$r$,
 $r$Check that the topping does not dry out; add a teaspoon of water if needed.$r$);
