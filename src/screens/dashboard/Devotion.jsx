import { useEffect, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { ChevronDown, Dumbbell, Check } from 'lucide-react';
import { COLORS, FONTS, tint } from '../../brand/tokens';
import { MORNING_PRAYER, CONFESSIONS, DECLARATIONS } from '../../brand/morningRoutine';
import { BrandMark } from '../../components/BrandArt';
import { loadDevotion } from '../../lib/devotions';
import { supabase } from '../../lib/supabaseClient';

export default function Devotion() {
  const { edition } = useOutletContext() || {};
  const [state, setState] = useState(null); // { devotion, currentDay, totalDays }
  const [uid, setUid] = useState(null);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;
      if (!userId) return setState({ devotion: null });
      setUid(userId);
      setState(await loadDevotion(userId, edition?.id));
    })();
  }, [edition?.id]);

  const markComplete = async () => {
    if (!uid || !state?.devotion) return;
    await supabase.from('devotion_progress').upsert(
      { user_id: uid, current_day: state.devotion.day_number + 1, last_completed_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    );
    setCompleted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!state) return <div style={{ padding: 24, fontFamily: FONTS.body, fontSize: 13, color: COLORS.mute }}>Loading…</div>;

  const d = state.devotion;
  // The morning routine is part of Eden Strong
  const showRoutine = edition?.id === 'women';

  return (
    <div style={{ padding: '24px 20px 40px' }}>
      {completed && (
        <div style={{ textAlign: 'center', padding: '8px 0 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'center' }}><BrandMark kind="small" size={36} color={COLORS.gold} /></div>
          <div style={{ fontFamily: FONTS.display, fontSize: 28, color: COLORS.ink, fontStyle: 'italic', marginTop: 12 }}>Well spent time.</div>
          <div style={{ fontFamily: FONTS.body, fontSize: 14, color: COLORS.mute, marginTop: 6 }}>Come back tomorrow for the next day.</div>
          <Link to="/dashboard" style={{ display: 'inline-block', marginTop: 14, fontFamily: FONTS.body, fontSize: 14, fontWeight: 600, color: COLORS.gold }}>Back to home</Link>
        </div>
      )}

      {!completed && !d && (
        <div>
          <div style={{ fontFamily: FONTS.display, fontSize: 24, color: COLORS.ink, fontStyle: 'italic' }}>No devotion available yet</div>
          <div style={{ fontFamily: FONTS.body, fontSize: 14, color: COLORS.mute, marginTop: 8, lineHeight: 1.5 }}>Today’s devotion will appear here once it’s added.</div>
        </div>
      )}

      {!completed && d && (
        <>
          <div style={{ fontFamily: FONTS.brand, fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: COLORS.mute }}>
            Day {d.day_number}{state.totalDays ? ` of ${state.totalDays}` : ''}{d.theme ? ` · ${d.theme}` : ''}
          </div>
          {d.title && (
            <h1 style={{ margin: '10px 0 0', fontFamily: FONTS.display, fontSize: 34, fontWeight: 500, color: COLORS.ink, lineHeight: 1.1 }}>{d.title}</h1>
          )}

          <div style={{ marginTop: 20, padding: '20px 20px', borderRadius: 18, background: COLORS.deep }}>
            <div style={{ fontFamily: FONTS.display, fontSize: 21, color: '#fff', fontStyle: 'italic', lineHeight: 1.45 }}>“{d.scripture_text}”</div>
            <div style={{ marginTop: 12, fontFamily: FONTS.brand, fontSize: 11, letterSpacing: '0.2em', color: COLORS.rose, textTransform: 'uppercase' }}>{d.scripture_ref}</div>
          </div>

          <p style={{ margin: '22px 0 0', fontFamily: FONTS.body, fontSize: 15, color: COLORS.ink, lineHeight: 1.75 }}>{d.reflection}</p>

          {d.declaration && (
            <div style={{ marginTop: 24, padding: '18px 18px', borderRadius: 16, background: tint(COLORS.gold, 16), borderLeft: `3px solid ${COLORS.gold}` }}>
              <div style={sectionLabel}>Declare it</div>
              <div style={{ fontFamily: FONTS.display, fontSize: 21, color: COLORS.ink, lineHeight: 1.35, marginTop: 6 }}>{d.declaration}</div>
              <div style={{ fontFamily: FONTS.body, fontSize: 12, color: COLORS.mute, marginTop: 8 }}>Say it out loud.</div>
            </div>
          )}

          {d.prayer && (
            <div style={{ marginTop: 22 }}>
              <div style={sectionLabel}>Pray</div>
              <div style={{ fontFamily: FONTS.display, fontSize: 19, color: COLORS.ink, fontStyle: 'italic', lineHeight: 1.45, marginTop: 6 }}>{d.prayer}</div>
            </div>
          )}

          {d.strength_step && (
            <div style={{ marginTop: 22, display: 'flex', gap: 12, padding: 16, borderRadius: 16, background: COLORS.surface, border: `1px solid ${COLORS.line}` }}>
              <Dumbbell size={20} color={COLORS.gold} style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <div style={sectionLabel}>Strength step</div>
                <div style={{ fontFamily: FONTS.body, fontSize: 14, color: COLORS.ink, lineHeight: 1.55, marginTop: 4 }}>{d.strength_step}</div>
              </div>
            </div>
          )}

          {d.prompt && (
            <div style={{ marginTop: 14, padding: 16, borderRadius: 16, background: COLORS.surface, border: `1px solid ${COLORS.line}` }}>
              <div style={sectionLabel}>Reflect</div>
              <div style={{ fontFamily: FONTS.display, fontSize: 18, color: COLORS.ink, fontStyle: 'italic', marginTop: 6, lineHeight: 1.4 }}>{d.prompt}</div>
            </div>
          )}

          <button onClick={markComplete} style={{ marginTop: 26, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: FONTS.body, fontSize: 15, fontWeight: 600, color: COLORS.bg, background: COLORS.ink, border: 'none', padding: 15, borderRadius: 999, cursor: 'pointer' }}>
            <Check size={18} /> Mark today complete
          </button>
        </>
      )}

      {showRoutine && <MorningRoutine />}
    </div>
  );
}

// The full morning routine: prayer, confessions, and declarations
function MorningRoutine() {
  return (
    <div style={{ marginTop: 36 }}>
      <div style={{ fontFamily: FONTS.script, fontSize: 32, color: COLORS.gold, lineHeight: 1 }}>My morning routine</div>
      <div style={{ fontFamily: FONTS.body, fontSize: 13, color: COLORS.mute, marginTop: 6, lineHeight: 1.5 }}>
        Pray it, speak it, believe it. Start every day here.
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 14 }}>
        <Section title={MORNING_PRAYER.title} sub={MORNING_PRAYER.source}>
          {MORNING_PRAYER.paragraphs.map((p, i) => (
            <p key={i} style={{ margin: i ? '14px 0 0' : 0, fontFamily: FONTS.display, fontSize: 18, color: COLORS.ink, lineHeight: 1.6 }}>{p}</p>
          ))}
        </Section>

        <Section title={CONFESSIONS.title} sub={`${CONFESSIONS.items.length} promises from the Word`}>
          <p style={{ margin: 0, fontFamily: FONTS.body, fontSize: 13, color: COLORS.mute, lineHeight: 1.5 }}>{CONFESSIONS.intro}</p>
          {CONFESSIONS.items.map(([ref, text]) => (
            <div key={ref} style={{ marginTop: 14 }}>
              <div style={{ fontFamily: FONTS.brand, fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: COLORS.gold }}>{ref}</div>
              <div style={{ fontFamily: FONTS.body, fontSize: 14, color: COLORS.ink, lineHeight: 1.6, marginTop: 4 }}>{text}</div>
            </div>
          ))}
        </Section>

        <Section title={DECLARATIONS.title} sub="Seven declarations to speak over your day" defaultOpen>
          {DECLARATIONS.items.map(([decl, verse, ref], i) => (
            <div key={ref} style={{ display: 'flex', gap: 12, marginTop: i ? 16 : 0 }}>
              <span style={{ width: 24, height: 24, borderRadius: '50%', background: COLORS.gold, color: COLORS.deep, fontFamily: FONTS.body, fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{i + 1}</span>
              <span>
                <span style={{ display: 'block', fontFamily: FONTS.body, fontSize: 15, fontWeight: 600, color: COLORS.ink, lineHeight: 1.45 }}>{decl}</span>
                <span style={{ display: 'block', fontFamily: FONTS.display, fontSize: 16, fontStyle: 'italic', color: COLORS.mute, lineHeight: 1.45, marginTop: 4 }}>“{verse}” {ref}</span>
              </span>
            </div>
          ))}
          <div style={{ fontFamily: FONTS.script, fontSize: 28, color: COLORS.gold, textAlign: 'center', marginTop: 18 }}>{DECLARATIONS.closing}</div>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, sub, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ borderRadius: 16, background: COLORS.surface, border: `1px solid ${COLORS.line}`, overflow: 'hidden' }}>
      <button onClick={() => setOpen(!open)} aria-expanded={open} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '16px 16px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer' }}>
        <span style={{ flex: 1 }}>
          <span style={{ display: 'block', fontFamily: FONTS.display, fontSize: 21, color: COLORS.ink }}>{title}</span>
          {sub && <span style={{ display: 'block', fontFamily: FONTS.body, fontSize: 12, color: COLORS.mute, marginTop: 2 }}>{sub}</span>}
        </span>
        <ChevronDown size={20} color={COLORS.ink} style={{ transform: open ? 'rotate(180deg)' : 'none' }} />
      </button>
      {open && <div style={{ padding: '0 16px 18px' }}>{children}</div>}
    </div>
  );
}

const sectionLabel = { fontFamily: FONTS.brand, fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: COLORS.gold };
