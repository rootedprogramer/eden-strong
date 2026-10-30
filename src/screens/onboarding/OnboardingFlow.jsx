import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Navigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { COLORS, FONTS, GOALS, FOLLOW_UPS, VERSES, getEdition, recallEdition, tint } from '../../brand/tokens';
import { useTheme } from '../../theme/ThemeContext';
import Monogram from '../../components/Monogram';
import Vine from '../../components/Vine';
import Sprig from '../../components/Sprig';
import { supabase } from '../../lib/supabaseClient';

// Screen order: 3 verse slides -> brand -> name capture -> path select -> path follow-up -> welcome
const TOTAL_STEPS = 8;

export default function OnboardingFlow() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const edition = getEdition(params.get('edition') || recallEdition());
  const { setPath: setThemePath, tokens } = useTheme();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [path, setPath] = useState(null);
  const [followUpAnswer, setFollowUpAnswer] = useState(null);

  useEffect(() => {
    if (edition) setThemePath(edition.id);
  }, [edition?.id]);

  const next = () => setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const finish = async () => {
    // Persist onboarding selections to the user's profile.
    // Assumes the user already has a Supabase auth session (see SignUp screen)
    // and that `user_profiles` has: id (uuid, FK to auth.users), name, path, path_detail.
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    if (userId) {
      await supabase.from('user_profiles').upsert({
        id: userId,
        name,
        edition: edition.id,
        path,
        path_detail: followUpAnswer,
        onboarded_at: new Date().toISOString(),
      });
    }
    // Together members go straight to linking with their spouse.
    navigate(edition.id === 'together' ? '/dashboard/profile' : '/dashboard');
  };

  if (!edition) return <Navigate to="/" replace />;

  return (
    <div style={{ minHeight: '100vh', maxWidth: 480, margin: '0 auto', background: COLORS.bg, display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, position: 'relative', minHeight: 420 }}>
        {step < 3 && <VerseSplash verse={VERSES[step]} bgAlt={step % 2 === 1} edition={edition} tokens={tokens} />}
        {step === 3 && <BrandScreen edition={edition} tokens={tokens} />}
        {step === 4 && <NameCapture name={name} setName={setName} />}
        {step === 5 && <PathSelect goals={GOALS[edition.id]} path={path} setPath={setPath} />}
        {step === 6 && path && (
          <PathFollowUp
            path={path}
            answer={followUpAnswer}
            setAnswer={setFollowUpAnswer}
          />
        )}
        {step === 7 && <PersonalizedWelcome name={name} path={path} edition={edition} />}
      </div>

      <div style={{ padding: '0 32px 24px' }}>
        <Vine progress={step} />
        <NavBar
          step={step}
          totalSteps={TOTAL_STEPS}
          onBack={back}
          onNext={step === TOTAL_STEPS - 1 ? finish : next}
          nextDisabled={
            (step === 4 && !name.trim()) ||
            (step === 5 && !path) ||
            (step === 6 && !followUpAnswer)
          }
          nextLabel={step === TOTAL_STEPS - 1 ? `Enter ${edition.name}` : 'Continue'}
        />
      </div>
    </div>
  );
}

function NavBar({ step, totalSteps, onBack, onNext, nextDisabled, nextLabel }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 }}>
      <button
        onClick={onBack}
        disabled={step === 0}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          background: 'none',
          border: 'none',
          color: step === 0 ? 'transparent' : COLORS.mute,
          fontFamily: FONTS.body,
          fontSize: 14,
          cursor: step === 0 ? 'default' : 'pointer',
          padding: 8,
        }}
      >
        <ChevronLeft size={16} /> Back
      </button>
      <button
        onClick={onNext}
        disabled={nextDisabled}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          background: nextDisabled ? COLORS.line : COLORS.ink,
          color: nextDisabled ? COLORS.mute : COLORS.bg,
          border: 'none',
          borderRadius: 999,
          padding: '12px 24px',
          fontFamily: FONTS.body,
          fontSize: 14,
          fontWeight: 500,
          cursor: nextDisabled ? 'not-allowed' : 'pointer',
        }}
      >
        {nextLabel} <ChevronRight size={16} />
      </button>
    </div>
  );
}

function VerseSplash({ verse, bgAlt, edition, tokens }) {
  return (
    <div
      style={{
        minHeight: '70vh',
        background: bgAlt ? COLORS.bgWarm : COLORS.bg,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '40px 32px',
        position: 'relative',
      }}
    >
      <div style={{ position: 'absolute', top: 32, left: 32, fontFamily: FONTS.display, fontSize: 13, letterSpacing: '0.18em', color: tokens.primary, textTransform: 'uppercase' }}>
        {edition.name}
      </div>
      <div style={{ marginBottom: 28 }}>
        <Sprig size={32} color={COLORS.sage} />
      </div>
      <div style={{ fontFamily: FONTS.display, fontSize: 30, lineHeight: 1.25, color: COLORS.ink, fontWeight: 400, fontStyle: 'italic', letterSpacing: '-0.01em' }}>
        {verse.text}
      </div>
      <div style={{ marginTop: 28, fontFamily: FONTS.body, fontSize: 11, letterSpacing: '0.22em', color: COLORS.gold, textTransform: 'uppercase', fontWeight: 500 }}>
        {verse.ref}
      </div>
    </div>
  );
}

