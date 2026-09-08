import { COLORS } from '../brand/tokens';

// Small botanical mark used as a recurring decorative accent
export default function Sprig({ size = 24, color = COLORS.gold }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size}>
      <path d="M12 22 L12 6" stroke={color} strokeWidth="0.7" strokeLinecap="round" fill="none" />
      <ellipse cx="9" cy="14" rx="3" ry="1.2" fill={color} opacity="0.85" transform="rotate(-35 9 14)" />
      <ellipse cx="15" cy="11" rx="3" ry="1.2" fill={color} opacity="0.85" transform="rotate(35 15 11)" />
      <ellipse cx="9" cy="9" rx="2.5" ry="1" fill={color} opacity="0.85" transform="rotate(-35 9 9)" />
      <circle cx="12" cy="4" r="1.2" fill={color} />
    </svg>
  );
}
