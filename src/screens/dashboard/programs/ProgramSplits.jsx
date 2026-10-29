import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { SESSION_TONES } from '../../../brand/tokens';
import SubHeader from '../../../components/SubHeader';
import HomeTile from '../../../components/HomeTile';
import { loadPrograms } from '../../../lib/programs';
import { Muted, PageIntro, pagePad, tileStack } from './shared';

// Step 3: choose the split (3 to 6 days a week)
export default function ProgramSplits() {
  const { level, track } = useParams();
  const name = decodeURIComponent(track);
  const [programs, setPrograms] = useState(null);

  useEffect(() => {
    loadPrograms().then(({ programs: all }) => {
      setPrograms(all.filter((p) => p.level_key === level && p.track === name).sort((a, b) => (a.days_per_week || 0) - (b.days_per_week || 0)));
    });
  }, [level, name]);

  return (
    <>
      <SubHeader title={name} />
      <div style={pagePad}>
        <PageIntro title="How many days a week?">{programs?.[0]?.description}</PageIntro>
        {programs && programs.length === 0 && <Muted style={{ marginTop: 16 }}>No splits found for this program.</Muted>}
        <div style={tileStack}>
          {(programs || []).map((p, i) => (
            <HomeTile
              key={p.id}
              title={`${p.days_per_week} days a week`}
              to={`/dashboard/programs/view/${p.id}`}
              image={p.image}
              tone={SESSION_TONES[i % SESSION_TONES.length]}
              height={170}
            />
          ))}
        </div>
      </div>
    </>
  );
}
