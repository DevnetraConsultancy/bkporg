import { useEffect, useRef, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { displayName, myId, postOf, useStore } from '../data/store';
import { Avatar, Card, Page, btnCls, inputCls } from '../components/ui';

export function Inbox() {
  const { db, idx, user } = useStore();
  const me = myId(user);
  const threads = new Map<string, { last: (typeof db.messages)[number]; unread: number }>();
  db.messages.filter((m) => m.from === me || m.to === me).forEach((m) => {
    const other = m.from === me ? m.to : m.from;
    const t = threads.get(other);
    const unread = (t?.unread ?? 0) + (m.to === me && !m.read ? 1 : 0);
    threads.set(other, { last: !t || m.at > t.last.at ? m : t.last, unread });
  });
  const list = [...threads.entries()].sort((a, b) => b[1].last.at.localeCompare(a[1].last.at));
  return (
    <Page title="Messages" sub="Open a person's profile and tap Message to start a chat">
      <Card className="divide-y divide-line max-w-2xl mx-auto">
        {list.map(([other, t]) => (
          <Link key={other} to={`/messages/${other}`} className="flex items-center gap-3 px-4 py-3 hover:bg-saf-50">
            <Avatar name={displayName(idx, other)} size={42} />
            <div className="min-w-0 flex-1">
              <div className="flex justify-between gap-2">
                <span className="font-semibold text-sm truncate">{displayName(idx, other)}</span>
                <span className="text-[11px] text-mut shrink-0">{new Date(t.last.at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className={`text-sm truncate ${t.unread ? 'font-semibold' : 'text-mut'}`}>{t.last.from === me ? 'You: ' : ''}{t.last.text}</span>
                {t.unread > 0 && <span className="shrink-0 min-w-5 h-5 px-1 rounded-full bg-saf text-white text-[11px] grid place-items-center">{t.unread}</span>}
              </div>
            </div>
          </Link>
        ))}
        {!list.length && <p className="text-sm text-mut text-center py-10">No messages yet.</p>}
      </Card>
    </Page>
  );
}

export function Chat() {
  const { id } = useParams();
  const { db, idx, user, sendMessage, markRead } = useStore();
  const me = myId(user);
  const [text, setText] = useState('');
  const endRef = useRef<HTMLDivElement>(null);
  const other = id ?? '';
  const msgs = db.messages.filter((m) => (m.from === me && m.to === other) || (m.from === other && m.to === me));
  const hasUnread = msgs.some((m) => m.to === me && !m.read);
  useEffect(() => { if (hasUnread) markRead(other); }, [hasUnread, other, markRead]);
  useEffect(() => { endRef.current?.scrollIntoView(); }, [msgs.length]);
  if (other !== 'admin' && !idx.member.get(other)) return <Navigate to="/messages" replace />;
  const p = idx.member.get(other);
  const send = () => { if (text.trim()) { sendMessage(other, text.trim()); setText(''); } };

  return (
    <Page title={displayName(idx, other)} sub={p ? `${postOf(idx, p)} · ${idx.unit.get(p.unitId)?.name}` : 'Admin'} back>
      <div className="max-w-2xl mx-auto space-y-2 pb-20">
        <p className="text-center text-[11px] text-mut">Demo chat. The real app will use end-to-end encryption.</p>
        {msgs.map((m) => (
          <div key={m.id} className={`flex ${m.from === me ? 'justify-end' : ''}`}>
            <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${m.from === me ? 'bg-saf text-white rounded-br-sm' : 'bg-white border border-line rounded-bl-sm'}`}>
              {m.text}
              <div className={`text-[10px] mt-0.5 ${m.from === me ? 'text-white/80' : 'text-mut'}`}>{new Date(m.at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</div>
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <div className="fixed inset-x-0 bottom-[60px] z-10 bg-page/95 backdrop-blur border-t border-line">
        <div className="mx-auto max-w-2xl px-4 py-2 flex gap-2">
          <input className={inputCls} value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()} placeholder="Type a message" />
          <button onClick={send} className={btnCls}>Send</button>
        </div>
      </div>
    </Page>
  );
}
