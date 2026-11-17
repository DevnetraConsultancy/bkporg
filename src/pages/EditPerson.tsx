import { useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { canEditMember, canManage, isAdmin, myId, useStore } from '../data/store';
import { POSTS, POWER_POSTS } from '../data/config';
import type { Member } from '../data/types';
import { Card, Field, Page, btnCls, inputCls } from '../components/ui';

/** Used for both "Add person" (/unit/:unitId/add) and "Edit" (/person/:id/edit) by Admin or the committee's President, General Secretary or IT In-charge. */
export default function EditPerson() {
  const { id, unitId } = useParams();
  const { idx, user, saveMember, removeMember, emailInUse } = useStore();
  const nav = useNavigate();
  const existing = id ? idx.member.get(id) : undefined;
  const unit = idx.unit.get(existing?.unitId ?? unitId ?? '');
  const [f, setF] = useState<Member>(() => existing ?? {
    id: `m${Date.now()}`, unitId: unit?.id ?? '', name: '', post: 'Member',
    rank: (idx.membersOf.get(unit?.id ?? '')?.length ?? 0) + 1, email: '', phone: '', gender: 'Male', age: 30,
    bloodGroup: 'O+', address: '', joined: new Date().toISOString().slice(0, 10), addedBy: myId(user),
    passwordHash: null, resetToken: null,
  });
  const [error, setError] = useState('');

  if (!unit) return <Navigate to="/" replace />;
  const allowed = existing ? canEditMember(idx, user, existing) : canManage(idx, user, unit.id);
  if (!allowed) {
    return <Page title="Not allowed" back><Card className="p-6 text-center text-sm">Only Admin or the President, General Secretary or IT In-charge of this committee can do this. These 3 posts can be changed only by Admin.</Card></Page>;
  }
  const admin = isAdmin(user);
  const leaderPosts = POWER_POSTS[unit.type];
  // These 3 can give any post except their own 3 posts. Admin uses the "Appoint" page for those.
  const posts = [...new Set([...POSTS[unit.type].filter((p) => admin || !leaderPosts.includes(p)), 'Member', f.post])];
  const set = <K extends keyof Member>(k: K, v: Member[K]) => setF({ ...f, [k]: v });

  const submit = () => {
    const email = f.email.trim().toLowerCase();
    if (!f.name.trim()) return setError('Name is required.');
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError('Enter a valid email. The person will log in with this email.');
    if (emailInUse(email, f.id)) return setError('This email is already used by another person.');
    if (leaderPosts.includes(f.post) && (idx.membersOf.get(unit.id) ?? []).some((m) => m.post === f.post && m.id !== f.id)) {
      return setError(`${unit.name} already has a ${f.post}. Admin can replace them from the Appoint page.`);
    }
    saveMember({ ...f, name: f.name.trim(), email });
    nav(-1);
  };
  const emailChanged = !existing || existing.email !== f.email.trim().toLowerCase();

  return (
    <Page title={existing ? `Edit ${existing.name}` : 'Add person'} sub={unit.name} back>
      <Card className="p-4 max-w-xl mx-auto space-y-3">
        <Field label="Full name *"><input className={inputCls} value={f.name} onChange={(e) => set('name', e.target.value)} /></Field>
        <Field label="Email * (login ID)"><input type="email" className={inputCls} value={f.email} onChange={(e) => set('email', e.target.value)} placeholder="name@gmail.com" /></Field>
        {emailChanged && <p className="text-xs rounded-lg bg-saf-50 text-saf ring-1 ring-saf/15 px-3 py-2">An email will be sent to this address with a link to set a password.</p>}
        <Field label="Post (designation)">
          <select className={inputCls} value={f.post} onChange={(e) => set('post', e.target.value)}>
            {posts.map((p) => <option key={p}>{p}</option>)}
          </select>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Phone"><input className={inputCls} value={f.phone} onChange={(e) => set('phone', e.target.value)} /></Field>
          <Field label="Age"><input type="number" className={inputCls} value={f.age} onChange={(e) => set('age', Number(e.target.value))} /></Field>
          <Field label="Gender">
            <select className={inputCls} value={f.gender} onChange={(e) => set('gender', e.target.value as Member['gender'])}><option>Male</option><option>Female</option></select>
          </Field>
          <Field label="Blood group"><input className={inputCls} value={f.bloodGroup} onChange={(e) => set('bloodGroup', e.target.value)} /></Field>
        </div>
        <Field label="Address"><input className={inputCls} value={f.address} onChange={(e) => set('address', e.target.value)} /></Field>
        <Field label="Joined party on"><input type="date" className={inputCls} value={f.joined} onChange={(e) => set('joined', e.target.value)} /></Field>
        {error && <p className="text-sm text-bad">{error}</p>}
        <button onClick={submit} className={btnCls + ' w-full'}>{existing ? 'Save changes' : 'Add person and send email'}</button>
        {existing && existing.id !== myId(user) && (
          <button onClick={() => { if (confirm(`Remove ${existing.name} from ${unit.name}?`)) { removeMember(existing.id); nav(`/unit/${unit.id}`, { replace: true }); } }}
            className="w-full text-sm text-bad font-semibold py-2">Remove from committee</button>
        )}
      </Card>
    </Page>
  );
}
