-- More recipes: 6 breakfasts, 6 lunches, 6 dinners, 5 snacks, 5 smoothies.
-- Nutrition is per serving, worked out from each ingredient's standard nutrition facts.
-- Safe to run again: it replaces these recipes by title and leaves others alone.

alter table recipes add column if not exists category text;
alter table recipes add column if not exists servings text;
alter table recipes add column if not exists tip text;
alter table recipes add column if not exists sort_order int;
alter table recipes add column if not exists fat numeric;
alter table recipes add column if not exists carbs numeric;

delete from recipes where edition is null and title in (
  $q$Spinach Feta Egg Muffins$q$,
  $q$Greek Yogurt Berry Parfait$q$,
  $q$Turkey Breakfast Hash$q$,
  $q$Banana Protein Oatmeal$q$,
  $q$Egg White Breakfast Burrito$q$,
  $q$Avocado Egg Toast$q$,
  $q$Greek Chicken Grain Bowl$q$,
  $q$Turkey Hummus Wrap$q$,
  $q$Steak and Black Bean Salad$q$,
  $q$Lemon Chicken Pasta Salad$q$,
  $q$Greek Yogurt Tuna Sandwich$q$,
  $q$Sesame Turkey Lettuce Wraps$q$,
  $q$Honey Garlic Salmon and Rice$q$,
  $q$Chicken Fajita Sheet Pan$q$,
  $q$Turkey Taco Stuffed Sweet Potato$q$,
  $q$Lemon Herb Cod with Quinoa$q$,
  $q$Lightened Chicken Parmesan Pasta$q$,
  $q$Shrimp Fried Rice$q$,
  $q$Cottage Cheese Cucumber Bites$q$,
  $q$Sea Salt Edamame$q$,
  $q$Hard-Boiled Eggs and Apple$q$,
  $q$Greek Yogurt Ranch and Veggies$q$,
  $q$Peanut Butter Protein Energy Bites$q$,
  $q$Tropical Green Protein Smoothie$q$,
  $q$Strawberry Banana Protein Smoothie$q$,
  $q$Blueberry Oat Smoothie$q$,
  $q$PB and J Protein Smoothie$q$,
  $q$Cinnamon Roll Smoothie$q$);

insert into recipes (category, sort_order, title, calories, protein, fat, carbs, servings, ingredients, directions, tip) values
($q$Breakfasts$q$, 30, $q$Spinach Feta Egg Muffins$q$, 300, 31, 16, 7, $q$1 serving$q$,
 $q$2 eggs
1/2 cup liquid egg whites
1 cup spinach, chopped
1/2 bell pepper, diced
1 oz feta, crumbled$q$,
 $q$Heat the oven to 350F and spray 4 muffin cups.
Whisk the eggs and egg whites with salt and pepper.
Divide the spinach, pepper and feta between the cups, then pour in the eggs.
Bake 18 to 20 minutes, until set in the middle.$q$,
 $q$Make a double batch on Sunday. They reheat in 30 seconds.$q$),
($q$Breakfasts$q$, 31, $q$Greek Yogurt Berry Parfait$q$, 345, 27, 5, 50, $q$1 serving$q$,
 $q$1 cup plain nonfat Greek yogurt
1 cup mixed berries
1/4 cup low-sugar granola
1 tsp honey$q$,
 $q$Layer half the yogurt, half the berries and half the granola in a jar.
Repeat, then drizzle with honey.$q$,
 $q$Keep the granola separate until you eat so it stays crunchy.$q$),
($q$Breakfasts$q$, 32, $q$Turkey Breakfast Hash$q$, 420, 32, 18, 34, $q$1 serving$q$,
 $q$4 oz lean ground turkey
1 cup diced potatoes
1/2 bell pepper, diced
1/2 onion, diced
1 tsp olive oil
1 egg$q$,
 $q$Microwave the potatoes 3 minutes to soften.
Heat the oil in a skillet and brown the potatoes, pepper and onion.
Add the turkey with salt, pepper and paprika and cook through.
Fry the egg and set it on top.$q$,
 $q$Season the turkey with sage and fennel for a breakfast-sausage taste.$q$),
($q$Breakfasts$q$, 33, $q$Banana Protein Oatmeal$q$, 450, 34, 15, 48, $q$1 serving$q$,
 $q$1/2 cup rolled oats
1 cup unsweetened almond milk
1 scoop vanilla protein powder
1/2 banana, sliced
1 tbsp peanut butter$q$,
 $q$Cook the oats in the almond milk on the stove or in the microwave.
Take off the heat and stir in the protein powder until smooth.
Top with banana and peanut butter.$q$,
 $q$Stir the protein in after cooking so it stays creamy instead of clumpy.$q$),
