import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { COLORS, FONTS, tint, toneColor } from '../../brand/tokens';
import SubHeader from '../../components/SubHeader';
import Sprig from '../../components/Sprig';
import { supabase } from '../../lib/supabaseClient';
import { todayISO } from '../../lib/workout';
import { toneFor, guessCategory } from './RecipeBook';

export default function Recipe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [r, setR] = useState(undefined);
  const [logging, setLogging] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('recipes').select('*').eq('id', id).maybeSingle();
      setR(data ? { ...data, category: guessCategory(data) } : null);
    })();
  }, [id]);

  if (r === undefined) return <SubHeader title="Recipe" />;
  if (r === null) return <><SubHeader title="Recipe" /><p style={{ padding: '0 18px', fontFamily: FONTS.body, color: COLORS.mute }}>This recipe wasn’t found.</p></>;

  const lines = (text) => String(text || '').split('\n').map((s) => s.trim()).filter(Boolean);
  const ingredients = lines(r.ingredients);
  const steps = lines(r.directions);

  const log = async () => {
    setLogging(true);
    const { data: userData } = await supabase.auth.getUser();
    const uid = userData?.user?.id;
    if (uid) {
      await supabase.from('meal_logs').insert({
        user_id: uid,
        name: r.title,
        calories: r.calories,
        protein: r.protein,
        fat: r.fat,
        carbs: r.carbs,
        log_date: todayISO(),
        logged_at: new Date().toISOString(),
      });
    }
    navigate('/dashboard/nutrition');
  };

  return (
    <>
      <SubHeader title={r.category || 'Recipe'} />
      <div style={{ position: 'relative', height: 220, background: toneColor(toneFor(r.category)), overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {r.image ? <img src={r.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Sprig size={70} color="#fff" />}
      </div>

      <div style={{ padding: '18px 18px 40px' }}>
        <h1 style={{ margin: 0, fontFamily: FONTS.display, fontSize: 32, fontWeight: 500, color: COLORS.ink, lineHeight: 1.1 }}>{r.title}</h1>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginTop: 14 }}>
          <Stat label="Calories" value={r.calories ?? '–'} />
          <Stat label="Protein" value={r.protein != null ? `${Number(r.protein)}g` : '–'} />
          <Stat label="Makes" value={r.servings || '1 serving'} />
        </div>

        <h2 style={h2}>Ingredients</h2>
        <ul style={{ margin: '8px 0 0', padding: 0, listStyle: 'none' }}>
          {ingredients.map((item, i) => (
            <li key={i} style={{ display: 'flex', gap: 10, padding: '10px 0', borderBottom: `1px solid ${COLORS.line}`, fontFamily: FONTS.body, fontSize: 15, color: COLORS.ink, lineHeight: 1.4 }}>
              <span aria-hidden="true" style={{ width: 6, height: 6, borderRadius: '50%', background: COLORS.gold, marginTop: 8, flexShrink: 0 }} />
              {item}
            </li>
          ))}
        </ul>

        <h2 style={h2}>Method</h2>
        <ol style={{ margin: '8px 0 0', padding: 0, listStyle: 'none' }}>
          {steps.map((step, i) => (
            <li key={i} style={{ display: 'flex', gap: 12, padding: '10px 0', fontFamily: FONTS.body, fontSize: 15, color: COLORS.ink, lineHeight: 1.55 }}>
              <span style={{ width: 26, height: 26, borderRadius: '50%', background: COLORS.ink, color: COLORS.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>{i + 1}</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>

        {r.tip && (
          <div style={{ marginTop: 18, padding: '14px 16px', borderRadius: 16, background: tint(COLORS.sage, 22), fontFamily: FONTS.body, fontSize: 14, color: COLORS.ink, lineHeight: 1.55 }}>
            <span style={{ fontWeight: 700 }}>Tip: </span>{r.tip}
          </div>
        )}

        <button onClick={log} disabled={logging} style={{ width: '100%', marginTop: 24, padding: 16, borderRadius: 16, border: 'none', background: COLORS.ink, color: COLORS.bg, fontFamily: FONTS.body, fontSize: 16, fontWeight: 600, cursor: 'pointer' }}>
          {logging ? 'Logging…' : 'Log this meal'}
        </button>
        <p style={{ fontFamily: FONTS.body, fontSize: 12, color: COLORS.mute, lineHeight: 1.5, marginTop: 12, textAlign: 'center' }}>
          Nutrition is an estimate and varies with brands, portions, and swaps.
        </p>
      </div>
    </>
  );
}

function Stat({ label, value }) {
  return (
    <div style={{ padding: '12px 8px', borderRadius: 14, background: COLORS.surface, border: `1px solid ${COLORS.line}`, textAlign: 'center' }}>
      <div style={{ fontFamily: FONTS.body, fontSize: 17, fontWeight: 700, color: COLORS.ink }}>{value}</div>
      <div style={{ fontFamily: FONTS.body, fontSize: 12, color: COLORS.mute, marginTop: 2 }}>{label}</div>
    </div>
  );
}

const h2 = { margin: '26px 0 0', fontFamily: FONTS.display, fontSize: 26, fontWeight: 500, color: COLORS.ink };
