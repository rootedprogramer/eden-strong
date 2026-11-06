import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { SESSION_TONES, brandArt } from '../../../brand/tokens';
import SubHeader from '../../../components/SubHeader';
import HomeTile from '../../../components/HomeTile';
import { loadPrograms } from '../../../lib/programs';
import { Muted, PageIntro, pagePad, tileStack } from './shared';
import { useTheme } from '../../../theme/ThemeContext';

// Step 3: choose the split (3 to 6 days a week)
export default function ProgramSplits() {
  const brand = useTheme().path;
  const art = brandArt(brand);
  const { level, track } = useParams();
  const name = decodeURIComponent(track);
  const [programs, setPrograms] = useState(null);

  useEffect(() => {
    loadPrograms(brand).then(({ programs: all }) => {
      setPrograms(all.filter((p) => p.level_key === level && p.track === name).sort((a, b) => (a.days_per_week || 0) - (b.days_per_week || 0)));
    });
  }, [level, name]);

  return (
    <>
      <SubHeader title={name} />
      <div style={pagePad}>
        <PageIntro title="How many days a week?">{firstSentence(programs?.[0]?.description)}</PageIntro>
        {programs && programs.length === 0 && <Muted style={{ marginTop: 16 }}>No splits found for this program.</Muted>}
        <div style={tileStack}>
          {(programs || []).map((p, i) => (
            <HomeTile art="program"
              key={p.id}
              title={`${p.days_per_week} days a week`}
              sub={variantOf(p.title)}
              to={`/dashboard/programs/view/${p.id}`}
              image={p.image || art.splits[i % art.splits.length]}
              tone={SESSION_TONES[i % SESSION_TONES.length]}
              height={170}
            />
          ))}
        </div>
      </div>
    </>
  );
}

// "Faith Forged — 4 Days · Full Body at Home" → "Full Body at Home"
function variantOf(title) {
  const i = String(title || '').indexOf('·');
  return i >= 0 ? title.slice(i + 1).trim() : null;
}

// The opening line of a program description, which applies to every version
function firstSentence(text) {
  if (!text) return null;
  const m = String(text).match(/^.*?[.!?](\)|\s|$)/);
  return m ? m[0].trim() : text;
}
