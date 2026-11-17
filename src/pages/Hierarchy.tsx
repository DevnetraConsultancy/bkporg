import { useState } from 'react';
import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom';
import { ancestors, canManage, committeeName, isAdmin, postOf, useStore, type Index } from '../data/store';
import { BRANCH_COLOR, TYPE_LABEL, TYPE_PLURAL } from '../data/config';
import type { Unit, UnitType } from '../data/types';
import SocialWidget from '../components/SocialWidget';
import { Avatar, Card, I, Icon, Page, PersonNode, UnitNode, btn2Cls } from '../components/ui';

const VIEW_KEY = 'bkp-view';

export default function Hierarchy() {
  const { idx, user } = useStore();
  const { id } = useParams();
  const [sp, setSp] = useSearchParams();
  const unit = idx.unit.get(id ?? idx.root.id);
  const [view, setView] = useState<'map' | 'list'>(() => {
    try { return (localStorage.getItem(VIEW_KEY) as 'map' | 'list') || 'map'; } catch { return 'map'; }
  });
  if (!unit) return <Navigate to="/" replace />;
  const switchView = (v: 'map' | 'list') => { setView(v); try { localStorage.setItem(VIEW_KEY, v); } catch { /* ignore */ } };

  const path = ancestors(idx, unit.id);
  const committee = idx.membersOf.get(unit.id) ?? [];
  const head = committee[0];
  const kids = idx.children.get(unit.id) ?? [];
  const groups = groupByType(kids);
  // Branch tiles: the unit's own committee first, then each kind of unit below it.
  const tiles = [
    { key: 'committee', label: committeeName(idx, unit), count: committee.length, sub: 'people', color: BRANCH_COLOR.committee },
    ...groups.map(([t, list]) => ({
      key: t, label: TYPE_PLURAL[t], color: BRANCH_COLOR[t],
      count: t === 'extended' ? (idx.membersOf.get(list[0].id)?.length ?? 0) : list.length,
      sub: t === 'extended' ? 'people' : 'units',
    })),
  ];
  const selected = tiles.find((t) => t.key === sp.get('b'))?.key ?? 'committee';
  const pick = (key: string) => setSp(key === 'committee' ? {} : { b: key }, { replace: true });
  const editable = canManage(idx, user, unit.id);
  const admin = isAdmin(user);

  return (
    <Page
      title={unit.name}
      sub={`${TYPE_LABEL[unit.type]} · ${idx.subtreeCount.get(unit.id)} people in this team`}
      back={unit.id !== idx.root.id}
      right={<ViewToggle view={view} onChange={switchView} />}
      top={
        <div className="flex gap-1 overflow-x-auto no-scrollbar text-xs whitespace-nowrap">
          {path.map((u, i) => (
            <span key={u.id} className="flex items-center gap-1">
              {i > 0 && <span className="opacity-70">›</span>}
              {i < path.length - 1
                ? <Link to={`/unit/${u.id}`} className="rounded-md bg-white/20 px-2 py-0.5 hover:bg-white/30">{short(u)}</Link>
                : <span className="font-semibold">{short(u)}</span>}
            </span>
          ))}
        </div>
      }
    >
      {!id && <SocialWidget />}
      {view === 'list' ? <TreeList idx={idx} start={unit} /> : (
        <>
          {/* Centre of the mind map: the unit and its head */}
          <Card className="p-4 relative overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[#F97316] via-[#EA6A0C] to-[#15803D]" />
            <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-saf/10 blur-2xl" />
            <div className="flex items-center gap-2 text-xs text-mut mb-3">
              <span className="rounded-full bg-saf-100 text-saf px-2 py-0.5 font-semibold">{TYPE_LABEL[unit.type]}</span>
              <span>{committee.length} in committee · {kids.length} units below</span>
            </div>
            {head ? (
              <Link to={`/person/${head.id}`} className="flex items-center gap-3 group">
                <Avatar name={head.name} size={56} />
                <div className="min-w-0 flex-1">
                  <div className="text-lg font-bold tracking-tight truncate group-hover:text-saf transition-colors">{head.name}</div>
                  <div className="text-sm text-mut">{postOf(idx, head)}, {unit.name}</div>
                </div>
                <Icon d={I.info} className="text-saf" />
              </Link>
            ) : <p className="text-sm text-mut">No one added yet.</p>}
            {editable && (
              <div className={`mt-4 grid gap-2 ${admin ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-3'}`}>
                {admin && <Link to={`/admin/leaders/${unit.id}`} className={btn2Cls + ' !px-2 !text-xs'}><Icon d={I.star} size={16} />Appoint</Link>}
                <Link to={`/unit/${unit.id}/add`} className={btn2Cls + ' !px-2 !text-xs'}><Icon d={I.plus} size={16} />Add person</Link>
                <Link to={`/unit/${unit.id}/ranking`} className={btn2Cls + ' !px-2 !text-xs'}><Icon d={I.list} size={16} />Ranking</Link>
                <Link to={`/events/new?unit=${unit.id}`} className={btn2Cls + ' !px-2 !text-xs'}><Icon d={I.cal} size={16} />Event</Link>
              </div>
            )}
          </Card>

          {tiles.length > 1 && (
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6" role="tablist">
              {tiles.map((t) => {
                const on = t.key === selected;
                return (
                  <button key={t.key} role="tab" aria-selected={on} onClick={() => pick(t.key)}
                    className="relative overflow-hidden rounded-2xl border shadow-card px-3 py-2.5 text-left transition hover:-translate-y-px active:scale-[.98]"
                    style={on
                      ? { background: `linear-gradient(140deg, color-mix(in srgb, ${t.color} 85%, white), ${t.color})`, borderColor: t.color, color: '#fff', boxShadow: `0 12px 24px -12px ${t.color}` }
                      : { background: 'var(--color-card)', borderColor: 'var(--color-line)' }}>
                    {!on && <span className="absolute inset-y-0 left-0 w-1.5" style={{ background: t.color }} />}
                    <div className="text-2xl font-bold leading-tight" style={on ? undefined : { color: t.color }}>{t.count}</div>
                    <div className="text-xs font-semibold truncate">{t.label}</div>
                    <div className={`text-[10px] ${on ? 'text-white/80' : 'text-mut'}`}>{t.sub}</div>
                  </button>
                );
              })}
            </div>
          )}

          {selected === 'committee' ? (
            <section>
              <SectionTitle text={`${committeeName(idx, unit)} (${committee.length})`} color={BRANCH_COLOR.committee} />
              <ul className="branch">
                {committee.map((m) => <li key={m.id}><PersonNode m={m} /></li>)}
              </ul>
              {groups.length === 0 && <p className="mt-6 text-sm text-mut text-center">This is the lowest level.</p>}
            </section>
          ) : groups.filter(([t]) => t === selected).map(([type, list]) => (
            <section key={type}>
              <SectionTitle text={`${TYPE_PLURAL[type]} (${list.length})`} color={BRANCH_COLOR[type]} />
              <ul className="branch" style={{ ['--branch' as string]: BRANCH_COLOR[type] }}>
                {list.map((u) => <li key={u.id}><UnitNode u={u} color={BRANCH_COLOR[type]} /></li>)}
              </ul>
            </section>
          ))}
        </>
      )}
    </Page>
  );
}