($q$Breakfasts$q$, 34, $q$Egg White Breakfast Burrito$q$, 355, 32, 9, 37, $q$1 serving$q$,
 $q$1 whole-wheat tortilla
3/4 cup liquid egg whites
1/4 cup black beans, rinsed
1/4 cup salsa
2 tbsp shredded cheddar$q$,
 $q$Scramble the egg whites in a nonstick pan.
Warm the tortilla and beans.
Fill the tortilla with eggs, beans, cheese and salsa, then roll it up.$q$,
 $q$Wrap extras in foil and freeze. Reheat straight from frozen.$q$),
($q$Breakfasts$q$, 35, $q$Avocado Egg Toast$q$, 375, 22, 17, 34, $q$1 serving$q$,
 $q$2 slices whole-grain bread
2 eggs
1/4 avocado
1/2 tomato, sliced$q$,
 $q$Toast the bread.
Mash the avocado with salt, pepper and a squeeze of lemon and spread it on the toast.
Fry or poach the eggs and set them on top with the tomato.$q$,
 $q$Add a pinch of red pepper flakes for heat.$q$),
($q$Lunches$q$, 36, $q$Greek Chicken Grain Bowl$q$, 440, 44, 14, 32, $q$1 serving$q$,
 $q$4 oz cooked chicken breast, sliced
1/2 cup cooked quinoa
1/2 cucumber, diced
1 tomato, diced
1/2 oz feta
2 tbsp hummus$q$,
 $q$Put the quinoa in a bowl.
Top with the chicken, cucumber, tomato and feta.
Add the hummus and a squeeze of lemon.$q$,
 $q$Season the chicken with oregano, garlic and lemon before cooking.$q$),
($q$Lunches$q$, 37, $q$Turkey Hummus Wrap$q$, 310, 22, 10, 34, $q$1 serving$q$,
 $q$1 whole-wheat tortilla
3 oz sliced turkey breast
2 tbsp hummus
1 cup mixed greens
1/4 cucumber, sliced
1/2 tomato, sliced$q$,
 $q$Spread the hummus over the tortilla.
Layer the turkey, greens, cucumber and tomato.
Roll it up tightly and cut in half.$q$,
 $q$Pack the tomato separately if you make it the night before.$q$),
($q$Lunches$q$, 38, $q$Steak and Black Bean Salad$q$, 390, 36, 13, 34, $q$1 serving$q$,
 $q$4 oz sirloin steak
2 cups mixed greens
1/2 cup black beans, rinsed
1 tomato, diced
1/4 cup salsa
1/4 avocado, sliced$q$,
 $q$Season the steak with salt, pepper and cumin and sear 3 to 4 minutes a side.
Rest 5 minutes, then slice thin.
Toss the greens, beans and tomato, top with steak and avocado, and use the salsa as dressing.$q$,
 $q$Leftover steak from dinner works perfectly here.$q$),
($q$Lunches$q$, 39, $q$Lemon Chicken Pasta Salad$q$, 455, 45, 12, 41, $q$1 serving$q$,
 $q$4 oz cooked chicken breast, diced
1 cup cooked whole-wheat pasta
1/2 cup cherry tomatoes
1/4 cucumber, diced
1/2 oz feta
1 tsp olive oil$q$,
 $q$Toss the pasta, chicken, tomatoes and cucumber.
Whisk the oil with lemon juice, garlic, salt and oregano and toss it through.
Top with feta. Serve cold.$q$,
 $q$Tastes even better after a night in the fridge.$q$),
($q$Lunches$q$, 40, $q$Greek Yogurt Tuna Sandwich$q$, 320, 41, 3, 32, $q$1 serving$q$,
 $q$1 can tuna in water, drained
1/4 cup plain Greek yogurt
2 slices whole-grain bread
1/4 cucumber, sliced
a handful of greens$q$,
 $q$Mix the tuna with the yogurt, a little mustard, lemon, salt and pepper.
Pile onto the bread with the cucumber and greens.$q$,
 $q$Add diced pickles or celery for crunch.$q$),
