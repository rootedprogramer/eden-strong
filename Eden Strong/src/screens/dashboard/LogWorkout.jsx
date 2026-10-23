import { useState } from 'react';
import { COLORS, FONTS } from '../../brand/tokens';
import { supabase } from '../../lib/supabaseClient';

export default function LogWorkout() {
  const [note, setNote] = useState('');
  const [feeling, setFeeling] = useState(null);
  const [saved, setSaved] = useState(false);

  const feelings = ['Strong', 'Steady', 'Tired', 'Pushed through'];

  const handleSave = async () => {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    if (!userId) return;

    await supabase.from('workout_logs').insert({
      user_id: userId,
      note,
      feeling,
      logged_at: new Date().toISOString(),
    });

    // Advance the user's active program by one day.
    const { data: enrollment } = await supabase
      .from('program_enrollments')
      .select('id, current_day')
      .eq('user_id', userId)
      .eq('active', true)
      .maybeSingle();
    if (enrollment) {
      await supabase
        .from('program_enrollments')
        .update({ current_day: enrollment.current_day + 1 })
        .eq('id', enrollment.id);
    }

    setSaved(true);
  };

  if (saved) {
    return (
      <div style={{ padding: '24px 24px', textAlign: 'center' }}>
        <div style={{ fontFamily: FONTS.display, fontSize: 24, color: COLORS.ink, fontStyle: 'italic' }}>
          Logged. Well done.
        </div>
        <div style={{ fontFamily: FONTS.body, fontSize: 13, color: COLORS.mute, marginTop: 8 }}>
          Tomorrow's day is ready when you are.
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px 24px 24px' }}>
      <div style={{ fontFamily: FONTS.display, fontSize: 26, color: COLORS.ink, fontStyle: 'italic' }}>
        How did it go?
      </div>

      <div style={{ marginTop: 20, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {feelings.map((f) => (
          <button
            key={f}
            onClick={() => setFeeling(f)}
            style={{
              padding: '10px 16px',
              borderRadius: 999,
              border: `1.5px solid ${feeling === f ? COLORS.gold : COLORS.line}`,
              background: feeling === f ? `${COLORS.gold}1a` : '#fff',
              fontFamily: FONTS.body,
              fontSize: 13,
              color: COLORS.ink,
              cursor: 'pointer',
            }}
          >
            {f}
          </button>
        ))}
      </div>

      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Anything worth remembering about today?"
        rows={4}
        style={{
          marginTop: 20,
          width: '100%',
          fontFamily: FONTS.body,
          fontSize: 14,
          padding: 14,
          borderRadius: 12,
          border: `1px solid ${COLORS.line}`,
          resize: 'none',
          boxSizing: 'border-box',
        }}
      />

      <button
        onClick={handleSave}
        style={{
          marginTop: 16,
          fontFamily: FONTS.body,
          fontSize: 14,
          fontWeight: 500,
          color: COLORS.bg,
          background: COLORS.ink,
          border: 'none',
          padding: '12px 20px',
          borderRadius: 999,
          cursor: 'pointer',
        }}
      >
        Save entry
      </button>
    </div>
  );
}
