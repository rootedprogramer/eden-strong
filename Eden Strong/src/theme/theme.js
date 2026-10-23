// theme.js
// Centralized design tokens for Eden Strong — Women / Men / Together.
// Screens must read colors, type, and spacing from here — never hard-code
// a hex value or px size in a component. This is what lets a member switch
// paths later without losing data or needing a different build.
//
// NOTE: these color values are sampled visually from the supplied logo per
// the brief — NOT approved production swatches. Swap PATHS.* colors for
// exact brand hex values once source artwork/vector logo is finalized.

export const PATHS = {
  women: {
    canvas: '#FAF7F3',
    primary: '#B77E78',   // dusty rose
    secondary: '#8D927B', // sage
    accent: '#E8C9C1',    // blush
    text: '#252721',
    surface: '#FFFFFF',
  },
  men: {
    canvas: '#F6F4EF',
    primary: '#34453A',   // deep forest
    secondary: '#89917D', // muted sage
    accent: '#A27D5B',    // bronze
    text: '#252721',
    surface: '#FFFFFF',
  },
  together: {
    canvas: '#F8F5F0',
    primary: '#49533D',   // deep olive
    secondary: '#B77E78', // dusty rose
    accent: '#A27D5B',    // bronze
    text: '#252721',
    surface: '#FFFFFF',
  },
};

// Mobile type scale, kept in rem so it respects the user's OS text-size setting.
export const TYPE = {
  pageTitle: { size: '1.75rem', lineHeight: 1.2 },
  sectionTitle: { size: '1.35rem', lineHeight: 1.25 },
  cardTitle: { size: '1.15rem', lineHeight: 1.3 },
  body: { size: '1rem', lineHeight: 1.5 },
  metadata: { size: '0.85rem', lineHeight: 1.4 },
  fontDisplay: "'Cormorant Garamond', serif", // campaign headings only
  fontBody: "'Inter', system-ui, sans-serif", // nav, forms, exercise names, data
};

// 8-point spacing scale
export const SPACE = {
  xs: '0.5rem',
  sm: '1rem',
  md: '1.5rem',
  lg: '2rem',
  xl: '3rem',
  gutter: '1.125rem',
};

export const RADIUS = {
  card: '1.25rem',
  control: '0.75rem',
};

export const TOUCH_TARGET_MIN = '44px';

// Eden Strong is for everyone, so an unset path falls back to the
// neutral Together palette.
export const DEFAULT_PATH = 'together';

export function getTokens(path) {
  return PATHS[path] || PATHS[DEFAULT_PATH];
}
