import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { COLORS, FONTS } from '../../brand/tokens';
import SubHeader from '../../components/SubHeader';
import Sprig from '../../components/Sprig';
import { supabase } from '../../lib/supabaseClient';

export const RECIPE_CATEGORIES = [
  { key: 'Smoothies', tone: 'rose' },
  { key: 'Snacks', tone: 'gold' },
  { key: 'Breakfasts', tone: 'sage' },
  { key: 'Lunches', tone: 'olive' },
  { key: 'Dinners', tone: 'ink' },
  { key: 'Desserts', tone: 'rose' },
];

export const toneFor = (category) => RECIPE_CATEGORIES.find((c) => c.key === category)?.tone || 'olive';

export default function RecipeBook() {
  const [recipes, setRecipes] = useState(null);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('recipes').select('*');
      const rank = Object.fromEntries(RECIPE_CATEGORIES.map((c, i) => [c.key, i]));
      setRecipes(
        (data || []).sort(
          (a, b) => (rank[a.category] ?? 99) - (rank[b.category] ?? 99) || (a.sort_order ?? 999) - (b.sort_order ?? 999) || a.title.localeCompare(b.title)
        )
      );
    })();
  }, []);

  const present = RECIPE_CATEGORIES.filter((c) => (recipes || []).some((r) => r.category === c.key)).map((c) => c.key);
  const shown = (recipes || []).filter((r) => filter === 'All' || r.category === filter);

  return (
    <>
      <SubHeader title="Recipe book" />
      <div style={{ padding: '4px 16px 32px' }}>
        <h1 style={{ margin: 0, fontFamily: FONTS.display, fontSize: 32, fontWeight: 500, color: COLORS.ink, lineHeight: 1.1 }}>Fuel your strength</h1>
        <p style={{ fontFamily: FONTS.body, fontSize: 14, color: COLORS.mute, lineHeight: 1.55, margin: '6px 0 0' }}>
          High-protein recipes that make eating well easier, not a math exam. Nutrition is an estimate per serving.
        </p>

        {present.length > 0 && (
          <div role="tablist" aria-label="Recipe categories" style={{ display: 'flex', gap: 8, overflowX: 'auto', margin: '16px -16px 0', padding: '0 16px 4px' }}>
            {['All', ...present].map((c) => (
              <button
                key={c}
                role="tab"
                aria-selected={filter === c}
                onClick={() => setFilter(c)}
                style={{ flexShrink: 0, padding: '9px 16px', borderRadius: 999, border: `1px solid ${filter === c ? COLORS.ink : COLORS.line}`, background: filter === c ? COLORS.ink : '#fff', color: filter === c ? COLORS.bg : COLORS.ink, fontFamily: FONTS.body, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
              >
                {c}
              </button>
            ))}
          </div>
        )}

        {recipes === null && <p style={muted}>Loading…</p>}
        {recipes && recipes.length === 0 && <p style={muted}>No recipes yet.</p>}

        {(filter === 'All' ? present : [filter]).map((cat) => {
          const items = shown.filter((r) => r.category === cat);
          if (!items.length) return null;
          return (
            <section key={cat} style={{ marginTop: 22 }}>
              {filter === 'All' && <h2 style={{ margin: '0 0 10px', fontFamily: FONTS.display, fontSize: 26, fontWeight: 500, color: COLORS.ink }}>{cat}</h2>}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12 }}>
                {items.map((r) => <RecipeCard key={r.id} r={r} />)}
              </div>
            </section>
          );
        })}

        {/* Recipes without a category (added by hand in Supabase) */}
        {filter === 'All' && shown.some((r) => !present.includes(r.category)) && (
          <section style={{ marginTop: 22 }}>
            <h2 style={{ margin: '0 0 10px', fontFamily: FONTS.display, fontSize: 26, fontWeight: 500, color: COLORS.ink }}>More recipes</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12 }}>
              {shown.filter((r) => !present.includes(r.category)).map((r) => <RecipeCard key={r.id} r={r} />)}
            </div>
          </section>
        )}
      </div>
    </>
  );
}

function RecipeCard({ r }) {
  return (
    <Link to={`/dashboard/nutrition/recipes/${r.id}`} style={{ textDecoration: 'none' }}>
      <div style={{ position: 'relative', aspectRatio: '4 / 3', borderRadius: 16, overflow: 'hidden', background: COLORS[toneFor(r.category)], display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {r.image ? <img src={r.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Sprig size={34} color="#fff" />}
        {r.protein != null && (
          <span style={{ position: 'absolute', left: 8, bottom: 8, padding: '4px 9px', borderRadius: 999, background: 'rgba(255,255,255,0.92)', fontFamily: FONTS.body, fontSize: 12, fontWeight: 700, color: COLORS.ink }}>
            {Number(r.protein)}g protein
          </span>
        )}
      </div>
      <div style={{ fontFamily: FONTS.body, fontSize: 14, fontWeight: 600, color: COLORS.ink, marginTop: 8, lineHeight: 1.25 }}>{r.title}</div>
      {r.calories != null && <div style={{ fontFamily: FONTS.body, fontSize: 12, color: COLORS.mute, marginTop: 2 }}>{r.calories} calories</div>}
    </Link>
  );
}

const muted = { fontFamily: FONTS.body, fontSize: 14, color: COLORS.mute, marginTop: 16 };
