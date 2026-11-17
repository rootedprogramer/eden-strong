import { useEffect, useRef, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { Plus, X } from 'lucide-react';
import { COLORS, FONTS, tint } from '../../../brand/tokens';
import SubHeader from '../../../components/SubHeader';
import { ding, primeDing } from '../../../lib/ding';
import { BREATH_PRAYERS, FEELINGS, saveEntry, toolOf, versesFor } from '../../../lib/mind';

export default function MindTool() {
  const { id } = useParams();
  const tool = toolOf(id);
  if (!tool) return <Navigate to="/dashboard/mind" replace />;
  const Body = {
    box: BoxBreathing, '478': FourSevenEight, 'breath-prayer': BreathPrayer,
    ground: Grounding, 'body-scan': BodyScan, cares: CastCares, reframe: Reframe,
  }[id];
  return (
    <>
      <SubHeader title={tool.title} />
      <div style={{ padding: '4px 18px 48px' }}>
        <h1 style={{ margin: 0, fontFamily: FONTS.display, fontSize: 30, fontWeight: 500, color: COLORS.ink }}>{tool.title}</h1>
        <p style={{ margin: '6px 0 0', fontFamily: FONTS.body, fontSize: 15, color: COLORS.mute, lineHeight: 1.5 }}>{tool.sub}</p>
        <Body />
      </div>
    </>
  );
}

// ---------- Breathing ----------
function Pacer({ phases, rounds, words }) {
  const [state, setState] = useState(null); // { round, phase, left }
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);
  useEffect(() => {
    if (!state) return;
    if (state.left <= 0) {
      const nextPhase = state.phase + 1;
      if (nextPhase < phases.length) setState({ ...state, phase: nextPhase, left: phases[nextPhase].secs });
      else if (state.round < rounds) setState({ round: state.round + 1, phase: 0, left: phases[0].secs });
      else { ding(); setState('done'); }
      return;
    }
    timer.current = setTimeout(() => setState((s) => (s && s !== 'done' ? { ...s, left: s.left - 1 } : s)), 1000);
    return () => clearTimeout(timer.current);
  }, [state]);

  const start = () => { primeDing(); setState({ round: 1, phase: 0, left: phases[0].secs }); };
  const running = state && state !== 'done';
  const ph = running ? phases[state.phase] : null;
  const scale = running ? ph.scale : 0.6;

  return (
    <div style={{ marginTop: 26, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ position: 'relative', width: 240, height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div aria-hidden="true" style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: tint(COLORS.sage, 30), transform: `scale(${scale})`, transition: `transform ${running ? ph.secs : 0.6}s ease-in-out` }} />
        <div aria-live="polite" style={{ position: 'relative', textAlign: 'center', padding: '0 24px' }}>
          {running ? (
            <>
              <div style={{ fontFamily: FONTS.display, fontSize: words ? 22 : 28, color: COLORS.ink, lineHeight: 1.25 }}>{words ? words[state.phase] : ph.label}</div>
              <div style={{ fontFamily: FONTS.body, fontSize: 30, fontWeight: 700, color: COLORS.ink, marginTop: 6 }}>{state.left}</div>
            </>
          ) : (
            <div style={{ fontFamily: FONTS.display, fontSize: 24, color: COLORS.ink }}>{state === 'done' ? 'Well done' : 'Ready'}</div>
          )}
        </div>
      </div>
      <div style={{ fontFamily: FONTS.body, fontSize: 13, color: COLORS.mute, marginTop: 8 }}>
        {running ? `Round ${state.round} of ${rounds}` : `${rounds} rounds · ${phases.map((p) => `${p.label.toLowerCase()} ${p.secs}`).join(', ')}`}
      </div>
      <button onClick={running ? () => setState(null) : start} style={bigButton}>
        {running ? 'Stop' : state === 'done' ? 'Go again' : 'Start'}
      </button>
    </div>
  );
}

