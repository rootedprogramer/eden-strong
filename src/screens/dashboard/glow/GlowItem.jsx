import { useEffect, useState } from 'react';
import { Link, Navigate, useOutletContext, useParams } from 'react-router-dom';
import { AlertTriangle, Check, Clock, Lightbulb, Plus, Repeat } from 'lucide-react';
import { COLORS, FONTS, tint } from '../../../brand/tokens';
import SubHeader from '../../../components/SubHeader';
import Sheet from '../../../components/Sheet';
import { SLOTS, addStep, categoryOf, lines, loadItem } from '../../../lib/glow';

// One guide or recipe, with "Add to my routine".
export default function GlowItem() {
  const { edition } = useOutletContext() || {};
  const { slug } = useParams();
  const [item, setItem] = useState(undefined);
  const [picking, setPicking] = useState(false);
  const [added, setAdded] = useState(null);

  useEffect(() => { loadItem(slug).then(setItem); }, [slug]);

  if (edition && edition.id !== 'women') return <Navigate to="/dashboard" replace />;
  if (item === undefined) return <SubHeader title="Glow Up" />;
  if (!item) return <><SubHeader title="Glow Up" /><p style={{ padding: '0 18px', fontFamily: FONTS.body, color: COLORS.mute }}>This wasn’t found. <Link to="/dashboard/glow" style={{ color: COLORS.gold }}>Back to Glow Up</Link></p></>;

  const need = lines(item.need);
  const steps = lines(item.steps);
  const add = async (slot) => {
    await addStep(slot, item.title, item.id);
    setPicking(false);
    setAdded(SLOTS.find((s) => s.id === slot)?.label);
  };

  return (
    <>
      <SubHeader title={categoryOf(item.category)?.title || 'Glow Up'} />
      <div style={{ padding: '4px 18px 48px' }}>
        <div style={{ fontFamily: FONTS.body, fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: COLORS.gold }}>
          {item.kind === 'recipe' ? 'Natural recipe' : 'Guide'}
        </div>
        <h1 style={{ margin: '6px 0 0', fontFamily: FONTS.display, fontSize: 32, fontWeight: 500, color: COLORS.ink, lineHeight: 1.1 }}>{item.title}</h1>
        {item.summary && <p style={{ margin: '8px 0 0', fontFamily: FONTS.body, fontSize: 15, color: COLORS.mute, lineHeight: 1.55 }}>{item.summary}</p>}

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 14 }}>
          {item.time_label && <Chip icon={<Clock size={14} />}>{item.time_label}</Chip>}
          {item.how_often && <Chip icon={<Repeat size={14} />}>{item.how_often}</Chip>}
        </div>

        {added ? (
          <div role="status" style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 8, padding: '12px 14px', borderRadius: 14, background: tint(COLORS.olive, 18), fontFamily: FONTS.body, fontSize: 14, color: COLORS.ink }}>
            <Check size={16} /> Added to your {added.toLowerCase()} routine. <Link to="/dashboard/glow" style={{ color: COLORS.gold, fontWeight: 600 }}>See routine</Link>
          </div>
        ) : (
          <button onClick={() => setPicking(true)} style={{ marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: '14px 0', borderRadius: 999, border: 'none', background: COLORS.deep, color: '#fff', fontFamily: FONTS.body, fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
            <Plus size={18} /> Add to my routine
          </button>
        )}

        {item.verse && (
          <figure style={{ margin: '22px 0 0', paddingLeft: 14, borderLeft: `2px solid ${COLORS.gold}` }}>
            <blockquote style={{ margin: 0, fontFamily: FONTS.display, fontSize: 18, lineHeight: 1.45, color: COLORS.ink }}>{item.verse}</blockquote>
            {item.verse_ref && <figcaption style={{ marginTop: 6, fontFamily: FONTS.body, fontSize: 13, fontWeight: 600, color: COLORS.mute }}>{item.verse_ref}</figcaption>}
          </figure>
        )}

        {need.length > 0 && (
          <>
            <h2 style={h2}>{item.kind === 'recipe' ? 'Ingredients' : 'What you need'}</h2>
            <ul style={{ margin: '10px 0 0', paddingLeft: 20, fontFamily: FONTS.body, fontSize: 16, color: COLORS.ink, lineHeight: 1.7 }}>
              {need.map((n, i) => <li key={i}>{n}</li>)}
            </ul>
          </>
        )}

        {steps.length > 0 && (
          <>
            <h2 style={h2}>{item.kind === 'recipe' ? 'How to make and use it' : 'How to do it'}</h2>
            <ol style={{ margin: '10px 0 0', padding: 0, listStyle: 'none' }}>
              {steps.map((s, i) => (
                <li key={i} style={{ display: 'flex', gap: 12, padding: '8px 0', fontFamily: FONTS.body, fontSize: 16, color: COLORS.ink, lineHeight: 1.55 }}>
                  <span style={{ fontWeight: 700, color: COLORS.gold, minWidth: 20 }}>{i + 1}.</span>
                  <span>{s}</span>
                </li>
              ))}
            </ol>
          </>
        )}

        {item.tip && (
          <div style={{ marginTop: 18, display: 'flex', gap: 10, padding: '14px 16px', borderRadius: 16, background: tint(COLORS.sage, 24), fontFamily: FONTS.body, fontSize: 14, color: COLORS.ink, lineHeight: 1.55 }}>
            <Lightbulb size={18} style={{ flexShrink: 0, marginTop: 1 }} aria-hidden="true" />
            <span><strong>Tip: </strong>{item.tip}</span>
          </div>
        )}
        {item.caution && (
          <div style={{ marginTop: 12, display: 'flex', gap: 10, padding: '14px 16px', borderRadius: 16, background: tint(COLORS.rose, 22), fontFamily: FONTS.body, fontSize: 14, color: COLORS.ink, lineHeight: 1.55 }}>
            <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: 1 }} aria-hidden="true" />
            <span><strong>Good to know: </strong>{item.caution}</span>
          </div>
        )}
      </div>

      {picking && (
        <Sheet title="Add to my routine" onClose={() => setPicking(false)}>
          <p style={{ margin: '0 0 12px', fontFamily: FONTS.body, fontSize: 14, color: COLORS.mute }}>When do you want to do it?</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {SLOTS.map((s) => (
              <button key={s.id} onClick={() => add(s.id)} style={{ padding: '14px 16px', borderRadius: 14, cursor: 'pointer', textAlign: 'left', border: `1px solid ${s.id === item.slot ? COLORS.ink : COLORS.line}`, background: COLORS.surface, fontFamily: FONTS.body, fontSize: 15, fontWeight: 600, color: COLORS.ink }}>
                {s.id === 'weekly' ? 'Once a week' : `Every ${s.label.toLowerCase()}`}{s.id === item.slot ? ' (suggested)' : ''}
              </button>
            ))}
          </div>
        </Sheet>
      )}
    </>
  );
}

function Chip({ icon, children }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 999, background: COLORS.surface, border: `1px solid ${COLORS.line}`, fontFamily: FONTS.body, fontSize: 13, color: COLORS.ink }}>
      {icon}{children}
    </span>
  );
}

const h2 = { margin: '26px 0 0', fontFamily: FONTS.body, fontSize: 15, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: COLORS.ink };
