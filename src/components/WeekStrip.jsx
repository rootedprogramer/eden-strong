import { COLORS, FONTS } from '../brand/tokens';

// Sunday-start week strip with the current day highlighted — matches the
// reference dashboard's date picker. Selection is visual only for now.
export default function WeekStrip() {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - dayOfWeek);

  const days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    return d;
  });

  const labels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20 }}>
      {days.map((d, i) => {
        const isToday = d.toDateString() === today.toDateString();
        return (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <div style={{ fontFamily: FONTS.body, fontSize: 11, color: COLORS.mute, letterSpacing: '0.05em' }}>
              {labels[i]}
            </div>
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: FONTS.body,
                fontSize: 13,
                fontWeight: isToday ? 600 : 400,
                background: isToday ? COLORS.ink : 'transparent',
                color: isToday ? COLORS.bg : COLORS.ink,
              }}
            >
              {d.getDate()}
            </div>
          </div>
        );
      })}
    </div>
  );
}
