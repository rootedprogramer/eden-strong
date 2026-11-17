import { useEffect, useState } from 'react';
import { Link, Navigate, useOutletContext } from 'react-router-dom';
import { Check, ChevronRight, Leaf, Sparkles, Droplets, Flower2, Moon, Settings2 } from 'lucide-react';
import { COLORS, FONTS, tint, toneColor } from '../../../brand/tokens';
import SubHeader from '../../../components/SubHeader';
import {
  GLOW_CATEGORIES, HAIR_TYPES, SKIN_TYPES, SLOTS,
  createStarterRoutine, isDone, loadGlowHome, toggleCheck,
} from '../../../lib/glow';

const ICONS = { skin: Sparkles, hair: Leaf, body: Droplets, selfcare: Moon };

// Glow Up home: today's routine checklist and the four areas to explore.
export default function Glow() {
  const { edition } = useOutletContext() || {};
  const [data, setData] = useState(undefined);
  const [slot, setSlot] = useState(() => (new Date().getHours() < 15 ? 'am' : 'pm'));

  useEffect(() => { loadGlowHome().then(setData); }, []);

  if (edition && edition.id !== 'women') return <Navigate to="/dashboard" replace />;

  const steps = data?.steps || [];
  const hasRoutine = steps.length > 0;
  const shown = steps.filter((s) => s.slot === slot);
  const doneCount = shown.filter((s) => isDone(s, data.checks)).length;

  const toggle = async (step) => {
    const checks = await toggleCheck(step, data.checks);
    setData((d) => ({ ...d, checks }));
  };

  return (
    <>
      <SubHeader title="Glow Up" />
      <div style={{ padding: '4px 16px 48px' }}>
        <h1 style={{ margin: 0, fontFamily: FONTS.display, fontSize: 34, fontWeight: 500, color: COLORS.ink, lineHeight: 1.1 }}>Glow Up</h1>
        <p style={{ margin: '6px 0 0', fontFamily: FONTS.body, fontSize: 15, color: COLORS.mute, lineHeight: 1.5 }}>
          Natural care for your skin, hair, and body, and rest for your soul.
        </p>

        <figure style={{ margin: '18px 0 0', padding: '16px 18px', borderRadius: 18, background: tint(COLORS.rose, 20) }}>
          <blockquote style={{ margin: 0, fontFamily: FONTS.display, fontSize: 19, lineHeight: 1.4, color: COLORS.ink }}>
            But let it be the hidden man of the heart… even the ornament of a meek and quiet spirit, which is in the sight of God of great price.
          </blockquote>
          <figcaption style={{ marginTop: 8, fontFamily: FONTS.body, fontSize: 13, fontWeight: 600, color: COLORS.mute }}>1 Peter 3:4</figcaption>
        </figure>

        {data === undefined ? null : !hasRoutine ? (
          <Setup onDone={() => loadGlowHome().then(setData)} />
        ) : (
          <section style={{ marginTop: 22, padding: 18, borderRadius: 22, background: COLORS.surface, border: `1px solid ${COLORS.line}` }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ margin: 0, fontFamily: FONTS.display, fontSize: 24, fontWeight: 500, color: COLORS.ink }}>My routine</h2>
              <Link to="/dashboard/glow/routine" style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: FONTS.body, fontSize: 13, fontWeight: 600, color: COLORS.mute, textDecoration: 'none' }}>
                <Settings2 size={15} /> Edit
              </Link>
            </div>
            <div role="tablist" style={{ display: 'flex', gap: 6, marginTop: 12 }}>
              {SLOTS.map((s) => (
                <button
                  key={s.id}
                  role="tab"
                  aria-selected={slot === s.id}
                  onClick={() => setSlot(s.id)}
                  style={{ flex: 1, padding: '9px 0', borderRadius: 12, cursor: 'pointer', border: `1px solid ${slot === s.id ? COLORS.ink : COLORS.line}`, background: slot === s.id ? COLORS.ink : 'transparent', color: slot === s.id ? COLORS.bg : COLORS.ink, fontFamily: FONTS.body, fontSize: 14, fontWeight: 600 }}
                >
                  {s.label}
                </button>
              ))}
            </div>
            <div style={{ marginTop: 12, fontFamily: FONTS.body, fontSize: 13, color: COLORS.mute }}>
              {shown.length ? `${doneCount} of ${shown.length} done${slot === 'weekly' ? ' this week' : ' today'}` : 'Nothing here yet. Add steps from any guide or recipe.'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
              {shown.map((s) => {
                const done = isDone(s, data.checks);
                return (
                  <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 4px' }}>
                    <button
                      onClick={() => toggle(s)}
                      aria-label={done ? `Mark ${s.title} not done` : `Mark ${s.title} done`}
                      style={{ width: 30, height: 30, flexShrink: 0, borderRadius: '50%', border: `2px solid ${done ? COLORS.gold : COLORS.ink}`, background: done ? COLORS.gold : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0 }}
                    >
                      {done && <Check size={16} color="#fff" strokeWidth={3} />}
                    </button>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ display: 'block', fontFamily: FONTS.body, fontSize: 15, fontWeight: 600, color: COLORS.ink, textDecoration: done ? 'line-through' : 'none', opacity: done ? 0.6 : 1 }}>{s.title}</span>
                      {s.note && <span style={{ display: 'block', fontFamily: FONTS.body, fontSize: 13, color: COLORS.mute, marginTop: 2 }}>{s.note}</span>}
                    </span>
                    {s.glow_items?.slug && (
                      <Link to={`/dashboard/glow/item/${s.glow_items.slug}`} aria-label={`How to: ${s.title}`} style={{ color: COLORS.mute, display: 'flex' }}>
                        <ChevronRight size={20} />
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        <h2 style={{ margin: '28px 2px 0', fontFamily: FONTS.display, fontSize: 24, fontWeight: 500, color: COLORS.ink }}>Explore</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
          {GLOW_CATEGORIES.map((c) => {
            const Icon = ICONS[c.id];
            return (
              <Link key={c.id} to={`/dashboard/glow/${c.id}`} style={{ minHeight: 132, padding: 16, borderRadius: 20, background: toneColor(c.tone), textDecoration: 'none', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <Icon size={26} color="#fff" strokeWidth={1.6} aria-hidden="true" />
                <span>
                  <span style={{ display: 'block', fontFamily: FONTS.display, fontSize: 22, color: '#fff', lineHeight: 1.1 }}>{c.title}</span>
                  <span style={{ display: 'block', fontFamily: FONTS.body, fontSize: 12, color: 'rgba(255,255,255,0.88)', marginTop: 4, lineHeight: 1.35 }}>{c.sub}</span>
                </span>
              </Link>
            );
          })}
        </div>
        <Link to="/dashboard/glow/recipes" style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12, padding: '16px 18px', borderRadius: 20, background: COLORS.surface, border: `1px solid ${COLORS.line}`, textDecoration: 'none' }}>
          <Flower2 size={24} color={COLORS.gold} strokeWidth={1.6} aria-hidden="true" />
          <span style={{ flex: 1 }}>
            <span style={{ display: 'block', fontFamily: FONTS.display, fontSize: 20, color: COLORS.ink }}>Natural recipes</span>
            <span style={{ display: 'block', fontFamily: FONTS.body, fontSize: 13, color: COLORS.mute, marginTop: 2 }}>Masks, rinses, scrubs, and oils from your kitchen</span>
          </span>
          <ChevronRight size={20} color={COLORS.ink} />
        </Link>
      </div>
    </>
  );
}

// First visit: pick skin and hair type, then create a starter routine.
function Setup({ onDone }) {
  const [skin, setSkin] = useState('');
  const [hair, setHair] = useState('');
  const [busy, setBusy] = useState(false);
  const go = async () => {
    setBusy(true);
    await createStarterRoutine(skin || null, hair || null);
    onDone();
  };
  return (
    <section style={{ marginTop: 22, padding: 18, borderRadius: 22, background: COLORS.surface, border: `1px solid ${COLORS.line}` }}>
      <h2 style={{ margin: 0, fontFamily: FONTS.display, fontSize: 24, fontWeight: 500, color: COLORS.ink }}>Build my routine</h2>
      <p style={{ margin: '6px 0 0', fontFamily: FONTS.body, fontSize: 14, color: COLORS.mute, lineHeight: 1.5 }}>
        Tell us a little about your skin and hair and we’ll start you with a simple morning, evening, and weekly routine. You can change any of it.
      </p>
      <Chips label="My skin is" options={SKIN_TYPES} value={skin} onChange={setSkin} />
      <Link to="/dashboard/glow/item/know-your-skin" style={{ display: 'inline-block', marginTop: 6, fontFamily: FONTS.body, fontSize: 13, color: COLORS.gold }}>Not sure? Find your skin type</Link>
      <Chips label="My hair is" options={HAIR_TYPES} value={hair} onChange={setHair} />
      <button onClick={go} disabled={busy} style={{ marginTop: 18, width: '100%', padding: '15px 0', borderRadius: 999, border: 'none', background: COLORS.deep, color: '#fff', fontFamily: FONTS.body, fontSize: 16, fontWeight: 600, cursor: 'pointer' }}>
        {busy ? 'Setting up…' : 'Create my routine'}
      </button>
    </section>
  );
}

export function Chips({ label, options, value, onChange }) {
  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ fontFamily: FONTS.body, fontSize: 13, fontWeight: 600, color: COLORS.mute, marginBottom: 8 }}>{label}</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {options.map(([id, text]) => (
          <button
            key={id}
            onClick={() => onChange(value === id ? '' : id)}
            aria-pressed={value === id}
            style={{ padding: '8px 14px', borderRadius: 999, cursor: 'pointer', border: `1px solid ${value === id ? COLORS.ink : COLORS.line}`, background: value === id ? COLORS.ink : 'transparent', color: value === id ? COLORS.bg : COLORS.ink, fontFamily: FONTS.body, fontSize: 14, fontWeight: 600 }}
          >
            {text}
          </button>
        ))}
      </div>
    </div>
  );
}
