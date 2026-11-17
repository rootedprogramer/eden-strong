-- Glow Up: natural skin, hair, body & nails, and self-care for Eden Strong.
-- Creates the tables, then loads 33 guides and recipes.
-- Safe to run again: it updates the content in place and never touches members' routines.

create table if not exists glow_items (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  category text not null,          -- skin | hair | body | selfcare
  kind text not null default 'guide', -- guide | recipe
  title text not null,
  summary text,
  time_label text,
  how_often text,
  need text,                       -- one item per line
  steps text,                      -- one step per line
  tip text,
  caution text,
  verse text,
  verse_ref text,
  skin_types text[] default '{}',  -- empty = everyone
  hair_types text[] default '{}',
  slot text,                       -- am | pm | weekly: where it fits in a routine
  image text,
  edition text default 'women',
  sort_order int default 0,
  created_at timestamptz default now()
);

create table if not exists glow_profiles (
  user_id uuid primary key references auth.users on delete cascade,
  skin_type text,
  hair_type text,
  updated_at timestamptz default now()
);

create table if not exists glow_steps (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  slot text not null,              -- am | pm | weekly
  title text not null,
  note text,
  item_id uuid references glow_items on delete set null,
  sort_order int default 0,
  created_at timestamptz default now()
);

create table if not exists glow_checks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  step_id uuid not null references glow_steps on delete cascade,
  check_date date not null,
  unique (step_id, check_date)
);

alter table glow_items enable row level security;
alter table glow_profiles enable row level security;
alter table glow_steps enable row level security;
alter table glow_checks enable row level security;

drop policy if exists "Eden Strong members read glow items" on glow_items;
create policy "Eden Strong members read glow items" on glow_items for select using (
  edition is null or public.my_edition() = edition or public.is_admin()
);
drop policy if exists "Admins manage glow items" on glow_items;
create policy "Admins manage glow items" on glow_items for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Own glow profile" on glow_profiles;
create policy "Own glow profile" on glow_profiles for all using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "Own glow steps" on glow_steps;
create policy "Own glow steps" on glow_steps for all using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "Own glow checks" on glow_checks;
create policy "Own glow checks" on glow_checks for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create index if not exists glow_steps_user on glow_steps (user_id, slot, sort_order);
create index if not exists glow_checks_user on glow_checks (user_id, check_date);

insert into glow_items (slug, category, kind, title, summary, time_label, how_often, need, steps, tip, caution, verse, verse_ref, skin_types, hair_types, slot, sort_order) values
($q$know-your-skin$q$, 'skin', 'guide', $q$Know Your Skin Type$q$, $q$A simple bare-face test to learn whether your skin is dry, oily, combination, normal, or sensitive.$q$, $q$5 min, then wait 30$q$, $q$Once, and again with the seasons$q$,
 $q$A gentle cleanser
A clean towel
A mirror and good light$q$,
 $q$Wash your face with a gentle cleanser and pat it dry.
Put nothing on it. Wait 30 minutes.
Look closely in natural light and notice how it feels.
Tight, flaky, or rough all over: dry skin.
Shiny all over by the 30 minutes: oily skin.
Shiny forehead, nose, and chin but normal or dry cheeks: combination skin.
Comfortable, not tight or shiny: normal skin.
Stings, flushes, or reacts to many products: sensitive skin. Treat it gently whatever else you notice.
Set your skin type in My Routine so Glow Up can point you to what fits.$q$,
 $q$Skin changes with weather, hormones, and stress. Check again if your routine stops feeling right.$q$, null, $q$I will praise thee; for I am fearfully and wonderfully made.$q$, $q$Psalm 139:14$q$, '{}'::text[], '{}'::text[], null, 1),
($q$morning-skin$q$, 'skin', 'guide', $q$Morning Skin Routine$q$, $q$Three simple steps that protect your skin all day: cleanse, moisturize, and sunscreen.$q$, $q$5 min$q$, $q$Every morning$q$,
 $q$Gentle cleanser (or just lukewarm water)
Moisturizer for your skin type
Broad-spectrum sunscreen, SPF 30 or higher$q$,
 $q$Rinse with lukewarm water, or use a gentle cleanser if you woke up oily.
Pat dry with a clean towel. No rubbing.
While skin is still a little damp, smooth on moisturizer.
Finish with sunscreen on face, neck, and ears. Use about a nickel-sized amount for the face.
Give it a minute to settle before makeup.$q$,
 $q$Dry skin: pick a richer cream. Oily skin: a light gel or lotion. Sensitive skin: fragrance-free everything.$q$, null, $q$Strength and honour are her clothing; and she shall rejoice in time to come.$q$, $q$Proverbs 31:25$q$, '{}'::text[], '{}'::text[], $q$am$q$, 2),
