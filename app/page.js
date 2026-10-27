'use client';
import { useEffect, useRef, useState } from 'react';
const api = (u, method = 'GET', body) =>
  fetch('/api/' + u, { method, headers: { 'Content-Type': 'application/json' }, body: body && JSON.stringify(body) }).then((r) => r.json());
const TABS = ['Sales Invoice', 'Products', 'Audit Log', 'Settings'];
const rs = (n) => 'Rs ' + Number(n || 0).toLocaleString();

const RIBBON = {
  SALES: [['Transactions', [['Sales Invoice', '🧾'], ['Sales History', '🕘'], ['Sales Return', '↩️'], ['Return History', '🗂️']]]],
  PURCHASE: [['Transactions', [['Purchase Invoice', '📄'], ['Purchase History', '📋'], ['Purchase Return', '↪️'], ['Purchase Return History', '🗃️']]]],
  CASH: [['Transactions', [['Cash Payment', '💸'], ['Cash Receipt', '💵'], ['Cash Book', '📖']]],
    ['Reports', [['Payments Summary', '📊'], ['Payments Details', '📃'], ['Receipts Summary', '📈'], ['Receipts Details', '📑']]]],
  ACCOUNTS: [['Setup & Transactions', [['Account Categories', '🗂️'], ['Accounts Setup', '🧮'], ['Customer Setup', '👤'], ['Supplier Setup', '🚚'], ['Journal Voucher', '✍️'], ['Opening Balance', '⚖️']]],
    ['Reports', [['Account Statement', '📘'], ['Customer Ledger', '📒'], ['Supplier Ledger', '📕'], ['Chart of Accounts', '📜']]]],
  PRODUCTS: [['Basic Setup', [['Define Products', '📦'], ['Define Manufacturer', '🏭'], ['Define Category', '🏷️'], ['Update Pricing', '💲']]],
    ['Reports', [['Product Catalogue', '🖨️'], ['Stock Report', '📚']]],
    ['Stock', [['Stock Adjustment', '🔧'], ['Adjustment History', '🕑'], ['Opening Stock', '📥']]],
    ['Barcodes', [['Barcodes', '▥'], ['Other Barcodes', '▦']]]],
  TOOLS: [['Settings', [['Settings', '⚙️'], ['Backup Data', '💾'], ['Bill Template', '🧾'], ['Look & Feel', '🎨'], ['Users Manager', '👥'], ['Printer Settings', '🖨️'], ['Audit Log', '🛡️'], ['Deliveries', '🚛']]],
    ['Tools', [['Change Date', '📅'], ['Calculator', '🧮'], ['Change Password', '🔑']]]],
  HELP: [['Help', [['Shortcuts', '⌨️']]]],
};
const COLOR = { SALES: '#b4300f', PURCHASE: '#2347b0', CASH: '#b4300f', ACCOUNTS: '#1f2937', PRODUCTS: '#2347b0', TOOLS: '#c2410c', HELP: '#1f2937' };
const QUICK = ['Sales Invoice', 'Sales History', 'Sales Return', 'Return History', 'Purchase Invoice', 'Purchase History', 'Define Products', 'Cash Payment', 'Cash Receipt', 'Cash Book', 'Backup Data'];

