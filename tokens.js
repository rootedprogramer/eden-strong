// Brand tokens for the three communities: Eden Strong (women),
// Faith Over Flesh (men), and One Accord (couples)
// Identity: garden/sanctuary meets quiet strength — devotional without heaviness,
// strong without aggression.

// Colors come from the active edition's palette (src/theme/theme.js) via CSS
// variables, so the same screen looks right in Women, Men, and Together.
// The hex after each comma is a fallback for the first paint.
export const COLORS = {
  ink: 'var(--es-ink, #1F2A21)',       // text and dark buttons
  bg: 'var(--es-bg, #F5EFE5)',         // primary background
  bgWarm: 'var(--es-bgWarm, #EFE7DA)', // alternating sections
  gold: 'var(--es-gold, #9B7B2E)',     // accents, links, highlights
  sage: 'var(--es-sage, #A8B5A0)',     // secondary accent
  olive: 'var(--es-olive, #5C6B54)',
  rose: 'var(--es-rose, #D4A8A1)',
  mute: 'var(--es-mute, #7A6E5C)',     // supporting text
  line: 'var(--es-line, #D9CFBE)',     // borders and dividers
  surface: 'var(--es-surface, #FFFFFF)', // cards and inputs
  deep: 'var(--es-deep, #171817)',     // dark feature panels (devotion card, habits)
  goldTile: 'var(--es-goldTile, #987778)', // accent color as a card background
};

// Background for a placeholder block by tone name. 'ink' maps to the dark
// panel color so white text stays readable in every brand's theme.
export function toneColor(tone) {
  if (!tone || tone === 'ink') return COLORS.deep;
  if (tone === 'gold') return COLORS.goldTile;
  return COLORS[tone] || COLORS.deep;
}

// A see-through version of a color, e.g. tint(COLORS.gold, 10) for a 10% wash.
export function tint(color, percent) {
  return `color-mix(in srgb, ${color} ${percent}%, transparent)`;
}

export const FONTS = {
  display: "'Cormorant Garamond', Georgia, serif", // headings and verses: elegant, timeless, biblical
  body: "'Montserrat', -apple-system, BlinkMacSystemFont, sans-serif", // everything else: clean, modern, strong
  brand: "'Cinzel', 'Cormorant Garamond', Georgia, serif", // brand names and small spaced labels
  script: "'Allura', 'Brush Script MT', cursive", // personal accent lines: "She is Eden Strong."
};

export const TAGLINE = 'One mission. Three expressions. A shared foundation in Christ.';

// ─── Editions (each one is its own brand) ───────────────────
// Three separate communities, housed in one site for now. Each will become
// its own app later, so everything brand-specific lives here: name,
// wordmark, audience, tagline, and copy. (Colors are in src/theme/theme.js.)
export const EDITIONS = {
  women: {
    id: 'women',
    name: 'Eden Strong',
    wordmark: ['Eden', 'Strong'],
    monogram: ['E', 'S'],
    pillars: 'Faith / Fitness / Purpose',
    script: 'She is Eden Strong.',
    verse: { text: 'Commit to the Lord whatever you do, and he will establish your plans.', ref: 'Proverbs 16:3' },
    welcomeImage: '/brand/eden-strong-welcome.jpg',
    card: { bg: '#987778', ink: '#F5F0E8' },
    audience: 'For women',
    short: 'Women',
    tagline: 'Faith-rooted fitness for women in every season.',
    pitch: 'Faith-led wellness and strength.',
    community: 'Encouragement, prayer requests, and wins from women walking this with you.',
  },
  men: {
    id: 'men',
    name: 'Faith Over Flesh',
    wordmark: ['Faith Over', 'Flesh'],
    monogram: ['F', 'F'],
    pillars: 'Stronger than yesterday',
    script: 'Discipline builds freedom.',
    verse: { text: 'For the Spirit God gave us does not make us timid, but gives us power, love and self-discipline.', ref: '2 Timothy 1:7' },
    welcomeImage: '/brand/faith-over-flesh-welcome.jpg',
    card: { bg: '#171817', ink: '#F2EDE4' },
    audience: 'For men',
    short: 'Men',
    tagline: 'Disciplined training and steady faith for men.',
    pitch: 'Discipline, strength, and faith.',
    community: 'Encouragement, prayer requests, and wins from men walking this with you.',
  },
  together: {
    id: 'together',
    name: 'One Accord',
    wordmark: ['One', 'Accord'],
    monogram: ['O', 'A'],
    pillars: 'United in Christ. Stronger together.',
    script: 'Two hearts. One foundation. One purpose.',
    verse: { text: 'Two are better than one, because they have a good reward for their toil.', ref: 'Ecclesiastes 4:9' },
    welcomeImage: null,
    card: { bg: '#656D56', ink: '#F5F0E8' },
    audience: 'For couples',
    short: 'Couples',
    tagline: 'Train, eat, and pray side by side as a couple.',
    pitch: 'Growing in Christ together.',
    community: 'Encouragement, prayer requests, and wins from couples walking this with you.',
  },
};