($q$evening-skin$q$, 'skin', 'guide', $q$Evening Skin Routine$q$, $q$Wash off the day and give your skin what it needs to repair overnight.$q$, $q$5-10 min$q$, $q$Every evening$q$,
 $q$Cleansing oil or balm (if you wore sunscreen or makeup)
Gentle cleanser
Moisturizer
Lip balm$q$,
 $q$If you wore sunscreen or makeup, massage a cleansing oil over dry skin for 30-60 seconds, then rinse.
Wash with your gentle cleanser and lukewarm water.
Pat dry.
Apply moisturizer to slightly damp skin, including your neck.
Finish with lip balm.$q$,
 $q$Use this time as a wind-down. Pray, breathe slowly, or thank God for one thing from your day.$q$, null, $q$For though our outward man perish, yet the inward man is renewed day by day.$q$, $q$2 Corinthians 4:16$q$, '{}'::text[], '{}'::text[], $q$pm$q$, 3),
($q$sunscreen$q$, 'skin', 'guide', $q$Sunscreen: Your Best Glow Product$q$, $q$Daily sunscreen helps prevent dark spots, early wrinkles, and sunburn. Here is how to use it well.$q$, $q$1 min$q$, $q$Every morning, and reapply outdoors$q$,
 $q$Broad-spectrum sunscreen, SPF 30 or higher
A mineral (zinc or titanium) formula if your skin is sensitive$q$,
 $q$Make it the last step of your morning routine.
Use enough: about a nickel-sized amount for the face, more for neck and ears.
Wear it on cloudy days too. UV rays come through clouds and windows.
Reapply every 2 hours when you are outdoors, and after swimming or sweating.$q$,
 $q$The best sunscreen is the one you like enough to wear every day. Try a tinted one if a white cast bothers you.$q$, null, $q$The sun shall not smite thee by day, nor the moon by night.$q$, $q$Psalm 121:6$q$, '{}'::text[], '{}'::text[], $q$am$q$, 4),
($q$exfoliate$q$, 'skin', 'guide', $q$Gentle Weekly Exfoliation$q$, $q$Clear away dull skin once a week without scrubbing your face raw.$q$, $q$5 min$q$, $q$Once a week (every 2 weeks for sensitive skin)$q$,
 $q$A soft washcloth, or a gentle exfoliating product
Moisturizer$q$,
 $q$Cleanse as usual in the evening.
Wet a soft washcloth with warm water and move it in small, light circles for 30 seconds.
Rinse and pat dry.
Moisturize right away.
Skip it if your skin is irritated, sunburned, or broken out.$q$,
 $q$Gentle and less often beats harsh and frequent. If your skin feels tight or stings, back off.$q$, $q$Avoid sugar, salt, or crushed shell scrubs on your face. They can cause tiny tears. Save them for your body and lips.$q$, $q$He hath made every thing beautiful in his time.$q$, $q$Ecclesiastes 3:11$q$, array['dry','oily','combination','normal'], '{}'::text[], $q$weekly$q$, 5),
($q$glow-from-within$q$, 'skin', 'guide', $q$Glow From the Inside$q$, $q$The habits that show up on your skin: water, sleep, protein, and colorful food.$q$, $q$All day$q$, $q$Daily$q$,
 $q$A water bottle you like
A steady bedtime
Your meal plan$q$,
 $q$Drink water through the day. Keep a bottle where you can see it.
Aim for 7-9 hours of sleep. Your skin does much of its repair at night.
Eat protein at every meal. Your skin, hair, and nails are built from it.
Fill half your plate with fruits and vegetables for vitamins and antioxidants.
Move your body. Exercise brings fresh blood flow to your skin.
Notice stress. Prayer, rest, and time outside all help.$q$,
 $q$Your Eden Strong meal plans and workouts are already doing a lot for your glow.$q$, null, $q$Beloved, I wish above all things that thou mayest prosper and be in health.$q$, $q$3 John 1:2$q$, '{}'::text[], '{}'::text[], null, 6),
