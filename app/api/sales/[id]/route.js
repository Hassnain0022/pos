import { db, log } from '@/lib/db';
import { isAdmin } from '@/lib/auth';
const bad = (error, status = 400) => Response.json({ error }, { status });

// PUT body: { action: 'void', reason, password }  or  { action: 'edit', items, customer, remarks, type, discount1, discount2, paid, password }
export async function PUT(req, { params }) {
  const { id } = await params;
  const b = await req.json();
  if (!(await isAdmin(b.password))) return bad('Wrong admin password.', 403);
  const s = (await db.list('sales')).find((x) => x.id === id);
  if (!s) return bad('Bill not found.', 404);
  if (s.voided) return bad('This bill is already voided.');

  const delta = {}; // stock change per product
  for (const it of s.items) if (it.taken !== false) delta[it.productId] = (delta[it.productId] || 0) + it.qty;
  let patch, summary;

  if (b.action === 'void') {
    if (!b.reason?.trim()) return bad('A reason is required.');
    patch = { voided: true, voidedAt: new Date().toISOString(), voidReason: b.reason.trim() };
    summary = `Voided ${s.billNo} · reason: ${b.reason.trim()}`;
  } else if (b.action === 'edit') {
    const items = b.items || [];
    if (!items.length) return bad('A bill needs at least one item.');
    const type = b.type === 'CREDIT' ? 'CREDIT' : 'CASH';
    const subtotal = items.reduce((t, x) => t + x.qty * x.rate * (1 - (x.disc || 0) / 100), 0);
    const d1 = b.discount1 || 0, d2 = b.discount2 || 0;
    const total = Math.max(0, subtotal - d1 - d2);
    const paid = type === 'CASH' ? b.paid || total : b.paid || 0;
    for (const it of items) if (it.taken !== false) delta[it.productId] = (delta[it.productId] || 0) - it.qty;
    patch = { date: b.date || s.date, items, type, customer: b.customer || 'Walk-in customer', remarks: b.remarks || '', subtotal, discount: d1 + d2, discount1: d1, discount2: d2,
      total, paid, change: Math.max(0, paid - total), balance: Math.max(0, total - paid), edited: true, editedAt: new Date().toISOString() };
    summary = `Edited ${s.billNo} · net Rs ${Math.round(s.total)} → Rs ${Math.round(total)}`;
  } else return bad('Unknown action.');

  const prods = await db.list('products');
  for (const [pid, d] of Object.entries(delta)) {
    const p = prods.find((x) => x.id === pid);
    if (p && d) await db.update('products', pid, { stock: (p.stock || 0) + d }); // void adds back; edit adds the difference
  }
  await db.update('sales', id, patch);
  await log(b.action === 'void' ? 'Delete' : 'Update', 'sale', summary);
  return Response.json({ ok: true });
}
