# feat: Client reference form (shareable link)

**Date:** 2026-10-06
**Type:** feat
**Depth:** Lightweight

---

## Summary

A standalone, unlisted page at **`/references/`** that the studio sends by link to
past clients so they can leave a reference: project name, when it happened, a 1–5
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
| `references/index.html` | Single card, same design tokens/field styles as the callback form (`.cb-*`). Plain HTML + a small inline script — no React/Babel needed for one form. Root-absolute asset paths. `noindex, nofollow`. Works in dark and light themes, 375px → desktop. |
| `api/reference.js` | Vercel function (ESM, like `callback.js`). Validates, honeypot, writes one Notion page. |
| Notion DB "Vanta Studio — Client References" | New database, shared with the existing integration. |

**Fields**

| Field | Required | Why |
|---|---|---|
| Project name | ✅ | Prefillable from the link. |
| When — month + year | Year ✅, month optional | Two selects rather than `<input type=month>` (no desktop Safari support). Stored as text, e.g. `Mar 2025`. |
| Overall rating 1–5 ★ | ✅ | Real radio inputs drawn as stars → keyboard + screen-reader friendly. |
| Experience | ✅ (≥10 chars, ≤1,900) | Notion caps a rich-text block at 2,000 chars. |
| Name | ✅ | A reference with no name isn't usable as a reference. |
| Role, Company | optional | Needed to attribute a public quote. |
| "May quote publicly" | checkbox, **unticked by default** | Opt-in consent (POPIA). Untick = private, internal use only. |

**Tailored links** — query params prefill the form so each client gets a link
that's already about their project:

```
https://<site>/references/?project=Aucor%20Property&when=2025
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

## Out of scope / next steps

- **Show testimonials on the homepage** — a `Testimonials` section in
  `sections.jsx`, fed by a hand-curated array (only `Can quote = true`,
  `Status = Published`). Keep it static. Pulling from Notion at runtime isn't
  worth it at this scale.
- **Per-client signed links** — e.g. `?t=<HMAC(project)>` reusing the
  `CASE_ACCESS_SECRET` pattern from the case-study gate, so only links you
  minted can submit. Worth it only if spam appears.
- **Notify on submit** — Notion's own database automations (Slack/email) can
  handle this with no code.
- **Photo / logo upload** — skipped; needs storage and raises brand-asset
  questions (§7: no fake logos).
- **Multiple ratings** (communication, quality, timeline) — easy to add later
  if one overall score proves too coarse.

## Verification done

- Headless Chromium at 1280px and 375px, dark and light: layout, star
  hover/select, client-side validation messages, `?project=&when=` prefill,
  success state (API mocked).
- `api/reference.js` exercised with a mocked `fetch`: 405 on GET, rating and
  length validation, honeypot short-circuit, and the exact Notion property
  payload.
- Not yet verified against a real Notion database: that needs the env var
  and database from the setup steps above.