function BoxBreathing() {
  const [rounds, setRounds] = useState(4);
  return (
    <>
      <RoundPicker value={rounds} onChange={setRounds} options={[4, 6, 8]} />
      <Pacer key={rounds} rounds={rounds} phases={[
        { label: 'Breathe in', secs: 4, scale: 1 },
        { label: 'Hold', secs: 4, scale: 1 },
        { label: 'Breathe out', secs: 4, scale: 0.55 },
        { label: 'Hold', secs: 4, scale: 0.55 },
      ]} />
      <Note>Breathe in through your nose and out slowly through your mouth. Let your shoulders drop on every breath out.</Note>
    </>
  );
}

function FourSevenEight() {
  return (
    <>
      <Pacer rounds={4} phases={[
        { label: 'Breathe in', secs: 4, scale: 1 },
        { label: 'Hold', secs: 7, scale: 1 },
        { label: 'Breathe out', secs: 8, scale: 0.55 },
      ]} />
      <Note>A slow breath that helps many people wind down before sleep. If you feel lightheaded, stop and breathe normally.</Note>
    </>
  );
}

function BreathPrayer() {
  const [pick, setPick] = useState(0);
  const [inWords, outWords, ref] = BREATH_PRAYERS[pick];
  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 18 }}>
        {BREATH_PRAYERS.map(([a, b, r], i) => (
          <button key={r} onClick={() => setPick(i)} aria-pressed={pick === i}
            style={{ textAlign: 'left', padding: '12px 14px', borderRadius: 14, cursor: 'pointer', border: `1px solid ${pick === i ? COLORS.ink : COLORS.line}`, background: pick === i ? tint(COLORS.gold, 14) : COLORS.surface, fontFamily: FONTS.body, fontSize: 14, color: COLORS.ink }}>
            <strong>{a}</strong> / {b} <span style={{ color: COLORS.mute }}>· {r}</span>
          </button>
        ))}
      </div>
      <Pacer key={pick} rounds={6} words={[inWords, outWords]} phases={[
        { label: 'Breathe in', secs: 5, scale: 1 },
        { label: 'Breathe out', secs: 6, scale: 0.55 },
      ]} />
      <Note>Pray the first line silently as you breathe in, and the second as you breathe out.</Note>
    </>
  );
}

// ---------- Grounding ----------
const SENSES = [
  [5, 'things you can see', 'Look around slowly. Name them, even simple things like a lamp or your shoes.'],
  [4, 'things you can feel', 'Your feet on the floor, your clothes, the chair, the air on your skin.'],
  [3, 'things you can hear', 'Near and far: a fan, a car, your own breathing.'],
  [2, 'things you can smell', 'Or two smells you like, if nothing is nearby.'],
  [1, 'thing you can taste', 'Or one thing you are grateful for right now.'],
];
function Grounding() {
  const [step, setStep] = useState(0);
  if (step >= SENSES.length) {
    return (
      <Finish verse="I have set the LORD always before me: because he is at my right hand, I shall not be moved." ref_="Psalm 16:8" onAgain={() => setStep(0)}>
        You’re here, in this moment, and God is with you in it. Take one slow breath before you move on.
      </Finish>
    );
  }
  const [n, what, hint] = SENSES[step];
  return (
    <div style={{ marginTop: 22 }}>
      <Progress value={step} total={SENSES.length} />
      <div style={{ marginTop: 22, textAlign: 'center' }}>
        <div style={{ fontFamily: FONTS.display, fontSize: 72, color: COLORS.gold, lineHeight: 1 }}>{n}</div>
        <div style={{ fontFamily: FONTS.display, fontSize: 26, color: COLORS.ink, marginTop: 6 }}>{what}</div>
        <p style={{ fontFamily: FONTS.body, fontSize: 15, color: COLORS.mute, lineHeight: 1.5, maxWidth: 320, margin: '10px auto 0' }}>{hint}</p>
      </div>
      <p style={{ fontFamily: FONTS.body, fontSize: 13, color: COLORS.mute, textAlign: 'center', marginTop: 18 }}>Say them out loud or in your head. Take your time.</p>
      <button onClick={() => setStep(step + 1)} style={{ ...bigButton, width: '100%' }}>{step === SENSES.length - 1 ? 'Finish' : 'Next'}</button>
    </div>
  );
}

