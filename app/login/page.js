'use client';
import { useState } from 'react';
export default function Login() {
  const [u, setU] = useState('admin'), [p, setP] = useState(''), [err, setErr] = useState(''), [busy, setBusy] = useState(false);
  const go = async (e) => {
    e.preventDefault(); setBusy(true); setErr('');
    const r = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: u, password: p }) }).then((x) => x.json());
    if (r.error) { setErr(r.error); setBusy(false); } else window.location.href = '/';
  };
  return (
    <div className="login"><form className="lcard" onSubmit={go}>
      <div className="lbrand">Falcon Next</div><div className="lsub">BAKERY POS · Sign in</div>
      <label>Username</label><input value={u} onChange={(e) => setU(e.target.value)} autoComplete="username" />
      <label>Password</label><input type="password" autoFocus value={p} onChange={(e) => setP(e.target.value)} autoComplete="current-password" />
      {err && <p className="lerr">{err}</p>}
      <button className="pri" disabled={busy || !u || !p}>{busy ? 'Signing in…' : 'Sign in'}</button>
      <small>First time? Sign in as <b>admin</b> / <b>1234</b>, then change it in Tools → Change Password.</small>
    </form></div>
  );
}