($q$honey-oat-mask$q$, 'skin', 'recipe', $q$Honey & Oat Calming Mask$q$, $q$A soothing mask from your kitchen for dry, dull, or tired skin.$q$, $q$15 min$q$, $q$Once a week$q$,
 $q$1 tbsp finely ground oats (blend rolled oats into powder)
1 tbsp raw honey
1 tbsp plain yogurt$q$,
 $q$Stir the oats, honey, and yogurt into a paste.
Spread a thin layer over clean skin, avoiding your eyes.
Relax for 10-15 minutes.
Rinse with lukewarm water, using gentle circles.
Pat dry and moisturize.$q$,
 $q$Make it fresh each time and throw away what you do not use.$q$, $q$Patch test first: dab a little on the inside of your arm and wait 24 hours. Skip it if you see redness, itching, or swelling. Skip the yogurt if you are sensitive to dairy, and the honey if you are allergic to bee products.$q$, $q$Thou art all fair, my love; there is no spot in thee.$q$, $q$Song of Solomon 4:7$q$, array['dry','normal','sensitive','combination'], '{}'::text[], $q$weekly$q$, 7),
($q$green-tea-toner$q$, 'skin', 'recipe', $q$Cooling Green Tea Toner$q$, $q$A light, refreshing toner you brew yourself.$q$, $q$10 min to make$q$, $q$Morning or evening$q$,
 $q$1 green tea bag
1 cup hot water
A clean spray bottle or jar
Cotton pads$q$,
 $q$Steep the tea bag in hot water for 5 minutes.
Let it cool completely, then pour it into a clean bottle.
After cleansing, mist your face or sweep it on with a cotton pad.
Follow with moisturizer.
Keep it in the fridge and make a new batch every 5 days.$q$,
 $q$Cold from the fridge, it feels wonderful on puffy morning eyes. Keep it out of the eyes themselves.$q$, $q$Patch test first: dab a little on the inside of your arm and wait 24 hours. Skip it if you see redness, itching, or swelling.$q$, $q$As cold waters to a thirsty soul, so is good news from a far country.$q$, $q$Proverbs 25:25$q$, array['oily','combination','normal'], '{}'::text[], $q$am$q$, 8),
($q$oil-cleanse$q$, 'skin', 'recipe', $q$Simple Oil Cleanse$q$, $q$Melt away sunscreen and makeup with one plant oil.$q$, $q$3 min$q$, $q$Evenings when you wore sunscreen or makeup$q$,
 $q$1 tsp jojoba, sunflower, or squalane oil
A soft washcloth
Warm water$q$,
 $q$On a dry face, massage the oil in for 30-60 seconds, including over closed eyes if wearing mascara.
Soak a washcloth in warm water and wring it out.
Hold it over your face for a few seconds, then gently wipe the oil away.
Follow with your regular gentle cleanser if your skin feels oily.$q$,
 $q$Jojoba and sunflower oils are lighter and less likely to clog pores than coconut oil on the face.$q$, $q$Patch test first: dab a little on the inside of your arm and wait 24 hours. Skip it if you see redness, itching, or swelling.$q$, $q$Thou anointest my head with oil; my cup runneth over.$q$, $q$Psalm 23:5$q$, array['dry','normal','combination','sensitive'], '{}'::text[], $q$pm$q$, 9),
($q$aloe-soothe$q$, 'skin', 'recipe', $q$Aloe Soothing Gel$q$, $q$Cool, calm relief for skin that is warm, tight, or after too much sun.$q$, $q$2 min$q$, $q$As needed$q$,
 $q$Pure aloe vera gel (from the plant or a 99-100% aloe gel)$q$,
 $q$If using a plant, cut a leaf, let the yellow sap drain for 10 minutes, then scoop out the clear gel.
Chill the gel for extra cooling.
Smooth a thin layer over clean skin.
Let it absorb, then moisturize if your skin still feels dry.$q$,
 $q$Keep store-bought aloe gel in the fridge in summer.$q$, $q$Patch test first: dab a little on the inside of your arm and wait 24 hours. Skip it if you see redness, itching, or swelling. For a blistering or painful sunburn, see a doctor.$q$, $q$Come unto me, all ye that labour and are heavy laden, and I will give you rest.$q$, $q$Matthew 11:28$q$, '{}'::text[], '{}'::text[], null, 10),
