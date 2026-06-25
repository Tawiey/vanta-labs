// Vercel serverless function — verifies the shared case-study password and, on
// success, sets a signed session cookie that unlocks the protected case-study
// pages. The gate itself (which pages, cookie verification) lives in
// middleware.mjs; this function only mints the cookie.
//
// Required environment variables (set in Vercel → Project → Settings → Env Vars):
//   CASE_STUDY_PASSWORD  The shared password the studio hands out. Use a strong
//                        passphrase — it is the primary brute-force defence.
//   CASE_ACCESS_SECRET   A long random string used only to sign/verify the
//                        cookie. Never shared. Rotate it to invalidate all
//                        existing sessions.
//
// Cookie & token contract (MUST stay in sync with middleware.js):
//   name   vs_case_access
//   value  <expMs>.<base64url(HMAC-SHA256(String(expMs), CASE_ACCESS_SECRET))>
//   valid  signature matches AND Date.now() < expMs
//   attrs  HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=2592000 (30 days)

import crypto from 'node:crypto';

const COOKIE_NAME = 'vs_case_access';
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days
const MAX_PASSWORD_LEN = 200;

// base64url with no padding — matches the encoding middleware.mjs recomputes.
function base64url(buf) {
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function sign(payload, secret) {
  return base64url(crypto.createHmac('sha256', secret).update(payload).digest());
}

// Constant-time compare. Hashing both sides to a fixed length first avoids
// leaking the password length and short-circuit timing differences.
function safeEqual(a, b) {
  const ha = crypto.createHash('sha256').update(String(a)).digest();
  const hb = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(ha, hb);
}

function clean(value, limit) {
  return typeof value === 'string' ? value.slice(0, limit) : '';
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const password = process.env.CASE_STUDY_PASSWORD;
  const secret = process.env.CASE_ACCESS_SECRET;
  if (!password || !secret) {
    console.error('Missing CASE_STUDY_PASSWORD or CASE_ACCESS_SECRET env var');
    return res.status(500).json({ error: 'Access is not configured yet. Please email hello@vantalabs.co.' });
  }

  // Vercel parses JSON bodies automatically, but guard against string bodies too.
  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  body = body || {};

  // Honeypot — bots fill hidden fields; humans leave them empty.
  if (clean(body.company_url, 200)) {
    return res.status(200).json({ ok: true });
  }

  const submitted = clean(body.password, MAX_PASSWORD_LEN);
  if (!submitted) {
    return res.status(400).json({ error: 'Please enter the password.' });
  }

  if (!safeEqual(submitted, password)) {
    // Small fixed delay adds light brute-force friction (durable rate limiting
    // would need stateful storage — see the plan's deferred work).
    await new Promise((r) => setTimeout(r, 600));
    return res.status(401).json({ error: 'That password is incorrect.' });
  }

  const exp = Date.now() + MAX_AGE_SECONDS * 1000;
  const token = `${exp}.${sign(String(exp), secret)}`;

  res.setHeader('Set-Cookie',
    `${COOKIE_NAME}=${token}; Max-Age=${MAX_AGE_SECONDS}; Path=/; HttpOnly; Secure; SameSite=Lax`);
  return res.status(200).json({ ok: true });
};
