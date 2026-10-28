import { useEffect, useState } from 'react';
import { COLORS, FONTS } from '../../brand/tokens';
import { supabase } from '../../lib/supabaseClient';

export default function Progress() {
  const [tab, setTab] = useState('progress'); // progress | prs | photos

  return (
    <div style={{ padding: '24px 24px 24px' }}>
      <div style={{ fontFamily: FONTS.display, fontSize: 26, color: COLORS.ink, fontStyle: 'italic' }}>
        Progress
      </div>

      <div style={{ display: 'flex', gap: 20, marginTop: 20, borderBottom: `1px solid ${COLORS.line}` }}>
        {['progress', 'prs', 'photos'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer', paddingBottom: 10,
              fontFamily: FONTS.body, fontSize: 14, textTransform: 'capitalize',
              color: tab === t ? COLORS.ink : COLORS.mute,
              borderBottom: tab === t ? `2px solid ${COLORS.ink}` : '2px solid transparent',
            }}
          >
            {t === 'prs' ? 'PRs' : t}
          </button>
        ))}
      </div>

      {tab === 'progress' && <ProgressCharts />}
      {tab === 'prs' && <PRsList />}
      {tab === 'photos' && <PhotosPlaceholder />}
    </div>
  );
}

function ProgressCharts() {
  const [metrics, setMetrics] = useState([]); // distinct metric names the user tracks
  const [loading, setLoading] = useState(true);
  const [newMetric, setNewMetric] = useState('');
  const [showAdd, setShowAdd] = useState(false);

  const load = async () => {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    if (!userId) return;
    const { data } = await supabase
      .from('metric_logs')
      .select('metric_name, value, log_date')
      .eq('user_id', userId)
      .order('log_date', { ascending: false });

    const grouped = {};
    (data || []).forEach((row) => {
      if (!grouped[row.metric_name]) grouped[row.metric_name] = [];
      grouped[row.metric_name].push(row);
    });
    setMetrics(Object.entries(grouped));
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const addChart = async (e) => {
    e.preventDefault();
    if (!newMetric.trim()) return;
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    if (!userId) return;
    // Seed the chart with a single entry so it shows up in "My Charts"
    await supabase.from('metric_logs').insert({
      user_id: userId,
      metric_name: newMetric.trim(),
      value: 0,
      log_date: new Date().toISOString().slice(0, 10),
    });
    setNewMetric('');
    setShowAdd(false);
    load();
  };

  return (
    <div style={{ marginTop: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontFamily: FONTS.body, fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', color: COLORS.mute }}>
          My Charts
        </div>
        <button
          onClick={() => setShowAdd((s) => !s)}
          style={{ fontFamily: FONTS.body, fontSize: 13, color: COLORS.gold, background: 'none', border: 'none', cursor: 'pointer' }}
        >
          + Add Chart
        </button>
      </div>

      {showAdd && (
        <form onSubmit={addChart} style={{ marginTop: 12, display: 'flex', gap: 8 }}>
          <input
            placeholder="e.g. Weight, Waist, Bicep"
            value={newMetric}
            onChange={(e) => setNewMetric(e.target.value)}
            style={{ flex: 1, fontFamily: FONTS.body, fontSize: 14, padding: '10px 14px', borderRadius: 12, border: `1px solid ${COLORS.line}` }}
          />
          <button type="submit" style={{ fontFamily: FONTS.body, fontSize: 13, fontWeight: 500, color: COLORS.bg, background: COLORS.ink, border: 'none', padding: '10px 16px', borderRadius: 999, cursor: 'pointer' }}>
            Add
          </button>
        </form>
      )}

      <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {loading && <div style={{ fontFamily: FONTS.body, fontSize: 13, color: COLORS.mute }}>Loading…</div>}
        {!loading && metrics.length === 0 && (
          <div style={{ fontFamily: FONTS.body, fontSize: 13, color: COLORS.mute }}>
            No charts yet — add one above to start tracking (weight, measurements, anything).
          </div>
        )}
        {metrics.map(([name, entries]) => (
          <div key={name} style={{ padding: '14px 16px', borderRadius: 12, background: '#fff', border: `1px solid ${COLORS.line}`, display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: FONTS.body, fontSize: 14, color: COLORS.ink }}>{name}</span>
            <span style={{ fontFamily: FONTS.body, fontSize: 13, color: COLORS.mute }}>
              {entries[0]?.value ?? '--'} · {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PRsList() {
  const [prs, setPrs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;
      if (!userId) return;
      const { data } = await supabase
        .from('personal_records')
        .select('*')
        .eq('user_id', userId)
        .order('achieved_at', { ascending: false });
      setPrs(data || []);
      setLoading(false);
    })();
  }, []);

  return (
    <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
      {loading && <div style={{ fontFamily: FONTS.body, fontSize: 13, color: COLORS.mute }}>Loading…</div>}
      {!loading && prs.length === 0 && (
        <div style={{ fontFamily: FONTS.body, fontSize: 13, color: COLORS.mute }}>
          No PRs logged yet — these show up automatically as you log heavier lifts.
        </div>
      )}
      {prs.map((pr) => (
        <div key={pr.id} style={{ padding: '14px 16px', borderRadius: 12, background: '#fff', border: `1px solid ${COLORS.line}`, display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: FONTS.body, fontSize: 14, color: COLORS.ink }}>{pr.exercise_name}</span>
          <span style={{ fontFamily: FONTS.body, fontSize: 13, color: COLORS.gold, fontWeight: 600 }}>{pr.weight} lbs</span>
        </div>
      ))}
    </div>
  );
}

function PhotosPlaceholder() {
  return (
    <div style={{ marginTop: 20, fontFamily: FONTS.body, fontSize: 13, color: COLORS.mute, lineHeight: 1.6 }}>
      Progress photos aren't wired up yet — this needs Supabase Storage for image uploads, which is a separate piece of setup. Happy to build it next when you're ready.
    </div>
  );
}
