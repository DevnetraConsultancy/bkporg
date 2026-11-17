import type { ReactNode } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import type { Member, Unit } from '../data/types';
import { TYPE_LABEL } from '../data/config';
import { isPowerPost, myId, postOf, useStore } from '../data/store';
import { resolveTheme, setThemeMode, useThemeMode } from '../data/theme';

const COLORS = ['#EA6A0C', '#15803D', '#2563EB', '#9333EA', '#DB2777', '#0891B2', '#CA8A04', '#4F46E5'];

export function Avatar({ name, size = 40 }: { name: string; size?: number }) {
  const initials = name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
  const color = COLORS[[...name].reduce((s, c) => s + c.charCodeAt(0), 0) % COLORS.length];
  return (
    <div className="shrink-0 rounded-full grid place-items-center text-white font-semibold tracking-wide"
      style={{
        width: size, height: size, fontSize: size * 0.36,
        background: `linear-gradient(140deg, color-mix(in srgb, ${color} 80%, white), color-mix(in srgb, ${color} 75%, black))`,
        boxShadow: `inset 0 1px 0 rgba(255,255,255,.25), 0 0 0 2px var(--color-card), 0 0 0 ${size > 50 ? 4 : 3}px color-mix(in srgb, ${color} 30%, transparent)`,
      }}>
      {initials}
    </div>
  );
}

export function Icon({ d, size = 20, className = '' }: { d: string; size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
      strokeLinecap="round" strokeLinejoin="round" className={className}><path d={d} /></svg>
  );
}

export const I = {
  back: 'M15 18l-6-6 6-6',
  chev: 'M9 18l6-6-6-6',
  map: 'M12 3v6m0 0a3 3 0 100 6 3 3 0 000-6zM5 21v-3a3 3 0 013-3h0M19 21v-3a3 3 0 00-3-3h0',
  search: 'M11 19a8 8 0 100-16 8 8 0 000 16zm10 2l-4.35-4.35',
  cal: 'M8 2v4m8-4v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z',
  chat: 'M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z',
  user: 'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z',
  phone: 'M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3.1 19.5 19.5 0 01-6-6A19.8 19.8 0 012.1 4.2 2 2 0 014.1 2h3a2 2 0 012 1.7c.1.9.4 1.8.7 2.7a2 2 0 01-.5 2.1L8 9.8a16 16 0 006 6l1.3-1.3a2 2 0 012.1-.4c.9.3 1.8.6 2.7.7a2 2 0 011.7 2z',
  mail: 'M4 4h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zm18 2l-10 7L2 6',
  plus: 'M12 5v14M5 12h14',
  edit: 'M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z',
  up: 'M18 15l-6-6-6 6',
  down: 'M6 9l6 6 6-6',
  list: 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01',
  star: 'M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z',
  info: 'M12 22a10 10 0 100-20 10 10 0 000 20zm0-6v-4m0-4h.01',
  sun: 'M12 3v2m0 14v2M5.6 5.6L7 7m10 10l1.4 1.4M3 12h2m14 0h2M5.6 18.4L7 17m10-10l1.4-1.4M12 8a4 4 0 100 8 4 4 0 000-8z',
  moon: 'M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z',
};

/** Sun / moon button: switches between light and dark. */
export function ThemeButton() {
  const mode = useThemeMode();
  const dark = resolveTheme(mode) === 'dark';
  return (
    <button aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'} title={dark ? 'Light theme' : 'Dark theme'}
      onClick={() => setThemeMode(dark ? 'light' : 'dark')}
      className="p-2 rounded-full hover:bg-white/15 active:scale-95 transition">
      <Icon d={dark ? I.sun : I.moon} size={19} />
    </button>
  );
}

/** Page frame: saffron top bar + content + bottom navigation. */
export function Page({ title, sub, back, right, children, top }: {
  title: string; sub?: string; back?: boolean; right?: ReactNode; children: ReactNode; top?: ReactNode;
}) {
  const nav = useNavigate();
  return (
    <div className="min-h-dvh pb-28">
      <header className="hdr sticky top-0 z-20 text-white shadow-[0_8px_24px_-12px_rgba(124,45,18,.55)]">
        <div className="mx-auto max-w-5xl px-4 pt-3 pb-3 flex items-center gap-2">
          {back && (
            <button aria-label="Back" onClick={() => (history.length > 1 ? nav(-1) : nav('/'))}
              className="-ml-2 p-2 rounded-full hover:bg-white/15"><Icon d={I.back} /></button>
          )}
          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-bold tracking-tight truncate">{title}</h1>
            {sub && <p className="text-xs opacity-90 truncate">{sub}</p>}
          </div>
          {right}
          <ThemeButton />
        </div>
        {top && <div className="mx-auto max-w-5xl px-4 pb-3">{top}</div>}
      </header>
      <main className="fade-up mx-auto max-w-5xl px-4 py-4">{children}</main>
      <BottomNav />
    </div>
  );
}

