import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { DB, Email, EventItem, Member, Message, Unit, User } from './types';
import { createSeed } from './seed';
import { POWER_POSTS } from './config';
import { hashPw, newToken, passwordProblem } from './hash';

const DB_KEY = 'bkp-sangathan-db-v3';
const USER_KEY = 'bkp-sangathan-user-v1';

function load<T>(key: string, fallback: () => T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as T;
  } catch { /* storage blocked or broken: use fallback */ }
  return fallback();
}
function save(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* ignore */ }
}

export interface Index {
  unit: Map<string, Unit>;
  member: Map<string, Member>;
  children: Map<string, Unit[]>;
  membersOf: Map<string, Member[]>; // sorted by rank
  subtreeCount: Map<string, number>; // people in this unit + all below
  root: Unit;
}

function buildIndex(db: DB): Index {
  const unit = new Map(db.units.map((u) => [u.id, u]));
  const member = new Map(db.members.map((m) => [m.id, m]));
  const children = new Map<string, Unit[]>();
  db.units.forEach((u) => {
    if (u.parentId) children.set(u.parentId, [...(children.get(u.parentId) ?? []), u]);
  });
  const membersOf = new Map<string, Member[]>();
  db.members.forEach((m) => membersOf.set(m.unitId, [...(membersOf.get(m.unitId) ?? []), m]));
  membersOf.forEach((list) => list.sort((a, b) => a.rank - b.rank));
  const subtreeCount = new Map<string, number>();
  const count = (id: string): number => {
    const n = (membersOf.get(id)?.length ?? 0) + (children.get(id) ?? []).reduce((s, c) => s + count(c.id), 0);
    subtreeCount.set(id, n);
    return n;
  };
  const root = db.units.find((u) => u.parentId === null)!;
  count(root.id);
  return { unit, member, children, membersOf, subtreeCount, root };
}

/* ---------- helpers that do not need React ---------- */

export function ancestors(idx: Index, unitId: string): Unit[] {
  const out: Unit[] = [];
  let u = idx.unit.get(unitId);
  while (u) { out.unshift(u); u = u.parentId ? idx.unit.get(u.parentId) : undefined; }
  return out;
}

export function isInside(idx: Index, unitId: string, topId: string) {
  return ancestors(idx, unitId).some((u) => u.id === topId);
}

export function isPowerPost(idx: Index, m: Member) {
  const u = idx.unit.get(m.unitId);
  return !!u && POWER_POSTS[u.type].includes(m.post);
}

export const isAdmin = (user: User | null) => user?.kind === 'admin';

/** The unit whose committee this user leads (null = none). Admin (the app owner) manages everything. */
export function powerUnit(idx: Index, user: User | null): Unit | null {
  if (!user) return null;
  if (user.kind === 'admin') return idx.root;
  const m = idx.member.get(user.id);
  return m && isPowerPost(idx, m) ? idx.unit.get(m.unitId) ?? null : null;
}

/** Can add people, set ranking and create events for this unit's committee?
 *  Admin: every unit. President, General Secretary, IT In-charge: only their own committee. */
export function canManage(idx: Index, user: User | null, unitId: string) {
  if (isAdmin(user)) return true;
  const p = powerUnit(idx, user);
  if (!p) return false;
  const u = idx.unit.get(unitId);
  // A committee without its own 3 (e.g. Extended Committee) is managed by the unit above it.
  const owner = u && POWER_POSTS[u.type].length === 0 ? u.parentId : unitId;
  return p.id === owner;
}

/** Can edit this person's record? These 3 cannot edit each other; only Admin can. */
export function canEditMember(idx: Index, user: User | null, m: Member) {
  if (isAdmin(user)) return true;
  return canManage(idx, user, m.unitId) && !isPowerPost(idx, m);
}

/** Post as shown on screen. The District President is the Supreme Commander. */
/** Name of a unit's own committee: the District's is called "Office Bearers". */
export function committeeName(idx: Index, u: Unit) {
  return u.id === idx.root.id ? 'Office Bearers' : u.type === 'extended' ? 'Members' : 'Committee';
}

export function postOf(idx: Index, m: Member) {
  return m.unitId === idx.root.id && m.post === 'President' ? 'President (Supreme Commander)' : m.post;
}

export function displayName(idx: Index, id: string) {
  return id === 'admin' ? 'Admin' : idx.member.get(id)?.name ?? 'Unknown';
}

/* ---------- React store ---------- */

export type ProfileFields = Pick<Member, 'name' | 'phone' | 'gender' | 'age' | 'bloodGroup' | 'address'>;

interface Store {
  db: DB;
  idx: Index;
  user: User | null;
  login: (email: string, password: string) => string | null; // returns error text
  logout: () => void;
  requestPasswordEmail: (email: string) => void;
  resetPassword: (token: string, password: string) => string | null;
  changePassword: (oldPw: string, newPw: string) => string | null;
  emailInUse: (email: string, exceptMemberId?: string) => boolean;
  saveMember: (m: Member) => void;
  updateMyProfile: (f: ProfileFields) => void;
  removeMember: (id: string) => void;
  setRanking: (unitId: string, orderedIds: string[]) => void;
  addEvent: (e: EventItem) => void;
  sendMessage: (to: string, text: string) => void;
  markRead: (otherId: string) => void;
  resetDemo: () => void;
}

const Ctx = createContext<Store | null>(null);

