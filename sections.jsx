// sections.jsx — Vanta Studio homepage sections

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
      <div className="nav-inner">
        <a href="#top" className="brand" aria-label="Vanta Studio home">
          <span className="brand-wordmark" aria-hidden="true" />
        </a>
        <nav className="nav-links" aria-label="Primary">
          <a href="#work">Work</a>
          <a href="#services">Services</a>
          <a href="#process">Process</a>
          <a href="#offers">Pricing</a>
          <a href="#faq">FAQs</a>
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
// HERO — text-led opening and scroll-linked website reveal
// ─────────────────────────────────────────────────────────────────────────

function Hero({ accent }) {
  return <section id="top" className="hero">
    <div className="hero-inner">
      <div className="hero-text">
        <Eyebrow>Product design for development teams</Eyebrow>
        <h1 className="display">A clickable prototype <span className="hero-value">in one week.</span></h1>
        <p className="lede">We design digital products for dev houses and product teams. An AI-powered workflow gets your developers a lifelike prototype in days, not months, so questions are answered before anyone writes production code.</p>
        <div className="hero-cta">
          <a href="#contact" className="btn btn--accent btn--lg">Book a discovery call</a>
          <a href="#process" className="btn btn--ghost btn--lg">See the Product Blueprint</a>
        </div>
        <p className="hero-promise">Design only, done properly. The Product Blueprint from <strong style={{whiteSpace: 'nowrap'}}>R60 000.</strong></p>
      </div>

    </div>
    <WebsiteReveal />
  </section>;
}

function Services() {
  const items = [
    ['Speed without shortcuts', 'AI handles the repetitive work: research scans, layout options, prototype builds. Our time goes into the decisions that matter.'],
    ['A prototype your devs can use', 'A lifelike, clickable prototype that covers every scenario, ready to share with your developers in week one.'],
    ['Fewer surprises in the build', 'Questions get answered in the prototype, not halfway through a sprint. Less rework, faster builds.'],
    ['Design only, under your brand', 'We focus on the design so your team can focus on building. White-label work welcome.'],
  ];
  return <section id="services" className="section"><div className="container">
    <div className="section-head section-head--row"><div><Eyebrow>Why work with us</Eyebrow><h2 className="h2">Faster design.<br />Clearer builds.</h2></div><p className="section-sub">Every project runs through the same five steps, sped up with AI and automation at each one. You work directly with Tawanda.</p></div>
    <div className="svc-grid">{items.map(([title, body], i) => <article className="svc" key={title}><div className="mono dim">0{i+1}</div><h3 className="svc-t">{title}</h3><p className="svc-d">{body}</p></article>)}</div>
  </div></section>;
}

function Process() {
  const steps = [
    ['Discovery', 'A kickoff on what you are building, why now, the business goal and what success looks like.', 'A one-page brief you sign off.'],
    ['Research', 'A competitor scan, gap analysis and review of your metrics, sped up with AI research tools.', '3 to 5 focus areas for the solution.'],
    ['Wireframes and flows', 'Many lo-fi ideas explored and critiqued quickly, plus the key user flows.', '2 to 3 directions. You pick one.'],
    ['Prototype', 'An AI-built, lifelike prototype your team and developers can click through end to end.', 'A working prototype in week one.'],
    ['Final design and handover', 'Up to three rounds of iteration, the final Figma design and annotated screens.', 'A build-ready handover pack.'],
  ];
  return <section id="process" className="section"><div className="container">
    <div className="section-head"><Eyebrow>The Product Blueprint</Eyebrow><h2 className="h2">Five steps from brief to build-ready.</h2></div>
    <ol className="simple-process simple-process--five">{steps.map(([title, body, out], i) => <li key={title}><span className="mono dim">0{i+1}</span><h3>{title}</h3><p>{body}</p><p className="process-out"><strong>You get:</strong> {out}</p></li>)}</ol>
  </div></section>;
}

