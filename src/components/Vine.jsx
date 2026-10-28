import { COLORS } from '../brand/tokens';

// Subtle growing vine — one segment renders per step of onboarding progress
export default function Vine({ progress = 0 }) {
  const segments = Math.max(0, Math.min(progress, 8));
  return (
    <svg viewBox="0 0 200 40" style={{ width: '100%', height: 38, display: 'block', color: COLORS.sage }}>
      <path
        d={`M 0 30 Q 25 ${25 - segments} 50 28 T 100 26 T 150 24 T 200 22`}
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        opacity={0.85}
      />
      {Array.from({ length: segments }).map((_, i) => {
        const x = (i + 1) * 25;
        const y = 26 - i * 0.8;
        return (
          <g key={i} opacity={0.9}>
            <ellipse cx={x - 4} cy={y - 2} rx="3.5" ry="1.5" fill="currentColor" transform={`rotate(-30 ${x - 4} ${y - 2})`} />
            <ellipse cx={x + 4} cy={y - 2} rx="3.5" ry="1.5" fill="currentColor" transform={`rotate(30 ${x + 4} ${y - 2})`} />
          </g>
        );
      })}
    </svg>
  );
}