($q$sugar-lip-scrub$q$, 'skin', 'recipe', $q$Sugar & Honey Lip Scrub$q$, $q$Soft, smooth lips in two minutes.$q$, $q$2 min$q$, $q$Once or twice a week$q$,
 $q$1 tsp fine sugar
1/2 tsp honey
1/2 tsp coconut or olive oil$q$,
 $q$Mix everything in a small dish.
Rub gently over your lips in small circles for 30 seconds.
Wipe off with a warm, damp cloth.
Finish with lip balm.$q$,
 $q$Make a tiny jar and keep it by the sink for a week.$q$, $q$Do not use on chapped lips that are cracked or bleeding.$q$, $q$Thy lips are like a thread of scarlet, and thy speech is comely.$q$, $q$Song of Solomon 4:3$q$, '{}'::text[], '{}'::text[], $q$weekly$q$, 11),
($q$know-your-hair$q$, 'hair', 'guide', $q$Know Your Hair Type$q$, $q$Straight, wavy, curly, or coily, plus porosity: how easily your hair takes in moisture.$q$, $q$10 min$q$, $q$Once$q$,
 $q$Clean hair with no product
A glass of water$q$,
 $q$Let freshly washed hair air dry with no product.
Straight: falls flat from root to tip.
Wavy: loose S-shapes.
Curly: defined loops or spirals.
Coily: tight coils or zigzags.
Porosity test: drop a clean strand into a glass of water and wait 2-3 minutes.
Floats on top: low porosity. It resists moisture, so use lighter products and a little warmth.
Sinks slowly or floats in the middle: medium porosity. Most products work well.
Sinks quickly: high porosity. It soaks up and loses moisture fast, so seal with butters and oils.
Set your hair type in My Routine.$q$,
 $q$Many heads have more than one pattern. Go by what most of your hair does.$q$, null, $q$But even the very hairs of your head are all numbered.$q$, $q$Matthew 10:30$q$, '{}'::text[], '{}'::text[], null, 12),
($q$wash-day$q$, 'hair', 'guide', $q$Wash Day Routine$q$, $q$Cleanse, condition, and style without stripping your hair.$q$, $q$30-60 min$q$, $q$1-3 times a week, depending on your hair$q$,
 $q$Gentle (sulfate-free) shampoo
Conditioner
Wide-tooth comb
A soft T-shirt or microfiber towel
Leave-in conditioner$q$,
 $q$Wet hair completely with warm water.
Shampoo your scalp, not your lengths. Massage with your fingertips, not nails.
Rinse. The suds will clean the lengths on the way down.
Apply conditioner from mid-lengths to ends. Detangle with a wide-tooth comb, starting at the ends.
Leave it on for 3-5 minutes, then rinse with cooler water.
Squeeze out water with a T-shirt or microfiber towel. No rough rubbing.
Apply leave-in conditioner and style.$q$,
 $q$Straight or oily hair may need washing more often. Curly and coily hair usually does best with fewer washes and more conditioning.$q$, null, $q$Thou anointest my head with oil.$q$, $q$Psalm 23:5$q$, '{}'::text[], '{}'::text[], $q$weekly$q$, 13),
($q$night-hair$q$, 'hair', 'guide', $q$Protect Your Hair at Night$q$, $q$Less breakage and frizz while you sleep.$q$, $q$2 min$q$, $q$Every night$q$,
 $q$A satin or silk pillowcase, bonnet, or scarf
A soft scrunchie$q$,
 $q$Detangle gently with your fingers.
Put long hair in a loose braid or a loose high "pineapple" ponytail on top of your head.
Cover with a satin bonnet or scarf, or sleep on a satin or silk pillowcase.
Avoid tight elastics and sleeping with soaking wet hair.$q$,
 $q$Cotton pulls moisture from hair. Satin and silk let it glide.$q$, null, $q$I will both lay me down in peace, and sleep: for thou, LORD, only makest me dwell in safety.$q$, $q$Psalm 4:8$q$, '{}'::text[], '{}'::text[], $q$pm$q$, 14),
($q$heat-free$q$, 'hair', 'guide', $q$Heat-Free Styling$q$, $q$Give your hair a break from heat with easy no-heat styles.$q$, $q$10 min plus drying time$q$, $q$As often as you like$q$,
 $q$Leave-in conditioner
Soft scrunchies or fabric strips
A satin scarf$q$,
 $q$Start with damp, detangled hair and a little leave-in conditioner.
For waves: two loose braids, or twist hair around a soft robe tie overnight.
For curls and coils: twist-outs or braid-outs set overnight under a bonnet.
For sleek styles: a low bun set while damp with a smoothing cream.
Undo gently with oiled fingertips in the morning.$q$,
 $q$If you do use heat, always use a heat protectant and the lowest setting that works.$q$, null, $q$Whose adorning let it not be that outward adorning of plaiting the hair... but let it be the hidden man of the heart.$q$, $q$1 Peter 3:3-4$q$, '{}'::text[], '{}'::text[], null, 15),
