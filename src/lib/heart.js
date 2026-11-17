import { supabase } from './supabaseClient';

// Heart Work: guided emotional-health lessons inside Renew.
// Content lives here; each member's progress is private (heart_progress).

export const PATHS = [
  { id: 'emotions', title: 'Understanding Your Emotions', sub: 'Notice, name, and respond to what you feel', tone: 'sage' },
  { id: 'boundaries', title: 'Boundaries & Healthy Relationships', sub: 'Love others well without losing yourself', tone: 'gold' },
  { id: 'healing', title: 'Forgiveness, Grief & Healing', sub: 'Make room for hurt, loss, and God’s repair', tone: 'rose' },
  { id: 'worth', title: 'Self-Worth, Rest & Burnout', sub: 'Live from God’s love, not for approval', tone: 'olive' },
];
export const pathOf = (id) => PATHS.find((p) => p.id === id);

// Each lesson: a short read, scripture, one practice, and reflection questions.
export const LESSONS = [
  // ---------- Understanding your emotions ----------
  {
    slug: 'emotions-are-not-the-enemy', path: 'emotions', title: 'Emotions Are Not the Enemy', minutes: 5,
    verse: 'Jesus wept.', ref: 'John 11:35',
    read: [
      ['God made you to feel', 'Jesus wept at His friend’s grave. He was angry in the temple, moved with compassion for crowds, and overwhelmed with sorrow in the garden. Feeling deeply is not weakness or a lack of faith. It is part of being made in God’s image.'],
      ['Feelings are signals, not commands', 'An emotion is like a light on a car’s dashboard. It tells you something needs attention: a loss, a need, a threat, a hope. It doesn’t tell you what to do. You can listen to a feeling without obeying it.'],
      ['What happens when we push them down', 'Stuffed feelings don’t disappear. They tend to leak out as irritability, numbness, tension, trouble sleeping, or reacting bigger than a moment calls for. Bringing them into the light, to God and to safe people, is how they lose their grip.'],
    ],
    practice: { title: 'A one-minute check-in', steps: ['Pause and take one slow breath.', 'Ask yourself: “What am I feeling right now?”', 'Notice where you feel it in your body: chest, stomach, jaw, shoulders.', 'Tell God plainly: “Lord, I feel ___.” No fixing yet, just honesty.'] },
    reflect: ['Which emotions were welcome in the home you grew up in, and which were not?', 'Which feeling do you find hardest to admit, even to yourself?', 'What would change if you believed God welcomes all of your feelings?'],
  },
  {
    slug: 'name-it', path: 'emotions', title: 'Name It to Tame It', minutes: 5,
    verse: 'Search me, O God, and know my heart: try me, and know my thoughts.', ref: 'Psalm 139:23',
    read: [
      ['Why naming helps', 'Putting a feeling into words tends to turn down its intensity. “I feel bad” is hard to work with. “I feel disappointed and a little embarrassed” points toward what you actually need.'],
      ['Go one layer deeper', 'Most of us use a handful of words: fine, stressed, mad, tired. Try getting more specific. Mad might really be hurt, disrespected, or jealous. Stressed might be overwhelmed, anxious, or unprepared.'],
      ['More than one at a time', 'You can feel grateful and grieving, excited and afraid, all at once. Mixed feelings are normal, not a sign that something is wrong with you.'],
    ],
    practice: { title: 'Use the Feelings Wheel', steps: ['Open Name Your Feeling in Renew’s tools.', 'Pick the big feeling closest to what you notice.', 'Then pick the more specific word that fits best.', 'Say the full sentence out loud: “I feel ___ because ___.”'] },
    reflect: ['What is one word you lean on too often (like fine, tired, or stressed)?', 'Think of a recent hard moment. What were the more specific feelings underneath?', 'What do you notice when you name a feeling exactly?'],
    tool: 'feelings',
  },
  {
    slug: 'whats-underneath', path: 'emotions', title: 'What’s Underneath', minutes: 6,
    verse: 'Counsel in the heart of man is like deep water; but a man of understanding will draw it out.', ref: 'Proverbs 20:5',
    read: [
      ['Surface and depth', 'Some emotions sit on top of others. Anger often protects something softer: hurt, fear, shame, or exhaustion. Irritability can be hunger, loneliness, or too little sleep.'],
      ['Triggers', 'A trigger is a moment that hits an old bruise, so the reaction is bigger than the moment. Noticing your triggers isn’t blaming yourself. It helps you understand yourself with compassion.'],
      ['Every feeling points to a need', 'Under most emotions is a need: rest, comfort, safety, respect, connection, or clarity. When you can name the need, you can ask God and others for help with it.'],
    ],
    practice: { title: 'The iceberg', steps: ['Write the feeling you showed on the outside (for example, snapping at someone).', 'Ask: “What was I feeling under that?” Write one or two words.', 'Ask: “What did I need in that moment?”', 'Pick one small, healthy way to meet that need today.'] },
    reflect: ['When you get angry, what softer feeling is usually underneath?', 'What situations tend to trigger you? What might they remind you of?', 'What need of yours most often goes unmet?'],
  },
  {
    slug: 'respond-dont-react', path: 'emotions', title: 'Respond, Don’t React', minutes: 5,
    verse: 'Let every man be swift to hear, slow to speak, slow to wrath.', ref: 'James 1:19',
    read: [
      ['The space in between', 'Between what happens and what you do, there is a space. Even a few seconds of it lets you choose instead of react. That space can be practiced and grown.'],
      ['Your body first', 'When emotions run high, your body goes into protect mode: fast heart, tight chest, narrow focus. Calming the body first, with a slow breath or a short walk, makes it easier to think and pray clearly.'],
      ['Grace when you blow it', 'You will still react sometimes. When you do, own it, apologize where needed, and try again. Repair is part of emotional health too.'],
    ],
    practice: { title: 'P.A.U.S.E.', steps: ['Pause: stop before you speak or send.', 'Assess: “What am I feeling? How strong is it, 1 to 10?”', 'Unclench: drop your shoulders, relax your jaw, take three slow breaths.', 'Seek God: a one-line prayer, like “Lord, give me wisdom.”', 'Engage: respond with what you actually want to say.'] },
    reflect: ['Where do you react most quickly: with kids, a spouse, at work, online?', 'What helps your body calm down fastest?', 'Is there a reaction you need to repair with someone this week?'],
  },
  // ---------- Boundaries ----------
  {
    slug: 'what-boundaries-are', path: 'boundaries', title: 'What Boundaries Really Are', minutes: 6,
    verse: 'And he withdrew himself into the wilderness, and prayed.', ref: 'Luke 5:16',
    read: [
      ['Jesus had limits', 'Crowds needed Him, and He still stepped away to pray and rest. He said no to some requests and yes to others. Limits are not selfish. They protect what God has asked you to steward.'],
      ['About you, not controlling others', 'A boundary isn’t “You must stop.” It’s “If this happens, here is what I will do.” You can’t control other people’s choices. You can decide what you will allow, give, and take part in.'],
      ['Love and limits go together', 'Healthy boundaries actually make love sustainable. Without them, many caring people end up resentful, exhausted, or quietly bitter.'],
    ],
    practice: { title: 'Find one boundary', steps: ['Think of a place where you often feel drained or resentful.', 'Ask: “What am I saying yes to that I need to say no to?”', 'Write one boundary as “I will…” (for example, “I will not answer work messages after 8 p.m.”).', 'Pray over it, then decide when you’ll start.'] },
    reflect: ['Where in your life do you feel most stretched thin?', 'What makes saying no hard for you?', 'What might God be asking you to protect right now?'],
  },
  {
    slug: 'saying-no-with-grace', path: 'boundaries', title: 'Saying No with Grace', minutes: 5,
    verse: 'But let your communication be, Yea, yea; Nay, nay.', ref: 'Matthew 5:37',
    read: [
      ['A clear no is kind', 'A vague “maybe” leaves people waiting and leaves you anxious. A clear, warm no respects everyone’s time.'],
      ['You don’t owe a long explanation', 'Over-explaining often invites debate. A short reason, or none at all, is enough.'],
      ['Expect some discomfort', 'Other people may be disappointed at first, and that’s okay. Their feelings are real, and you can be kind about them without changing your answer.'],
    ],
    practice: { title: 'Words to try', steps: ['“Thank you for thinking of me. I can’t take that on right now.”', '“That doesn’t work for me, but I could do ___ instead.”', '“Let me pray about it and get back to you by Friday.”', '“I’m not able to, but I hope it goes well.”', 'Pick one and practice saying it out loud.'] },
    reflect: ['Who is hardest for you to say no to? Why do you think that is?', 'What do you fear will happen if you say no?', 'What would you gain by saying no to one thing this week?'],
  },
  {
    slug: 'healthy-or-unhealthy', path: 'boundaries', title: 'Healthy or Unhealthy?', minutes: 7,
    verse: 'Charity suffereth long, and is kind; charity envieth not… seeketh not her own, is not easily provoked, thinketh no evil.', ref: '1 Corinthians 13:4-5',
    read: [
      ['Signs of a healthy relationship', 'You can be honest without fear. Disagreements get worked through, not punished. Both people apologize. You keep your friendships, faith, and interests. Love looks like 1 Corinthians 13: patient, kind, not controlling.'],
      ['Warning signs', 'Constant criticism or put-downs, controlling money, phone, or who you see, extreme jealousy, threats, pressure that ignores your no, or feeling like you walk on eggshells. These are not normal parts of love.'],
      ['Your safety matters to God', 'If anyone hurts you, threatens you, or makes you afraid, that is abuse, and it is not your fault. You don’t have to figure it out alone. In the U.S., the National Domestic Violence Hotline is free, confidential, and open 24/7: call 1-800-799-7233 or text START to 88788. If you are in danger right now, call 911.'],
    ],
    practice: { title: 'A gentle look at your relationships', steps: ['Think of the closest relationships in your life.', 'For each, ask: “Do I feel safe being honest here?”', 'Notice which ones leave you feeling more like yourself, and which leave you smaller.', 'If something worries you, tell one trusted person or call the hotline to talk it through.'] },
    reflect: ['Which relationship in your life feels the healthiest? What makes it that way?', 'Is there a relationship where you feel afraid to be honest?', 'Who is a safe person you could talk to about it?'],
  },
  {
    slug: 'hard-conversations', path: 'boundaries', title: 'Speaking the Truth in Love', minutes: 6,
    verse: 'But speaking the truth in love, may grow up into him in all things.', ref: 'Ephesians 4:15',
    read: [
      ['Truth and love together', 'Truth without love wounds. Love without truth avoids. Healthy relationships need both: honest words, said with care.'],
      ['“I” instead of “you”', '“You never help” starts a fight. “I feel overwhelmed in the evenings, and I need help with bedtime” starts a conversation. Speak to your experience and your need.'],
      ['Timing and tone', 'Hard talks go better when you’re both calm, fed, and not rushed. Lower your voice, sit side by side, and listen as much as you speak.'],
    ],
    practice: { title: 'Plan the conversation', steps: ['Name the issue in one sentence.', 'Fill in: “When ___ happens, I feel ___, and I need ___.”', 'Write one question to ask so you understand their side.', 'Pray for both of you before you talk.'] },
    reflect: ['Is there a conversation you’ve been avoiding? What makes it scary?', 'Do you tend to lean more toward truth or toward keeping the peace?', 'What would “truth in love” sound like in that conversation?'],
  },
  // ---------- Healing ----------
  {
    slug: 'what-forgiveness-is', path: 'healing', title: 'What Forgiveness Is (and Isn’t)', minutes: 7,
    verse: 'Forbearing one another, and forgiving one another… even as Christ forgave you, so also do ye.', ref: 'Colossians 3:13',
    read: [
      ['Forgiveness is release', 'Forgiving means letting go of your right to get even and handing the debt to God. It frees you from carrying the hurt as your job to settle.'],
      ['What forgiveness is not', 'It is not saying what happened was okay. It is not forgetting. It does not mean trusting someone again right away, and it never means staying somewhere unsafe. Reconciliation takes two people; forgiveness can start with one.'],
      ['Often a process', 'Deep hurts are usually forgiven again and again as memories and feelings come back. That isn’t failure. Each time, you hand it to God once more.'],
    ],
    practice: { title: 'A forgiveness prayer', steps: ['Name the person and exactly what they did, honestly.', 'Name how it hurt you and what it cost you.', 'Pray: “Lord, I release ___ to You. I choose not to carry this debt. Heal what it broke in me.”', 'Decide separately whether any boundary is still needed to keep you safe.'] },
    reflect: ['Is there someone you have been holding a debt against?', 'What have you believed forgiveness would require of you?', 'What might be different for you if you began to release it?'],
  },
  {
    slug: 'forgiving-yourself', path: 'healing', title: 'Receiving Grace for Yourself', minutes: 5,
    verse: 'If we confess our sins, he is faithful and just to forgive us our sins, and to cleanse us from all unrighteousness.', ref: '1 John 1:9',
    read: [
      ['Guilt and shame are different', 'Guilt says, “I did something wrong.” It can lead you to confess and repair. Shame says, “I am something wrong.” It leads you to hide. God deals with your guilt through the cross, and He doesn’t ask you to live under shame.'],
      ['Already paid', 'Replaying a confessed sin over and over can feel humble, but it can quietly say Jesus’ forgiveness wasn’t enough. Receive what He has already given.'],
      ['Learn and move forward', 'Make things right where you can. Then let your mistake become wisdom instead of a weight.'],
    ],
    practice: { title: 'Lay it down', steps: ['Write the thing you keep punishing yourself for.', 'Confess it to God in your own words.', 'Read 1 John 1:9 out loud, and put your name in it.', 'Write one thing you learned, then close the page.'] },
    reflect: ['What mistake do you replay most?', 'What does shame tell you about yourself? What does God say instead?', 'Is there anything you still need to make right with someone?'],
  },
  {
    slug: 'grief', path: 'healing', title: 'Making Room for Grief', minutes: 7,
    verse: 'Blessed are they that mourn: for they shall be comforted.', ref: 'Matthew 5:4',
    read: [
      ['Grief is love with nowhere to go', 'We grieve because something mattered: a person, a marriage, a dream, a pregnancy, health, a season of life. Grief is not a lack of faith. Jesus Himself was called a man of sorrows.'],
      ['There is no right timeline', 'Grief comes in waves, not neat stages. You may feel okay for weeks and then be undone by a song or a date. That is normal.'],
      ['When to reach out', 'If grief keeps you from getting through daily life for a long time, or you have thoughts of not wanting to live, please talk to a doctor or counselor, or call or text 988. Support in grief is wise, not weak.'],
    ],
    practice: { title: 'A gentle grief practice', steps: ['Name what you have lost, out loud or on paper.', 'Write one memory you are thankful for.', 'Write one thing you miss.', 'Tell God how it feels, and ask Him to be near.'] },
    reflect: ['What losses have you not let yourself grieve?', 'What helps you when a wave of grief comes?', 'Who could walk with you in it?'],
  },
  {
    slug: 'healing-takes-time', path: 'healing', title: 'Healing Takes Time', minutes: 5,
    verse: 'He healeth the broken in heart, and bindeth up their wounds.', ref: 'Psalm 147:3',
    read: [
      ['God is patient with healing', 'Wounds heal from the inside out, and they need care, not picking at. God doesn’t rush you, and you don’t have to rush yourself.'],
      ['Healing happens in community', 'God often heals through people: a friend who listens, a pastor who prays, a counselor trained to help with trauma. Getting help is one of the ways He binds up wounds.'],
      ['Notice small progress', 'You might react a little less, sleep a little better, or talk about something without falling apart. Those are real signs of healing. Celebrate them.'],
    ],
    practice: { title: 'Look back with kindness', steps: ['Think about where you were a year ago.', 'Write three ways you have grown or healed since then, even small ones.', 'Thank God for each one.', 'Write one next step toward healing, like a call to make or a habit to start.'] },
    reflect: ['What wound are you still waiting to see healed?', 'What has helped you heal in the past?', 'What next step feels possible this month?'],
  },
  // ---------- Worth, rest & burnout ----------
  {
    slug: 'worth-not-earned', path: 'worth', title: 'Your Worth Isn’t Earned', minutes: 5,
    verse: 'For we are his workmanship, created in Christ Jesus unto good works.', ref: 'Ephesians 2:10',
    read: [
      ['Workmanship, not a project', 'You are God’s handiwork, His masterpiece. Your value was settled before you accomplished anything, and it doesn’t rise or fall with your productivity, your weight, or anyone’s approval.'],
      ['Performance traps', 'Many of us try to earn love by being helpful, impressive, or perfect. It works for a while and leaves us exhausted and afraid of failing.'],
      ['Living from love', 'When you know you are loved, you can serve, work, and rest from a full heart instead of an empty one.'],
    ],
    practice: { title: 'Who God says I am', steps: ['Write: “I am loved” (Jeremiah 31:3).', 'Write: “I am fearfully and wonderfully made” (Psalm 139:14).', 'Write: “I am God’s workmanship” (Ephesians 2:10).', 'Read them out loud each morning this week.'] },
    reflect: ['Where do you try hardest to prove your worth?', 'What would you do differently if you truly believed your worth was settled?', 'Which truth above is hardest for you to believe?'],
  },
  {
    slug: 'comparison', path: 'worth', title: 'Breaking Free from Comparison', minutes: 5,
    verse: 'But let every man prove his own work, and then shall he have rejoicing in himself alone, and not in another.', ref: 'Galatians 6:4',
    read: [
      ['Highlight reels', 'We compare our behind-the-scenes with everyone else’s best moments. It’s never a fair fight, and it steals joy from both of you.'],
      ['Your own race', 'God gave you a specific body, story, family, and calling. Someone else’s season isn’t a measuring stick for yours.'],
      ['Gratitude is the antidote', 'Comparison asks, “What don’t I have?” Gratitude asks, “What has God given me?” The second question changes how the first one feels.'],
    ],
    practice: { title: 'A comparison detox', steps: ['Notice which accounts or situations make you feel “less than.”', 'Mute or unfollow a few for a week.', 'Each time comparison shows up, name one thing you’re thankful for.', 'Bless the person you compared yourself to with a short prayer.'] },
    reflect: ['Who or what do you compare yourself to most?', 'How do you usually feel after scrolling social media?', 'What is one gift in your life you’ve overlooked?'],
  },
  {
    slug: 'burnout', path: 'worth', title: 'Signs of Burnout', minutes: 6,
    verse: 'And as he lay and slept under a juniper tree, behold, then an angel touched him, and said unto him, Arise and eat.', ref: '1 Kings 19:5',
    read: [
      ['Even prophets burn out', 'After a huge victory, Elijah collapsed in exhaustion and despair. God’s first answer wasn’t a lecture. It was sleep, food, and gentle care. Then He spoke.'],
      ['Common signs', 'Feeling exhausted even after rest, dreading things you used to enjoy, feeling numb or cynical, getting easily irritated, trouble concentrating, or getting sick more often.'],
      ['Start with the body', 'Like Elijah, start with sleep, nourishing food, water, and time away. If exhaustion doesn’t lift, see your doctor to rule out physical causes like low iron, thyroid issues, or depression.'],
    ],
    practice: { title: 'A burnout check', steps: ['Rate your energy this week, 1 to 10.', 'List what drains you most and what refills you most.', 'Choose one drain to reduce and one refill to add this week.', 'Tell someone you trust how you’re really doing.'] },
    reflect: ['Which signs of burnout do you recognize in yourself?', 'What do you need most right now: sleep, help, rest, or something else?', 'What would it look like to let God care for you like He did for Elijah?'],
  },
  {
    slug: 'rest', path: 'worth', title: 'Rest Is Holy', minutes: 5,
    verse: 'The sabbath was made for man, and not man for the sabbath.', ref: 'Mark 2:27',
    read: [
      ['Rest is a gift, not a reward', 'God rested on the seventh day, not because He was tired, but to show us a rhythm. Rest isn’t something you earn after everything is done. Everything is never done.'],
      ['Rest is trust', 'Stopping says, “God holds the world, and I don’t have to.” That makes rest an act of faith.'],
      ['Real rest', 'Scrolling isn’t always rest. Real rest refills you: sleep, unhurried time with God, time outside, play, meals with people you love.'],
    ],
    practice: { title: 'Plan a sabbath', steps: ['Pick a block of time this week, even just a few hours.', 'Decide what you will stop: work, chores, errands, screens.', 'Choose what will refill you: worship, nature, a nap, family.', 'Guard it like an appointment with God, because it is.'] },
    reflect: ['When did you last truly rest?', 'What makes rest hard for you?', 'What would a weekly sabbath look like in this season of your life?'],
  },
];
export const lessonOf = (slug) => LESSONS.find((l) => l.slug === slug);
export const lessonsIn = (path) => LESSONS.filter((l) => l.path === path);

