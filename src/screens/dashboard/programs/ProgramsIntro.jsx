import { useEffect, useState } from 'react';
import { COLORS, FONTS, PROGRAM_TILES } from '../../../brand/tokens';
import SubHeader from '../../../components/SubHeader';
import HomeTile from '../../../components/HomeTile';
import { loadPrograms } from '../../../lib/programs';
import { PageIntro, Muted, pagePad, tileStack } from './shared';

export default function ProgramsIntro() {
  const [counts, setCounts] = useState({ gym: null, home: null });

  useEffect(() => {
    (async () => {
      const { programs } = await loadPrograms();
      const c = { gym: 0, home: 0 };
      programs.forEach((p) => { c[p.location] = (c[p.location] || 0) + 1; });
      setCounts(c);
    })();
  }, []);

  return (
    <>
      <SubHeader title="Programs" />
      <div style={pagePad}>
        <PageIntro title="Pick your plan and press start">
          Whatever season you’re in, there’s a place to start here:
        </PageIntro>
        <ul style={{ fontFamily: FONTS.body, fontSize: 15, color: COLORS.ink, lineHeight: 1.7, margin: '8px 0 0', paddingLeft: 20 }}>
          <li>Gym programs, with home programs on the way</li>
          <li>Beginner and experienced options</li>
          <li>3 to 6 training days a week</li>
          <li>A deep core finisher and a devotion to go with your training</li>
        </ul>
        <Muted style={{ marginTop: 12, fontStyle: 'italic' }}>
          Your plan shows up on your home page, so you can just open the app and go.
        </Muted>

        <div style={{ marginTop: 30 }}>
          <div style={{ fontFamily: FONTS.body, fontSize: 13, fontWeight: 600, color: COLORS.gold }}>Start here</div>
          <PageIntro title="Where are you training?">Pick the setup that fits your life right now.</PageIntro>
        </div>

        <div style={tileStack}>
          {['gym', 'home'].map((loc) => {
            const t = PROGRAM_TILES[loc];
            const n = counts[loc];
            const sub = n === null ? '' : n === 0 ? 'Coming soon' : null;
            return <HomeTile key={loc} title={t.title} sub={sub} to={`/dashboard/programs/${loc}`} image={t.image} tone={t.tone} />;
          })}
        </div>
      </div>
    </>
  );
}