($q$scalp-massage$q$, 'hair', 'guide', $q$5-Minute Scalp Massage$q$, $q$A relaxing habit that loosens buildup and feels wonderful.$q$, $q$5 min$q$, $q$A few times a week$q$,
 $q$Your fingertips
A few drops of light oil (optional)$q$,
 $q$Sit comfortably and relax your shoulders.
Place your fingertips (not nails) on your scalp.
Move in small, firm circles, working from your hairline to the back of your head.
Spend extra time at your temples and the base of your skull.
If using oil, wash it out the next day or on wash day.$q$,
 $q$Pair it with a slow prayer or a favorite worship song.$q$, null, $q$Be still, and know that I am God.$q$, $q$Psalm 46:10$q$, '{}'::text[], '{}'::text[], $q$pm$q$, 16),
($q$rosemary-rinse$q$, 'hair', 'recipe', $q$Rosemary Water Rinse$q$, $q$A fragrant herbal rinse that leaves hair soft and shiny.$q$, $q$20 min to make$q$, $q$1-2 times a week$q$,
 $q$2-3 sprigs fresh rosemary (or 2 tbsp dried)
2 cups water
A spray bottle$q$,
 $q$Bring the water to a boil, add the rosemary, and simmer 10 minutes.
Turn off the heat and let it cool completely, then strain.
Pour into a clean spray bottle.
Mist onto your scalp and hair after washing, or on dry hair between washes.
Massage in. No need to rinse.
Keep it in the fridge and use within a week.$q$,
 $q$Many women love it for scalp care, but be patient and consistent, and do not expect overnight results.$q$, $q$Patch test first: dab a little on the inside of your arm and wait 24 hours. Skip it if you see redness, itching, or swelling. Keep it out of your eyes. If you are pregnant or have a health condition, check with your doctor first.$q$, $q$The grass withereth, the flower fadeth: but the word of our God shall stand for ever.$q$, $q$Isaiah 40:8$q$, '{}'::text[], '{}'::text[], $q$weekly$q$, 17),
($q$avocado-mask$q$, 'hair', 'recipe', $q$Avocado & Honey Deep Conditioning Mask$q$, $q$Rich moisture for dry, thirsty, or high-porosity hair.$q$, $q$30 min$q$, $q$Once a week$q$,
 $q$1/2 ripe avocado
1 tbsp honey
1 tbsp olive oil
A shower cap$q$,
 $q$Mash the avocado until completely smooth (lumps are hard to rinse out).
Stir in the honey and olive oil.
Apply to damp hair from mid-lengths to ends.
Cover with a shower cap for 20-30 minutes.
Rinse well with lukewarm water, then shampoo lightly and condition.$q$,
 $q$Blend it for the smoothest mask, especially for long or thick hair.$q$, $q$Patch test first: dab a little on the inside of your arm and wait 24 hours. Skip it if you see redness, itching, or swelling.$q$, $q$The righteous shall flourish like the palm tree.$q$, $q$Psalm 92:12$q$, '{}'::text[], array['curly','coily','wavy'], $q$weekly$q$, 18),
($q$pre-wash-oil$q$, 'hair', 'recipe', $q$Pre-Wash Oil Treatment$q$, $q$Protect your ends from drying out during washing.$q$, $q$30 min to overnight$q$, $q$Before wash day$q$,
 $q$1-2 tbsp coconut, olive, or jojoba oil
A shower cap or old T-shirt$q$,
 $q$Warm the oil between your palms.
Work it through dry hair, focusing on mid-lengths and ends.
Cover and leave for at least 30 minutes, or overnight with an old pillowcase.
Shampoo as usual. You may need two rounds of shampoo.$q$,
 $q$Low-porosity hair: use lighter oils like jojoba or grapeseed and a little warmth from a warm towel.$q$, null, $q$Thou anointest my head with oil.$q$, $q$Psalm 23:5$q$, '{}'::text[], '{}'::text[], $q$weekly$q$, 19),
