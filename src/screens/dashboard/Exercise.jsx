import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { List, Timer, Square, Play, Plus, Check, ChevronRight, Dumbbell } from 'lucide-react';
import { COLORS, FONTS, tint } from '../../brand/tokens';
import SubHeader from '../../components/SubHeader';
import ExerciseThumb from '../../components/ExerciseThumb';
import { supabase } from '../../lib/supabaseClient';
import { loadToday, todayISO, parseSeconds, plannedReps, prescription, formatClock, youtubeEmbed, SECTIONS, sectionOf } from '../../lib/workout';

const REST_SECONDS = 90;

export default function Exercise() {
  const { exerciseId } = useParams();
  const navigate = useNavigate();
  const [ctx, setCtx] = useState(null); // { uid, ex, next }
  const [rows, setRows] = useState([]); // [{ reps, weight, seconds, done }]
  const [comment, setComment] = useState('');
  const [prevMax, setPrevMax] = useState(0);
  const [lastTime, setLastTime] = useState(null); // { date, sets }
  const [pr, setPr] = useState(null);
  const [rest, setRest] = useState(null); // seconds left, or null
  const restRef = useRef(null);

  const today = todayISO();

  useEffect(() => {
    (async () => {
      const data = await loadToday();
      const list = data.exercises || [];
      const i = list.findIndex((e) => e.id === exerciseId);
      if (i < 0) return setCtx({ missing: true });
      const ex = list[i];
      setCtx({ uid: data.uid, ex, next: list[i + 1] || null, timedTarget: parseSeconds(ex.reps) });

      // Today's saved sets
      const { data: saved } = await supabase
        .from('exercise_sets')
        .select('*')
        .eq('user_id', data.uid)
        .eq('program_exercise_id', ex.id)
        .eq('log_date', today)
        .order('set_number', { ascending: true });
      const count = Math.max(ex.sets || 1, ...(saved || []).map((s) => s.set_number));
      setRows(
        Array.from({ length: count }).map((_, n) => {
          const s = (saved || []).find((x) => x.set_number === n + 1);
          return { reps: s?.reps ?? '', weight: s?.weight ?? '', seconds: s?.seconds ?? null, done: !!s?.done };
        })
      );

      // History for PRs and "last time"
      const { data: history } = await supabase
        .from('exercise_sets')
        .select('log_date, set_number, reps, weight, done')
        .eq('user_id', data.uid)
        .eq('exercise_name', ex.name)
        .eq('done', true)
        .order('log_date', { ascending: false })
        .limit(200);
      const past = (history || []).filter((h) => h.log_date < today);
      setPrevMax(past.reduce((m, h) => Math.max(m, Number(h.weight) || 0), 0));
      if (past.length) {
        const date = past[0].log_date;
        setLastTime({ date, sets: past.filter((h) => h.log_date === date).sort((a, b) => a.set_number - b.set_number) });
      }

      const { data: note } = await supabase
        .from('exercise_notes')
        .select('comment')
        .eq('user_id', data.uid)
        .eq('program_exercise_id', ex.id)
        .eq('log_date', today)
        .maybeSingle();
      setComment(note?.comment || '');
    })();
  }, [exerciseId]);

  // Rest timer tick
  useEffect(() => {
    if (rest === null) return;
    if (rest <= 0) {
      if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
      setRest(null);
      return;
    }
    restRef.current = setTimeout(() => setRest((r) => (r === null ? null : r - 1)), 1000);
    return () => clearTimeout(restRef.current);
  }, [rest]);

  if (!ctx) return <><SubHeader title="Exercise" /><Muted>Loading…</Muted></>;
  if (ctx.missing) {
    return (
      <>
        <SubHeader title="Exercise" />
        <Muted>This exercise isn’t part of today’s workout. <Link to="/dashboard/workout" style={{ color: COLORS.gold }}>Back to today’s workout</Link></Muted>
      </>
    );
  }

  const { uid, ex, next, timedTarget } = ctx;
  const timed = !!timedTarget;
  const sectionTone = SECTIONS.find((s) => s.key === sectionOf(ex))?.tone || 'ink';

  const saveRow = async (index, row) => {
    await supabase.from('exercise_sets').upsert(
      {
        user_id: uid,
        program_exercise_id: ex.id,
        exercise_name: ex.name,
        log_date: today,
        set_number: index + 1,
        reps: row.reps === '' ? null : Number(row.reps),
        weight: row.weight === '' ? null : Number(row.weight),
        seconds: row.seconds,
        done: row.done,
      },
      { onConflict: 'user_id,program_exercise_id,log_date,set_number' }
    );
  };

  const update = (index, patch) => {
    setRows((rs) => rs.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  };

  const toggleDone = async (index) => {
    const current = rows[index];
    const row = {
      ...current,
      done: !current.done,
      reps: current.reps === '' && !timed ? plannedReps(ex.reps) ?? '' : current.reps,
    };
    update(index, row);
    await saveRow(index, row);

    if (row.done && !timed) {
      const w = Number(row.weight) || 0;
      const bestToday = rows.reduce((m, r, i) => (i !== index && r.done ? Math.max(m, Number(r.weight) || 0) : m), 0);
      if (prevMax > 0 && w > prevMax && w > bestToday) {
        setPr(w);
        setTimeout(() => setPr(null), 4000);
      }
      setRest(REST_SECONDS);
    }
  };

  const addSet = () => setRows((rs) => [...rs, { reps: '', weight: rs[rs.length - 1]?.weight ?? '', seconds: null, done: false }]);

  const saveComment = async () => {
    await supabase.from('exercise_notes').upsert(
      { user_id: uid, program_exercise_id: ex.id, log_date: today, comment },
      { onConflict: 'user_id,program_exercise_id,log_date' }
    );
  };

  const dateLabel = new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <>
      <SubHeader title={ex.name} />
      <Media media={ex.media} tone={sectionTone} />

      <div style={{ padding: '14px 14px 150px' }}>
        <div style={{ padding: '18px 16px', borderRadius: 22, background: '#fff', border: `1px solid ${COLORS.line}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
            <div style={{ fontFamily: FONTS.body, fontSize: 18, fontWeight: 600, color: COLORS.ink }}>{dateLabel}</div>
            <div style={{ fontFamily: FONTS.body, fontSize: 13, color: COLORS.mute }}>Goal: {prescription(ex)}</div>
          </div>
          {ex.note && <div style={{ fontFamily: FONTS.body, fontSize: 13, color: COLORS.mute, marginTop: 6 }}>{ex.note}</div>}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
            {rows.map((row, i) =>
              timed ? (
                <TimedRow
                  key={i}
                  n={i + 1}
                  target={timedTarget}
                  row={row}
                  onFinish={async (secs) => {
                    const r = { ...row, seconds: secs, done: true };
                    update(i, r);
                    await saveRow(i, r);
                  }}
                  onToggle={() => toggleDone(i)}
                />
              ) : (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '18px 1fr auto 1.3fr auto 32px', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontFamily: FONTS.body, fontSize: 16, fontWeight: 600, color: COLORS.ink }}>{i + 1}</span>
                  <input
                    inputMode="numeric"
                    aria-label={`Set ${i + 1} reps`}
                    value={row.reps}
                    placeholder={String(plannedReps(ex.reps) ?? '')}
                    onChange={(e) => update(i, { reps: e.target.value.replace(/[^\d]/g, '') })}
                    onBlur={() => row.done && saveRow(i, row)}
                    style={inputStyle}
                  />
                  <span style={unitStyle}>reps ×</span>
                  <input
                    inputMode="decimal"
                    aria-label={`Set ${i + 1} weight in pounds`}
                    value={row.weight}
                    placeholder={lastTime?.sets?.[i]?.weight ? String(lastTime.sets[i].weight) : ''}
                    onChange={(e) => update(i, { weight: e.target.value.replace(/[^\d.]/g, '') })}
                    onBlur={() => row.done && saveRow(i, row)}
                    style={inputStyle}
                  />
                  <span style={unitStyle}>lbs</span>
                  <DoneButton done={row.done} onClick={() => toggleDone(i)} label={`Mark set ${i + 1} done`} />
                </div>
              )
            )}
          </div>

          <button onClick={addSet} style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '18px auto 4px', background: 'none', border: 'none', fontFamily: FONTS.body, fontSize: 14, fontWeight: 600, color: COLORS.ink, cursor: 'pointer' }}>
            <Plus size={16} /> Add set
          </button>

          {lastTime && !timed && (
            <div style={{ marginTop: 10, fontFamily: FONTS.body, fontSize: 13, color: COLORS.mute, textAlign: 'center' }}>
              Last time ({new Date(lastTime.date + 'T12:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}):{' '}
              {lastTime.sets.map((s) => `${s.reps ?? '–'} × ${s.weight ?? 0}`).join(', ')}
            </div>
          )}

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            onBlur={saveComment}
            placeholder="Comments"
            rows={3}
            style={{ marginTop: 16, width: '100%', boxSizing: 'border-box', padding: '14px 16px', borderRadius: 16, border: 'none', background: tint(COLORS.line, 70), fontFamily: FONTS.body, fontSize: 15, color: COLORS.ink, resize: 'none', outline: 'none' }}
          />
        </div>

        {/* Up next */}
        <button
          onClick={() => navigate(next ? `/dashboard/workout/${next.id}` : '/dashboard/workout')}
          style={{ marginTop: 16, width: '100%', display: 'flex', alignItems: 'stretch', borderRadius: 18, overflow: 'hidden', background: '#fff', border: `1px solid ${COLORS.line}`, padding: 0, cursor: 'pointer', textAlign: 'left' }}
        >
          {next ? <ExerciseThumb media={next.media} tone={SECTIONS.find((s) => s.key === sectionOf(next))?.tone} size={76} /> : null}
          <div style={{ flex: 1, padding: '14px 16px' }}>
            <div style={{ fontFamily: FONTS.body, fontSize: 12, fontWeight: 600, color: COLORS.mute }}>{next ? 'Up next' : 'All done'}</div>
            <div style={{ fontFamily: FONTS.body, fontSize: 17, fontWeight: 600, color: COLORS.ink, marginTop: 2 }}>
              {next ? next.name : 'Back to mark the workout complete'}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', paddingRight: 14 }}><ChevronRight size={22} color={COLORS.ink} /></div>
        </button>
      </div>

      {/* PR banner */}
      {pr && (
        <div role="status" style={{ position: 'fixed', left: '50%', transform: 'translateX(-50%)', bottom: 'calc(150px + env(safe-area-inset-bottom, 0px))', width: 'calc(100% - 28px)', maxWidth: 452, padding: '16px', borderRadius: 16, background: COLORS.ink, color: COLORS.bg, textAlign: 'center', fontFamily: FONTS.body, fontSize: 16, fontWeight: 600, zIndex: 6 }}>
          New weight PR: {pr} lbs!
        </div>
      )}

      {/* Floating buttons: back to the day list, and the rest timer */}
      <div style={{ position: 'fixed', left: '50%', transform: 'translateX(-50%)', bottom: 'calc(78px + env(safe-area-inset-bottom, 0px))', width: '100%', maxWidth: 480, padding: '0 14px', display: 'flex', justifyContent: 'space-between', pointerEvents: 'none', zIndex: 5 }}>
        <Link to="/dashboard/workout" aria-label="Back to today’s workout" style={{ ...floatBtn, width: 60, padding: 0, justifyContent: 'center', pointerEvents: 'auto' }}>
          <List size={24} />
        </Link>
        <button onClick={() => setRest(rest === null ? REST_SECONDS : null)} style={{ ...floatBtn, pointerEvents: 'auto', border: 'none', cursor: 'pointer' }}>
          {rest === null ? <><Timer size={20} /> Rest</> : <><Square size={16} fill="currentColor" /> {formatClock(rest)}</>}
        </button>
      </div>
    </>
  );
}

function Media({ media, tone }) {
  const embed = youtubeEmbed(media?.video_url);
  const box = { width: '100%', aspectRatio: '16 / 10', background: '#000', display: 'block' };
  if (embed) {
    return <iframe src={embed} title="Exercise video" style={{ ...box, border: 0 }} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen />;
  }
  if (media?.video_url) {
    return <video src={media.video_url} poster={media.thumbnail_url || undefined} controls playsInline style={{ ...box, objectFit: 'contain' }} />;
  }
  return (
    <div style={{ ...box, background: COLORS[tone] || COLORS.ink, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
      {media?.thumbnail_url ? (
        <img src={media.thumbnail_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        <>
          <Dumbbell size={40} color="rgba(255,255,255,0.8)" />
          <span style={{ fontFamily: FONTS.body, fontSize: 13, color: 'rgba(255,255,255,0.85)' }}>Video coming soon</span>
        </>
      )}
    </div>
  );
}

// A countdown for timed sets (stretches, holds, cardio). Starts on tap.
function TimedRow({ n, target, row, onFinish, onToggle }) {
  const [left, setLeft] = useState(null);
  const startedRef = useRef(0);

  useEffect(() => {
    if (left === null) return;
    if (left <= 0) {
      if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
      setLeft(null);
      onFinish(target);
      return;
    }
    const t = setTimeout(() => setLeft((l) => (l === null ? null : l - 1)), 1000);
    return () => clearTimeout(t);
  }, [left]);

  const running = left !== null;
  const shown = running ? left : row.done ? 0 : target;
  const pct = running ? 1 - left / target : row.done ? 1 : 0;
  const r = 30;
  const c = 2 * Math.PI * r;

  const stop = () => {
    const elapsed = target - left;
    setLeft(null);
    if (elapsed > 0) onFinish(elapsed);
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <span style={{ width: 18, fontFamily: FONTS.body, fontSize: 16, fontWeight: 600, color: COLORS.ink }}>{n}</span>
      <div style={{ position: 'relative', width: 72, height: 72 }}>
        <svg width="72" height="72" viewBox="0 0 72 72" aria-hidden="true">
          <circle cx="36" cy="36" r={r} fill="none" stroke={COLORS.line} strokeWidth="5" />
          <circle cx="36" cy="36" r={r} fill="none" stroke={COLORS.ink} strokeWidth="5" strokeDasharray={c} strokeDashoffset={c * (1 - pct)} strokeLinecap="round" transform="rotate(-90 36 36)" />
        </svg>
        <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONTS.body, fontSize: 16, fontWeight: 700, color: COLORS.ink }}>
          {formatClock(shown)}
        </span>
      </div>
      <div style={{ flex: 1 }} />
      <button
        onClick={running ? stop : () => setLeft(target)}
        style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 18px', borderRadius: 14, border: 'none', background: COLORS.ink, color: COLORS.bg, fontFamily: FONTS.body, fontSize: 15, fontWeight: 600, cursor: 'pointer' }}
      >
        {running ? <><Square size={14} fill="currentColor" /> Stop</> : <><Play size={14} fill="currentColor" /> Start</>}
      </button>
      <DoneButton done={row.done} onClick={onToggle} label={`Mark set ${n} done`} />
    </div>
  );
}

function DoneButton({ done, onClick, label }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      aria-pressed={done}
      style={{ width: 30, height: 30, borderRadius: '50%', border: `2px solid ${done ? COLORS.gold : COLORS.ink}`, background: done ? COLORS.gold : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0 }}
    >
      {done && <Check size={16} color="#fff" strokeWidth={3} />}
    </button>
  );
}

function Muted({ children }) {
  return <div style={{ padding: '12px 18px', fontFamily: FONTS.body, fontSize: 14, color: COLORS.mute, lineHeight: 1.5 }}>{children}</div>;
}

const inputStyle = {
  width: '100%',
  minWidth: 0,
  boxSizing: 'border-box',
  padding: '12px 12px',
  borderRadius: 14,
  border: 'none',
  background: tint(COLORS.line, 70),
  fontFamily: FONTS.body,
  fontSize: 17,
  fontWeight: 500,
  color: COLORS.ink,
  outline: 'none',
};

const unitStyle = { fontFamily: FONTS.body, fontSize: 12, fontWeight: 600, letterSpacing: '0.04em', color: COLORS.ink, whiteSpace: 'nowrap' };

const floatBtn = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  height: 56,
  padding: '0 22px',
  borderRadius: 999,
  background: COLORS.ink,
  color: COLORS.bg,
  fontFamily: FONTS.body,
  fontSize: 16,
  fontWeight: 600,
  boxShadow: '0 4px 14px rgba(0,0,0,0.18)',
};
