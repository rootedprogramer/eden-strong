import { useTheme } from '../theme/ThemeContext';
import Sprig from './Sprig';
import Monogram from './Monogram';

// Decorative artwork that changes with the brand.
//   kind="feature"  big feature cards (home tiles, devotion card, coaches)
//   kind="program"  program, split and week cards
//   kind="small"    small placeholders (recipe cards, thumbnails, icons)
//
// Eden Strong:      the leaf everywhere
// Faith Over Flesh: rugged cross (feature), mountains (program), F✝F (small)
// One Accord:       O✝A (feature, small), sunset mountains (program)

export function RuggedCross({ size = 100, color = 'currentColor' }) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden="true" style={{ display: 'block', color }}>
      {/* rough, hand-hewn edges like the Faith Over Flesh wallpaper */}
      <polygon
        fill="currentColor"
        points="47,3 50,1 53,4 52.5,12 54,13 53,24 52,29 60,29.5 69,28 76,29 79,31 77,35 70,36 61,35.5 53,36 53.5,47 52.5,58 54,70 53,84 54,93 51,99 48,97 46.5,88 47.5,74 46,61 47,48 46.5,37 38,36.5 29,37 22,36 20,32 24,29.5 33,30 46,29.5 47.5,22 46,13"
      />
      <polygon fill="currentColor" opacity="0.55" points="40,31 42,30 41,35 39,34" />
      <polygon fill="currentColor" opacity="0.55" points="60,33 63,32 62,34" />
    </svg>
  );
}

export function Mountains({ sun = false, color = 'currentColor' }) {
  return (
    <svg viewBox="0 0 200 100" width="100%" height="100%" preserveAspectRatio="none" aria-hidden="true" style={{ display: 'block', color }}>
      {sun && <circle cx="132" cy="54" r="15" fill="currentColor" opacity="0.55" />}
      <polygon fill="currentColor" opacity="0.55" points="0,100 0,72 22,58 40,66 62,44 82,60 100,50 118,62 140,40 162,56 182,46 200,58 200,100" />
      <polygon fill="currentColor" points="0,100 0,84 26,66 44,76 70,48 92,70 112,60 134,80 156,58 176,72 200,64 200,100" />
      <polygon fill="currentColor" opacity="0.35" points="70,48 76,56 71,54 66,58" />
      <polygon fill="currentColor" opacity="0.35" points="156,58 161,64 157,63 152,66" />
    </svg>
  );
}

// The right mark for the current brand, centered wherever you put it
export function BrandMark({ kind = 'small', size = 40, color = 'currentColor' }) {
  const { path } = useTheme();
  if (path === 'men') {
    if (kind === 'feature') return <RuggedCross size={size} color={color} />;
    return <Monogram letters={['F', 'F']} size={size} color={color} />;
  }
  if (path === 'together') return <Monogram letters={['O', 'A']} size={size} color={color} />;
  return <Sprig size={size} color={color} />;
}

// Background art for a card. Place inside a position: relative container.
export default function CardArt({ kind = 'feature', size = 200, opacity }) {
  const { path } = useTheme();
  if (kind === 'program' && path !== 'women') {
    return (
      <div aria-hidden="true" style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '62%', opacity: opacity ?? 0.2, color: '#fff', pointerEvents: 'none' }}>
        <Mountains sun={path === 'together'} />
      </div>
    );
  }
  const markKind = kind === 'program' ? 'feature' : kind;
  return (
    <div aria-hidden="true" style={{ position: 'absolute', right: -Math.round(size * 0.08), top: -Math.round(size * 0.06), opacity: opacity ?? 0.18, color: '#fff', pointerEvents: 'none' }}>
      <BrandMark kind={markKind} size={size} color="#fff" />
    </div>
  );
}
