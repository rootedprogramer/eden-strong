import { supabase } from './supabaseClient';
import { todayISO } from './workout';

// Glow Up: natural skin, hair, body and self-care (Eden Strong only).

export const GLOW_CATEGORIES = [
  { id: 'skin', title: 'Skin', sub: 'Routines, sunscreen, and gentle masks', tone: 'rose' },
  { id: 'hair', title: 'Hair', sub: 'Wash day, protection, and natural treatments', tone: 'olive' },
  { id: 'body', title: 'Body & Nails', sub: 'Soft skin, scrubs, and nail care', tone: 'gold' },
  { id: 'selfcare', title: 'Self-Care', sub: 'Rest, sleep, and speaking truth', tone: 'sage' },
];
export const categoryOf = (id) => GLOW_CATEGORIES.find((c) => c.id === id);

export const SKIN_TYPES = [
  ['dry', 'Dry'],
  ['oily', 'Oily'],
  ['combination', 'Combination'],
  ['normal', 'Normal'],
  ['sensitive', 'Sensitive'],
];
export const HAIR_TYPES = [
  ['straight', 'Straight'],
  ['wavy', 'Wavy'],
  ['curly', 'Curly'],
  ['coily', 'Coily'],
];

export const SLOTS = [
  { id: 'am', label: 'Morning' },
  { id: 'pm', label: 'Evening' },
  { id: 'weekly', label: 'This week' },
];

const MOISTURIZER = {
  dry: 'A rich cream',
  oily: 'A light gel or lotion',
  combination: 'A light lotion; a little more on dry areas',
  normal: 'A lotion you like',
  sensitive: 'Fragrance-free',
};

// A simple starting routine, shaped a little by skin and hair type.
// Each step can link to its guide by slug.
export function starterSteps(skin, hair) {
  const curlsOrCoils = hair === 'curly' || hair === 'coily';
  return [
    { slot: 'am', title: 'Rinse or gently cleanse', slug: 'morning-skin' },
    { slot: 'am', title: 'Moisturize', note: MOISTURIZER[skin] || null, slug: 'morning-skin' },
    { slot: 'am', title: 'Sunscreen, SPF 30+', slug: 'sunscreen' },
    { slot: 'am', title: 'A glass of water and a verse in the mirror', slug: 'mirror-truth' },
    { slot: 'pm', title: 'Cleanse (oil first if you wore sunscreen or makeup)', slug: 'evening-skin' },
    { slot: 'pm', title: 'Moisturize and lip balm', note: MOISTURIZER[skin] || null, slug: 'evening-skin' },
    { slot: 'pm', title: 'Cuticle oil', slug: 'cuticle-oil' },
    { slot: 'pm', title: 'Protect your hair for sleep', slug: 'night-hair' },
    {
      slot: 'weekly',
      title: skin === 'sensitive' ? 'Calming face mask' : 'Gentle exfoliation',
      note: skin === 'sensitive' ? 'Skip exfoliating, or do it every other week' : null,
      slug: skin === 'sensitive' ? 'honey-oat-mask' : 'exfoliate',
    },
    { slot: 'weekly', title: curlsOrCoils ? 'Deep conditioning mask' : 'Pre-wash oil treatment', slug: curlsOrCoils ? 'avocado-mask' : 'pre-wash-oil' },
    { slot: 'weekly', title: 'Nail care', slug: 'nail-care' },
    { slot: 'weekly', title: 'Weekly reset evening', slug: 'reset-evening' },
  ];
}

export const lines = (text) => (text || '').split('\n').map((s) => s.trim()).filter(Boolean);

async function uid() {
  const { data } = await supabase.auth.getUser();
  return data?.user?.id || null;
}

// Monday of this week, as YYYY-MM-DD
export function weekStartISO(d = new Date()) {
  const x = new Date(d);
  const day = (x.getDay() + 6) % 7;
  x.setDate(x.getDate() - day);
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;
}

export async function loadGlowHome() {
  const user = await uid();
  if (!user) return null;
  const [{ data: profile }, { data: steps }, { data: checks }] = await Promise.all([
    supabase.from('glow_profiles').select('*').eq('user_id', user).maybeSingle(),
    supabase.from('glow_steps').select('*, glow_items(slug)').eq('user_id', user).order('sort_order', { ascending: true }),
    supabase.from('glow_checks').select('step_id, check_date').eq('user_id', user).gte('check_date', weekStartISO()),
  ]);
  return { user, profile, steps: steps || [], checks: checks || [] };
}

// Weekly steps count as done if checked any day this week; daily ones only today.
export function isDone(step, checks) {
  const today = todayISO();
  return checks.some((c) => c.step_id === step.id && (step.slot === 'weekly' || c.check_date === today));
}

export async function toggleCheck(step, checks) {
  const user = await uid();
  const today = todayISO();
  const existing = checks.filter((c) => c.step_id === step.id && (step.slot === 'weekly' || c.check_date === today));
  if (existing.length) {
    await supabase.from('glow_checks').delete().eq('step_id', step.id).in('check_date', existing.map((c) => c.check_date));
    return checks.filter((c) => !existing.includes(c));
  }
  await supabase.from('glow_checks').insert({ user_id: user, step_id: step.id, check_date: today });
  return [...checks, { step_id: step.id, check_date: today }];
}

export async function saveProfile(skin_type, hair_type) {
  const user = await uid();
  await supabase.from('glow_profiles').upsert({ user_id: user, skin_type, hair_type, updated_at: new Date().toISOString() });
}

export async function createStarterRoutine(skin, hair) {
  const user = await uid();
  await saveProfile(skin, hair);
  const steps = starterSteps(skin, hair);
  const { data: items } = await supabase.from('glow_items').select('id, slug').in('slug', steps.map((s) => s.slug));
  const bySlug = Object.fromEntries((items || []).map((i) => [i.slug, i.id]));
  await supabase.from('glow_steps').insert(
    steps.map((s, i) => ({ user_id: user, slot: s.slot, title: s.title, note: s.note || null, item_id: bySlug[s.slug] || null, sort_order: i }))
  );
}

export async function addStep(slot, title, itemId = null, note = null) {
  const user = await uid();
  const { data: last } = await supabase.from('glow_steps').select('sort_order').eq('user_id', user).order('sort_order', { ascending: false }).limit(1).maybeSingle();
  return supabase.from('glow_steps').insert({ user_id: user, slot, title, note, item_id: itemId, sort_order: (last?.sort_order ?? -1) + 1 });
}

export async function loadItems(category) {
  let q = supabase.from('glow_items').select('id, slug, category, kind, title, summary, time_label, how_often, skin_types, hair_types, image').order('sort_order');
  if (category) q = q.eq('category', category);
  const { data } = await q;
  return data || [];
}

export async function loadItem(slug) {
  const { data } = await supabase.from('glow_items').select('*').eq('slug', slug).maybeSingle();
  return data;
}

// Does this item fit the member's skin or hair type? Empty tags fit everyone.
export function fitsMe(item, profile) {
  const s = item.skin_types || [];
  const h = item.hair_types || [];
  if (s.length && profile?.skin_type && !s.includes(profile.skin_type)) return false;
  if (h.length && profile?.hair_type && !h.includes(profile.hair_type)) return false;
  return true;
}
export function pickedForMe(item, profile) {
  return ((item.skin_types || []).includes(profile?.skin_type)) || ((item.hair_types || []).includes(profile?.hair_type));
}