($q$Lunches$q$, 41, $q$Sesame Turkey Lettuce Wraps$q$, 335, 26, 13, 28, $q$1 serving$q$,
 $q$4 oz lean ground turkey
1/2 cup cooked brown rice
1/2 bell pepper, diced
1 tbsp low-sodium soy sauce
1 tsp sesame oil
4 butter lettuce leaves$q$,
 $q$Brown the turkey in the oil with garlic and ginger.
Add the pepper and soy sauce and cook 2 minutes more.
Spoon the rice and turkey into the lettuce cups.$q$,
 $q$Top with sliced green onion and sesame seeds.$q$),
($q$Dinners$q$, 42, $q$Honey Garlic Salmon and Rice$q$, 465, 29, 14, 53, $q$1 serving$q$,
 $q$4 oz salmon fillet
3/4 cup cooked rice
1 cup green beans
2 tsp honey
1 tbsp low-sodium soy sauce$q$,
 $q$Heat the oven to 400F.
Mix the honey, soy sauce and minced garlic and brush it over the salmon.
Roast the salmon and green beans on a sheet pan 12 to 15 minutes.
Serve over the rice.$q$,
 $q$Line the pan with foil. The glaze gets sticky.$q$),
($q$Dinners$q$, 43, $q$Chicken Fajita Sheet Pan$q$, 485, 53, 13, 38, $q$1 serving$q$,
 $q$5 oz chicken breast, sliced
1 bell pepper, sliced
1/2 onion, sliced
1 tsp olive oil
1 whole-wheat tortilla
1/4 cup salsa
2 tbsp Greek yogurt$q$,
 $q$Heat the oven to 425F.
Toss the chicken, pepper and onion with oil, chili powder, cumin and salt.
Roast 18 to 20 minutes.
Serve in the tortilla with salsa and Greek yogurt.$q$,
 $q$Greek yogurt is a high-protein swap for sour cream.$q$),
($q$Dinners$q$, 44, $q$Turkey Taco Stuffed Sweet Potato$q$, 355, 32, 9, 39, $q$1 serving$q$,
 $q$1 medium sweet potato
4 oz lean ground turkey
1/4 cup black beans
1/4 cup salsa
2 tbsp Greek yogurt$q$,
 $q$Microwave the sweet potato 6 to 8 minutes until soft.
Brown the turkey with taco seasoning and stir in the beans.
Split the potato and fill it with the turkey, salsa and yogurt.$q$,
 $q$Bake the potatoes ahead and this is a 10-minute dinner.$q$),
($q$Dinners$q$, 45, $q$Lemon Herb Cod with Quinoa$q$, 375, 38, 9, 35, $q$1 serving$q$,
 $q$6 oz cod fillet
3/4 cup cooked quinoa
1 cup broccoli
1 tsp olive oil$q$,
 $q$Heat the oven to 400F.
Rub the cod with oil, lemon zest, garlic, dill, salt and pepper.
Roast the cod and broccoli 12 minutes, until the fish flakes.
Serve with the quinoa and a squeeze of lemon.$q$,
 $q$Any white fish works: tilapia, haddock or halibut.$q$),
($q$Dinners$q$, 46, $q$Lightened Chicken Parmesan Pasta$q$, 525, 54, 13, 48, $q$1 serving$q$,
 $q$4 oz chicken breast
1 cup cooked whole-wheat pasta
1/2 cup marinara
1 oz part-skim mozzarella
1 tbsp parmesan$q$,
 $q$Season and cook the chicken in a skillet, then slice.
Toss the pasta with the marinara in a small baking dish and top with the chicken.
Sprinkle with both cheeses and broil 2 to 3 minutes until bubbly.$q$,
 $q$Add spinach to the sauce for extra greens.$q$),
($q$Dinners$q$, 47, $q$Shrimp Fried Rice$q$, 435, 41, 10, 43, $q$1 serving$q$,
 $q$5 oz shrimp, peeled
3/4 cup cooked rice (day-old is best)
1 egg
1 cup frozen peas and carrots
1 tbsp low-sodium soy sauce
1 tsp oil$q$,
 $q$Heat the oil in a large skillet over high heat and cook the shrimp until pink. Set aside.
Scramble the egg in the pan, then add the vegetables and rice.
Stir-fry 3 minutes, add the soy sauce and shrimp, and toss.$q$,
 $q$Cold rice fries up best. Cook it the day before.$q$),
