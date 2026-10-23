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

export const TAGLINE = 'Faith-rooted fitness and community for men, women, and couples in every season.';

// ─── Editions ───────────────────────────────────────────────
// Eden Strong is three separate experiences under one roof. A member picks
// their edition on the landing page and only ever sees that edition's name,
// colors, goals, and community. (Colors per edition live in src/theme/theme.js.)
export const EDITIONS = {
  women: {
    id: 'women',
    name: 'Eden Strong Women',
    short: 'Women',
    pitch: 'Strength, rest, and faith for every season of womanhood.',
    community: 'Encouragement, prayer requests, and wins from women walking this with you.',
  },
  men: {
    id: 'men',
    name: 'Eden Strong Men',
    short: 'Men',
    pitch: 'Disciplined training and steady faith for the men others lean on.',
    community: 'Encouragement, prayer requests, and wins from men walking this with you.',
  },
  together: {
    id: 'together',
    name: 'Eden Strong Together',
    short: 'Together',
    pitch: 'Train, eat, and pray side by side as a couple.',
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
