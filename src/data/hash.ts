/**
 * DEMO ONLY password hash (runs in the browser).
 * The real app must check passwords on a server (e.g. Supabase Auth uses bcrypt).
 */
export function hashPw(pw: string): string {
  let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
  const s = 'bkp-demo-salt:' + pw;
  for (let i = 0; i < s.length; i++) {
    const ch = s.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (h2 >>> 0).toString(16).padStart(8, '0') + (h1 >>> 0).toString(16).padStart(8, '0');
}

export function newToken(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function passwordProblem(pw: string): string | null {
  if (pw.length < 8) return 'Password must be at least 8 characters.';
  if (!/[0-9]/.test(pw) || !/[A-Za-z]/.test(pw)) return 'Use both letters and numbers.';
  return null;
}
