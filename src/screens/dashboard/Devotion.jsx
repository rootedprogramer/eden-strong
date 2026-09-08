import { useEffect, useState } from 'react';
import { COLORS, FONTS } from '../../brand/tokens';
import Sprig from '../../components/Sprig';
import { supabase } from '../../lib/supabaseClient';

export default function Devotion() {
  const [devotion, setDevotion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [showReflection, setShowReflection] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;
      if (!userId) {
        setLoading(false);
        return;
      }

      const { data: progress } = await supabase
        .from('devotion_progress')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      const currentDay = progress?.current_day || 1;

      const { data: today } = await supabase
        .from('daily_devotions')
        .select('*')
        .eq('day_number', currentDay)
        .maybeSingle();

      setDevotion(today);
      setLoading(false);
    })();
  }, []);

  const markComplete = async () => {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    if (!userId || !devotion) return;

    await supabase.from('devotion_progress').upsert({
      user_id: userId,
      current_day: devotion.day_number + 1,
      last_completed_at: new Date().toISOString(),
    });
    setCompleted(true);
  };

  if (loading) {
    return (
      <div style={{ padding: '48px 24px' }}>
        <div style={{ fontFamily: FONTS.body, fontSize: 13, color: COLORS.mute }}>Loading…</div>
      </div>
    );
  }

  if (completed) {
    return (
      <div style={{ padding: '48px 24px', textAlign: 'center' }}>
        <Sprig size={32} color={COLORS.gold} />
        <div style={{ fontFamily: FONTS.display, fontSize: 24, color: COLORS.ink, fontStyle: 'italic', marginTop: 16 }}>
          Well spent time.
        </div>
        <div style={{ fontFamily: FONTS.body, fontSize: 13, color: COLORS.mute, marginTop: 8 }}>
          Come back tomorrow for the next day.
        </div>
      </div>
    );
  }

  if (!devotion) {
    return (
      <div style={{ padding: '48px 24px' }}>
        <div style={{ fontFamily: FONTS.display, fontSize: 20, color: COLORS.ink, fontStyle: 'italic' }}>
          No devotion available yet
        </div>
        <div style={{ fontFamily: FONTS.body, fontSize: 13, color: COLORS.mute, marginTop: 8 }}>
          Add rows to `daily_devotions` in Supabase to populate this.
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '48px 24px 24px' }}>
      <div style={{ fontFamily: FONTS.body, fontSize: 12, letterSpacing: '0.14em', textTransform: 'uppercase', color: COLORS.mute }}>
        Day {devotion.day_number} · Devotion
      </div>

      <div style={{ marginTop: 16 }}>
        <Sprig size={28} color={COLORS.gold} />
      </div>

      <div style={{ fontFamily: FONTS.display, fontSize: 24, color: COLORS.ink, fontStyle: 'italic', lineHeight: 1.35, marginTop: 16 }}>
        "{devotion.scripture_text}"
      </div>
      <div style={{ marginTop: 10, fontFamily: FONTS.body, fontSize: 12, letterSpacing: '0.16em', color: COLORS.gold, textTransform: 'uppercase' }}>
        {devotion.scripture_ref}
      </div>

      <div style={{ marginTop: 28, fontFamily: FONTS.body, fontSize: 14, color: COLORS.ink, lineHeight: 1.7 }}>
        {devotion.reflection}
      </div>

      {devotion.prompt && (
        <div style={{ marginTop: 24, padding: 16, borderRadius: 14, background: '#fff', border: `1px solid ${COLORS.line}` }}>
          <div style={{ fontFamily: FONTS.body, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: COLORS.mute }}>
            Reflect
          </div>
          <div style={{ fontFamily: FONTS.display, fontSize: 16, color: COLORS.ink, fontStyle: 'italic', marginTop: 8, lineHeight: 1.4 }}>
            {devotion.prompt}
          </div>
        </div>
      )}

      <button
        onClick={markComplete}
        style={{
          marginTop: 28,
          width: '100%',
          fontFamily: FONTS.body,
          fontSize: 14,
          fontWeight: 500,
          color: COLORS.bg,
          background: COLORS.ink,
          border: 'none',
          padding: '14px',
          borderRadius: 999,
          cursor: 'pointer',
        }}
      >
        Mark today complete
      </button>
    </div>
  );
}
