import { useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { canManage, postOf, useStore } from '../data/store';
import { Avatar, Card, I, Icon, Page, btnCls } from '../components/ui';

export default function Ranking() {
  const { unitId } = useParams();
  const { idx, user, setRanking } = useStore();
  const nav = useNavigate();
  const unit = idx.unit.get(unitId ?? '');
  const [order, setOrder] = useState(() => (idx.membersOf.get(unitId ?? '') ?? []).map((m) => m.id));
  if (!unit) return <Navigate to="/" replace />;
  if (!canManage(idx, user, unit.id)) return <Navigate to={`/unit/${unit.id}`} replace />;

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= order.length) return;
    const next = [...order];
    [next[i], next[j]] = [next[j], next[i]];
    setOrder(next);
  };

  return (
    <Page title="Set ranking" sub={unit.name} back>
      <div className="max-w-xl mx-auto">
        <p className="text-sm text-mut mb-3">Move people up or down. Rank 1 shows at the top of the hierarchy. Ranking changes only the order, not the post or power.</p>
        <Card className="divide-y divide-line">
          {order.map((id, i) => {
            const m = idx.member.get(id)!;
            return (
              <div key={id} className="flex items-center gap-3 px-3 py-2">
                <span className="w-6 text-center font-bold text-saf">{i + 1}</span>
                <Avatar name={m.name} size={34} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate">{m.name}</div>
                  <div className="text-xs text-mut">{postOf(idx, m)}</div>
                </div>
                <button aria-label="Move up" disabled={i === 0} onClick={() => move(i, -1)} className="p-2 rounded-lg border border-line disabled:opacity-30"><Icon d={I.up} size={16} /></button>
                <button aria-label="Move down" disabled={i === order.length - 1} onClick={() => move(i, 1)} className="p-2 rounded-lg border border-line disabled:opacity-30"><Icon d={I.down} size={16} /></button>
              </div>
            );
          })}
        </Card>
        <button onClick={() => { setRanking(unit.id, order); nav(-1); }} className={btnCls + ' w-full mt-4'}>Save ranking</button>
      </div>
    </Page>
  );
}
