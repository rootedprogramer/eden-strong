import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Plus, Search, MoreVertical, Camera, Trash2, X, HelpCircle } from 'lucide-react';
import { COLORS, FONTS } from '../../brand/tokens';
import Sheet, { fieldLabel, fieldInput, primaryButton } from '../../components/Sheet';
import { supabase } from '../../lib/supabaseClient';
import { todayISO } from '../../lib/workout';

const TABS = [['progress', 'Progress'], ['prs', 'PRs'], ['photos', 'Photos']];

export default function Progress() {
  const [params, setParams] = useSearchParams();
  const tab = TABS.some(([k]) => k === params.get('tab')) ? params.get('tab') : 'progress';

  return (
    <>
      <div role="tablist" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', borderBottom: `1px solid ${COLORS.line}` }}>
        {TABS.map(([key, label]) => (
          <button
            key={key}
            role="tab"
            aria-selected={tab === key}
            onClick={() => setParams({ tab: key }, { replace: true })}
            style={{
              padding: '14px 0 12px',
              background: 'none',
              border: 'none',
              borderTop: `3px solid ${tab === key ? COLORS.ink : 'transparent'}`,
              fontFamily: FONTS.body,
              fontSize: 16,
              fontWeight: 600,
              color: tab === key ? COLORS.ink : COLORS.mute,
              cursor: 'pointer',
            }}
          >
            {label}
          </button>
        ))}
      </div>
      {tab === 'progress' && <ProgressTab />}
      {tab === 'prs' && <PRsTab />}
      {tab === 'photos' && <PhotosTab />}
    </>
  );
}

async function currentUserId() {
  const { data } = await supabase.auth.getUser();
  return data?.user?.id || null;
}

