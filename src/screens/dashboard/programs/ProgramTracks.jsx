import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { PROGRAM_TILES, TRACK_TILES } from '../../../brand/tokens';
import SubHeader from '../../../components/SubHeader';
import HomeTile from '../../../components/HomeTile';
import { loadPrograms } from '../../../lib/programs';
import { PageIntro, Muted, pagePad, tileStack } from './shared';

// Step 2: choose the program (Rooted & Rising, Vessel & Valor, Grit & Glory)
export default function ProgramTracks() {
  const { level } = useParams();
  const [tracks, setTracks] = useState(null);

  useEffect(() => {
    loadPrograms().then(({ programs }) => {
      const byTrack = {};
      programs
        .filter((p) => p.level_key === level)
        .sort((a, b) => (a.days_per_week || 0) - (b.days_per_week || 0))
        .forEach((p) => {
          if (!byTrack[p.track]) byTrack[p.track] = { name: p.track, description: p.description, splits: [] };
          byTrack[p.track].splits.push(p.days_per_week);
        });
      setTracks(Object.values(byTrack).sort((a, b) => a.name.localeCompare(b.name)));
    });
  }, [level]);

  return (
    <>
      <SubHeader title={PROGRAM_TILES[level]?.title || 'Programs'} />
      <div style={pagePad}>
        <PageIntro title="Choose your program" />
        {tracks && tracks.length === 0 && <Muted style={{ marginTop: 16 }}>No programs at this level yet.</Muted>}
        <div style={tileStack}>
          {(tracks || []).map((t) => {
            const tile = TRACK_TILES[t.name] || {};
            const days = [...new Set(t.splits)].join(', ');
            return (
              <HomeTile
                key={t.name}
                title={t.name}
                sub={`${days} days a week`}
                to={`/dashboard/programs/level/${level}/${encodeURIComponent(t.name)}`}
                image={tile.image}
                tone={tile.tone || 'olive'}
              />
            );
          })}
        </div>
      </div>
    </>
  );
}
