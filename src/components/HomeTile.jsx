import { Link } from 'react-router-dom';
import { COLORS, FONTS, toneColor } from '../brand/tokens';
import Sprig from './Sprig';

// Large photo card with the title over the bottom of the image. Until a photo
// is added, it shows a solid block in one of the edition's colors with a
// faint sprig, so the page still looks finished.
export default function HomeTile({ title, sub, to, image, tone = 'ink', height = 210 }) {
  const base = toneColor(tone);
  return (
    <Link
      to={to}
      style={{
        position: 'relative',
        display: 'block',
        height,
        borderRadius: 22,
        overflow: 'hidden',
        background: base,
        textDecoration: 'none',
      }}
    >
      {image ? (
        <img src={image} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        <div style={{ position: 'absolute', right: -18, top: -10, opacity: 0.18, color: '#fff' }}>
          <Sprig size={height + 40} color="#fff" />
        </div>
      )}
      {/* Darkens the bottom so white text stays readable over a photo */}
      {image && <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.15) 45%, rgba(0,0,0,0) 70%)',
        }}
      />}
      <div style={{ position: 'absolute', left: 22, right: 22, bottom: 20 }}>
        <div style={{ fontFamily: FONTS.display, fontSize: 34, lineHeight: 1, color: '#fff', fontWeight: 500 }}>
          {title}
        </div>
        {sub && (
          <div style={{ fontFamily: FONTS.body, fontSize: 13, color: 'rgba(255,255,255,0.9)', marginTop: 8, letterSpacing: '0.02em' }}>
            {sub}
          </div>
        )}
      </div>
    </Link>
  );
}
