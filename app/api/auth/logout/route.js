export async function POST() {
  return Response.json({ ok: true }, { headers: { 'Set-Cookie': 'session=; Path=/; HttpOnly; Max-Age=0' } });
}
