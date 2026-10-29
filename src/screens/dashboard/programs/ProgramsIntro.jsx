import { useEffect, useState } from 'react';
import { COLORS, FONTS, LEVEL_ORDER, LEVEL_BLURBS, PROGRAM_TILES } from '../../../brand/tokens';
import SubHeader from '../../../components/SubHeader';
import HomeTile from '../../../components/HomeTile';
import { loadPrograms } from '../../../lib/programs';
import { PageIntro, Muted, pagePad, tileStack } from './shared';

// Step 1: Programs → choose Beginner or Experienced
export default function ProgramsIntro() {
  const [state, setState] = useState(null); // { programs, error }

  useEffect(() => { loadPrograms().then(setState); }, []);

  const levels = state ? LEVEL_ORDER.filter((l) => state.programs.some((p) => p.level_key === l)) : [];

  return (
    <>
      <SubHeader title="Programs" />
      <div style={pagePad}>
        <PageIntro title="Pick your plan and press start">
          Whatever season you’re in, there’s a place to start here:
        </PageIntro>
        <ul style={{ fontFamily: FONTS.body, fontSize: 15, color: COLORS.ink, lineHeight: 1.7, margin: '8px 0 0', paddingLeft: 20 }}>
          <li>Beginner and experienced programs</li>
          <li>3 to 6 training days a week</li>
          <li>A devotion to go with your training</li>
        </ul>
        <Muted style={{ marginTop: 12, fontStyle: 'italic' }}>
          Your plan shows up on your home page, so you can just open the app and go.
        </Muted>

        <div style={{ marginTop: 28 }}>
          <div style={{ fontFamily: FONTS.body, fontSize: 13, fontWeight: 600, color: COLORS.gold }}>Start here</div>
          <PageIntro title="Choose your level">You can always change it later.</PageIntro>
        </div>

        {state === null && <Muted style={{ marginTop: 16 }}>Loading…</Muted>}
        {state?.error && (
          <Muted style={{ marginTop: 16, color: '#B0413E' }}>
            Programs couldn’t load: {state.error.message}
          </Muted>
        )}
        {state && !state.error && state.programs.length === 0 && (
          <Muted style={{ marginTop: 16 }}>
            No programs were found in the database yet. Run setup_programs_and_tracking.sql in Supabase to add them.
          </Muted>
        )}

        <div style={tileStack}>
          {levels.map((l) => (
            <HomeTile
              key={l}
              title={PROGRAM_TILES[l].title}
              sub={LEVEL_BLURBS[l]}
              to={`/dashboard/programs/level/${l}`}
              image={PROGRAM_TILES[l].image}
              tone={PROGRAM_TILES[l].tone}
            />
          ))}
        </div>
      </div>
    </>
  );
}
