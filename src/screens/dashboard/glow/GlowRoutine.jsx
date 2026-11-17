import { useEffect, useState } from 'react';
import { Navigate, useOutletContext } from 'react-router-dom';
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';
import { COLORS, FONTS } from '../../../brand/tokens';
import SubHeader from '../../../components/SubHeader';
import { supabase } from '../../../lib/supabaseClient';
import { HAIR_TYPES, SKIN_TYPES, SLOTS, addStep, loadGlowHome, saveProfile } from '../../../lib/glow';
import { Chips } from './Glow';

// Edit my routine: reorder, remove, add my own steps, and change skin/hair type.
export default function GlowRoutine() {
  const { edition } = useOutletContext() || {};
  const [data, setData] = useState(null);
  const [draft, setDraft] = useState({ am: '', pm: '', weekly: '' });

  const reload = () => loadGlowHome().then(setData);
  useEffect(() => { reload(); }, []);

  if (edition && edition.id !== 'women') return <Navigate to="/dashboard" replace />;
  if (!data) return <SubHeader title="My routine" />;

  const bySlot = (slot) => data.steps.filter((s) => s.slot === slot);

  const move = async (slot, index, dir) => {
    const list = bySlot(slot);
    const other = list[index + dir];
    if (!other) return;
    const a = list[index];
    await Promise.all([
      supabase.from('glow_steps').update({ sort_order: other.sort_order }).eq('id', a.id),
      supabase.from('glow_steps').update({ sort_order: a.sort_order }).eq('id', other.id),
    ]);
    reload();
  };
  const remove = async (id) => {
    await supabase.from('glow_steps').delete().eq('id', id);
    reload();
  };
  const add = async (slot) => {
    const title = draft[slot].trim();
    if (!title) return;
    await addStep(slot, title);
    setDraft((d) => ({ ...d, [slot]: '' }));
    reload();
  };
  const setType = async (field, value) => {
    const next = { skin_type: data.profile?.skin_type || null, hair_type: data.profile?.hair_type || null, [field]: value || null };
    await saveProfile(next.skin_type, next.hair_type);
    setData((d) => ({ ...d, profile: { ...(d.profile || {}), ...next } }));
  };

  return (
    <>
      <SubHeader title="My routine" />
      <div style={{ padding: '4px 16px 48px' }}>
        {SLOTS.map((slot) => (
          <section key={slot.id} style={{ marginTop: 18 }}>
            <h2 style={{ margin: '0 2px', fontFamily: FONTS.display, fontSize: 24, fontWeight: 500, color: COLORS.ink }}>{slot.id === 'weekly' ? 'Weekly' : slot.label}</h2>
            <div style={{ marginTop: 10, borderRadius: 18, background: COLORS.surface, border: `1px solid ${COLORS.line}`, overflow: 'hidden' }}>
              {bySlot(slot.id).map((s, i, arr) => (
                <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 10px 10px 14px', borderTop: i ? `1px solid ${COLORS.line}` : 'none' }}>
                  <span style={{ flex: 1, fontFamily: FONTS.body, fontSize: 15, color: COLORS.ink }}>{s.title}</span>
                  <IconBtn label="Move up" disabled={i === 0} onClick={() => move(slot.id, i, -1)}><ArrowUp size={16} /></IconBtn>
                  <IconBtn label="Move down" disabled={i === arr.length - 1} onClick={() => move(slot.id, i, 1)}><ArrowDown size={16} /></IconBtn>
                  <IconBtn label={`Remove ${s.title}`} onClick={() => remove(s.id)}><Trash2 size={16} /></IconBtn>
                </div>
              ))}
              <div style={{ display: 'flex', gap: 8, padding: 10, borderTop: bySlot(slot.id).length ? `1px solid ${COLORS.line}` : 'none' }}>
                <input
                  value={draft[slot.id]}
                  onChange={(e) => setDraft((d) => ({ ...d, [slot.id]: e.target.value }))}
                  onKeyDown={(e) => e.key === 'Enter' && add(slot.id)}
                  placeholder="Add your own step"
                  aria-label={`Add a ${slot.label.toLowerCase()} step`}
                  style={{ flex: 1, minWidth: 0, padding: '10px 12px', borderRadius: 12, border: `1px solid ${COLORS.line}`, background: 'transparent', fontFamily: FONTS.body, fontSize: 15, color: COLORS.ink }}
                />
                <button onClick={() => add(slot.id)} aria-label="Add step" style={{ width: 42, borderRadius: 12, border: 'none', background: COLORS.ink, color: COLORS.bg, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Plus size={18} />
                </button>
              </div>
            </div>
          </section>
        ))}

        <section style={{ marginTop: 26 }}>
          <h2 style={{ margin: '0 2px', fontFamily: FONTS.display, fontSize: 24, fontWeight: 500, color: COLORS.ink }}>About me</h2>
          <Chips label="My skin is" options={SKIN_TYPES} value={data.profile?.skin_type || ''} onChange={(v) => setType('skin_type', v)} />
          <Chips label="My hair is" options={HAIR_TYPES} value={data.profile?.hair_type || ''} onChange={(v) => setType('hair_type', v)} />
          <p style={{ marginTop: 10, fontFamily: FONTS.body, fontSize: 13, color: COLORS.mute, lineHeight: 1.5 }}>Glow Up uses these to put the guides and recipes that fit you first.</p>
        </section>
      </div>
    </>
  );
}

function IconBtn({ label, onClick, disabled, children }) {
  return (
    <button onClick={onClick} disabled={disabled} aria-label={label} style={{ width: 34, height: 34, borderRadius: 10, border: 'none', background: 'transparent', color: disabled ? COLORS.line : COLORS.ink, cursor: disabled ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {children}
    </button>
  );
}