export default function Home() {
  const [tab, setTab] = useState('SALES'), [screen, setScreen] = useState('Sales Invoice'), [now, setNow] = useState(null);
  useEffect(() => setNow(new Date()), []);
  const SCREEN = { 'Sales Invoice': Sales, 'Define Products': Products, 'Audit Log': Audit, Settings, 'Users Manager': Settings };
  const View = SCREEN[screen];
  const d = now ? now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-') : '';
  const wd = now ? now.toLocaleDateString('en-US', { weekday: 'long' }) : '';
  return (
    <div className="app">
      <div className="titleline">BAKERY POS – | {d} | {screen} | Admin</div>
      <nav className="tabs">{Object.keys(RIBBON).map((t) => <button key={t} className={t === tab ? 'on' : ''} onClick={() => setTab(t)}>{t}</button>)}
        <span className="grow" /><input className="gs" placeholder="Search screens, products, customers…" /><button>Sign out</button></nav>
      <div className="ribbon">{RIBBON[tab].map(([g, items]) => <div className="grp" key={g}>
        <div className="items">{items.map(([n, i]) => <button key={n} className={'rb' + (n === screen ? ' on' : '')} onClick={() => setScreen(n)}><span className="ic">{i}</span>{n}</button>)}</div><small>{g}</small></div>)}</div>
      <div className="datebar" style={{ background: COLOR[tab] }}>{d}, {wd}</div>
      <div className="body">
        <aside><div className="ql">QUICK LAUNCH</div>{QUICK.map((q) => <button key={q} className={q === screen ? 'on' : ''} onClick={() => setScreen(q)}>{q}</button>)}
          <div className="grow" /><button onClick={() => setScreen('Settings')}>Settings</button></aside>
        <section><h2 className="ptitle">{screen}</h2>
          {View ? <View /> : <p className="soon">{screen} isn’t built yet.</p>}</section>
      </div>
      <footer>CURRENT USER : ADMIN <i>(Owner / Admin)</i></footer>
    </div>
  );
}

