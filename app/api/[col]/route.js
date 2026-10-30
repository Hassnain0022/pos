import { db, log } from '@/lib/db';
export const OK = ['products', 'users', 'settings', 'audit', 'sales', 'pending'];
export async function GET(_, { params }) {
  const { col } = await params;
  if (!OK.includes(col)) return Response.json([], { status: 404 });
  const rows = await db.list(col);
  return Response.json(col === 'users' ? rows.map(({ passwordHash, ...u }) => u) : rows);
}
export async function POST(req, { params }) {
  const { col } = await params;
  if (!OK.includes(col) || col === 'audit') return Response.json({}, { status: 404 });
  const doc = await db.insert(col, await req.json());
  await log('Create', col.replace(/s$/, ''), `Added ${doc.name || doc.id}`);
  return Response.json(doc);
}