($q$flax-gel$q$, 'hair', 'recipe', $q$Aloe & Flaxseed Curl Gel$q$, $q$A soft-hold, homemade gel for defined waves, curls, and coils.$q$, $q$20 min to make$q$, $q$On styling days$q$,
 $q$1/4 cup whole flaxseeds
2 cups water
2 tbsp aloe vera gel
A fine strainer or old stocking
A clean jar$q$,
 $q$Simmer the flaxseeds in water, stirring, for 8-10 minutes until it turns slippery like egg whites.
Strain right away while hot (it thickens as it cools).
Let it cool, then stir in the aloe gel.
Apply to soaking wet hair in sections, then scrunch or rake through.
Air dry or diffuse. Scrunch out the crunch once fully dry.
Keep in the fridge and use within a week.$q$,
 $q$Add a few drops of jojoba oil if your hair likes extra softness.$q$, $q$Patch test first: dab a little on the inside of your arm and wait 24 hours. Skip it if you see redness, itching, or swelling.$q$, $q$He hath made every thing beautiful in his time.$q$, $q$Ecclesiastes 3:11$q$, '{}'::text[], array['wavy','curly','coily'], null, 20),
($q$lock-in-moisture$q$, 'body', 'guide', $q$Soft Skin After Every Shower$q$, $q$The simple timing trick for smoother, softer body skin.$q$, $q$3 min$q$, $q$After every shower or bath$q$,
 $q$Body lotion, cream, or oil
A soft towel$q$,
 $q$Keep showers warm, not hot, and under 10 minutes.
Use a gentle, moisturizing body wash.
Pat yourself mostly dry, leaving skin a little damp.
Apply lotion or oil within about 3 minutes to lock in water.
Give extra to elbows, knees, heels, and hands.$q$,
 $q$Keep your lotion right next to the shower so you never skip it.$q$, null, $q$What? know ye not that your body is the temple of the Holy Ghost which is in you?$q$, $q$1 Corinthians 6:19$q$, '{}'::text[], '{}'::text[], $q$pm$q$, 21),
($q$dry-brush$q$, 'body', 'guide', $q$Dry Brushing$q$, $q$An energizing morning ritual that smooths rough skin.$q$, $q$3-5 min$q$, $q$2-3 times a week$q$,
 $q$A natural-bristle body brush with a firm but gentle feel$q$,
 $q$Before your shower, on dry skin, start at your feet.
Use light, long strokes toward your heart.
Move up your legs, then your arms (hand toward shoulder), then your back and stomach.
Use lighter pressure on thin skin. It should feel good, never scratchy.
Shower, then moisturize.$q$,
 $q$Wash and dry your brush once a week.$q$, $q$Skip any area with a rash, broken skin, sunburn, eczema, or acne. Do not use it on your face.$q$, $q$This is the day which the LORD hath made; we will rejoice and be glad in it.$q$, $q$Psalm 118:24$q$, '{}'::text[], '{}'::text[], $q$am$q$, 22),
($q$nail-care$q$, 'body', 'guide', $q$Natural Nail Care$q$, $q$Healthy, neat nails without a salon.$q$, $q$15 min$q$, $q$Once a week$q$,
 $q$Nail clippers
A glass or fine nail file
An orange stick or cuticle pusher
Cuticle oil (or the recipe here)
Hand cream$q$,
 $q$Start with clean, dry nails.
Trim straight across, then gently round the corners.
File in one direction, not back and forth.
After a shower or a 3-minute warm soak, gently push back cuticles. Do not cut them.
Rub cuticle oil into each nail bed.
Finish with hand cream.$q$,
 $q$Give nails a few polish-free days now and then, and wear gloves for dishes and cleaning.$q$, $q$See a doctor about nails that are painful, swollen, or changing color or shape.$q$, $q$Let all things be done decently and in order.$q$, $q$1 Corinthians 14:40$q$, '{}'::text[], '{}'::text[], $q$weekly$q$, 23),
($q$cuticle-oil$q$, 'body', 'recipe', $q$Nourishing Cuticle Oil$q$, $q$A tiny bottle that keeps nails and cuticles soft.$q$, $q$5 min to make$q$, $q$Every night$q$,
 $q$2 tbsp jojoba oil
1 tsp vitamin E oil
A small rollerball or dropper bottle$q$,
 $q$Pour both oils into a clean bottle and shake.
At night, swipe a drop onto each nail and cuticle.
Massage in for a few seconds.
Keep a bottle by your bed and one in your purse.$q$,
 $q$Doing it right before bed gives it all night to soak in.$q$, null, $q$She looketh well to the ways of her household, and eateth not the bread of idleness.$q$, $q$Proverbs 31:27$q$, '{}'::text[], '{}'::text[], $q$pm$q$, 24),
