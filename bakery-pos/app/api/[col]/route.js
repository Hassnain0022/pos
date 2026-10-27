import { db, log } from '@/lib/db';
export const OK = ['products', 'users', 'settings', 'audit', 'sales', 'pending'];
export async function GET(_, { params }) {
  const { col } = await params;
  if (!OK.includes(col)) return Response.json([], { status: 404 });
  return Response.json(await db.list(col));
}
export async function POST(req, { params }) {
  const { col } = await params;
  if (!OK.includes(col) || col === 'audit') return Response.json({}, { status: 404 });
  const doc = await db.insert(col, await req.json());
  await log('Create', col.replace(/s$/, ''), `Added ${doc.name || doc.id}`);
  return Response.json(doc);
}
