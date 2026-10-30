import { createHmac, scryptSync, randomBytes, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';
const secret = () => process.env.AUTH_SECRET || 'change-this-secret';
export const hashPw = (pw) => { const salt = randomBytes(16).toString('hex'); return salt + ':' + scryptSync(pw, salt, 64).toString('hex'); };
export const checkPw = (pw, stored) => {
  if (!stored) return false;
  const [salt, h] = stored.split(':'), a = Buffer.from(h, 'hex'), b = scryptSync(pw, salt, 64);
  return a.length === b.length && timingSafeEqual(a, b);
};
const sig = (p) => createHmac('sha256', secret()).update(p).digest('hex');
export const makeToken = (u) => {
  const p = Buffer.from(JSON.stringify({ uid: u.id, name: u.name, role: u.role, exp: Date.now() + 12 * 3600e3 })).toString('base64url');
  return p + '.' + sig(p);
};
export const readToken = (t) => {
  try { const [p, s] = (t || '').split('.'); if (!p || s !== sig(p)) return null;
    const d = JSON.parse(Buffer.from(p, 'base64url').toString()); return d.exp > Date.now() ? d : null; } catch { return null; }
};
export const currentUser = async () => readToken((await cookies()).get('session')?.value);
