import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { COLORS, FONTS } from '../brand/tokens';

export default function RequireAuth({ children }) {
  const [status, setStatus] = useState('checking'); // checking | authed | anon

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setStatus(data.session ? 'authed' : 'anon');
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setStatus(session ? 'authed' : 'anon');
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  if (status === 'checking') {
    return (
      <div style={{ minHeight: '100vh', background: COLORS.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: FONTS.body, fontSize: 13, color: COLORS.mute }}>Loading…</div>
      </div>
    );
  }
  if (status === 'anon') return <Navigate to="/signin" replace />;
  return children;
}
