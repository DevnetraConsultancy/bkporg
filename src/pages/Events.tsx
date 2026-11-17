import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ancestors, canManage, displayName, isAdmin, isInside, myId, powerUnit, useStore, type Index } from '../data/store';
import { TYPE_PLURAL } from '../data/config';
import type { EventItem, UnitType, User } from '../data/types';
import { Card, Field, I, Icon, Page, btnCls, inputCls } from '../components/ui';

/** Who gets this event: committee of the start unit + committees of chosen lower levels. */
function reach(idx: Index, e: Pick<EventItem, 'unitId' | 'levels'>) {
  let n = 0;
  const walk = (id: string, top: boolean) => {
    const u = idx.unit.get(id)!;
    if (top || e.levels.includes(u.type)) n += idx.membersOf.get(id)?.length ?? 0;
    (idx.children.get(id) ?? []).forEach((c) => walk(c.id, false));
  };
  walk(e.unitId, true);
  return n;
}

function canSee(idx: Index, user: User | null, e: EventItem) {
  if (isAdmin(user) || e.createdBy === myId(user)) return true;
  const m = user?.kind === 'member' ? idx.member.get(user.id) : undefined;
  if (!m) return false;
  const u = idx.unit.get(m.unitId)!;
  return isInside(idx, u.id, e.unitId) && (u.id === e.unitId || e.levels.includes(u.type));
}

export function EventsList() {
  const { db, idx, user } = useStore();
  const list = db.events.filter((e) => canSee(idx, user, e)).sort((a, b) => a.date.localeCompare(b.date));
  const p = powerUnit(idx, user);
  return (
    <Page title="Events" sub="Events that reach you" right={p && <Link to="/events/new" className="rounded-lg bg-white text-saf px-3 py-1.5 text-sm font-semibold">+ New</Link>}>
      <div className="grid gap-3 md:grid-cols-2">
        {list.map((e) => {
          const d = new Date(e.date + 'T00:00');
          const u = idx.unit.get(e.unitId)!;
          return (
            <Card key={e.id} className="p-4 flex gap-3">
              <div className="w-14 shrink-0 rounded-xl bg-saf-50 text-saf text-center py-2">
                <div className="text-xl font-bold leading-none">{d.getDate()}</div>
                <div className="text-[11px] font-semibold uppercase">{d.toLocaleString('en', { month: 'short' })}</div>
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-bold">{e.title}</h3>
                <p className="text-xs text-mut">{e.time} · {e.place}</p>
                <p className="text-sm mt-1">{e.description}</p>
                <p className="text-xs text-mut mt-2">From <Link className="text-saf font-semibold" to={`/unit/${u.id}`}>{u.name}</Link> by {displayName(idx, e.createdBy)}</p>
                <p className="text-xs mt-1"><b>{reach(idx, e)}</b> people · goes down to: {e.levels.length ? e.levels.map((l) => TYPE_PLURAL[l]).join(', ') : 'committee only'}</p>
              </div>
            </Card>
          );
        })}
        {!list.length && <p className="text-sm text-mut text-center py-10 md:col-span-2">No events for you yet.</p>}
      </div>
    </Page>
  );
}

const LEVELS: UnitType[] = ['extended', 'cell', 'morcha', 'assembly', 'mandal', 'shakti', 'booth'];

export function NewEvent() {
  const { idx, user, addEvent } = useStore();
  const nav = useNavigate();
  const [sp] = useSearchParams();
  const p = powerUnit(idx, user);

  // Units the user may start an event from: their power unit and (for big scopes) the main levels below it.
  const options = useMemo(() => {
    if (!p) return [];
    if (!isAdmin(user)) return [p];
    return [...idx.unit.values()].filter((u) => ['district', 'assembly', 'mandal'].includes(u.type));
  }, [idx, p, user]);
  const startId = sp.get('unit') && canManage(idx, user, sp.get('unit')!) ? sp.get('unit')! : p?.id ?? '';
  const [f, setF] = useState({ title: '', date: '', time: '17:00', place: '', description: '', unitId: startId, levels: [] as UnitType[] });
  const [error, setError] = useState('');

  if (!p) return <Page title="New event" back><Card className="p-6 text-center text-sm">Only President, General Secretary or IT In-charge can create events.</Card></Page>;

  const start = idx.unit.get(f.unitId);
  const below = new Set<UnitType>();
  const collect = (id: string) => (idx.children.get(id) ?? []).forEach((c) => { below.add(c.type); collect(c.id); });
  if (start) collect(start.id);
  const levelOptions = LEVELS.filter((l) => below.has(l));
  const toggle = (l: UnitType) => setF({ ...f, levels: f.levels.includes(l) ? f.levels.filter((x) => x !== l) : [...f.levels, l] });
  const allOpts = start && !options.some((o) => o.id === start.id) ? [start, ...options] : options;

  const submit = () => {
    if (!f.title.trim() || !f.date) return setError('Title and date are required.');
    addEvent({ ...f, levels: f.levels.filter((l) => below.has(l)), id: `e${Date.now()}`, createdBy: myId(user), createdAt: new Date().toISOString() });
    nav('/events', { replace: true });
  };

  return (
    <Page title="New event" sub="It flows down level by level" back>
      <Card className="p-4 max-w-xl mx-auto space-y-3">
        <Field label="Title *"><input className={inputCls} value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder="e.g. Padayatra" /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Date *"><input type="date" className={inputCls} value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} /></Field>
          <Field label="Time"><input type="time" className={inputCls} value={f.time} onChange={(e) => setF({ ...f, time: e.target.value })} /></Field>
        </div>
        <Field label="Place"><input className={inputCls} value={f.place} onChange={(e) => setF({ ...f, place: e.target.value })} /></Field>
        <Field label="Details"><textarea rows={3} className={inputCls} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></Field>
        <Field label="Start from (this committee always gets it)">
          <select className={inputCls} value={f.unitId} onChange={(e) => setF({ ...f, unitId: e.target.value, levels: [] })}>
            {allOpts.map((u) => <option key={u.id} value={u.id}>{ancestors(idx, u.id).length > 1 ? '— '.repeat(ancestors(idx, u.id).length - 1) : ''}{u.name}</option>)}
          </select>
        </Field>
        {levelOptions.length > 0 && (
          <div>
            <span className="block text-xs font-semibold text-mut mb-1">Also send down to</span>
            <div className="flex flex-wrap gap-2">
              {levelOptions.map((l) => (
                <button key={l} type="button" onClick={() => toggle(l)}
                  className={`rounded-full border px-3 py-1.5 text-sm ${f.levels.includes(l) ? 'bg-saf border-saf text-white' : 'bg-white border-line'}`}>
                  {f.levels.includes(l) && <Icon d="M20 6L9 17l-5-5" size={14} className="inline -mt-0.5 mr-1" />}{TYPE_PLURAL[l]}
                </button>
              ))}
            </div>
          </div>
        )}
        {error && <p className="text-sm text-bad">{error}</p>}
        <button onClick={submit} className={btnCls + ' w-full'}><Icon d={I.cal} size={16} />Send to {start ? reach(idx, f) : 0} people</button>
      </Card>
    </Page>
  );
}