// ---------- Body scan ----------
const AREAS = [
  'Your feet and toes. Notice how they feel, then let them go heavy.',
  'Your calves and knees. Let them soften.',
  'Your thighs and hips. Let the chair or floor hold you.',
  'Your belly. Let it rise and fall with each breath.',
  'Your chest and heart. Breathe a little slower.',
  'Your back. Let it settle and lengthen.',
  'Your hands and arms. Unclench your fingers.',
  'Your shoulders. Drop them away from your ears.',
  'Your neck, jaw, and face. Unclench your teeth and soften your forehead.',
  'Your whole body at once. Rest here, and give God anything you are still holding.',
];
function BodyScan() {
  const [i, setI] = useState(null);
  const [left, setLeft] = useState(30);
  useEffect(() => {
    if (i === null || i >= AREAS.length) return;
    if (left <= 0) {
      if (i === AREAS.length - 1) { ding(); setI(AREAS.length); }
      else { setI(i + 1); setLeft(30); }
      return;
    }
    const t = setTimeout(() => setLeft((l) => l - 1), 1000);
    return () => clearTimeout(t);
  }, [i, left]);

  if (i === null) {
    return (
      <div style={{ marginTop: 20 }}>
        <Note>Sit or lie down somewhere comfortable. You’ll move your attention slowly through your body, about 30 seconds each, 5 minutes in all. Close your eyes if you like; the bell will ring at the end.</Note>
        <button onClick={() => { primeDing(); setI(0); setLeft(30); }} style={{ ...bigButton, width: '100%' }}>Begin</button>
      </div>
    );
  }
  if (i >= AREAS.length) {
    return <Finish verse="I will both lay me down in peace, and sleep: for thou, LORD, only makest me dwell in safety." ref_="Psalm 4:8" onAgain={() => setI(null)}>Notice how your body feels now compared to when you started.</Finish>;
  }
  return (
    <div style={{ marginTop: 22 }}>
      <Progress value={i} total={AREAS.length} />
      <p aria-live="polite" style={{ fontFamily: FONTS.display, fontSize: 24, color: COLORS.ink, lineHeight: 1.4, marginTop: 28, textAlign: 'center' }}>{AREAS[i]}</p>
      <div style={{ fontFamily: FONTS.body, fontSize: 14, color: COLORS.mute, textAlign: 'center', marginTop: 12 }}>{left}s</div>
      <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
        <button onClick={() => setI(null)} style={{ ...ghostButton, flex: 1 }}>Stop</button>
        <button onClick={() => setLeft(0)} style={{ ...bigButton, marginTop: 0, flex: 1 }}>Next</button>
      </div>
    </div>
  );
}

// ---------- Cast your cares ----------
function CastCares() {
  const [cares, setCares] = useState([]);
  const [draft, setDraft] = useState('');
  const [given, setGiven] = useState(false);
  const [saved, setSaved] = useState(false);
  const add = () => { if (draft.trim()) { setCares([...cares, draft.trim()]); setDraft(''); } };

  if (given) {
    return (
      <Finish verse="Casting all your care upon him; for he careth for you." ref_="1 Peter 5:7" onAgain={() => { setCares([]); setGiven(false); setSaved(false); }}>
        You’ve named them and placed them in His hands. When one comes back, picture handing it to Him again.
        {!saved && cares.length > 0 && (
          <button onClick={async () => { await saveEntry({ title: 'Cares I gave to God', body: cares.map((c) => `- ${c}`).join('\n'), prompt: 'Cast Your Cares' }); setSaved(true); }} style={{ ...ghostButton, display: 'block', margin: '14px auto 0' }}>
            Save to my journal
          </button>
        )}
        {saved && <div style={{ marginTop: 12, fontFamily: FONTS.body, fontSize: 14, color: COLORS.ink }}>Saved to your journal.</div>}
      </Finish>
    );
  }
  return (
    <div style={{ marginTop: 20 }}>
      <Note>Write each worry, one at a time. Nothing is too small or too big.</Note>
      <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
        <input value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && add()} placeholder="I’m worried about…" aria-label="A worry" style={input} />
        <button onClick={add} aria-label="Add worry" style={{ width: 46, borderRadius: 12, border: 'none', background: COLORS.ink, color: COLORS.bg, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Plus size={18} /></button>
      </div>
      <ul style={{ listStyle: 'none', padding: 0, margin: '14px 0 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {cares.map((c, i) => (
          <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 14px', borderRadius: 14, background: COLORS.surface, border: `1px solid ${COLORS.line}`, fontFamily: FONTS.body, fontSize: 15, color: COLORS.ink }}>
            <span style={{ flex: 1 }}>{c}</span>
            <button onClick={() => setCares(cares.filter((_, j) => j !== i))} aria-label={`Remove ${c}`} style={{ border: 'none', background: 'none', color: COLORS.mute, cursor: 'pointer', display: 'flex' }}><X size={16} /></button>
          </li>
        ))}
      </ul>
      {cares.length > 0 && <button onClick={() => { primeDing(); ding(); setGiven(true); }} style={{ ...bigButton, width: '100%' }}>Give them to God</button>}
    </div>
  );
}

