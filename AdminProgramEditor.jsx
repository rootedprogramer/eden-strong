import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Trash2, ArrowUp, ArrowDown, ChevronDown, Copy } from 'lucide-react';
import { COLORS, FONTS } from '../../brand/tokens';
import SubHeader from '../../components/SubHeader';
import { Button, Card, Field, Heading, Note, NumberInput, Row, Select, SubHeading, TextArea, TextInput } from '../../components/admin/ui';
import { EDITION_OPTIONS, SECTION_OPTIONS } from '../../lib/admin';
import { WEEKDAYS } from '../../lib/workout';
import { supabase } from '../../lib/supabaseClient';
import { AdminGate } from './AdminHome';

const blankProgram = { title: '', track: '', level_key: 'beginner', days_per_week: 3, weeks: 6, location: 'gym', edition: '', description: '', guide: '', core_note: '' };

export default function AdminProgramEditor() {
  return (
    <AdminGate>
      <Editor />
    </AdminGate>
  );
}

function Editor() {
  const { id } = useParams();
  const isNew = id === 'new';
  const navigate = useNavigate();
  const [program, setProgram] = useState(isNew ? blankProgram : null);
  const [days, setDays] = useState([]);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  const loadDays = async () => {
    const { data } = await supabase.from('program_days').select('*, program_exercises(*)').eq('program_id', id);
    setDays(
      (data || [])
        .sort((a, b) => a.day_number - b.day_number)
        .map((d) => ({ ...d, program_exercises: [...(d.program_exercises || [])].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)) }))
    );
  };

  useEffect(() => {
    if (isNew) return;
    (async () => {
      const { data } = await supabase.from('workout_programs').select('*').eq('id', id).maybeSingle();
      setProgram(data ? { ...blankProgram, ...data, edition: data.edition || '' } : false);
      await loadDays();
    })();
  }, [id]);

  if (program === null) return <SubHeader title="Program" />;
  if (program === false) return <><SubHeader title="Program" /><Note style={{ padding: '0 18px' }}>This program wasn’t found.</Note></>;

  const set = (key) => (value) => setProgram((p) => ({ ...p, [key]: value }));

  const saveProgram = async () => {
    setError('');
    if (!program.title.trim()) return setError('Give the program a title, like “Rooted & Rising — 4 Days”.');
    const row = {
      title: program.title.trim(),
      track: program.track.trim() || program.title.split(/\s[—–-]\s/)[0].trim(),
      level_key: program.level_key,
      level: program.level_key === 'beginner' ? 'Beginner' : 'Experienced',
      days_per_week: Number(program.days_per_week) || 3,
      weeks: Number(program.weeks) || 6,
      location: program.location || 'gym',
      edition: program.edition || null,
      description: program.description || null,
      guide: program.guide || null,
      core_note: program.core_note || null,
    };
    if (isNew) {
      const { data, error: err } = await supabase.from('workout_programs').insert(row).select('id').single();
      if (err) return setError(err.message);
      navigate(`/dashboard/admin/programs/${data.id}`, { replace: true });
    } else {
      const { error: err } = await supabase.from('workout_programs').update(row).eq('id', id);
      if (err) return setError(err.message);
      setStatus('Program saved.');
      setTimeout(() => setStatus(''), 2500);
    }
  };

  const addDay = async () => {
    const next = (days[days.length - 1]?.day_number || 0) + 1;
    const { error: err } = await supabase.from('program_days').insert({ program_id: id, day_number: next, title: `Day ${next}` });
    if (err) return setError(err.message);
    loadDays();
  };

  const duplicate = async () => {
    const { data, error: err } = await supabase.rpc('admin_duplicate_program', { source: id });
    if (err) return setError(err.message);
    navigate(`/dashboard/admin/programs/${data}`);
  };

  const remove = async () => {
    if (!window.confirm(`Delete “${program.title}” and all its days? Anyone on this program will be taken off it.`)) return;
    const { error: err } = await supabase.from('workout_programs').delete().eq('id', id);
    if (err) return setError(err.message);
    navigate('/dashboard/admin?tab=programs', { replace: true });
  };

  return (
    <>
      <SubHeader title={isNew ? 'New program' : 'Edit program'} />
      <div style={{ padding: '4px 16px 60px' }}>
        <Heading>{program.title || 'New program'}</Heading>

        <Card style={{ marginTop: 14 }}>
          <Field label="Title" hint="Include the split, e.g. “Grit & Glory — 4 Days”.">
            <TextInput value={program.title} onChange={set('title')} />
          </Field>
          <Field label="Program name" hint="Splits with the same name are grouped together, e.g. “Grit & Glory”.">
            <TextInput value={program.track} onChange={set('track')} placeholder={program.title.split(/\s[—–-]\s/)[0]} />
          </Field>
          <Row>
            <Field label="Level" style={{ flex: 1 }}>
              <Select value={program.level_key} onChange={set('level_key')} options={[['beginner', 'Beginner'], ['experienced', 'Experienced']]} />
            </Field>
            <Field label="Who sees it" style={{ flex: 1 }}>
              <Select value={program.edition} onChange={set('edition')} options={EDITION_OPTIONS} />
            </Field>
          </Row>
          <Row>
            <Field label="Days a week" style={{ flex: 1 }}>
              <NumberInput value={program.days_per_week} onChange={set('days_per_week')} />
            </Field>
            <Field label="Weeks" style={{ flex: 1 }}>
              <NumberInput value={program.weeks} onChange={set('weeks')} />
            </Field>
          </Row>
          <Field label="Description">
            <TextArea value={program.description} onChange={set('description')} rows={3} />
          </Field>
          <Field label="Before you start (optional)" hint="Warm-up, effort, and form rules shown on the program page.">
            <TextArea value={program.guide} onChange={set('guide')} rows={4} />
          </Field>
          <Field label="Deep core finisher note (optional)">
            <TextArea value={program.core_note} onChange={set('core_note')} rows={2} />
          </Field>
          {error && <Note tone="error">{error}</Note>}
          {status && <Note tone="ok">{status}</Note>}
          <Button onClick={saveProgram} style={{ marginTop: 14, width: '100%', justifyContent: 'center' }}>
            {isNew ? 'Create program' : 'Save program details'}
          </Button>
        </Card>

        {!isNew && (
          <>
            <SubHeading>Days</SubHeading>
            <Note>Without a weekday, Day 1 is Monday, Day 2 is Tuesday, and so on. Pick a weekday to schedule a day differently.</Note>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>
              {days.map((d) => <DayEditor key={d.id} day={d} onChanged={loadDays} />)}
            </div>
            <Button kind="secondary" onClick={addDay} style={{ marginTop: 12, width: '100%', justifyContent: 'center' }}>
              <Plus size={16} /> Add a day
            </Button>

            <SubHeading>More</SubHeading>
            <div style={{ display: 'flex', gap: 10, marginTop: 12, flexWrap: 'wrap' }}>
              <Button kind="secondary" onClick={duplicate}><Copy size={16} /> Make a copy</Button>
              <Button kind="danger" onClick={remove}><Trash2 size={16} /> Delete program</Button>
            </div>
          </>
        )}
      </div>
    </>
  );
}

