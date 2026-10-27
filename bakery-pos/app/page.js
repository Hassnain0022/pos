'use client';
import { useEffect, useRef, useState } from 'react';
const api = (u, method = 'GET', body) =>
  fetch('/api/' + u, { method, headers: { 'Content-Type': 'application/json' }, body: body && JSON.stringify(body) }).then((r) => r.json());
const TABS = ['Sales Invoice', 'Products', 'Audit Log', 'Settings'];
const rs = (n) => 'Rs ' + Number(n || 0).toLocaleString();

const RIBBON = {
  SALES: [['Transactions', [['Sales Invoice', '🧾'], ['Sales History', '🕘'], ['Sales Return', '↩️'], ['Return History', '🗂️'], ['Advance Sales', '💰'], ['Pending Entries', '⏳']]],
    ['Reports', [['Sales Report', '📊'], ['Sales Summary', '📈'], ['Stock Analysis', '🔍'], ['Reports Center', '🗄️'], ['Dashboard', '🖥️'], ['Stock Report', '📚']]],
    ['Tools', [['Theme Setup', '🎨'], ['Calculator', '🧮'], ['Change Password', '🔑']]]],
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
const COLOR = { SALES: '#2e7d32', PURCHASE: '#2347b0', CASH: '#b4300f', ACCOUNTS: '#1f2937', PRODUCTS: '#2347b0', TOOLS: '#c2410c', HELP: '#1f2937' };
const QUICK = ['Sales Invoice', 'Sales History', 'Sales Return', 'Return History', 'Purchase Invoice', 'Purchase History', 'Define Products', 'Cash Payment', 'Cash Receipt', 'Cash Book', 'Backup Data'];

export default function Home() {
  const [tab, setTab] = useState('SALES'), [screen, setScreen] = useState('Sales Invoice'), [now, setNow] = useState(null), [editBill, setEditBill] = useState(null), [resumeBill, setResumeBill] = useState(null);
  const go = (sc) => { setEditBill(null); setResumeBill(null); setScreen(sc); };
  useEffect(() => setNow(new Date()), []);
  const SCREEN = { 'Sales Invoice': Sales, 'Sales History': SalesHistory, 'Pending Entries': Pending, 'Define Products': Products, 'Audit Log': Audit, Settings, 'Users Manager': Settings };
  const View = SCREEN[screen];
  const d = now ? now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-') : '';
  const wd = now ? now.toLocaleDateString('en-US', { weekday: 'long' }) : '';
  return (
    <div className="app" style={{ '--ac': COLOR[tab] }}>
      <div className="titleline">BAKERY POS – | {d} | {screen} | Admin</div>
      <nav className="tabs">{Object.keys(RIBBON).map((t) => <button key={t} className={t === tab ? 'on' : ''} onClick={() => setTab(t)}>{t}</button>)}
        <span className="grow" /><input className="gs" placeholder="Search screens, products, customers…" /><button>Sign out</button></nav>
      <div className="ribbon">{RIBBON[tab].map(([g, items]) => <div className="grp" key={g}>
        <div className="items">{items.map(([n, i]) => <button key={n} className={'rb' + (n === screen ? ' on' : '')} onClick={() => go(n)}><span className="ic">{i}</span>{n}</button>)}</div><small>{g}</small></div>)}</div>
      <div className="datebar" style={{ background: COLOR[tab] }}>{d}, {wd}</div>
      <div className="body">
        <aside><div className="ql">QUICK LAUNCH</div>{QUICK.map((q) => <button key={q} className={q === screen ? 'on' : ''} onClick={() => go(q)}>{q}</button>)}
          <div className="grow" /><button onClick={() => go('Settings')}>Settings</button></aside>
        <section>{screen !== 'Sales Invoice' && <h2 className="ptitle">{screen}</h2>}
          {View ? <View edit={editBill} resume={resumeBill} onPending={() => go('Pending Entries')} onResume={(b) => { setEditBill(null); setResumeBill(b); setScreen('Sales Invoice'); }} onEdit={(b) => { setEditBill(b); setScreen('Sales Invoice'); }} onFinish={() => { setEditBill(null); setScreen('Sales History'); }} /> : <p className="soon">{screen} isn’t built yet.</p>}</section>
      </div>
      <footer>CURRENT USER : ADMIN <i>(Owner / Admin)</i></footer>
    </div>
  );
}

function Sales({ edit, resume, onFinish }) {
  const [prods, setProds] = useState([]), [shop, setShop] = useState({}), [no, setNo] = useState(''), [sales, setSales] = useState([]);
  const e0 = edit || resume, a0 = e0 ? e0.discount1 ?? e0.discount : 0;
  const [cart, setCart] = useState(e0 ? e0.items.map((x) => ({ ...x })) : []), [type, setType] = useState(e0 ? e0.type : 'CASH'), [cust, setCust] = useState(e0 && !/walk-in/i.test(e0.customer) ? e0.customer : ''), [remarks, setRemarks] = useState(e0?.remarks || '');
  const [date, setDate] = useState(e0?.date || new Date().toISOString().slice(0, 10)), [d1, setD1] = useState(a0 ? String(a0) : ''), [paid, setPaid] = useState(e0 ? String(e0.paid) : ''), [msg, setMsg] = useState('');
  const [d2, setD2] = useState(e0?.discount2 ? String(+((e0.discount2 / Math.max(1, e0.subtotal - a0)) * 100).toFixed(4)) : ''), [ask, setAsk] = useState(null), [askErr, setAskErr] = useState('');
  const [code, setCode] = useState(''), [name, setName] = useState(''), [sel, setSel] = useState(null), [qty, setQty] = useState(1), [price, setPrice] = useState(0), [disc, setDisc] = useState(0);
  const [cat, setCat] = useState(false), [cq, setCq] = useState(''), [pr, setPr] = useState(null), [z, setZ] = useState(90);
  const latest = useRef(null), codeRef = useRef(), qtyRef = useRef(), custRef = useRef(), cashRef = useRef();
  const load = () => {
    api('products').then(setProds); api('settings').then((a) => setShop(a[0] || {}));
    api('sales').then((a) => { setSales(a); setNo('T11-' + String(a.length + 1).padStart(5, '0')); });
  };
  useEffect(() => { load(); codeRef.current?.focus(); if (resume) api('pending/' + resume.id, 'DELETE'); }, []);

  const net = (x) => x.qty * x.rate * (1 - (x.disc || 0) / 100);
  const sub = cart.reduce((s, x) => s + net(x), 0), units = cart.reduce((s, x) => s + x.qty, 0);
  const a1 = Math.min(+d1 || 0, sub), a2 = ((sub - a1) * (+d2 || 0)) / 100, total = Math.max(0, sub - a1 - a2);
  const walk = !cust || /walk-in/i.test(cust);
  const prev = walk ? 0 : sales.filter((s) => s.customer === cust && s.id !== edit?.id).reduce((t, s) => t + (s.balance || 0), 0);
  const rec = paid === '' ? (type === 'CASH' ? total : 0) : +paid, change = type === 'CASH' ? Math.max(0, rec - total) : 0;
  const cost = cart.reduce((s, x) => s + (prods.find((p) => p.id === x.productId)?.costPrice || 0) * x.qty, 0);
  const last = [...sales].sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
  const hits = name && !sel ? prods.filter((p) => p.active !== false && p.name.toLowerCase().includes(name.toLowerCase())).slice(0, 6) : [];

  const pick = (p) => { setSel(p); setName(p.name); setPrice(p.salePrice); setQty(1); setDisc(0); setTimeout(() => qtyRef.current?.select(), 0); };
  const addLine = (p, q = qty, r = price, d = disc) => {
    setCart((c) => [...c, { productId: p.id, code: p.barcode || '', name: p.name, qty: +q, rate: +r, disc: +d, taken: true }]);
    setSel(null); setName(''); setCode(''); setQty(1); setPrice(0); setDisc(0); codeRef.current?.focus();
  };
  const scan = () => { const p = prods.find((x) => x.barcode === code || x.id === code); p ? addLine(p, 1, p.salePrice, 0) : setMsg('No product with that barcode or ID.'); };
  const clear = () => { setCart([]); setCust(''); setRemarks(''); setD1(''); setD2(''); setPaid(''); setSel(null); setName(''); setCode(''); };
  const payload = () => ({ name: `Pending · ${cust || 'Walk-in'}`, items: cart, type, customer: cust, remarks, date, subtotal: sub, discount1: a1, discount2: a2, total, paid });
  const hold = async (auto) => {
    if (!cart.length || edit) return;
    await api('pending', 'POST', { ...payload(), auto: !!auto });
    clear(); setMsg(auto ? 'Auto-saved to Pending Entries (3 minutes without saving).' : 'Bill held. Find it in Pending Entries.');
  };
  latest.current = !edit && cart.length ? { ...payload(), auto: true } : null;
  useEffect(() => () => { // leaving this screen with an unsaved bill also keeps it
    const p = latest.current;
    if (p) fetch('/api/pending', { method: 'POST', keepalive: true, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(p) });
  }, []);
  useEffect(() => { // 3 minutes without any change or save -> pending
    if (!cart.length || edit) return;
    const t = setTimeout(() => hold(true), 180000);
    return () => clearTimeout(t);
  }, [cart, type, cust, remarks, d1, d2, paid, date]);
  const doPrint = (s) => { setPr(s); setTimeout(() => window.print(), 150); };
  const save = async (print) => {
    if (!cart.length) return setMsg('Add at least one item first.');
    if (edit) return setAsk({ title: `Save changes to ${edit.billNo}`, run: (pw) => api('sales/' + edit.id, 'PUT', { action: 'edit', password: pw, items: cart, customer: cust, remarks, type, date, discount1: a1, discount2: a2, paid: rec }) });
    const s = await api('sales', 'POST', { items: cart, type, customer: cust, remarks, date, discount: a1 + a2, discount1: a1, discount2: a2, paid: rec });
    setMsg(`Saved ${s.billNo}`); if (print) doPrint(s);
    clear(); load();
  };
  useEffect(() => {
    const k = (e) => {
      if (e.ctrlKey && ['-', '=', '+'].includes(e.key)) { e.preventDefault(); setZ((v) => Math.min(125, Math.max(70, v + (e.key === '-' ? -10 : 10)))); return; }
      if (e.key === 'Escape') setCat(false);
      const m = { F2: () => codeRef.current?.focus(), F3: () => setCat(true), F4: clear, F5: () => setType((t) => (t === 'CASH' ? 'CREDIT' : 'CASH')),
        F6: () => custRef.current?.focus(), F8: () => hold(false), F7: () => cashRef.current?.focus(), F9: () => save(false), F10: () => save(true) }[e.key];
      if (m) { e.preventDefault(); m(); }
    };
    window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k);
  });
  const col = (l, el, w) => <div style={{ width: w, flex: w ? 'none' : 1, position: 'relative' }}><label>{l}</label>{el}</div>;

  return <>
    <h2 className="ptitle">{edit ? `Sales Invoice · Changing ${edit.billNo}` : `Sales Invoice No. ${no}`}</h2>
    <div className="inv" style={{ zoom: z / 100 }}>
      <p className="hint"><kbd>F2</kbd> barcode · <kbd>F3</kbd> catalogue · <kbd>F5</kbd> cash/credit · <kbd>F6</kbd> customer · <kbd>F7</kbd> cash received · <kbd>F9</kbd> save · <kbd>F10</kbd> save & print · <kbd>Ctrl -/+</kbd> size ({z}%)</p>
      <div className="hdr">
        <div className="fl"><label>Sale (F5)</label><button className={'typebtn ' + type} onClick={() => setType(type === 'CASH' ? 'CREDIT' : 'CASH')}>{type}<small>click or F5 to switch</small></button></div>
        <div className="fl"><label>Date</label><input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
        <div className="fl"><label>Customer (F6)</label><input ref={custRef} title="Name printed on the receipt (not saved to the customer list)" placeholder="Walk-in Customer" value={cust} onChange={(e) => setCust(e.target.value)} /></div>
        <div className="fl"><label>Remarks</label><input value={remarks} onChange={(e) => setRemarks(e.target.value)} /></div>
      </div>
      <div className="entry">
        {col('ID / BARCODE (F2)', <input ref={codeRef} placeholder="Scan or ID" value={code} onChange={(e) => setCode(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && scan()} />, 150)}
        {col('PRODUCT NAME', <>
          <input placeholder="Type the product name" value={name} onChange={(e) => { setName(e.target.value); setSel(null); }} onKeyDown={(e) => e.key === 'Enter' && hits[0] && pick(hits[0])} />
          {hits.length > 0 && <div className="drop">{hits.map((p) => <div key={p.id} className="hit" onClick={() => pick(p)}>{p.name} — {rs(p.salePrice)} <small>stock {p.stock} {p.unit}</small></div>)}</div>}</>)}
        <button className="cat" onClick={() => setCat(true)}>📦 Catalogue (F3)</button>
        {col('QTY', <input ref={qtyRef} type="number" min="0" value={qty} onChange={(e) => setQty(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sel && addLine(sel)} />, 70)}
        {col('PRICE', <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sel && addLine(sel)} />, 100)}
        {col('DISC. %', <input type="number" value={disc} onChange={(e) => setDisc(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sel && addLine(sel)} />, 70)}
        {col('NET VALUE', <input readOnly value={rs(qty * price * (1 - disc / 100))} />, 110)}
        <button className="pri" disabled={!sel} onClick={() => addLine(sel)}>Add</button>
      </div>
      <table style={{ width: '100%' }}><thead><tr><th>#</th><th>DESCRIPTION</th><th title="Taken now">✓</th><th className="num">QTY</th><th className="num">PRICE</th><th className="num">DISC%</th><th className="num">AMOUNT</th><th></th></tr></thead>
        <tbody>{cart.length === 0 && <tr><td colSpan="8" className="empty">🧺<br />No items yet. Scan a barcode, type a code or name, or press F3 for the Product Catalogue.</td></tr>}
          {cart.map((x, i) => <tr key={i}><td>{i + 1}</td><td>{x.name} <small>· {prods.find((p) => p.id === x.productId)?.stock ?? '—'} in stock</small></td>
            <td><input type="checkbox" checked={x.taken !== false} title="Taken now" onChange={() => setCart(cart.map((y, j) => j === i ? { ...y, taken: y.taken === false } : y))} /></td>
            {['qty', 'rate', 'disc'].map((k) => <td key={k} className="num"><input type="number" min="0" value={x[k]} style={{ width: 80, textAlign: 'right' }} onChange={(e) => setCart(cart.map((y, j) => (j === i ? { ...y, [k]: +e.target.value } : y)))} /></td>)}<td className="num">{rs(net(x))}</td>
            <td><button onClick={() => setCart(cart.filter((_, j) => j !== i))}>✕</button></td></tr>)}</tbody></table>
      <div className="status"><span>{cart.length} lines · {units} units</span>
        {last && <span>✔ Last: <b>{last.billNo}</b> · {rs(last.total)} · change {rs(last.change)} <button className="lnk" onClick={() => doPrint(last)}>🖨 Reprint</button></span>}</div>
      <div className="bottom">
        <div className="bl">
          <div><span>Prev. Balance</span><i>{rs(prev)}</i></div><div><span>This Bill</span><i>{rs(total)}</i></div>
          <div><span>Payable</span><i>{rs(prev + total)}</i></div>
          <div><span>Change</span><i className="g">{rs(change)}</i></div><div><span>Profit</span><i className="g">{rs(total - cost)}</i></div>
        </div>
        <div className="br">
          <div><span>TOTAL BILL</span><i>{rs(sub)}</i></div>
          <div><span className="red">DISC-1 Rs</span><input type="number" value={d1} placeholder="0.00" onChange={(e) => setD1(e.target.value)} />
            <span className="red">DISC-2 %</span><input type="number" value={d2} placeholder="0" onChange={(e) => setD2(e.target.value)} /><i>{rs(a2)}</i></div>
          <div><span>NET AMOUNT</span><i className="net">{rs(total)}</i></div>
          <div><span className="red">CASH RECEIVED (F7)</span><input ref={cashRef} type="number" value={paid} placeholder="Blank = exact" onChange={(e) => setPaid(e.target.value)} /></div>
        </div>
      </div>
      <div className="btns"><button onClick={clear}>Clear (F4)</button><button disabled={!cart.length || !!edit} onClick={() => hold(false)}>Hold (F8)</button><button onClick={() => save(true)}>🖨 Save & Print (F10)</button><button className="pri" onClick={() => save(false)}>{edit ? 'Update (F9)' : 'Save (F9)'}</button>{edit && <button onClick={onFinish}>Close</button>}</div>
      {msg && <p className="ok">{msg}</p>}
    </div>
    {ask && <Ask title={ask.title} err={askErr} onCancel={() => { setAsk(null); setAskErr(''); }} onOk={async (pw) => { const r = await ask.run(pw); if (r.error) setAskErr(r.error); else { setAsk(null); onFinish(); } }} />}
    {cat && <div className="modal" onClick={() => setCat(false)}><div className="mbox" onClick={(e) => e.stopPropagation()}>
      <b>Product Catalogue</b><input autoFocus placeholder="Search products" value={cq} onChange={(e) => setCq(e.target.value)} />
      <div className="mlist">{prods.filter((p) => p.active !== false && p.name.toLowerCase().includes(cq.toLowerCase())).map((p) => <div key={p.id} className="hit" onClick={() => { pick(p); setCat(false); setCq(''); }}>{p.name} — {rs(p.salePrice)} <small>stock {p.stock} {p.unit}</small></div>)}</div></div></div>}
    {pr && <Receipt pr={pr} shop={shop} />}
  </>;
}

function Receipt({ pr, shop }) {
  const net = (x) => x.qty * x.rate * (1 - (x.disc || 0) / 100);
  return <div className="receipt">
    <div className="rc big">{shop.name}</div><div className="rc sm">{shop.address}<br />{shop.phone}</div><hr />
    <div className="rc sm">Invoice · {pr.type === 'CASH' ? 'Cash' : 'Credit'}</div>
    <div className="rl sm"><span>#{pr.billNo}</span><span>{pr.date}</span></div>
    <div className="rl sm"><span>Cashier</span><span>{pr.cashier}</span></div>
    <div className="rl sm"><span>Customer</span><span>{pr.customer}</span></div><hr />
    <div className="rl sm b"><span>DESCRIPTION</span><span>QTY · RATE · AMOUNT</span></div>
    {pr.items.map((x, i) => <div className="rl sm" key={i}><span>{x.name}</span><span>{x.qty} · {x.rate} · {Math.round(net(x))}</span></div>)}<hr />
    <div className="rl b"><span>Total Bill</span><span>{Math.round(pr.subtotal)}</span></div>
    {pr.discount > 0 && <div className="rl sm"><span>Discount</span><span>{Math.round(pr.discount)}</span></div>}
    <div className="rl big"><span>Net Amount</span><span>Rs {Math.round(pr.total)}</span></div>
    <div className="rl sm"><span>Cash Received</span><span>{Math.round(pr.paid)}</span></div>
    <div className="rl sm"><span>Change to return</span><span>{Math.round(pr.change)}</span></div><hr />
    <div className="rc sm">{shop.footer}</div>
  </div>;
}

function Ask({ title, needReason, err, onCancel, onOk }) {
  const [pw, setPw] = useState(''), [why, setWhy] = useState('');
  const ready = pw && (!needReason || why.trim());
  return <div className="modal" style={{ zIndex: 30 }} onClick={onCancel}><div className="mbox" onClick={(e) => e.stopPropagation()}>
    <b>{title}</b>
    {needReason && <><label>Reason</label><input autoFocus value={why} onChange={(e) => setWhy(e.target.value)} placeholder="Why is this bill being voided?" /></>}
    <label>Admin password</label>
    <input type="password" autoFocus={!needReason} value={pw} onChange={(e) => setPw(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && ready && onOk(pw, why.trim())} />
    {err && <p style={{ color: '#b91c1c', margin: 0 }}>{err}</p>}
    <div className="btns"><button onClick={onCancel}>Cancel</button><button className="pri" disabled={!ready} onClick={() => onOk(pw, why.trim())}>Confirm</button></div>
  </div></div>;
}

const rs2 = (n) => 'Rs ' + Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const ld = (d) => d.toLocaleDateString('en-CA');
const PER = 200;
const SORTS = { 'Newest first': (a, b) => b.createdAt.localeCompare(a.createdAt), 'Discount: low to high': (a, b) => a.disc - b.disc, 'Net amount: low to high': (a, b) => a.total - b.total, 'Customer: A to Z': (a, b) => a.customer.localeCompare(b.customer) };
function SalesHistory({ onEdit, onPending }) {
  const [sort, setSort] = useState('Newest first'), [det, setDet] = useState(null), [ask, setAsk] = useState(null), [askErr, setAskErr] = useState(''), [pr, setPr] = useState(null), [shop, setShop] = useState({});
  const [all, setAll] = useState([]), [mode, setMode] = useState('All'), [q, setQ] = useState(''), [bf, setBf] = useState(0), [bt, setBt] = useState(0), [rem, setRem] = useState(false), [page, setPage] = useState(0);
  const range = (n) => { const t = new Date(), f = new Date(); f.setDate(t.getDate() - n); return [ld(f), ld(t)]; };
  const [[from, to], setR] = useState(range(0)), [chip, setChip] = useState('Today');
  const load = () => { api('sales').then(setAll); api('settings').then((a) => setShop(a[0] || {})); };
  useEffect(() => { load(); }, []);
  const pick = (k) => {
    const t = new Date(), y = new Date(); y.setDate(t.getDate() - 1);
    setChip(k); setPage(0);
    setR({ Today: [ld(t), ld(t)], Yesterday: [ld(y), ld(y)], '7 days': range(6), '30 days': range(29), 'This month': [ld(new Date(t.getFullYear(), t.getMonth(), 1)), ld(t)] }[k]);
  };
  const rows = all.map((s) => {
    const gross = s.items.reduce((t, x) => t + x.qty * x.rate, 0);
    return { ...s, gross, disc: gross - s.total, pct: gross ? ((gross - s.total) / gross) * 100 : 0, no: parseInt(s.billNo.slice(4), 10), day: ld(new Date(s.createdAt)) };
  }).filter((s) => s.day >= from && s.day <= to
    && (mode === 'All' || (mode === 'Voided' ? s.voided : !s.voided && s.type === mode.toUpperCase()))
    && (!bf || s.no >= bf) && (!bt || s.no <= bt)
    && (!rem || s.items.some((x) => x.taken === false))
    && (s.billNo + s.customer + (s.remarks || '')).toLowerCase().includes(q.toLowerCase()))
    .sort(SORTS[sort]);
  const pages = Math.max(1, Math.ceil(rows.length / PER)), pg = Math.min(page, pages - 1), shown = rows.slice(pg * PER, pg * PER + PER);
  const G = rows.filter((s) => !s.voided).reduce((t, s) => ({ g: t.g + s.gross, d: t.d + s.disc, n: t.n + s.total }), { g: 0, d: 0, n: 0 });
  const fmt = (c) => { const d = new Date(c), p = (n) => String(n).padStart(2, '0'); return `${ld(d)} ${p(d.getHours())}:${p(d.getMinutes())}`; };
  const csv = () => {
    const t = ['Bill,Date,Mode,Customer,Gross,Disc,Net,Remarks,User', ...rows.map((s) => [s.billNo, fmt(s.createdAt), s.type, s.customer, s.gross, s.disc, s.total, s.remarks || '', s.cashier].map((v) => `"${v}"`).join(','))].join('\n');
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([t])); a.download = 'sales-history.csv'; a.click();
  };
  const nb = (v, set) => <input type="number" min="0" value={v} onChange={(e) => { set(+e.target.value); setPage(0); }} style={{ width: 80 }} />;
  return <>
    <div className="filters"><span>All tills and cashiers</span><span className="grow" /><button className="chip" onClick={onPending}>Pending Entries</button><button className="chip" onClick={csv}>⬇ CSV</button></div>
    <div className="filters">
      <input type="date" value={from} onChange={(e) => { setR([e.target.value, to]); setChip(''); setPage(0); }} style={{ width: 150 }} />→
      <input type="date" value={to} onChange={(e) => { setR([from, e.target.value]); setChip(''); setPage(0); }} style={{ width: 150 }} />
      {['Today', 'Yesterday', '7 days', '30 days', 'This month'].map((k) => <button key={k} className={chip === k ? 'chip on' : 'chip'} onClick={() => pick(k)}>{k}</button>)}
      <input placeholder="🔍 Bill #, customer or remarks" value={q} onChange={(e) => { setQ(e.target.value); setPage(0); }} style={{ maxWidth: 260 }} />
      <select value={sort} onChange={(e) => { setSort(e.target.value); setPage(0); }} style={{ width: 'auto' }}>{Object.keys(SORTS).map((k) => <option key={k}>{k}</option>)}</select>
      <b>Bill From</b>{nb(bf, setBf)}<b>To</b>{nb(bt, setBt)}
      {['All', 'Cash', 'Credit', 'Voided'].map((k) => <button key={k} className={mode === k ? 'chip on' : 'chip'} onClick={() => { setMode(k); setPage(0); }}>{k}</button>)}
    </div>
    <label className="red"><input type="checkbox" checked={rem} onChange={(e) => setRem(e.target.checked)} style={{ width: 'auto' }} /> Remaining items only</label>
    <table style={{ width: '100%', marginTop: 8 }}><thead><tr><th>BILL #</th><th>DATE</th><th>MODE</th><th>DESCRIPTION</th><th className="num">GROSS TOTAL</th><th className="num">DISC</th><th className="num">DISC %</th><th className="num">NET BILL</th><th>REMARKS</th><th>USER</th></tr></thead>
      <tbody>{shown.length === 0 && <tr><td colSpan="10" className="empty">No sales in this range.</td></tr>}
        {shown.map((s) => <tr key={s.id} className={(s.voided ? 'void ' : '') + (s.disc > 0.005 ? 'dsc' : '')} onClick={() => setDet(s)} style={{ cursor: 'pointer' }}><td className="mono">{s.billNo}</td><td>{fmt(s.createdAt)}</td>
          <td><span className={'tag ' + (s.type === 'CASH' ? 'Create' : 'Credit')}>{s.type === 'CASH' ? 'Cash' : 'Credit'}</span></td>
          <td>{s.items[0]?.name}{s.items.length > 1 && ` +${s.items.length - 1} more`}<br /><small>{s.customer}</small></td>
          <td className="num">{rs2(s.gross)}</td><td className="num">{rs2(s.disc)}</td><td className="num">{s.pct.toFixed(2)}</td><td className="num"><b>{rs2(s.total)}</b></td><td>{s.remarks}</td><td>{s.cashier}</td></tr>)}</tbody></table>
    <div className="grand"><span>Total Invoices: {rows.length} (totals include every page)</span><span className="grow" /><b>GRAND TOTAL</b><span>{rs2(G.g)}</span><span>{rs2(G.d)}</span><span>{G.g ? ((G.d / G.g) * 100).toFixed(2) : '0.00'}</span><span>{rs2(G.n)}</span></div>
    <div className="filters" style={{ marginTop: 8 }}><small>Showing {rows.length ? pg * PER + 1 : 0}–{pg * PER + shown.length} of {rows.length}</small><span className="grow" />
      <button className="chip" disabled={pg === 0} onClick={() => setPage(0)}>First</button><button className="chip" disabled={pg === 0} onClick={() => setPage(pg - 1)}>Previous</button>
      <b>Page {pg + 1} of {pages}</b><button className="chip" disabled={pg >= pages - 1} onClick={() => setPage(pg + 1)}>Next</button><button className="chip" disabled={pg >= pages - 1} onClick={() => setPage(pages - 1)}>Last</button></div>
    <div className="btns"><button onClick={load}>Refresh</button></div>
    {det && <div className="modal" onClick={() => setDet(null)}><div className="mbox wide" onClick={(e) => e.stopPropagation()}>
      <div className="mono" style={{ fontSize: 18 }}><b>{det.billNo}</b> {det.voided && <span className="tag Delete">VOIDED</span>} {det.edited && <span className="tag Update">EDITED</span>}</div>
      <p style={{ margin: 0 }}>{new Date(det.createdAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }).replace(',', '')} · {det.type === 'CASH' ? 'Cash' : 'Credit'} · {det.customer} · by {det.cashier}</p>
      {det.voided && <p style={{ margin: 0, color: '#b91c1c' }}>Void reason: {det.voidReason}</p>}
      <table style={{ width: '100%' }}><thead><tr><th>#</th><th>DESCRIPTION</th><th className="num">QTY</th><th className="num">PRICE</th><th className="num">DISC %</th><th className="num">AMOUNT</th></tr></thead>
        <tbody>{det.items.map((x, i) => <tr key={i}><td>{i + 1}</td><td>{x.name}{x.taken === false && <><br /><small>Remaining, not taken yet</small></>}</td><td className="num">{x.qty}</td><td className="num">{rs2(x.rate)}</td><td className="num">{x.disc ? x.disc : ''}</td><td className="num">{rs2(x.qty * x.rate * (1 - (x.disc || 0) / 100))}</td></tr>)}</tbody></table>
      <div className="dtot">
        <div><span>Total Bill</span><i>{rs2(det.subtotal)}</i></div>
        <div><span>Discount-1</span><i>{rs2(det.discount1 ?? det.discount)}</i></div>
        <div><span>Discount-2</span><i>{rs2(det.discount2 ?? 0)}</i></div>
        <div className="b"><span>Net Amount</span><i>{rs2(det.total)}</i></div>
        <div><span>{det.type === 'CASH' ? 'Cash Received' : 'Paid'}</span><i>{rs2(det.paid)}</i></div>
        <div><span>{det.type === 'CASH' ? 'Change' : 'Balance'}</span><i>{rs2(det.type === 'CASH' ? det.change : det.balance)}</i></div>
      </div>
      <div className="btns" style={{ justifyContent: 'space-between' }}>
        <button disabled={det.voided} onClick={() => setAsk({ title: `Void ${det.billNo}`, needReason: true, run: (pw, why) => api('sales/' + det.id, 'PUT', { action: 'void', password: pw, reason: why }) })}>🚫 Void invoice</button>
        <span><button disabled={det.voided} onClick={() => { const b = det; setDet(null); onEdit(b); }}>✎ Edit</button> <button onClick={() => { setPr(det); setTimeout(() => window.print(), 150); }}>🖨 Reprint receipt</button> <button className="pri" onClick={() => setDet(null)}>Done</button></span>
      </div>
    </div></div>}
    {ask && <Ask title={ask.title} needReason={ask.needReason} err={askErr} onCancel={() => { setAsk(null); setAskErr(''); }}
      onOk={async (pw, why) => { const r = await ask.run(pw, why); if (r.error) setAskErr(r.error); else { setAsk(null); setAskErr(''); setDet(null); load(); } }} />}
    {pr && <Receipt pr={pr} shop={shop} />}
  </>;
}

function Pending({ onResume }) {
  const [rows, setRows] = useState([]);
  const load = () => api('pending').then(setRows);
  useEffect(() => { load(); }, []);
  const list = [...rows].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return <>
    <p>Bills put on hold, or auto-saved after 3 minutes without saving.</p>
    <table style={{ width: '100%' }}><thead><tr><th>HELD AT</th><th>CUSTOMER</th><th>ITEMS</th><th className="num">TOTAL</th><th>HOW</th><th></th></tr></thead>
      <tbody>{list.length === 0 && <tr><td colSpan="6" className="empty">No pending entries.</td></tr>}
        {list.map((p) => <tr key={p.id}><td>{new Date(p.createdAt).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}</td><td>{p.customer || 'Walk-in customer'}</td>
          <td>{p.items.slice(0, 2).map((x) => x.name).join(', ')}{p.items.length > 2 && ` +${p.items.length - 2} more`}</td><td className="num">{rs2(p.total)}</td>
          <td><span className={'tag ' + (p.auto ? 'Credit' : 'Update')}>{p.auto ? 'Auto-saved' : 'Held'}</span></td>
          <td><button className="pri" onClick={() => onResume(p)}>Resume</button> <button onClick={async () => { if (confirm('Delete this pending bill?')) { await api('pending/' + p.id, 'DELETE'); load(); } }}>Delete</button></td></tr>)}</tbody></table>
  </>;
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
