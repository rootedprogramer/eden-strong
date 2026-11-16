import { supabase } from './supabaseClient';
import { MEALS } from './admin';

// Meal plan helpers shared by the library, the plan view, Nutrition, and admin.
// A plan item can call for more than one serving of a recipe (e.g. 1.5), so
// every total is the recipe's per-serving numbers times the item's servings.

export const servingsOf = (item) => Number(item?.servings) || 1;

const FRACTIONS = { 0.25: '¼', 0.5: '½', 0.75: '¾' };
export function formatServings(n) {
  const v = Number(n) || 1;
  const whole = Math.floor(v);
  const frac = FRACTIONS[Math.round((v - whole) * 100) / 100] || (v - whole ? String(Math.round((v - whole) * 100) / 100).slice(1) : '');
  const text = `${whole || ''}${frac}` || '1';
  return `${text} serving${v === 1 ? '' : 's'}`;
}

const round1 = (n) => Math.round(n * 10) / 10;

// Calories, protein, fat and carbs for one item (null where the recipe has no number)
export function itemNutrition(item) {
  const r = item.recipe || {};
  const s = servingsOf(item);
  const pick = (k) => (r[k] == null ? null : round1(Number(r[k]) * s));
  return { calories: r.calories == null ? null : Math.round(r.calories * s), protein: pick('protein'), fat: pick('fat'), carbs: pick('carbs') };
}

export function dayTotals(items) {
  return items.reduce(
    (t, it) => {
      const n = itemNutrition(it);
      return { calories: t.calories + (n.calories || 0), protein: round1(t.protein + (n.protein || 0)) };
    },
    { calories: 0, protein: 0 }
  );
}

export const sortMeals = (items) =>
  [...items].sort((a, b) => MEALS.indexOf(a.meal) - MEALS.indexOf(b.meal) || (a.sort_order || 0) - (b.sort_order || 0));

// One plan with its items and their recipes
export async function loadPlan(planId) {
  const { data: plan } = await supabase.from('meal_plans').select('*').eq('id', planId).maybeSingle();
  if (!plan) return null;
  const { data: items } = await supabase.from('meal_plan_items').select('*').eq('plan_id', plan.id);
  const ids = [...new Set((items || []).map((i) => i.recipe_id))];
  let recipes = {};
  if (ids.length) {
    const { data: rs } = await supabase.from('recipes').select('id, title, calories, protein, fat, carbs, category, image').in('id', ids);
    recipes = Object.fromEntries((rs || []).map((r) => [r.id, r]));
  }
  return { plan, items: (items || []).map((i) => ({ ...i, recipe: recipes[i.recipe_id] })).filter((i) => i.recipe) };
}

// The plan a coach assigned to this member, if any
export async function loadMyMealPlan() {
  const { data: userData } = await supabase.auth.getUser();
  const uid = userData?.user?.id;
  if (!uid) return null;
  const { data: assignment } = await supabase
    .from('meal_plan_assignments')
    .select('plan_id')
    .eq('user_id', uid)
    .eq('active', true)
    .order('assigned_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!assignment) return null;
  return loadPlan(assignment.plan_id);
}

// Library plans for this member's edition (the database only returns the ones they can see)
export async function loadLibrary() {
  const { data } = await supabase
    .from('meal_plans')
    .select('id, title, description, calories, protein_min, protein_max, audience, image, sort_order')
    .eq('is_library', true)
    .order('sort_order', { ascending: true });
  return data || [];
}

export const proteinRange = (p) =>
  p.protein_min != null && p.protein_max != null ? `${p.protein_min}-${p.protein_max}g protein` : p.protein_min != null ? `${p.protein_min}g+ protein` : '';