function Sales() {
  const [prods, setProds] = useState([]), [shop, setShop] = useState({}), [no, setNo] = useState('');
  const [cart, setCart] = useState([]), [type, setType] = useState('CASH'), [cust, setCust] = useState(''), [remarks, setRemarks] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10)), [disc2, setDisc2] = useState(0), [paid, setPaid] = useState(''), [msg, setMsg] = useState('');
  const [code, setCode] = useState(''), [name, setName] = useState(''), [sel, setSel] = useState(null), [qty, setQty] = useState(1), [price, setPrice] = useState(0), [disc, setDisc] = useState(0);
  const codeRef = useRef(), qtyRef = useRef();
  const load = () => {
    api('products').then(setProds); api('settings').then((a) => setShop(a[0] || {}));
    api('sales').then((a) => setNo('T11-' + String(a.length + 1).padStart(5, '0')));
  };
  useEffect(() => { load(); codeRef.current?.focus(); }, []);

  const net = (x) => x.qty * x.rate * (1 - (x.disc || 0) / 100);
  const sub = cart.reduce((s, x) => s + net(x), 0), total = Math.max(0, sub - disc2);
  const rec = type === 'CASH' ? (paid === '' ? total : +paid) : +paid || 0;
  const units = cart.reduce((s, x) => s + x.qty, 0);
  const hits = name && !sel ? prods.filter((p) => p.active !== false && p.name.toLowerCase().includes(name.toLowerCase())).slice(0, 6) : [];

  const pick = (p) => { setSel(p); setName(p.name); setPrice(p.salePrice); setQty(1); setDisc(0); setTimeout(() => qtyRef.current?.select(), 0); };
  const addLine = (p, q = qty, r = price, d = disc) => {
    setCart((c) => [...c, { productId: p.id, code: p.barcode || '', name: p.name, qty: +q, rate: +r, disc: +d }]);
    setSel(null); setName(''); setCode(''); setQty(1); setPrice(0); setDisc(0); codeRef.current?.focus();
  };
  const scan = () => { const p = prods.find((x) => x.barcode === code || x.id === code); if (p) addLine(p, 1, p.salePrice, 0); else setMsg('No product with that barcode or ID.'); };
  const clear = () => { setCart([]); setCust(''); setRemarks(''); setDisc2(0); setPaid(''); setSel(null); setName(''); setCode(''); };
  const save = async (print) => {
    if (!cart.length) return setMsg('Add at least one item first.');
    const s = await api('sales', 'POST', { items: cart, type, customer: cust, remarks, date, discount: +disc2 || 0, paid: rec });
    setMsg(`Saved ${s.billNo}${s.change ? ' · change ' + rs(s.change) : ''}`);
    if (print) window.print();
    clear(); load();
  };
  useEffect(() => {
    const k = (e) => {
      const m = { F2: () => codeRef.current?.focus(), F4: clear, F6: () => setType((t) => (t === 'CASH' ? 'CREDIT' : 'CASH')), F9: () => save(false), F10: () => save(true) }[e.key];
      if (m) { e.preventDefault(); m(); }
    };
    window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k);
  });
  const f = (l, el, w) => <div style={{ width: w }}><label>{l}</label>{el}</div>;

  return <div className="invwrap">
    <div className="inv">
      <p className="hint"><kbd>F2</kbd> barcode · <kbd>F6</kbd> cash/credit · <kbd>F4</kbd> clear · <kbd>F9</kbd> save · <kbd>F10</kbd> save & print · stock goes out when you save</p>
      <div className="row">
        {f('Type (F6)', <button className={'typebtn ' + type} onClick={() => setType(type === 'CASH' ? 'CREDIT' : 'CASH')}>{type}</button>)}
        {f('Customer', <input value={cust} placeholder="Walk-in customer" onChange={(e) => setCust(e.target.value)} />)}
        {f('Invoice No.', <input value={no} readOnly />)}
        {f('Invoice Date', <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />)}
        {f('Remarks', <input value={remarks} onChange={(e) => setRemarks(e.target.value)} />)}
      </div>
      <div className="entry">
        {f('ID / Barcode (F2)', <input ref={codeRef} placeholder="Scan or ID" value={code} onChange={(e) => setCode(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && scan()} />, 130)}
        <div style={{ flex: 1, position: 'relative' }}><label>Product name</label>
          <input placeholder="Type the product name" value={name} onChange={(e) => { setName(e.target.value); setSel(null); }} onKeyDown={(e) => e.key === 'Enter' && hits[0] && pick(hits[0])} />
          {hits.length > 0 && <div className="drop">{hits.map((p) => <div key={p.id} className="hit" onClick={() => pick(p)}>{p.name} — {rs(p.salePrice)} <small>stock {p.stock} {p.unit}</small></div>)}</div>}</div>
        {f('Qty', <input ref={qtyRef} type="number" min="0" value={qty} onChange={(e) => setQty(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sel && addLine(sel)} />, 70)}
        {f('Price', <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sel && addLine(sel)} />, 90)}
        {f('Disc %', <input type="number" value={disc} onChange={(e) => setDisc(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sel && addLine(sel)} />, 70)}
        {f('Net value', <input readOnly value={rs(qty * price * (1 - disc / 100))} />, 110)}
        <button className="pri" disabled={!sel} onClick={() => addLine(sel)}>Add</button>
      </div>
      <table style={{ width: '100%' }}><thead><tr><th>SR</th><th>CODE</th><th>DESCRIPTION</th><th className="num">QTY</th><th className="num">PRICE</th><th className="num">DISC</th><th className="num">VALUE</th><th></th></tr></thead>
        <tbody>{cart.length === 0 && <tr><td colSpan="8" className="empty">No items yet. Scan or type the items the customer is buying.</td></tr>}
          {cart.map((x, i) => <tr key={i}><td>{i + 1}</td><td>{x.code}</td><td>{x.name}</td><td className="num">{x.qty}</td><td className="num">{rs(x.rate)}</td><td className="num">{x.disc}%</td><td className="num">{rs(net(x))}</td>
            <td><button onClick={() => setCart(cart.filter((_, j) => j !== i))}>✕</button></td></tr>)}</tbody></table>
      <div className="foot"><span>{cart.length} items · {units} units</span><span className="grow" />
        <div className="sum">
          <div><span>TOTAL BILL</span><b>{rs(sub)}</b></div>
          <div><span>DISCOUNT</span><input type="number" value={disc2} onChange={(e) => setDisc2(e.target.value)} /></div>
          <div className="big"><span>NET AMOUNT</span><b>{rs(total)}</b></div>
          <div><span>{type === 'CASH' ? 'CASH RECEIVED' : 'PAID NOW'}</span><input type="number" value={paid} placeholder={type === 'CASH' ? total : 0} onChange={(e) => setPaid(e.target.value)} /></div>
          <div><span>{type === 'CASH' ? 'CHANGE TO RETURN' : 'ON CREDIT'}</span><b>{rs(type === 'CASH' ? Math.max(0, rec - total) : Math.max(0, total - rec))}</b></div>
        </div></div>
      <div className="btns"><button onClick={clear}>Clear (F4)</button><button onClick={() => save(true)}>Save & Print (F10)</button><button className="pri" onClick={() => save(false)}>Save (F9)</button></div>
      {msg && <p className="ok">{msg}</p>}
    </div>
    <div className="receipt">
      <div className="rc big">{shop.name}</div><div className="rc sm">{shop.address}<br />{shop.phone}</div><hr />
      <div className="rc sm">Invoice · {type === 'CASH' ? 'Cash' : 'Credit'}</div>
      <div className="rl sm"><span>#{no}</span><span>{date}</span></div>
      <div className="rl sm"><span>Cashier</span><span>Admin</span></div>
      <div className="rl sm"><span>Customer</span><span>{cust || 'Walk-in customer'}</span></div><hr />
      <div className="rl sm b"><span>DESCRIPTION</span><span>QTY · RATE · AMOUNT</span></div>
      {cart.map((x, i) => <div className="rl sm" key={i}><span>{x.name}</span><span>{x.qty} · {x.rate} · {Math.round(net(x))}</span></div>)}<hr />
      <div className="rl b"><span>Total Bill</span><span>{Math.round(sub)}</span></div>
      {disc2 > 0 && <div className="rl sm"><span>Discount</span><span>{disc2}</span></div>}
      <div className="rl big"><span>Net Amount</span><span>Rs {Math.round(total)}</span></div>
      <div className="rl sm"><span>{type === 'CASH' ? 'Cash Received' : 'Paid'}</span><span>{Math.round(rec)}</span></div>
      <div className="rl sm"><span>{type === 'CASH' ? 'Change to return' : 'Balance'}</span><span>{Math.round(Math.abs(type === 'CASH' ? rec - total : total - rec))}</span></div><hr />
      <div className="rc sm">{shop.footer}</div>
    </div>
  </div>;
}

const blank = { name: '', barcode: '', category: '', company: '', unit: 'pc', costPrice: 0, salePrice: 0, stock: 0, active: true };
function Products() {
  const [list, setList] = useState([]), [f, setF] = useState(blank), [q, setQ] = useState('');
  const load = () => api('products').then(setList);
  useEffect(() => { load(); }, []);
  const save = async () => {
    if (!f.name) return;
    f.id ? await api('products/' + f.id, 'PUT', f) : await api('products', 'POST', f);
    setF(blank); load();
  };
  const n = (k) => (e) => setF({ ...f, [k]: ['costPrice', 'salePrice', 'stock'].includes(k) ? +e.target.value : e.target.value });
  const fld = (k, l) => <div><label>{l}</label><input value={f[k]} onChange={n(k)} /></div>;
  return <>
    <div className="row">{fld('name', 'Product name')}{fld('barcode', 'Barcode')}{fld('category', 'Category')}{fld('company', 'Company')}{fld('unit', 'Unit')}
      {fld('costPrice', 'Cost price')}{fld('salePrice', 'Sale price')}{fld('stock', 'Stock')}</div>
    <button className="pri" onClick={save}>{f.id ? 'Update product' : 'Add product'}</button>{' '}
    {f.id && <button onClick={() => setF(blank)}>Cancel</button>}
    <p><input placeholder={`Find among ${list.length} products`} value={q} onChange={(e) => setQ(e.target.value)} /></p>
    <table><thead><tr><th>Name</th><th>Company</th><th>Category</th><th>Stock</th><th className="num">Sale</th><th className="num">Cost</th><th></th></tr></thead>
      <tbody>{list.filter((p) => p.name.toLowerCase().includes(q.toLowerCase())).map((p) => <tr key={p.id}>
        <td>{p.name}</td><td>{p.company}</td><td>{p.category}</td><td>{p.stock} {p.unit}</td><td className="num">{rs(p.salePrice)}</td><td className="num">{rs(p.costPrice)}</td>
        <td><button onClick={() => setF(p)}>Edit</button> <button onClick={async () => { await api('products/' + p.id, 'DELETE'); load(); }}>Delete</button></td></tr>)}</tbody></table>
  </>;
}

function Audit() {
  const [rows, setRows] = useState([]), [q, setQ] = useState(''), [days, setDays] = useState(7);
  useEffect(() => { api('audit').then(setRows); }, []);
  const R = { Today: 0, '7 days': 6, '30 days': 29, All: null };
  const t0 = new Date().setHours(0, 0, 0, 0);
  const shown = rows.filter((r) => (days === null || new Date(r.createdAt) >= t0 - days * 864e5) && (r.summary + r.who).toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const csv = () => {
    const t = ['When,Who,Action,Record,Summary', ...shown.map((r) => [r.createdAt, r.who, r.action, r.record, r.summary].map((v) => `"${v}"`).join(','))].join('\n');
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([t])); a.download = 'audit-log.csv'; a.click();
  };
  return <>
    <p>Every sale, edit, price change, void, approval and backup, traceable to a person and a time</p>
    <div className="filters">
      {Object.entries(R).map(([k, v]) => <button key={k} className={v === days ? 'chip on' : 'chip'} onClick={() => setDays(v)}>{k}</button>)}
      <input placeholder="Search summaries" value={q} onChange={(e) => setQ(e.target.value)} style={{ maxWidth: 260 }} />
      <span className="grow" /><button className="chip" onClick={csv}>⬇ CSV</button></div>
    <table><thead><tr><th>WHEN</th><th>WHO</th><th>ACTION</th><th>RECORD</th><th>SUMMARY</th></tr></thead>
      <tbody>{shown.length === 0 && <tr><td colSpan="5">Nothing logged in this range.</td></tr>}
        {shown.map((r) => <tr key={r.id}><td>{new Date(r.createdAt).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}</td><td>{r.who}</td>
          <td><span className={'tag ' + r.action}>{r.action}</span></td><td>{r.record}</td><td>{r.summary}</td></tr>)}</tbody></table>
  </>;
}

function Settings() {
  const [s, setS] = useState(null), [users, setUsers] = useState([]), [ok, setOk] = useState(false);
  useEffect(() => { api('settings').then((a) => setS(a[0] || { id: 'shop' })); api('users').then(setUsers); }, []);
  if (!s) return null;
  const fld = (k, l) => <div><label>{l}</label><input value={s[k] || ''} onChange={(e) => setS({ ...s, [k]: e.target.value })} /></div>;
  return <>
    <h3>Shop profile</h3>
    <div className="row">{fld('name', 'Shop name')}{fld('address', 'Address')}{fld('phone', 'Phone')}{fld('footer', 'Receipt footer text')}</div>
    <button className="pri" onClick={async () => { await api('settings/shop', 'PUT', s); setOk(true); }}>Save</button> {ok && <span className="ok">Saved</span>}
    <h3>Staff & roles</h3>
    <table><thead><tr><th>Name</th><th>Username</th><th>Role</th><th>Status</th></tr></thead>
      <tbody>{users.map((u) => <tr key={u.id}><td>{u.name}</td><td>@{u.username}</td><td>{u.role}</td><td className="ok">{u.active ? 'Active' : 'Off'}</td></tr>)}</tbody></table>
  </>;
}
