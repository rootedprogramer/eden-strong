import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import SubHeader from '../../components/SubHeader';
import { Button, Card, Field, Heading, Note, NumberInput, Row, Select, TextArea, TextInput } from '../../components/admin/ui';
import { EDITION_OPTIONS, RECIPE_CATEGORY_OPTIONS } from '../../lib/admin';
import { supabase } from '../../lib/supabaseClient';
import { AdminGate } from './AdminHome';

const blank = { title: '', category: 'Dinners', edition: '', calories: '', protein: '', carbs: '', fat: '', servings: '1 serving', ingredients: '', directions: '', tip: '', image: '' };

export default function AdminRecipeEditor() {
  return <AdminGate><Editor /></AdminGate>;
}

function Editor() {
  const { id } = useParams();
  const isNew = id === 'new';
  const navigate = useNavigate();
  const [r, setR] = useState(isNew ? blank : null);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    if (isNew) return;
    supabase.from('recipes').select('*').eq('id', id).maybeSingle().then(({ data }) => {
      setR(data ? { ...blank, ...Object.fromEntries(Object.entries(data).map(([k, v]) => [k, v ?? ''])) } : false);
    });
  }, [id]);

  if (r === null) return <SubHeader title="Recipe" />;
  if (r === false) return <><SubHeader title="Recipe" /><Note style={{ padding: '0 18px' }}>This recipe wasn’t found.</Note></>;

  const set = (key) => (value) => setR((x) => ({ ...x, [key]: value }));
  const num = (v) => (v === '' || v === null ? null : Number(v));

  const save = async () => {
    setError('');
    if (!r.title.trim()) return setError('Give the recipe a title.');
    const row = {
      title: r.title.trim(),
      category: r.category || null,
      edition: r.edition || null,
      calories: num(r.calories),
      protein: num(r.protein),
      carbs: num(r.carbs),
      fat: num(r.fat),
      servings: r.servings || null,
      ingredients: r.ingredients || null,
      directions: r.directions || null,
      tip: r.tip || null,
      image: r.image || null,
    };
    const { data, error: err } = isNew
      ? await supabase.from('recipes').insert(row).select('id').single()
      : await supabase.from('recipes').update(row).eq('id', id).select('id').single();
    if (err) return setError(err.message);
    if (isNew) return navigate(`/dashboard/admin/recipes/${data.id}`, { replace: true });
    setStatus('Recipe saved.');
    setTimeout(() => setStatus(''), 2500);
  };

  const remove = async () => {
    if (!window.confirm(`Delete “${r.title}”? It will also be removed from any meal plans.`)) return;
    const { error: err } = await supabase.from('recipes').delete().eq('id', id);
    if (err) return setError(err.message);
    navigate('/dashboard/admin?tab=recipes', { replace: true });
  };

  return (
    <>
      <SubHeader title={isNew ? 'New recipe' : 'Edit recipe'} />
      <div style={{ padding: '4px 16px 60px' }}>
        <Heading>{r.title || 'New recipe'}</Heading>
        <Card style={{ marginTop: 14 }}>
          <Field label="Title"><TextInput value={r.title} onChange={set('title')} /></Field>
          <Row>
            <Field label="Category" style={{ flex: 1 }}><Select value={r.category} onChange={set('category')} options={RECIPE_CATEGORY_OPTIONS} /></Field>
            <Field label="Who sees it" style={{ flex: 1 }}><Select value={r.edition} onChange={set('edition')} options={EDITION_OPTIONS} /></Field>
          </Row>
          <Row>
            <Field label="Calories" style={{ flex: 1 }}><NumberInput value={r.calories} onChange={set('calories')} /></Field>
            <Field label="Protein (g)" style={{ flex: 1 }}><NumberInput value={r.protein} onChange={set('protein')} /></Field>
          </Row>
          <Row>
            <Field label="Carbs (g)" style={{ flex: 1 }}><NumberInput value={r.carbs} onChange={set('carbs')} /></Field>
            <Field label="Fat (g)" style={{ flex: 1 }}><NumberInput value={r.fat} onChange={set('fat')} /></Field>
          </Row>
          <Field label="Makes"><TextInput value={r.servings} onChange={set('servings')} placeholder="1 serving" /></Field>
          <Field label="Ingredients" hint="One ingredient per line."><TextArea value={r.ingredients} onChange={set('ingredients')} rows={6} /></Field>
          <Field label="Method" hint="One step per line. Steps are numbered automatically."><TextArea value={r.directions} onChange={set('directions')} rows={6} /></Field>
          <Field label="Eden Strong tip (optional)"><TextArea value={r.tip} onChange={set('tip')} rows={2} /></Field>
          <Field label="Photo link (optional)" hint="Paste an image URL, or leave blank for a color card."><TextInput value={r.image} onChange={set('image')} /></Field>
          {error && <Note tone="error">{error}</Note>}
          {status && <Note tone="ok">{status}</Note>}
          <Button onClick={save} style={{ marginTop: 14, width: '100%', justifyContent: 'center' }}>{isNew ? 'Add recipe' : 'Save recipe'}</Button>
        </Card>
        {!isNew && <Button kind="danger" onClick={remove} style={{ marginTop: 14 }}><Trash2 size={16} /> Delete recipe</Button>}
      </div>
    </>
  );
}
