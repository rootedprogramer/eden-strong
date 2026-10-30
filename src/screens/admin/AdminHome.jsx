import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, ChevronRight, Search, ShieldCheck } from 'lucide-react';
import { COLORS, FONTS, getEdition } from '../../brand/tokens';
import SubHeader from '../../components/SubHeader';
import Sheet from '../../components/Sheet';
import { Button, Card, Field, Heading, Note, Select, TextInput } from '../../components/admin/ui';
import { RECIPE_CATEGORY_OPTIONS, useIsAdmin } from '../../lib/admin';
import { supabase } from '../../lib/supabaseClient';

const TABS = [['members', 'Members'], ['programs', 'Programs'], ['recipes', 'Recipes'], ['plans', 'Meal plans']];

export function AdminGate({ children }) {
  const isAdmin = useIsAdmin();
  if (isAdmin === null) return <SubHeader title="Admin" />;
  if (!isAdmin) {
    return (
      <>
        <SubHeader title="Admin" />
        <div style={{ padding: '8px 18px' }}>
          <Heading>Admins only</Heading>
          <Note>This area is for the Eden Strong team.</Note>
        </div>
      </>
    );
  }
  return children;
}

export default function AdminHome() {
  const [params, setParams] = useSearchParams();
  const tab = TABS.some(([k]) => k === params.get('tab')) ? params.get('tab') : 'members';

  return (
    <AdminGate>
      <SubHeader title="Admin" />
      <div role="tablist" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', borderBottom: `1px solid ${COLORS.line}` }}>
        {TABS.map(([key, label]) => (
          <button
            key={key}
            role="tab"
            aria-selected={tab === key}
            onClick={() => setParams({ tab: key }, { replace: true })}
            style={{ padding: '12px 0 10px', background: 'none', border: 'none', borderBottom: `3px solid ${tab === key ? COLORS.ink : 'transparent'}`, fontFamily: FONTS.body, fontSize: 14, fontWeight: 600, color: tab === key ? COLORS.ink : COLORS.mute, cursor: 'pointer' }}
          >
            {label}
          </button>
        ))}
      </div>
      <div style={{ padding: '16px 16px 60px' }}>
        {tab === 'members' && <MembersTab />}
        {tab === 'programs' && <ProgramsTab />}
        {tab === 'recipes' && <RecipesTab />}
        {tab === 'plans' && <PlansTab />}
      </div>
    </AdminGate>
  );
}

/* ───────────── Members ───────────── */

