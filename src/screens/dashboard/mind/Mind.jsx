import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookHeart, ChevronRight, Heart, Tags, LifeBuoy, NotebookPen, Wind, Anchor, HandHeart, Lightbulb, ScanLine, Moon, Sparkles } from 'lucide-react';
import { COLORS, FONTS, tint, toneColor } from '../../../brand/tokens';
import SubHeader from '../../../components/SubHeader';
import { todayISO } from '../../../lib/workout';
import { FEELINGS, MOODS, TOOLS, loadCheckins, loadJournal, moodOf, saveCheckin } from '../../../lib/mind';

const TOOL_ICONS = { feelings: Tags, box: Wind, 'breath-prayer': Sparkles, ground: Anchor, cares: HandHeart, reframe: Lightbulb, 'body-scan': ScanLine, '478': Moon };

// Renew home: daily check-in, calming tools, journal, and help.
export default function Mind() {
  const [checkins, setCheckins] = useState(null);
  const [entries, setEntries] = useState([]);

  const reload = () => loadCheckins(14).then(setCheckins);
  useEffect(() => { reload(); loadJournal(3).then(setEntries); }, []);

  const today = (checkins || []).find((c) => c.check_date === todayISO());

  return (
    <>
      <SubHeader title="Renew" />
      <div style={{ padding: '4px 16px 48px' }}>
        <h1 style={{ margin: 0, fontFamily: FONTS.display, fontSize: 34, fontWeight: 500, color: COLORS.ink }}>Renew</h1>
        <p style={{ margin: '6px 0 0', fontFamily: FONTS.body, fontSize: 15, color: COLORS.mute, lineHeight: 1.5 }}>
          Care for your mind and heart: check in, calm down, do the heart work, and write it out with God.
        </p>
        <figure style={{ margin: '16px 0 0', padding: '16px 18px', borderRadius: 18, background: tint(COLORS.sage, 26) }}>
          <blockquote style={{ margin: 0, fontFamily: FONTS.display, fontSize: 19, lineHeight: 1.4, color: COLORS.ink }}>
            Be ye transformed by the renewing of your mind.
          </blockquote>
          <figcaption style={{ marginTop: 8, fontFamily: FONTS.body, fontSize: 13, fontWeight: 600, color: COLORS.mute }}>Romans 12:2</figcaption>
        </figure>

        {checkins !== null && <CheckIn today={today} history={checkins} onSaved={reload} />}

        <h2 style={h2}>Calm and ground</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 12 }}>
          {TOOLS.map((t) => {
            const Icon = TOOL_ICONS[t.id] || Wind;
            return (
              <Link key={t.id} to={`/dashboard/mind/tool/${t.id}`} style={{ minHeight: 118, padding: 14, borderRadius: 18, background: toneColor(t.tone), textDecoration: 'none', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <Icon size={22} color="#fff" strokeWidth={1.7} aria-hidden="true" />
                <span>
                  <span style={{ display: 'block', fontFamily: FONTS.display, fontSize: 18, color: '#fff', lineHeight: 1.15 }}>{t.title}</span>
                  <span style={{ display: 'block', fontFamily: FONTS.body, fontSize: 12, color: 'rgba(255,255,255,0.85)', marginTop: 3 }}>{t.time}</span>
                </span>
              </Link>
            );
          })}
        </div>

        <h2 style={h2}>Heart Work</h2>
        <Link to="/dashboard/mind/heart" style={{ display: 'block', marginTop: 12, padding: 18, borderRadius: 20, background: COLORS.surface, border: `1px solid ${COLORS.line}`, textDecoration: 'none' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Heart size={24} color={COLORS.rose} aria-hidden="true" />
            <span style={{ flex: 1 }}>
              <span style={{ display: 'block', fontFamily: FONTS.display, fontSize: 20, color: COLORS.ink }}>Guided lessons for your heart</span>
              <span style={{ display: 'block', fontFamily: FONTS.body, fontSize: 13, color: COLORS.mute, marginTop: 2, lineHeight: 1.45 }}>Emotions, boundaries, forgiveness and grief, self-worth and rest</span>
            </span>
            <ChevronRight size={20} color={COLORS.ink} />
          </span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 28 }}>
          <h2 style={{ ...h2, marginTop: 0 }}>Journal</h2>
          <Link to="/dashboard/mind/journal" style={{ fontFamily: FONTS.body, fontSize: 13, fontWeight: 600, color: COLORS.mute, textDecoration: 'none' }}>See all</Link>
        </div>
        <Link to="/dashboard/mind/journal/new" style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12, padding: '16px 18px', borderRadius: 18, background: COLORS.deep, textDecoration: 'none' }}>
          <NotebookPen size={22} color="#fff" aria-hidden="true" />
          <span style={{ flex: 1 }}>
            <span style={{ display: 'block', fontFamily: FONTS.display, fontSize: 20, color: '#fff' }}>Write in your journal</span>
            <span style={{ display: 'block', fontFamily: FONTS.body, fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 2 }}>Free write, or pick a prompt. Only you can see it.</span>
          </span>
          <ChevronRight size={20} color="#fff" />
        </Link>
        {entries.map((e) => (
          <Link key={e.id} to={`/dashboard/mind/journal/${e.id}`} style={{ display: 'block', marginTop: 8, padding: '12px 16px', borderRadius: 16, background: COLORS.surface, border: `1px solid ${COLORS.line}`, textDecoration: 'none' }}>
            <span style={{ display: 'block', fontFamily: FONTS.body, fontSize: 12, color: COLORS.mute }}>{new Date(e.created_at).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
            <span style={{ display: 'block', fontFamily: FONTS.body, fontSize: 15, fontWeight: 600, color: COLORS.ink, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.title || e.body}</span>
          </Link>
        ))}

        <Link to="/dashboard/mind/verses" style={{ ...rowLink, marginTop: 22 }}>
          <BookHeart size={22} color={COLORS.gold} aria-hidden="true" />
          <span style={{ flex: 1 }}>
            <span style={{ display: 'block', fontFamily: FONTS.display, fontSize: 20, color: COLORS.ink }}>Scripture for how I feel</span>
            <span style={{ display: 'block', fontFamily: FONTS.body, fontSize: 13, color: COLORS.mute, marginTop: 2 }}>Anxious, sad, lonely, afraid, tired, and more</span>
          </span>
          <ChevronRight size={20} color={COLORS.ink} />
        </Link>
        <Link to="/dashboard/mind/help" style={{ ...rowLink, marginTop: 10, border: `1px solid ${COLORS.rose}` }}>
          <LifeBuoy size={22} color={COLORS.rose} aria-hidden="true" />
          <span style={{ flex: 1 }}>
            <span style={{ display: 'block', fontFamily: FONTS.display, fontSize: 20, color: COLORS.ink }}>Need help now?</span>
            <span style={{ display: 'block', fontFamily: FONTS.body, fontSize: 13, color: COLORS.mute, marginTop: 2 }}>Crisis lines and finding a counselor</span>
          </span>
          <ChevronRight size={20} color={COLORS.ink} />
        </Link>

        <p style={{ marginTop: 22, fontFamily: FONTS.body, fontSize: 12, color: COLORS.mute, lineHeight: 1.55, textAlign: 'center' }}>
          Renew is here to support you, not to replace a doctor or counselor. If you’ve been struggling for more than a couple of weeks, please reach out to one.
        </p>
      </div>
    </>
  );
}

