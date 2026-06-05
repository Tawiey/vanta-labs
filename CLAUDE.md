# CLAUDE.md — Vanta Labs site

Context for AI agents working on this repository. Read this first.

---

## 1. What this site is

**Vanta Labs** is a small product/design/engineering studio. This repo is its
**marketing site** — a single-page landing experience plus a handful of
case-study detail pages.

**Goals, in priority order:**
1. **Convert** — drive a visitor to "Start a project" / `#contact`. Every section
   should build toward that.
2. **Prove outcomes, not pixels** — the Work section is explicitly framed as
   "Outcomes, not just pretty screenshots." Case studies lead with the problem,
   the approach, and real results.
3. **Demonstrate the studio's edge** — premium, confident, tech-forward craft, and
   an "AI-in-the-loop" workflow (the Vanta Labs self-referential case study is the
   thesis: idea → GPT → Codex → Stitch → Claude → live).

**Voice:** confident, concrete, a little wry. South African studio ("Made in
Africa, shipped worldwide"), Johannesburg / Cape Town, remote-global.

---

## 2. Architecture & how to run

**There is no build step. This is deliberate.** Treat it as a static site.

- `index.html` (root) and `cases/*.html` load **React 18 UMD** + **`@babel/standalone`**
  from unpkg, then run JSX directly in the browser via
  `<script type="text/babel" src="…jsx">` and inline `<script type="text/babel">`.
- **No bundler, no npm, no package.json, no TypeScript, no tests, no lint.**
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