function MembersTab() {
  const [members, setMembers] = useState(null);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(null);
  const [programs, setPrograms] = useState([]);
  const [plans, setPlans] = useState([]);

  const load = async () => {
    const { data, error: err } = await supabase.rpc('admin_members');
    if (err) setError(err.message);
    setMembers(data || []);
  };

  useEffect(() => {
    load();
    supabase.from('workout_programs').select('id, title').then(({ data }) => setPrograms((data || []).sort((a, b) => a.title.localeCompare(b.title))));
    supabase.from('meal_plans').select('id, title').then(({ data }) => setPlans((data || []).sort((a, b) => a.title.localeCompare(b.title))));
  }, []);

  const q = query.toLowerCase();
  const shown = (members || []).filter((m) => `${m.name || ''} ${m.email || ''}`.toLowerCase().includes(q));

  return (
    <>
      <Heading>Members</Heading>
      <Note>Tap someone to put them on a program or meal plan.</Note>
      <div style={{ position: 'relative', marginTop: 12 }}>
        <Search size={18} color={COLORS.mute} style={{ position: 'absolute', left: 12, top: 13 }} />
        <TextInput value={query} onChange={setQuery} placeholder="Search by name or email" aria-label="Search members" style={{ paddingLeft: 38 }} />
      </div>
      {error && <Note tone="error">{error}</Note>}
      {members && <Note>{members.length} {members.length === 1 ? 'member' : 'members'}</Note>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10 }}>
        {shown.map((m) => (
          <button key={m.id} onClick={() => setOpen(m)} style={{ textAlign: 'left', padding: '14px 16px', borderRadius: 16, background: COLORS.surface, border: `1px solid ${COLORS.line}`, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: FONTS.body, fontSize: 15, fontWeight: 600, color: COLORS.ink }}>
                {m.name || 'No name yet'} {m.is_admin && <ShieldCheck size={15} color={COLORS.gold} aria-label="Admin" />}
              </div>
              <div style={{ fontFamily: FONTS.body, fontSize: 12, color: COLORS.mute, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {m.email}{getEdition(m.edition) ? `, ${getEdition(m.edition).name}` : ''}
              </div>
              <div style={{ fontFamily: FONTS.body, fontSize: 12, color: COLORS.ink, marginTop: 4 }}>
                {m.program_title || 'No program'} · {m.plan_title || 'No meal plan'}
              </div>
            </div>
            <ChevronRight size={18} color={COLORS.mute} />
          </button>
        ))}
      </div>
      {open && <MemberSheet member={open} programs={programs} plans={plans} onClose={() => setOpen(null)} onSaved={() => { setOpen(null); load(); }} />}
    </>
  );
}

function MemberSheet({ member, programs, plans, onClose, onSaved }) {
  const [programId, setProgramId] = useState(member.program_id || '');
  const [planId, setPlanId] = useState(member.plan_id || '');
  const [admin, setAdmin] = useState(!!member.is_admin);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const save = async () => {
    setSaving(true);
    setError('');
    const calls = [];
    if ((programId || null) !== (member.program_id || null)) calls.push(supabase.rpc('admin_assign_program', { member: member.id, program: programId || null }));
    if ((planId || null) !== (member.plan_id || null)) calls.push(supabase.rpc('admin_assign_meal_plan', { member: member.id, plan: planId || null }));
    if (admin !== !!member.is_admin) calls.push(supabase.rpc('admin_set_admin', { member: member.id, make_admin: admin }));
    const results = await Promise.all(calls);
    const failed = results.find((r) => r.error);
    setSaving(false);
    if (failed) return setError(failed.error.message);
    onSaved();
  };

  return (
    <Sheet title={member.name || member.email} onClose={onClose}>
      <Note style={{ marginTop: 0 }}>{member.email}</Note>
      <Field label="Program" hint="Changing it starts them on the new program this week.">
        <Select value={programId} onChange={setProgramId} options={[['', 'No program'], ...programs.map((p) => [p.id, p.title])]} />
      </Field>
      <Field label="Meal plan">
        <Select value={planId} onChange={setPlanId} options={[['', 'No meal plan'], ...plans.map((p) => [p.id, p.title])]} />
      </Field>
      <label style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 16, fontFamily: FONTS.body, fontSize: 15, color: COLORS.ink }}>
        <input type="checkbox" checked={admin} onChange={(e) => setAdmin(e.target.checked)} style={{ width: 20, height: 20 }} />
        Admin (can edit programs, recipes, and members)
      </label>
      {error && <Note tone="error">{error}</Note>}
      <Button onClick={save} disabled={saving} style={{ width: '100%', justifyContent: 'center', marginTop: 18, padding: 14 }}>
        {saving ? 'Saving…' : 'Save'}
      </Button>
    </Sheet>
  );
}

/* ───────────── Programs ───────────── */

function ProgramsTab() {
  const [programs, setPrograms] = useState(null);
  useEffect(() => {
    supabase.from('workout_programs').select('id, title, track, days_per_week, level_key, edition').then(({ data }) => setPrograms(data || []));
  }, []);

  const groups = {};
  (programs || []).forEach((p) => {
    const t = p.track || String(p.title).split(/\s[—–-]\s/)[0];
    (groups[t] = groups[t] || []).push(p);
  });

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <Heading>Programs</Heading>
        <Link to="/dashboard/admin/programs/new" style={{ textDecoration: 'none' }}><Button><Plus size={16} /> New</Button></Link>
      </div>
      <Note>Each split (3 days, 4 days…) is its own program. Use “Make a copy” inside a program to start a new split from an existing one.</Note>
      {Object.keys(groups).sort().map((track) => (
        <div key={track} style={{ marginTop: 18 }}>
          <div style={{ fontFamily: FONTS.display, fontSize: 22, color: COLORS.ink }}>{track}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
            {groups[track].sort((a, b) => (a.days_per_week || 0) - (b.days_per_week || 0)).map((p) => (
              <ListLink key={p.id} to={`/dashboard/admin/programs/${p.id}`} title={p.title} sub={[p.level_key === 'beginner' ? 'Beginner' : 'Experienced', getEdition(p.edition) ? `${getEdition(p.edition).name} only` : null].filter(Boolean).join(', ')} />
            ))}
          </div>
        </div>
      ))}
    </>
  );
}

