import { useEffect, useState } from 'react';
import { Outlet, Navigate, Link } from 'react-router-dom';
import { CircleUserRound } from 'lucide-react';
import { COLORS, FONTS, getEdition } from '../../brand/tokens';
import { useTheme } from '../../theme/ThemeContext';
import { supabase } from '../../lib/supabaseClient';
import BottomNav from '../../components/BottomNav';
import Monogram from '../../components/Monogram';
import { SITE_BRAND, siteUrlFor } from '../../brand/site';

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
      const { data: adminRow } = await supabase.from('admins').select('user_id').eq('user_id', userId).maybeSingle();
      if (SITE_BRAND) setPath(SITE_BRAND);
      else if (data?.edition) setPath(data.edition);
      setState({ loading: false, profile: data, isAdmin: !!adminRow });
    })();
  }, []);

  if (state.loading) {
    return <div style={{ minHeight: '100vh', background: COLORS.bg }} />;
  }

  // Signed in but never finished onboarding (or picked an edition): start over.
  const ownEdition = getEdition(state.profile?.edition);
  if (!ownEdition) return <Navigate to={SITE_BRAND ? '/onboarding' : '/'} replace />;

  // A member of another brand signed in here: send them to their own site.
  // Admins can open every site.
  if (SITE_BRAND && ownEdition.id !== SITE_BRAND && !state.isAdmin) {
    return <WrongSite own={ownEdition} here={getEdition(SITE_BRAND)} />;
  }

  const edition = SITE_BRAND ? getEdition(SITE_BRAND) : ownEdition;
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

function WrongSite({ own, here }) {
  const url = siteUrlFor(own.id);
  const signOut = async () => {
    await supabase.auth.signOut();
    window.location.assign('/');
  };
  return (
    <div style={{ minHeight: '100vh', background: COLORS.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 28 }}>
      <div style={{ maxWidth: 380, textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center' }}><Monogram letters={own.monogram} size={64} color={COLORS.gold} /></div>
        <h1 style={{ margin: '18px 0 0', fontFamily: FONTS.display, fontSize: 30, fontWeight: 500, color: COLORS.ink, lineHeight: 1.15 }}>Your account is with {own.name}</h1>
        <p style={{ fontFamily: FONTS.body, fontSize: 15, color: COLORS.mute, lineHeight: 1.6, margin: '12px 0 0' }}>
          This is the {here.name} site. Your programs, progress, and community are waiting on {own.name}.
        </p>
        {url && (
          <a href={url} style={{ display: 'block', marginTop: 22, padding: 15, borderRadius: 16, background: COLORS.ink, color: COLORS.bg, fontFamily: FONTS.body, fontSize: 15, fontWeight: 600, textDecoration: 'none' }}>
            Go to {own.name}
          </a>
        )}
        <button onClick={signOut} style={{ marginTop: 12, padding: 12, background: 'none', border: 'none', color: COLORS.mute, fontFamily: FONTS.body, fontSize: 14, cursor: 'pointer' }}>
          Sign out
        </button>
      </div>
    </div>
  );
}
