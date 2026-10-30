import { COLORS, FONTS } from '../../brand/tokens';

// Small form pieces shared by the admin screens

export function Field({ label, hint, children, style }) {
  return (
    <label style={{ display: 'block', marginTop: 14, ...style }}>
      <span style={{ display: 'block', fontFamily: FONTS.body, fontSize: 13, fontWeight: 600, color: COLORS.mute, marginBottom: 6 }}>{label}</span>
      {children}
      {hint && <span style={{ display: 'block', fontFamily: FONTS.body, fontSize: 12, color: COLORS.mute, marginTop: 4 }}>{hint}</span>}
    </label>
  );
}

const base = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '11px 12px',
  borderRadius: 12,
  border: `1px solid ${COLORS.line}`,
  background: COLORS.surface,
  fontFamily: FONTS.body,
  fontSize: 15,
  color: COLORS.ink,
  outline: 'none',
};

export function TextInput({ value, onChange, style, ...rest }) {
  return <input value={value ?? ''} onChange={(e) => onChange(e.target.value)} style={{ ...base, ...style }} {...rest} />;
}

export function NumberInput({ value, onChange, style, ...rest }) {
  return (
    <input
      inputMode="decimal"
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value.replace(/[^\d.]/g, ''))}
      style={{ ...base, ...style }}
      {...rest}
    />
  );
}

export function TextArea({ value, onChange, rows = 4, style, ...rest }) {
  return <textarea value={value ?? ''} rows={rows} onChange={(e) => onChange(e.target.value)} style={{ ...base, resize: 'vertical', lineHeight: 1.5, ...style }} {...rest} />;
}

export function Select({ value, onChange, options, style, ...rest }) {
  return (
    <select value={value ?? ''} onChange={(e) => onChange(e.target.value)} style={{ ...base, ...style }} {...rest}>
      {options.map((o) => {
        const [v, l] = Array.isArray(o) ? o : [o, o];
        return <option key={v} value={v}>{l}</option>;
      })}
    </select>
  );
}

export function Button({ children, onClick, kind = 'primary', disabled, style, type = 'button' }) {
  const kinds = {
    primary: { background: COLORS.ink, color: COLORS.bg, border: 'none' },
    secondary: { background: COLORS.surface, color: COLORS.ink, border: `1px solid ${COLORS.line}` },
    danger: { background: COLORS.surface, color: '#B0413E', border: '1px solid #E4C3C1' },
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{ padding: '11px 16px', borderRadius: 12, fontFamily: FONTS.body, fontSize: 14, fontWeight: 600, cursor: disabled ? 'default' : 'pointer', opacity: disabled ? 0.55 : 1, display: 'inline-flex', alignItems: 'center', gap: 6, ...kinds[kind], ...style }}
    >
      {children}
    </button>
  );
}

export function Card({ children, style }) {
  return <div style={{ padding: 16, borderRadius: 18, background: COLORS.surface, border: `1px solid ${COLORS.line}`, ...style }}>{children}</div>;
}

export function Heading({ children, style }) {
  return <h1 style={{ margin: 0, fontFamily: FONTS.display, fontSize: 30, fontWeight: 500, color: COLORS.ink, lineHeight: 1.1, ...style }}>{children}</h1>;
}

export function SubHeading({ children, style }) {
  return <h2 style={{ margin: '26px 0 0', fontFamily: FONTS.display, fontSize: 24, fontWeight: 500, color: COLORS.ink, ...style }}>{children}</h2>;
}

export function Note({ children, style, tone }) {
  const color = tone === 'error' ? '#B0413E' : tone === 'ok' ? COLORS.olive : COLORS.mute;
  return <p style={{ fontFamily: FONTS.body, fontSize: 13, color, lineHeight: 1.5, margin: '8px 0 0', ...style }}>{children}</p>;
}

export function Row({ children, style }) {
  return <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', ...style }}>{children}</div>;
}
