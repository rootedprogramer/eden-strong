import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { LEVEL_ORDER, PROGRAM_TILES } from '../../../brand/tokens';
import SubHeader from '../../../components/SubHeader';
import HomeTile from '../../../components/HomeTile';
import { loadPrograms } from '../../../lib/programs';
import { PageIntro, Muted, pagePad, tileStack } from './shared';

export default function ProgramLevels() {
  const { location } = useParams();
  const [levels, setLevels] = useState(null); // { beginner: ['Rooted & Rising'], ... }
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    (async () => {
      const { programs, error } = await loadPrograms();
      if (error) setFailed(true);
      const byLevel = {};
      programs.filter((p) => p.location === location).forEach((p) => {
        const key = p.level_key;
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
        {failed && <Muted style={{ marginTop: 18 }}>Programs couldn’t load. Check your connection and try again.</Muted>}
        {levels && !failed && available.length === 0 && (
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
