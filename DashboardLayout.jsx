import { useEffect, useState } from 'react';
import { Outlet, Navigate, Link } from 'react-router-dom';
import { CircleUserRound } from 'lucide-react';
import { COLORS, FONTS, getEdition } from '../../brand/tokens';
import { useTheme } from '../../theme/ThemeContext';
import { supabase } from '../../lib/supabaseClient';
import BottomNav from '../../components/BottomNav';
import Monogram from '../../components/Monogram';

// Loads the member's profile once, switches the theme to their edition, and
// hands { profile, edition } to every dashboard screen via useOutletContext().
export default function DashboardLayout() {
  const { setPath, tokens } = useTheme();
  const [state, setState] = useState({ loading: true, profile: null });

  useEffect(() => {
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;
      if (!userId) return setState({ loading: false, profile: null });
      const { data } = await supabase.from('user_profiles').select('*').eq('id', userId).single();
      if (data?.edition) setPath(data.edition);
      setState({ loading: false, profile: data });
    })();
  }, []);

  if (state.loading) {
    return <div style={{ minHeight: '100vh', background: COLORS.bg }} />;
  }

  // Signed in but never finished onboarding (or picked an edition): start over.
  const edition = getEdition(state.profile?.edition);
  if (!edition) return <Navigate to="/" replace />;
  if (typeof document !== 'undefined') document.title = edition.name;

  return (
    <div style={{ minHeight: '100vh', background: COLORS.bg }}>
      {/* Phone-width column, centered on bigger screens */}
      <div style={{ maxWidth: 480, margin: '0 auto', minHeight: '100vh', background: COLORS.bg, paddingBottom: 84 }}>
        <header
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 5,
            display: 'grid',
            gridTemplateColumns: '44px 1fr 44px',
            alignItems: 'center',
            padding: '14px 14px 12px',
            background: COLORS.bgWarm,
          }}
        >
          <Link to="/dashboard/profile" aria-label="Your profile" style={{ color: COLORS.ink, display: 'flex' }}>
            <CircleUserRound size={28} strokeWidth={1.5} />
          </Link>
          <Link to="/dashboard" aria-label={`${edition.name} home`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, textDecoration: 'none', color: COLORS.ink }}>
            <Monogram letters={edition.monogram} size={30} color={tokens.primary} />
            <span style={{ fontFamily: FONTS.brand, fontSize: 16, fontWeight: 500, letterSpacing: '0.16em', textTransform: 'uppercase', color: COLORS.ink, whiteSpace: 'nowrap' }}>
              {edition.name}
            </span>
          </Link>
          <span />
        </header>
        <Outlet context={{ profile: state.profile, edition }} />
      </div>
      <BottomNav />
    </div>
  );
}
