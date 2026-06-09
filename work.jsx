// work.jsx — Vanta Studio case studies + logo strip

const { useState: useStateW, useEffect: useEffectW, useRef: useRefW } = React;

// ─────────────────────────────────────────────────────────────────────────
// Case study data — single source of truth, also consumed by detail pages
// ─────────────────────────────────────────────────────────────────────────
const CASE_STUDIES = [
  {
    slug: 'aucor-property',
    name: 'Aucor Property',
    cat: 'Property auctions · Brand & web',
    kind: 'CLIENT WORK',
    year: '2026',
    status: 'Launching mid-2026',
    href: 'cases/Aucor Property.html',
    headline: 'A 30-year auction house, rewritten for the way buyers actually decide today.',
    blurb:
      'Commercial & industrial property auctions, redesigned end-to-end. We lifted Aucor out of the dated PHP era and into a confidence-led, mobile-first experience that turns curious browsers into pre-registered bidders.',
    services: ['Brand refresh', 'UX & UI', 'Web build'],
    metricA: { v: '30y', l: 'of brand, refreshed' },
    metricB: { v: '17.96B', l: 'rand, transacted to date' },
    palette: ['#0a0a0c', '#15151a', '#e6483b'],
    accent: '#e6483b',
    art: 'auction',
    media: {
      desktop: 'assets/work/aucor-desktop.jpg',
      mobile: 'assets/work/aucor-mobile.png',
      url: 'aucor-property.co.za',
    },
  },
  {
    slug: 'scis-wits',
    name: 'SCIS @ Wits',
    cat: 'Academic research · Standalone site',
    kind: 'CLIENT WORK',
    year: '2026',
    status: 'Launching mid-2026',
    href: 'cases/SCIS at Wits.html',
    headline: 'Carving out space inside a 100-year university for a centre that turns research into pressure.',
    blurb:
      'The Southern Centre for Inequality Studies needed to step out from under the Wits parent site to tell its own story — partners, themes, impact, voices. We built a standalone home that gives weight to evidence and the people behind it.',
    services: ['IA & UX', 'UI & motion', 'Web build', 'CMS'],
    metricA: { v: '6', l: 'research themes, surfaced' },
    metricB: { v: '9', l: 'partner countries, mapped' },
    palette: ['#08111e', '#0e1a30', '#9ee84d'],
    accent: '#9ee84d',
    art: 'globe',
    media: {
      desktop: 'assets/work/scis-desktop-light.jpg',
      mobile: 'assets/work/scis-mobile.png',
      url: 'wits-scis.vercel.app',
    },
  },
  {
    slug: 'vanta-labs',
    name: 'Vanta Studio (this site)',
    cat: 'Self-published · Brand & marketing',
    kind: 'IN-HOUSE',
    year: '2026',
    status: 'Live · v1',
    href: 'cases/Vanta Studio.html',
    headline: 'A studio site, built in five tools and one weekend.',
    blurb:
      'The site you\'re reading. From a half-formed idea in ChatGPT, into Codex, refined in Stitch, polished in Claude — a working sketch of how AI-in-the-loop changes a studio\'s output. Meta, on purpose.',
    services: ['Strategy', 'Brand', 'Web', 'AI workflow'],
    metricA: { v: '5', l: 'AI tools, in the loop' },
    metricB: { v: '~36h', l: 'idea → live' },
    palette: ['#0a0908', '#15120f', '#d8ff3b'],
    accent: '#d8ff3b',
    art: 'vanta',
  },
  // Lab projects (smaller, three-up)
  {
    slug: 'ai-design-digest',
    name: 'AI Design Digest',
    cat: 'Newsletter · AI design space',
    kind: 'LAB',
    year: '2025',
    status: 'Live · weekly',
    headline: 'A 5-minute weekly read of what shipped, what shifted, and what to ignore in AI design.',
    services: ['Product', 'Design', 'Writing'],
    metricA: { v: '52', l: 'weeks, no skips' },
    palette: ['#0a0908', '#1a1612'],
    accent: '#d8ff3b',
    art: 'doc',
  },
  {
    slug: 'mtb-service-tracker',
    name: 'MTB Service Tracker',
    cat: 'Mountain biking · Web app',
    kind: 'LAB',
    year: '2025',
    status: 'Live · public beta',
    headline: 'Track service intervals on every component on your bike. Stop guessing when the chain dies.',
    services: ['Product', 'Design', 'Web app'],
    metricA: { v: '14', l: 'parts, tracked per bike' },
    palette: ['#0a0908', '#15120f'],
    accent: '#d8ff3b',
    art: 'gear',
  },
  {
    slug: 'mtb-bike-finder',
    name: 'MTB Bike Finder',
    cat: 'Mountain biking · Quiz tool',
    kind: 'LAB',
    year: '2025',
    status: 'Live · v1',
    headline: 'A shortcut for beginners staring at a wall of mountain bikes that all look the same.',
    services: ['Product', 'Design', 'Web app'],
    metricA: { v: '6 Q', l: '→ a real recommendation' },
    palette: ['#0a0908', '#15120f'],
    accent: '#d8ff3b',
    art: 'compass',
  },
];

