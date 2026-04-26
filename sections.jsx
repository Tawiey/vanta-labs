// sections.jsx — Vanta Labs homepage sections

const { useState, useEffect, useRef, useCallback } = React;

// ── Reveal: simple intersection-observer fade/slide on scroll ──────────────
function Reveal({ children, delay = 0, y = 14, as: Tag = 'div', ...rest }) {
  const ref = useRef(null);
  // 'pre' = initial offset, no transition; 'transit' = transition armed, animating to final; 'done' = final.
  const [phase, setPhase] = useState('pre');
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf1, raf2, fallback;
    const trigger = () => {
      // Two RAFs: paint the 'pre' state first, then on the NEXT frame attach
      // the transition + final values so the browser sees a real "from → to"
      // and runs the animation.
      raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => setPhase('transit'));
      });
    };
    const r = el.getBoundingClientRect();
    if (r.top < (window.innerHeight || 0) * 0.95) {
      trigger();
      return () => { cancelAnimationFrame(raf1); cancelAnimationFrame(raf2); };
    }
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) {
          trigger();
          io.unobserve(el);
        }
      }),
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );
    io.observe(el);
    fallback = setTimeout(trigger, 1500);
    return () => {
      io.disconnect();
      clearTimeout(fallback);
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, []);

  const isFinal = phase === 'transit';
  const style = { ...(rest.style || {}) };
  if (phase === 'pre') {
    style.opacity = 0;
    style.transform = `translateY(${y}px)`;
    style.willChange = 'opacity, transform';
  } else {
    style.opacity = 1;
    style.transform = 'translateY(0)';
    style.transition = `opacity 700ms cubic-bezier(.2,.7,.2,1) ${delay}ms, transform 800ms cubic-bezier(.2,.7,.2,1) ${delay}ms`;
    style.willChange = 'opacity, transform';
  }
  return (
    <Tag ref={ref} {...rest} style={style}>
      {children}
    </Tag>
  );
}