// Feelings Wheel: a big feeling, then a more specific word.
export const WHEEL = [
  { core: 'Glad', color: '#C9A75A', verses: 'Grateful', words: ['Hopeful', 'Grateful', 'Proud', 'Excited', 'Content', 'Playful', 'Confident'] },
  { core: 'Sad', color: '#8C93A8', verses: 'Sad', words: ['Lonely', 'Disappointed', 'Hurt', 'Grieving', 'Discouraged', 'Empty', 'Homesick'] },
  { core: 'Afraid', color: '#9A8FB0', verses: 'Afraid', words: ['Anxious', 'Worried', 'Insecure', 'Overwhelmed', 'Rejected', 'Helpless', 'Nervous'] },
  { core: 'Angry', color: '#B27A6E', verses: 'Angry', words: ['Frustrated', 'Resentful', 'Jealous', 'Irritated', 'Betrayed', 'Bitter', 'Disrespected'] },
  { core: 'Ashamed', color: '#A0897A', verses: 'Ashamed', words: ['Guilty', 'Embarrassed', 'Inadequate', 'Exposed', 'Regretful', 'Unworthy', 'Foolish'] },
  { core: 'Peaceful', color: '#7F9C86', verses: 'Grateful', words: ['Calm', 'Safe', 'Loved', 'Rested', 'Trusting', 'Thankful', 'Secure'] },
];
// Specific words with their own verse group
export const WORD_VERSES = { Lonely: 'Lonely', Anxious: 'Anxious', Worried: 'Anxious', Overwhelmed: 'Overwhelmed', Guilty: 'Ashamed', Grieving: 'Sad' };
export const NEEDS = ['Rest', 'Comfort', 'Connection', 'Safety', 'To be heard', 'Clarity', 'Help', 'Forgiveness', 'Space', 'Encouragement'];

// ---- progress ----
async function uid() {
  const { data } = await supabase.auth.getUser();
  return data?.user?.id || null;
}
export async function loadProgress() {
  const user = await uid();
  const { data } = await supabase.from('heart_progress').select('lesson_slug').eq('user_id', user);
  return new Set((data || []).map((r) => r.lesson_slug));
}
export async function markDone(slug, done = true) {
  const user = await uid();
  if (done) return supabase.from('heart_progress').upsert({ user_id: user, lesson_slug: slug }, { onConflict: 'user_id,lesson_slug' });
  return supabase.from('heart_progress').delete().eq('user_id', user).eq('lesson_slug', slug);
}
