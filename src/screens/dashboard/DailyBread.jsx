import { useEffect, useMemo, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { Check, Clock, ShoppingBasket, Users, X } from 'lucide-react';
import { COLORS, FONTS, tint } from '../../brand/tokens';
import SubHeader from '../../components/SubHeader';
import { supabase } from '../../lib/supabaseClient';
import {
  INGREDIENT_GROUPS, GOAL_FILTERS, BASICS, labelFor, matchRecipe,
  loadKitchen, addToPantry, removeFromPantry, clearPantry,
  addToGrocery, removeFromGrocery, boughtGrocery, isSharedKitchen,
} from '../../lib/kitchen';

// Daily Bread: tap what's in your kitchen, see what you can make right now.
// Taps are saved as the member's pantry, so it's still there next time.
export default function DailyBread() {
  const { edition } = useOutletContext();
  const [uid, setUid] = useState(null);
  const [have, setHave] = useState(new Set());
  const [grocery, setGrocery] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [shared, setShared] = useState(false);
  const [loading, setLoading] = useState(true);
  const [quick, setQuick] = useState(false);
  const [goal, setGoal] = useState(null);
  const [added, setAdded] = useState(null); // recipe id whose missing items were just added

  const refreshKitchen = async () => {
    const k = await loadKitchen();
    setUid(k.uid);
    setHave(k.pantry);
    setGrocery(k.grocery);
  };

  useEffect(() => {
    (async () => {
      const [{ data }] = await Promise.all([
        supabase.from('recipes').select('*').order('title', { ascending: true }),
        refreshKitchen(),
      ]);
      setRecipes(data || []);
      if (edition.id === 'together') setShared(await isSharedKitchen());
      setLoading(false);
    })();
  }, []);

  // Optimistic: the chip flips immediately, the save happens behind it.
  const toggle = async (key) => {
    const next = new Set(have);
    if (next.has(key)) {
      next.delete(key);
      setHave(next);
      await removeFromPantry(key);
    } else {
      next.add(key);
      setHave(next);
      await addToPantry(uid, key);
    }
  };

  const clearAll = async () => {
    setHave(new Set());
    await clearPantry();
  };

  const addMissing = async (recipe, missing) => {
    await addToGrocery(uid, missing);
    setAdded(recipe.id);
    refreshKitchen();
  };

  const results = useMemo(() => {
    const filtered = recipes
      .filter((r) => (r.ingredient_keys || []).length)
      .filter((r) => !quick || (r.minutes || 0) <= 20)
      .filter((r) => !goal || (r.tags || []).includes(goal))
      .map((r) => ({ recipe: r, ...matchRecipe(r, have) }));
    const ready = filtered.filter((m) => m.missing.length === 0);
    const almost = filtered
      .filter((m) => m.missing.length > 0 && m.missing.length <= 2 && m.total - m.missing.length > 0)
      .sort((a, b) => a.missing.length - b.missing.length);
    return { ready, almost };
  }, [recipes, have, quick, goal]);

  return (
    <>
      <SubHeader title="Daily Bread" />
      <div style={{ padding: '4px 18px 32px' }}>
        <h1 style={{ margin: 0, fontFamily: FONTS.display, fontSize: 32, fontWeight: 500, color: COLORS.ink, lineHeight: 1.1 }}>
          What’s in your kitchen?
        </h1>
        <p style={{ margin: '8px 0 0', fontFamily: FONTS.body, fontSize: 14, color: COLORS.mute, lineHeight: 1.5 }}>
          Tap what you have and we’ll show what you can make. {BASICS} are assumed.
        </p>
        {shared && (
          <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8, fontFamily: FONTS.body, fontSize: 13, color: COLORS.ink }}>
            <Users size={16} color={COLORS.gold} /> Shared with your spouse. Their taps show up here too.
          </div>
        )}

        {INGREDIENT_GROUPS.map((group) => (
          <section key={group.name} style={{ marginTop: 22 }}>
            <h2 style={groupHeading}>{group.name}</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
              {group.items.map(([key, label]) => {
                const on = have.has(key);
                return (
                  <button
                    key={key}
                    onClick={() => toggle(key)}
                    aria-pressed={on}
                    disabled={!uid}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      fontFamily: FONTS.body, fontSize: 14, fontWeight: on ? 600 : 400,
                      padding: '9px 14px', borderRadius: 999, cursor: 'pointer',
                      border: `1px solid ${on ? COLORS.ink : COLORS.line}`,
                      background: on ? COLORS.ink : '#fff',
                      color: on ? COLORS.bg : COLORS.ink,
                      transition: 'background 120ms, color 120ms',
                    }}
                  >
                    {on && <Check size={14} strokeWidth={2.5} />}
                    {label}
                  </button>
                );
              })}
            </div>
          </section>
        ))}

        {have.size > 0 && (
          <button onClick={clearAll} style={{ ...textButton, marginTop: 14 }}>
            Clear all ({have.size})
          </button>
        )}

        {/* Filters */}
        <div style={{ marginTop: 28, paddingTop: 22, borderTop: `1px solid ${COLORS.line}` }}>
          <h2 style={{ margin: 0, fontFamily: FONTS.display, fontSize: 28, fontWeight: 500, color: COLORS.ink }}>
            You can make
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
            <FilterChip on={quick} onClick={() => setQuick(!quick)}>
              <Clock size={14} /> 20 minutes or less
            </FilterChip>
            {GOAL_FILTERS.map((g) => (
              <FilterChip key={g.id} on={goal === g.id} onClick={() => setGoal(goal === g.id ? null : g.id)}>
                {g.label}
              </FilterChip>
            ))}
          </div>
        </div>

        {loading && <Note>Loading recipes…</Note>}

        {!loading && have.size === 0 && (
          <Note>Tap a few ingredients above to see meals you can make.</Note>
        )}

        {!loading && have.size > 0 && results.ready.length === 0 && results.almost.length === 0 && (
          <Note>
            Nothing matches yet. Tap a few more ingredients{quick || goal ? ' or turn off a filter' : ''}, or browse the{' '}
            <Link to="/dashboard/nutrition/recipes" style={{ color: COLORS.gold }}>Recipe Book</Link>.
          </Note>
        )}

        {results.ready.length > 0 && (
          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {results.ready.map(({ recipe }) => (
              <RecipeRow key={recipe.id} recipe={recipe} />
            ))}
          </div>
        )}

        {results.almost.length > 0 && have.size > 0 && (
          <>
            <h3 style={{ ...groupHeading, marginTop: 26 }}>Almost there</h3>
            <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {results.almost.map(({ recipe, missing }) => (
                <RecipeRow key={recipe.id} recipe={recipe}>
                  <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                    <span style={{ fontFamily: FONTS.body, fontSize: 13, color: COLORS.mute }}>
                      Need {missing.map(labelFor).join(' and ').toLowerCase()}
                    </span>
                    {added === recipe.id ? (
                      <span style={{ fontFamily: FONTS.body, fontSize: 13, color: COLORS.olive, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Check size={14} /> On your list
                      </span>
                    ) : (
                      <button onClick={(e) => { e.preventDefault(); addMissing(recipe, missing); }} style={smallButton}>
                        Add to grocery list
                      </button>
                    )}
                  </div>
                </RecipeRow>
              ))}
            </div>
          </>
        )}

        <GroceryList
          items={grocery}
          onBought={async (item) => { await boughtGrocery(uid, item); refreshKitchen(); }}
          onRemove={async (item) => { await removeFromGrocery(item); refreshKitchen(); }}
        />
      </div>
    </>
  );
}