function DayEditor({ day, onChanged }) {
  const [open, setOpen] = useState(false);
  const [d, setD] = useState({ ...day, day_label: day.day_label || '' });
  const [exercises, setExercises] = useState(day.program_exercises);
  const [removed, setRemoved] = useState([]);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const setField = (key) => (value) => setD((x) => ({ ...x, [key]: value }));
  const setEx = (i, key, value) => setExercises((xs) => xs.map((x, j) => (j === i ? { ...x, [key]: value } : x)));
  const move = (i, dir) => setExercises((xs) => {
    const j = i + dir;
    if (j < 0 || j >= xs.length) return xs;
    const copy = [...xs];
    [copy[i], copy[j]] = [copy[j], copy[i]];
    return copy;
  });
  const removeEx = (i) => {
    const ex = exercises[i];
    if (ex.id) setRemoved((r) => [...r, ex.id]);
    setExercises((xs) => xs.filter((_, j) => j !== i));
  };
  const addEx = () => setExercises((xs) => [...xs, { name: '', sets: 3, reps: '10', section: 'workout', superset_group: '', note: '' }]);

  const save = async () => {
    setSaving(true);
    setMsg('');
    const { error: dayErr } = await supabase.from('program_days').update({
      day_number: Number(d.day_number) || day.day_number,
      day_label: d.day_label || null,
      title: d.title || null,
      rest_note: d.rest_note || null,
      focus_note: d.focus_note || null,
    }).eq('id', day.id);
    if (dayErr) { setSaving(false); return setMsg(dayErr.message); }

    if (removed.length) await supabase.from('program_exercises').delete().in('id', removed);
    for (let i = 0; i < exercises.length; i++) {
      const x = exercises[i];
      if (!x.name.trim()) continue;
      const row = {
        program_day_id: day.id,
        name: x.name.trim(),
        sets: Number(x.sets) || 1,
        reps: String(x.reps || '').trim() || null,
        section: x.section || 'workout',
        superset_group: (x.superset_group || '').trim() || null,
        note: (x.note || '').trim() || null,
        sort_order: i + 1,
      };
      const { error: err } = x.id
        ? await supabase.from('program_exercises').update(row).eq('id', x.id)
        : await supabase.from('program_exercises').insert(row);
      if (err) { setSaving(false); return setMsg(err.message); }
    }
    setSaving(false);
    setRemoved([]);
    setMsg('Saved.');
    onChanged();
  };

  const deleteDay = async () => {
    if (!window.confirm(`Delete Day ${day.day_number}: ${day.title}?`)) return;
    await supabase.from('program_days').delete().eq('id', day.id);
    onChanged();
  };

  return (
    <Card style={{ padding: 0, overflow: 'hidden' }}>
      <button onClick={() => setOpen(!open)} aria-expanded={open} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
        <span style={{ flex: 1 }}>
          <span style={{ display: 'block', fontFamily: FONTS.body, fontSize: 15, fontWeight: 600, color: COLORS.ink }}>Day {day.day_number}: {day.title}</span>
          <span style={{ display: 'block', fontFamily: FONTS.body, fontSize: 12, color: COLORS.mute, marginTop: 2 }}>
            {day.day_label || WEEKDAYS[day.day_number - 1] || ''}, {day.program_exercises.length} exercises
          </span>
        </span>
        <ChevronDown size={20} color={COLORS.ink} style={{ transform: open ? 'rotate(180deg)' : 'none' }} />
      </button>

      {open && (
        <div style={{ padding: '0 16px 16px', borderTop: `1px solid ${COLORS.line}` }}>
          <Row>
            <Field label="Day #" style={{ width: 70 }}><NumberInput value={d.day_number} onChange={setField('day_number')} /></Field>
            <Field label="Weekday" style={{ flex: 1 }}>
              <Select value={d.day_label} onChange={setField('day_label')} options={[['', 'Automatic'], ...WEEKDAYS.map((w) => [w, w])]} />
            </Field>
          </Row>
          <Field label="Focus"><TextInput value={d.title} onChange={setField('title')} placeholder="Legs & Glutes" /></Field>
          <Field label="Note at the top (optional)" hint="Rest times, warm-up, or what this day is about.">
            <TextArea value={d.rest_note} onChange={setField('rest_note')} rows={2} />
          </Field>
          <Field label="Focus note at the bottom (optional)"><TextInput value={d.focus_note} onChange={setField('focus_note')} /></Field>

          <div style={{ fontFamily: FONTS.body, fontSize: 14, fontWeight: 700, color: COLORS.ink, marginTop: 18 }}>Exercises</div>
          <Note style={{ marginTop: 2 }}>Give exercises the same superset letter (A, B…) to group them. Use “30 sec” or “20 min” in reps for timed moves.</Note>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10 }}>
            {exercises.map((x, i) => (
              <div key={x.id || `new-${i}`} style={{ padding: 12, borderRadius: 14, border: `1px solid ${COLORS.line}`, background: COLORS.bg }}>
                <Row style={{ alignItems: 'center' }}>
                  <TextInput value={x.name} onChange={(v) => setEx(i, 'name', v)} placeholder="Exercise name" aria-label="Exercise name" />
                  <IconBtn label="Move up" onClick={() => move(i, -1)}><ArrowUp size={16} /></IconBtn>
                  <IconBtn label="Move down" onClick={() => move(i, 1)}><ArrowDown size={16} /></IconBtn>
                  <IconBtn label="Remove exercise" onClick={() => removeEx(i)} danger><Trash2 size={16} /></IconBtn>
                </Row>
                <Row style={{ marginTop: 8 }}>
                  <Select value={sectionValue(x.section)} onChange={(v) => setEx(i, 'section', v)} options={SECTION_OPTIONS} aria-label="Section" style={{ flex: 1.4 }} />
                  <NumberInput value={x.sets} onChange={(v) => setEx(i, 'sets', v)} aria-label="Sets" placeholder="Sets" style={{ width: 64 }} />
                  <TextInput value={x.reps} onChange={(v) => setEx(i, 'reps', v)} aria-label="Reps" placeholder="Reps" style={{ flex: 1 }} />
                </Row>
                <Row style={{ marginTop: 8 }}>
                  <TextInput value={x.superset_group} onChange={(v) => setEx(i, 'superset_group', v.toUpperCase())} aria-label="Superset letter" placeholder="SS" style={{ width: 56 }} maxLength={2} />
                  <TextInput value={x.note} onChange={(v) => setEx(i, 'note', v)} aria-label="Note" placeholder="Note (optional)" />
                </Row>
              </div>
            ))}
          </div>
          <Button kind="secondary" onClick={addEx} style={{ marginTop: 10 }}><Plus size={16} /> Add exercise</Button>

          {msg && <Note tone={msg === 'Saved.' ? 'ok' : 'error'}>{msg}</Note>}
          <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
            <Button onClick={save} disabled={saving} style={{ flex: 1, justifyContent: 'center' }}>{saving ? 'Saving…' : 'Save day'}</Button>
            <Button kind="danger" onClick={deleteDay}><Trash2 size={16} /></Button>
          </div>
        </div>
      )}
    </Card>
  );
}

const sectionValue = (s) => (!s || s === 'main' ? 'workout' : s);

function IconBtn({ children, onClick, label, danger }) {
  return (
    <button onClick={onClick} aria-label={label} style={{ flexShrink: 0, width: 36, height: 40, borderRadius: 10, border: `1px solid ${COLORS.line}`, background: COLORS.surface, color: danger ? '#B0413E' : COLORS.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
      {children}
    </button>
  );
}
