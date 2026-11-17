import { useState } from 'react';
import { useStore } from '../data/store';
import { Card, I, Icon, Page, PersonNode, inputCls } from '../components/ui';

export default function Search() {
  const { db, idx } = useStore();
  const [q, setQ] = useState('');
  const s = q.trim().toLowerCase();
  const results = s.length < 2 ? [] : db.members.filter((m) =>
    m.name.toLowerCase().includes(s) || m.email.toLowerCase().includes(s) || m.phone.includes(s) || m.post.toLowerCase().includes(s)
    || (idx.unit.get(m.unitId)?.name.toLowerCase().includes(s) ?? false)).slice(0, 60);
  return (
    <Page title="Search" sub={`${db.members.length} people in the district`}>
      <div className="max-w-2xl mx-auto">
        <div className="relative">
          <Icon d={I.search} size={18} className="absolute left-3 top-3 text-mut" />
          <input autoFocus className={inputCls + ' !pl-10'} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name, email, phone, post or unit" />
        </div>
        <div className="mt-4 space-y-2">
          {results.map((m) => (
            <div key={m.id}>
              <p className="text-[11px] text-mut ml-1 mb-0.5">{idx.unit.get(m.unitId)?.name}</p>
              <PersonNode m={m} />
            </div>
          ))}
          {s.length >= 2 && !results.length && <Card className="p-6 text-center text-sm text-mut">No one found.</Card>}
        </div>
      </div>
    </Page>
  );
}
