import { currentUser } from '@/lib/session';
export async function GET() {
  const u = await currentUser();
  return Response.json(u ? { name: u.name, role: u.role } : {}, { status: u ? 200 : 401 });
}
