import { Play, Dumbbell } from 'lucide-react';
import { COLORS } from '../brand/tokens';

// Square image on the left of an exercise card. Uses the exercise's thumbnail
// when one is set; otherwise a color block in the section's tone.
export default function ExerciseThumb({ media, tone = 'ink', size = 92 }) {
  const hasVideo = !!media?.video_url;
  return (
    <div style={{ position: 'relative', width: size, alignSelf: 'stretch', minHeight: size, flexShrink: 0, background: COLORS[tone] || COLORS.ink, overflow: 'hidden' }}>
      {media?.thumbnail_url && (
        <img src={media.thumbnail_url} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
      )}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {hasVideo ? (
          <span style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Play size={16} color="#fff" fill="#fff" />
          </span>
        ) : (
          !media?.thumbnail_url && <Dumbbell size={24} color="rgba(255,255,255,0.75)" />
        )}
      </div>
    </div>
  );
}
