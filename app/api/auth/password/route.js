import { db, log } from '@/lib/db';
import { checkPw, hashPw, currentUser } from '@/lib/session';
export async function POST(req) {
  const me = await currentUser();
  const { oldPassword, newPassword } = await req.json();
  const u = (await db.list('users')).find((x) => x.id === me?.uid);
  if (!u || !checkPw(String(oldPassword || ''), u.passwordHash)) return Response.json({ error: 'Current password is wrong.' }, { status: 403 });
  if (String(newPassword || '').length < 4) return Response.json({ error: 'Use at least 4 characters.' }, { status: 400 });
  await db.update('users', u.id, { passwordHash: hashPw(String(newPassword)) });
  await log('Update', 'user', `${u.name} changed their password`);
  return Response.json({ ok: true });
}