function mail(to: string, subject: string, body: string, token?: string): Email {
  return { id: `mail${Date.now()}${Math.random().toString(36).slice(2, 6)}`, to, subject, body, token, at: new Date().toISOString() };
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [db, setDb] = useState<DB>(() => load(DB_KEY, createSeed));
  const [user, setUser] = useState<User | null>(() => load<User | null>(USER_KEY, () => null));
  const idx = useMemo(() => buildIndex(db), [db]);

  useEffect(() => save(DB_KEY, db), [db]);
  useEffect(() => save(USER_KEY, user), [user]);

  const me = myId(user);
  const norm = (e: string) => e.trim().toLowerCase();

  const store: Store = {
    db, idx, user,
    login: (email, password) => {
      const e = norm(email);
      const h = hashPw(password);
      if (e === db.admin.email) {
        if (h !== db.admin.passwordHash) return 'Wrong email or password.';
        setUser({ kind: 'admin', id: 'admin', email: e });
        return null;
      }
      const m = db.members.find((x) => x.email === e);
      if (!m) return 'Wrong email or password.';
      if (!m.passwordHash) return 'You have not set a password yet. Tap "Forgot / set password" and check your email.';
      if (m.passwordHash !== h) return 'Wrong email or password.';
      setUser({ kind: 'member', id: m.id });
      return null;
    },
    logout: () => setUser(null),
    requestPasswordEmail: (email) => {
      const e = norm(email);
      const token = newToken();
      const body = 'Tap the button below to set a new password. If you did not ask for this, ignore this email.';
      if (e === db.admin.email) {
        setDb((d) => ({ ...d, admin: { ...d.admin, resetToken: token }, emails: [mail(e, 'Reset your password', body, token), ...d.emails] }));
        return;
      }
      if (!db.members.some((x) => x.email === e)) return; // say nothing, so emails cannot be guessed
      setDb((d) => ({
        ...d,
        members: d.members.map((x) => (x.email === e ? { ...x, resetToken: token } : x)),
        emails: [mail(e, 'Reset your password', body, token), ...d.emails],
      }));
    },
    resetPassword: (token, password) => {
      const bad = passwordProblem(password);
      if (bad) return bad;
      if (db.admin.resetToken === token) {
        setDb((d) => ({ ...d, admin: { ...d.admin, passwordHash: hashPw(password), resetToken: null } }));
        return null;
      }
      if (!db.members.some((x) => x.resetToken === token)) return 'This link is old or already used. Ask for a new email.';
      setDb((d) => ({ ...d, members: d.members.map((x) => (x.resetToken === token ? { ...x, passwordHash: hashPw(password), resetToken: null } : x)) }));
      return null;
    },
    changePassword: (oldPw, newPw) => {
      const current = user?.kind === 'admin' ? db.admin.passwordHash : db.members.find((x) => x.id === me)?.passwordHash;
      if (!current || current !== hashPw(oldPw)) return 'Current password is wrong.';
      const bad = passwordProblem(newPw);
      if (bad) return bad;
      const h = hashPw(newPw);
      setDb((d) => (user?.kind === 'admin'
        ? { ...d, admin: { ...d.admin, passwordHash: h } }
        : { ...d, members: d.members.map((x) => (x.id === me ? { ...x, passwordHash: h } : x)) }));
      return null;
    },
    emailInUse: (email, exceptMemberId) => {
      const e = norm(email);
      return e === db.admin.email || db.members.some((x) => x.email === e && x.id !== exceptMemberId);
    },
    // New person, or email changed: no password yet, and an invite email is sent.
    saveMember: (m) => setDb((d) => {
      const old = d.members.find((x) => x.id === m.id);
      const email = norm(m.email);
      if (old && old.email === email) {
        return { ...d, members: d.members.map((x) => (x.id === m.id ? { ...m, email } : x)) };
      }
      const token = newToken();
      const unitName = d.units.find((u) => u.id === m.unitId)?.name ?? '';
      const invited = { ...m, email, passwordHash: null, resetToken: token };
      return {
        ...d,
        members: old ? d.members.map((x) => (x.id === m.id ? invited : x)) : [...d.members, invited],
        emails: [mail(email, `You are added as ${m.post}, ${unitName}`,
          `Namaskar ${m.name}. You have been added to the Barrackpore Sangathan app as ${m.post} of ${unitName}. Tap the button below to set your password, then log in with this email.`, token), ...d.emails],
      };
    }),
    updateMyProfile: (f) => setDb((d) => ({ ...d, members: d.members.map((x) => (x.id === me ? { ...x, ...f } : x)) })),
    removeMember: (id) => setDb((d) => ({ ...d, members: d.members.filter((x) => x.id !== id) })),
    setRanking: (unitId, orderedIds) => setDb((d) => ({
      ...d,
      members: d.members.map((x) => (x.unitId === unitId ? { ...x, rank: orderedIds.indexOf(x.id) + 1 } : x)),
    })),
    addEvent: (e) => setDb((d) => ({ ...d, events: [e, ...d.events] })),
    sendMessage: (to, text) => setDb((d) => ({
      ...d,
      messages: [...d.messages, { id: `msg${Date.now()}`, from: me, to, text, at: new Date().toISOString(), read: false } as Message],
    })),
    markRead: (otherId) => setDb((d) => ({
      ...d,
      messages: d.messages.map((x) => (x.from === otherId && x.to === me && !x.read ? { ...x, read: true } : x)),
    })),
    resetDemo: () => { setDb(createSeed()); setUser(null); },
  };

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}

export function useStore() {
  const s = useContext(Ctx);
  if (!s) throw new Error('useStore must be inside StoreProvider');
  return s;
}

export function myId(user: User | null) {
  return !user ? '' : user.kind === 'admin' ? 'admin' : user.id;
}
