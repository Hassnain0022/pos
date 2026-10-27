import { db, log } from '@/lib/db';
export async function GET() { return Response.json(await db.list('sales')); }
export async function POST(req) {
  const b = await req.json();
  const items = b.items || [];
  const type = b.type || 'CASH';
  const subtotal = items.reduce((s, x) => s + x.qty * x.rate * (1 - (x.disc || 0) / 100), 0);
  const total = Math.max(0, subtotal - (b.discount || 0));
  const paid = type === 'CASH' ? (b.paid ?? total) : b.paid || 0;
  const n = (await db.list('sales')).length + 1;
  const sale = await db.insert('sales', {
    billNo: 'T11-' + String(n).padStart(5, '0'), type, customer: b.customer || 'Walk-in customer',
    remarks: b.remarks || '', date: b.date, items, subtotal, discount: b.discount || 0, total, paid,
    change: Math.max(0, paid - total), balance: Math.max(0, total - paid), cashier: b.cashier || 'Admin',
  });
  const prods = await db.list('products');
  for (const it of items) {
    const p = prods.find((x) => x.id === it.productId);
    if (p) await db.update('products', p.id, { stock: (p.stock || 0) - it.qty });
  }
  await log('Create', 'sale', `Sale ${sale.billNo} · ${items.length} items`, sale.cashier);
  return Response.json(sale);
}
