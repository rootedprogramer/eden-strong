// Brand monogram: two letters with a cross through the middle,
// like E✝S (Eden Strong), F✝F (Faith Over Flesh) and O✝A (One Accord).
// Drawn in code so it stays sharp at any size and takes any color.
export default function Monogram({ letters = ['E', 'S'], size = 48, color = 'currentColor', title }) {
  const [a, b] = letters;
  return (
    <svg
      viewBox="0 0 120 110"
      width={size * (120 / 110)}
      height={size}
      role={title ? 'img' : 'presentation'}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      style={{ display: 'block', color }}
    >
      <text x="33" y="86" textAnchor="middle" fontFamily="'Cinzel', Georgia, serif" fontSize="70" fontWeight="500" fill="currentColor">{a}</text>
      <text x="87" y="86" textAnchor="middle" fontFamily="'Cinzel', Georgia, serif" fontSize="70" fontWeight="500" fill="currentColor">{b}</text>
      {/* the cross: tapered points top and bottom, crossbar near the top */}
      <polygon points="60,2 63,10 63,96 60,108 57,96 57,10" fill="currentColor" />
      <polygon points="40,27 47,24.5 73,24.5 80,27 73,29.5 47,29.5" fill="currentColor" />
    </svg>
  );
}