($q$body-scrub$q$, 'body', 'recipe', $q$Brown Sugar Body Scrub$q$, $q$Smooth, glowing skin from your pantry.$q$, $q$5 min$q$, $q$Once a week$q$,
 $q$1/2 cup brown sugar
1/4 cup coconut or olive oil
1/2 tsp vanilla extract (optional)
A clean jar$q$,
 $q$Mix everything into a damp-sand texture.
In the shower, rub a handful over wet skin in gentle circles.
Focus on elbows, knees, and heels. Skip your face.
Rinse with warm water and pat dry.
Keep the jar sealed and use within 2 weeks. Keep water out of the jar.$q$,
 $q$Swap in finely ground coffee for a cozy, energizing scent.$q$, $q$Oil makes the shower floor slippery. Step carefully. Do not use on freshly shaved, sunburned, or broken skin.$q$, $q$Wash me, and I shall be whiter than snow.$q$, $q$Psalm 51:7$q$, '{}'::text[], '{}'::text[], $q$weekly$q$, 25),
($q$body-butter$q$, 'body', 'recipe', $q$Whipped Shea Body Butter$q$, $q$A rich, fluffy moisturizer for very dry skin.$q$, $q$30 min plus chilling$q$, $q$After showers$q$,
 $q$1/2 cup raw shea butter
1/4 cup coconut oil
2 tbsp sweet almond or olive oil
A hand or stand mixer
A clean jar$q$,
 $q$Melt the shea butter and coconut oil gently over low heat.
Stir in the liquid oil and take it off the heat.
Chill in the fridge for about 30-45 minutes, until it is soft-firm at the edges.
Whip with a mixer for 5-10 minutes until light and fluffy.
Spoon into a clean jar. Store somewhere cool.$q$,
 $q$A little goes a long way. Use it on damp skin right after a shower.$q$, $q$Patch test first: dab a little on the inside of your arm and wait 24 hours. Skip it if you see redness, itching, or swelling. Skip sweet almond oil if you have a nut allergy and use olive oil instead.$q$, $q$Strength and honour are her clothing.$q$, $q$Proverbs 31:25$q$, array['dry','normal'], '{}'::text[], null, 26),
($q$foot-soak$q$, 'body', 'recipe', $q$Soothing Foot Soak$q$, $q$Soft feet and tired legs, restored.$q$, $q$20 min$q$, $q$Once a week$q$,
 $q$A basin of warm water
1/2 cup Epsom salt
A towel
A pumice stone
Thick lotion and cotton socks$q$,
 $q$Dissolve the Epsom salt in a basin of warm (not hot) water.
Soak your feet for 10-15 minutes.
Gently smooth heels with a pumice stone.
Dry well, especially between your toes.
Apply thick lotion and slip on cotton socks for a while.$q$,
 $q$Turn it into quiet time: a devotional, a podcast, or just stillness.$q$, $q$If you have diabetes, poor circulation, or numbness in your feet, check with your doctor before soaking or using a pumice stone.$q$, $q$How beautiful upon the mountains are the feet of him that bringeth good tidings.$q$, $q$Isaiah 52:7$q$, '{}'::text[], '{}'::text[], $q$weekly$q$, 27),
($q$reset-evening$q$, 'selfcare', 'guide', $q$Weekly Reset Evening$q$, $q$One evening a week to rest, refill, and prepare for the week ahead.$q$, $q$1-2 hours$q$, $q$Once a week$q$,
 $q$A free evening (ask for help with the kids if you need it)
Your favorite self-care items
Your Bible or a journal$q$,
 $q$Pick an evening and protect it like an appointment.
Tidy one small space so you can relax in it.
Do your weekly treatments: a face mask, hair mask, or nail care.
Take a warm bath or long shower.
Spend 10 minutes with God: read, journal, or pray over your week.
Go to bed a little early.$q$,
 $q$Rest is not laziness. God built rest into creation.$q$, null, $q$And on the seventh day God ended his work which he had made; and he rested.$q$, $q$Genesis 2:2$q$, '{}'::text[], '{}'::text[], $q$weekly$q$, 28),