($q$Snacks$q$, 48, $q$Cottage Cheese Cucumber Bites$q$, 95, 14, 1, 6, $q$1 serving$q$,
 $q$1/2 cup low-fat cottage cheese
1/2 cucumber, sliced into rounds$q$,
 $q$Top each cucumber round with a spoonful of cottage cheese.
Sprinkle with everything bagel seasoning.$q$,
 $q$Cherry tomatoes work too.$q$),
($q$Snacks$q$, 49, $q$Sea Salt Edamame$q$, 140, 14, 6, 10, $q$1 serving$q$,
 $q$3/4 cup shelled edamame$q$,
 $q$Steam or microwave the edamame 3 minutes.
Toss with flaky salt and a squeeze of lime.$q$,
 $q$Buy it frozen and keep a bag on hand.$q$),
($q$Snacks$q$, 50, $q$Hard-Boiled Eggs and Apple$q$, 240, 13, 10, 26, $q$1 serving$q$,
 $q$2 hard-boiled eggs
1 apple$q$,
 $q$Peel the eggs and season with salt and pepper.
Slice the apple and enjoy together.$q$,
 $q$Boil a dozen eggs on Sunday for the week.$q$),
($q$Snacks$q$, 51, $q$Greek Yogurt Ranch and Veggies$q$, 135, 19, 1, 15, $q$1 serving$q$,
 $q$3/4 cup plain Greek yogurt
1 bell pepper, sliced
1/2 cucumber, sliced$q$,
 $q$Stir dried dill, garlic powder, onion powder, salt and pepper into the yogurt.
Dip the vegetables.$q$,
 $q$Make a big batch of the dip. It keeps 5 days.$q$),
($q$Snacks$q$, 52, $q$Peanut Butter Protein Energy Bites$q$, 260, 15, 13, 22, $q$6 servings (2 bites each)$q$,
 $q$1 cup rolled oats
2 scoops vanilla protein powder
1/2 cup peanut butter
2 tbsp honey
2 tbsp chia seeds$q$,
 $q$Stir everything together. Add a splash of milk if it is too dry to hold.
Roll into 12 balls and chill 30 minutes.
One serving is 2 bites.$q$,
 $q$Keep them in the fridge up to a week or the freezer up to a month.$q$),
($q$Smoothies$q$, 53, $q$Tropical Green Protein Smoothie$q$, 250, 27, 4, 29, $q$1 serving$q$,
 $q$1 cup unsweetened almond milk
1 scoop vanilla protein powder
1/2 cup pineapple
1/2 cup frozen mango
1 cup spinach$q$,
 $q$Blend everything until smooth. Add ice for a thicker shake.$q$,
 $q$You will not taste the spinach, promise.$q$),
($q$Smoothies$q$, 54, $q$Strawberry Banana Protein Smoothie$q$, 320, 38, 5, 34, $q$1 serving$q$,
 $q$1 cup unsweetened almond milk
1 scoop vanilla protein powder
1 cup frozen strawberries
1/2 banana
1/2 cup plain Greek yogurt$q$,
 $q$Blend everything until smooth.$q$,
 $q$Freeze ripe banana halves so they are ready to go.$q$),
($q$Smoothies$q$, 55, $q$Blueberry Oat Smoothie$q$, 370, 31, 10, 44, $q$1 serving$q$,
 $q$1 cup unsweetened almond milk
1 scoop vanilla protein powder
1 cup frozen blueberries
1/4 cup rolled oats
1 tbsp chia seeds$q$,
 $q$Blend everything until smooth. Let it sit 2 minutes to thicken.$q$,
 $q$The oats make this filling enough for breakfast.$q$),
($q$Smoothies$q$, 56, $q$PB and J Protein Smoothie$q$, 370, 39, 8, 37, $q$1 serving$q$,
 $q$1 cup 2% milk
1 scoop vanilla protein powder
1 cup frozen mixed berries
2 tbsp powdered peanut butter$q$,
 $q$Blend everything until smooth.$q$,
 $q$Swap in almond milk to save about 90 calories.$q$),
($q$Smoothies$q$, 57, $q$Cinnamon Roll Smoothie$q$, 360, 42, 7, 34, $q$1 serving$q$,
 $q$1 cup unsweetened almond milk
1 scoop vanilla protein powder
1/2 cup low-fat cottage cheese
1/2 frozen banana
1/4 cup rolled oats$q$,
 $q$Blend everything with 1/2 tsp cinnamon and a splash of vanilla until smooth.$q$,
 $q$The cottage cheese makes it thick and creamy, like cheesecake.$q$);