// ---------- Reframe ----------
const REFRAME_FIELDS = [
  ['situation', 'What happened?', 'Just the facts, like a camera would see it.'],
  ['thought', 'What thought went through your mind?', 'e.g. “I always mess things up.”'],
  ['for', 'What makes this thought feel true?', ''],
  ['against', 'What doesn’t fit? Any evidence against it?', ''],
  ['friend', 'What would you tell a friend who thought this?', ''],
];
function Reframe() {
  const navigate = useNavigate();
  const [vals, setVals] = useState({});
  const [feeling, setFeeling] = useState('');
  const [truer, setTruer] = useState('');
  const [saving, setSaving] = useState(false);
  const verse = feeling ? versesFor(feeling)[0] : null;
  const set = (k, v) => setVals((s) => ({ ...s, [k]: v }));

  const save = async () => {
    setSaving(true);
    const body = [
      ...REFRAME_FIELDS.filter(([k]) => vals[k]).map(([k, label]) => `${label}\n${vals[k]}`),
      feeling && `Feeling: ${feeling}`,
      verse && `What God says\n${verse[0]} (${verse[1]})`,
      truer && `A truer thought\n${truer}`,
    ].filter(Boolean).join('\n\n');
    const { data } = await saveEntry({ title: 'Reframing a thought', body, prompt: 'Reframe a Thought' });
    navigate(data?.id ? `/dashboard/mind/journal/${data.id}` : '/dashboard/mind/journal');
  };

  return (
    <div style={{ marginTop: 18 }}>
      <Note>Our feelings are real, but our thoughts aren’t always true. Walk through these slowly.</Note>
      {REFRAME_FIELDS.map(([k, label, hint]) => (
        <label key={k} style={{ display: 'block', marginTop: 16 }}>
          <span style={fieldLabel}>{label}</span>
          {hint && <span style={{ display: 'block', fontFamily: FONTS.body, fontSize: 12, color: COLORS.mute, marginTop: 2 }}>{hint}</span>}
          <textarea rows={2} value={vals[k] || ''} onChange={(e) => set(k, e.target.value)} style={{ ...input, marginTop: 8, width: '100%', boxSizing: 'border-box', resize: 'vertical' }} />
        </label>
      ))}
      <div style={{ marginTop: 16 }}>
        <span style={fieldLabel}>What are you feeling?</span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
          {FEELINGS.slice(0, 9).map((f) => (
            <button key={f} onClick={() => setFeeling(feeling === f ? '' : f)} aria-pressed={feeling === f}
              style={{ padding: '7px 12px', borderRadius: 999, cursor: 'pointer', border: `1px solid ${feeling === f ? COLORS.ink : COLORS.line}`, background: feeling === f ? COLORS.ink : 'transparent', color: feeling === f ? COLORS.bg : COLORS.ink, fontFamily: FONTS.body, fontSize: 13, fontWeight: 600 }}>
              {f}
            </button>
          ))}
        </div>
      </div>
      {verse && (
        <figure style={{ margin: '16px 0 0', paddingLeft: 14, borderLeft: `2px solid ${COLORS.gold}` }}>
          <div style={{ fontFamily: FONTS.body, fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: COLORS.gold }}>What God says</div>
          <blockquote style={{ margin: '6px 0 0', fontFamily: FONTS.display, fontSize: 18, lineHeight: 1.45, color: COLORS.ink }}>{verse[0]}</blockquote>
          <figcaption style={{ marginTop: 4, fontFamily: FONTS.body, fontSize: 13, fontWeight: 600, color: COLORS.mute }}>{verse[1]}</figcaption>
        </figure>
      )}
      <label style={{ display: 'block', marginTop: 16 }}>
        <span style={fieldLabel}>A truer, kinder thought</span>
        <span style={{ display: 'block', fontFamily: FONTS.body, fontSize: 12, color: COLORS.mute, marginTop: 2 }}>e.g. “I made a mistake today. That doesn’t make me a failure, and I can try again.”</span>
        <textarea rows={3} value={truer} onChange={(e) => setTruer(e.target.value)} style={{ ...input, marginTop: 8, width: '100%', boxSizing: 'border-box', resize: 'vertical' }} />
      </label>
      <button onClick={save} disabled={saving} style={{ ...bigButton, width: '100%' }}>{saving ? 'Saving…' : 'Save to my journal'}</button>
    </div>
  );
}

