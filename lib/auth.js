import { db } from './db';
import { checkPw } from './session';
// Admin approval (void / edit bills): the password of any active Admin or Owner.
export const isAdmin = async (pw) =>
  !!pw && (await db.list('users')).some((u) => u.active !== false && /admin/i.test(u.role) && checkPw(String(pw), u.passwordHash));
