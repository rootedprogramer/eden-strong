import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react';
import { COLORS, FONTS } from '../../brand/tokens';
import SubHeader from '../../components/SubHeader';
import LineChart from '../../components/LineChart';
import { supabase } from '../../lib/supabaseClient';
import { todayISO } from '../../lib/workout';
import { EntrySheet, Fab } from './Progress';

const RANGES = [
  ['week', 'Week', 7],
  ['month', 'Month', 30],
  ['quarter', '3 months', 91],
  ['year', 'Year', 365],
];

const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const addDays = (s, n) => { const d = new Date(s + 'T12:00'); d.setDate(d.getDate() + n); return iso(d); };
const md = (s) => { const d = new Date(s + 'T12:00'); return `${d.getMonth() + 1}/${d.getDate()}`; };

export default function ProgressChart() {
  const { id } = useParams();
  const [uid, setUid] = useState(null);
  const [chart, setChart] = useState(null);
  const [entries, setEntries] = useState([]);
  const [range, setRange] = useState('week');
  const [end, setEnd] = useState(todayISO());
  const [adding, setAdding] = useState(false);

  const load = async () => {
    const { data: userData } = await supabase.auth.getUser();
    const u = userData?.user?.id;
    setUid(u);
    const { data: c } = await supabase.from('progress_charts').select('*').eq('id', id).maybeSingle();
    setChart(c || false);
    if (!c) return;
    const { data: logs } = await supabase
      .from('metric_logs')
      .select('id, value, log_date')
      .eq('user_id', u)
      .eq('metric_name', c.name)
      .order('log_date', { ascending: false });
    setEntries(logs || []);
  };

  useEffect(() => { load(); }, [id]);

  if (chart === null) return <SubHeader title="Chart" />;
  if (chart === false) return <><SubHeader title="Chart" /><p style={{ padding: '0 18px', fontFamily: FONTS.body, color: COLORS.mute }}>This chart wasn’t found.</p></>;

  const days = RANGES.find((r) => r[0] === range)[2];
  const start = addDays(end, -(days - 1));
  const inRange = entries.filter((e) => e.log_date >= start && e.log_date <= end);
  const avg = inRange.length ? inRange.reduce((s, e) => s + Number(e.value), 0) / inRange.length : null;
  const atToday = end >= todayISO();
  const unit = chart.unit ? ` ${chart.unit}` : '';

  const remove = async (e) => {
    if (!window.confirm('Delete this entry?')) return;
    await supabase.from('metric_logs').delete().eq('id', e.id);
    load();
  };

  return (
    <>
      <SubHeader title={chart.name} />
      <div style={{ padding: '6px 16px 120px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
          <button onClick={() => setEnd(addDays(end, -days))} aria-label="Earlier" style={arrowBtn}><ChevronLeft size={20} /></button>
          <label style={{ position: 'relative', display: 'flex', alignItems: 'center', padding: '9px 14px', borderRadius: 12, border: `1.5px solid ${COLORS.ink}`, background: COLORS.surface, fontFamily: FONTS.body, fontSize: 15, fontWeight: 600, color: COLORS.ink }}>
            {md(start)} – {md(end)}
            <select
              aria-label="Date range"
              value={range}
              onChange={(e) => setRange(e.target.value)}
              style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
            >
              {RANGES.map(([k, label]) => <option key={k} value={k}>{label}</option>)}
            </select>
          </label>
          <button onClick={() => setEnd(atToday ? end : [addDays(end, days), todayISO()].sort()[0])} disabled={atToday} aria-label="Later" style={{ ...arrowBtn, opacity: atToday ? 0.4 : 1 }}><ChevronRight size={20} /></button>
        </div>
        <div style={{ textAlign: 'right', fontFamily: FONTS.body, fontSize: 12, color: COLORS.mute, marginTop: 4 }}>
          Showing {RANGES.find((r) => r[0] === range)[1].toLowerCase()}. Tap the dates to change.
        </div>

        <div style={{ marginTop: 12 }}>
          <LineChart points={inRange.map((e) => ({ date: e.log_date, value: e.value }))} start={start} end={end} unit={chart.unit} />
        </div>

        {avg !== null && (
          <div style={{ marginTop: 16, fontFamily: FONTS.body, fontSize: 17, fontWeight: 600, color: COLORS.ink }}>
            Average {chart.name.toLowerCase()}: {Math.round(avg * 10) / 10}{unit}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 14 }}>
          {entries.length === 0 && (
            <p style={{ fontFamily: FONTS.body, fontSize: 14, color: COLORS.mute }}>No entries yet. Tap Add entry to log your first one.</p>
          )}
          {entries.map((e) => (
            <div key={e.id} style={{ display: 'flex', alignItems: 'center', padding: '16px 8px 16px 18px', borderRadius: 18, background: COLORS.surface, border: `1px solid ${COLORS.line}` }}>
              <span style={{ flex: 1, fontFamily: FONTS.body, fontSize: 16, fontWeight: 600, color: COLORS.ink }}>
                {new Date(e.log_date + 'T12:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
              <span style={{ fontFamily: FONTS.body, fontSize: 17, fontWeight: 600, color: COLORS.ink }}>{Number(e.value)}{unit}</span>
              <button onClick={() => remove(e)} aria-label="Delete entry" style={{ background: 'none', border: 'none', color: COLORS.mute, cursor: 'pointer', padding: '6px 10px', marginLeft: 6 }}>
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <Fab label="Add entry" onClick={() => setAdding(true)} wide><Plus size={20} /> Add entry</Fab>

      {adding && (
        <EntrySheet charts={[chart]} chartId={chart.id} uid={uid} onClose={() => setAdding(false)} onSaved={() => { setAdding(false); load(); }} />
      )}
    </>
  );
}

const arrowBtn = { width: 40, height: 40, borderRadius: 12, border: `1px solid ${COLORS.line}`, background: COLORS.surface, color: COLORS.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' };