($q$beauty-sleep$q$, 'selfcare', 'guide', $q$A Bedtime Routine for Beauty Sleep$q$, $q$Better sleep shows up as brighter skin and more energy.$q$, $q$30 min$q$, $q$Every night$q$,
 $q$A set bedtime
A dim lamp
Your evening skin routine$q$,
 $q$Pick a bedtime that gives you 7-9 hours, and keep it most nights.
About 30 minutes before bed, dim the lights and put your phone away.
Do your evening skin routine and protect your hair.
Read, stretch gently, or pray.
Keep your room cool, dark, and quiet.$q$,
 $q$Charge your phone outside your bedroom so it does not pull you back in.$q$, null, $q$He giveth his beloved sleep.$q$, $q$Psalm 127:2$q$, '{}'::text[], '{}'::text[], $q$pm$q$, 29),
($q$mirror-truth$q$, 'selfcare', 'guide', $q$Speak Truth in the Mirror$q$, $q$Replace critical self-talk with what God says about you.$q$, $q$2 min$q$, $q$Every morning$q$,
 $q$Your mirror
A sticky note or dry-erase marker$q$,
 $q$Write one verse where you will see it each morning.
When you catch yourself criticizing your reflection, pause.
Read the verse out loud.
Thank God for one thing your body did for you yesterday.
Change the verse each week.$q$,
 $q$Start with Psalm 139:14, Song of Solomon 4:7, or 1 Peter 3:3-4.$q$, null, $q$Favour is deceitful, and beauty is vain: but a woman that feareth the LORD, she shall be praised.$q$, $q$Proverbs 31:30$q$, '{}'::text[], '{}'::text[], $q$am$q$, 30),
($q$hydration$q$, 'selfcare', 'guide', $q$Build a Hydration Habit$q$, $q$Simple ways to drink more water without thinking about it.$q$, $q$All day$q$, $q$Daily$q$,
 $q$A water bottle you love
Fruit or herbs for flavor (optional)$q$,
 $q$Drink a glass of water before your morning coffee.
Keep your bottle within reach and refill it at the same times each day.
Drink a glass with every meal.
Add lemon, cucumber, berries, or mint if plain water bores you.
Drink more on workout days and hot days.$q$,
 $q$Pale yellow is a good sign you are drinking enough.$q$, null, $q$But whosoever drinketh of the water that I shall give him shall never thirst.$q$, $q$John 4:14$q$, '{}'::text[], '{}'::text[], $q$am$q$, 31),
($q$bath-soak$q$, 'selfcare', 'recipe', $q$Oat & Salt Relaxing Bath$q$, $q$A calming soak for tired muscles and dry, itchy skin.$q$, $q$20-30 min$q$, $q$Once a week$q$,
 $q$1 cup Epsom salt
1/2 cup finely ground oats in a muslin bag or old stocking
A warm bath$q$,
 $q$Run a warm (not hot) bath.
Dissolve the Epsom salt in the water.
Tie the ground oats into a bag and let it float. Squeeze it now and then.
Soak for 15-20 minutes.
Pat dry and moisturize right away.$q$,
 $q$Light a candle, play worship music, and leave your phone in another room.$q$, $q$If you are pregnant or have heart or blood pressure concerns, keep the water warm rather than hot and check with your doctor.$q$, $q$Come ye yourselves apart into a desert place, and rest a while.$q$, $q$Mark 6:31$q$, '{}'::text[], '{}'::text[], $q$weekly$q$, 32),
($q$digital-rest$q$, 'selfcare', 'guide', $q$A Screen-Free Hour$q$, $q$Give your eyes, mind, and heart a break from the scroll.$q$, $q$1 hour$q$, $q$Daily or a few times a week$q$,
 $q$A basket or drawer for your phone
Something to do: a walk, a book, a hobby, time with family$q$,
 $q$Pick a daily hour, like right after dinner.
Put your phone in the basket and turn on Do Not Disturb.
Go outside, read, create something, or talk with someone you love.
Notice how you feel afterward.$q$,
 $q$Comparison steals joy. Less scrolling often means more contentment with the woman God made you to be.$q$, null, $q$Set your affection on things above, not on things on the earth.$q$, $q$Colossians 3:2$q$, '{}'::text[], '{}'::text[], null, 33)
on conflict (slug) do update set
  category = excluded.category, kind = excluded.kind, title = excluded.title, summary = excluded.summary,
  time_label = excluded.time_label, how_often = excluded.how_often, need = excluded.need, steps = excluded.steps,
  tip = excluded.tip, caution = excluded.caution, verse = excluded.verse, verse_ref = excluded.verse_ref,
  skin_types = excluded.skin_types, hair_types = excluded.hair_types, slot = excluded.slot, sort_order = excluded.sort_order;

select category, count(*) from glow_items group by category order by category;
