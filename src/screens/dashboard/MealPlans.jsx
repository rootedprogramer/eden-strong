import { useEffect, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { ChevronRight, Salad, Apple, Fish, Egg, Wheat, Carrot, Beef, Soup, Cherry, Sandwich, Grape, Croissant } from 'lucide-react';
import { COLORS, FONTS, toneColor } from '../../brand/tokens';
import SubHeader from '../../components/SubHeader';
import { loadLibrary, loadMyMealPlan, proteinRange } from '../../lib/mealPlans';

// The meal plan library: example weeks for different daily calorie and
// protein targets. Members pick the one closest to their numbers.
export default function MealPlans() {
  const { edition } = useOutletContext();
  const [plans, setPlans] = useState(null);
  const [mine, setMine] = useState(null);

  useEffect(() => {
    loadLibrary().then(setPlans);
    loadMyMealPlan().then(setMine);
  }, []);

  const together = edition?.id === 'together';
  const hers = (plans || []).filter((p) => p.audience !== 'him');
  const his = (plans || []).filter((p) => p.audience === 'him');

  return (
    <>
      <SubHeader title="Meal plans" />
      <div style={{ padding: '4px 16px 48px' }}>
        <p style={{ margin: '4px 2px 0', fontFamily: FONTS.body, fontSize: 16, fontWeight: 600, color: COLORS.ink, lineHeight: 1.5 }}>
          Each plan is a full example week for a daily calorie and protein target. Not sure of your numbers? Work out your calorie and protein goal on the{' '}
          <Link to="/dashboard/nutrition" style={{ color: COLORS.gold }}>Nutrition page</Link>, then pick the closest plan.
        </p>
        {together && (
          <p style={{ margin: '10px 2px 0', fontFamily: FONTS.body, fontSize: 14, color: COLORS.ink, lineHeight: 1.5 }}>
            His and hers plans share the same breakfasts, lunches, and dinners, so you can cook once and eat together. Only the portions and snacks change.
          </p>
        )}
        <p style={{ margin: '10px 2px 0', fontFamily: FONTS.body, fontSize: 13, color: COLORS.mute, lineHeight: 1.5 }}>
          Nutrition numbers are estimates from standard nutrition facts. Talk with your doctor about your own nutrition needs.
        </p>

        {mine && (
          <Link to={`/dashboard/nutrition/meal-plans/${mine.plan.id}`} style={{ display: 'block', marginTop: 18, padding: 18, borderRadius: 20, background: COLORS.deep, textDecoration: 'none' }}>
            <div style={{ fontFamily: FONTS.body, fontSize: 12, fontWeight: 600, color: COLORS.rose }}>From your coach</div>
            <div style={{ fontFamily: FONTS.display, fontSize: 24, color: '#fff', marginTop: 4 }}>{mine.plan.title}</div>
          </Link>
        )}

        {plans === null ? null : plans.length === 0 ? (
          <p style={{ marginTop: 20, fontFamily: FONTS.body, fontSize: 14, color: COLORS.mute, lineHeight: 1.5 }}>Meal plans are coming soon.</p>
        ) : together ? (
          <>
            <Section title="For her" plans={hers} />
            <Section title="For him" plans={his} />
          </>
        ) : (
          <PlanList plans={plans} />
        )}
      </div>
    </>
  );
}

function Section({ title, plans }) {
  if (!plans.length) return null;
  return (
    <section style={{ marginTop: 22 }}>
      <h2 style={{ margin: '0 2px', fontFamily: FONTS.display, fontSize: 24, fontWeight: 500, color: COLORS.ink }}>{title}</h2>
      <PlanList plans={plans} />
    </section>
  );
}

const ICONS = [Salad, Apple, Fish, Egg, Wheat, Carrot, Beef, Soup, Cherry, Sandwich, Grape, Croissant];
const TONES = ['olive', 'gold', 'sage', 'ink', 'rose'];

function PlanList({ plans }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 14 }}>
      {plans.map((p, i) => {
        const Icon = ICONS[i % ICONS.length];
        return (
          <Link
            key={p.id}
            to={`/dashboard/nutrition/meal-plans/${p.id}`}
            style={{ display: 'flex', alignItems: 'stretch', minHeight: 104, borderRadius: 20, overflow: 'hidden', background: COLORS.surface, border: `1px solid ${COLORS.line}`, boxShadow: '0 4px 14px rgba(0,0,0,0.06)', textDecoration: 'none' }}
          >
            <span style={{ width: '32%', flexShrink: 0, background: toneColor(TONES[i % TONES.length]), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {p.image
                ? <img src={p.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <Icon size={36} color="#fff" strokeWidth={1.4} aria-hidden="true" />}
            </span>
            <span style={{ flex: 1, padding: '16px 14px 16px 18px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <span style={{ fontFamily: FONTS.display, fontSize: 26, fontWeight: 600, color: COLORS.ink, lineHeight: 1.05 }}>
                {p.calories ? `${p.calories} Calories` : p.title}
              </span>
              {proteinRange(p) && (
                <span style={{ fontFamily: FONTS.body, fontSize: 13, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: COLORS.mute, marginTop: 8 }}>
                  {proteinRange(p)}
                </span>
              )}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', paddingRight: 14 }}>
              <ChevronRight size={22} color={COLORS.ink} />
            </span>
          </Link>
        );
      })}
    </div>
  );
}
