import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { COLORS, FONTS } from '../../../brand/tokens';
import SubHeader from '../../../components/SubHeader';
import { VERSES, VERSE_GROUP, versesFor } from '../../../lib/mind';

// Pick a feeling, read what God says.
export default function MindVerses() {
  const [params] = useSearchParams();
  const start = params.get('feeling');
  const [feeling, setFeeling] = useState(start ? (VERSES[start] ? start : VERSE_GROUP[start] || 'Anxious') : 'Anxious');
  return (
    <>
      <SubHeader title="Scripture for how I feel" />
      <div style={{ padding: '4px 16px 48px' }}>
        <h1 style={{ margin: 0, fontFamily: FONTS.display, fontSize: 30, fontWeight: 500, color: COLORS.ink }}>When I feel…</h1>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 14 }}>
          {Object.keys(VERSES).map((f) => (
            <button key={f} onClick={() => setFeeling(f)} aria-pressed={feeling === f}
              style={{ padding: '8px 14px', borderRadius: 999, cursor: 'pointer', border: `1px solid ${feeling === f ? COLORS.ink : COLORS.line}`, background: feeling === f ? COLORS.ink : 'transparent', color: feeling === f ? COLORS.bg : COLORS.ink, fontFamily: FONTS.body, fontSize: 14, fontWeight: 600 }}>
              {f}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 20 }}>
          {versesFor(feeling).map(([text, ref]) => (
            <figure key={ref} style={{ margin: 0, padding: '18px', borderRadius: 18, background: COLORS.surface, border: `1px solid ${COLORS.line}` }}>
              <blockquote style={{ margin: 0, fontFamily: FONTS.display, fontSize: 20, lineHeight: 1.45, color: COLORS.ink }}>{text}</blockquote>
              <figcaption style={{ marginTop: 8, fontFamily: FONTS.body, fontSize: 13, fontWeight: 600, color: COLORS.mute }}>{ref}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </>
  );
}
