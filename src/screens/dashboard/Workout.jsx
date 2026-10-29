import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Repeat, CircleCheck, Check, ChevronRight } from 'lucide-react';
import { COLORS, FONTS, tint } from '../../brand/tokens';
import SubHeader from '../../components/SubHeader';
import ExerciseThumb from '../../components/ExerciseThumb';
import { supabase } from '../../lib/supabaseClient';
import { SECTIONS, sectionOf, prescription, loadToday, loadDayById, todayISO, WEEKDAYS, weekdayForDay } from '../../lib/workout';

// Today's workout: Mobility → Workout → Ab circuit / Deep core → Cardio → Stretch.
// Tap an exercise to log it set by set. "Mark as complete" moves you to the next day.
export default function Workout() {
  const [params] = useSearchParams();
  const dayParam = params.get('day'); // open a specific day from the program page
  const [data, setData] = useState(null);
  const [doneIds, setDoneIds] = useState(new Set());
  const [completing, setCompleting] = useState(false);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    (async () => {
      setData(null);
      setCompleted(false);
      let result;
      if (dayParam) {
        const { data: userData } = await supabase.auth.getUser();
        const loaded = await loadDayById(dayParam);
        result = loaded ? { uid: userData?.user?.id, ...loaded, chosen: true } : { missing: true };
        if (loaded && result.uid) {
          const { data: done } = await supabase
            .from('workout_completions')
            .select('id')
            .eq('user_id', result.uid)
            .eq('program_day_id', dayParam)
            .eq('completed_on', todayISO());
          result.completedToday = (done || []).length > 0;
        }
      } else {
        result = await loadToday();
      }
      setData(result);
      if (result.uid && result.exercises?.length) {
        const { data: sets } = await supabase
          .from('exercise_sets')
          .select('program_exercise_id, done')
          .eq('user_id', result.uid)
          .eq('log_date', todayISO());
        setDoneIds(new Set((sets || []).filter((x) => x.done).map((x) => x.program_exercise_id)));
      }
    })();
  }, [dayParam]);

  if (!data) return <><SubHeader title="Today’s workout" /><Note>Loading…</Note></>;

  if (data.missing || (!data.chosen && !data.enrollment)) {
    return (
      <>
        <SubHeader title="Today’s workout" />
        <div style={{ padding: '8px 18px' }}>
          <div style={{ fontFamily: FONTS.display, fontSize: 30, color: COLORS.ink }}>{data.missing ? 'Workout not found' : 'No program yet'}</div>
          <Note style={{ padding: '8px 0 0' }}>Choose a program and your workouts will show up here, one for each training day.</Note>
          <Link to="/dashboard/program" style={darkButton}>Choose a program</Link>
        </div>
      </>
    );
  }

  // Rest day: nothing scheduled for today's weekday
  if (!data.day) {
    const next = data.nextDay;
    return (
      <>
        <SubHeader title={`${WEEKDAYS[data.weekday - 1]}: Rest day`} />
        <div style={{ padding: '8px 18px' }}>
          <div style={{ fontFamily: FONTS.display, fontSize: 32, color: COLORS.ink, lineHeight: 1.1 }}>Rest and recover</div>
          <Note style={{ padding: '8px 0 0' }}>
            There’s no {data.program.title} workout on {WEEKDAYS[data.weekday - 1]}s. Rest is part of the training.
          </Note>
          {next && (
            <Link to={`/dashboard/workout?day=${next.id}`} style={{ display: 'block', marginTop: 18, padding: '16px 18px', borderRadius: 18, background: '#fff', border: `1px solid ${COLORS.line}`, textDecoration: 'none' }}>
              <div style={{ fontFamily: FONTS.body, fontSize: 12, fontWeight: 600, color: COLORS.mute }}>Next workout, {WEEKDAYS[next.weekday - 1]}</div>
              <div style={{ fontFamily: FONTS.body, fontSize: 17, fontWeight: 600, color: COLORS.ink, marginTop: 2 }}>Day {next.day_number}: {next.title}</div>
            </Link>
          )}
        </div>
      </>
    );
  }

  const { program, day, exercises, uid } = data;
  const weekdayName = WEEKDAYS[weekdayForDay(day) - 1];
  const title = `Day ${day.day_number}: ${day.title || 'Workout'}`;

  const markComplete = async () => {
    setCompleting(true);
    await supabase.from('workout_completions').insert({
      user_id: uid,
      program_id: day.program_id,
      program_day_id: day.id,
      completed_on: todayISO(),
    });
    setCompleting(false);
    setCompleted(true);
  };

  return (
    <>
      <SubHeader title={title} />
      <div style={{ padding: '0 16px 32px' }}>
        <div style={{ textAlign: 'center', fontFamily: FONTS.body, fontSize: 13, color: COLORS.mute }}>
          {weekdayName}, {program.title}{data.week && !data.chosen ? `, week ${data.week}` : ''}
        </div>

        {day.rest_note && <Callout>{day.rest_note}</Callout>}

        {SECTIONS.map((sec, i) => {
          const items = exercises.filter((e) => sectionOf(e) === sec.key);
          if (!items.length) return null;
          return (
            <section key={sec.key} style={{ borderTop: i ? `1px solid ${COLORS.line}` : 'none', marginTop: 18, paddingTop: 18 }}>
              <h2 style={{ margin: 0, textAlign: 'center', fontFamily: FONTS.display, fontSize: 28, fontWeight: 500, color: COLORS.ink }}>{sec.label}</h2>
              {sec.key === 'core' && program.core_note && (
                <div style={{ textAlign: 'center', fontFamily: FONTS.body, fontSize: 13, color: COLORS.mute, lineHeight: 1.5, margin: '6px 8px 0' }}>{program.core_note}</div>
              )}
              <Groups items={items} tone={sec.tone} doneIds={doneIds} />
            </section>
          );
        })}

        {day.focus_note && (
          <div style={{ marginTop: 22, fontFamily: FONTS.body, fontSize: 14, color: COLORS.ink, lineHeight: 1.5 }}>
            <span style={{ fontWeight: 600 }}>Focus:</span> {day.focus_note}
          </div>
        )}

        {program.guide && (
          <details style={{ marginTop: 16, padding: '14px 16px', borderRadius: 16, background: '#fff', border: `1px solid ${COLORS.line}` }}>
            <summary style={{ fontFamily: FONTS.body, fontSize: 14, fontWeight: 600, color: COLORS.ink, cursor: 'pointer' }}>Warm-up, effort, and form rules</summary>
            <div style={{ fontFamily: FONTS.body, fontSize: 13, color: COLORS.ink, lineHeight: 1.6, marginTop: 10, whiteSpace: 'pre-line' }}>{program.guide}</div>
          </details>
        )}

        {completed || data.completedToday ? (
          <>
            <div style={{ ...bigButton, background: '#fff', color: COLORS.ink, border: `1px solid ${COLORS.line}` }}>
              Completed <Check size={20} />
            </div>
            <Note style={{ textAlign: 'center', padding: '10px 0 0' }}>Well done. See you at your next workout.</Note>
          </>
        ) : (
          <button onClick={markComplete} disabled={completing} style={{ ...bigButton, border: 'none', cursor: 'pointer' }}>
            {completing ? 'Saving…' : 'Mark as complete'} <CircleCheck size={20} />
          </button>
        )}
      </div>
    </>
  );
}