function BrandScreen({ edition, tokens }) {
  // Brands with artwork (Eden Strong, Faith Over Flesh) show it full screen
  if (edition.welcomeImage) {
    return (
      <div style={{ position: 'absolute', inset: 0, background: '#000' }}>
        <img src={edition.welcomeImage} alt={`${edition.name}. ${edition.verse.text} ${edition.verse.ref}`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      </div>
    );
  }
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 28px', color: COLORS.ink }}>
      <Monogram letters={edition.monogram} size={110} color={tokens.ink} />
      <div style={{ fontFamily: FONTS.brand, fontSize: 30, fontWeight: 500, letterSpacing: '0.18em', textTransform: 'uppercase', marginTop: 22 }}>{edition.name}</div>
      <div style={{ fontFamily: FONTS.brand, fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase', color: COLORS.mute, marginTop: 10 }}>{edition.pillars}</div>
      <div style={{ fontFamily: FONTS.script, fontSize: 32, color: tokens.primary, marginTop: 26, lineHeight: 1.2 }}>{edition.script}</div>
      <div style={{ fontFamily: FONTS.display, fontSize: 18, fontStyle: 'italic', color: COLORS.ink, marginTop: 26, lineHeight: 1.5, maxWidth: 300 }}>“{edition.verse.text}”</div>
      <div style={{ fontFamily: FONTS.brand, fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: COLORS.mute, marginTop: 10 }}>{edition.verse.ref}</div>
    </div>
  );
}

function NameCapture({ name, setName }) {
  return (
    <div style={{ minHeight: '70vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '40px 32px' }}>
      <div style={{ fontFamily: FONTS.display, fontSize: 26, color: COLORS.ink, fontStyle: 'italic', marginBottom: 20 }}>
        What should we call you?
      </div>
      <input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Your first name"
        style={{
          fontFamily: FONTS.body,
          fontSize: 16,
          padding: '14px 16px',
          borderRadius: 12,
          border: `1px solid ${COLORS.line}`,
          background: COLORS.surface,
          color: COLORS.ink,
          outline: 'none',
        }}
      />
    </div>
  );
}

function PathSelect({ goals, path, setPath }) {
  return (
    <div style={{ minHeight: '70vh', padding: '40px 32px' }}>
      <div style={{ fontFamily: FONTS.display, fontSize: 26, color: COLORS.ink, fontStyle: 'italic', marginBottom: 24 }}>
        Which season are you in?
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {goals.map((p) => (
          <button
            key={p.id}
            onClick={() => setPath(p.id)}
            style={{
              textAlign: 'left',
              padding: '16px 18px',
              borderRadius: 14,
              border: `1.5px solid ${path === p.id ? p.color : COLORS.line}`,
              background: path === p.id ? tint(p.color, 13) : COLORS.surface,
              cursor: 'pointer',
            }}
          >
            <div style={{ fontFamily: FONTS.display, fontSize: 18, color: COLORS.ink, fontStyle: 'italic' }}>{p.title}</div>
            <div style={{ fontFamily: FONTS.body, fontSize: 13, color: COLORS.mute, marginTop: 2 }}>{p.sub}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

function PathFollowUp({ path, answer, setAnswer }) {
  const config = FOLLOW_UPS[path];
  return (
    <div style={{ minHeight: '70vh', padding: '40px 32px' }}>
      <div style={{ fontFamily: FONTS.display, fontSize: 24, color: COLORS.ink, fontStyle: 'italic', marginBottom: 24 }}>
        {config.question}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {config.options.map((opt) => (
          <button
            key={opt}
            onClick={() => setAnswer(opt)}
            style={{
              textAlign: 'left',
              padding: '14px 16px',
              borderRadius: 12,
              border: `1.5px solid ${answer === opt ? COLORS.gold : COLORS.line}`,
              background: answer === opt ? tint(COLORS.gold, 10) : COLORS.surface,
              fontFamily: FONTS.body,
              fontSize: 14,
              color: COLORS.ink,
              cursor: 'pointer',
            }}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

function PersonalizedWelcome({ name, path, edition }) {
  const pathInfo = GOALS[edition.id].find((p) => p.id === path);
  return (
    <div style={{ minHeight: '70vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '40px 32px' }}>
      <Sprig size={36} color={pathInfo?.color || COLORS.gold} />
      <div style={{ fontFamily: FONTS.display, fontSize: 30, color: COLORS.ink, fontStyle: 'italic', marginTop: 20, lineHeight: 1.3 }}>
        Welcome, {name || 'friend'}.
      </div>
      <div style={{ fontFamily: FONTS.body, fontSize: 14, color: COLORS.mute, marginTop: 12, lineHeight: 1.6, maxWidth: 280 }}>
        Your space in {edition.name} is ready, built around {pathInfo?.title?.toLowerCase() || 'this season'}.
        {edition.id === 'together' ? " Next, you'll link up with your spouse." : " Let's begin."}
      </div>
    </div>
  );
}
