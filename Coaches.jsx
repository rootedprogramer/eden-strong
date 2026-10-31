import { COLORS, FONTS, toneColor } from '../../brand/tokens';
import Sprig from '../../components/Sprig';
import { BrandMark } from '../../components/BrandArt';

// Edit the names, roles, and bios below. Add a photo by putting the image in
// /public/coaches/ and setting photo to its path, e.g. '/coaches/lex.jpg'.
const COACHES = [
  { name: 'Lex', role: 'Founder and coach', bio: 'Write a few sentences about yourself here.', photo: null, tone: 'olive' },
  { name: 'John', role: 'Coach', bio: 'Write a few sentences about John here.', photo: null, tone: 'ink' },
];

export default function Coaches() {
  return (
    <div style={{ padding: '20px 18px 32px' }}>
      <div style={{ fontFamily: FONTS.display, fontSize: 30, fontWeight: 500, color: COLORS.ink }}>Meet your coaches</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 18 }}>
        {COACHES.map((c) => (
          <div key={c.name} style={{ borderRadius: 20, overflow: 'hidden', background: COLORS.surface, border: `1px solid ${COLORS.line}` }}>
            <div style={{ height: 200, background: toneColor(c.tone), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {c.photo ? (
                <img src={c.photo} alt={c.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <BrandMark kind="feature" size={56} color="#fff" />
              )}
            </div>
            <div style={{ padding: '16px 18px 20px' }}>
              <div style={{ fontFamily: FONTS.display, fontSize: 26, color: COLORS.ink }}>{c.name}</div>
              <div style={{ fontFamily: FONTS.body, fontSize: 13, color: COLORS.mute, marginTop: 2 }}>{c.role}</div>
              <div style={{ fontFamily: FONTS.body, fontSize: 14, color: COLORS.ink, marginTop: 10, lineHeight: 1.6 }}>{c.bio}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
