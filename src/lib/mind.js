import { supabase } from './supabaseClient';
import { todayISO } from './workout';

// Renew: mental and emotional health. Check-ins and journal entries are private
// to each member; nobody else (admins included) can read them.

export const MOODS = [
  { value: 1, label: 'Struggling', color: '#8E6C88' },
  { value: 2, label: 'Low', color: '#A7889E' },
  { value: 3, label: 'Okay', color: '#B9A98C' },
  { value: 4, label: 'Good', color: '#8FA58A' },
  { value: 5, label: 'Great', color: '#6E8F6A' },
];
export const moodOf = (v) => MOODS.find((m) => m.value === v);

export const FEELINGS = ['Anxious', 'Stressed', 'Overwhelmed', 'Tired', 'Sad', 'Lonely', 'Angry', 'Afraid', 'Ashamed', 'Peaceful', 'Grateful', 'Hopeful', 'Joyful', 'Loved', 'Content'];

// Scripture for how I feel (KJV)
export const VERSES = {
  Anxious: [
    ['Be careful for nothing; but in every thing by prayer and supplication with thanksgiving let your requests be made known unto God. And the peace of God, which passeth all understanding, shall keep your hearts and minds through Christ Jesus.', 'Philippians 4:6-7'],
    ['Casting all your care upon him; for he careth for you.', '1 Peter 5:7'],
    ['Take therefore no thought for the morrow: for the morrow shall take thought for the things of itself.', 'Matthew 6:34'],
  ],
  Sad: [
    ['The LORD is nigh unto them that are of a broken heart; and saveth such as be of a contrite spirit.', 'Psalm 34:18'],
    ['Weeping may endure for a night, but joy cometh in the morning.', 'Psalm 30:5'],
    ['And God shall wipe away all tears from their eyes.', 'Revelation 21:4'],
  ],
  Lonely: [
    ['I will never leave thee, nor forsake thee.', 'Hebrews 13:5'],
    ['The LORD thy God, he it is that doth go with thee; he will not fail thee, nor forsake thee.', 'Deuteronomy 31:6'],
    ['God setteth the solitary in families.', 'Psalm 68:6'],
  ],
  Afraid: [
    ['Fear thou not; for I am with thee: be not dismayed; for I am thy God: I will strengthen thee; yea, I will help thee.', 'Isaiah 41:10'],
    ['For God hath not given us the spirit of fear; but of power, and of love, and of a sound mind.', '2 Timothy 1:7'],
    ['What time I am afraid, I will trust in thee.', 'Psalm 56:3'],
  ],
  Overwhelmed: [
    ['Come unto me, all ye that labour and are heavy laden, and I will give you rest.', 'Matthew 11:28'],
    ['When my heart is overwhelmed: lead me to the rock that is higher than I.', 'Psalm 61:2'],
    ['They that wait upon the LORD shall renew their strength; they shall mount up with wings as eagles; they shall run, and not be weary; and they shall walk, and not faint.', 'Isaiah 40:31'],
  ],
  Angry: [
    ['Be ye angry, and sin not: let not the sun go down upon your wrath.', 'Ephesians 4:26'],
    ['Let every man be swift to hear, slow to speak, slow to wrath.', 'James 1:19'],
    ['Commune with your own heart upon your bed, and be still.', 'Psalm 4:4'],
  ],
  Ashamed: [
    ['There is therefore now no condemnation to them which are in Christ Jesus.', 'Romans 8:1'],
    ['If we confess our sins, he is faithful and just to forgive us our sins, and to cleanse us from all unrighteousness.', '1 John 1:9'],
    ['As far as the east is from the west, so far hath he removed our transgressions from us.', 'Psalm 103:12'],
  ],
  Tired: [
    ['He giveth power to the faint; and to them that have no might he increaseth strength.', 'Isaiah 40:29'],
    ['My grace is sufficient for thee: for my strength is made perfect in weakness.', '2 Corinthians 12:9'],
    ['Let us not be weary in well doing: for in due season we shall reap, if we faint not.', 'Galatians 6:9'],
  ],
  Grateful: [
    ['O give thanks unto the LORD; for he is good: for his mercy endureth for ever.', 'Psalm 107:1'],
    ['In every thing give thanks: for this is the will of God in Christ Jesus concerning you.', '1 Thessalonians 5:18'],
    ['This is the day which the LORD hath made; we will rejoice and be glad in it.', 'Psalm 118:24'],
  ],
};
// Feelings that share a verse group
export const VERSE_GROUP = { Stressed: 'Overwhelmed', Peaceful: 'Grateful', Hopeful: 'Grateful', Joyful: 'Grateful', Loved: 'Grateful', Content: 'Grateful' };
export const versesFor = (feeling) => VERSES[feeling] || VERSES[VERSE_GROUP[feeling]] || [];

