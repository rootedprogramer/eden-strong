// Food search for the Nutrition log.
// GET /.netlify/functions/food-search?q=chicken%20breast
//
// Uses the USDA FoodData Central database when USDA_API_KEY is set in
// Netlify (free key: https://fdc.nal.usda.gov/api-key-signup). Without a
// key, or if USDA has no results, it falls back to Open Food Facts.
//
// Every result comes back in the same shape:
//   { id, name, brand, per100: { calories, protein, carbs, fat },
//     servings: [{ label, grams }] }
// Nutrition is per 100 g, so the app can scale it to any amount.

const KCAL = [1008, 2047, 2048]; // energy (kcal), including Atwater factors
const PROTEIN = 1003;
const FAT = 1004;
const CARBS = 1005;

const round = (n) => Math.round((Number(n) || 0) * 10) / 10;
const titleCase = (s) =>
  String(s || '').toLowerCase().replace(/\b([a-z])/g, (m) => m.toUpperCase());

export function normalizeUsda(food) {
  const nutrients = food.foodNutrients || [];
  const pick = (ids) => {
    for (const id of [].concat(ids)) {
      const n = nutrients.find((x) => (x.nutrientId ?? x.nutrient?.id) === id && String(x.unitName ?? x.nutrient?.unitName ?? '').toUpperCase() !== 'KJ');
      if (n) return Number(n.value ?? n.amount) || 0;
    }
    return null;
  };
  const calories = pick(KCAL);
  if (calories === null) return null;

  const servings = [];
  if (food.servingSize && /^(g|grm|ml|mlt)$/i.test(food.servingSizeUnit || '')) {
    const label = food.householdServingFullText ? `1 serving (${food.householdServingFullText})` : `1 serving (${round(food.servingSize)} ${food.servingSizeUnit.toLowerCase().startsWith('m') ? 'ml' : 'g'})`;
    servings.push({ label, grams: Number(food.servingSize) });
  }
  for (const m of food.foodMeasures || []) {
    if (m.gramWeight && m.disseminationText && !/quantity not specified/i.test(m.disseminationText)) {
      servings.push({ label: m.disseminationText, grams: Number(m.gramWeight) });
    }
    if (servings.length >= 5) break;
  }

  return {
    id: `usda-${food.fdcId}`,
    name: food.brandName || food.brandOwner ? titleCase(food.description) : food.description,
    brand: food.brandName || food.brandOwner || null,
    per100: { calories: round(calories), protein: round(pick(PROTEIN)), carbs: round(pick(CARBS)), fat: round(pick(FAT)) },
    servings,
  };
}

export function normalizeOff(p) {
  const n = p.nutriments || {};
  const kcal = n['energy-kcal_100g'] ?? (n['energy_100g'] ? n['energy_100g'] / 4.184 : null);
  if (kcal == null || !p.product_name) return null;
  const servings = [];
  if (p.serving_quantity && Number(p.serving_quantity) > 0) {
    servings.push({ label: `1 serving (${p.serving_size || `${p.serving_quantity} g`})`, grams: Number(p.serving_quantity) });
  }
  return {
    id: `off-${p.code || p._id || p.product_name}`,
    name: p.product_name,
    brand: (p.brands || '').split(',')[0].trim() || null,
    per100: { calories: round(kcal), protein: round(n.proteins_100g), carbs: round(n.carbohydrates_100g), fat: round(n.fat_100g) },
    servings,
  };
}

async function searchUsda(query, key) {
  const url = new URL('https://api.nal.usda.gov/fdc/v1/foods/search');
  url.searchParams.set('api_key', key);
  url.searchParams.set('query', query);
  url.searchParams.set('pageSize', '15');
  url.searchParams.set('dataType', 'Foundation,SR Legacy,Survey (FNDDS),Branded');
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`USDA ${res.status}`);
  const data = await res.json();
  return (data.foods || []).map(normalizeUsda).filter(Boolean);
}

async function searchOff(query) {
  const url = new URL('https://world.openfoodfacts.org/cgi/search.pl');
  url.searchParams.set('search_terms', query);
  url.searchParams.set('search_simple', '1');
  url.searchParams.set('action', 'process');
  url.searchParams.set('json', '1');
  url.searchParams.set('page_size', '15');
  url.searchParams.set('fields', 'code,product_name,brands,nutriments,serving_size,serving_quantity');
  const res = await fetch(url, { headers: { 'User-Agent': 'EdenStrong/1.0 (food log)' } });
  if (!res.ok) throw new Error(`Open Food Facts ${res.status}`);
  const data = await res.json();
  return (data.products || []).map(normalizeOff).filter(Boolean);
}

export default async (req) => {
  const query = (new URL(req.url).searchParams.get('q') || '').trim().slice(0, 80);
  const headers = { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=86400' };
  if (query.length < 2) return new Response(JSON.stringify({ results: [] }), { headers });

  let results = [];
  let source = null;
  const key = process.env.USDA_API_KEY;
  if (key) {
    try {
      results = await searchUsda(query, key);
      source = 'usda';
    } catch (e) {
      console.error(e);
    }
  }
  if (!results.length) {
    try {
      results = await searchOff(query);
      source = 'openfoodfacts';
    } catch (e) {
      console.error(e);
      return new Response(JSON.stringify({ results: [], error: 'Food search is unavailable right now.' }), { status: 502, headers });
    }
  }
  return new Response(JSON.stringify({ results: results.slice(0, 12), source }), { headers });
};
