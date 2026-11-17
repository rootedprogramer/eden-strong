import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Lock, NotebookPen, Trash2 } from 'lucide-react';
import { COLORS, FONTS, tint } from '../../../brand/tokens';
import SubHeader from '../../../components/SubHeader';
import { PROMPT_GROUPS, deleteEntry, loadEntry, loadJournal, saveEntry } from '../../../lib/mind';

const fmt = (d) => new Date(d).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

// All entries, newest first, plus prompts to start from.
export function JournalList() {
  const [entries, setEntries] = useState(null);
  const [showPrompts, setShowPrompts] = useState(false);
  useEffect(() => { loadJournal().then(setEntries); }, []);

  return (
    <>
      <SubHeader title="Journal" />
      <div style={{ padding: '4px 16px 48px' }}>
        <h1 style={{ margin: 0, fontFamily: FONTS.display, fontSize: 32, fontWeight: 500, color: COLORS.ink }}>Journal</h1>
        <p style={{ display: 'flex', alignItems: 'center', gap: 6, margin: '6px 0 0', fontFamily: FONTS.body, fontSize: 13, color: COLORS.mute }}>
          <Lock size={13} aria-hidden="true" /> Private. Only you can read your journal.
        </p>
        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
          <Link to="/dashboard/mind/journal/new" style={{ ...dark, flex: 1 }}><NotebookPen size={18} /> Free write</Link>
          <button onClick={() => setShowPrompts((s) => !s)} style={{ ...ghost, flex: 1 }}>{showPrompts ? 'Hide prompts' : 'Use a prompt'}</button>
        </div>
        {showPrompts && <Prompts />}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 20 }}>
          {entries === null ? null : entries.length === 0 ? (
            <p style={{ fontFamily: FONTS.body, fontSize: 14, color: COLORS.mute, lineHeight: 1.5 }}>No entries yet. Start with a few honest sentences. There’s no wrong way to do this.</p>
          ) : entries.map((e) => (
            <Link key={e.id} to={`/dashboard/mind/journal/${e.id}`} style={{ display: 'block', padding: '14px 16px', borderRadius: 16, background: COLORS.surface, border: `1px solid ${COLORS.line}`, textDecoration: 'none' }}>
              <span style={{ display: 'block', fontFamily: FONTS.body, fontSize: 12, color: COLORS.mute }}>{fmt(e.created_at)}</span>
              {e.title && <span style={{ display: 'block', fontFamily: FONTS.display, fontSize: 19, color: COLORS.ink, marginTop: 3 }}>{e.title}</span>}
              <span style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', fontFamily: FONTS.body, fontSize: 14, color: COLORS.mute, marginTop: 3, lineHeight: 1.45 }}>{e.body}</span>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}

function Prompts() {
  return (
    <div style={{ marginTop: 14, padding: 14, borderRadius: 18, background: COLORS.surface, border: `1px solid ${COLORS.line}` }}>
      {PROMPT_GROUPS.map((g) => (
        <div key={g.id} style={{ marginTop: 8 }}>
          <div style={{ fontFamily: FONTS.body, fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: COLORS.gold, margin: '6px 0' }}>{g.title}</div>
          {g.prompts.map((p) => (
            <Link key={p} to={`/dashboard/mind/journal/new?prompt=${encodeURIComponent(p)}`} style={{ display: 'block', padding: '10px 0', borderTop: `1px solid ${COLORS.line}`, fontFamily: FONTS.body, fontSize: 14, color: COLORS.ink, textDecoration: 'none', lineHeight: 1.45 }}>
              {p}
            </Link>
          ))}
        </div>
      ))}
    </div>
  );
}

// Write a new entry or edit an existing one.
export function JournalEntry() {
  const { id } = useParams();
  const isNew = !id || id === 'new';
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [entry, setEntry] = useState(isNew ? { title: '', body: '', prompt: params.get('prompt') || '' } : null);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(null);

  useEffect(() => {
    if (!isNew) loadEntry(id).then((e) => setEntry(e ? { ...e, title: e.title || '' } : false));
  }, [id]);

  if (entry === null) return <SubHeader title="Journal" />;
  if (entry === false) return <><SubHeader title="Journal" /><p style={{ padding: '0 18px', fontFamily: FONTS.body, color: COLORS.mute }}>This entry wasn’t found.</p></>;

  const save = async () => {
    if (!entry.body.trim()) return;
    setSaving(true);
    const { data } = await saveEntry({ id: isNew ? null : id, title: entry.title, body: entry.body, prompt: entry.prompt });
    setSaving(false);
    setSavedAt(new Date());
    if (isNew && data?.id) navigate(`/dashboard/mind/journal/${data.id}`, { replace: true });
  };
  const remove = async () => {
    if (!window.confirm('Delete this entry? This can’t be undone.')) return;
    await deleteEntry(id);
    navigate('/dashboard/mind/journal', { replace: true });
  };

  return (
    <>
      <SubHeader title="Journal" />
      <div style={{ padding: '4px 18px 48px' }}>
        <div style={{ fontFamily: FONTS.body, fontSize: 13, color: COLORS.mute }}>{fmt(entry.created_at || new Date())}</div>
        {entry.prompt && (
          <div style={{ marginTop: 12, padding: '12px 14px', borderRadius: 14, background: tint(COLORS.gold, 14), fontFamily: FONTS.display, fontSize: 18, color: COLORS.ink, lineHeight: 1.4 }}>
            {entry.prompt}
          </div>
        )}
        <input value={entry.title} onChange={(e) => setEntry({ ...entry, title: e.target.value })} placeholder="Title (optional)" aria-label="Title"
          style={{ marginTop: 14, width: '100%', boxSizing: 'border-box', border: 'none', borderBottom: `1px solid ${COLORS.line}`, background: 'transparent', padding: '8px 0', fontFamily: FONTS.display, fontSize: 24, color: COLORS.ink, outline: 'none' }} />
        <textarea value={entry.body} onChange={(e) => setEntry({ ...entry, body: e.target.value })} placeholder="Start writing…" aria-label="Journal entry" autoFocus={isNew}
          style={{ marginTop: 12, width: '100%', boxSizing: 'border-box', minHeight: '45vh', border: 'none', background: 'transparent', fontFamily: FONTS.body, fontSize: 17, lineHeight: 1.65, color: COLORS.ink, resize: 'vertical', outline: 'none' }} />
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 10 }}>
          {!isNew && <button onClick={remove} aria-label="Delete entry" style={{ ...ghost, padding: '14px 16px' }}><Trash2 size={18} /></button>}
          <button onClick={save} disabled={saving || !entry.body.trim()} style={{ ...dark, flex: 1, border: 'none', cursor: 'pointer', opacity: entry.body.trim() ? 1 : 0.5 }}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
        {savedAt && <div role="status" style={{ marginTop: 10, fontFamily: FONTS.body, fontSize: 13, color: COLORS.mute, textAlign: 'center' }}>Saved</div>}
      </div>
    </>
  );
}

const dark = { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '14px 0', borderRadius: 999, background: COLORS.deep, color: '#fff', fontFamily: FONTS.body, fontSize: 15, fontWeight: 600, textDecoration: 'none' };
const ghost = { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '14px 0', borderRadius: 999, border: `1px solid ${COLORS.line}`, background: 'transparent', color: COLORS.ink, fontFamily: FONTS.body, fontSize: 15, fontWeight: 600, cursor: 'pointer' };