export const PROMPT_GROUPS = [
  { id: 'gratitude', title: 'Gratitude', prompts: [
    'Write three things you are thankful for today, big or small.',
    'Who has been kind to you lately? What did it mean to you?',
    'Where did you see God’s goodness this week?',
  ] },
  { id: 'lament', title: 'Honest with God', prompts: [
    'Like David in the Psalms, tell God plainly what hurts right now. Then end with one thing you still trust about Him.',
    'What are you carrying that you have not said out loud yet?',
    'What do you wish God would do? Write it as a prayer.',
  ] },
  { id: 'reflect', title: 'Reflection', prompts: [
    'What gave you energy today, and what drained it?',
    'When did you feel most like yourself this week?',
    'What is one thing you would do differently tomorrow, gently and without shame?',
  ] },
  { id: 'identity', title: 'Who God says I am', prompts: [
    'Write out Psalm 139:14 and what it means for how you see yourself today.',
    'What lie have you been believing about yourself? What is the truth?',
    'Write a short letter to yourself the way God might speak to you.',
  ] },
  { id: 'prayer', title: 'Prayer', prompts: [
    'Write a prayer for someone you love.',
    'Bring God the worries on your mind, one at a time.',
    'Thank God for one answered prayer, and ask for one new thing.',
  ] },
];

export const TOOLS = [
  { id: 'box', title: 'Box Breathing', sub: 'Steady, even breaths to calm your body', time: '1-2 min', tone: 'sage' },
  { id: 'breath-prayer', title: 'Breath Prayer', sub: 'Pray scripture as you breathe', time: '2 min', tone: 'gold' },
  { id: 'ground', title: '5-4-3-2-1 Grounding', sub: 'Come back to the present with your senses', time: '3 min', tone: 'olive' },
  { id: 'cares', title: 'Cast Your Cares', sub: 'Write your worries and give them to God', time: '5 min', tone: 'rose' },
  { id: 'reframe', title: 'Reframe a Thought', sub: 'Test an anxious thought against the truth', time: '5-10 min', tone: 'ink' },
  { id: 'body-scan', title: 'Body Scan', sub: 'Release tension from head to toe', time: '5 min', tone: 'sage' },
  { id: '478', title: '4-7-8 Breathing', sub: 'A slower breath for winding down and sleep', time: '1-2 min', tone: 'olive' },
];
export const toolOf = (id) => TOOLS.find((t) => t.id === id);

export const BREATH_PRAYERS = [
  ['Be still', 'and know that I am God', 'Psalm 46:10'],
  ['The Lord is my shepherd', 'I shall not want', 'Psalm 23:1'],
  ['When I am afraid', 'I will trust in thee', 'Psalm 56:3'],
  ['Thy grace', 'is sufficient for me', '2 Corinthians 12:9'],
  ['Create in me a clean heart', 'and renew a right spirit', 'Psalm 51:10'],
];

// ---- data ----
async function uid() {
  const { data } = await supabase.auth.getUser();
  return data?.user?.id || null;
}

export async function loadCheckins(days = 14) {
  const user = await uid();
  const since = new Date();
  since.setDate(since.getDate() - (days - 1));
  const sinceISO = `${since.getFullYear()}-${String(since.getMonth() + 1).padStart(2, '0')}-${String(since.getDate()).padStart(2, '0')}`;
  const { data } = await supabase.from('mind_checkins').select('*').eq('user_id', user).gte('check_date', sinceISO).order('check_date', { ascending: true });
  return data || [];
}

export async function saveCheckin({ mood, feelings, note }) {
  const user = await uid();
  return supabase.from('mind_checkins').upsert(
    { user_id: user, check_date: todayISO(), mood, feelings, note: note || null, updated_at: new Date().toISOString() },
    { onConflict: 'user_id,check_date' }
  );
}

export async function loadJournal(limit = 100) {
  const user = await uid();
  const { data } = await supabase.from('mind_journal').select('id, title, body, prompt, created_at').eq('user_id', user).order('created_at', { ascending: false }).limit(limit);
  return data || [];
}

export async function loadEntry(id) {
  const { data } = await supabase.from('mind_journal').select('*').eq('id', id).maybeSingle();
  return data;
}

export async function saveEntry({ id, title, body, prompt }) {
  const user = await uid();
  if (id) return supabase.from('mind_journal').update({ title: title || null, body, prompt: prompt || null, updated_at: new Date().toISOString() }).eq('id', id).select('id').single();
  return supabase.from('mind_journal').insert({ user_id: user, title: title || null, body, prompt: prompt || null }).select('id').single();
}

export async function deleteEntry(id) {
  return supabase.from('mind_journal').delete().eq('id', id);
}
