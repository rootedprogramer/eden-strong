import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { COLORS, FONTS } from '../../brand/tokens';
import SubHeader from '../../components/SubHeader';
import { supabase } from '../../lib/supabaseClient';
import { WEEKDAYS, weekdayNumber } from '../../lib/workout';
import { MEALS } from '../../lib/admin';

// Loads the member's assigned meal plan with its recipes (null if none)
export async function loadMyMealPlan() {
  const { data: userData } = await supabase.auth.getUser();
  const uid = userData?.user?.id;
  if (!uid) return null;
  const { data: assignment } = await supabase
    .from('meal_plan_assignments')
    .select('plan_id')
    .eq('user_id', uid)
    .eq('active', true)
    .maybeSingle();
  if (!assignment) return null;
  const { data: plan } = await supabase.from('meal_plans').select('*').eq('id', assignment.plan_id).maybeSingle();
  if (!plan) return null;
  const { data: items } = await supabase.from('meal_plan_items').select('*').eq('plan_id', plan.id);
  const ids = [...new Set((items || []).map((i) => i.recipe_id))];
  let recipes = {};
  if (ids.length) {
    const { data: rs } = await supabase.from('recipes').select('id, title, calories, protein, category').in('id', ids);
    recipes = Object.fromEntries((rs || []).map((r) => [r.id, r]));
  }
  return { plan, items: (items || []).map((i) => ({ ...i, recipe: recipes[i.recipe_id] })).filter((i) => i.recipe) };
}

export default function MealPlan() {
  const [data, setData] = useState(undefined);
  const today = weekdayNumber();

  useEffect(() => { loadMyMealPlan().then(setData); }, []);

  if (data === undefined) return <SubHeader title="Your meal plan" />;
  if (data === null) {
    return (
      <>
        <SubHeader title="Your meal plan" />
        <p style={{ padding: '0 18px', fontFamily: FONTS.body, fontSize: 14, color: COLORS.mute, lineHeight: 1.5 }}>
          You don’t have a meal plan yet. Your coach can set one up for you. In the meantime, the Recipe Book has plenty of high-protein ideas.
        </p>
      </>
    );
  }

  // Today first, then the rest of the week in order
  const order = Array.from({ length: 7 }).map((_, i) => ((today - 1 + i) % 7) + 1);

  return (
    <>
      <SubHeader title="Your meal plan" />
      <div style={{ padding: '4px 16px 40px' }}>
        <h1 style={{ margin: 0, fontFamily: FONTS.display, fontSize: 32, fontWeight: 500, color: COLORS.ink, lineHeight: 1.1 }}>{data.plan.title}</h1>
        {data.plan.description && <p style={{ fontFamily: FONTS.body, fontSize: 14, color: COLORS.mute, lineHeight: 1.55, margin: '6px 0 0' }}>{data.plan.description}</p>}

        {order.map((day) => {
          const meals = data.items.filter((i) => i.day_number === day).sort((a, b) => MEALS.indexOf(a.meal) - MEALS.indexOf(b.meal));
          if (!meals.length) return null;
          const cal = meals.reduce((s, m) => s + (m.recipe.calories || 0), 0);
          const pro = meals.reduce((s, m) => s + Number(m.recipe.protein || 0), 0);
          return (
            <section key={day} style={{ marginTop: 20 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
                <h2 style={{ margin: 0, fontFamily: FONTS.display, fontSize: 24, fontWeight: 500, color: COLORS.ink }}>
                  {day === today ? `Today, ${WEEKDAYS[day - 1]}` : WEEKDAYS[day - 1]}
                </h2>
                <span style={{ fontFamily: FONTS.body, fontSize: 12, color: COLORS.mute }}>{cal} cal, {pro}g protein</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                {meals.map((m) => (
                  <Link key={m.id} to={`/dashboard/nutrition/recipes/${m.recipe.id}`} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 14px', borderRadius: 16, background: COLORS.surface, border: `1px solid ${COLORS.line}`, textDecoration: 'none' }}>
                    <span style={{ width: 70, flexShrink: 0, fontFamily: FONTS.body, fontSize: 12, fontWeight: 600, color: COLORS.gold }}>{m.meal}</span>
                    <span style={{ flex: 1 }}>
                      <span style={{ display: 'block', fontFamily: FONTS.body, fontSize: 15, fontWeight: 600, color: COLORS.ink }}>{m.recipe.title}</span>
                      <span style={{ display: 'block', fontFamily: FONTS.body, fontSize: 12, color: COLORS.mute, marginTop: 2 }}>
                        {[m.recipe.calories != null && `${m.recipe.calories} cal`, m.recipe.protein != null && `${Number(m.recipe.protein)}g protein`].filter(Boolean).join(', ')}
                      </span>
                    </span>
                    <ChevronRight size={18} color={COLORS.mute} />
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </>
  );
}
