import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { COLORS, FONTS, PROGRAM_TILES, SESSION_TONES } from '../../../brand/tokens';
import SubHeader from '../../../components/SubHeader';
import HomeTile from '../../../components/HomeTile';
import { supabase } from '../../../lib/supabaseClient';
import { Muted, pagePad, tileStack } from './shared';

export default function ProgramSplits() {
  const { location, level } = useParams();
  const [programs, setPrograms] = useState(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('workout_programs')
        .select('id, title, track, days_per_week, description, image')
        .eq('location', location)
        .eq('level_key', level)
        .order('days_per_week', { ascending: true });
      setPrograms(data || []);
    })();
  }, [location, level]);

  // Group by track in case a level ever has more than one
  const tracks = [];
  (programs || []).forEach((p) => {
    let t = tracks.find((x) => x.name === p.track);
    if (!t) tracks.push((t = { name: p.track, items: [] }));
    t.items.push(p);
  });

  return (
    <>
      <SubHeader title={PROGRAM_TILES[level]?.title || 'Programs'} />
      <div style={pagePad}>
        {programs && programs.length === 0 && <Muted style={{ marginTop: 12 }}>No programs here yet.</Muted>}
        {tracks.map((t) => (
          <div key={t.name} style={{ marginTop: 8 }}>
            <div style={{ fontFamily: FONTS.display, fontSize: 30, fontWeight: 500, color: COLORS.ink }}>{t.name}</div>
            {t.items[0]?.description && <Muted style={{ marginTop: 4 }}>{t.items[0].description}</Muted>}
            <div style={tileStack}>
              {t.items.map((p, i) => (
                <HomeTile
                  key={p.id}
                  title={`${p.days_per_week} sessions a week`}
                  to={`/dashboard/programs/view/${p.id}`}
                  image={p.image}
                  tone={SESSION_TONES[i % SESSION_TONES.length]}
                  height={180}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
