import { Link } from 'react-router-dom';
import { COLORS, FONTS, TAGLINE } from '../brand/tokens';
import Sprig from '../components/Sprig';

export default function Landing() {
  return (
    <div style={{ minHeight: '100vh', background: COLORS.bg, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '60px 32px 48px' }}>
      <div>
        <Sprig size={44} color={COLORS.gold} />
        <div style={{ fontFamily: FONTS.display, fontSize: 56, lineHeight: 0.95, color: COLORS.ink, marginTop: 28, letterSpacing: '-0.02em' }}>
          Eden
          <br />
          <span style={{ fontStyle: 'italic', fontWeight: 300 }}>Strong</span>
        </div>
        <div style={{ marginTop: 18, fontFamily: FONTS.body, fontSize: 15, color: COLORS.mute, lineHeight: 1.5, maxWidth: 300 }}>
          {TAGLINE}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Link
          to="/signup"
          style={{
            textAlign: 'center',
            fontFamily: FONTS.body,
            fontSize: 15,
            fontWeight: 500,
            color: COLORS.bg,
            background: COLORS.ink,
            padding: '16px',
            borderRadius: 999,
            textDecoration: 'none',
          }}
        >
          Join as a founding member — $10/mo
        </Link>
        <Link
          to="/signin"
          style={{
            textAlign: 'center',
            fontFamily: FONTS.body,
            fontSize: 14,
            color: COLORS.mute,
            padding: '10px',
            textDecoration: 'none',
          }}
        >
          Already a member? Sign in
        </Link>
      </div>
    </div>
  );
}
