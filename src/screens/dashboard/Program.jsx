import { useEffect, useState } from 'react';
import { COLORS, FONTS } from '../../brand/tokens';
import { supabase } from '../../lib/supabaseClient';

export default function Program() {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrollingId, setEnrollingId] = useState(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('workout_programs')
        .select('*')
        .order('sort_order', { ascending: true });
      setPrograms(data || []);
      setLoading(false);
    })();
  }, []);

  const enroll = async (programId) => {
    setEnrollingId(programId);
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    if (!userId) return;

    // Deactivate any current program, then start the new one at day 1.
    await supabase.from('program_enrollments').update({ active: false }).eq('user_id', userId);
    await supabase.from('program_enrollments').upsert({
      user_id: userId,
      program_id: programId,
      current_day: 1,
      active: true,
      started_at: new Date().toISOString(),
    });
    setEnrollingId(null);
  };

  return (
    <div style={{ padding: '48px 24px 24px' }}>
      <div style={{ fontFamily: FONTS.display, fontSize: 26, color: COLORS.ink, fontStyle: 'italic' }}>
        Structured programs
      </div>
      <div style={{ fontFamily: FONTS.body, fontSize: 13, color: COLORS.mute, marginTop: 6 }}>
        Multi-week plans, matched to your season.
      </div>

      <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {loading && (
          <div style={{ fontFamily: FONTS.body, fontSize: 13, color: COLORS.mute }}>Loading programs…</div>
        )}
        {!loading && programs.length === 0 && (
          <div style={{ fontFamily: FONTS.body, fontSize: 13, color: COLORS.mute }}>
            No programs published yet — add rows to `workout_programs` in Supabase.
          </div>
        )}
        {programs.map((p) => (
          <div key={p.id} style={{ padding: 18, borderRadius: 16, background: '#fff', border: `1px solid ${COLORS.line}` }}>
            <div style={{ fontFamily: FONTS.display, fontSize: 18, color: COLORS.ink, fontStyle: 'italic' }}>{p.title}</div>
            <div style={{ fontFamily: FONTS.body, fontSize: 13, color: COLORS.mute, marginTop: 4 }}>
              {p.weeks} weeks · {p.days_per_week}x/week · {p.level}
            </div>
            <div style={{ fontFamily: FONTS.body, fontSize: 13, color: COLORS.ink, marginTop: 8, lineHeight: 1.5 }}>
              {p.description}
            </div>
            <button
              onClick={() => enroll(p.id)}
              disabled={enrollingId === p.id}
              style={{
                marginTop: 14,
                fontFamily: FONTS.body,
                fontSize: 13,
                fontWeight: 500,
                color: COLORS.bg,
                background: COLORS.ink,
                border: 'none',
                padding: '10px 18px',
                borderRadius: 999,
                cursor: 'pointer',
              }}
            >
              {enrollingId === p.id ? 'Starting…' : 'Start this program'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