// Consecutive exercises sharing a superset letter are grouped under one bracket.
function Groups({ items, tone, doneIds }) {
  const groups = [];
  for (const ex of items) {
    const last = groups[groups.length - 1];
    if (ex.superset_group && last && last.key === ex.superset_group) last.items.push(ex);
    else groups.push({ key: ex.superset_group || null, items: [ex] });
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 14 }}>
      {groups.map((g, i) =>
        g.key && g.items.length > 1 ? (
          <div key={i} style={{ borderLeft: `3px solid ${COLORS.ink}`, paddingLeft: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: FONTS.body, fontSize: 13, fontWeight: 600, color: COLORS.mute, margin: '2px 0 10px' }}>
              <Repeat size={15} /> Superset, {g.items[0].sets} rounds
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {g.items.map((ex) => <Card key={ex.id} ex={ex} tone={tone} done={doneIds.has(ex.id)} inSuperset />)}
            </div>
          </div>
        ) : (
          g.items.map((ex) => <Card key={ex.id} ex={ex} tone={tone} done={doneIds.has(ex.id)} />)
        )
      )}
    </div>
  );
}

function Card({ ex, tone, done, inSuperset }) {
  return (
    <Link
      to={`/dashboard/workout/${ex.id}`}
      style={{ display: 'flex', alignItems: 'stretch', borderRadius: 18, overflow: 'hidden', background: '#fff', border: `1px solid ${COLORS.line}`, textDecoration: 'none' }}
    >
      <ExerciseThumb media={ex.media} tone={tone} />
      <div style={{ flex: 1, minWidth: 0, padding: '14px 12px 14px 16px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ fontFamily: FONTS.body, fontSize: 16, fontWeight: 600, color: COLORS.ink, lineHeight: 1.25 }}>{ex.name}</div>
        <div style={{ fontFamily: FONTS.body, fontSize: 13, fontWeight: 500, color: COLORS.mute, marginTop: 4 }}>
          {[inSuperset ? (ex.reps && ex.reps !== 'circuit' ? ex.reps : '') : prescription(ex), ex.note].filter(Boolean).join('. ')}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', paddingRight: 14 }}>
        {done ? (
          <span style={{ width: 26, height: 26, borderRadius: '50%', background: COLORS.gold, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Check size={16} color="#fff" strokeWidth={3} />
          </span>
        ) : (
          <ChevronRight size={20} color={COLORS.mute} />
        )}
      </div>
    </Link>
  );
}

function Note({ children, style }) {
  return <div style={{ padding: '12px 18px', fontFamily: FONTS.body, fontSize: 14, color: COLORS.mute, lineHeight: 1.5, ...style }}>{children}</div>;
}

function Callout({ children }) {
  return (
    <div style={{ marginTop: 12, padding: '12px 14px', borderRadius: 14, background: tint(COLORS.gold, 12), fontFamily: FONTS.body, fontSize: 13, color: COLORS.ink, lineHeight: 1.5 }}>
      {children}
    </div>
  );
}

const bigButton = {
  marginTop: 26,
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 10,
  padding: '17px',
  borderRadius: 18,
  background: COLORS.ink,
  color: COLORS.bg,
  fontFamily: FONTS.body,
  fontSize: 17,
  fontWeight: 600,
};

const darkButton = {
  display: 'inline-block',
  marginTop: 16,
  padding: '13px 20px',
  borderRadius: 999,
  background: COLORS.ink,
  color: COLORS.bg,
  fontFamily: FONTS.body,
  fontSize: 14,
  fontWeight: 600,
};
