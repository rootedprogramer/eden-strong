import { useOutletContext } from 'react-router-dom';
import { MessageSquare, Phone } from 'lucide-react';
import { COLORS, FONTS, tint } from '../../../brand/tokens';
import SubHeader from '../../../components/SubHeader';

// Crisis and support lines (United States).
export default function MindHelp() {
  const { edition } = useOutletContext() || {};
  const lines = [
    { title: 'In immediate danger', body: 'Call 911, or go to the nearest emergency room.', actions: [['Call 911', 'tel:911', Phone]] },
    { title: '988 Suicide & Crisis Lifeline', body: 'Free, 24/7 support from trained crisis counselors for anyone in emotional distress, thinking about suicide, or worried about someone else. Para español, marque 988 y oprima 2.', actions: [['Call 988', 'tel:988', Phone], ['Text 988', 'sms:988', MessageSquare], ['Chat online', 'https://988lifeline.org/chat/', MessageSquare]] },
    { title: 'Crisis Text Line', body: 'If texting feels easier, text HOME to 741741 any time.', actions: [['Text HOME to 741741', 'sms:741741&body=HOME', MessageSquare]] },
    edition?.id !== 'men' && { title: 'National Maternal Mental Health Hotline', body: 'For pregnant and new moms who feel overwhelmed, anxious, sad, or not like themselves. Free and 24/7, call or text.', actions: [['Call 1-833-TLC-MAMA', 'tel:18338526262', Phone], ['Text', 'sms:18338526262', MessageSquare]] },
    edition?.id !== 'women' && { title: 'Veterans and service members', body: 'Call 988 and press 1, or text 838255, to reach the Veterans Crisis Line.', actions: [['Call 988, press 1', 'tel:988', Phone], ['Text 838255', 'sms:838255', MessageSquare]] },
  ].filter(Boolean);

  return (
    <>
      <SubHeader title="Get support" />
      <div style={{ padding: '4px 16px 48px' }}>
        <h1 style={{ margin: 0, fontFamily: FONTS.display, fontSize: 30, fontWeight: 500, color: COLORS.ink }}>You are not alone</h1>
        <p style={{ margin: '8px 0 0', fontFamily: FONTS.body, fontSize: 15, color: COLORS.mute, lineHeight: 1.55 }}>
          Reaching out is a strong and faithful thing to do. These lines are free and open day and night in the United States.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 18 }}>
          {lines.map((l, i) => (
            <section key={l.title} style={{ padding: 18, borderRadius: 20, background: i === 0 ? tint(COLORS.rose, 24) : COLORS.surface, border: `1px solid ${i === 0 ? COLORS.rose : COLORS.line}` }}>
              <h2 style={{ margin: 0, fontFamily: FONTS.display, fontSize: 21, fontWeight: 500, color: COLORS.ink }}>{l.title}</h2>
              <p style={{ margin: '6px 0 0', fontFamily: FONTS.body, fontSize: 14, color: COLORS.ink, lineHeight: 1.55 }}>{l.body}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
                {l.actions.map(([label, href, Icon]) => (
                  <a key={label} href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noreferrer"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 16px', borderRadius: 999, background: COLORS.deep, color: '#fff', fontFamily: FONTS.body, fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
                    <Icon size={16} aria-hidden="true" /> {label}
                  </a>
                ))}
              </div>
            </section>
          ))}
        </div>

        <section style={{ marginTop: 22 }}>
          <h2 style={{ margin: 0, fontFamily: FONTS.display, fontSize: 24, fontWeight: 500, color: COLORS.ink }}>Finding ongoing support</h2>
          <ul style={{ margin: '10px 0 0', paddingLeft: 20, fontFamily: FONTS.body, fontSize: 15, color: COLORS.ink, lineHeight: 1.65 }}>
            <li>Talk to your doctor. They can check for physical causes and refer you to a counselor.</li>
            <li>Ask your pastor or church about Christian counselors in your area.</li>
            <li>Check your insurance for covered therapists, including online visits.</li>
            <li>Tell one trusted friend or family member how you’re really doing.</li>
          </ul>
          <p style={{ marginTop: 16, fontFamily: FONTS.body, fontSize: 14, color: COLORS.mute, lineHeight: 1.55 }}>
            Getting help is not a lack of faith. God often works through the people He puts around us, counselors and doctors included.
          </p>
        </section>
      </div>
    </>
  );
}
