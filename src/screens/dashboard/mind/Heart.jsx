import { useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { Check, ChevronRight, Clock, NotebookPen } from 'lucide-react';
import { COLORS, FONTS, tint, toneColor } from '../../../brand/tokens';
import SubHeader from '../../../components/SubHeader';
import { PATHS, lessonOf, lessonsIn, loadProgress, markDone, pathOf } from '../../../lib/heart';

// Heart Work: the four paths
export function HeartPaths() {
  const [done, setDone] = useState(new Set());
  useEffect(() => { loadProgress().then(setDone); }, []);
  return (
    <>
      <SubHeader title="Heart Work" />
      <div style={{ padding: '4px 16px 48px' }}>
        <h1 style={{ margin: 0, fontFamily: FONTS.display, fontSize: 32, fontWeight: 500, color: COLORS.ink }}>Heart Work</h1>
        <p style={{ margin: '6px 0 0', fontFamily: FONTS.body, fontSize: 15, color: COLORS.mute, lineHeight: 1.5 }}>
          Short guided lessons for your emotional health. Read, try the practice, and reflect in your journal.
        </p>
        <figure style={{ margin: '16px 0 0', padding: '16px 18px', borderRadius: 18, background: tint(COLORS.rose, 20) }}>
          <blockquote style={{ margin: 0, fontFamily: FONTS.display, fontSize: 19, lineHeight: 1.4, color: COLORS.ink }}>Keep thy heart with all diligence; for out of it are the issues of life.</blockquote>
          <figcaption style={{ marginTop: 8, fontFamily: FONTS.body, fontSize: 13, fontWeight: 600, color: COLORS.mute }}>Proverbs 4:23</figcaption>
        </figure>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 18 }}>
          {PATHS.map((p) => {
            const lessons = lessonsIn(p.id);
            const n = lessons.filter((l) => done.has(l.slug)).length;
            return (
              <Link key={p.id} to={`/dashboard/mind/heart/${p.id}`} style={{ display: 'block', padding: 18, borderRadius: 20, background: toneColor(p.tone), textDecoration: 'none' }}>
                <span style={{ display: 'block', fontFamily: FONTS.display, fontSize: 22, color: '#fff', lineHeight: 1.15 }}>{p.title}</span>
                <span style={{ display: 'block', fontFamily: FONTS.body, fontSize: 13, color: 'rgba(255,255,255,0.88)', marginTop: 4 }}>{p.sub}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
                  <span style={{ flex: 1, height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.3)', overflow: 'hidden' }}>
                    <span style={{ display: 'block', height: '100%', width: `${(n / lessons.length) * 100}%`, background: '#fff' }} />
                  </span>
                  <span style={{ fontFamily: FONTS.body, fontSize: 12, fontWeight: 600, color: '#fff' }}>{n}/{lessons.length}</span>
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}

// One path's lessons
export function HeartPath() {
  const { path } = useParams();
  const p = pathOf(path);
  const [done, setDone] = useState(new Set());
  useEffect(() => { loadProgress().then(setDone); }, []);
  if (!p) return <Navigate to="/dashboard/mind/heart" replace />;
  return (
    <>
      <SubHeader title="Heart Work" />
      <div style={{ padding: '4px 16px 48px' }}>
        <h1 style={{ margin: 0, fontFamily: FONTS.display, fontSize: 30, fontWeight: 500, color: COLORS.ink, lineHeight: 1.15 }}>{p.title}</h1>
        <p style={{ margin: '6px 0 0', fontFamily: FONTS.body, fontSize: 15, color: COLORS.mute }}>{p.sub}</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 18 }}>
          {lessonsIn(p.id).map((l, i) => {
            const isDone = done.has(l.slug);
            return (
              <Link key={l.slug} to={`/dashboard/mind/heart/lesson/${l.slug}`} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px', borderRadius: 18, background: COLORS.surface, border: `1px solid ${COLORS.line}`, textDecoration: 'none' }}>
                <span style={{ width: 34, height: 34, flexShrink: 0, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: isDone ? COLORS.gold : 'transparent', border: `2px solid ${isDone ? COLORS.gold : COLORS.line}`, fontFamily: FONTS.body, fontSize: 14, fontWeight: 700, color: isDone ? '#fff' : COLORS.ink }}>
                  {isDone ? <Check size={16} strokeWidth={3} /> : i + 1}
                </span>
                <span style={{ flex: 1 }}>
                  <span style={{ display: 'block', fontFamily: FONTS.display, fontSize: 19, color: COLORS.ink, lineHeight: 1.2 }}>{l.title}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: FONTS.body, fontSize: 12, color: COLORS.mute, marginTop: 4 }}><Clock size={12} aria-hidden="true" /> {l.minutes} min read</span>
                </span>
                <ChevronRight size={20} color={COLORS.mute} />
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}

// A lesson
export function HeartLesson() {
  const { slug } = useParams();
  const l = lessonOf(slug);
  const [done, setDone] = useState(false);
  useEffect(() => { loadProgress().then((s) => setDone(s.has(slug))); window.scrollTo(0, 0); }, [slug]);
  if (!l) return <Navigate to="/dashboard/mind/heart" replace />;
  const p = pathOf(l.path);
  const siblings = lessonsIn(l.path);
  const next = siblings[siblings.findIndex((x) => x.slug === slug) + 1];
  const toggle = async () => { await markDone(slug, !done); setDone(!done); };

  return (
    <>
      <SubHeader title={p.title} />
      <div style={{ padding: '4px 18px 48px' }}>
        <div style={{ fontFamily: FONTS.body, fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: COLORS.gold }}>{l.minutes} min · Heart Work</div>
        <h1 style={{ margin: '6px 0 0', fontFamily: FONTS.display, fontSize: 32, fontWeight: 500, color: COLORS.ink, lineHeight: 1.1 }}>{l.title}</h1>
        <figure style={{ margin: '18px 0 0', paddingLeft: 14, borderLeft: `2px solid ${COLORS.gold}` }}>
          <blockquote style={{ margin: 0, fontFamily: FONTS.display, fontSize: 19, lineHeight: 1.45, color: COLORS.ink }}>{l.verse}</blockquote>
          <figcaption style={{ marginTop: 6, fontFamily: FONTS.body, fontSize: 13, fontWeight: 600, color: COLORS.mute }}>{l.ref}</figcaption>
        </figure>

        {l.read.map(([h, text]) => (
          <section key={h} style={{ marginTop: 22 }}>
            <h2 style={{ margin: 0, fontFamily: FONTS.display, fontSize: 21, fontWeight: 500, color: COLORS.ink }}>{h}</h2>
            <p style={{ margin: '6px 0 0', fontFamily: FONTS.body, fontSize: 16, color: COLORS.ink, lineHeight: 1.65 }}>{text}</p>
          </section>
        ))}

        <section style={{ marginTop: 24, padding: 18, borderRadius: 20, background: tint(COLORS.sage, 24) }}>
          <div style={{ fontFamily: FONTS.body, fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: COLORS.ink }}>Practice</div>
          <h2 style={{ margin: '4px 0 0', fontFamily: FONTS.display, fontSize: 21, fontWeight: 500, color: COLORS.ink }}>{l.practice.title}</h2>
          <ol style={{ margin: '10px 0 0', paddingLeft: 20, fontFamily: FONTS.body, fontSize: 15, color: COLORS.ink, lineHeight: 1.6 }}>
            {l.practice.steps.map((s) => <li key={s} style={{ marginTop: 4 }}>{s}</li>)}
          </ol>
          {l.tool && (
            <Link to={`/dashboard/mind/tool/${l.tool}`} style={{ display: 'inline-block', marginTop: 12, padding: '11px 18px', borderRadius: 999, background: COLORS.deep, color: '#fff', fontFamily: FONTS.body, fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
              Open the Feelings Wheel
            </Link>
          )}
        </section>

        <section style={{ marginTop: 24 }}>
          <h2 style={{ margin: 0, fontFamily: FONTS.display, fontSize: 21, fontWeight: 500, color: COLORS.ink }}>Reflect</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
            {l.reflect.map((q) => (
              <Link key={q} to={`/dashboard/mind/journal/new?prompt=${encodeURIComponent(q)}`} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderRadius: 16, background: COLORS.surface, border: `1px solid ${COLORS.line}`, textDecoration: 'none' }}>
                <span style={{ flex: 1, fontFamily: FONTS.body, fontSize: 15, color: COLORS.ink, lineHeight: 1.45 }}>{q}</span>
                <NotebookPen size={18} color={COLORS.gold} aria-label="Write about this" />
              </Link>
            ))}
          </div>
          <p style={{ margin: '8px 0 0', fontFamily: FONTS.body, fontSize: 12, color: COLORS.mute }}>Tap a question to write about it in your private journal.</p>
        </section>

        <button onClick={toggle} style={{ marginTop: 24, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '15px 0', borderRadius: 999, cursor: 'pointer', border: done ? `1px solid ${COLORS.line}` : 'none', background: done ? 'transparent' : COLORS.deep, color: done ? COLORS.ink : '#fff', fontFamily: FONTS.body, fontSize: 15, fontWeight: 600 }}>
          <Check size={18} /> {done ? 'Completed' : 'Mark as complete'}
        </button>
        {next && (
          <Link to={`/dashboard/mind/heart/lesson/${next.slug}`} style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12, padding: '14px 16px', borderRadius: 16, background: COLORS.surface, border: `1px solid ${COLORS.line}`, textDecoration: 'none' }}>
            <span style={{ flex: 1 }}>
              <span style={{ display: 'block', fontFamily: FONTS.body, fontSize: 12, color: COLORS.mute }}>Next lesson</span>
              <span style={{ display: 'block', fontFamily: FONTS.display, fontSize: 18, color: COLORS.ink }}>{next.title}</span>
            </span>
            <ChevronRight size={20} color={COLORS.ink} />
          </Link>
        )}
      </div>
    </>
  );
}
