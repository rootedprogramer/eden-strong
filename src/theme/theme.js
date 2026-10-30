// theme.js
// One color palette per edition. Every screen reads its colors through the
// COLORS object in src/brand/tokens.js, which points at CSS variables that
// ThemeContext fills in from the active edition below. So changing a hex
// value here recolors that whole edition.

// Shared brand palette: Obsidian #171817, Charcoal #333633, Olive #656D56,
// Linen #D8CFC0, Ivory #F5F0E8, plus Dusty Mauve #987778 for Eden Strong.
export const PATHS = {
  // Eden Strong (women): ivory and linen with dusty mauve. Light.
  women: {
    dark: false,
    ink: '#171817',     // obsidian text and buttons
    bg: '#F5F0E8',      // ivory
    bgWarm: '#ECE4D9',  // soft linen for the header and nav
    surface: '#FFFDF9', // cards
    deep: '#2B2426',    // mauve-black feature panels
    gold: '#987778',    // dusty mauve accent
    goldTile: '#987778', // accent as a card background (white text on top)
    sage: '#8E9580',    // light olive
    olive: '#656D56',   // olive
    rose: '#C4A3A0',    // soft mauve
    mute: '#6F6762',
    line: '#E3D9CD',
  },

  // Faith Over Flesh (men): obsidian, charcoal, and stone. Dark.
  men: {
    dark: true,
    ink: '#F2EDE4',     // bone white text; buttons are bone with black text
    bg: '#0F0F0E',      // near-black
    bgWarm: '#171817',  // obsidian header and nav
    surface: '#1F201E', // charcoal cards
    deep: '#2A2B28',    // raised charcoal panels
    gold: '#D8CFC0',    // linen / stone accent
    goldTile: '#5C574E', // warm stone card (white text on top)
    sage: '#7D8470',    // muted olive
    olive: '#656D56',   // olive
    rose: '#A9A396',    // stone
    mute: '#A29C91',
    line: '#33342F',
  },

  // One Accord (couples): obsidian with olive and ivory. Dark.
  together: {
    dark: true,
    ink: '#F5F0E8',     // ivory text; buttons are ivory with dark text
    bg: '#121311',      // obsidian
    bgWarm: '#1A1C18',
    surface: '#22251F', // olive-charcoal cards
    deep: '#2E3328',    // deep olive panels
    gold: '#B9BE9E',    // light olive accent
    goldTile: '#4B5141', // deep olive card (white text on top)
    sage: '#8A9277',
    olive: '#656D56',
    rose: '#987778',    // dusty mauve, a small shared accent
    mute: '#B0A99C',
    line: '#363A31',
  },
};

// Shorter names some screens use (landing cards, edition label).
for (const p of Object.values(PATHS)) {
  p.canvas = p.bg;
  p.primary = p.gold;
  p.text = p.ink;
  
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