function shortDate(iso) {
  if (iso === todayISO()) return 'Today';
  return new Date(iso + 'T12:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

/* ───────────── Progress: stat cards + My Charts ───────────── */

function ProgressTab() {
  const [uid, setUid] = useState(null);
  const [charts, setCharts] = useState(null);
  const [latest, setLatest] = useState({}); // name → { value, log_date }
  const [sheet, setSheet] = useState(null); // 'entry' | 'chart' | 'help'
  const [menuFor, setMenuFor] = useState(null);

  const load = async () => {
    const id = await currentUserId();
    if (!id) return;
    setUid(id);
    let { data: rows } = await supabase.from('progress_charts').select('*').eq('user_id', id).order('created_at', { ascending: true });
    if (!rows || rows.length === 0) {
      // Everyone starts with a Weight chart
      await supabase.from('progress_charts').insert({ user_id: id, name: 'Weight', unit: 'lbs' });
      ({ data: rows } = await supabase.from('progress_charts').select('*').eq('user_id', id).order('created_at', { ascending: true }));
    }
    setCharts(rows || []);
    const { data: logs } = await supabase
      .from('metric_logs')
      .select('metric_name, value, log_date')
      .eq('user_id', id)
      .order('log_date', { ascending: false });
    const map = {};
    (logs || []).forEach((l) => { if (!map[l.metric_name]) map[l.metric_name] = l; });
    setLatest(map);
  };

  useEffect(() => { load(); }, []);

  const removeChart = async (c) => {
    if (!window.confirm(`Delete the ${c.name} chart and all its entries?`)) return;
    await supabase.from('metric_logs').delete().eq('user_id', uid).eq('metric_name', c.name);
    await supabase.from('progress_charts').delete().eq('id', c.id);
    setMenuFor(null);
    load();
  };

  const cards = (charts || []).slice(0, 4);

  return (
    <div style={{ padding: '18px 16px 120px' }}>
      <h1 style={headingStyle}>Progress</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12, marginTop: 14 }}>
        {cards.map((c) => {
          const l = latest[c.name];
          return (
            <Link key={c.id} to={`/dashboard/progress/chart/${c.id}`} style={{ padding: '16px 12px', borderRadius: 18, background: '#fff', border: `1px solid ${COLORS.line}`, textAlign: 'center', textDecoration: 'none' }}>
              <div style={{ fontFamily: FONTS.body, fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: COLORS.mute }}>{c.name}</div>
              <div style={{ fontFamily: FONTS.body, fontSize: 26, fontWeight: 700, color: COLORS.ink, marginTop: 8 }}>
                {l ? `${Number(l.value)}${c.unit ? ` ${c.unit}` : ''}` : '--'}
              </div>
              <div style={{ fontFamily: FONTS.body, fontSize: 12, fontWeight: 600, color: COLORS.mute, marginTop: 6 }}>{l ? shortDate(l.log_date) : 'No entries yet'}</div>
            </Link>
          );
        })}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 30 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <h2 style={{ ...headingStyle, fontSize: 26 }}>My charts</h2>
          <button onClick={() => setSheet('help')} aria-label="What are charts?" style={iconButton}><HelpCircle size={20} /></button>
        </div>
        <button onClick={() => setSheet('chart')} style={{ ...iconButton, display: 'flex', alignItems: 'center', gap: 6, fontFamily: FONTS.body, fontSize: 15, fontWeight: 600 }}>
          <Plus size={18} /> Add chart
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
        {(charts || []).map((c) => (
          <div key={c.id} style={{ position: 'relative', display: 'flex', alignItems: 'center', borderRadius: 18, background: '#fff', border: `1px solid ${COLORS.line}` }}>
            <Link to={`/dashboard/progress/chart/${c.id}`} style={{ flex: 1, padding: '18px 18px', fontFamily: FONTS.body, fontSize: 17, fontWeight: 600, color: COLORS.ink, textDecoration: 'none' }}>
              {c.name}
            </Link>
            <button onClick={() => setMenuFor(menuFor === c.id ? null : c.id)} aria-label={`Options for ${c.name}`} style={{ ...iconButton, padding: '0 16px', alignSelf: 'stretch' }}>
              <MoreVertical size={20} />
            </button>
            {menuFor === c.id && (
              <button onClick={() => removeChart(c)} style={{ position: 'absolute', right: 12, top: '100%', marginTop: 4, zIndex: 3, display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 12, border: `1px solid ${COLORS.line}`, background: '#fff', fontFamily: FONTS.body, fontSize: 14, color: '#B0413E', cursor: 'pointer' }}>
                <Trash2 size={16} /> Delete chart
              </button>
            )}
          </div>
        ))}
      </div>

      <Fab label="Add an entry" onClick={() => setSheet('entry')}><Plus size={28} /></Fab>

      {sheet === 'entry' && charts && (
        <EntrySheet charts={charts} uid={uid} onClose={() => setSheet(null)} onSaved={() => { setSheet(null); load(); }} />
      )}
      {sheet === 'chart' && (
        <AddChartSheet uid={uid} onClose={() => setSheet(null)} onSaved={() => { setSheet(null); load(); }} />
      )}
      {sheet === 'help' && (
        <Sheet title="My charts" onClose={() => setSheet(null)}>
          <p style={bodyText}>
            Charts track anything you want to watch change over time, like your weight, waist, or how many push-ups you can do.
            Add a chart, then log an entry whenever you measure. Tap a chart to see your trend.
          </p>
        </Sheet>
      )}
    </div>
  );
}

