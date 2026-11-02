// Calorie goals, macro balances, and food search for the Nutrition log.

// Macro balances as percent of calories. Protein and carbs are 4 calories
// per gram, fat is 9, so grams follow automatically from the calorie goal.
export const SPLITS = [
  { id: 'balanced', label: 'Balanced', protein: 30, carbs: 40, fat: 30 },
  { id: 'protein', label: 'Higher protein', protein: 40, carbs: 35, fat: 25 },
  { id: 'lowcarb', label: 'Lower carb', protein: 40, carbs: 25, fat: 35 },
];

export function macrosFor(calories, pct) {
  const cal = Number(calories) || 0;
  return {
    protein: Math.round((cal * (pct.protein / 100)) / 4),
    carbs: Math.round((cal * (pct.carbs / 100)) / 4),
    fat: Math.round((cal * (pct.fat / 100)) / 9),
  };
}

// Reads a saved goal's percentages, or works them out from saved grams
// (for goals saved before percentages existed).
export function pctFromGoal(goal) {
  if (goal?.protein_pct && goal?.carbs_pct && goal?.fat_pct) {
    return { protein: goal.protein_pct, carbs: goal.carbs_pct, fat: goal.fat_pct };
  }
  if (goal?.calories) {
    const p = Math.round(((goal.protein || 0) * 4 * 100) / goal.calories);
    const c = Math.round(((goal.carbs || 0) * 4 * 100) / goal.calories);
    const f = 100 - p - c;
    if (p > 0 && c > 0 && f > 0) return { protein: p, carbs: c, fat: f };
  }
  return { protein: 30, carbs: 40, fat: 30 };
}

export function splitIdFor(pct) {
  const match = SPLITS.find((s) => s.protein === pct.protein && s.carbs === pct.carbs && s.fat === pct.fat);
  return match ? match.id : 'custom';
}

// Nutrition for an amount of a food, from its per-100 g values
export function scaleFood(per100, grams) {
  const f = (Number(grams) || 0) / 100;
  return {
    calories: Math.round(per100.calories * f),
    protein: Math.round(per100.protein * f),
    carbs: Math.round(per100.carbs * f),
    fat: Math.round(per100.fat * f),
  };
}

const round1 = (n) => Math.round((Number(n) || 0) * 10) / 10;

function normalizeOff(p) {
  const n = p.nutriments || {};
  const kcal = n['energy-kcal_100g'] ?? (n['energy_100g'] ? n['energy_100g'] / 4.184 : null);
  if (kcal == null || !p.product_name) return null;
  const servings = [];
  if (p.serving_quantity && Number(p.serving_quantity) > 0) {
    servings.push({ label: `1 serving (${p.serving_size || `${p.serving_quantity} g`})`, grams: Number(p.serving_quantity) });
  }
  return {
    id: `off-${p.code || p.product_name}`,
    name: p.product_name,
    brand: (p.brands || '').split(',')[0].trim() || null,
    per100: { calories: round1(kcal), protein: round1(n.proteins_100g), carbs: round1(n.carbohydrates_100g), fat: round1(n.fat_100g) },
    servings,
  };
}

// Searches foods through the site's Netlify function. If that isn't
// available (for example when running locally), asks Open Food Facts directly.
export async function searchFoods(query) {
  const q = query.trim();
  if (q.length < 2) return [];
  try {
    const res = await fetch(`/.netlify/functions/food-search?q=${encodeURIComponent(q)}`);
    if (res.ok && (res.headers.get('content-type') || '').includes('json')) {
      const data = await res.json();
      return data.results || [];
    }
  } catch {
    // fall through to the direct lookup
  }
  const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(q)}&search_simple=1&action=process&json=1&page_size=15&fields=code,product_name,brands,nutriments,serving_size,serving_quantity`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Food search is unavailable right now.');
  const data = await res.json();
  return (data.products || []).map(normalizeOff).filter(Boolean).slice(0, 12);
}