// ─────────────────────────────────────────────────────────────────────────
// Device composite — real screenshot in a browser frame + phone in the corner
// (markup mirrors the DeviceShot in cases/shared.jsx; styles live in styles.css)
// ─────────────────────────────────────────────────────────────────────────
function ShotComposite({ media, palette }) {
  const [bg1, bg2] = palette;
  return (
    <div className="shot" style={{ background: `linear-gradient(160deg, ${bg1}, ${bg2})` }}>
      <div className="shot-browser">
        <div className="shot-bar">
          {['#ff5f57', '#febc2e', '#28c840'].map((c) => (
            <span key={c} className="shot-dot" style={{ background: c }} />
          ))}
          <span className="shot-url">{media.url}</span>
        </div>
        <div className="shot-screen">
          <img src={media.desktop} alt="" loading="lazy" />
        </div>
      </div>
      {media.mobile && (
        <div className="shot-phone">
          <img src={media.mobile} alt="" loading="lazy" />
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Card art — real screenshots when a case has `media`, else abstract previews
// built from the case study's palette
// ─────────────────────────────────────────────────────────────────────────
function CaseArt({ kind, palette, accent, media }) {
  const [bg1, bg2, c3] = palette;
  if (media) {
    return (
      <div className="case-art">
        <ShotComposite media={media} palette={palette} />
      </div>
    );
  }
  if (kind === 'auction') {
    // Aucor — countdown tiles + price line, in their dark navy/red
    return (
      <div className="case-art case-art--auction">
        <div className="case-art-bg" style={{ background: `radial-gradient(120% 70% at 50% 0%, ${c3}40, transparent 60%), linear-gradient(160deg, ${bg1}, ${bg2})` }} />
        <div className="case-art-grid" />
        <div className="ca-tag mono" style={{ color: c3 }}><span className="ca-pulse" style={{ background: c3 }} />UPCOMING AUCTION</div>
        <div className="ca-stack">
          {['16','18','23','58'].map((n, i) => (
            <div key={i} className="ca-tile">
              <div className="ca-tile-num">{n}</div>
              <div className="ca-tile-l mono">{['D','H','M','S'][i]}</div>
            </div>
          ))}
        </div>
        <div className="ca-line" style={{ background: c3 }} />
      </div>
    );
  }
  if (kind === 'globe') {
    // SCIS — globe with pinned partner cities
    return (
      <div className="case-art case-art--globe">
        <div className="case-art-bg" style={{ background: `radial-gradient(120% 70% at 50% 100%, ${c3}25, transparent 60%), linear-gradient(180deg, ${bg1}, ${bg2})` }} />
        <div className="case-art-dotmap" />
        <div className="ca-globe">
          <div className="ca-globe-ring" />
          <div className="ca-globe-ring ca-globe-ring--2" />
          <div className="ca-globe-pin" style={{ top: '38%', left: '52%', background: c3 }} />
          <div className="ca-globe-pin" style={{ top: '58%', left: '50%', background: c3 }} />
          <div className="ca-globe-pin" style={{ top: '46%', left: '36%', background: '#5db8ff' }} />
          <div className="ca-globe-pin" style={{ top: '32%', left: '60%', background: '#5db8ff' }} />
          <div className="ca-globe-pin" style={{ top: '52%', left: '70%', background: '#5db8ff' }} />
        </div>
        <div className="ca-tag mono" style={{ color: c3, top: 'auto', bottom: 18, left: 18 }}>9 PARTNER COUNTRIES</div>
      </div>
    );
  }
  if (kind === 'vanta') {
    // Vanta — meta loop showing the toolchain
    return (
      <div className="case-art case-art--vanta">
        <div className="case-art-bg" style={{ background: `radial-gradient(80% 60% at 70% 30%, ${c3}25, transparent 60%), linear-gradient(140deg, ${bg1}, ${bg2})` }} />
        <div className="case-art-grid" />
        <div className="ca-chain">
          {['IDEA', 'GPT', 'CODEX', 'STITCH', 'CLAUDE', 'LIVE'].map((n, i) => (
            <React.Fragment key={n}>
              <div className={'ca-node' + (i === 4 ? ' ca-node--accent' : '')} style={i === 4 ? { borderColor: c3, color: c3 } : {}}>
                <span className="mono">{n}</span>
              </div>
              {i < 5 && <div className="ca-link" />}
            </React.Fragment>
          ))}
        </div>
        <div className="ca-tag mono" style={{ color: c3 }}><span className="ca-pulse" style={{ background: c3 }} />MADE WITH AI · KEPT BY HAND</div>
      </div>
    );
  }
  if (kind === 'doc') {
    return (
      <div className="case-art case-art--lab">
        <div className="case-art-bg" style={{ background: `linear-gradient(140deg, ${bg1}, ${bg2})` }} />
        <div className="case-art-grid" />
        <div className="ca-doc">
          <div className="ca-doc-h" />
          <div className="ca-doc-l" style={{ width: '78%' }} />
          <div className="ca-doc-l" style={{ width: '92%' }} />
          <div className="ca-doc-l" style={{ width: '60%' }} />
          <div className="ca-doc-l ca-doc-l--accent" style={{ width: '44%', background: accent }} />
        </div>
      </div>
    );
  }
  if (kind === 'gear') {
    return (
      <div className="case-art case-art--lab">
        <div className="case-art-bg" style={{ background: `linear-gradient(140deg, ${bg1}, ${bg2})` }} />
        <div className="case-art-grid" />
        <div className="ca-gauge">
          <svg viewBox="0 0 120 70" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
            <path d="M10 60 A50 50 0 0 1 110 60" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="3" strokeLinecap="round" />
            <path d="M10 60 A50 50 0 0 1 80 18" fill="none" stroke={accent} strokeWidth="3" strokeLinecap="round" />
            <circle cx="80" cy="18" r="4" fill={accent} />
          </svg>
          <div className="ca-gauge-num">68%</div>
          <div className="ca-gauge-l mono">CHAIN LIFE</div>
        </div>
      </div>
    );
  }
  // compass
  return (
    <div className="case-art case-art--lab">
      <div className="case-art-bg" style={{ background: `linear-gradient(140deg, ${bg1}, ${bg2})` }} />
      <div className="case-art-grid" />
      <div className="ca-compass">
        <div className="ca-compass-ring" />
        <div className="ca-compass-arrow" style={{ background: accent }} />
        <div className="ca-compass-tick mono">TRAIL</div>
        <div className="ca-compass-tick ca-compass-tick--2 mono">XC</div>
        <div className="ca-compass-tick ca-compass-tick--3 mono">DH</div>
        <div className="ca-compass-tick ca-compass-tick--4 mono">ENDURO</div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Hero card — large, full-bleed art with overlay text + outcome chip
// ─────────────────────────────────────────────────────────────────────────
function CaseHeroCard({ c, span }) {
  const inner = (
    <div className="case-card-inner">
      <CaseArt kind={c.art} palette={c.palette} accent={c.accent} media={c.media} />
      <div className="case-card-foot">
        <div className="case-card-l">
          <div className="mono dim case-card-kind">{c.kind} · {c.year}</div>
          <div className="case-card-name">{c.name}</div>
          <div className="case-card-cat dim">{c.cat}</div>
        </div>
        <div className="case-card-r">
          <div className="case-card-stat">{c.metricA.v}</div>
          <div className="mono dim case-card-statL">{c.metricA.l}</div>
        </div>
      </div>
      <div className="case-card-status mono">
        <span className="case-card-status-dot" style={{ background: c.accent }} />
        {c.status}
      </div>
      <div className="case-card-arrow" aria-hidden="true">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M5 13L13 5M13 5H7M13 5V11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
  return (
    <Tilt max={3} className={'case-card case-card--hero ' + (span ? 'case-card--wide' : '')}>
      {c.href ? <a href={c.href} className="case-card-link">{inner}</a> : inner}
    </Tilt>
  );
}

// Lab card — smaller, three-up
function CaseLabCard({ c }) {
  return (
    <Tilt max={3} className="case-card case-card--lab">
      <div className="case-card-inner">
        <CaseArt kind={c.art} palette={c.palette} accent={c.accent} />
        <div className="case-card-foot case-card-foot--lab">
          <div className="case-card-l">
            <div className="mono dim case-card-kind">{c.kind} · {c.year}</div>
            <div className="case-card-name">{c.name}</div>
            <div className="case-card-cat dim">{c.cat}</div>
          </div>
        </div>
        <div className="case-card-status mono">
          <span className="case-card-status-dot" style={{ background: c.accent }} />
          {c.status}
        </div>
      </div>
    </Tilt>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// WORK section
// ─────────────────────────────────────────────────────────────────────────
function Work({ accent }) {
  const hero = CASE_STUDIES.filter((c) => c.kind !== 'LAB');
  const lab = CASE_STUDIES.filter((c) => c.kind === 'LAB');

  return (
    <section id="work" className="section section--work">
      <div className="container">
        <div className="section-head section-head--row">
          <div>
            <Eyebrow num="04">Selected work</Eyebrow>
            <Reveal>
              <h2 className="h2">Outcomes, not just<br />pretty screenshots.</h2>
            </Reveal>
          </div>
          <Reveal delay={120}>
            <p className="section-sub">
              Three hero projects below — plus a few side bets we built to scratch our own
              itches. Click in for the full story on each.
            </p>
          </Reveal>
        </div>

        <div className="cases-hero">
          {hero.map((c, i) => (
            <Reveal key={c.slug} delay={i * 80}>
              <CaseHeroCard c={c} span />
            </Reveal>
          ))}
        </div>

        <div className="cases-divider">
          <div className="cases-divider-line" />
          <div className="mono dim">LAB · in-house experiments</div>
          <div className="cases-divider-line" />
        </div>

        <div className="cases-lab">
          {lab.map((c, i) => (
            <Reveal key={c.slug} delay={i * 80}>
              <CaseLabCard c={c} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// "Worked with teams from" logo strip — text-set logos to avoid faking brand assets
// ─────────────────────────────────────────────────────────────────────────
function LogoStrip() {
  // Using mono text "logos" — honest, on-brand for a tech studio,
  // and avoids reproducing trademarked logo art. Each gets a tiny mark
  // so the row has visual rhythm.
  const teams = [
    { name: 'MTN',           note: 'Telco' },
    { name: 'Agile Routes',  note: 'Dev house' },
    { name: 'BST Solutions', note: 'Consulting' },
    { name: 'Univ. Pretoria',note: 'Higher ed' },
    { name: 'Wits · SCIS',   note: 'Research' },
    { name: 'Aucor Property',note: 'Auctions' },
  ];
  return (
    <section className="section section--logos" aria-label="Teams we've worked with">
      <div className="container">
        <Reveal>
          <div className="logos-head">
            <span className="mono dim">Worked with teams from</span>
            <span className="logos-rule" />
          </div>
        </Reveal>
        <div className="logos-row">
          {teams.map((t, i) => (
            <Reveal key={t.name} delay={i * 50}>
              <div className="logo">
                <span className="logo-mark">
                  <span className="logo-mark-dot" />
                </span>
                <span className="logo-name">{t.name}</span>
                <span className="mono dim logo-note">{t.note}</span>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal delay={200}>
          <div className="logos-foot mono dim">
            Direct clients, current studios, and past employers — no claim of endorsement.
          </div>
        </Reveal>
      </div>
    </section>
  );
}

Object.assign(window, {
  CASE_STUDIES, CaseArt, CaseHeroCard, CaseLabCard, Work, LogoStrip,
});