function SectionTitle({ text, color }: { text: string; color: string }) {
  return (
    <h2 className="mt-5 mb-1 flex items-center gap-2 text-sm font-bold">
      <span className="w-3 h-3 rounded-full border-[3px] ml-[20px]" style={{ borderColor: color }} />{text}
    </h2>
  );
}

function ViewToggle({ view, onChange }: { view: 'map' | 'list'; onChange: (v: 'map' | 'list') => void }) {
  return (
    <div className="flex rounded-lg bg-white/20 p-0.5 text-xs font-semibold">
      {(['map', 'list'] as const).map((v) => (
        <button key={v} onClick={() => onChange(v)}
          className={`px-2.5 py-1 rounded-md ${view === v ? 'bg-white text-saf' : 'text-white'}`}>
          {v === 'map' ? 'Map' : 'Tree'}
        </button>
      ))}
    </div>
  );
}

function groupByType(units: Unit[]): [UnitType, Unit[]][] {
  const order: UnitType[] = ['extended', 'morcha', 'cell', 'assembly', 'mandal', 'shakti', 'booth'];
  return order.map((t) => [t, units.filter((u) => u.type === t)] as [UnitType, Unit[]]).filter(([, l]) => l.length);
}

function short(u: Unit) {
  if (u.type === 'district') return 'District';
  return u.name.replace(' Assembly', '').replace(/^.* (Shakti Kendra \d+)$/, '$1').replace(/^.* (Booth \d+)$/, '$1');
}

/** Tree view: whole hierarchy as an expandable list. */
function TreeList({ idx, start }: { idx: Index; start: Unit }) {
  return <Card className="p-2"><TreeRow idx={idx} u={start} depth={0} open /></Card>;
}

function TreeRow({ idx, u, depth, open: initOpen = false }: { idx: Index; u: Unit; depth: number; open?: boolean }) {
  const [open, setOpen] = useState(initOpen);
  const kids = idx.children.get(u.id) ?? [];
  const head = idx.membersOf.get(u.id)?.[0];
  return (
    <div>
      <div className="flex items-center gap-1 rounded-lg hover:bg-saf-50" style={{ paddingLeft: depth * 16 }}>
        <button onClick={() => setOpen(!open)} disabled={!kids.length} aria-label={open ? 'Collapse' : 'Expand'}
          className="w-8 h-8 grid place-items-center text-saf disabled:text-faint">
          <Icon d={open ? I.down : I.chev} size={16} />
        </button>
        <Link to={`/unit/${u.id}`} className="flex-1 min-w-0 py-1.5">
          <div className="text-sm font-semibold truncate">{u.name}</div>
          <div className="text-xs text-mut truncate">{head ? `${head.name} · ${postOf(idx, head)}` : '—'}</div>
        </Link>
        <span className="text-[11px] text-mut pr-2">{idx.subtreeCount.get(u.id)}</span>
      </div>
      {open && kids.map((k) => <TreeRow key={k.id} idx={idx} u={k} depth={depth + 1} />)}
    </div>
  );
}
