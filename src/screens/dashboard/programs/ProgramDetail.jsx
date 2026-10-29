import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, ChevronDown, ChevronRight } from 'lucide-react';
import { COLORS, FONTS } from '../../../brand/tokens';
import SubHeader from '../../../components/SubHeader';
import Sprig from '../../../components/Sprig';
import { supabase } from '../../../lib/supabaseClient';
import { Muted } from './shared';
import { WEEKDAYS, weekdayForDay } from '../../../lib/workout';

export default function ProgramDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [program, setProgram] = useState(null);
  const [enrollment, setEnrollment] = useState(undefined); // undefined = loading
  const [tab, setTab] = useState('weeks');
  const [openWeek, setOpenWeek] = useState(null);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('workout_programs').select('*').eq('id', id).maybeSingle();
      const { data: dayRows } = await supabase.from('program_days').select('id, day_number, day_label, title, program_id').eq('program_id', id);
      setProgram(data ? { ...data, program_days: dayRows || [] } : null);

      const { data: userData } = await supabase.auth.getUser();
      const uid = userData?.user?.id;
      if (!uid) return setEnrollment(null);
      const { data: active } = await supabase
        .from('program_enrollments')
        .select('id, program_id, current_day, started_at')
        .eq('user_id', uid)
        .eq('active', true)
        .maybeSingle();
      setEnrollment(active || null);
    })();
  }, [id]);

  if (!program) {
    return (
      <>
        <SubHeader title="Program" />
        <Muted style={{ padding: '12px 18px' }}>{program === null ? 'This program wasn’t found.' : 'Loading…'}</Muted>
      </>
    );
  }

  const days = [...(program.program_days || [])].sort((a, b) => a.day_number - b.day_number);
  const isMine = enrollment && enrollment.program_id === program.id;
  const perWeek = program.days_per_week || 1;
  const myWeek = isMine
    ? Math.min(program.weeks || 99, Math.floor((Date.now() - new Date(enrollment.started_at || Date.now()).getTime()) / (7 * 86400000)) + 1)
    : null;

  const start = async () => {
    if (isMine) return navigate('/dashboard/workout');
    setStarting(true);
    const { data: userData } = await supabase.auth.getUser();
    const uid = userData?.user?.id;
    if (!uid) return setStarting(false);
    await supabase.from('program_enrollments').update({ active: false }).eq('user_id', uid);
    await supabase.from('program_enrollments').insert({
      user_id: uid,
      program_id: program.id,
      current_day: 1,
      active: true,
      started_at: new Date().toISOString(),
    });
    navigate('/dashboard/workout');
  };

  const buttonLabel = isMine ? 'Continue program' : enrollment ? 'Switch to this program' : 'Start program';

  return (
    <>
      <SubHeader title={program.title} />

      {/* Hero */}
      <div style={{ position: 'relative', height: 240, background: COLORS.olive, overflow: 'hidden' }}>
        {program.image ? (
          <img src={program.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ position: 'absolute', right: -10, top: -20, opacity: 0.2 }}>
            <Sprig size={300} color="#fff" />
          </div>
        )}
        <div style={{ position: 'absolute', left: 20, bottom: 18, right: 20 }}>
          <div style={{ fontFamily: FONTS.display, fontSize: 34, fontWeight: 500, color: '#fff', lineHeight: 1, textShadow: program.image ? '0 1px 12px rgba(0,0,0,0.4)' : 'none' }}>
            {program.track || program.title}
          </div>
          <div style={{ fontFamily: FONTS.body, fontSize: 13, color: 'rgba(255,255,255,0.92)', marginTop: 6 }}>
            {program.days_per_week} sessions a week, {program.weeks} weeks, {program.level_key === 'beginner' || (!program.level_key && /^beginner/i.test(program.level || '')) ? 'Beginner' : 'Experienced'}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div role="tablist" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: `1px solid ${COLORS.line}` }}>
        {[['overview', 'Overview'], ['weeks', 'Weeks']].map(([key, label]) => (
          <button
            key={key}
            role="tab"
            aria-selected={tab === key}
            onClick={() => setTab(key)}
            style={{
              padding: '14px 0 12px',
              background: 'none',
              border: 'none',
              borderBottom: `3px solid ${tab === key ? COLORS.ink : 'transparent'}`,
              fontFamily: FONTS.body,
              fontSize: 15,
              fontWeight: 600,
              color: tab === key ? COLORS.ink : COLORS.mute,
              cursor: 'pointer',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <div style={{ padding: '18px 18px 110px' }}>
        {tab === 'overview' && (
          <>
            <div style={{ fontFamily: FONTS.display, fontSize: 28, fontWeight: 500, color: COLORS.ink, lineHeight: 1.1 }}>
              Welcome to {program.track || program.title}
            </div>
            {program.description && (
              <div style={{ fontFamily: FONTS.body, fontSize: 15, color: COLORS.ink, lineHeight: 1.6, marginTop: 10 }}>{program.description}</div>
            )}
            <div style={{ fontFamily: FONTS.display, fontSize: 22, color: COLORS.ink, marginTop: 24 }}>Your week</div>
            <Muted style={{ padding: 0, marginTop: 2 }}>Tap a day to open that workout.</Muted>
            <div style={{ marginTop: 8 }}>
              {days.map((d) => <DayRow key={d.id} d={d} />)}
            </div>
            {program.guide && (
              <>
                <div style={{ fontFamily: FONTS.display, fontSize: 22, color: COLORS.ink, marginTop: 24 }}>Before you start</div>
                <div style={{ fontFamily: FONTS.body, fontSize: 14, color: COLORS.ink, lineHeight: 1.6, marginTop: 8, whiteSpace: 'pre-line' }}>{program.guide}</div>
              </>
            )}
          </>
        )}

        {tab === 'weeks' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {Array.from({ length: program.weeks || 1 }).map((_, i) => {
              const week = i + 1;
              const open = openWeek === week;
              return (
                <div key={week} style={{ borderRadius: 20, overflow: 'hidden', background: '#fff', border: `1px solid ${COLORS.line}` }}>
                  <button
                    onClick={() => setOpenWeek(open ? null : week)}
                    aria-expanded={open}
                    style={{
                      position: 'relative',
                      display: 'block',
                      width: '100%',
                      height: 120,
                      border: 'none',
                      background: week % 2 ? COLORS.ink : COLORS.olive,
                      cursor: 'pointer',
                      textAlign: 'left',
                      overflow: 'hidden',
                    }}
                  >
                    <div style={{ position: 'absolute', right: -6, top: -14, opacity: 0.16 }}>
                      <Sprig size={160} color="#fff" />
                    </div>
                    <div style={{ position: 'absolute', left: 20, bottom: 16, fontFamily: FONTS.display, fontSize: 32, fontWeight: 500, color: '#fff' }}>
                      Week {week}
                    </div>
                    {myWeek === week && (
                      <span style={{ position: 'absolute', left: 20, top: 16, padding: '4px 10px', borderRadius: 999, background: COLORS.rose, color: COLORS.ink, fontFamily: FONTS.body, fontSize: 12, fontWeight: 600 }}>
                        You’re here
                      </span>
                    )}
                    <ChevronDown size={22} color="#fff" style={{ position: 'absolute', right: 18, bottom: 20, transform: open ? 'rotate(180deg)' : 'none' }} />
                  </button>
                  {open && (
                    <div style={{ padding: '4px 16px 8px' }}>
                      {days.map((d) => <DayRow key={d.id} d={d} />)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Start / continue, floating above the bottom nav */}
      {enrollment !== undefined && (
        <div style={{ position: 'fixed', left: '50%', transform: 'translateX(-50%)', bottom: 'calc(72px + env(safe-area-inset-bottom, 0px))', width: '100%', maxWidth: 480, padding: '0 14px', zIndex: 4 }}>
          <button
            onClick={start}
            disabled={starting}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '16px',
              borderRadius: 16,
              border: 'none',
              background: COLORS.ink,
              color: COLORS.bg,
              fontFamily: FONTS.body,
              fontSize: 16,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {starting ? 'Starting…' : buttonLabel} <ArrowRight size={18} />
          </button>
          {enrollment && !isMine && (
            <div style={{ textAlign: 'center', fontFamily: FONTS.body, fontSize: 12, color: COLORS.mute, marginTop: 6, background: COLORS.bg, borderRadius: 8 }}>
              This replaces the program you’re on now.
            </div>
          )}
        </div>
      )}
    </>
  );
}

// One training day: weekday, day number and focus. Opens that day's workout.
function DayRow({ d }) {
  return (
    <Link
      to={`/dashboard/workout?day=${d.id}`}
      style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 0', borderBottom: `1px solid ${COLORS.line}`, fontFamily: FONTS.body, fontSize: 14, textDecoration: 'none' }}
    >
      <span style={{ width: 92, flexShrink: 0, color: COLORS.mute }}>{WEEKDAYS[weekdayForDay(d) - 1]}</span>
      <span style={{ flex: 1, color: COLORS.ink, fontWeight: 600 }}>Day {d.day_number}: {d.title}</span>
      <ChevronRight size={18} color={COLORS.mute} />
    </Link>
  );
}
