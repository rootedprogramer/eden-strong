import { useEffect, useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { COLORS, FONTS, getEdition } from '../../brand/tokens';
import { useTheme } from '../../theme/ThemeContext';
import { supabase } from '../../lib/supabaseClient';
import BottomNav from '../../components/BottomNav';

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

  return (
    <div style={{ minHeight: '100vh', background: 'var(--es-canvas)', paddingBottom: 80 }}>
      <div style={{ padding: '16px 24px 0', fontFamily: FONTS.body, fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 600, color: tokens.primary }}>
        {edition.name}
      </div>
      <Outlet context={{ profile: state.profile, edition }} />
      <BottomNav />
    </div>
  );
}
