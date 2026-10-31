import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FONTS, TAGLINE, EDITION_LIST, rememberEdition } from '../brand/tokens';
import { useTheme } from '../theme/ThemeContext';
import Monogram from '../components/Monogram';

// The shared front door for all three brands. Uses fixed brand-family colors
// (ivory, obsidian) rather than any one brand's theme.
const IVORY = '#F5F0E8';
const LINEN = '#D8CFC0';
const OBSIDIAN = '#171817';
const MUTE = '#6F6A63';

export default function Landing() {
  const navigate = useNavigate();
  const { setPath } = useTheme();

  useEffect(() => {
    setPath('women');
    document.title = 'Eden Strong, Faith Over Flesh, One Accord';
    document.body.style.background = IVORY;
  }, []);

  const choose = (id) => {
    rememberEdition(id);
    navigate(`/signup?edition=${id}`);
  };

  return (
    <div style={{ minHeight: '100vh', background: IVORY, color: OBSIDIAN }}>
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '56px 22px 40px', display: 'flex', flexDirection: 'column', minHeight: '100vh', boxSizing: 'border-box' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: FONTS.brand, fontSize: 12, letterSpacing: '0.32em', textTransform: 'uppercase', color: MUTE }}>The brand family</div>
          <div aria-hidden="true" style={{ fontFamily: FONTS.brand, fontSize: 30, lineHeight: 1, margin: '18px 0 6px' }}>✝</div>
          <h1 style={{ margin: 0, fontFamily: FONTS.brand, fontWeight: 500, fontSize: 30, letterSpacing: '0.12em', lineHeight: 1.25 }}>
            Faith. Fitness.
            <br />
            Purpose.
          </h1>
          <p style={{ fontFamily: FONTS.body, fontSize: 14, color: MUTE, lineHeight: 1.6, margin: '14px auto 0', maxWidth: 320 }}>{TAGLINE}</p>
        </div>

        <div style={{ fontFamily: FONTS.brand, fontSize: 13, letterSpacing: '0.24em', textTransform: 'uppercase', textAlign: 'center', marginTop: 34 }}>
          Choose your community
        </div>
        <div style={{ height: 1, background: LINEN, margin: '12px 40px 0' }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 18 }}>
          {EDITION_LIST.map((ed) => (
            <button
              key={ed.id}
              onClick={() => choose(ed.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 18,
                padding: '20px 20px',
                borderRadius: 18,
                border: 'none',
                background: ed.card.bg,
                color: ed.card.ink,
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <Monogram letters={ed.monogram} size={58} />
              <span style={{ flex: 1 }}>
                <span style={{ display: 'block', fontFamily: FONTS.brand, fontSize: 19, fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', lineHeight: 1.2 }}>
                  {ed.name}
                </span>
                <span style={{ display: 'block', fontFamily: FONTS.brand, fontSize: 11, letterSpacing: '0.26em', textTransform: 'uppercase', opacity: 0.85, marginTop: 5 }}>
                  {ed.short}
                </span>
                <span style={{ display: 'block', fontFamily: FONTS.body, fontSize: 13, opacity: 0.9, marginTop: 8, lineHeight: 1.4 }}>{ed.pitch}</span>
              </span>
            </button>
          ))}
        </div>

        <div style={{ fontFamily: FONTS.script, fontSize: 30, textAlign: 'center', marginTop: 26, color: OBSIDIAN }}>
          Different paths. Same purpose.
        </div>

        <div style={{ flex: 1 }} />
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <div style={{ fontFamily: FONTS.body, fontSize: 13, color: MUTE }}>Founding members, $10 a month</div>
          <Link to="/signin" style={{ display: 'inline-block', marginTop: 8, padding: 10, fontFamily: FONTS.body, fontSize: 14, fontWeight: 600, color: OBSIDIAN }}>
            Already a member? Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
