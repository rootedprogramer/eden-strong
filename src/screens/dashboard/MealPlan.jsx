import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { COLORS, FONTS, tint } from '../../brand/tokens';
import SubHeader from '../../components/SubHeader';
import { WEEKDAYS, weekdayNumber } from '../../lib/workout';
import { dayTotals, formatServings, itemNutrition, loadMyMealPlan, loadPlan, proteinRange, sortMeals } from '../../lib/mealPlans';

// Kept for older imports
export { loadMyMealPlan } from '../../lib/mealPlans';

// One meal plan, a day at a time. /nutrition/meal-plans/:id shows any plan the
// member can see; /nutrition/plan shows the plan their coach assigned.
export default function MealPlan() {
  const { id } = useParams();
  const [data, setData] = useState(undefined);
  const [day, setDay] = useState(weekdayNumber());

  useEffect(() => {
    setData(undefined);
    (id ? loadPlan(id) : loadMyMealPlan()).then(setData);
  }, [id]);

  const title = data?.plan?.calories ? `${data.plan.calories} Calories` : 'Meal plan';
  if (data === undefined) return <SubHeader title="Meal plan" />;
  if (data === null) {
    return (
      <>
        <SubHeader title="Meal plan" />
        <p style={{ padding: '0 18px', fontFamily: FONTS.body, fontSize: 14, color: COLORS.mute, lineHeight: 1.5 }}>
          {id ? 'This meal plan wasn’t found.' : 'You don’t have a plan from your coach yet. '}
          {!id && <Link to="/dashboard/nutrition/meal-plans" style={{ color: COLORS.gold }}>Browse the meal plans</Link>}
        </p>
      </>
    );
  }

  const { plan } = data;
  const meals = sortMeals(data.items.filter((i) => i.day_number === day));
  const totals = dayTotals(meals);
  const today = weekdayNumber();

  return (
    <>
      <SubHeader title={title} />
      <div style={{ padding: '4px 16px 48px' }}>
        <h1 style={{ margin: 0, fontFamily: FONTS.display, fontSize: 32, fontWeight: 500, color: COLORS.ink, lineHeight: 1.1 }}>
          {plan.calories ? `${plan.calories} Calories` : plan.title}
        </h1>
        {proteinRange(plan) && (
          <div style={{ fontFamily: FONTS.body, fontSize: 13, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: COLORS.mute, marginTop: 6 }}>
            {proteinRange(plan)}
          </div>
        )}
        {plan.description && <p style={{ fontFamily: FONTS.body, fontSize: 14, color: COLORS.mute, lineHeight: 1.55, margin: '8px 0 0' }}>{plan.description}</p>}

        {/* Day picker, Monday to Sunday */}
        <div role="tablist" aria-label="Day of the week" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, marginTop: 18 }}>
          {WEEKDAYS.map((w, i) => {
            const n = i + 1;
            const on = n === day;
            return (
              <button
                key={w}
                role="tab"
                aria-selected={on}
                aria-label={w}
                onClick={() => setDay(n)}
                style={{
                  padding: '9px 0 8px', borderRadius: 14, cursor: 'pointer',
                  border: `1px solid ${on ? COLORS.ink : COLORS.line}`,
                  background: on ? COLORS.ink : COLORS.surface,
                  color: on ? COLORS.bg : COLORS.ink,
                  fontFamily: FONTS.body, fontSize: 13, fontWeight: 700,
                }}
              >
                {w.slice(0, 3)}
                <span aria-hidden="true" style={{ display: 'block', width: 5, height: 5, borderRadius: '50%', margin: '4px auto 0', background: n === today ? (on ? COLORS.bg : COLORS.gold) : 'transparent' }} />
              </button>
            );
          })}
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
          <Total label="Calories" value={totals.calories} />
          <Total label="Protein" value={`${Math.round(totals.protein)}g`} />
        </div>

        {meals.length === 0 ? (
          <p style={{ marginTop: 18, fontFamily: FONTS.body, fontSize: 14, color: COLORS.mute }}>Nothing planned for {WEEKDAYS[day - 1]}.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
            {meals.map((m) => {
              const n = itemNutrition(m);
              const s = Number(m.servings) || 1;
              return (
                <Link
                  key={m.id}
                  to={`/dashboard/nutrition/recipes/${m.recipe.id}${s !== 1 ? `?servings=${s}` : ''}`}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 14px', borderRadius: 18, background: COLORS.surface, border: `1px solid ${COLORS.line}`, textDecoration: 'none' }}
                >
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: 'block', fontFamily: FONTS.body, fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: COLORS.gold }}>{m.meal}</span>
                    <span style={{ display: 'block', fontFamily: FONTS.body, fontSize: 16, fontWeight: 600, color: COLORS.ink, marginTop: 3 }}>{m.recipe.title}</span>
                    <span style={{ display: 'block', fontFamily: FONTS.body, fontSize: 13, color: COLORS.mute, marginTop: 3 }}>
                      {[s !== 1 && formatServings(s), n.calories != null && `${n.calories} cal`, n.protein != null && `${Math.round(n.protein)}g protein`].filter(Boolean).join(' · ')}
                    </span>
                  </span>
                  {s !== 1 && (
                    <span style={{ flexShrink: 0, padding: '4px 9px', borderRadius: 999, background: tint(COLORS.gold, 16), fontFamily: FONTS.body, fontSize: 12, fontWeight: 700, color: COLORS.ink }}>
                      ×{s}
                    </span>
                  )}
                  <ChevronRight size={18} color={COLORS.mute} />
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

function Total({ label, value }) {
  return (
    <div style={{ flex: 1, padding: '12px 14px', borderRadius: 16, background: COLORS.surface, border: `1px solid ${COLORS.line}` }}>
      <div style={{ fontFamily: FONTS.body, fontSize: 20, fontWeight: 700, color: COLORS.ink }}>{value}</div>
      <div style={{ fontFamily: FONTS.body, fontSize: 12, color: COLORS.mute, marginTop: 2 }}>{label} for the day</div>
    </div>
  );
}
