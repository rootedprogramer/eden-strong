import { useEffect, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { COLORS, FONTS, findGoal } from '../../brand/tokens';
import { supabase } from '../../lib/supabaseClient';
import { useIsAdmin } from '../../lib/admin';
import { Link } from 'react-router-dom';
import { ShieldCheck, ChevronRight } from 'lucide-react';

export default function Profile() {
  const navigate = useNavigate();
  const { profile, edition } = useOutletContext();
  const goal = findGoal(profile?.path);
  const isAdmin = useIsAdmin();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <div style={{ padding: '32px 24px 24px' }}>
      <div style={{ fontFamily: FONTS.display, fontSize: 26, color: COLORS.ink, fontStyle: 'italic' }}>
        {profile?.name || 'Your profile'}
      </div>
      {goal && (
        <div style={{ marginTop: 8, fontFamily: FONTS.body, fontSize: 13, color: COLORS.mute }}>
          Focused on {goal.title.toLowerCase()}
        </div>
      )}

      {isAdmin && (
        <Link to="/dashboard/admin" style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', background: COLORS.deep, border: 'none' }}>
          <ShieldCheck size={22} color={COLORS.rose} />
          <span style={{ flex: 1 }}>
            <span style={{ display: 'block', fontFamily: FONTS.body, fontSize: 16, fontWeight: 600, color: '#fff' }}>Admin</span>
            <span style={{ display: 'block', fontFamily: FONTS.body, fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 2 }}>Programs, recipes, meal plans, and members</span>
          </span>
          <ChevronRight size={20} color="#fff" />
        </Link>
      )}

      {edition.id === 'together' && <CoupleCard profile={profile} />}

      <div style={cardStyle}>
        <div style={labelStyle}>Membership</div>
        <div style={{ fontFamily: FONTS.display, fontSize: 18, color: COLORS.ink, marginTop: 6, fontStyle: 'italic' }}>
          {edition.name} · Founding member — $10/mo
        </div>
      </div>

      <button
        onClick={handleSignOut}
        style={{
          marginTop: 24, fontFamily: FONTS.body, fontSize: 13, color: COLORS.mute, background: 'none',
          border: `1px solid ${COLORS.line}`, padding: '10px 18px', borderRadius: 999, cursor: 'pointer',
        }}
      >
        Sign out
      </button>
    </div>
  );
}

// Links two Together accounts. One spouse creates a code, the other enters it.
function CoupleCard({ profile }) {
  const [couple, setCouple] = useState(undefined); // undefined = loading, null = none
  const [partnerName, setPartnerName] = useState('');
  const [mode, setMode] = useState(null); // null | 'join'
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const { data } = await supabase.from('couples').select('*').maybeSingle();
    setCouple(data || null);
    if (data?.partner_b) {
      const partnerId = data.partner_a === profile.id ? data.partner_b : data.partner_a;
      const { data: p } = await supabase.from('user_profiles').select('name').eq('id', partnerId).maybeSingle();
      setPartnerName(p?.name || 'your spouse');
    }
  };

  useEffect(() => { load(); }, []);

  const createCode = async () => {
    setBusy(true); setError('');
    const { error: err } = await supabase.from('couples').insert({ partner_a: profile.id });
    setBusy(false);
    if (err) return setError(err.message);
    load();
  };

  const joinWithCode = async () => {
    setBusy(true); setError('');
    const { error: err } = await supabase.rpc('join_couple', { code });
    setBusy(false);
    if (err) return setError(err.message);
    load();
  };

  if (couple === undefined) return null;

  return (
    <div style={cardStyle}>
      <div style={labelStyle}>Your spouse</div>

      {couple?.partner_b && (
        <div style={{ fontFamily: FONTS.display, fontSize: 18, color: COLORS.ink, marginTop: 6, fontStyle: 'italic' }}>
          Linked with {partnerName}
        </div>
      )}

      {couple && !couple.partner_b && (
        <>
          <div style={{ fontFamily: FONTS.body, fontSize: 14, color: COLORS.ink, marginTop: 8, lineHeight: 1.5 }}>
            Have your spouse sign up for One Accord, then enter this code on their Profile page:
          </div>
          <div style={{ fontFamily: FONTS.body, fontSize: 28, fontWeight: 600, letterSpacing: '0.2em', color: 'var(--es-primary)', marginTop: 12 }}>
            {couple.invite_code}
          </div>
        </>
      )}

      {!couple && mode !== 'join' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
          <button onClick={createCode} disabled={busy} style={primaryBtn}>Create an invite code for my spouse</button>
          <button onClick={() => setMode('join')} style={secondaryBtn}>I have a code from my spouse</button>
        </div>
      )}

      {!couple && mode === 'join' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="6-character code"
            maxLength={6}
            style={{
              fontFamily: FONTS.body, fontSize: 18, letterSpacing: '0.2em', padding: '12px 14px', borderRadius: 12,
              border: `1px solid ${COLORS.line}`, background: COLORS.surface, color: COLORS.ink, outline: 'none',
            }}
          />
          <button onClick={joinWithCode} disabled={busy || code.length < 6} style={primaryBtn}>Link our accounts</button>
          <button onClick={() => { setMode(null); setError(''); }} style={secondaryBtn}>Back</button>
        </div>
      )}

      {error && <div style={{ color: '#B0413E', fontFamily: FONTS.body, fontSize: 13, marginTop: 10 }}>{error}</div>}
    </div>
  );
}

const cardStyle = { marginTop: 24, padding: 18, borderRadius: 16, background: COLORS.surface, border: `1px solid ${COLORS.line}` };
const labelStyle = { fontFamily: FONTS.body, fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', color: COLORS.mute };
const primaryBtn = {
  fontFamily: FONTS.body, fontSize: 14, fontWeight: 500, padding: '12px 16px', borderRadius: 999,
  border: 'none', background: COLORS.ink, color: COLORS.bg, cursor: 'pointer',
};
const secondaryBtn = {
  fontFamily: FONTS.body, fontSize: 14, padding: '12px 16px', borderRadius: 999,
  border: `1px solid ${COLORS.line}`, background: 'none', color: COLORS.ink, cursor: 'pointer',
};
