import { useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { ancestors, isAdmin, useStore } from '../data/store';
import { POWER_POSTS, TYPE_LABEL } from '../data/config';
import type { Member, Unit } from '../data/types';
import { Avatar, Card, Field, I, Icon, Page, btnCls, inputCls } from '../components/ui';

/** Admin only: appoint the President, General Secretary and IT In-charge of any committee by email. */
export default function Leaders() {
  const { unitId } = useParams();
  const { idx, user, db } = useStore();
  const [q, setQ] = useState('');
  if (!isAdmin(user)) return <Navigate to="/" replace />;
  const unit = unitId ? idx.unit.get(unitId) : undefined;

  if (!unit) {
    const s = q.trim().toLowerCase();
    const list = db.units.filter((u) => !s || u.name.toLowerCase().includes(s)).slice(0, 40);
    return (
      <Page title="Appoint President, GS, IT" sub="Choose a committee" back>
        <div className="max-w-2xl mx-auto space-y-2">
          <input autoFocus className={inputCls} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search: Naihati, Booth 12, Yuva Morcha…" />
          {list.map((u) => <UnitPick key={u.id} u={u} />)}
        </div>
      </Page>
    );
  }

  const committee = idx.membersOf.get(unit.id) ?? [];
  return (
    <Page title="Appoint President, GS, IT" sub={unit.name} back>
      <div className="max-w-2xl mx-auto space-y-3">
        <p className="text-sm text-mut">These 3 people manage <b>{unit.name}</b>. They can add the other members of this committee, set ranking and create events. Each one gets an email to set their password.</p>
        {POWER_POSTS[unit.type].length === 0 && (
          <Card className="p-4 text-sm">{unit.name} has no own President. It is managed by the President, General Secretary and IT In-charge of the unit above it.</Card>
        )}
        {POWER_POSTS[unit.type].map((post) => (
          <Slot key={post + (committee.find((m) => m.post === post)?.id ?? '')} unit={unit} post={post} holder={committee.find((m) => m.post === post)} />
        ))}
      </div>
    </Page>
  );
}

function UnitPick({ u }: { u: Unit }) {
  const { idx } = useStore();
  const path = ancestors(idx, u.id).slice(1, -1).map((a) => a.name).join(' › ');
  return (
    <Link to={`/admin/leaders/${u.id}`} className="flex items-center gap-3 rounded-xl bg-card border border-line shadow-card px-3 py-2.5 transition hover:border-saf/60 hover:shadow-lift">
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold truncate">{u.name}</div>
        <div className="text-xs text-mut truncate">{TYPE_LABEL[u.type]}{path && ` · ${path}`}</div>
      </div>
      <Icon d={I.chev} size={18} className="text-faint" />
    </Link>
  );
}

function Slot({ unit, post, holder }: { unit: Unit; post: string; holder?: Member }) {
  const { idx, saveMember, emailInUse } = useStore();
  const [editing, setEditing] = useState(!holder);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');

  const appoint = () => {
    const e = email.trim().toLowerCase();
    if (!name.trim()) return setMsg('Name is required.');
    if (!/^\S+@\S+\.\S+$/.test(e)) return setMsg('Enter a valid email.');
    if (emailInUse(e, holder?.id)) return setMsg('This email is already used by another person.');
    const base: Member = holder ?? {
      id: `m${Date.now()}`, unitId: unit.id, post, rank: (idx.membersOf.get(unit.id)?.length ?? 0) + 1,
      name: '', email: '', phone: '', gender: 'Male', age: 30, bloodGroup: '', address: '',
      joined: new Date().toISOString().slice(0, 10), addedBy: 'admin', passwordHash: null, resetToken: null,
    };
    // Same chair, new person: personal details are cleared.
    saveMember({ ...base, name: name.trim(), email: e, phone: '', address: '', bloodGroup: '', addedBy: 'admin' });
    setEditing(false); setMsg(`Done. Email sent to ${e}.`); setName(''); setEmail('');
  };

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="rounded-full bg-saf-100 text-saf px-2 py-0.5 text-xs font-bold">{post}</span>
      </div>
      {holder && (
        <div className="flex items-center gap-3">
          <Avatar name={holder.name} size={40} />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold truncate">{holder.name}</div>
            <div className="text-xs text-mut truncate">{holder.email} · {holder.passwordHash ? 'Active' : 'Invited'}</div>
          </div>
          {!editing && <button onClick={() => setEditing(true)} className="text-sm font-semibold text-saf">Replace</button>}
        </div>
      )}
      {editing && (
        <div className="mt-3 space-y-2">
          <Field label="Name"><input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} /></Field>
          <Field label="Email (login ID)"><input type="email" className={inputCls} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@gmail.com" /></Field>
          <div className="flex gap-2">
            <button onClick={appoint} className={btnCls + ' flex-1'}>{holder ? 'Replace and send email' : 'Appoint and send email'}</button>
            {holder && <button onClick={() => { setEditing(false); setMsg(''); }} className="px-3 text-sm text-mut">Cancel</button>}
          </div>
        </div>
      )}
      {msg && <p className={`mt-2 text-sm ${msg.startsWith('Done') ? 'text-ok' : 'text-bad'}`}>{msg}</p>}
    </Card>
  );
}
