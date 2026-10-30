import { db, log } from '@/lib/db';
import { OK } from '../route';
export async function PUT(req, { params }) {
  const { col, id } = await params;
  if (!OK.includes(col) || col === 'audit') return Response.json({}, { status: 404 });
  const doc = await db.update(col, id, await req.json());
  await log('Update', col.replace(/s$/, ''), `Changed ${doc.name || id}`);
  return Response.json(doc);
}
export async function DELETE(_, { params }) {
  const { col, id } = await params;
  if (!OK.includes(col) || col === 'audit') return Response.json({}, { status: 404 });
  await log('Delete', col.replace(/s$/, ''), `Removed ${id}`);
  return Response.json(await db.remove(col, id));
}
