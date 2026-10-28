// theme.js
// One color palette per edition. Every screen reads its colors through the
// COLORS object in src/brand/tokens.js, which points at CSS variables that
// ThemeContext fills in from the active edition below. So changing a hex
// value here recolors that whole edition.

export const PATHS = {
  // Eden Strong Women: soft blush and dusty rose, kept quiet so it reads
  // warm rather than "pink app". Sage keeps the garden feel.
  women: {
    ink: '#3A2B2F',     // deep berry-brown: text, dark buttons
    bg: '#FBF6F4',      // blush-white background
    bgWarm: '#F5EAE6',  // slightly deeper blush for alternating sections
    gold: '#B06F78',    // dusty rose: accents, links, highlights
    sage: '#A9B4A0',    // muted sage
    olive: '#6B7A62',   // deeper green
    rose: '#D9A5A5',    // soft rose
    mute: '#8C7571',    // supporting text
    line: '#EBDAD5',    // borders and dividers
  },

  // Eden Strong Men: charcoal, forest green, and leather brown.
  men: {
    ink: '#1E2428',     // charcoal
    bg: '#F1F0EC',      // cool stone
    bgWarm: '#E6E4DE',  // deeper stone
    gold: '#8C6239',    // leather / bronze
    sage: '#5E6B5A',    // olive drab
    olive: '#3B4A3F',   // deep forest
    rose: '#7A8A99',    // steel blue
    mute: '#686D6F',    // steel gray
    line: '#D4D2CC',
  },

  // Eden Strong Together: the original neutral ivory, forest, and gold.
  together: {
    ink: '#1F2A21',
    bg: '#F5EFE5',
    bgWarm: '#EFE7DA',
    gold: '#9B7B2E',
    sage: '#A8B5A0',
    olive: '#5C6B54',
    rose: '#D4A8A1',
    mute: '#7A6E5C',
    line: '#D9CFBE',
  },
};

// Shorter names some screens use (landing cards, edition label).
for (const p of Object.values(PATHS)) {
  p.canvas = p.bg;
  p.primary = p.gold;
  p.text = p.ink;
  p.surface = '#FFFFFF';
}

export const TYPE = {
  fontDisplay: "'Cormorant Garamond', Georgia, serif",
  fontBody: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
};

export const SPACE = { gutter: '1.125rem' };
export const RADIUS = { card: '1.25rem', control: '0.75rem' };

// The landing page (before anyone picks) uses the neutral Together look.
export const DEFAULT_PATH = 'together';

export function getTokens(path) {
  return PATHS[path] || PATHS[DEFAULT_PATH];
}
