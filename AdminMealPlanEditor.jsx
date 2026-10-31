import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Trash2, X } from 'lucide-react';
import { COLORS, FONTS } from '../../brand/tokens';
import SubHeader from '../../components/SubHeader';
import { Button, Card, Field, Heading, Note, Row, Select, SubHeading, TextArea, TextInput } from '../../components/admin/ui';
import { EDITION_OPTIONS, MEALS } from '../../lib/admin';
import { WEEKDAYS } from '../../lib/workout';
import { supabase } from '../../lib/supabaseClient';
import { AdminGate } from './AdminHome';

export default function AdminMealPlanEditor() {
  return <AdminGate><Editor /></AdminGate>;
}

function Editor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [plan, setPlan] = useState(null);
  const [items, setItems] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [adding, setAdding] = useState({ day: 1, meal: 'Breakfast', recipe: '' });

  const loadItems = async () => {
    const { data } = await supabase.from('meal_plan_items').select('*').eq('plan_id', id);
    setItems(data || []);
  };

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('meal_plans').select('*').eq('id', id).maybeSingle();
      setPlan(data ? { ...data, description: data.description || '', edition: data.edition || '' } : false);
      const { data: rs } = await supabase.from('recipes').select('id, title, category, calories, protein');
      setRecipes((rs || []).sort((a, b) => a.title.localeCompare(b.title)));
      loadItems();
    })();
  }, [id]);

  if (plan === null) return <SubHeader title="Meal plan" />;
  if (plan === false) return <><SubHeader title="Meal plan" /><Note style={{ padding: '0 18px' }}>This meal plan wasn’t found.</Note></>;

  const byId = Object.fromEntries(recipes.map((r) => [r.id, r]));

  const saveDetails = async () => {
    setError('');
    if (!plan.title.trim()) return setError('Give the plan a title.');
    const { error: err } = await supabase.from('meal_plans').update({ title: plan.title.trim(), description: plan.description || null, edition: plan.edition || null }).eq('id', id);
    if (err) return setError(err.message);
    setStatus('Saved.');
    setTimeout(() => setStatus(''), 2500);
  };

  const addItem = async () => {
    if (!adding.recipe) return;
    const { error: err } = await supabase.from('meal_plan_items').insert({
      plan_id: id,
      day_number: Number(adding.day),
      meal: adding.meal,
      recipe_id: adding.recipe,
      sort_order: MEALS.indexOf(adding.meal),
    });
    if (err) return setError(err.message);
    setAdding((a) => ({ ...a, recipe: '' }));
    loadItems();
  };

  const removeItem = async (itemId) => {
    await supabase.from('meal_plan_items').delete().eq('id', itemId);
    loadItems();
  };

  const copyDay = async (from, to) => {
    const rows = items.filter((i) => i.day_number === from).map((i) => ({ plan_id: id, day_number: to, meal: i.meal, recipe_id: i.recipe_id, sort_order: i.sort_order }));
    if (!rows.length) return;
    await supabase.from('meal_plan_items').insert(rows);
    loadItems();
  };

  const remove = async () => {
    if (!window.confirm(`Delete “${plan.title}”? Members on this plan will no longer see it.`)) return;
    await supabase.from('meal_plans').delete().eq('id', id);
    navigate('/dashboard/admin?tab=plans', { replace: true });
  };

  // Recipes grouped by category for the picker
  const recipeOptions = [['', 'Choose a recipe…'], ...recipes.map((r) => [r.id, `${r.title}${r.category ? ` (${r.category})` : ''}`])];

  return (
    <>
      <SubHeader title="Edit meal plan" />
      <div style={{ padding: '4px 16px 60px' }}>
        <Heading>{plan.title}</Heading>
        <Card style={{ marginTop: 14 }}>
          <Field label="Title"><TextInput value={plan.title} onChange={(v) => setPlan((p) => ({ ...p, title: v }))} /></Field>
          <Field label="Description (optional)" hint="Shown to the member at the top of their plan.">
            <TextArea value={plan.description} onChange={(v) => setPlan((p) => ({ ...p, description: v }))} rows={2} />
          </Field>
          <Field label="Who it’s for"><Select value={plan.edition} onChange={(v) => setPlan((p) => ({ ...p, edition: v }))} options={EDITION_OPTIONS} /></Field>
          {error && <Note tone="error">{error}</Note>}
          {status && <Note tone="ok">{status}</Note>}
          <Button onClick={saveDetails} style={{ marginTop: 14, width: '100%', justifyContent: 'center' }}>Save details</Button>
        </Card>

        <SubHeading>Add a meal</SubHeading>
        <Card style={{ marginTop: 10 }}>
          <Row>
            <Field label="Day" style={{ flex: 1, marginTop: 0 }}>
              <Select value={adding.day} onChange={(v) => setAdding((a) => ({ ...a, day: Number(v) }))} options={WEEKDAYS.map((w, i) => [i + 1, w])} />
            </Field>
            <Field label="Meal" style={{ flex: 1, marginTop: 0 }}>
              <Select value={adding.meal} onChange={(v) => setAdding((a) => ({ ...a, meal: v }))} options={MEALS} />
            </Field>
          </Row>
          <Field label="Recipe"><Select value={adding.recipe} onChange={(v) => setAdding((a) => ({ ...a, recipe: v }))} options={recipeOptions} /></Field>
          <Button onClick={addItem} disabled={!adding.recipe} style={{ marginTop: 12, width: '100%', justifyContent: 'center' }}><Plus size={16} /> Add to {WEEKDAYS[adding.day - 1]}</Button>
        </Card>

        <SubHeading>The week</SubHeading>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10 }}>
          {WEEKDAYS.map((w, i) => {
            const dayItems = items.filter((it) => it.day_number === i + 1).sort((a, b) => MEALS.indexOf(a.meal) - MEALS.indexOf(b.meal));
            const totals = dayItems.reduce((t, it) => ({ cal: t.cal + (byId[it.recipe_id]?.calories || 0), pro: t.pro + Number(byId[it.recipe_id]?.protein || 0) }), { cal: 0, pro: 0 });
            return (
              <Card key={w} style={{ padding: 14 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
                  <span style={{ fontFamily: FONTS.body, fontSize: 15, fontWeight: 700, color: COLORS.ink }}>{w}</span>
                  {dayItems.length > 0 && <span style={{ fontFamily: FONTS.body, fontSize: 12, color: COLORS.mute }}>{totals.cal} cal, {totals.pro}g protein</span>}
                </div>
                {dayItems.length === 0 && <Note>No meals yet.</Note>}
                {dayItems.map((it) => (
                  <div key={it.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', borderBottom: `1px solid ${COLORS.line}` }}>
                    <span style={{ width: 72, flexShrink: 0, fontFamily: FONTS.body, fontSize: 12, fontWeight: 600, color: COLORS.mute }}>{it.meal}</span>
                    <span style={{ flex: 1, fontFamily: FONTS.body, fontSize: 14, color: COLORS.ink }}>{byId[it.recipe_id]?.title || 'Recipe removed'}</span>
                    <button onClick={() => removeItem(it.id)} aria-label="Remove meal" style={{ background: 'none', border: 'none', color: COLORS.mute, cursor: 'pointer', padding: 4 }}><X size={16} /></button>
                  </div>
                ))}
                {dayItems.length > 0 && i < 6 && (
                  <button onClick={() => copyDay(i + 1, i + 2)} style={{ marginTop: 8, background: 'none', border: 'none', padding: 0, fontFamily: FONTS.body, fontSize: 13, fontWeight: 600, color: COLORS.gold, cursor: 'pointer' }}>
                    Copy to {WEEKDAYS[i + 1]}
                  </button>
                )}
              </Card>
            );
          })}
        </div>

        <Button kind="danger" onClick={remove} style={{ marginTop: 18 }}><Trash2 size={16} /> Delete meal plan</Button>
      </div>
    </>
  );
}
