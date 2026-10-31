import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { COLORS, FONTS } from '../brand/tokens';

// Back arrow with a centered page title, like the reference app's inner pages.
export default function SubHeader({ title }) {
  const navigate = useNavigate();
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr 40px', alignItems: 'center', padding: '10px 10px 4px' }}>
      <button
        onClick={() => navigate(-1)}
        aria-label="Back"
        style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', color: COLORS.ink, cursor: 'pointer' }}
      >
        <ChevronLeft size={26} />
      </button>
      <div style={{ textAlign: 'center', fontFamily: FONTS.body, fontSize: 15, fontWeight: 600, color: COLORS.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {title}
      </div>
      <span />
    </div>
  );
}
