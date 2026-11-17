import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { ancestors, canEditMember, displayName, isPowerPost, myId, useStore } from '../data/store';
import { TYPE_LABEL } from '../data/config';
import { Avatar, Card, I, Icon, Page, PersonNode, PowerBadge, btnCls, btn2Cls } from '../components/ui';

export default function Person() {
  const { id } = useParams();
  const { idx, user, db } = useStore();
  const nav = useNavigate();
  const m = id ? idx.member.get(id) : undefined;
  if (!m) return <Navigate to="/" replace />;
  const unit = idx.unit.get(m.unitId)!;
  const path = ancestors(idx, unit.id);
  const committee = idx.membersOf.get(unit.id) ?? [];
  const isHead = committee[0]?.id === m.id;
  // Who they report to: the head of their own committee, or (if they are the head) the head of the unit above.
  const parentUnit = unit.parentId ? idx.unit.get(unit.parentId) : undefined;
  const boss = isHead ? (parentUnit ? idx.membersOf.get(parentUnit.id)?.[0] : undefined) : committee[0];
  const team = isHead ? (idx.subtreeCount.get(unit.id) ?? 1) - 1 : 0;
  const editable = canEditMember(idx, user, m);
  const isMe = myId(user) === m.id;
  const eventsMade = db.events.filter((e) => e.createdBy === m.id).length;

  const rows: [string, string][] = [
    ['Email (login ID)', m.email], ['Phone', m.phone], ['Gender', m.gender], ['Age', String(m.age)],
    ['Blood group', m.bloodGroup], ['Address', m.address], ['Joined party', m.joined],
    ['Rank in committee', `${m.rank} of ${committee.length}`], ['Added by', m.addedBy === 'seed' ? 'Demo data' : displayName(idx, m.addedBy)],
    ['Account', m.passwordHash ? 'Active' : 'Invited, password not set yet'],
    ['Events created', String(eventsMade)],
  ];

  return (
    <Page title={m.name} sub={`${m.post} · ${unit.name}`} back>
      <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
        <div className="space-y-4">
          <Card className="p-5 text-center">
            <div className="flex justify-center"><Avatar name={m.name} size={84} /></div>
            <h2 className="mt-3 text-xl font-bold">{m.name}</h2>
            <p className="text-sm text-mut flex items-center justify-center gap-1.5">{m.post}{isPowerPost(idx, m) && <PowerBadge />}</p>
            <div className="mt-2 flex flex-wrap justify-center gap-1 text-[11px]">
              {path.map((u) => (
                <Link key={u.id} to={`/unit/${u.id}`} className="rounded-full bg-saf-50 text-saf-700 px-2 py-0.5 hover:bg-saf-100">
                  {TYPE_LABEL[u.type]}: {u.name.replace(' Assembly', '')}
                </Link>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              <a href={`tel:${m.phone}`} className={btn2Cls + ' !px-2'}><Icon d={I.phone} size={16} />Call</a>
              <a href={`mailto:${m.email}`} className={btn2Cls + ' !px-2'}><Icon d={I.mail} size={16} />Email</a>
              {!isMe
                ? <button onClick={() => nav(`/messages/${m.id}`)} className={btnCls + ' !px-2'}><Icon d={I.chat} size={16} />Message</button>
                : <span className="text-xs text-mut self-center">This is you</span>}
            </div>
            {isMe && (
              <Link to="/me/profile" className={btn2Cls + ' mt-2 w-full'}><Icon d={I.edit} size={16} />Edit my profile</Link>
            )}
            {editable && !isMe && (
              <Link to={`/person/${m.id}/edit`} className={btn2Cls + ' mt-2 w-full'}><Icon d={I.edit} size={16} />Edit details</Link>
            )}
          </Card>

          <Card className="p-4">
            <h3 className="text-sm font-bold mb-2">Reports to</h3>
            {boss ? <PersonNode m={boss} /> : <p className="text-sm text-mut">Top of the district.</p>}
            {isHead && (
              <p className="mt-3 text-sm">Leads <b>{team}</b> people in {unit.name} and below. <Link to={`/unit/${unit.id}`} className="text-saf font-semibold">See team ›</Link></p>
            )}
          </Card>
        </div>

        <Card className="p-4">
          <h3 className="text-sm font-bold mb-1">Details</h3>
          <dl className="divide-y divide-line">
            {rows.map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 py-2.5 text-sm">
                <dt className="text-mut">{k}</dt><dd className="font-medium text-right break-all">{v}</dd>
              </div>
            ))}
          </dl>
        </Card>
      </div>
    </Page>
  );
}