// ── Tilt: subtle 3D tilt on hover ──────────────────────────────────────────
function Tilt({ children, max = 6, scale = 1.0, className, style }) {
  const ref = useRef(null);
  const onMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(900px) rotateX(${(-y * max).toFixed(2)}deg) rotateY(${(x * max).toFixed(2)}deg) scale(${scale})`;
  };
  const onLeave = () => {
    if (ref.current) ref.current.style.transform = '';
  };
  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={className}
      style={{ transition: 'transform 400ms cubic-bezier(.2,.7,.2,1)', ...style }}
    >
      {children}
    </div>
  );
}

// ── Mono pill ─────────────────────────────────────────────────────────────
function Eyebrow({ children, num }) {
  return (
    <div className="eyebrow">
      <span className="eyebrow-dot" />
      {num && <span className="eyebrow-num">{num}</span>}
      <span>{children}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// NAV
// ─────────────────────────────────────────────────────────────────────────
function Nav({ accent, theme, onToggleTheme }) {
  const [scrolled, setScrolled] = useState(false);
  const dark = theme !== 'light';
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', h, { passive: true });
    h();
    return () => window.removeEventListener('scroll', h);
  }, []);
  return (
    <header className={'nav ' + (scrolled ? 'nav--scrolled' : '')}>
      <div className="nav-inner" style={{ gridTemplateColumns:'auto 1fr auto auto', gap:'12px' }}>
        <a href="#top" className="brand" aria-label="Vanta Labs home">
          <span className="brand-mark">
            <span className="brand-mark-inner" />
          </span>
          <span className="brand-name">Vanta<span style={{ opacity: 0.5 }}>/</span>Labs</span>
        </a>
        <nav className="nav-links" aria-label="Primary">
          <a href="#work">Work</a>
          <a href="#services">Services</a>
          <a href="#process">Process</a>
          <a href="#thinking">Thinking</a>
        </nav>
        <button onClick={onToggleTheme} aria-label="Toggle theme" style={{
          width:36, height:36, borderRadius:'50%', border:'1px solid var(--line-2)',
          background:'var(--bg-2)', display:'grid', placeItems:'center', cursor:'pointer',
          color:'var(--fg-3)', flexShrink:0, transition:'background .2s, border-color .2s'
        }}>
          {dark ? (
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.3"/>
              <path d="M8 1.5V2.5M8 13.5V14.5M1.5 8H2.5M13.5 8H14.5M3.4 3.4l.7.7M11.9 11.9l.7.7M11.9 3.4l-.7.7M4.1 11.9l-.7.7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
          ) : (
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
              <path d="M13.5 9.5A5.5 5.5 0 016.5 2.5a5.5 5.5 0 100 11 5.5 5.5 0 007-4z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
            </svg>
          )}
        </button>
        <a href="#contact" className="btn btn--accent" style={{ ['--accent']: accent }}>
          Start a project
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path d="M3 9L9 3M9 3H4M9 3V8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
      </div>
    </header>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// HERO — three variants
// ─────────────────────────────────────────────────────────────────────────

// Variant A: orbiting grid with cursor-aware highlight
function HeroOrbit({ accent }) {
  const ref = useRef(null);
  const [pos, setPos] = useState({ x: 0.5, y: 0.5 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const move = (e) => {
      const r = el.getBoundingClientRect();
      setPos({ x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height });
    };
    el.addEventListener('mousemove', move);
    return () => el.removeEventListener('mousemove', move);
  }, []);

  return (
    <div className="hero-visual hero-visual--orbit" ref={ref}>
      <div
        className="hero-grid"
        style={{
          ['--mx']: `${pos.x * 100}%`,
          ['--my']: `${pos.y * 100}%`,
          ['--accent']: accent,
        }}
      />
      <div className="hero-rings" style={{ ['--accent']: accent }}>
        <span className="hero-ring hero-ring--1" />
        <span className="hero-ring hero-ring--2" />
        <span className="hero-ring hero-ring--3" />
        <span className="hero-core" />
        <span className="hero-orbit-dot hero-orbit-dot--a" />
        <span className="hero-orbit-dot hero-orbit-dot--b" />
        <span className="hero-orbit-dot hero-orbit-dot--c" />
      </div>
      <div className="hero-coords">
        <span>LAT 26.2041° S</span>
        <span>LNG 28.0473° E</span>
        <span>JHB · CPT · REMOTE</span>
      </div>
    </div>
  );
}

// Variant B: animated terminal "shipping" log
function HeroTerminal({ accent }) {
  const lines = [
    { t: 'init', s: 'vanta init "fintech onboarding"', tone: 'cmd' },
    { t: '01', s: '◇ research · 4 user interviews synthesized', tone: 'ok' },
    { t: '02', s: '◇ wireframes · 12 screens, 3 flows', tone: 'ok' },
    { t: '03', s: '◇ ui · figma → tokens → tailwind', tone: 'ok' },
    { t: '04', s: '◇ build · next.js, postgres, stripe', tone: 'ok' },
    { t: '05', s: '◆ shipped in 18 days', tone: 'accent' },
    { t: '→', s: 'conversion +37% · activation +52%', tone: 'dim' },
  ];
  const [n, setN] = useState(0);
  useEffect(() => {
    if (n >= lines.length) {
      const r = setTimeout(() => setN(0), 3200);
      return () => clearTimeout(r);
    }
    const t = setTimeout(() => setN((v) => v + 1), n === 0 ? 600 : 520);
    return () => clearTimeout(t);
  }, [n]);

  return (
    <div className="hero-visual hero-visual--term" style={{ ['--accent']: accent }}>
      <div className="term">
        <div className="term-bar">
          <span className="term-dot" />
          <span className="term-dot" />
          <span className="term-dot" />
          <span className="term-title">~/vanta · ship.log</span>
        </div>
        <div className="term-body">
          {lines.slice(0, n).map((l, i) => (
            <div key={i} className={'term-line term-line--' + l.tone}>
              <span className="term-t">{l.t}</span>
              <span className="term-s">{l.s}</span>
            </div>
          ))}
          {n < lines.length && <span className="term-cursor" />}
        </div>
      </div>
    </div>
  );
}

// Variant C: black square (vanta) that animates light through it
function HeroVanta({ accent }) {
  const ref = useRef(null);
  const [hover, setHover] = useState(false);
  return (
    <div
      className="hero-visual hero-visual--vanta"
      ref={ref}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ ['--accent']: accent }}
    >
      <div className={'vanta-cube ' + (hover ? 'is-lit' : '')}>
        <div className="vanta-face vanta-face--front" />
        <div className="vanta-face vanta-face--top" />
        <div className="vanta-face vanta-face--side" />
        <div className="vanta-glow" />
        <div className="vanta-scan" />
      </div>
      <div className="vanta-caption">
        <span className="mono dim">// the darker the canvas,</span>
        <br />
        <span className="mono">the brighter the work.</span>
      </div>
    </div>
  );
}

function Hero({ accent, variant }) {
  return (
    <section id="top" className="hero">
      <div className="hero-inner">
        <div className="hero-text">
          <Reveal delay={40}>
            <Eyebrow num="01">Studio · est. 2024 · made in Africa</Eyebrow>
          </Reveal>
          <Reveal delay={120}>
            <h1 className="display">
              We build websites <span className="display-em">that out-ship</span> your roadmap<span className="display-accent-dot" style={{ color: 'var(--accent)' }}>.</span>
            </h1>
          </Reveal>
          <Reveal delay={220}>
            <p className="lede">
              Vanta Labs is a small studio of product thinkers, designers and engineers.
              We turn fuzzy ideas into premium, conversion-ready products — in weeks,
              not quarters. AI in the loop, taste at the wheel.
            </p>
          </Reveal>
          <Reveal delay={320}>
            <div className="hero-cta">
              <a href="#contact" className="btn btn--accent btn--lg" style={{ ['--accent']: accent }}>
                Start a project
                <svg width="14" height="14" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                  <path d="M3 9L9 3M9 3H4M9 3V8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
              <a href="#work" className="btn btn--ghost btn--lg">See selected work</a>
            </div>
          </Reveal>
          <Reveal delay={420}>
            <div className="hero-meta">
              <div>
                <div className="mono dim">AVG. SHIP TIME</div>
                <div className="meta-num">18 <span className="meta-unit">days</span></div>
              </div>
              <div>
                <div className="mono dim">CLIENTS '24–'26</div>
                <div className="meta-num">42</div>
              </div>
              <div>
                <div className="mono dim">AVG. CONV. LIFT</div>
                <div className="meta-num">+34<span className="meta-unit">%</span></div>
              </div>
            </div>
          </Reveal>
        </div>
        <Reveal delay={200} className="hero-visual-wrap">
          {variant === 'orbit' && <HeroOrbit accent={accent} />}
          {variant === 'terminal' && <HeroTerminal accent={accent} />}
          {variant === 'vanta' && <HeroVanta accent={accent} />}
        </Reveal>
      </div>
      <div className="hero-marquee" aria-hidden="true">
        <div className="marquee-track">
          {Array.from({ length: 2 }).map((_, k) => (
            <div className="marquee-row" key={k}>
              {['Stripe-grade polish', 'Linear-fast iteration', 'Apple-level taste', 'Notion-level clarity', 'Vercel-fast performance', 'Figma-tight design', 'Stripe-grade polish', 'Linear-fast iteration'].map((t, i) => (
                <span key={i} className="marquee-item">
                  <span className="marquee-dot" style={{ background: accent }} />
                  {t}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// INSIGHTS / CREDIBILITY
// ─────────────────────────────────────────────────────────────────────────
function Insights({ accent }) {
  const stats = [
    { k: '70%', l: 'of B2B sites lose users in the first 5 seconds', src: 'NN/g, 2024' },
    { k: '6×', l: 'longer to ship a "real" site than founders estimate', src: 'Vanta intake data' },
    { k: '0.4s', l: 'every extra page-load second drops conversions ~7%', src: 'Akamai' },
    { k: '$0', l: 'value of a beautiful site nobody can find or use', src: '— obviously' },
  ];
  return (
    <section className="section section--insights">
      <div className="container">
        <div className="section-head">
          <Eyebrow num="02">The honest part</Eyebrow>
          <Reveal>
            <h2 className="h2">
              Most websites are quietly losing<br />
              the deal before the pitch starts.
            </h2>
          </Reveal>
        </div>
        <div className="stats-grid">
          {stats.map((s, i) => (
            <Reveal key={i} delay={i * 80}>
              <div className="stat">
                <div className="stat-k" style={{ color: accent }}>{s.k}</div>
                <div className="stat-l">{s.l}</div>
                <div className="mono dim stat-src">{s.src}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// SERVICES — "What we do"
// ─────────────────────────────────────────────────────────────────────────
function Services({ accent }) {
  const items = [
    {
      n: '01',
      t: 'Product thinking',
      d: 'We start with the business — the metric you need moved, the user you need to win — then design backwards from there.',
      tags: ['Discovery', 'Strategy', 'Positioning'],
    },
    {
      n: '02',
      t: 'UI / UX design',
      d: 'High-fidelity, system-driven design that looks like the brand you wish you had — and survives contact with engineering.',
      tags: ['UX', 'UI', 'Design systems'],
    },
    {
      n: '03',
      t: 'Modern engineering',
      d: 'Next.js, TypeScript, Postgres, edge — built for real-world performance, SEO and Core Web Vitals, not just screenshots.',
      tags: ['Web', 'Web apps', 'CMS'],
    },
    {
      n: '04',
      t: 'AI-assisted velocity',
      d: 'We use AI in the loop — research, copy, code — to compress weeks into days. You get the speed; we keep the taste.',
      tags: ['Prototyping', 'Automation', 'Copy'],
    },
  ];
  return (
    <section id="services" className="section section--services">
      <div className="container">
        <div className="section-head section-head--row">
          <div>
            <Eyebrow num="03">What we do</Eyebrow>
            <Reveal>
              <h2 className="h2">Four disciplines.<br />One small, sharp team.</h2>
            </Reveal>
          </div>
          <Reveal delay={120}>
            <p className="section-sub">
              No account managers, no slide-deck theatre. You talk to the people doing
              the work — usually before lunch.
            </p>
          </Reveal>
        </div>
        <div className="svc-grid">
          {items.map((it, i) => (
            <Reveal key={it.n} delay={i * 60}>
              <div className="svc">
                <div className="svc-head">
                  <span className="mono dim">{it.n}</span>
                  <span className="svc-arrow" style={{ color: accent }}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M4 12L12 4M12 4H6M12 4V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </div>
                <h3 className="svc-t">{it.t}</h3>
                <p className="svc-d">{it.d}</p>
                <div className="svc-tags">
                  {it.tags.map((t) => <span key={t} className="tag">{t}</span>)}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// WORK — asymmetric grid
// ─────────────────────────────────────────────────────────────────────────
function WorkCard({ p, span, accent }) {
  return (
    <Tilt max={4} className={'work-card ' + (span ? 'work-card--wide' : '')}>
      <div className="work-card-inner">
        <div className="work-thumb" style={{ background: p.bg }}>
          <div className="work-thumb-grid" />
          <div className="work-thumb-tag mono">{p.kind}</div>
          <div className="work-thumb-art" aria-hidden="true">
            {p.art}
          </div>
        </div>
        <div className="work-meta">
          <div className="work-meta-l">
            <div className="work-name">{p.name}</div>
            <div className="mono dim work-cat">{p.cat}</div>
          </div>
          <div className="work-meta-r">
            <span className="work-stat" style={{ color: accent }}>{p.stat}</span>
            <span className="mono dim">{p.statL}</span>
          </div>
        </div>
      </div>
    </Tilt>
  );
}

function Work({ accent }) {
  const projects = [
    {
      name: 'Kola Pay',
      cat: 'Fintech · Onboarding flow',
      kind: 'WEB APP',
      stat: '+52%',
      statL: 'activation',
      bg: 'linear-gradient(135deg, #14110e 0%, #221d17 100%)',
      art: (
        <div className="art-stack">
          <div className="art-card art-card--1" />
          <div className="art-card art-card--2" />
          <div className="art-card art-card--3" />
        </div>
      ),
    },
    {
      name: 'Hectare',
      cat: 'Agritech · Marketing site',
      kind: 'WEBSITE',
      stat: '14d',
      statL: 'idea → live',
      bg: 'linear-gradient(140deg, #0e1411 0%, #1a221c 100%)',
      art: (
        <div className="art-globe">
          <div className="art-globe-ring" />
          <div className="art-globe-ring art-globe-ring--2" />
          <div className="art-globe-dot" />
        </div>
      ),
    },
    {
      name: 'Quill OS',
      cat: 'AI writing tool · Brand & web',
      kind: 'PRODUCT',
      stat: '4.8★',
      statL: 'PH launch',
      bg: 'linear-gradient(150deg, #14110e 0%, #1f1814 100%)',
      art: (
        <div className="art-doc">
          <div className="art-doc-line" style={{ width: '70%' }} />
          <div className="art-doc-line" style={{ width: '90%' }} />
          <div className="art-doc-line" style={{ width: '55%' }} />
          <div className="art-doc-line art-doc-line--accent" style={{ width: '40%' }} />
        </div>
      ),
    },
    {
      name: 'North Coast',
      cat: 'D2C apparel · Storefront',
      kind: 'E-COMMERCE',
      stat: '+38%',
      statL: 'AOV',
      bg: 'linear-gradient(135deg, #11110e 0%, #1d1d18 100%)',
      art: (
        <div className="art-tag">
          <div className="art-tag-row" />
          <div className="art-tag-row art-tag-row--2" />
          <div className="art-tag-px" />
        </div>
      ),
    },
    {
      name: 'Mosaic Health',
      cat: 'Healthtech · Patient portal',
      kind: 'WEB APP',
      stat: '−61%',
      statL: 'support tickets',
      bg: 'linear-gradient(140deg, #0e1213 0%, #181f20 100%)',
      art: (
        <div className="art-pulse">
          <svg viewBox="0 0 200 60" preserveAspectRatio="none" width="100%" height="100%">
            <path d="M0,30 L40,30 L50,12 L62,48 L74,18 L86,42 L98,30 L200,30" fill="none" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </div>
      ),
    },
  ];

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
            <a href="#contact" className="link-arrow">
              View the full archive
              <svg width="14" height="14" viewBox="0 0 12 12" fill="none">
                <path d="M3 9L9 3M9 3H4M9 3V8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </Reveal>
        </div>
        <div className="work-grid">
          <Reveal className="work-cell work-cell--a"><WorkCard p={projects[0]} accent={accent} span /></Reveal>
          <Reveal delay={80} className="work-cell work-cell--b"><WorkCard p={projects[1]} accent={accent} /></Reveal>
          <Reveal delay={120} className="work-cell work-cell--c"><WorkCard p={projects[2]} accent={accent} /></Reveal>
          <Reveal delay={160} className="work-cell work-cell--d"><WorkCard p={projects[3]} accent={accent} /></Reveal>
          <Reveal delay={200} className="work-cell work-cell--e"><WorkCard p={projects[4]} accent={accent} span /></Reveal>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// PROCESS
// ─────────────────────────────────────────────────────────────────────────
function Process({ accent }) {
  const steps = [
    { n: '01', d: 'Day 0', t: 'Intake', b: 'A 30-minute call. We ask the awkward questions. You leave with a one-page brief.' },
    { n: '02', d: 'Day 1–3', t: 'Shape', b: 'Sitemap, content outline, design tokens. We agree on the bet before pixels move.' },
    { n: '03', d: 'Day 4–10', t: 'Design', b: 'Hi-fi screens in Figma, plus a clickable prototype. Tight loop, daily Looms.' },
    { n: '04', d: 'Day 11–17', t: 'Build', b: 'Production code from day one. Next.js, type-safe, content-managed, observable.' },
    { n: '05', d: 'Day 18+', t: 'Ship & evolve', b: 'Launch, measure, iterate. Optional retainer for ongoing growth and care.' },
  ];
  return (
    <section id="process" className="section section--process">
      <div className="container">
        <div className="section-head">
          <Eyebrow num="05">How we work</Eyebrow>
          <Reveal>
            <h2 className="h2">From "fuzzy idea" to live<br />in around 18 days.</h2>
          </Reveal>
        </div>
        <ol className="process">
          {steps.map((s, i) => (
            <Reveal key={s.n} delay={i * 70}>
              <li className="proc">
                <div className="proc-rail">
                  <span className="proc-num mono">{s.n}</span>
                  <span className="proc-line" style={{ background: i === steps.length - 1 ? 'transparent' : 'var(--line)' }} />
                </div>
                <div className="proc-body">
                  <div className="proc-day mono dim">{s.d}</div>
                  <h3 className="proc-t">
                    {s.t}
                    {i === steps.length - 1 && <span className="proc-dot" style={{ background: accent }} />}
                  </h3>
                  <p className="proc-b">{s.b}</p>
                </div>
              </li>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// OFFERS — pricing-style cards (no $$ — engagement types)
// ─────────────────────────────────────────────────────────────────────────
function Offers({ accent }) {
  const offers = [
    {
      t: 'Sprint Site',
      d: 'A premium marketing site, end-to-end.',
      time: '2–3 weeks',
      lines: ['Up to 8 unique pages', 'Design system + tokens', 'CMS-ready', 'Analytics & SEO baseline'],
      cta: 'Most teams start here',
      featured: false,
    },
    {
      t: 'Product Sprint',
      d: 'A production MVP your team can keep building on.',
      time: '4–6 weeks',
      lines: ['Discovery + product strategy', 'UX, UI & design system', 'Full-stack build (Next.js + DB)', 'Auth, payments, dashboards'],
      cta: 'Idea → real product',
      featured: true,
    },
    {
      t: 'Studio On-Call',
      d: 'A senior pod, on retainer, in your Slack.',
      time: 'Monthly',
      lines: ['Designer + engineer pod', 'Async + 2 weekly syncs', 'Roadmap + experimentation', 'Cancel any time'],
      cta: 'Ongoing partner',
      featured: false,
    },
  ];
  return (
    <section id="offers" className="section section--offers">
      <div className="container">
        <div className="section-head section-head--row">
          <div>
            <Eyebrow num="06">Ways to work with us</Eyebrow>
            <Reveal>
              <h2 className="h2">Three engagements.<br />Pick the one that fits.</h2>
            </Reveal>
          </div>
          <Reveal delay={120}>
            <p className="section-sub">
              Fixed scope, fixed price, fixed dates. The boring stuff is boring on
              purpose — so the work can be exciting.
            </p>
          </Reveal>
        </div>
        <div className="offers-grid">
          {offers.map((o, i) => (
            <Reveal key={o.t} delay={i * 80}>
              <div className={'offer ' + (o.featured ? 'offer--featured' : '')} style={{ ['--accent']: accent }}>
                {o.featured && <div className="offer-flag mono">Most picked</div>}
                <div className="offer-head">
                  <h3 className="offer-t">{o.t}</h3>
                  <div className="mono dim offer-time">{o.time}</div>
                </div>
                <p className="offer-d">{o.d}</p>
                <ul className="offer-list">
                  {o.lines.map((l) => (
                    <li key={l}>
                      <span className="offer-tick" style={{ color: o.featured ? accent : 'var(--fg-2)' }}>
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M2.5 6.5L5 9L9.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                      {l}
                    </li>
                  ))}
                </ul>
                <a href="#contact" className={'offer-cta ' + (o.featured ? 'offer-cta--accent' : '')}>
                  {o.cta}
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M3 9L9 3M9 3H4M9 3V8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// THINKING (insights/blog)
// ─────────────────────────────────────────────────────────────────────────
function Thinking() {
  const posts = [
    { tag: 'Essay', t: 'Taste is a moat — and AI just lowered the wall around it.', d: '6 min read · Apr 2026' },
    { tag: 'Field note', t: 'How we cut a 9-week site build into 14 days (without cutting corners).', d: '4 min read · Mar 2026' },
    { tag: 'Playbook', t: 'A Core Web Vitals checklist that survives the Lighthouse hangover.', d: '8 min read · Feb 2026' },
  ];
  return (
    <section id="thinking" className="section section--thinking">
      <div className="container">
        <div className="section-head section-head--row">
          <div>
            <Eyebrow num="07">Thinking</Eyebrow>
            <Reveal>
              <h2 className="h2">Notes from the studio.</h2>
            </Reveal>
          </div>
          <Reveal delay={120}>
            <a href="#" className="link-arrow">
              All writing
              <svg width="14" height="14" viewBox="0 0 12 12" fill="none">
                <path d="M3 9L9 3M9 3H4M9 3V8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </Reveal>
        </div>
        <div className="think-grid">
          {posts.map((p, i) => (
            <Reveal key={p.t} delay={i * 80}>
              <a href="#" className="think">
                <div className="think-head">
                  <span className="tag">{p.tag}</span>
                  <span className="mono dim">{p.d}</span>
                </div>
                <h3 className="think-t">{p.t}</h3>
                <span className="think-arrow">
                  Read
                  <svg width="14" height="14" viewBox="0 0 12 12" fill="none">
                    <path d="M3 9L9 3M9 3H4M9 3V8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// FINAL CTA
// ─────────────────────────────────────────────────────────────────────────
function CTA({ accent }) {
  return (
    <section id="contact" className="section section--cta">
      <div className="container">
        <div className="cta">
          <div className="cta-grid" aria-hidden="true" />
          <div className="cta-inner">
            <Reveal>
              <Eyebrow num="08">Let's build</Eyebrow>
            </Reveal>
            <Reveal delay={80}>
              <h2 className="cta-h">
                You bring the ambition.<br />
                We'll bring the <span className="cta-accent-em" style={{ color: accent }}>ship date</span>.
              </h2>
            </Reveal>
            <Reveal delay={180}>
              <p className="cta-sub">
                30-minute intake call. Honest scope, honest timeline.
                We pick up two new projects a month — currently booking late May 2026.
              </p>
            </Reveal>
            <Reveal delay={260}>
              <div className="cta-row">
                <a href="mailto:hello@vantalabs.co" className="btn btn--accent btn--lg" style={{ ['--accent']: accent }}>
                  Start a project
                  <svg width="14" height="14" viewBox="0 0 12 12" fill="none"><path d="M3 9L9 3M9 3H4M9 3V8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </a>
                <a href="#" className="btn btn--ghost btn--lg">Book an intake call</a>
                <span className="mono dim cta-mail">hello@vantalabs.co</span>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// FOOTER
// ─────────────────────────────────────────────────────────────────────────
function Footer({ accent }) {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-top">
          <div className="footer-brand">
            <span className="brand-mark"><span className="brand-mark-inner" /></span>
            <span className="brand-name">Vanta<span style={{ opacity: 0.5 }}>/</span>Labs</span>
          </div>
          <div className="footer-cols">
            <div>
              <div className="mono dim foot-h">Studio</div>
              <a href="#work">Work</a>
              <a href="#process">Process</a>
              <a href="#thinking">Thinking</a>
            </div>
            <div>
              <div className="mono dim foot-h">Engage</div>
              <a href="#offers">Sprint Site</a>
              <a href="#offers">Product Sprint</a>
              <a href="#offers">Studio On-Call</a>
            </div>
            <div>
              <div className="mono dim foot-h">Elsewhere</div>
              <a href="#">X / Twitter</a>
              <a href="#">Read.cv</a>
              <a href="#">GitHub</a>
            </div>
            <div>
              <div className="mono dim foot-h">Contact</div>
              <a href="mailto:hello@vantalabs.co">hello@vantalabs.co</a>
              <span>Johannesburg · Cape Town</span>
              <span>Remote, globally</span>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span className="mono dim">© 2026 Vanta Labs · Made in Africa, shipped worldwide.</span>
          <span className="mono dim">
            <span className="status-dot" style={{ background: accent }} />
            Booking · late May 2026
          </span>
        </div>
        <div className="footer-mark" aria-hidden="true">VANTA</div>
      </div>
    </footer>
  );
}

Object.assign(window, {
  Reveal, Tilt, Eyebrow,
  Nav, Hero, Insights, Services, Work, Process, Offers, Thinking, CTA, Footer,
});