function BottomNav() {
  const { db, user } = useStore();
  const me = myId(user);
  const unread = db.messages.filter((m) => m.to === me && !m.read).length;
  const items = [
    { to: '/', label: 'Hierarchy', d: I.map, end: true },
    { to: '/search', label: 'Search', d: I.search },
    { to: '/events', label: 'Events', d: I.cal },
    { to: '/messages', label: 'Messages', d: I.chat, badge: unread },
    { to: '/me', label: 'Me', d: I.user },
  ];
  return (
    <nav className="glass fixed bottom-0 inset-x-0 z-20 border-t border-line pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto max-w-5xl grid grid-cols-5">
        {items.map((it) => (
          <NavLink key={it.to} to={it.to} end={it.end}
            className={({ isActive }) => `group relative flex flex-col items-center gap-0.5 pt-2 pb-2.5 text-[11px] transition-colors ${isActive ? 'text-saf font-semibold' : 'text-mut hover:text-ink'}`}>
            {({ isActive }) => (
              <>
                <span className={`grid place-items-center h-8 w-14 rounded-full transition-all ${isActive ? 'bg-saf-100' : 'group-active:bg-soft'}`}>
                  <Icon d={it.d} size={21} />
                </span>
                {it.label}
                {!!it.badge && <span className="absolute top-1 left-1/2 ml-3 min-w-4 h-4 px-1 rounded-full bg-bad text-white text-[10px] grid place-items-center ring-2 ring-card">{it.badge}</span>}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`bg-card rounded-2xl border border-line shadow-card ${className}`}>{children}</div>;
}

export function PowerBadge() {
  return (
    <span title="Can manage this committee" aria-label="Can manage this committee" className="inline-flex items-center rounded-full bg-saf-100 text-saf p-0.5">
      <Icon d={I.star} size={11} />
    </span>
  );
}

/** One person in the mind map. Tap opens full details. */
export function PersonNode({ m }: { m: Member }) {
  const { idx } = useStore();
  return (
    <Link to={`/person/${m.id}`} className="flex items-center gap-3 bg-card rounded-xl border border-line shadow-card px-3 py-2.5 hover:border-saf/60 hover:shadow-lift hover:-translate-y-px active:scale-[.99] transition">
      <span className="w-5 text-xs text-mut text-right">{m.rank}</span>
      <Avatar name={m.name} size={36} />
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold truncate">{m.name}</div>
        <div className="text-xs text-mut truncate flex items-center gap-1.5">{postOf(idx, m)}{isPowerPost(idx, m) && <PowerBadge />}</div>
      </div>
      <Icon d={I.chev} size={18} className="text-faint" />
    </Link>
  );
}

/** One unit (Assembly / Mandal / ...) in the mind map. Tap goes one level down. */
export function UnitNode({ u, color }: { u: Unit; color?: string }) {
  const { idx } = useStore();
  const head = idx.membersOf.get(u.id)?.[0];
  const below = idx.children.get(u.id)?.length ?? 0;
  return (
    <Link to={`/unit/${u.id}`} className="flex items-center gap-3 bg-card rounded-xl border border-line shadow-card px-3 py-2.5 hover:border-saf/60 hover:shadow-lift hover:-translate-y-px active:scale-[.99] transition">
      <div className="w-1.5 self-stretch rounded-full bg-saf/70" style={color ? { background: color } : undefined} />
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold truncate">{u.name}</div>
        <div className="text-xs text-mut truncate">{head ? `${head.name} · ${postOf(idx, head)}` : 'No head yet'}</div>
      </div>
      <div className="text-right">
        <div className="text-xs font-semibold" style={{ color: color ?? 'var(--color-saf)' }}>{idx.subtreeCount.get(u.id)} people</div>
        {below > 0 && <div className="text-[10px] text-mut">{below} below</div>}
      </div>
      <Icon d={I.chev} size={18} className="text-faint" />
    </Link>
  );
}

export function TypeChip({ u }: { u: Unit }) {
  return <span className="rounded-full bg-white/20 px-2 py-0.5 text-[11px] font-semibold">{TYPE_LABEL[u.type]}</span>;
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold text-mut mb-1">{label}</span>
      {children}
    </label>
  );
}

export const inputCls = 'w-full rounded-xl border border-line bg-card text-ink placeholder:text-faint px-3 py-2.5 text-sm outline-none transition focus:border-saf focus:ring-4 focus:ring-saf/15';
export const btnCls = 'inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-b from-[#F97316] to-[#DC5A06] text-white font-semibold px-4 py-2.5 text-sm shadow-[0_8px_20px_-8px_rgba(234,106,12,.7),inset_0_1px_0_rgba(255,255,255,.25)] hover:brightness-105 active:scale-[.98] transition disabled:opacity-50';
export const btn2Cls = 'inline-flex items-center justify-center gap-1.5 rounded-xl border border-saf/40 text-saf font-semibold px-4 py-2 text-sm bg-saf-50 hover:bg-saf-100 hover:border-saf/70 active:scale-[.98] transition';
