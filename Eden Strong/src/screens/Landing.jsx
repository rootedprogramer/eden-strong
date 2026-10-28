import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../theme/ThemeContext';
import { COLORS, FONTS, TAGLINE, EDITION_LIST, rememberEdition } from '../brand/tokens';
import { PATHS as EDITION_COLORS } from '../theme/theme';
import Sprig from '../components/Sprig';

export default function Landing() {
  const navigate = useNavigate();
  const { setPath } = useTheme();
  // Before anyone picks, show the neutral Together look.
  useEffect(() => { setPath('together'); }, []);

  const choose = (id) => {
    rememberEdition(id);
    navigate(`/signup?edition=${id}`);
  };

  return (
    <div style={{ minHeight: '100vh', background: COLORS.bg, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '60px 32px 48px', gap: 40 }}>
      <div>
        <Sprig size={44} color={COLORS.gold} />
        <div style={{ fontFamily: FONTS.display, fontSize: 56, lineHeight: 0.95, color: COLORS.ink, marginTop: 28, letterSpacing: '-0.02em' }}>
          Eden
          <br />
          <span style={{ fontStyle: 'italic', fontWeight: 300 }}>Strong</span>
        </div>
        <div style={{ marginTop: 18, fontFamily: FONTS.body, fontSize: 15, color: COLORS.mute, lineHeight: 1.5, maxWidth: 320 }}>
          {TAGLINE}
        </div>
      </div>

      <div>
        <div style={{ fontFamily: FONTS.display, fontSize: 22, color: COLORS.ink, fontStyle: 'italic', marginBottom: 14 }}>
          Choose your Eden Strong
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {EDITION_LIST.map((ed) => {
            const c = EDITION_COLORS[ed.id];
            return (
              <button
                key={ed.id}
                onClick={() => choose(ed.id)}
                style={{
                  textAlign: 'left',
                  padding: '18px 20px',
                  borderRadius: 16,
                  border: `1.5px solid ${c.primary}`,
                  background: c.canvas,
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                }}
              >
                <span style={{ fontFamily: FONTS.body, fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: c.primary, fontWeight: 600 }}>
                  Eden Strong
                </span>
                <span style={{ fontFamily: FONTS.display, fontSize: 26, color: COLORS.ink, fontStyle: 'italic', lineHeight: 1.1 }}>
                  {ed.short}
                </span>
                <span style={{ fontFamily: FONTS.body, fontSize: 13, color: COLORS.mute, lineHeight: 1.45 }}>
                  {ed.pitch}
                </span>
              </button>
            );
          })}
        </div>
        <div style={{ marginTop: 14, fontFamily: FONTS.body, fontSize: 13, color: COLORS.mute, textAlign: 'center' }}>
          Founding members — $10/mo
        </div>
        <Link
          to="/signin"
          style={{ display: 'block', textAlign: 'center', fontFamily: FONTS.body, fontSize: 14, color: COLORS.mute, padding: '10px', textDecoration: 'none' }}
        >
          Already a member? Sign in
        </Link>
      </div>
    </div>
  );
}
