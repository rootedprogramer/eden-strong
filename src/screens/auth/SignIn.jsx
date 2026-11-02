import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { COLORS, FONTS } from '../../brand/tokens';
import Sprig from '../../components/Sprig';
import { supabase } from '../../lib/supabaseClient';
import { BrandMark } from '../../components/BrandArt';

export default function SignIn() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (signInError) {
      setError(signInError.message);
      return;
    }
    navigate('/dashboard');
  };

  return (
    <div style={{ minHeight: '100vh', background: COLORS.bg, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '40px 32px' }}>
      <BrandMark kind="small" size={36} color={COLORS.gold} />
      <div style={{ fontFamily: FONTS.display, fontSize: 32, color: COLORS.ink, marginTop: 20, fontStyle: 'italic' }}>
        Welcome back
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
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={inputStyle}
        />
        {error && <div style={{ color: '#B0413E', fontFamily: FONTS.body, fontSize: 13 }}>{error}</div>}
        <button type="submit" disabled={loading} style={buttonStyle}>
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
      <div style={{ marginTop: 20, fontFamily: FONTS.body, fontSize: 13, color: COLORS.mute }}>
        New here? <Link to="/signup" style={{ color: COLORS.gold }}>Create an account</Link>
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
  background: COLORS.surface,
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
