import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { postOf, useStore, type ProfileFields } from '../data/store';
import type { Member } from '../data/types';
import { Card, Field, Page, btnCls, inputCls } from '../components/ui';

/** A person edits their own profile. Name and a few details only. Post, email and unit are locked. */
export function MyProfile() {
  const { idx, user, updateMyProfile } = useStore();
  const nav = useNavigate();
  const m = user?.kind === 'member' ? idx.member.get(user.id) : undefined;
  const [f, setF] = useState<ProfileFields | null>(() => m ? { name: m.name, phone: m.phone, gender: m.gender, age: m.age, bloodGroup: m.bloodGroup, address: m.address } : null);
  const [error, setError] = useState('');
  if (!m || !f) return <Navigate to="/me" replace />;
  const set = <K extends keyof ProfileFields>(k: K, v: ProfileFields[K]) => setF({ ...f, [k]: v });
  const save = () => {
    if (!f.name.trim()) return setError('Name is required.');
    updateMyProfile({ ...f, name: f.name.trim() });
    nav(-1);
  };
  return (
    <Page title="Edit my profile" back>
      <Card className="p-4 max-w-xl mx-auto space-y-3">
        <Locked label="Email (login ID)" value={m.email} />
        <Locked label="Post (designation)" value={`${postOf(idx, m)}, ${idx.unit.get(m.unitId)?.name}`} />
        <p className="text-xs text-mut -mt-1">🔒 Only your committee's President, General Secretary, IT In-charge or Admin can change these.</p>
        <Field label="Full name"><input className={inputCls} value={f.name} onChange={(e) => set('name', e.target.value)} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Phone"><input className={inputCls} value={f.phone} onChange={(e) => set('phone', e.target.value)} /></Field>
          <Field label="Age"><input type="number" className={inputCls} value={f.age} onChange={(e) => set('age', Number(e.target.value))} /></Field>
          <Field label="Gender">
            <select className={inputCls} value={f.gender} onChange={(e) => set('gender', e.target.value as Member['gender'])}><option>Male</option><option>Female</option></select>
          </Field>
          <Field label="Blood group"><input className={inputCls} value={f.bloodGroup} onChange={(e) => set('bloodGroup', e.target.value)} /></Field>
        </div>
        <Field label="Address"><input className={inputCls} value={f.address} onChange={(e) => set('address', e.target.value)} /></Field>
        {error && <p className="text-sm text-bad">{error}</p>}
        <button onClick={save} className={btnCls + ' w-full'}>Save</button>
      </Card>
    </Page>
  );
}

function Locked({ label, value }: { label: string; value: string }) {
  return (
    <Field label={label}>
      <div className="w-full rounded-xl border border-line bg-gray-50 px-3 py-2.5 text-sm text-mut flex justify-between gap-2"><span className="truncate">{value}</span><span>🔒</span></div>
    </Field>
  );
}

export function ChangePassword() {
  const { changePassword } = useStore();
  const nav = useNavigate();
  const [oldPw, setOld] = useState('');
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [error, setError] = useState('');
  const save = () => {
    if (pw !== pw2) return setError('The two new passwords do not match.');
    const err = changePassword(oldPw, pw);
    if (err) return setError(err);
    alert('Password changed.');
    nav(-1);
  };
  return (
    <Page title="Change password" back>
      <Card className="p-4 max-w-md mx-auto space-y-3">
        <Field label="Current password"><input type="password" className={inputCls} value={oldPw} onChange={(e) => setOld(e.target.value)} /></Field>
        <Field label="New password"><input type="password" className={inputCls} value={pw} onChange={(e) => setPw(e.target.value)} /></Field>
        <Field label="Type new password again"><input type="password" className={inputCls} value={pw2} onChange={(e) => setPw2(e.target.value)} /></Field>
        <p className="text-xs text-mut">At least 8 characters, with letters and numbers. Forgot the current one? Log out and use "Forgot / set password".</p>
        {error && <p className="text-sm text-bad">{error}</p>}
        <button onClick={save} className={btnCls + ' w-full'}>Change password</button>
      </Card>
    </Page>
  );
}
