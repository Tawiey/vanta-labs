# Website offers: local validation

## Scope

Business is the default homepage audience. Start costs R4,500, Business R8,500 and Grow R19,000. The agency path describes white-label work and quotes to the brief. The hero uses the supplied Aucor screenshot; recent work shows Aucor, CM Plumbing and SCIS. No example conversion metrics or lab projects remain on the homepage.

## Checks

- Browser checked both audience states, package text, native FAQ expansion and internal section links.
- Checked desktop and mobile layouts in dark/light themes, including 320px width; no horizontal overflow in those checks.
- Verified the Aucor scroll angle moves toward 0 degrees and all six recent-work screenshots load. Reduced-motion CSS disables the transform; the listener also respects matchMedia changes.
- Local static previews of Aucor and SCIS case pages render with the shared logo and updated contact/package links.
- All six HTML pages reference SVG, multi-size ICO and Apple touch icons. The ICO includes 16px, 32px and 48px sizes.
- No automated frontend build/test suite is configured. Used browser inspection, static asset/link checks and git diff --check.

## Limits

Static serving does not exercise Vercel authentication middleware, Notion-backed form submissions, or booking completion. Those paths were not submitted. Existing case access controls and Cal.com account identifiers were not changed. Local PDF sales collateral and private partner terms are excluded from this public website PR.
