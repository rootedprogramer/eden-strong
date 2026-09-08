// Eden Strong brand tokens
// Identity: garden/sanctuary meets quiet strength — devotional without heaviness,
// strong without aggression.

export const COLORS = {
  ink: '#1F2A21',      // deep forest — primary text/dark surfaces
  bg: '#F5EFE5',        // warm ivory — primary background
  bgWarm: '#EFE7DA',    // slightly deeper ivory for alternating sections
  gold: '#9B7B2E',      // aged gold — accents, CTAs, emphasis
  sage: '#A8B5A0',      // muted sage — secondary accent
  olive: '#5C6B54',     // deeper olive — "building strength" path
  rose: '#D4A8A1',      // dusty rose — reserved for the postpartum path
  mute: '#7A6E5C',      // muted brown-grey for supporting text
  line: '#D9CFBE',      // hairline borders/dividers
};

export const FONTS = {
  display: "'Cormorant Garamond', Georgia, serif", // headings, verses — literary, italic-friendly
  body: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
};

export const TAGLINE = 'Faith-rooted fitness and community for women in every season.';

export const PATHS = [
  {
    id: 'postpartum',
    title: 'Postpartum recovery',
    sub: 'Within 18 months of giving birth',
    color: COLORS.rose,
  },
  {
    id: 'mom',
    title: 'Motherhood',
    sub: 'Beyond postpartum, holding it all together',
    color: COLORS.gold,
  },
  {
    id: 'healing',
    title: 'Healing & rebuilding',
    sub: 'After surgery, injury, or time away',
    color: COLORS.sage,
  },
  {
    id: 'strength',
    title: 'Building strength',
    sub: 'For this season of growth',
    color: COLORS.olive,
  },
];

export const FOLLOW_UPS = {
  postpartum: {
    question: 'How long ago did you welcome your little one?',
    options: ['0–6 weeks', '6 weeks – 3 months', '3–6 months', '6–18 months'],
  },
  mom: {
    question: 'What feels most needed right now?',
    options: ['More energy', 'Strength', 'Stress relief', 'Just showing up consistently'],
  },
  healing: {
    question: 'Where are you in the healing process?',
    options: ['Just cleared for movement', 'A few weeks in', 'Rebuilding steadily', 'Nearly back to normal'],
  },
  strength: {
    question: "What's your training background?",
    options: ['New to strength training', 'Some experience', 'Returning after a break', 'Experienced, want structure'],
  },
};

export const VERSES = [
  {
    text: 'She is clothed with strength and dignity, and she laughs without fear of the future.',
    ref: 'PROVERBS 31:25',
  },
  {
    text: 'I can do all things through him who strengthens me.',
    ref: 'PHILIPPIANS 4:13',
  },
  {
    text: 'Be strong and courageous. Do not be afraid; do not be discouraged.',
    ref: 'JOSHUA 1:9',
  },
];
