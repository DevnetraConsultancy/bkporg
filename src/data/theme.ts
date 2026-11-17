import { useSyncExternalStore } from 'react';

/** Theme: 'system' follows the phone setting. Saved per device. */
export type ThemeMode = 'system' | 'light' | 'dark';
const KEY = 'bkp-theme';
const mq = typeof window !== 'undefined' ? window.matchMedia('(prefers-color-scheme: dark)') : null;

function read(): ThemeMode {
  try {
    const v = localStorage.getItem(KEY);
    if (v === 'light' || v === 'dark' || v === 'system') return v;
  } catch { /* storage blocked */ }
  return 'system';
}

let mode: ThemeMode = read();
const subs = new Set<() => void>();

export const resolveTheme = (m: ThemeMode): 'light' | 'dark' => (m === 'system' ? (mq?.matches ? 'dark' : 'light') : m);

function apply() {
  const t = resolveTheme(mode);
  document.documentElement.dataset.theme = t;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', t === 'dark' ? '#7C2D12' : '#EA6A0C');
}

export function setThemeMode(m: ThemeMode) {
  mode = m;
  try { localStorage.setItem(KEY, m); } catch { /* ignore */ }
  apply();
  subs.forEach((f) => f());
}

mq?.addEventListener('change', () => { if (mode === 'system') { apply(); subs.forEach((f) => f()); } });
apply();

export function useThemeMode(): ThemeMode {
  return useSyncExternalStore((cb) => { subs.add(cb); return () => { subs.delete(cb); }; }, () => mode);
}
