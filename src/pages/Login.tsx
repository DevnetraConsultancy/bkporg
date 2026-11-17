import { useState } from 'react';
import { useStore } from '../data/store';
import { ADMIN_EMAIL, DEMO_ADMIN_PASSWORD, DEMO_MEMBER_PASSWORD } from '../data/config';
import type { Email } from '../data/types';
import { Field, ThemeButton, btnCls, inputCls } from '../components/ui';
import type { ReactNode } from 'react';

type Mode = 'login' | 'forgot' | 'sent' | 'mailbox' | 'reset' | 'done';

export default function Login() {
  const { login, requestPasswordEmail, resetPassword, db, idx } = useStore();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pw2, setPw2] = useState('');
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const go = (m: Mode) => { setError(''); setMode(m); };

  const doLogin = () => {
    const err = login(email, password);
    if (err) setError(err); else window.location.hash = '#/';
  };
  const doReset = () => {
    if (password !== pw2) return setError('The two passwords do not match.');
    const err = resetPassword(token, password);
    if (err) setError(err); else { setPassword(''); setPw2(''); go('done'); }
  };

  // Quick demo accounts
  const dist = idx.membersOf.get(idx.root.id) ?? [];
  const naihati1 = [...idx.unit.values()].find((u) => u.name === 'Naihati Mandal 1');
  const mandal = naihati1 ? idx.membersOf.get(naihati1.id) ?? [] : [];
  const demos = [
    { label: 'Admin (you, app owner)', email: ADMIN_EMAIL, pw: DEMO_ADMIN_PASSWORD },
    { label: 'District President (Supreme Commander)', email: dist.find((m) => m.post === 'President')?.email, pw: DEMO_MEMBER_PASSWORD },
    { label: 'Naihati Mandal 1 President', email: mandal.find((m) => m.post === 'President')?.email, pw: DEMO_MEMBER_PASSWORD },
    { label: 'Naihati Mandal 1 Treasurer (view only)', email: mandal.find((m) => m.post === 'Treasurer')?.email, pw: DEMO_MEMBER_PASSWORD },
  ].filter((d) => d.email) as { label: string; email: string; pw: string }[];

  return (
    <div className="login-bg relative min-h-dvh px-4 py-10">
      <div className="absolute right-3 top-3 text-white"><ThemeButton /></div>
      <div className="fade-up w-full max-w-sm mx-auto">
        <div className="text-center text-white mb-7">
          <div className="mx-auto w-18 h-18 rounded-3xl bg-white/15 ring-1 ring-white/30 backdrop-blur grid place-items-center text-4xl shadow-[0_12px_30px_-10px_rgba(0,0,0,.35)]">🪷</div>
          <h1 className="mt-4 text-[26px] font-bold tracking-tight">Barrackpore Sangathan</h1>
          <p className="text-sm text-white/85">District organisation app</p>
        </div>

        <Panel className="p-5 space-y-3">
          {mode === 'login' && (
            <>
              <Field label="Email"><input type="email" className={inputCls} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@gmail.com" /></Field>
              <Field label="Password"><input type="password" className={inputCls} value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && doLogin()} /></Field>
              {error && <p className="text-sm text-bad">{error}</p>}
              <button onClick={doLogin} className={btnCls + ' w-full'}>Log in</button>
              <button onClick={() => go('forgot')} className="w-full text-sm font-semibold text-saf">Forgot / set password</button>
              <p className="text-xs text-mut text-center">New here? Your committee President, General Secretary or IT In-charge adds your email first. Then tap "Forgot / set password".</p>
            </>
          )}

          {mode === 'forgot' && (
            <>
              <h2 className="font-bold">Set or reset password</h2>
              <p className="text-sm text-mut">Enter your email. We will send you a link to set a new password.</p>
              <Field label="Email"><input type="email" className={inputCls} value={email} onChange={(e) => setEmail(e.target.value)} autoFocus /></Field>
              <button onClick={() => { requestPasswordEmail(email); go('sent'); }} className={btnCls + ' w-full'}>Send email</button>
              <button onClick={() => go('login')} className="w-full text-sm text-mut">Back to log in</button>
            </>
          )}

          {mode === 'sent' && (
            <>
              <h2 className="font-bold">Check your email</h2>
              <p className="text-sm">If <b>{email}</b> is registered, an email with a password link has been sent.</p>
              <button onClick={() => go('mailbox')} className={btnCls + ' w-full'}>Open demo mailbox</button>
              <button onClick={() => go('login')} className="w-full text-sm text-mut">Back to log in</button>
            </>
          )}

          {mode === 'mailbox' && (
            <Mailbox email={email} setEmail={setEmail} emails={db.emails}
              onOpenLink={(t) => { setToken(t); setPassword(''); setPw2(''); go('reset'); }} onBack={() => go('login')} />
          )}

          {mode === 'reset' && (
            <>
              <h2 className="font-bold">Choose a new password</h2>
              <Field label="New password"><input type="password" className={inputCls} value={password} onChange={(e) => setPassword(e.target.value)} autoFocus /></Field>
              <Field label="Type it again"><input type="password" className={inputCls} value={pw2} onChange={(e) => setPw2(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && doReset()} /></Field>
              <p className="text-xs text-mut">At least 8 characters, with letters and numbers.</p>
              {error && <p className="text-sm text-bad">{error}</p>}
              <button onClick={doReset} className={btnCls + ' w-full'}>Save password</button>
            </>
          )}

          {mode === 'done' && (
            <>
              <h2 className="font-bold text-ok">Password saved</h2>
              <p className="text-sm">Now log in with your email and new password.</p>
              <button onClick={() => go('login')} className={btnCls + ' w-full'}>Go to log in</button>
            </>
          )}
        </Panel>

        {mode === 'login' && (
          <Panel className="p-4 mt-4">
            <p className="text-xs font-semibold text-mut mb-2">DEMO ACCOUNTS: tap to fill</p>
            <div className="space-y-1.5">
              {demos.map((d) => (
                <button key={d.label} onClick={() => { setEmail(d.email); setPassword(d.pw); setError(''); }}
                  className="w-full text-left rounded-lg border border-line bg-card/60 px-3 py-2 transition hover:border-saf/60 hover:bg-saf-50">
                  <div className="text-sm font-semibold">{d.label}</div>
                  <div className="text-xs text-mut truncate">{d.email} · {d.pw}</div>
                </button>
              ))}
              <button onClick={() => go('mailbox')} className="w-full text-left rounded-lg border border-dashed border-saf/60 px-3 py-2 text-sm font-semibold text-saf transition hover:bg-saf-50">📬 Demo mailbox (see emails the app sent)</button>
            </div>
          </Panel>
        )}
      </div>
    </div>
  );
}

