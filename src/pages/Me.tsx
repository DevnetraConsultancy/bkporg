import { Link } from 'react-router-dom';
import { isAdmin, powerUnit, useStore } from '../data/store';
import { ADMIN_EMAIL, POWER_POSTS, TYPE_PLURAL } from '../data/config';
import type { UnitType } from '../data/types';
import { Avatar, Card, Page, btn2Cls } from '../components/ui';

export default function Me() {
  const { idx, user, db, logout, resetDemo } = useStore();
  const m = user?.kind === 'member' ? idx.member.get(user.id) : undefined;
  const p = powerUnit(idx, user);
  const sup = isAdmin(user);
  const counts = (['assembly', 'mandal', 'morcha', 'shakti', 'booth'] as UnitType[]).map((t) => [t, db.units.filter((u) => u.type === t).length] as const);
  const leaders = db.members.filter((x) => POWER_POSTS[idx.unit.get(x.unitId)!.type].includes(x.post));
  const activeLeaders = leaders.filter((x) => x.passwordHash).length;

  return (
    <Page title="Me">
      <div className="max-w-2xl mx-auto space-y-4">
        <Card className="p-4 flex items-center gap-3">
          <Avatar name={m?.name ?? 'Super Admin'} size={56} />
          <div className="flex-1 min-w-0">
            <div className="font-bold text-lg truncate">{m?.name ?? 'Super Admin'}</div>
            <div className="text-sm text-mut truncate">{m ? `${m.post} · ${idx.unit.get(m.unitId)?.name}` : ADMIN_EMAIL}</div>
          </div>
          {m && <Link to={`/person/${m.id}`} className="text-saf text-sm font-semibold">Profile ›</Link>}
        </Card>

        <Card className="p-4 text-sm">
          <h3 className="font-bold mb-1">My power</h3>
          {sup ? <p>Full control. Only you can appoint the 3 leaders (President, General Secretary, IT In-charge) of every committee.</p>
            : p ? <p>You are a leader of <Link className="text-saf font-semibold" to={`/unit/${p.id}`}>{p.name}</Link>. You can add the other members of this committee by email, set ranking and create events.</p>
              : <p className="text-mut">View only. You can see the hierarchy, events and messages.</p>}
        </Card>

        {sup && (
          <>
            <Card className="p-4">
              <h3 className="font-bold mb-3 text-sm">Admin panel · district summary</h3>
              <div className="grid grid-cols-3 gap-2 text-center">
                <Stat n={db.members.length} l="People" />
                {counts.map(([t, n]) => <Stat key={t} n={n} l={TYPE_PLURAL[t]} />)}
                <Stat n={db.events.length} l="Events" />
              </div>
            </Card>
            <Link to="/admin/leaders" className="block">
              <Card className="p-4 hover:border-saf">
                <h3 className="font-bold text-sm">⭐ Appoint committee leaders ›</h3>
                <p className="text-xs text-mut mt-1">{leaders.length} leader posts · {activeLeaders} active · {leaders.length - activeLeaders} invited, password not set</p>
              </Card>
            </Link>
            <button onClick={() => confirm('Reset all demo data? Your changes will be lost.') && resetDemo()} className={btn2Cls + ' w-full'}>Reset demo data</button>
          </>
        )}
        <div className="grid grid-cols-2 gap-2">
          {m && <Link to="/me/profile" className={btn2Cls}>Edit my profile</Link>}
          <Link to="/me/password" className={btn2Cls + (m ? '' : ' col-span-2')}>Change password</Link>
        </div>
        <button onClick={logout} className="w-full rounded-xl bg-white border border-line py-3 text-sm font-semibold text-bad">Log out</button>
      </div>
    </Page>
  );
}

function Stat({ n, l }: { n: number; l: string }) {
  return <div className="rounded-xl bg-saf-50 py-3"><div className="text-xl font-bold text-saf">{n}</div><div className="text-[11px] text-mut">{l}</div></div>;
}
