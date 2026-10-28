import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { COLORS, FONTS } from '../../brand/tokens';
import { supabase } from '../../lib/supabaseClient';

const todayISO = () => new Date().toISOString().slice(0, 10);

export default function RecipeBook() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [logging, setLogging] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('recipes').select('*').order('title', { ascending: true });
      setRecipes(data || []);
      setLoading(false);
    })();
  }, []);

  const logRecipe = async (r) => {
    setLogging(r.id);
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    if (userId) {
      await supabase.from('meal_logs').insert({
        user_id: userId,
        name: r.title,
        calories: r.calories,
        protein: r.protein,
        fat: r.fat,
        carbs: r.carbs,
        log_date: todayISO(),
        logged_at: new Date().toISOString(),
      });
    }
    setLogging(null);
    navigate('/dashboard/nutrition');
  };

  return (
    <div style={{ padding: '24px 24px 24px' }}>
      <div style={{ fontFamily: FONTS.display, fontSize: 26, color: COLORS.ink, fontStyle: 'italic' }}>
        Recipe Book
      </div>

      <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {loading && <div style={{ fontFamily: FONTS.body, fontSize: 13, color: COLORS.mute }}>Loading…</div>}
        {!loading && recipes.length === 0 && (
          <div style={{ fontFamily: FONTS.body, fontSize: 13, color: COLORS.mute }}>
            No recipes published yet — add rows to `recipes` in Supabase.
          </div>
        )}
        {recipes.map((r) => (
          <div key={r.id} style={{ padding: 18, borderRadius: 16, background: '#fff', border: `1px solid ${COLORS.line}` }}>
            <div style={{ fontFamily: FONTS.display, fontSize: 18, color: COLORS.ink, fontStyle: 'italic' }}>{r.title}</div>
            <div style={{ fontFamily: FONTS.body, fontSize: 13, color: COLORS.mute, marginTop: 4 }}>
              {r.calories} cal · {r.protein}g protein · {r.fat}g fat · {r.carbs}g carbs
            </div>
            {r.ingredients && (
              <div style={{ fontFamily: FONTS.body, fontSize: 13, color: COLORS.ink, marginTop: 10, whiteSpace: 'pre-line' }}>
                {r.ingredients}
              </div>
            )}
            <button
              onClick={() => logRecipe(r)}
              disabled={logging === r.id}
              style={{
                marginTop: 14, fontFamily: FONTS.body, fontSize: 13, fontWeight: 500, color: COLORS.bg,
                background: COLORS.ink, border: 'none', padding: '10px 18px', borderRadius: 999, cursor: 'pointer',
              }}
            >
              {logging === r.id ? 'Logging…' : 'Log this meal'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
