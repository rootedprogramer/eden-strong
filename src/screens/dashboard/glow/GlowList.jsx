import { useEffect, useState } from 'react';
import { Link, Navigate, useOutletContext, useParams } from 'react-router-dom';
import { ChevronRight, Clock } from 'lucide-react';
import { COLORS, FONTS, tint } from '../../../brand/tokens';
import SubHeader from '../../../components/SubHeader';
import { categoryOf, fitsMe, loadGlowHome, loadItems, pickedForMe } from '../../../lib/glow';

// One Glow Up area (skin, hair, body, self-care), or all the natural recipes.
export default function GlowList() {
  const { edition } = useOutletContext() || {};
  const { category } = useParams();
  const [items, setItems] = useState(null);
  const [profile, setProfile] = useState(null);
  const [filter, setFilter] = useState('all');
  const recipes = category === 'recipes';
  const cat = categoryOf(category);

  useEffect(() => {
    setItems(null);
    loadItems(recipes ? null : category).then((all) => setItems(recipes ? all.filter((i) => i.kind === 'recipe') : all));
    loadGlowHome().then((d) => setProfile(d?.profile || null));
  }, [category]);

  if (edition && edition.id !== 'women') return <Navigate to="/dashboard" replace />;
  if (!recipes && !cat) return <Navigate to="/dashboard/glow" replace />;

  const title = recipes ? 'Natural recipes' : cat.title;
  const visible = (items || [])
    .filter((i) => fitsMe(i, profile))
    .filter((i) => filter === 'all' || i.kind === filter)
    .sort((a, b) => Number(pickedForMe(b, profile)) - Number(pickedForMe(a, profile)));

  return (
    <>
      <SubHeader title={title} />
      <div style={{ padding: '4px 16px 48px' }}>
        <h1 style={{ margin: 0, fontFamily: FONTS.display, fontSize: 32, fontWeight: 500, color: COLORS.ink }}>{title}</h1>
        <p style={{ margin: '6px 0 0', fontFamily: FONTS.body, fontSize: 15, color: COLORS.mute, lineHeight: 1.5 }}>
          {recipes ? 'Simple masks, rinses, scrubs, and oils from ingredients you may already have.' : cat.sub}
        </p>

        {!recipes && (
          <div style={{ display: 'flex', gap: 6, marginTop: 16 }}>
            {[['all', 'All'], ['guide', 'Guides'], ['recipe', 'Recipes']].map(([id, label]) => (
              <button key={id} onClick={() => setFilter(id)} aria-pressed={filter === id}
                style={{ padding: '8px 16px', borderRadius: 999, cursor: 'pointer', border: `1px solid ${filter === id ? COLORS.ink : COLORS.line}`, background: filter === id ? COLORS.ink : 'transparent', color: filter === id ? COLORS.bg : COLORS.ink, fontFamily: FONTS.body, fontSize: 14, fontWeight: 600 }}>
                {label}
              </button>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
          {items === null ? null : visible.length === 0 ? (
            <p style={{ fontFamily: FONTS.body, fontSize: 14, color: COLORS.mute }}>Nothing here yet.</p>
          ) : visible.map((i) => (
            <Link key={i.id} to={`/dashboard/glow/item/${i.slug}`} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px', borderRadius: 18, background: COLORS.surface, border: `1px solid ${COLORS.line}`, textDecoration: 'none' }}>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <Tag>{i.kind === 'recipe' ? 'Recipe' : 'Guide'}</Tag>
                  {pickedForMe(i, profile) && <Tag tone={COLORS.rose}>For you</Tag>}
                </span>
                <span style={{ display: 'block', fontFamily: FONTS.display, fontSize: 20, color: COLORS.ink, marginTop: 6, lineHeight: 1.2 }}>{i.title}</span>
                <span style={{ display: 'block', fontFamily: FONTS.body, fontSize: 13, color: COLORS.mute, marginTop: 4, lineHeight: 1.45 }}>{i.summary}</span>
                {i.time_label && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: FONTS.body, fontSize: 12, color: COLORS.mute, marginTop: 6 }}>
                    <Clock size={13} aria-hidden="true" /> {i.time_label}{i.how_often ? ` · ${i.how_often}` : ''}
                  </span>
                )}
              </span>
              <ChevronRight size={20} color={COLORS.mute} />
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}

function Tag({ children, tone }) {
  return (
    <span style={{ padding: '3px 9px', borderRadius: 999, background: tint(tone || COLORS.gold, 18), fontFamily: FONTS.body, fontSize: 11, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: COLORS.ink }}>
      {children}
    </span>
  );
}