function CheckIn({ today, history, onSaved }) {
  const [editing, setEditing] = useState(!today);
  const [mood, setMood] = useState(today?.mood || null);
  const [feelings, setFeelings] = useState(today?.feelings || []);
  const [note, setNote] = useState(today?.note || '');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    await saveCheckin({ mood, feelings, note });
    setSaving(false);
    setEditing(false);
    onSaved();
  };
  const flip = (f) => setFeelings((cur) => (cur.includes(f) ? cur.filter((x) => x !== f) : [...cur, f]));
  const current = moodOf(today?.mood);
  const firstFeeling = (today?.feelings || [])[0];

  return (
    <section style={{ marginTop: 20, padding: 18, borderRadius: 22, background: COLORS.surface, border: `1px solid ${COLORS.line}` }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ ...h2, marginTop: 0 }}>{editing ? 'How are you, really?' : 'Today’s check-in'}</h2>
        {!editing && <button onClick={() => setEditing(true)} style={{ border: 'none', background: 'none', fontFamily: FONTS.body, fontSize: 13, fontWeight: 600, color: COLORS.mute, cursor: 'pointer' }}>Change</button>}
      </div>

      {editing ? (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6, marginTop: 14 }}>
            {MOODS.map((m) => (
              <button key={m.value} onClick={() => setMood(m.value)} aria-pressed={mood === m.value}
                style={{ padding: '10px 2px 8px', borderRadius: 14, cursor: 'pointer', border: `2px solid ${mood === m.value ? m.color : COLORS.line}`, background: mood === m.value ? tint(m.color, 20) : 'transparent', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <span aria-hidden="true" style={{ width: 22, height: 22, borderRadius: '50%', background: m.color }} />
                <span style={{ fontFamily: FONTS.body, fontSize: 11, fontWeight: 600, color: COLORS.ink }}>{m.label}</span>
              </button>
            ))}
          </div>
          {mood && (
            <>
              <div style={{ marginTop: 16, fontFamily: FONTS.body, fontSize: 13, fontWeight: 600, color: COLORS.mute }}>What are you feeling? Pick any.</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                {FEELINGS.map((f) => (
                  <button key={f} onClick={() => flip(f)} aria-pressed={feelings.includes(f)}
                    style={{ padding: '7px 12px', borderRadius: 999, cursor: 'pointer', border: `1px solid ${feelings.includes(f) ? COLORS.ink : COLORS.line}`, background: feelings.includes(f) ? COLORS.ink : 'transparent', color: feelings.includes(f) ? COLORS.bg : COLORS.ink, fontFamily: FONTS.body, fontSize: 13, fontWeight: 600 }}>
                    {f}
                  </button>
                ))}
              </div>
              <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} placeholder="Anything on your mind? (optional)" aria-label="Check-in note"
                style={{ marginTop: 12, width: '100%', boxSizing: 'border-box', padding: '12px 14px', borderRadius: 14, border: `1px solid ${COLORS.line}`, background: 'transparent', fontFamily: FONTS.body, fontSize: 15, color: COLORS.ink, resize: 'vertical' }} />
              <button onClick={save} disabled={saving} style={{ marginTop: 12, width: '100%', padding: '14px 0', borderRadius: 999, border: 'none', background: COLORS.deep, color: '#fff', fontFamily: FONTS.body, fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
                {saving ? 'Saving…' : 'Save check-in'}
              </button>
            </>
          )}
        </>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12 }}>
          <span aria-hidden="true" style={{ width: 28, height: 28, borderRadius: '50%', background: current?.color }} />
          <span>
            <span style={{ display: 'block', fontFamily: FONTS.body, fontSize: 16, fontWeight: 700, color: COLORS.ink }}>{current?.label}</span>
            {today.feelings?.length > 0 && <span style={{ display: 'block', fontFamily: FONTS.body, fontSize: 13, color: COLORS.mute }}>{today.feelings.join(', ')}</span>}
          </span>
        </div>
      )}

      {!editing && today && (today.mood <= 2 ? (
        <div style={{ marginTop: 14, padding: '14px 16px', borderRadius: 16, background: tint(COLORS.rose, 22), fontFamily: FONTS.body, fontSize: 14, color: COLORS.ink, lineHeight: 1.55 }}>
          Thank you for being honest. Hard days are real, and you don’t have to carry this alone. Try a calming tool below, text someone you trust, or <Link to="/dashboard/mind/help" style={{ color: COLORS.ink, fontWeight: 700 }}>see where to get support</Link>.
        </div>
      ) : firstFeeling ? (
        <Link to={`/dashboard/mind/verses?feeling=${encodeURIComponent(firstFeeling)}`} style={{ display: 'inline-block', marginTop: 12, fontFamily: FONTS.body, fontSize: 14, fontWeight: 600, color: COLORS.gold }}>
          Scripture for feeling {firstFeeling.toLowerCase()}
        </Link>
      ) : null)}

      {history.length > 1 && (
        <div style={{ marginTop: 16 }}>
          <div style={{ fontFamily: FONTS.body, fontSize: 12, color: COLORS.mute, marginBottom: 6 }}>Last 2 weeks</div>
          <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end', height: 44 }} role="img" aria-label="Your mood over the last two weeks">
            {last14().map((d) => {
              const c = history.find((h) => h.check_date === d);
              const m = moodOf(c?.mood);
              return <span key={d} title={`${d}: ${m?.label || 'no check-in'}`} style={{ flex: 1, height: m ? `${(m.value / 5) * 100}%` : 4, borderRadius: 4, background: m ? m.color : COLORS.line }} />;
            })}
          </div>
        </div>
      )}
    </section>
  );
}

function last14() {
  const out = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    out.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
  }
  return out;
}

const h2 = { margin: '28px 0 0', fontFamily: FONTS.display, fontSize: 24, fontWeight: 500, color: COLORS.ink };
const rowLink = { display: 'flex', alignItems: 'center', gap: 12, padding: '16px 18px', borderRadius: 18, background: COLORS.surface, border: `1px solid ${COLORS.line}`, textDecoration: 'none' };