/* ───────────── Recipes ───────────── */

function RecipesTab() {
  const [recipes, setRecipes] = useState(null);
  const [query, setQuery] = useState('');
  useEffect(() => {
    supabase.from('recipes').select('id, title, category, calories, protein').then(({ data }) => setRecipes(data || []));
  }, []);
  const q = query.toLowerCase();
  const shown = (recipes || []).filter((r) => r.title.toLowerCase().includes(q));
  const cats = [...RECIPE_CATEGORY_OPTIONS, 'No category'];

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <Heading>Recipes</Heading>
        <Link to="/dashboard/admin/recipes/new" style={{ textDecoration: 'none' }}><Button><Plus size={16} /> New</Button></Link>
      </div>
      <div style={{ marginTop: 12 }}><TextInput value={query} onChange={setQuery} placeholder="Search recipes" aria-label="Search recipes" /></div>
      {cats.map((c) => {
        const items = shown.filter((r) => (r.category || 'No category') === c).sort((a, b) => a.title.localeCompare(b.title));
        if (!items.length) return null;
        return (
          <div key={c} style={{ marginTop: 18 }}>
            <div style={{ fontFamily: FONTS.display, fontSize: 22, color: COLORS.ink }}>{c}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
              {items.map((r) => (
                <ListLink key={r.id} to={`/dashboard/admin/recipes/${r.id}`} title={r.title} sub={[r.calories != null && `${r.calories} cal`, r.protein != null && `${Number(r.protein)}g protein`].filter(Boolean).join(', ')} />
              ))}
            </div>
          </div>
        );
      })}
    </>
  );
}

/* ───────────── Meal plans ───────────── */

function PlansTab() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    supabase.from('meal_plans').select('id, title, description, edition').then(({ data }) => setPlans((data || []).sort((a, b) => a.title.localeCompare(b.title))));
  }, []);

  const create = async () => {
    setCreating(true);
    const { data: userData } = await supabase.auth.getUser();
    const { data } = await supabase.from('meal_plans').insert({ title: 'New meal plan', created_by: userData?.user?.id }).select('id').single();
    setCreating(false);
    if (data) navigate(`/dashboard/admin/meal-plans/${data.id}`);
  };

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <Heading>Meal plans</Heading>
        <Button onClick={create} disabled={creating}><Plus size={16} /> New</Button>
      </div>
      <Note>Build a week of meals from the Recipe Book, then assign it to members from the Members tab.</Note>
      {plans && plans.length === 0 && <Card style={{ marginTop: 14 }}><Note style={{ marginTop: 0 }}>No meal plans yet.</Note></Card>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 14 }}>
        {(plans || []).map((p) => (
          <ListLink key={p.id} to={`/dashboard/admin/meal-plans/${p.id}`} title={p.title} sub={p.description} />
        ))}
      </div>
    </>
  );
}

function ListLink({ to, title, sub }) {
  return (
    <Link to={to} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '13px 14px', borderRadius: 14, background: COLORS.surface, border: `1px solid ${COLORS.line}`, textDecoration: 'none' }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: FONTS.body, fontSize: 15, fontWeight: 600, color: COLORS.ink }}>{title}</div>
        {sub && <div style={{ fontFamily: FONTS.body, fontSize: 12, color: COLORS.mute, marginTop: 2 }}>{sub}</div>}
      </div>
      <ChevronRight size={18} color={COLORS.mute} />
    </Link>
  );
}
