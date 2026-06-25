# CLAUDE.md — Vanta Studio site

Context for AI agents working on this repository. Read this first.

---

## 1. What this site is

**Vanta Studio** is a small product/design/engineering studio. This repo is its
**marketing site** — a single-page landing experience plus a handful of
case-study detail pages.

**Goals, in priority order:**
1. **Convert** — drive a visitor to "Start a project" / `#contact`. Every section
   should build toward that.
2. **Prove outcomes, not pixels** — the Work section is explicitly framed as
   "Outcomes, not just pretty screenshots." Case studies lead with the problem,
   the approach, and real results.
3. **Demonstrate the studio's edge** — premium, confident, tech-forward craft, and
   an "AI-in-the-loop" workflow (the Vanta Studio self-referential case study is the
   thesis: idea → GPT → Codex → Stitch → Claude → live).

**Voice:** confident, concrete, a little wry. South African studio ("Made in
Africa, shipped worldwide"), Johannesburg / Cape Town, remote-global.

---

## 2. Architecture & how to run

**There is no build step. This is deliberate.** Treat it as a static site.

- `index.html` (root) and `cases/*.html` load **React 18 UMD** + **`@babel/standalone`**
  from unpkg, then run JSX directly in the browser via
  `<script type="text/babel" src="…jsx">` and inline `<script type="text/babel">`.
- **No bundler, no TypeScript, no tests, no lint.** The *front end* has no build
  step. There is a minimal root `package.json` (+ `package-lock.json`), but it is
  **server-only** — it just declares the `@vercel/functions` dependency that
  `middleware.js` imports (the case-study access gate, §9). It adds **no**
  front-end bundling. It sets `"type":"module"` — the middleware entrypoint must
  be `middleware.js` (Vercel doesn't detect `.mjs`), so all server code is ESM
  (see §9).
- Modules don't use ES imports. Each `.jsx` file defines globals and publishes them
  with `Object.assign(window, { … })` at the bottom. **Load order matters** — see
  `index.html`:
  `tweaks-panel.jsx` → `sections.jsx` → `work.jsx` → `app.jsx`. A symbol must be
  defined by an earlier script before a later one uses it.
- CDN `<script>` tags carry **SRI `integrity` hashes**. If you bump a React/Babel
  version, you must regenerate the matching hash or the page silently fails to boot.
- In-browser Babel = fine for this site's scale, but it's a dev-style setup
  (compiles on every load). Don't add heavy logic expecting production bundling.

**Run it** (any static server; needs http:// for module/CDN behaviour):
```bash
python3 -m http.server 8000
# then open http://localhost:8000/
# case study: http://localhost:8000/cases/Aucor%20Property.html
```

> **One server-side exception:** `api/callback.js` is a **Vercel serverless
> function** (the contact "request a callback" handler — see §8). The front end is
> still pure static / no-build; this single function is the only piece that needs a
> runtime. It does **not** run under `python -m http.server` (the form will 404) —
> use `vercel dev` or a deployed Vercel preview to exercise it. **The site is
> deployed on Vercel.**

---

## 3. File map

| Path | Role |
|---|---|
| `index.html` | Homepage shell; loads fonts, `styles.css`, React/Babel CDNs, the four root `.jsx` files. |
| `app.jsx` | Root `App` — composes the homepage sections, wires theme + accent + a dev "Tweaks" panel. Mounts to `#root`. |
| `sections.jsx` | Homepage sections: `Nav`, `Hero`, `Insights`, `Services`, `Process`, `Offers`, `Thinking`, `CTA`, `Footer`, shared `Reveal`/`Tilt`/`Eyebrow`. |
| `work.jsx` | `CASE_STUDIES` data (single source of truth), `CaseArt`, `ShotComposite`, `CaseHeroCard`, `CaseLabCard`, `Work` section, `LogoStrip`. |
| `tweaks-panel.jsx` | Dev-only `useTweaks` hook + `TweaksPanel`/`TweakRadio`/`TweakColor`. Lets you flip theme/accent/hero variant live. `TWEAK_DEFAULTS` in `app.jsx` is the committed default. |
| `styles.css` | **All** global styles + design tokens. Loaded by every page (root and `../styles.css` from cases). |
| `cases/*.html` | Self-contained case-study detail pages (one per project). Each defines its own `ACCENT`, inline page components, and `Page`. |
| `cases/shared.jsx` | Shared case-page components: `Reveal`, `Tilt`, `Eyebrow`, `CaseNav`, `CaseFooter`, `DeviceShot`. |
| `cases/case-study.css` | Layout for case-study pages (`.cs-*`, `.shot` consumers, gallery, compare). |
| `api/callback.js` | **Vercel serverless function.** Receives the contact "request a callback" form, validates it, writes a row to the Notion CRM database. Env: `NOTION_TOKEN`, `NOTION_DATABASE_ID` (§8). |
| `api/unlock.js` | **Vercel serverless function.** Verifies the shared case-study password and sets the signed access cookie. Env: `CASE_STUDY_PASSWORD`, `CASE_ACCESS_SECRET` (§9). |
| `middleware.js` | **Vercel Routing (Edge) Middleware.** Gates the protected case studies — checks the access cookie, rewrites to `unlock.html` when missing/invalid (§9). Must be `.js`, not `.mjs` (§9). |
| `unlock.html` | Password prompt page served in place of a protected case study (§9). |
| `package.json` / `package-lock.json` | Server-only manifest declaring `@vercel/functions` for `middleware.js`; marks server code ESM (`"type":"module"`). No front-end build (§2/§9). |
| `assets/work/` | Real screenshots used in case cards + case pages (see §6). |
| `.context/` | Conductor scratch space (gitignored). Source attachments live here. |

---

## 4. Design system

Tokens are CSS custom properties in `styles.css` `:root` (dark, default) and
`[data-theme="light"]`. **`data-theme` lives on `<html>`.**

**Colour — dark (default):**
```
--bg #0a0908   --bg-2 #0f0d0c   --bg-3 #15120f
--fg #f4efe7   --fg-2 #c8c1b4   --fg-3 #8b8479   --fg-4 #5a544b
--line rgba(244,239,231,.08)    --line-2 rgba(244,239,231,.14)
--accent #d8ff3b (lime)         --accent-ink var(--accent)   --on-accent #0a0908
```
**Colour — light (`[data-theme="light"]`):**
```
--bg #f7f5f0  --bg-2 #efece5  --bg-3 #e6e2d8
--fg #14110e  --fg-2 #36322c  --fg-3 #6b665c  --fg-4 #9a948a
--line rgba(20,17,14,.08)      --line-2 rgba(20,17,14,.16)
--accent-ink #14110e   (the lime stays for FILLS only; text-accent → ink)
```
> Light-mode rule of thumb baked into `styles.css`: the lime `--accent` is used
> for **fills** (buttons, dots, flags). For **text** on the cream background it's
> illegible, so text-accent uses `--accent-ink`. When you add accent-coloured
> text, give it a class that the `[data-theme="light"]` block can override, rather
> than relying on an inline lime `color`.

**Shape / layout:** `--radius 14px` · `--maxw 1280px` ·
`--gutter clamp(20px,4vw,56px)`. Wrap page content in `.container`.

**Type:**
- `--font-sans` **Geist** · `--font-mono` **Geist Mono** · display serif
  **Instrument Serif** (used for pull-quotes, `.display-em`). Loaded from Google Fonts.
- Scale: `.display` `clamp(44px,6.6vw,96px)` · `.h2` `clamp(32px,4.2vw,60px)` ·
  `.lede` `clamp(16px,1.4vw,19px)` · `.mono` 11.5px uppercase tracked. Sizes are
  fluid `clamp()` — keep that pattern.

**Motion / components (shared):**
- `Reveal` — IntersectionObserver fade-and-rise on scroll; `delay` (ms) staggers,
  `as` sets the tag. Defined in both `sections.jsx` and `cases/shared.jsx`.
- `Tilt` — subtle 3D mouse tilt; wraps cards.
- `Eyebrow` — small numbered section label (`<Eyebrow num="04">…`).
- `CaseNav` / `CaseFooter` — header/footer for case pages (include the theme toggle).

**Accent injection (important):** the homepage accent is driven by `app.jsx`
tweaks (`--accent` default `#d8ff3b`). **Each case page sets its own `--accent`**
via a top-of-file `ACCENT` constant applied in a `useEffect`
(`document.documentElement.style.setProperty('--accent', ACCENT)`).
Current values: Aucor page `#d8ff3b` (lime), SCIS page `#9ee84d` (green). Note the
homepage card *art* palette can differ from the page accent (Aucor's card palette
carries a red `#e6483b`) — palette and page-accent are separate knobs.

---

## 5. Case-study system

**Data:** `CASE_STUDIES` in `work.jsx` is the single source of truth, consumed by
the homepage `Work` section and referenced by the detail pages. Entry shape:
```js
{
  slug, name, cat, kind: 'CLIENT WORK' | 'IN-HOUSE' | 'LAB',
  year, status, href: 'cases/<Name>.html',
  headline, blurb, services: [...],
  metricA: { v, l }, metricB: { v, l },
  palette: [bg1, bg2, accent],   // [darkBg, midBg, accentHex]
  accent: '#hex',
  art: 'auction'|'globe'|'vanta'|'doc'|'gear'|'compass',  // generated card art
  media: { desktop, mobile, url },  // OPTIONAL — real screenshots (see §6)
}
```
- `kind !== 'LAB'` → big hero card (`CaseHeroCard`); `kind === 'LAB'` → 3-up grid
  (`CaseLabCard`).
- `CaseArt` renders the **real screenshot composite** when `media` is present,
  otherwise falls back to the procedurally-generated art keyed by `art`.

**Detail page anatomy** (`cases/<Name>.html`): hero (`.cs-hero` → `.cs-hero-art`),
then numbered `.cs-section`s — `01 The brief` (`.cs-2col` + `.cs-steps` + pull-quote),
`02 What we built` (visual + `.cs-approach-grid`), `03 Outcomes` (`.cs-stats`), then
a "Next project" CTA. Use `Reveal`/`Eyebrow` and the `.cs-*` classes.

**Adding a new case study:**
1. Add an entry to `CASE_STUDIES` in `work.jsx` (give it `media` if you have real
   shots, otherwise pick an `art` kind).
2. Create `cases/<Name>.html` (copy an existing one — keep the CDN+SRI scripts and
   `shared.jsx` include), set its `ACCENT`, fill the sections.
3. Point the previous case's "Next project" `NEXT` at it if you want the chain to flow.

---

## 6. Real screenshots — the device composite

Real site screenshots live in **`assets/work/`** (referenced as `assets/work/…`
from root, `../assets/work/…` from case pages).

They're presented with a **device composite**: a browser frame around the desktop
screenshot, with a phone mockup overlapping the bottom-right corner. Markup +
styles are self-contained (no JS animation):
- **Homepage cards** → `ShotComposite` in `work.jsx` (driven by an entry's `media`).
- **Case pages** → `DeviceShot` in `cases/shared.jsx`
  (`<DeviceShot desktop mobile url bg1 bg2 />`).
- **Styles** → `.shot`, `.shot-browser`, `.shot-bar`, `.shot-screen`, `.shot-phone`
  in `styles.css`. Screenshots use `object-fit: cover; object-position: top` so the
  hero/header of the captured page stays visible.

Two extra case-page patterns also live in `case-study.css`:
- `.cs-gallery` — wireframe→final process strip (used in the Aucor case study).
- `.cs-compare` — before/after 2-up. `.cs-compare-frame--empty` is a dashed
  placeholder slot for an image that hasn't arrived yet (used for SCIS's "before"
  rejected-design shot — search the SCIS HTML for the `TODO` comment to wire it in).

Current assets: `aucor-desktop.jpg`, `aucor-mobile.png`, `aucor-wire-{desktop,sitemap,mobile}.png`,
`scis-desktop-{light,dark}.{jpg,png}`, `scis-mobile.png`.

---

## 7. Conventions & gotchas

- **No fake brand assets.** The `LogoStrip` uses text-set "logos" on purpose — don't
  drop in trademarked logo art. Keep that honesty.
- **Don't invent metrics.** Case-study numbers reflect real client facts; if you
  don't have a number, don't fabricate one.
- **Filenames with spaces** exist in `cases/` (e.g. `Aucor Property.html`). URLs need
  `%20`. Keep `href`s in data matching the actual filename.
- **Load order coupling** (§2) — adding a component used by an earlier-loaded file
  than where it's defined will break at runtime with no build error.
- **SRI hashes** — bumping a CDN dependency requires updating its `integrity` attr.
- **`data-theme` is on `<html>`**; theme toggles set it there. Both themes must look
  intentional — check any new accent-on-light text against the light palette.
- **No tests/CI.** Verify visually: serve statically and check homepage `#work`,
  both case pages, the theme toggle, and ~375px / ~1280px widths.
- **Brand name vs. identifiers.** The brand is **Vanta Studio**. But several
  real-world identifiers deliberately keep the original `vanta-labs` / `vantalabs`
  form and must NOT be "fixed" to match the brand unless the underlying account
  actually changes: the email `hello@vantalabs.co`, the Cal.com handle in the
  booking URL / `data-cal-link` (`vanta-labs/discovery-call`), and the
  `slug: 'vanta-labs'` in `work.jsx`. The codename `vanta` (the hero cube,
  `vanta init`, `~/vanta`) also stays — it lives on inside "Vanta Studio".
- **CSS cache-buster.** `index.html` links the stylesheet as `styles.css?v=N`.
  Bump `N` whenever a `styles.css` change must defeat a stale browser cache during
  testing/deploy. (Case pages currently link `../styles.css` unversioned.)

---

## 8. Contact & conversion (booking + callback)

The `#contact` section (`CTA` + `CallbackForm` in `sections.jsx`) offers **two
paths** — there is intentionally no email-first "Start a project" button here:

- **Book a discovery call** — a **Cal.com popup**. The official embed loader is
  inline at the bottom of `index.html`; the button opts in with
  `data-cal-namespace="discovery-call"` + `data-cal-link="vanta-labs/discovery-call"`.
  Cal opens the popup via document-level click **delegation**, so it works on the
  React-rendered button. An `onClick={openBookingFallback}` opens cal.com in a new
  tab **only** when the embed script failed to load (`window.__calEmbedFailed`), so
  the CTA is never a dead end.
- **Request a callback** — `CallbackForm` POSTs JSON to `/api/callback`. Name +
  Phone are required; Company + Note optional. There's a hidden honeypot field
  (`company_url`) for spam. Success/error states render inline. Includes a POPIA
  consent line.

**Data store:** `/api/callback` creates a page in a **Notion** database
("Vanta Studio — Callback Requests": Name, Company, Phone, Note, Status, Submitted).
Env on Vercel: `NOTION_TOKEN` (internal integration secret) and `NOTION_DATABASE_ID`.
The database must be **shared with that integration** or the Notion API returns
"object not found".

**Gotchas:**
- The Cal loader injects `app.cal.com/embed/embed.js` at runtime → **no SRI**
  (documented exception, §2/§7). Its third loader argument must be `"init"` and
  match the `Cal("init", …)` keyword; if it doesn't, the namespace never registers
  and the button is silently inert.
- Keep query strings **out of `data-cal-link`** (use `data-cal-config` / the popup
  config). A `?param` in `data-cal-link` corrupts the parsed event slug.
- Triggering via a plain `<button>` (not an `<a href>`) avoids a double-open (popup
  *and* navigation) — the fallback navigation lives in the JS handler instead.

---

## 9. Case-study access gate (password protection)

Selected **client** case studies are behind a single shared password. The gate is
**server-side** — the protected HTML is genuinely withheld until the password is
verified, not just hidden in the browser. Three pieces:

- **`middleware.js`** (Vercel Edge Routing Middleware, runs on `matcher:
  ['/cases/:path*']`) — for each request it decodes the pathname and checks it
  against an in-code `PROTECTED` allowlist. Public paths (the **Vanta Studio**
  case study, plus `shared.jsx` / `case-study.css` / images under `/cases/`) call
  `next()` and pass straight through. For a protected page it validates the
  `vs_case_access` cookie; missing/invalid → `rewrite()` to `unlock.html` (served
  **at the same URL**), valid → `next()`.
- **`unlock.html`** (root) — the prompt. POSTs `{ password }` to `/api/unlock`;
  on success it `location.reload()`s and the now-present cookie lets middleware
  serve the real page. Loads `/styles.css` by **root-absolute** path (it renders
  at a `/cases/...` URL, so relative paths would break).
- **`api/unlock.js`** (Node serverless, ESM `export default` like `callback.js`) —
  constant-time-compares the submitted password to `CASE_STUDY_PASSWORD`; on a
  match sets `vs_case_access` (`HttpOnly; Secure; SameSite=Lax; Path=/`, 30-day
  Max-Age).

**Cookie & token contract** (keep `api/unlock.js` and `middleware.js` in sync):
`vs_case_access = <expMs>.<base64url(HMAC-SHA256(String(expMs), CASE_ACCESS_SECRET))>`.
Valid iff the signature verifies **and** `Date.now() < expMs`. Signed in Node
(`crypto`), verified in Edge (`crypto.subtle`) — same HMAC, so it round-trips.

**Env vars** (Vercel → Settings → Env Vars, Preview + Production):
- `CASE_STUDY_PASSWORD` — the shared password you hand out. Use a **strong
  passphrase**; it's the primary brute-force defence (there's no durable rate
  limiting — `api/unlock.js` only adds a small fixed delay on failure).
- `CASE_ACCESS_SECRET` — long random string, signs the cookie. Never shared.
  **Rotate it to invalidate every existing session** (also rotate `CASE_STUDY_PASSWORD`
  if the password itself leaked).

**To protect another case study:** add its decoded path to `PROTECTED` in
`middleware.js` (e.g. `'/cases/New Case.html'`) and set `locked: true` on its
`CASE_STUDIES` entry in `work.jsx` (renders the `🔒 Private` chip via
`CaseHeroCard` / `.case-card-lock`). To make one public again, remove both.

**Gotchas:**
- **The middleware entrypoint MUST be `middleware.js`, not `.mjs`.** Vercel only
  detects `middleware.js`/`middleware.ts` at the root — a `middleware.mjs` is
  treated as an inert static file and silently never runs (pages just open with
  no gate and no error). Because `middleware.js` uses `import`/`export`, the
  project sets `"type":"module"`, which makes **all** server code ESM — so the
  `api/*.js` functions use `export default async function handler` (not
  `module.exports`) and `import … from 'node:crypto'` (not `require`). The
  browser-loaded `.jsx` files are unaffected (they run through Babel, not Node).
- **Local dev needs `vercel dev`.** The middleware and `/api/unlock` do **not**
  run under `python -m http.server` (the gate is absent and the form 404s) —
  same class of exception as `api/callback.js` (§2). `Secure` cookies still work
  on `localhost` (browsers treat it as a secure context).
- **Screenshots stay public by design.** `assets/work/` images are already shown
  on the homepage Work cards, so only the detail-page prose/metrics are gated,
  not the image files.
- Adding `package.json` must not introduce a build: keep it script-free so Vercel
  keeps treating the project as static-plus-functions (Framework Preset "Other").
