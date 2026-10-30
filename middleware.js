import { NextResponse } from 'next/server';
const hex = (b) => [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, '0')).join('');
async function valid(t) {
  try {
    const [p, s] = (t || '').split('.'); if (!p || !s) return false;
    const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(process.env.AUTH_SECRET || 'change-this-secret'), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    if (hex(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(p))) !== s) return false;
    return JSON.parse(atob(p.replace(/-/g, '+').replace(/_/g, '/'))).exp > Date.now();
  } catch { return false; }
}
export async function middleware(req) {
  const { pathname } = req.nextUrl;
  if (pathname === '/login' || pathname === '/api/auth/login') return NextResponse.next();
  if (await valid(req.cookies.get('session')?.value)) return NextResponse.next();
  if (pathname.startsWith('/api/')) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  return NextResponse.redirect(new URL('/login', req.url));
}
export const config = { matcher: ['/((?!_next/|favicon.ico).*)'] };