function RecipeRow({ recipe, children }) {
  return (
    <div style={{ padding: '14px 16px', borderRadius: 16, background: '#fff', border: `1px solid ${COLORS.line}` }}>
      <Link to={`/dashboard/nutrition/cook/${recipe.id}`} style={{ textDecoration: 'none', display: 'block' }}>
        <div style={{ fontFamily: FONTS.display, fontSize: 21, fontWeight: 500, color: COLORS.ink, lineHeight: 1.2 }}>
          {recipe.title}
        </div>
        <div style={{ marginTop: 6, display: 'flex', flexWrap: 'wrap', gap: '4px 14px', fontFamily: FONTS.body, fontSize: 13, color: COLORS.mute }}>
          {recipe.minutes && <span>{recipe.minutes} min</span>}
          {recipe.calories != null && <span>{recipe.calories} cal</span>}
          {recipe.protein != null && <span>{recipe.protein}g protein</span>}
          {recipe.cook_together && (
            <span style={{ color: COLORS.gold, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <Users size={13} /> Cook together
            </span>
          )}
        </div>
      </Link>
      {children}
    </div>
  );
}

function GroceryList({ items, onBought, onRemove }) {
  return (
    <section style={{ marginTop: 32, padding: '18px 16px', borderRadius: 18, background: tint(COLORS.sage, 18) }}>
      <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8, fontFamily: FONTS.display, fontSize: 24, fontWeight: 500, color: COLORS.ink }}>
        <ShoppingBasket size={20} strokeWidth={1.75} /> Grocery list
      </h2>
      {items.length === 0 ? (
        <Note style={{ padding: '8px 0 0' }}>
          Empty. When a recipe is one or two ingredients away, add what’s missing here.
        </Note>
      ) : (
        <>
          <p style={{ margin: '6px 0 0', fontFamily: FONTS.body, fontSize: 13, color: COLORS.mute }}>
            Tap the circle when you buy something and it moves into your kitchen.
          </p>
          <ul style={{ listStyle: 'none', margin: '12px 0 0', padding: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {items.map((g) => (
              <li key={g.item} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 4px' }}>
                <button
                  onClick={() => onBought(g.item)}
                  aria-label={`Bought ${g.label}`}
                  style={{ width: 24, height: 24, borderRadius: '50%', border: `1.5px solid ${COLORS.ink}`, background: '#fff', cursor: 'pointer', flexShrink: 0 }}
                />
                <span style={{ flex: 1, fontFamily: FONTS.body, fontSize: 15, color: COLORS.ink }}>{g.label}</span>
                <button onClick={() => onRemove(g.item)} aria-label={`Remove ${g.label}`} style={{ background: 'none', border: 'none', color: COLORS.mute, cursor: 'pointer', display: 'flex', padding: 4 }}>
                  <X size={16} />
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}

function FilterChip({ on, onClick, children }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={on}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        fontFamily: FONTS.body, fontSize: 13, padding: '7px 12px', borderRadius: 999, cursor: 'pointer',
        border: `1px solid ${on ? COLORS.gold : COLORS.line}`,
        background: on ? tint(COLORS.gold, 14) : 'transparent',
        color: on ? COLORS.ink : COLORS.mute,
        fontWeight: on ? 600 : 400,
      }}
    >
      {children}
    </button>
  );
}

function Note({ children, style }) {
  return (
    <div style={{ padding: '16px 0 0', fontFamily: FONTS.body, fontSize: 14, color: COLORS.mute, lineHeight: 1.5, ...style }}>
      {children}
    </div>
  );
}

const groupHeading = { margin: 0, fontFamily: FONTS.body, fontSize: 14, fontWeight: 600, color: COLORS.ink };

const textButton = {
  background: 'none', border: 'none', padding: 0, cursor: 'pointer',
  fontFamily: FONTS.body, fontSize: 13, color: COLORS.gold, textDecoration: 'underline', textUnderlineOffset: 3,
};

const smallButton = {
  fontFamily: FONTS.body, fontSize: 13, fontWeight: 500, color: COLORS.bg, background: COLORS.ink,
  border: 'none', padding: '8px 14px', borderRadius: 999, cursor: 'pointer', whiteSpace: 'nowrap',
};