export function EntrySheet({ charts, uid, onClose, onSaved, chartId }) {
  const [id, setId] = useState(chartId || charts[0]?.id);
  const [value, setValue] = useState('');
  const [date, setDate] = useState(todayISO());
  const [saving, setSaving] = useState(false);
  const chart = charts.find((c) => c.id === id);

  const save = async () => {
    if (!chart || value === '') return;
    setSaving(true);
    await supabase.from('metric_logs').insert({ user_id: uid, metric_name: chart.name, value: Number(value), log_date: date });
    onSaved();
  };

  return (
    <Sheet title="Add entry" onClose={onClose}>
      {!chartId && charts.length > 1 && (
        <>
          <label style={fieldLabel} htmlFor="entry-chart">Chart</label>
          <select id="entry-chart" value={id} onChange={(e) => setId(e.target.value)} style={{ ...fieldInput, marginBottom: 14 }}>
            {charts.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </>
      )}
      <label style={fieldLabel} htmlFor="entry-value">{chart?.name}{chart?.unit ? ` (${chart.unit})` : ''}</label>
      <input id="entry-value" autoFocus inputMode="decimal" value={value} onChange={(e) => setValue(e.target.value.replace(/[^\d.]/g, ''))} style={fieldInput} />
      <label style={{ ...fieldLabel, marginTop: 14 }} htmlFor="entry-date">Date</label>
      <input id="entry-date" type="date" value={date} max={todayISO()} onChange={(e) => setDate(e.target.value)} style={fieldInput} />
      <button onClick={save} disabled={saving || value === ''} style={{ ...primaryButton, opacity: value === '' ? 0.5 : 1 }}>
        {saving ? 'Saving…' : 'Save entry'}
      </button>
    </Sheet>
  );
}

function AddChartSheet({ uid, onClose, onSaved }) {
  const [name, setName] = useState('');
  const [unit, setUnit] = useState('');
  const [error, setError] = useState('');
  const presets = [['Waist', 'in'], ['Hips', 'in'], ['Body fat', '%'], ['Steps', '']];

  const save = async () => {
    if (!name.trim()) return;
    const { error: err } = await supabase.from('progress_charts').insert({ user_id: uid, name: name.trim(), unit: unit.trim() || null });
    if (err) return setError('You already have a chart with that name.');
    onSaved();
  };

  return (
    <Sheet title="Add chart" onClose={onClose}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
        {presets.map(([n, u]) => (
          <button key={n} onClick={() => { setName(n); setUnit(u); }} style={{ padding: '8px 14px', borderRadius: 999, border: `1px solid ${COLORS.line}`, background: name === n ? COLORS.ink : '#fff', color: name === n ? COLORS.bg : COLORS.ink, fontFamily: FONTS.body, fontSize: 14, cursor: 'pointer' }}>
            {n}
          </button>
        ))}
      </div>
      <label style={fieldLabel} htmlFor="chart-name">Name</label>
      <input id="chart-name" value={name} onChange={(e) => { setName(e.target.value); setError(''); }} placeholder="Waist" style={fieldInput} />
      <label style={{ ...fieldLabel, marginTop: 14 }} htmlFor="chart-unit">Unit (optional)</label>
      <input id="chart-unit" value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="in" style={fieldInput} />
      {error && <div style={{ marginTop: 10, fontFamily: FONTS.body, fontSize: 13, color: '#B0413E' }}>{error}</div>}
      <button onClick={save} disabled={!name.trim()} style={{ ...primaryButton, opacity: name.trim() ? 1 : 0.5 }}>Add chart</button>
    </Sheet>
  );
}

/* ───────────── PRs: best weight per exercise, with a goal ───────────── */

function PRsTab() {
  const [uid, setUid] = useState(null);
  const [records, setRecords] = useState(null); // [{ name, record, date, goal }]
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = async () => {
    const id = await currentUserId();
    if (!id) return;
    setUid(id);
    const { data: sets } = await supabase
      .from('exercise_sets')
      .select('exercise_name, weight, log_date')
      .eq('user_id', id)
      .eq('done', true);
    const { data: goals } = await supabase.from('pr_goals').select('*').eq('user_id', id);
    const best = {};
    (sets || []).forEach((s) => {
      const w = Number(s.weight) || 0;
      if (w <= 0) return;
      if (!best[s.exercise_name] || w > best[s.exercise_name].record) best[s.exercise_name] = { name: s.exercise_name, record: w, date: s.log_date };
    });
    (goals || []).forEach((g) => {
      if (!best[g.exercise_name]) best[g.exercise_name] = { name: g.exercise_name, record: null, date: null };
      best[g.exercise_name].goal = g.goal;
    });
    setRecords(Object.values(best).sort((a, b) => a.name.localeCompare(b.name)));
  };

  useEffect(() => { load(); }, []);

  const shown = (records || []).filter((r) => r.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div style={{ padding: '18px 16px 120px' }}>
      <h1 style={headingStyle}>Personal records</h1>

      {searching && (
        <div style={{ position: 'relative', marginTop: 14 }}>
          <input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search exercises" aria-label="Search exercises" style={{ ...fieldInput, paddingRight: 44 }} />
          <button onClick={() => { setQuery(''); setSearching(false); }} aria-label="Close search" style={{ ...iconButton, position: 'absolute', right: 6, top: 6, padding: 8 }}><X size={18} /></button>
        </div>
      )}

      {records && records.length === 0 && (
        <p style={{ ...bodyText, marginTop: 14 }}>
          Your best lifts show up here automatically. Log your weight on any exercise during a workout and your record appears.
        </p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
        {shown.map((r) => (
          <button key={r.name} onClick={() => setEditing(r)} style={{ textAlign: 'left', padding: '18px 18px', borderRadius: 18, background: '#fff', border: `1px solid ${COLORS.line}`, cursor: 'pointer' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: FONTS.body, fontSize: 17, fontWeight: 600, color: COLORS.ink }}>{r.name}</span>
              <MoreVertical size={18} color={COLORS.ink} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', marginTop: 14 }}>
              <Stat label="Record" value={r.record ? `${r.record} lbs` : '--'} sub={r.date ? shortDate(r.date) : null} />
              <Stat label="Goal" value={r.goal ? `${Number(r.goal)} lbs` : 'Set a goal'} muted={!r.goal} />
            </div>
            {r.goal && r.record ? (
              <div style={{ marginTop: 12, height: 6, borderRadius: 3, background: COLORS.line }}>
                <div style={{ width: `${Math.min(100, (r.record / r.goal) * 100)}%`, height: 6, borderRadius: 3, background: COLORS.olive }} />
              </div>
            ) : null}
          </button>
        ))}
      </div>

      {!searching && records && records.length > 0 && <Fab label="Search records" onClick={() => setSearching(true)}><Search size={24} /></Fab>}

      {editing && (
        <GoalSheet
          record={editing}
          uid={uid}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); load(); }}
        />
      )}
    </div>
  );
}

