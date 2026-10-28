import { useEffect, useState } from 'react';
import { useTheme } from '../../theme/ThemeContext';
import { useNavigate, Link, useSearchParams, Navigate } from 'react-router-dom';
import { COLORS, FONTS, getEdition, rememberEdition, recallEdition } from '../../brand/tokens';
import Sprig from '../../components/Sprig';
import { supabase } from '../../lib/supabaseClient';

export default function SignUp() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const edition = getEdition(params.get('edition') || recallEdition());
  const { setPath } = useTheme();
  useEffect(() => { if (edition) setPath(edition.id); }, [edition?.id]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error: signUpError } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (signUpError) {
      setError(signUpError.message);
      return;
    }
    rememberEdition(edition.id);
    navigate(`/onboarding?edition=${edition.id}`);
  };

  // Everyone has to pick Women, Men, or Together first.
  if (!edition) return <Navigate to="/" replace />;

  return (
    <div style={{ minHeight: '100vh', background: COLORS.bg, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '40px 32px' }}>
      <Sprig size={36} color={COLORS.gold} />
      <div style={{ marginTop: 16, fontFamily: FONTS.body, fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: COLORS.mute }}>
        {edition.name} · <Link to="/" style={{ color: COLORS.gold, textTransform: 'none', letterSpacing: 0 }}>change</Link>
      </div>
      <div style={{ fontFamily: FONTS.display, fontSize: 32, color: COLORS.ink, marginTop: 20, fontStyle: 'italic' }}>
        Begin your season
      </div>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 28 }}>
        <input
          type="email"
          required
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
        />
        <input
          type="password"
          required
          minLength={6}
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={inputStyle}
        />
        {error && <div style={{ color: '#B0413E', fontFamily: FONTS.body, fontSize: 13 }}>{error}</div>}
        <button type="submit" disabled={loading} style={buttonStyle}>
          {loading ? 'Creating account…' : 'Create account'}
        </button>
      </form>
      <div style={{ marginTop: 20, fontFamily: FONTS.body, fontSize: 13, color: COLORS.mute }}>
        Already have an account? <Link to="/signin" style={{ color: COLORS.gold }}>Sign in</Link>
      </div>
    </div>
  );
}

const inputStyle = {
  fontFamily: FONTS.body,
  fontSize: 15,
  padding: '14px 16px',
  borderRadius: 12,
  border: `1px solid ${COLORS.line}`,
  background: '#fff',
  color: COLORS.ink,
  outline: 'none',
};

const buttonStyle = {
  fontFamily: FONTS.body,
  fontSize: 15,
  fontWeight: 500,
  padding: '14px 16px',
  borderRadius: 999,
  border: 'none',
  background: COLORS.ink,
  color: COLORS.bg,
  cursor: 'pointer',
  marginTop: 8,
};