export const EDITION_LIST = [EDITIONS.women, EDITIONS.men, EDITIONS.together];

export function getEdition(id) {
  return EDITIONS[id] || null;
}

// Remembers which edition someone picked on the landing page, so it survives
// the trip through sign-up (and an email-confirmation link, if that's on).
const EDITION_KEY = 'edenstrong.edition';
export function rememberEdition(id) {
  try { localStorage.setItem(EDITION_KEY, id); } catch {}
}
export function recallEdition() {
  try { return localStorage.getItem(EDITION_KEY); } catch { return null; }
}

// ─── Goals inside each edition ──────────────────────────────
// Stored in user_profiles.path. Women keeps the original four.
// Men and Together are DRAFTS — edit titles, subtitles, and follow-ups freely.
export const GOALS = {
  women: [
    { id: 'postpartum', title: 'Postpartum recovery', sub: 'Within 18 months of giving birth', color: COLORS.rose },
    { id: 'mom', title: 'Motherhood', sub: 'Beyond postpartum, holding it all together', color: COLORS.gold },
    { id: 'healing', title: 'Healing & rebuilding', sub: 'After surgery, injury, or time away', color: COLORS.sage },
    { id: 'strength', title: 'Building strength', sub: 'For this season of growth', color: COLORS.olive },
  ],
  men: [
    { id: 'men_strength', title: 'Building strength', sub: 'Structured lifting and real progress', color: COLORS.olive },
    { id: 'men_return', title: 'Getting back in shape', sub: 'Returning after time away', color: COLORS.gold },
    { id: 'men_family', title: 'Strong for my family', sub: 'Energy and health for the people counting on you', color: COLORS.sage },
    { id: 'men_healing', title: 'Healing & rebuilding', sub: 'After surgery, injury, or a hard season', color: COLORS.rose },
  ],
  together: [
    { id: 'tog_train', title: 'Training together', sub: 'Workouts you do side by side', color: COLORS.olive },
    { id: 'tog_habits', title: 'Healthy habits as a team', sub: 'Food, sleep, and routines you share', color: COLORS.gold },
    { id: 'tog_faith', title: 'Growing in faith together', sub: 'Devotions and prayer as a couple', color: COLORS.sage },
    { id: 'tog_season', title: 'A new season', sub: 'Newlyweds, new parents, or starting over', color: COLORS.rose },
  ],
};

export function findGoal(goalId) {
  for (const list of Object.values(GOALS)) {
    const g = list.find((x) => x.id === goalId);
    if (g) return g;
  }
  return null;
}

