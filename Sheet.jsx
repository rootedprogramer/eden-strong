import { useEffect } from 'react';
import { X } from 'lucide-react';
import { COLORS, FONTS } from '../brand/tokens';

// Bottom sheet for small forms (add entry, add chart, set goal).
export default function Sheet({ title, onClose, children }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 20, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ width: '100%', maxWidth: 480, background: COLORS.bg, borderRadius: '22px 22px 0 0', padding: '18px 18px calc(24px + env(safe-area-inset-bottom, 0px))' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontFamily: FONTS.display, fontSize: 26, fontWeight: 500, color: COLORS.ink }}>{title}</div>
          <button onClick={onClose} aria-label="Close" style={{ background: 'none', border: 'none', color: COLORS.ink, cursor: 'pointer', padding: 6 }}>
            <X size={22} />
          </button>
        </div>
        <div style={{ marginTop: 14 }}>{children}</div>
      </div>
    </div>
  );
}

export const fieldLabel = { display: 'block', fontFamily: FONTS.body, fontSize: 13, fontWeight: 600, color: COLORS.mute, marginBottom: 6 };
export const fieldInput = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '13px 14px',
  borderRadius: 14,
  border: `1px solid ${COLORS.line}`,
  background: COLORS.surface,
  fontFamily: FONTS.body,
  fontSize: 16,
  color: COLORS.ink,
  outline: 'none',
};
export const primaryButton = {
  width: '100%',
  marginTop: 18,
  padding: '15px',
  borderRadius: 16,
  border: 'none',
  background: COLORS.ink,
  color: COLORS.bg,
  fontFamily: FONTS.body,
  fontSize: 16,
  fontWeight: 600,
  cursor: 'pointer',
};
