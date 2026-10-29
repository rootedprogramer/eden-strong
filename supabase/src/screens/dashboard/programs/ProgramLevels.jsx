import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { LEVEL_ORDER, PROGRAM_TILES } from '../../../brand/tokens';
import SubHeader from '../../../components/SubHeader';
import HomeTile from '../../../components/HomeTile';
import { supabase } from '../../../lib/supabaseClient';
import { PageIntro, Muted, pagePad, tileStack } from './shared';

export default function ProgramLevels() {
  const { location } = useParams();
  const [levels, setLevels] = useState(null); // { beginner: ['Rooted & Rising'], ... }

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('workout_programs').select('track, level_key, location').eq('location', location);
      const byLevel = {};
      (data || []).forEach((p) => {
        const key = p.level_key || 'beginner';
        byLevel[key] = byLevel[key] || [];
        if (p.track && !byLevel[key].includes(p.track)) byLevel[key].push(p.track);
      });
      setLevels(byLevel);
    })();
  }, [location]);

  const title = PROGRAM_TILES[location]?.title || 'Programs';
  const available = levels ? LEVEL_ORDER.filter((l) => levels[l]) : [];

  return (
    <>
      <SubHeader title={title} />
      <div style={pagePad}>
        <PageIntro title="Choose your level">
          Pick the level that matches your fitness and confidence right now. You can always change it later.
        </PageIntro>
        {levels && available.length === 0 && (
          <Muted style={{ marginTop: 18 }}>
            {location === 'home' ? 'Home programs are coming soon. For now, everything is built for the gym.' : 'No programs here yet.'}
          </Muted>
        )}
        <div style={tileStack}>
          {available.map((l) => (
            <HomeTile
              key={l}
              title={PROGRAM_TILES[l].title}
              sub={levels[l].join(' and ')}
              to={`/dashboard/programs/${location}/${l}`}
              image={PROGRAM_TILES[l].image}
              tone={PROGRAM_TILES[l].tone}
            />
          ))}
        </div>
      </div>
    </>
  );
}
