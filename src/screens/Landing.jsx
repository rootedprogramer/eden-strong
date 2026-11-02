import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { COLORS, FONTS, TAGLINE, EDITION_LIST, rememberEdition, brandArt, getEdition } from '../brand/tokens';
import { SITE_BRAND, siteUrlFor } from '../brand/site';
import { Dumbbell, Apple, BookOpen, Users } from 'lucide-react';
import { useTheme } from '../theme/ThemeContext';
import Monogram from '../components/Monogram';

// The shared front door for all three brands. Uses fixed brand-family colors
// (ivory, obsidian) rather than any one brand's theme.
const IVORY = '#F5F0E8';
const LINEN = '#D8CFC0';
const OBSIDIAN = '#171817';
const MUTE = '#6F6A63';

export default function Landing() {
  // Each brand's own website opens on its own welcome page
  if (SITE_BRAND) return <BrandLanding edition={getEdition(SITE_BRAND)} />;
  return <FamilyLanding />;
}

function FamilyLanding() {
  const navigate = useNavigate();
  const { setPath } = useTheme();

  useEffect(() => {
    setPath('women');
    document.title = 'Eden Strong, Faith Over Flesh, One Accord';
    document.body.style.background = IVORY;
  }, []);

  const choose = (id) => {
    // Once each brand has its own site, send people there
    const url = siteUrlFor(id);
    if (url) return window.location.assign(url);
    rememberEdition(id);
    navigate(`/signup?edition=${id}`);
  };

  return (
    <div style={{ minHeight: '100vh', background: IVORY, color: OBSIDIAN }}>
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '56px 22px 40px', display: 'flex', flexDirection: 'column', minHeight: '100vh', boxSizing: 'border-box' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: FONTS.brand, fontSize: 12, letterSpacing: '0.32em', textTransform: 'uppercase', color: MUTE }}>The brand family</div>
          <div aria-hidden="true" style={{ fontFamily: FONTS.brand, fontSize: 30, lineHeight: 1, margin: '18px 0 6px' }}>✝</div>
          <h1 style={{ margin: 0, fontFamily: FONTS.brand, fontWeight: 500, fontSize: 30, letterSpacing: '0.12em', lineHeight: 1.25 }}>
            Faith. Fitness.
            <br />
            Purpose.
          </h1>
          <p style={{ fontFamily: FONTS.body, fontSize: 14, color: MUTE, lineHeight: 1.6, margin: '14px auto 0', maxWidth: 320 }}>{TAGLINE}</p>
        </div>

        <div style={{ fontFamily: FONTS.brand, fontSize: 13, letterSpacing: '0.24em', textTransform: 'uppercase', textAlign: 'center', marginTop: 34 }}>
          Choose your community
        </div>
        <div style={{ height: 1, background: LINEN, margin: '12px 40px 0' }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 18 }}>
          {EDITION_LIST.map((ed) => (
            <button
              key={ed.id}
              onClick={() => choose(ed.id)}
              style={{
                display: 'flex',
                alignItems: 'stretch',
                gap: 16,
                padding: 0,
                borderRadius: 18,
                border: 'none',
                overflow: 'hidden',
                background: ed.card.bg,
                color: ed.card.ink,
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              {brandArt(ed.id).poster ? (
                <img src={brandArt(ed.id).poster} alt="" style={{ width: 118, minHeight: 118, objectFit: 'cover', flexShrink: 0, display: 'block' }} />
              ) : (
                <span style={{ padding: '20px 0 20px 20px', display: 'flex', alignItems: 'center' }}><Monogram letters={ed.monogram} size={58} /></span>
              )}
              <span style={{ flex: 1, padding: '16px 16px 16px 0', alignSelf: 'center' }}>
                <span style={{ display: 'block', fontFamily: FONTS.brand, fontSize: 17, fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', lineHeight: 1.2 }}>
                  {ed.name}
                </span>
                <span style={{ display: 'block', fontFamily: FONTS.brand, fontSize: 11, letterSpacing: '0.26em', textTransform: 'uppercase', opacity: 0.85, marginTop: 5 }}>
                  {ed.short}
                </span>
                <span style={{ display: 'block', fontFamily: FONTS.body, fontSize: 13, opacity: 0.9, marginTop: 8, lineHeight: 1.4 }}>{ed.pitch}</span>
              </span>
            </button>
          ))}
        </div>

        <div style={{ fontFamily: FONTS.script, fontSize: 30, textAlign: 'center', marginTop: 26, color: OBSIDIAN }}>
          Different paths. Same purpose.
        </div>

        <div style={{ flex: 1 }} />
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <div style={{ fontFamily: FONTS.body, fontSize: 13, color: MUTE }}>Founding members, $10 a month</div>
          <Link to="/signin" style={{ display: 'inline-block', marginTop: 8, padding: 10, fontFamily: FONTS.body, fontSize: 14, fontWeight: 600, color: OBSIDIAN }}>
            Already a member? Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

// Welcome page for a single brand's website
function BrandLanding({ edition }) {
  const navigate = useNavigate();
  const art = brandArt(edition.id);
  const hero = edition.welcomeImage && edition.welcomeFit !== 'contain' ? edition.welcomeImage : art.poster;

  useEffect(() => {
    document.title = edition.name;
  }, [edition.id]);

  const features = [
    [Dumbbell, 'Programs', 'Beginner and experienced plans, 3 to 6 days a week'],
    [Apple, 'Nutrition', 'Recipes, meal plans, and simple food tracking'],
    [BookOpen, 'Devotions', 'Scripture and reflection to start every day'],
    [Users, 'Community', edition.id === 'together' ? 'Couples encouraging couples' : edition.id === 'men' ? 'Brotherhood and accountability' : 'Sisters walking this with you'],
  ];

  return (
    <div style={{ minHeight: '100vh', background: COLORS.bg, color: COLORS.ink }}>
      <div style={{ maxWidth: 480, margin: '0 auto' }}>
        <div style={{ position: 'relative', height: '58vh', minHeight: 380, maxHeight: 560, overflow: 'hidden' }}>
          {hero && <img src={hero} alt={`${edition.name}. ${edition.pillars}`} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top', display: 'block' }} />}
          <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to bottom, rgba(0,0,0,0) 55%, ${'var(--es-bg)'} 100%)` }} />
        </div>

        <div style={{ padding: '0 24px 40px', marginTop: -30, position: 'relative', textAlign: 'center' }}>
          {/* The brand artwork already shows the logo and name; repeat them only without artwork */}
          {hero ? (
            <h1 style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>{edition.name}</h1>
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'center' }}><Monogram letters={edition.monogram} size={54} color={COLORS.gold} /></div>
              <h1 style={{ margin: '14px 0 0', fontFamily: FONTS.brand, fontSize: 30, fontWeight: 500, letterSpacing: '0.16em', textTransform: 'uppercase', lineHeight: 1.2 }}>{edition.name}</h1>
              <div style={{ fontFamily: FONTS.brand, fontSize: 12, letterSpacing: '0.22em', textTransform: 'uppercase', color: COLORS.mute, marginTop: 8 }}>{edition.pillars}</div>
            </>
          )}
          <div style={{ fontFamily: FONTS.script, fontSize: 36, color: COLORS.gold, marginTop: hero ? 4 : 18, lineHeight: 1.15 }}>{edition.script}</div>
          <p style={{ fontFamily: FONTS.body, fontSize: 15, color: COLORS.ink, lineHeight: 1.6, margin: '14px auto 0', maxWidth: 340 }}>{edition.tagline}</p>

          <button
            onClick={() => navigate('/signup')}
            style={{ width: '100%', marginTop: 24, padding: 16, borderRadius: 16, border: 'none', background: COLORS.ink, color: COLORS.bg, fontFamily: FONTS.body, fontSize: 16, fontWeight: 600, cursor: 'pointer' }}
          >
            Join {edition.name}
          </button>
          <div style={{ fontFamily: FONTS.body, fontSize: 13, color: COLORS.mute, marginTop: 10 }}>Founding members, $10 a month</div>
          <Link to="/signin" style={{ display: 'inline-block', marginTop: 6, padding: 10, fontFamily: FONTS.body, fontSize: 14, fontWeight: 600, color: COLORS.ink }}>
            Already a member? Sign in
          </Link>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10, marginTop: 26, textAlign: 'left' }}>
            {features.map(([Icon, title, sub]) => (
              <div key={title} style={{ padding: 14, borderRadius: 16, background: COLORS.surface, border: `1px solid ${COLORS.line}` }}>
                <Icon size={20} color={COLORS.gold} />
                <div style={{ fontFamily: FONTS.body, fontSize: 14, fontWeight: 600, color: COLORS.ink, marginTop: 8 }}>{title}</div>
                <div style={{ fontFamily: FONTS.body, fontSize: 12, color: COLORS.mute, marginTop: 3, lineHeight: 1.45 }}>{sub}</div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 30, padding: '0 8px' }}>
            <div style={{ fontFamily: FONTS.display, fontSize: 20, fontStyle: 'italic', color: COLORS.ink, lineHeight: 1.5 }}>“{edition.verse.text}”</div>
            <div style={{ fontFamily: FONTS.brand, fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: COLORS.mute, marginTop: 8 }}>{edition.verse.ref}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
