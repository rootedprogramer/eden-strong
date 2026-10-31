// Tap Cook — ingredient catalog, recipe matching, and the member's kitchen
// (pantry + grocery list). In One Accord, linked spouses share one
// kitchen: the database lets each spouse read and change the other's rows.

import { supabase } from './supabaseClient';

// Ingredients people can tap. The key is what recipes.ingredient_keys uses.
// To add one: add it here, then use the same key in a recipe's ingredient_keys.
export const INGREDIENT_GROUPS = [
  {
    name: 'Protein',
    items: [
      ['chicken', 'Chicken'],
      ['ground_turkey', 'Ground turkey'],
      ['lean_beef', 'Steak'],
      ['salmon', 'Salmon'],
      ['shrimp', 'Shrimp'],
      ['eggs', 'Eggs'],
      ['black_beans', 'Black beans'],
      ['chickpeas', 'Chickpeas'],
    ],
  },
  {
    name: 'Produce',
    items: [
      ['spinach', 'Spinach'],
      ['broccoli', 'Broccoli'],
      ['bell_pepper', 'Bell pepper'],
      ['onion', 'Onion'],
      ['garlic', 'Garlic'],
      ['sweet_potato', 'Sweet potato'],
      ['zucchini', 'Zucchini'],
      ['tomato', 'Tomatoes'],
      ['cucumber', 'Cucumber'],
      ['avocado', 'Avocado'],
      ['lemon', 'Lemon'],
      ['lime', 'Lime'],
      ['banana', 'Bananas'],
      ['berries', 'Berries'],
    ],
  },
  {
    name: 'Grains',
    items: [
      ['rice', 'Rice'],
      ['quinoa', 'Quinoa'],
      ['oats', 'Oats'],
      ['tortillas', 'Tortillas'],
    ],
  },
  {
    name: 'Dairy',
    items: [
      ['greek_yogurt', 'Greek yogurt'],
      ['cheese', 'Cheese'],
      ['milk', 'Milk'],
    ],
  },
  {
    name: 'Pantry',
    items: [
      ['peanut_butter', 'Peanut butter'],
      ['salsa', 'Salsa'],
      ['canned_tomatoes', 'Canned tomatoes'],
      ['soy_sauce', 'Soy sauce'],
      ['honey', 'Honey'],
    ],
  },
];

const LABELS = Object.fromEntries(INGREDIENT_GROUPS.flatMap((g) => g.items));
export const labelFor = (key) => LABELS[key] || key.replace(/_/g, ' ');

// Assumed in every kitchen, so recipes never count them as missing.
export const BASICS = 'Olive oil, salt, pepper, and everyday spices';

// Goal filters. Each matches a value in recipes.tags.
export const GOAL_FILTERS = [
  { id: 'protein', label: 'High protein' },
  { id: 'recovery', label: 'Recovery' },
  { id: 'energy', label: 'Quick energy' },
];

// Said at the end of cooking mode, before the meal is logged.
export const MEAL_BLESSING =
  'Lord, thank you for this food and for the hands that made it. Let it strengthen us to serve you and love the people around this table. Amen.';

// How many of a recipe's ingredients the member is missing.
export function matchRecipe(recipe, have) {
  const keys = recipe.ingredient_keys || [];
  const missing = keys.filter((k) => !have.has(k));
  return { missing, total: keys.length };
}

// ─── Kitchen rows (pantry + grocery) ────────────────────────
// Returns { uid, pantry: Set<key>, grocery: [{ item, label, rows }] }.
// Together: rows from both spouses come back, so the same item can appear
// twice; they're merged here.
export async function loadKitchen() {
  const { data: userData } = await supabase.auth.getUser();
  const uid = userData?.user?.id || null;
  if (!uid) return { uid, pantry: new Set(), grocery: [] };

  const { data } = await supabase
    .from('kitchen_items')
    .select('id, user_id, list, item, label, created_at')
    .order('created_at', { ascending: true });

  const pantry = new Set();
  const groceryMap = new Map();
  for (const row of data || []) {
    if (row.list === 'pantry') pantry.add(row.item);
    else {
      const g = groceryMap.get(row.item) || { item: row.item, label: row.label || labelFor(row.item), rows: [] };
      g.rows.push(row.id);
      groceryMap.set(row.item, g);
    }
  }
  return { uid, pantry, grocery: [...groceryMap.values()] };
}

export async function addToPantry(uid, item) {
  await supabase
    .from('kitchen_items')
    .upsert({ user_id: uid, list: 'pantry', item, label: labelFor(item) }, { onConflict: 'user_id,list,item', ignoreDuplicates: true });
}

// Removes the item for both spouses, so it disappears from the shared pantry.
export async function removeFromPantry(item) {
  await supabase.from('kitchen_items').delete().eq('list', 'pantry').eq('item', item);
}

export async function clearPantry() {
  await supabase.from('kitchen_items').delete().eq('list', 'pantry');
}

export async function addToGrocery(uid, items) {
  if (!items.length) return;
  await supabase
    .from('kitchen_items')
    .upsert(
      items.map((item) => ({ user_id: uid, list: 'grocery', item, label: labelFor(item) })),
      { onConflict: 'user_id,list,item', ignoreDuplicates: true }
    );
}

export async function removeFromGrocery(item) {
  await supabase.from('kitchen_items').delete().eq('list', 'grocery').eq('item', item);
}

// "Got it": off the grocery list and into the pantry.
export async function boughtGrocery(uid, item) {
  await removeFromGrocery(item);
  await addToPantry(uid, item);
}

// True when this member is in Together and linked to a spouse.
export async function isSharedKitchen() {
  const { data } = await supabase.from('couples').select('partner_b').maybeSingle();
  return Boolean(data?.partner_b);
}
