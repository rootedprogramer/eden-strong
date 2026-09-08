import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { COLORS, FONTS, PATHS } from '../../brand/tokens';
import { supabase } from '../../lib/supabaseClient';

export default function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;
      if (!userId) return;
      const { data } = await supabase.from('user_profiles').select('*').eq('id', userId).single();
      setProfile(data);
    })();
  }, []);

  const pathInfo = PATHS.find((p) => p.id === profile?.path);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <div style={{ padding: '48px 24px 24px' }}>
      <div style={{ fontFamily: FONTS.display, fontSize: 26, color: COLORS.ink, fontStyle: 'italic' }}>
        {profile?.name || 'Your profile'}
      </div>
      {pathInfo && (
        <div style={{ marginTop: 8, fontFamily: FONTS.body, fontSize: 13, color: COLORS.mute }}>
          Walking the {pathInfo.title.toLowerCase()} path
        </div>
      )}

      <div style={{ marginTop: 24, padding: 18, borderRadius: 16, background: '#fff', border: `1px solid ${COLORS.line}` }}>
        <div style={{ fontFamily: FONTS.body, fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', color: COLORS.mute }}>
          Membership
        </div>
        <div style={{ fontFamily: FONTS.display, fontSize: 18, color: COLORS.ink, marginTop: 6, fontStyle: 'italic' }}>
          Founding member — $10/mo
        </div>
      </div>

      <button
        onClick={handleSignOut}
        style={{
          marginTop: 24,
          fontFamily: FONTS.body,
          fontSize: 13,
          color: COLORS.mute,
          background: 'none',
          border: `1px solid ${COLORS.line}`,
          padding: '10px 18px',
          borderRadius: 999,
          cursor: 'pointer',
        }}
      >
        Sign out
      </button>
    </div>
  );
}
