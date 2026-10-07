# feat: Client testimonial form (shareable link)

**Date:** 2026-10-06
**Type:** feat
**Depth:** Lightweight

---

## Summary

A standalone, unlisted page at **`/testimonials/`** that the studio sends by link to
past clients so they can leave a testimonial: project name, when it happened, a 1–5
star rating, and a write-up of the experience. Submissions land in a Notion
database, using the same pattern as the homepage "request a callback" form.

## Problem frame

The Work section promises "outcomes, not pretty screenshots", but there's no
low-friction way to collect client voices that back that up. The owner wants
something they can paste into an email or WhatsApp — no login, nothing to
install, and it should look like Vanta Studio.

## What's in v1 (this branch)

| Piece | Notes |
|---|---|
| `testimonials/index.html` | Single card, same design tokens/field styles as the callback form (`.cb-*`). Plain HTML + a small inline script — no React/Babel needed for one form. Root-absolute asset paths. `noindex, nofollow`. Works in dark and light themes, 375px → desktop. |
| `api/testimonial.js` | Vercel function (ESM, like `callback.js`). Validates, honeypot, writes one Notion page. |
| Notion DB "Vanta Studio — Client References" | New database, shared with the existing integration. |

**Fields**

| Field | Required | Why |
|---|---|---|
| Project name | ✅ | Prefillable from the link. |
| When — month + year | Year ✅, month optional | Two selects rather than `<input type=month>` (no desktop Safari support). Stored as text, e.g. `Mar 2025`. |
| Overall rating 1–5 ★ | ✅ | Real radio inputs drawn as stars → keyboard + screen-reader friendly. |
| Experience | ✅ (≥10 chars, ≤1,900) | Notion caps a rich-text block at 2,000 chars. |
| Name | ✅ | A testimonial with no name isn't usable as a testimonial. |
| Role, Company | optional | Needed to attribute a public quote. |
| "May quote publicly" | checkbox, **unticked by default** | Opt-in consent (POPIA). Untick = private, internal use only. |

**Tailored links** — query params prefill the form so each client gets a link
that's already about their project:

```
https://<site>/testimonials/?project=Aucor%20Property&when=2025
```

## Setup (owner, one-time)

1. In Notion, create a database **"Vanta Studio — Client References"** with these
   properties (names must match exactly):
   - `Name` — Title
   - `Role` — Text
   - `Company` — Text
   - `Project` — Text
   - `When` — Text
   - `Rating` — Number
   - `Experience` — Text
   - `Can quote` — Checkbox
   - `Status` — Select (add option `New`; later e.g. `Approved`, `Published`)
   - `Submitted` — Created time (filled automatically)
2. Database → ••• → **Connections** → connect the same integration used for
   callback requests.
3. Vercel → Settings → Env Vars (Preview + Production): add
   `NOTION_REFERENCES_DATABASE_ID`. `NOTION_TOKEN` is reused.
4. Redeploy. Test on the preview URL (the API doesn't run under
   `python -m http.server`; use `vercel dev` or a preview deploy).

## Decisions

- **Unlisted, not gated.** No password: the link is the invite. The page is
  `noindex` and not linked from the site nav. Spam is handled by the honeypot,
  same as the callback form. If junk shows up, add a per-client token (below).
- **Notion over a new datastore.** Matches the callback flow; the owner can
  review, tag `Status`, and copy quotes straight out.
- **No display on the site yet.** Collecting comes first. Publishing is a
  manual, deliberate step, which fits the "don't invent metrics" rule: only real,
  consented quotes go live.

## v2 — homepage Testimonials section (this branch)

- **Thank-you state** gets a "Back to Vanta Studio" button.
- **Publishing:** the owner added a `Publish` checkbox to the Notion database. A
  testimonial appears on the homepage only when **`Can quote` and `Publish`** are
  both ticked: the client's consent plus the studio's pick.
- **`api/published-testimonials.js`** (GET) queries Notion with that filter,
  returns only display fields, and is edge-cached for 5 minutes. This replaces
  the earlier "hand-curated static array" idea: the Notion checkbox is the
  control, so no deploy is needed to publish.
- **`testimonials.jsx`** adds the `Testimonials` section (05) between Work and
  Process, which puts proof straight after the case studies. Three layouts
  to play with from the Tweaks panel:
  - **Spotlight** (default): one large Instrument Serif quote, auto-advancing
    every 9s with a progress bar, a picker list and prev/next. Long quotes drop
    to body type so they stay readable.
  - **Marquee:** endless scrolling card rows (two rows at 6+ testimonials), pause
    on hover. Below 3 testimonials it falls back to Grid.
  - **Grid:** masonry cards; long quotes clamp with "Read the full testimonial".
- The section hides itself when nothing is published. `?testimonials=demo` previews it
  with labelled placeholder data.

## Still out of scope

- **Per-client signed links**, e.g. `?t=<HMAC(project)>` reusing the
  `CASE_ACCESS_SECRET` pattern from the case-study gate, so only links you
  minted can submit. Worth it only if spam appears.
- **Notify on submit:** Notion's own database automations (Slack/email) can
  handle this with no code.
- **Photo / logo upload:** skipped. It needs storage and raises brand-asset
  questions (§7: no fake logos). Avatars are initials for now.
- **Multiple ratings** (communication, quality, timeline): easy to add later
  if one overall score proves too coarse.

## Verification done

- Headless Chromium at 1280px and 375px, dark and light: layout, star
  hover/select, client-side validation messages, `?project=&when=` prefill,
  success state (API mocked).
- `api/testimonial.js` exercised with a mocked `fetch`: 405 on GET, rating and
  length validation, honeypot short-circuit, and the exact Notion property
  payload.
- v1 form verified on the Vercel preview against the real Notion database.
- v2: all three layouts at 1280px and 375px in both themes (with `?testimonials=demo`),
  a single-testimonial case, and the hidden-when-empty case. `published-testimonials.js`
  was exercised with a mocked `fetch`: the filter body, field mapping (no extra
  fields leak), dropping rows with no name, the cache header, and 405 on POST.
  Not yet tested against the real database: that needs a testimonial with both
  boxes ticked.
