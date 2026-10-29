import { COLORS, FONTS } from '../brand/tokens';

const DAY = 86400000;
const toTime = (iso) => new Date(iso + 'T12:00').getTime();

// Simple line chart for one metric over a date window.
// points: [{ date: 'YYYY-MM-DD', value }], start/end: 'YYYY-MM-DD'
export default function LineChart({ points, start, end, unit }) {
  const W = 340, H = 230, L = 40, R = 10, T = 12, B = 30;
  const t0 = toTime(start), t1 = toTime(end);
  const span = Math.max(DAY, t1 - t0);
  const values = points.map((p) => Number(p.value));

  let lo = values.length ? Math.min(...values) : 0;
  let hi = values.length ? Math.max(...values) : 10;
  const pad = Math.max(1, (hi - lo) * 0.25);
  lo = Math.floor(lo - pad);
  hi = Math.ceil(hi + pad);
  const ticks = Array.from({ length: 5 }).map((_, i) => lo + ((hi - lo) * i) / 4);

  const x = (iso) => L + ((toTime(iso) - t0) / span) * (W - L - R);
  const y = (v) => T + (1 - (v - lo) / (hi - lo)) * (H - T - B);

  const xTicks = Array.from({ length: 4 }).map((_, i) => new Date(t0 + (span * (i + 0.5)) / 4));
  const sorted = [...points].sort((a, b) => (a.date < b.date ? -1 : 1));
  const path = sorted.map((p, i) => `${i ? 'L' : 'M'}${x(p.date).toFixed(1)},${y(Number(p.value)).toFixed(1)}`).join(' ');

  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Chart of ${points.length} entries${unit ? ` in ${unit}` : ''}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
      <rect x={L} y={T} width={W - L - R} height={H - T - B} fill="#fff" stroke={COLORS.line} />
      {ticks.map((v, i) => (
        <g key={i}>
          <line x1={L} x2={W - R} y1={y(v)} y2={y(v)} stroke={COLORS.line} strokeWidth="1" />
          <text x={L - 6} y={y(v) + 4} textAnchor="end" fontSize="11" fontFamily={FONTS.body} fill={COLORS.mute}>
            {Math.round(v * 10) / 10}
          </text>
        </g>
      ))}
      {xTicks.map((d, i) => {
        const px = L + ((d.getTime() - t0) / span) * (W - L - R);
        return (
          <g key={i}>
            <line x1={px} x2={px} y1={T} y2={H - B} stroke={COLORS.line} strokeWidth="1" />
            <text x={px} y={H - 10} textAnchor="middle" fontSize="11" fontFamily={FONTS.body} fill={COLORS.mute}>
              {d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </text>
          </g>
        );
      })}
      {sorted.length > 1 && <path d={path} fill="none" stroke={COLORS.olive} strokeWidth="2.5" strokeLinejoin="round" />}
      {sorted.map((p, i) => (
        <circle key={i} cx={x(p.date)} cy={y(Number(p.value))} r="4.5" fill={COLORS.olive} />
      ))}
      {!points.length && (
        <text x={(L + W - R) / 2} y={(T + H - B) / 2} textAnchor="middle" fontSize="13" fontFamily={FONTS.body} fill={COLORS.mute}>
          No entries in this range
        </text>
      )}
    </svg>
  );
}
