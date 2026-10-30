import fs from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';
import { currentUser } from './session';
const MODE = process.env.DB_MODE || 'json';
const FILE = path.join(process.cwd(), 'data', 'db.json');
const rd = async () => JSON.parse(await fs.readFile(FILE, 'utf8'));
const wr = (d) => fs.writeFile(FILE, JSON.stringify(d, null, 2));
let _m;
async function mongo() {
  if (!_m) {
    const { MongoClient } = await import('mongodb');
    const c = await new MongoClient(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017').connect();
    _m = c.db(process.env.MONGODB_DB || 'bakery_pos');
  }
  return _m;
}
const P = { projection: { _id: 0 } };
export const db = {
  mode: MODE,
  async list(col) {
    if (MODE === 'mongo') {
      const c = (await mongo()).collection(col);
      if ((await c.countDocuments()) === 0) { // first run: seed from data/db.json
        const seed = (await rd())[col] || [];
        if (seed.length) await c.insertMany(seed.map((x) => ({ ...x })));
      }
      return c.find({}, P).toArray();
    }
    return (await rd())[col] || [];
  },
  async insert(col, doc) {
    doc = { id: randomUUID(), createdAt: new Date().toISOString(), ...doc };
    if (MODE === 'mongo') await (await mongo()).collection(col).insertOne({ ...doc });
    else { const d = await rd(); (d[col] ??= []).unshift(doc); await wr(d); }
    return doc;
  },
  async update(col, id, patch) {
    if (MODE === 'mongo') {
      await (await mongo()).collection(col).updateOne({ id }, { $set: patch }, { upsert: true });
      return { id, ...patch };
    }
    const d = await rd(); const a = (d[col] ??= []);
    const i = a.findIndex((x) => x.id === id);
    if (i < 0) a.push({ id, ...patch }); else a[i] = { ...a[i], ...patch };
    await wr(d); return a.find((x) => x.id === id);
  },
  async remove(col, id) {
    if (MODE === 'mongo') await (await mongo()).collection(col).deleteOne({ id });
    else { const d = await rd(); d[col] = (d[col] || []).filter((x) => x.id !== id); await wr(d); }
    return { ok: true };
  },
};
export const log = async (action, record, summary, who) =>
  db.insert('audit', { who: who || (await currentUser())?.name || 'System', action, record, summary });