function Offers({ accent }) {
  const pkg = {
    t: 'The Product Blueprint',
    price: 'From R60 000',
    d: 'One fixed scope and price for a new product, feature or redesign.',
    lines: ['Discovery brief and research focus areas', 'Wireframes, user flows and an agreed direction', 'A clickable prototype in one week', 'Up to three rounds of design iteration', 'Final Figma design with annotations', 'A handover pack for your developers'],
  };
  const addons = {
    t: 'Add-ons',
    d: 'Priced separately and agreed in your written scope.',
    lines: ['User interviews during research', 'A starter style guide, palette and type system for products without one'],
  };
  const waLink = 'https://wa.me/27731602194?text=' + encodeURIComponent("Hi Tawanda, I'd like to talk about the Product Blueprint for a project.");
  const tick = (featured) => (
    <span className="offer-tick" style={{ color: featured ? 'var(--accent-ink)' : 'var(--fg-2)' }}>
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path d="M2.5 6.5L5 9L9.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
  return (
    <section id="offers" className="section section--offers">
      <div className="container">
        <div className="section-head section-head--row">
          <div>
            <Eyebrow>Pricing</Eyebrow>
            <Reveal>
              <h2 className="h2">One process.<br />One clear price.</h2>
            </Reveal>
          </div>
          <Reveal delay={120}>
            <p className="section-sub">
              The scope, price and review points are agreed before work starts,
              and every step ends with a deliverable you sign off.
            </p>
          </Reveal>
        </div>
        <div className="offers-grid offers-grid--two">
          <Reveal>
            <article className="offer offer--featured" style={{ ['--accent']: accent }} aria-labelledby="offer-product-blueprint">
              <div className="offer-flag mono">Fixed scope</div>
              <div className="offer-head">
                <h3 className="offer-t" id="offer-product-blueprint">{pkg.t}</h3>
              </div>
              <p className="offer-price">{pkg.price}<span className="mono dim">per project</span></p>
              <p className="offer-d">{pkg.d}</p>
              <ul className="offer-list">{pkg.lines.map((l) => <li key={l}>{tick(true)}{l}</li>)}</ul>
              <a href={waLink} target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp about the Product Blueprint" className="offer-cta offer-cta--accent">
                Talk about your project
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M3 9L9 3M9 3H4M9 3V8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            </article>
          </Reveal>
          <Reveal delay={80}>
            <article className="offer" aria-labelledby="offer-addons">
              <div className="offer-head">
                <h3 className="offer-t" id="offer-addons">{addons.t}</h3>
              </div>
              <p className="offer-d">{addons.d}</p>
              <ul className="offer-list">{addons.lines.map((l) => <li key={l}>{tick(false)}{l}</li>)}</ul>
            </article>
          </Reveal>
        </div>
        <div className="offers-details">
          <p>Design only. We hand over a build-ready Figma file and prototype; your team builds the product. Prices exclude any third-party tool or licence fees, which are listed in your written scope.</p>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// THINKING (insights/blog)
// ─────────────────────────────────────────────────────────────────────────
function FAQ() {
  const questions = [
    ['How can you get a prototype ready in a week?', 'AI and automation take care of the repetitive work in research, layout exploration and prototype building. That frees our time for the design decisions, and you see a working prototype in week one.'],
    ['Does AI replace the design thinking?', 'No. AI speeds up the work. Every direction, decision and final screen is reviewed and designed by us.'],
    ['Do you build the product too?', 'No. We focus on design and hand over a build-ready Figma file, prototype and annotations. Your developers build it.'],
    ['Can you work under our brand?', 'Yes. White-label work is welcome. We agree on communication and handover before we start.'],
    ['How much does it cost?', 'The Product Blueprint starts at R60 000 per project. We agree on the scope, price and timing before work starts.'],
    ['What if we don’t have a style guide?', 'We can create a starter style guide as an add-on, with a palette and type system for your product.'],
  ];
  return <section id="faq" className="section"><div className="container faq-layout"><div><Eyebrow>Good questions</Eyebrow><h2 className="h2">Before you<br />get started.</h2></div><div>{questions.map(([q,a]) => <details className="faq-item" key={q}><summary>{q}</summary><p>{a}</p></details>)}</div></div></section>;
}

// ─────────────────────────────────────────────────────────────────────────
// FINAL CTA
// ─────────────────────────────────────────────────────────────────────────
function CallbackForm({ accent }) {
  const [values, setValues] = useState({ name: '', company: '', phone: '', note: '', company_url: '' });
  const [status, setStatus] = useState('idle'); // idle | submitting | success | error
  const [error, setError] = useState('');

  const onChange = (e) => setValues((v) => ({ ...v, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    if (status === 'submitting') return;
    setStatus('submitting');
    setError('');
    try {
      const res = await fetch('/api/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Couldn't send that. Please try again.");
      setStatus('success');
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="cb-done" role="status">
        <span className="cb-done-check" style={{ background: accent }} aria-hidden="true">
          <svg width="14" height="14" viewBox="0 0 12 12" fill="none"><path d="M2.5 6.2L4.8 8.5L9.5 3.5" stroke="var(--on-accent)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </span>
        <div>
          <div className="cb-done-h">Got it. We'll call you back.</div>
          <p className="cb-done-p">Expect a call within one business day. In a hurry? Book a slot above, or email hello@vantastudio.design.</p>
        </div>
      </div>
    );
  }

  return (
    <form className="cb-form" onSubmit={onSubmit} noValidate>
      {/* Honeypot — visually hidden, off-screen; bots fill it, humans don't. */}
      <input
        type="text" name="company_url" tabIndex="-1" autoComplete="off"
        value={values.company_url} onChange={onChange}
        className="cb-hp" aria-hidden="true"
      />
      <div className="cb-row">
        <label className="cb-field">
          <span className="cb-label">Name</span>
          <input name="name" type="text" autoComplete="name" required
            value={values.name} onChange={onChange} placeholder="Jane Doe" />
        </label>
        <label className="cb-field">
          <span className="cb-label">Company <span className="cb-opt">optional</span></span>
          <input name="company" type="text" autoComplete="organization"
            value={values.company} onChange={onChange} placeholder="Acme Inc." />
        </label>
      </div>
      <label className="cb-field">
        <span className="cb-label">Phone</span>
        <input name="phone" type="tel" autoComplete="tel" required inputMode="tel"
          value={values.phone} onChange={onChange} placeholder="+27 …" />
      </label>
      <label className="cb-field">
        <span className="cb-label">What are you building? <span className="cb-opt">optional</span></span>
        <textarea name="note" rows="2"
          value={values.note} onChange={onChange} placeholder="A sentence is plenty." />
      </label>
      {status === 'error' && <p className="cb-error" role="alert">{error}</p>}
      <button type="submit" className="btn btn--accent btn--lg cb-submit"
        style={{ ['--accent']: accent }} disabled={status === 'submitting'}>
        {status === 'submitting' ? 'Sending…' : 'Request a callback'}
        {status !== 'submitting' && (
          <svg width="14" height="14" viewBox="0 0 12 12" fill="none"><path d="M3 9L9 3M9 3H4M9 3V8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
        )}
      </button>
      <p className="cb-consent">We'll only use your number to call you back about your project. Never shared, POPIA-friendly.</p>
    </form>
  );
}

// When the Cal embed is healthy it intercepts the button click (via document
// delegation) and opens the popup — this handler then does nothing. Only if the
// embed script failed to load do we fall back to opening the booking page, so the
// CTA is never a dead end.
function openBookingFallback() {
  if (typeof window !== 'undefined' && (window.__calEmbedFailed || !window.Cal)) {
    window.open('https://cal.com/vanta-labs/discovery-call', '_blank', 'noopener');
  }
}

function CTA({ accent }) {
  return (
    <section id="contact" className="section section--cta">
      <div className="container">
        <div className="cta">
          <div className="cta-grid" aria-hidden="true" />
          <div className="cta-inner">
            <Reveal>
              <Eyebrow>Let's build</Eyebrow>
            </Reveal>
            <Reveal delay={80}>
              <h2 className="cta-h">
                Have a product to design? Let’s see it in a week.
              </h2>
            </Reveal>
            <Reveal delay={180}>
              <p className="cta-sub">
                Tell Tawanda what you are building. We’ll agree on the scope and get your prototype moving.
              </p>
            </Reveal>
            <div className="cta-paths">
              <Reveal delay={240} className="cta-path">
                <div className="mono dim cta-path-tag">Let’s talk</div>
                <h3 className="cta-path-h">Book a discovery call</h3>
                <p className="cta-path-p">Pick a time that suits you. 30 minutes over video, straight onto your calendar.</p>
                <button
                  type="button"
                  onClick={openBookingFallback}
                  data-cal-namespace="discovery-call"
                  data-cal-link="vanta-labs/discovery-call"
                  data-cal-config='{"layout":"month_view"}'
                  className="btn btn--accent btn--lg cta-path-btn"
                  style={{ ['--accent']: accent }}
                >
                  Book a discovery call
                  <svg width="14" height="14" viewBox="0 0 12 12" fill="none"><path d="M3 9L9 3M9 3H4M9 3V8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </button>
              </Reveal>
              <Reveal delay={320} className="cta-path">
                <div className="mono dim cta-path-tag">Leave your details</div>
                <h3 className="cta-path-h">Prefer a callback?</h3>
                <CallbackForm accent={accent} />
              </Reveal>
            </div>
            <Reveal delay={400}>
              <p className="cta-mail-line"><a href="https://wa.me/27731602194" target="_blank" rel="noopener noreferrer">Chat on WhatsApp · +27 73 160 2194</a><br />Or email <a href="mailto:hello@vantastudio.design">hello@vantastudio.design</a></p>
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
          <div className="footer-brand" role="img" aria-label="Vanta Studio">
            <span className="brand-wordmark" aria-hidden="true" />
          </div>
          <div className="footer-cols">
            <div>
              <div className="mono dim foot-h">Studio</div>
              <a href="#work">Work</a>
              <a href="#process">Process</a>
              <a href="#faq">FAQs</a>
            </div>
            <div>
              <div className="mono dim foot-h">Engage</div>
              <a href="#offers">The Product Blueprint</a>
              <a href="#contact">Talk to Tawanda</a>
            </div>
            <div>
              <div className="mono dim foot-h">Contact</div>
              <a href="mailto:hello@vantastudio.design">hello@vantastudio.design</a>
              <a href="https://wa.me/27731602194" target="_blank" rel="noopener noreferrer">Chat on WhatsApp · +27 73 160 2194</a>
              <span>Johannesburg · Cape Town</span>
              <span>Remote, globally</span>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span className="mono dim">© 2026 Vanta Studio · Made in Africa, shipped worldwide.</span>
          <span className="mono dim">
            <span className="status-dot" style={{ background: accent }} />
            Booking new projects
          </span>
        </div>
        <div className="footer-mark" aria-hidden="true">VANTA</div>
      </div>
    </footer>
  );
}

Object.assign(window, {
  Reveal, Tilt, Eyebrow,
  Nav, Hero, Services, Process, Offers, FAQ, CTA, Footer,
});
