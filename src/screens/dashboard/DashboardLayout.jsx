import { Outlet } from 'react-router-dom';
import { COLORS } from '../../brand/tokens';
import BottomNav from '../../components/BottomNav';

export default function DashboardLayout() {
  return (
    <div style={{ minHeight: '100vh', background: COLORS.bg, paddingBottom: 80 }}>
      <Outlet />
      <BottomNav />
    </div>
  );
}