export const FOLLOW_UPS = {
  // Women
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
  // Men (draft)
  men_strength: {
    question: "What's your training background?",
    options: ['New to lifting', 'Some experience', 'Lifted for years', 'Experienced, want structure'],
  },
  men_return: {
    question: 'How long has it been?',
    options: ['A few months', 'About a year', 'Several years', 'Honestly, never really started'],
  },
  men_family: {
    question: 'What would help most right now?',
    options: ['More energy', 'Losing weight', 'Less stress', 'Showing up consistently'],
  },
  men_healing: {
    question: 'Where are you in the healing process?',
    options: ['Just cleared for movement', 'A few weeks in', 'Rebuilding steadily', 'Nearly back to normal'],
  },
  // Together (draft)
  tog_train: {
    question: 'How do you two train right now?',
    options: ["We don't yet", 'One of us does', 'Sometimes together', 'Regularly together'],
  },
  tog_habits: {
    question: 'Where do you want to start?',
    options: ['Eating better', 'Better sleep', 'Moving more', 'A shared daily rhythm'],
  },
  tog_faith: {
    question: 'How often do you pray or read together?',
    options: ['Not yet', 'Once in a while', 'Weekly', 'Most days'],
  },
  tog_season: {
    question: 'Which season are you in?',
    options: ['Newly married', 'New parents', 'Busy family years', 'Starting over together'],
  },
};

export const VERSES = [
  {
    text: 'Those who hope in the Lord will renew their strength.',
    ref: 'ISAIAH 40:31',
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

// ─── Home page tiles ────────────────────────────────────────
// The big cards on the home page. Each one shows a solid color block until
// you add a photo: drop the image in /public/home/ and set image to its path,
// e.g. image: '/home/programs.jpg'. tone picks the placeholder color.
export const HOME_TILES = [
  { id: 'programs', title: 'Programs', sub: 'Beginner and experienced', to: '/dashboard/program', image: null, tone: 'ink' },
  { id: 'nutrition', title: 'Nutrition', sub: 'Recipes and meal plans', to: '/dashboard/nutrition/recipes', image: null, tone: 'olive' },
  { id: 'devotions', title: 'Devotions', sub: 'Scripture and reflection for every day', to: '/dashboard/devotion', image: null, tone: 'gold' },
  { id: 'community', title: 'Community', sub: 'Encouragement, prayer, and wins', to: '/dashboard/community', image: null, tone: 'sage' },
  { id: 'coaches', title: 'Meet your coaches', sub: 'Lex and John', to: '/dashboard/coaches', image: null, tone: 'ink' },
];

// Shown in the "Questions?" card at the bottom of the home page.
// Leave empty to point people to the Community tab instead.
export const SUPPORT_EMAIL = '';

// ─── Programs pages ─────────────────────────────────────────
// Photos for the Programs flow. Put images in /public/programs/ and set the
// path here, e.g. gym: '/programs/gym.jpg'. Until then each card shows a
// solid color block. tone picks that color.
export const PROGRAM_TILES = {
  gym: { title: 'Gym', image: null, tone: 'ink' },
  home: { title: 'Home', image: null, tone: 'olive' },
  beginner: { title: 'Beginner', image: null, tone: 'sage' },
  experienced: { title: 'Experienced', image: null, tone: 'ink' },
};
export const LEVEL_ORDER = ['beginner', 'experienced'];
export const LEVEL_BLURBS = {
  beginner: 'New to training, or coming back after time away.',
  experienced: 'Comfortable in the gym and ready to push.',
};
// Cards for each program on the program-selection page. Add a photo path to
// image when you have one, e.g. '/programs/grit-and-glory.jpg'.
export const TRACK_TILES = {
  'Rooted & Rising': { image: null, tone: 'sage' },
  'Vessel & Valor': { image: null, tone: 'olive' },
  'Grit & Glory': { image: null, tone: 'ink' },
  'Strong & Steadfast': { image: null, tone: 'gold' },
  'Iron Sharpens Iron': { image: null, tone: 'ink' },
};
// Placeholder colors for the sessions-per-week cards, in order
export const SESSION_TONES = ['olive', 'gold', 'ink', 'sage'];
