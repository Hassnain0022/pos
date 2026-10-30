import { db, log } from '@/lib/db';
import { checkPw, makeToken } from '@/lib/session';
export async function POST(req) {
  const { username, password } = await req.json();
  const u = (await db.list('users')).find((x) => x.username === String(username || '').trim().toLowerCase() && x.active !== false);
  if (!u || !checkPw(String(password || ''), u.passwordHash)) return Response.json({ error: 'Wrong username or password.' }, { status: 401 });
  await log('Login', 'user', `${u.name} signed in`, u.name);
  return Response.json({ name: u.name, role: u.role }, { headers: { 'Set-Cookie': `session=${makeToken(u)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=43200` } });
}
