// Vercel Routing Middleware (Edge runtime) — password-gates the protected
// case-study detail pages. Runs before any /cases/* request is served:
//   • Public paths (the Vanta Studio case study + shared assets) pass straight
//     through.
//   • Protected pages require a valid signed cookie; without one the request is
//     rewritten in place to the password prompt (unlock.html), so the real HTML
//     is never served to an unauthenticated visitor.
//
// Vercel only recognises the middleware entrypoint as `middleware.js` (or .ts),
// NOT `.mjs` — a .mjs file is treated as an inert asset and never runs. The
// project is ESM ("type":"module" in package.json), so this file and the api/
// functions all use ESM. The signing half of the cookie contract lives in
// api/unlock.js — keep the two in sync.
//
// Env: CASE_ACCESS_SECRET (same value as api/unlock.js). If it is unset, every
// protected request fails closed to the prompt.

import { rewrite, next } from '@vercel/functions';

export const config = {
  // Run on every /cases/* request; the block decision is made in code below
  // against PROTECTED so the public case study and shared assets fall through.
  matcher: ['/cases/:path*'],
};

const COOKIE_NAME = 'vs_case_access';

// Decoded pathnames that require the password. Add a new protected case here
// (and set `locked: true` on its entry in work.jsx). Everything else under
// /cases/ — Vanta Studio.html, shared.jsx, case-study.css, images — stays public.
const PROTECTED = [
  '/cases/Aucor Property.html',
  '/cases/SCIS at Wits.html',
];

function decodePath(rawPathname) {
  try {
    return decodeURIComponent(rawPathname);
  } catch {
    return rawPathname;
  }
}

function readCookie(request, name) {
  const header = request.headers.get('cookie') || '';
  for (const part of header.split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    if (part.slice(0, idx).trim() === name) return part.slice(idx + 1).trim();
  }
  return null;
}

function b64urlToBytes(s) {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/');
  const pad = b64.length % 4 ? '='.repeat(4 - (b64.length % 4)) : '';
  const bin = atob(b64 + pad);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

// Validates the cookie per the contract: signature must verify AND not be
// expired. Uses Web Crypto's verify(), which is constant-time.
async function isValidToken(token, secret) {
  if (!token || !secret) return false;
  const dot = token.indexOf('.');
  if (dot === -1) return false;
  const expStr = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || Date.now() >= exp) return false;
  try {
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify'],
    );
    return await crypto.subtle.verify('HMAC', key, b64urlToBytes(sig), enc.encode(expStr));
  } catch {
    return false;
  }
}

export default async function middleware(request) {
  const path = decodePath(new URL(request.url).pathname);

  // Public path (incl. the Vanta Studio case study and shared /cases assets).
  if (!PROTECTED.includes(path)) return next();

  const token = readCookie(request, COOKIE_NAME);
  if (await isValidToken(token, process.env.CASE_ACCESS_SECRET)) return next();

  // Unauthenticated → serve the prompt at the same URL. A successful unlock sets
  // the cookie and reloads, after which this passes through to the real page.
  return rewrite(new URL('/unlock.html', request.url));
}
