import { NavLink } from 'react-router-dom';
import { Home, Apple, Sprout, LineChart, ListChecks } from 'lucide-react';
import { COLORS } from '../brand/tokens';

// Icon-only bottom nav — shared structural pattern across all Rooted Co apps.
// Do not add text labels here.
// 5 tabs: Home, Nutrition, Community, Progress, Habits.
// Devotion and the workout program are one tap from Home (via its cards),
// not separate tabs — same pattern as the reference app's "Jump back in".
const ITEMS = [
  { to: '/dashboard', icon: Home },
  { to: '/dashboard/nutrition', icon: Apple },
  { to: '/dashboard/community', icon: Sprout },
  { to: '/dashboard/progress', icon: LineChart },
  { to: '/dashboard/habits', icon: ListChecks },
];

export default function BottomNav() {
  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: 480,
        zIndex: 5,
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        padding: '14px 0 calc(14px + env(safe-area-inset-bottom, 0px))',
        background: COLORS.bgWarm,
        borderTop: `1px solid ${COLORS.line}`,
      }}
    >
      {ITEMS.map(({ to, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end
          style={({ isActive }) => ({
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: isActive ? COLORS.gold : COLORS.mute,
          })}
        >
          <Icon size={22} strokeWidth={1.75} />
        </NavLink>
      ))}
    </nav>
  );
}
