import { COLORS, FONTS } from '../../../brand/tokens';

export function PageIntro({ title, children }) {
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ fontFamily: FONTS.display, fontSize: 32, fontWeight: 500, color: COLORS.ink, lineHeight: 1.05 }}>{title}</div>
      {children && (
        <div style={{ fontFamily: FONTS.body, fontSize: 15, color: COLORS.ink, lineHeight: 1.55, marginTop: 8 }}>{children}</div>
      )}
    </div>
  );
}

export function Muted({ children, style }) {
  return <div style={{ fontFamily: FONTS.body, fontSize: 14, color: COLORS.mute, lineHeight: 1.5, ...style }}>{children}</div>;
}

export const pagePad = { padding: '4px 18px 32px' };
export const tileStack = { display: 'flex', flexDirection: 'column', gap: 14, marginTop: 18 };