function GoalSheet({ record, uid, onClose, onSaved }) {
  const [goal, setGoal] = useState(record.goal ? String(record.goal) : '');
  const save = async () => {
    if (goal === '') {
      await supabase.from('pr_goals').delete().eq('user_id', uid).eq('exercise_name', record.name);
    } else {
      await supabase.from('pr_goals').upsert({ user_id: uid, exercise_name: record.name, goal: Number(goal) }, { onConflict: 'user_id,exercise_name' });
    }
    onSaved();
  };
  return (
    <Sheet title={record.name} onClose={onClose}>
      <p style={{ ...bodyText, marginTop: 0 }}>Your record is {record.record ? `${record.record} lbs` : 'not set yet'}. What are you working toward?</p>
      <label style={fieldLabel} htmlFor="goal">Goal (lbs)</label>
      <input id="goal" autoFocus inputMode="decimal" value={goal} onChange={(e) => setGoal(e.target.value.replace(/[^\d.]/g, ''))} style={fieldInput} />
      <button onClick={save} style={primaryButton}>{goal === '' && record.goal ? 'Remove goal' : 'Save goal'}</button>
    </Sheet>
  );
}

function Stat({ label, value, sub, muted }) {
  return (
    <div>
      <div style={{ fontFamily: FONTS.body, fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: COLORS.mute }}>{label}</div>
      <div style={{ fontFamily: FONTS.body, fontSize: 20, fontWeight: 700, color: muted ? COLORS.mute : COLORS.ink, marginTop: 2 }}>{value}</div>
      {sub && <div style={{ fontFamily: FONTS.body, fontSize: 12, color: COLORS.mute, marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

/* ───────────── Photos: private progress photos ───────────── */

function PhotosTab() {
  const [uid, setUid] = useState(null);
  const [photos, setPhotos] = useState(null); // [{ id, path, taken_on, url }]
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(null);
  const fileRef = useRef(null);

  const load = async () => {
    const id = await currentUserId();
    if (!id) return;
    setUid(id);
    const { data: rows } = await supabase.from('progress_photos').select('*').eq('user_id', id).order('taken_on', { ascending: false });
    const list = rows || [];
    let urls = {};
    if (list.length) {
      const { data: signed } = await supabase.storage.from('progress-photos').createSignedUrls(list.map((p) => p.path), 3600);
      (signed || []).forEach((s) => { urls[s.path] = s.signedUrl; });
    }
    setPhotos(list.map((p) => ({ ...p, url: urls[p.path] })));
  };

  useEffect(() => { load(); }, []);

  const upload = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !uid) return;
    setUploading(true);
    setError('');
    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
    const path = `${uid}/${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from('progress-photos').upload(path, file, { contentType: file.type || 'image/jpeg' });
    if (upErr) {
      setUploading(false);
      return setError('That photo didn’t upload. Check your connection and try again.');
    }
    await supabase.from('progress_photos').insert({ user_id: uid, path, taken_on: todayISO() });
    setUploading(false);
    load();
  };

  const remove = async (p) => {
    if (!window.confirm('Delete this photo?')) return;
    await supabase.storage.from('progress-photos').remove([p.path]);
    await supabase.from('progress_photos').delete().eq('id', p.id);
    setOpen(null);
    load();
  };

  // Group by date
  const groups = [];
  (photos || []).forEach((p) => {
    const g = groups[groups.length - 1];
    if (g && g.date === p.taken_on) g.items.push(p);
    else groups.push({ date: p.taken_on, items: [p] });
  });

  return (
    <div style={{ padding: '18px 16px 120px' }}>
      <h1 style={headingStyle}>Progress photos</h1>
      <p style={{ ...bodyText, marginTop: 6 }}>Only you can see these.</p>

      {error && <p style={{ ...bodyText, color: '#B0413E' }}>{error}</p>}
      {uploading && <p style={bodyText}>Uploading…</p>}

      {photos && photos.length === 0 && !uploading && (
        <button onClick={() => fileRef.current?.click()} style={{ marginTop: 14, width: '100%', padding: '28px 16px', borderRadius: 18, border: `1.5px dashed ${COLORS.line}`, background: 'transparent', fontFamily: FONTS.body, fontSize: 15, color: COLORS.mute, cursor: 'pointer' }}>
          <Camera size={26} style={{ display: 'block', margin: '0 auto 8px' }} />
          Add your first photo. Front, side, and back in the same spot each time make the clearest comparison.
        </button>
      )}

      {groups.map((g) => (
        <div key={g.date} style={{ marginTop: 18 }}>
          <div style={{ fontFamily: FONTS.body, fontSize: 14, fontWeight: 600, color: COLORS.ink }}>
            {new Date(g.date + 'T12:00').toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 8, marginTop: 8 }}>
            {g.items.map((p) => (
              <button key={p.id} onClick={() => setOpen(p)} aria-label="Open photo" style={{ padding: 0, border: 'none', borderRadius: 12, overflow: 'hidden', aspectRatio: '3 / 4', background: COLORS.line, cursor: 'pointer' }}>
                {p.url && <img src={p.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />}
              </button>
            ))}
          </div>
        </div>
      ))}

      <input ref={fileRef} type="file" accept="image/*" onChange={upload} style={{ display: 'none' }} />
      <Fab label="Add a photo" onClick={() => fileRef.current?.click()}><Camera size={24} /></Fab>

      {open && (
        <div role="dialog" aria-modal="true" aria-label="Photo" onClick={() => setOpen(null)} style={{ position: 'fixed', inset: 0, zIndex: 20, background: 'rgba(0,0,0,0.9)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <img src={open.url} alt="" style={{ maxWidth: '100%', maxHeight: '78vh', borderRadius: 12 }} onClick={(e) => e.stopPropagation()} />
          <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
            <button onClick={(e) => { e.stopPropagation(); remove(open); }} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 18px', borderRadius: 999, border: 'none', background: '#fff', color: '#B0413E', fontFamily: FONTS.body, fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
              <Trash2 size={16} /> Delete
            </button>
            <button onClick={() => setOpen(null)} style={{ padding: '12px 18px', borderRadius: 999, border: 'none', background: '#fff', color: COLORS.ink, fontFamily: FONTS.body, fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ───────────── shared bits ───────────── */

export function Fab({ label, onClick, children, wide }) {
  return (
    <div style={{ position: 'fixed', left: '50%', transform: 'translateX(-50%)', bottom: 'calc(80px + env(safe-area-inset-bottom, 0px))', width: '100%', maxWidth: 480, padding: '0 16px', display: 'flex', justifyContent: 'flex-end', pointerEvents: 'none', zIndex: 5 }}>
      <button
        onClick={onClick}
        aria-label={label}
        style={{ pointerEvents: 'auto', height: 60, minWidth: 60, padding: wide ? '0 22px' : 0, borderRadius: 999, border: 'none', background: COLORS.ink, color: COLORS.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: FONTS.body, fontSize: 16, fontWeight: 600, boxShadow: '0 4px 14px rgba(0,0,0,0.18)', cursor: 'pointer' }}
      >
        {children}
      </button>
    </div>
  );
}

const headingStyle = { margin: 0, fontFamily: FONTS.display, fontSize: 32, fontWeight: 500, color: COLORS.ink, lineHeight: 1.1 };
const bodyText = { fontFamily: FONTS.body, fontSize: 14, color: COLORS.mute, lineHeight: 1.55 };
const iconButton = { background: 'none', border: 'none', color: COLORS.ink, cursor: 'pointer', padding: 4 };