// ---------- shared ----------
function Finish({ verse, ref_, children, onAgain }) {
  return (
    <div style={{ marginTop: 26, textAlign: 'center' }}>
      <figure style={{ margin: 0, padding: '18px', borderRadius: 18, background: tint(COLORS.sage, 26) }}>
        <blockquote style={{ margin: 0, fontFamily: FONTS.display, fontSize: 20, lineHeight: 1.45, color: COLORS.ink }}>{verse}</blockquote>
        <figcaption style={{ marginTop: 8, fontFamily: FONTS.body, fontSize: 13, fontWeight: 600, color: COLORS.mute }}>{ref_}</figcaption>
      </figure>
      <div style={{ marginTop: 16, fontFamily: FONTS.body, fontSize: 15, color: COLORS.ink, lineHeight: 1.55 }}>{children}</div>
      <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
        <button onClick={onAgain} style={{ ...ghostButton, flex: 1 }}>Do it again</button>
        <Link to="/dashboard/mind" style={{ ...bigButton, marginTop: 0, flex: 1, textAlign: 'center', textDecoration: 'none' }}>Done</Link>
      </div>
    </div>
  );
}
function Progress({ value, total }) {
  return (
    <div style={{ display: 'flex', gap: 4 }} aria-hidden="true">
      {Array.from({ length: total }).map((_, i) => <span key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= value ? COLORS.gold : COLORS.line }} />)}
    </div>
  );
}
function RoundPicker({ value, onChange, options }) {
  return (
    <div style={{ display: 'flex', gap: 6, marginTop: 16, justifyContent: 'center' }}>
      {options.map((n) => (
        <button key={n} onClick={() => onChange(n)} aria-pressed={value === n}
          style={{ padding: '7px 14px', borderRadius: 999, cursor: 'pointer', border: `1px solid ${value === n ? COLORS.ink : COLORS.line}`, background: value === n ? COLORS.ink : 'transparent', color: value === n ? COLORS.bg : COLORS.ink, fontFamily: FONTS.body, fontSize: 13, fontWeight: 600 }}>
          {n} rounds
        </button>
      ))}
    </div>
  );
}
function Note({ children }) {
  return <p style={{ margin: '16px 0 0', fontFamily: FONTS.body, fontSize: 14, color: COLORS.mute, lineHeight: 1.55 }}>{children}</p>;
}

const bigButton = { marginTop: 22, padding: '15px 36px', borderRadius: 999, border: 'none', background: COLORS.deep, color: '#fff', fontFamily: FONTS.body, fontSize: 16, fontWeight: 600, cursor: 'pointer', boxSizing: 'border-box' };
const ghostButton = { padding: '14px 20px', borderRadius: 999, border: `1px solid ${COLORS.line}`, background: 'transparent', color: COLORS.ink, fontFamily: FONTS.body, fontSize: 15, fontWeight: 600, cursor: 'pointer' };
const input = { flex: 1, minWidth: 0, padding: '12px 14px', borderRadius: 12, border: `1px solid ${COLORS.line}`, background: COLORS.surface, fontFamily: FONTS.body, fontSize: 15, color: COLORS.ink };
const fieldLabel = { display: 'block', fontFamily: FONTS.body, fontSize: 14, fontWeight: 700, color: COLORS.ink };