/** Frosted card used on the login screen. */
function Panel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`glass rounded-3xl border border-white/40 shadow-[0_24px_60px_-20px_rgba(0,0,0,.45)] ${className}`}>{children}</div>;
}

/** DEMO ONLY: shows the emails the app "sent". The real app sends real emails. */
function Mailbox({ email, setEmail, emails, onOpenLink, onBack }: {
  email: string; setEmail: (e: string) => void; emails: Email[]; onOpenLink: (token: string) => void; onBack: () => void;
}) {
  const e = email.trim().toLowerCase();
  const list = emails.filter((m) => m.to === e);
  return (
    <>
      <h2 className="font-bold">📬 Demo mailbox</h2>
      <p className="text-xs rounded-lg bg-saf-50 text-saf ring-1 ring-saf/15 px-3 py-2">Demo only. In the real app these emails go to the person's Gmail.</p>
      <Field label="Whose mailbox?"><input type="email" className={inputCls} value={email} onChange={(ev) => setEmail(ev.target.value)} /></Field>
      <div className="space-y-2 max-h-80 overflow-y-auto">
        {list.map((m) => (
          <div key={m.id} className="rounded-xl border border-line p-3">
            <div className="text-[11px] text-mut">{new Date(m.at).toLocaleString('en-IN')}</div>
            <div className="text-sm font-semibold">{m.subject}</div>
            <p className="text-xs mt-1">{m.body}</p>
            {m.token && <button onClick={() => onOpenLink(m.token!)} className={btnCls + ' w-full mt-2 !py-2'}>Set password</button>}
          </div>
        ))}
        {!list.length && <p className="text-sm text-mut text-center py-4">No emails for this address.</p>}
      </div>
      <button onClick={onBack} className="w-full text-sm text-mut">Back to log in</button>
    </>
  );
}
