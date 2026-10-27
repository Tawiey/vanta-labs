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
function Nav({ accent, theme, onToggleTheme, audience }) {
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
          <a href="#offers">{audience === 'agencies' ? 'Work with us' : 'Website packages'}</a>
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

function Hero({ accent, audience, onAudienceChange }) {
  const agency = audience === 'agencies';
  return <section id="top" className="hero">
    <div className="container audience-row">
      <div className="audience-switch" role="group" aria-label="Who is the website for?">
        <button type="button" aria-pressed={!agency} onClick={() => onAudienceChange('businesses')}>For businesses</button>
        <button type="button" aria-pressed={agency} onClick={() => onAudienceChange('agencies')}>For agencies</button>
      </div>

    </div>
    <div className="hero-inner">
      <div className="hero-text">
        <Eyebrow>{agency ? 'White-label website design & build' : 'Website design & build · South Africa'}</Eyebrow>
        <h1 className="display">{agency ? <>Your next website project.<br /><span className="hero-value">An extra pair of hands.</span></> : <>A website that makes your business <span className="hero-value">look the part.</span></>}</h1>
        <p className="lede">{agency ? 'We design and build websites for your clients, under your brand. You lead the client relationship. We help you get the work done.' : 'Help customers see what you do, trust your business and get in touch. We write the words, design your website and get it online.'}</p>
        <div className="hero-cta">
          <a href={agency ? '#contact' : '#offers'} className="btn btn--accent btn--lg">{agency ? 'Talk about a project' : 'See website packages'}</a>
          <a href="#work" className="btn btn--ghost btn--lg">See our work</a>
        </div>
        <p className="hero-promise">{agency ? 'Design, build or both. Scope and price agreed before work starts.' : <>One-page websites from R4 500. Four-page Business website: <strong style={{whiteSpace: 'nowrap'}}>R8 500.</strong></>}</p>
      </div>

    </div>
    <WebsiteReveal audience={audience} />
  </section>;
}

function Services({ audience }) {
  const agency = audience === 'agencies';
  const items = agency ? [
    ['Design help', 'Turn your client’s brief into a clear, polished website design.'],
    ['Website builds', 'Bring an approved design to life, on desktop and phone.'],
    ['Content your client can edit', 'Add a content management system when the project needs it.'],
    ['Work under your brand', 'Agree on the scope, review points and handover with your team.'],
  ] : [
    ['Tell your story clearly', 'We write the words from your answers. No blank page to face.'],
    ['Give customers confidence', 'Show your services, your work and the reviews you already have.'],
    ['Make it easy to get in touch', 'Clear call and WhatsApp links help customers take the next step.'],
    ['Get the setup sorted', 'Your domain, hosting and business email, together in one package.'],
  ];
  return <section id="services" className="section"><div className="container">
    <div className="section-head section-head--row"><div><Eyebrow>How we help</Eyebrow><h2 className="h2">{agency ? <>More capacity.<br />Less to juggle.</> : <>You run your business.<br />We’ll handle the website.</>}</h2></div><p className="section-sub">{agency ? 'Bring us in for the part you need help with. You’ll work directly with Tawanda.' : 'You don’t need to know how websites work. Tell us about your business. We’ll take it from there.'}</p></div>
    <div className="svc-grid">{items.map(([title, body], i) => <article className="svc" key={title}><div className="mono dim">0{i+1}</div><h3 className="svc-t">{title}</h3><p className="svc-d">{body}</p></article>)}</div>
  </div></section>;
}

function Process({ audience }) {
  const agency = audience === 'agencies';
  const steps = agency ? [
    ['Share the brief', 'Tell us what your client needs, what’s ready and where you need help.'],
    ['Agree on the work', 'We set the scope, price, review points and timeline together.'],
    ['Review with your team', 'We design and build the agreed work. You guide the client feedback.'],
    ['Hand over', 'We check the site and hand over the agreed files, access and next steps.'],
  ] : [
    ['Tell us about your business', 'Answer a short intake about your services, customers and goals. Send your logo, photos and any reviews you want to use.'],
    ['Book your project', 'Agree on your pages and scope, then pay a 50% deposit. We write the copy from your answers.'],
    ['See your first version', 'For the Business package, your first version is ready within five business days of your cleared deposit. Give us your feedback in two revision rounds.'],
    ['Go live', 'Once you approve the website, pay the balance before launch. We connect your domain and get your site online.'],
  ];
  return <section id="process" className="section"><div className="container">
    <div className="section-head"><Eyebrow>How it works</Eyebrow><h2 className="h2">{agency ? 'A clear plan from brief to handover.' : 'A few simple steps to your new website.'}</h2></div>
    <ol className="simple-process">{steps.map(([title,body], i) => <li key={title}><span className="mono dim">0{i+1}</span><h3>{title}</h3><p>{body}</p></li>)}</ol>
  </div></section>;
}

function Offers({ accent, audience }) {
  if (audience === 'agencies') return <section id="offers" className="section"><div className="container agency-offer">
    <Eyebrow>For agencies</Eyebrow><h2 className="h2">Your brief.<br />A price for the work.</h2>
    <p className="lede">Need a designer, a developer or someone to handle both? Send us the brief. We’ll agree on the work and cost before we start.</p>
    <a className="btn btn--accent btn--lg" href="https://wa.me/27731602194?text=Hi%20Tawanda%2C%20I%27d%20like%20to%20discuss%20a%20white-label%20website%20project." target="_blank" rel="noopener noreferrer">Discuss white-label work ↗</a>
  </div></section>;

  const offers = [
    {
      t: 'Start',
      price: 'R4 500',
      d: 'A focused page to introduce yourself, your work or your business.',
      lines: ['One page, up to six sections', 'Copy written from your answers', 'One business email account', 'WhatsApp and call links'],
      featured: false,
    },
    {
      t: 'Business',
      price: 'R8 500',
      d: 'A clear home for your services, your story and your next enquiry.',
      lines: ['Four agreed pages', 'Copy written from your answers', 'Three business email accounts', 'WhatsApp, call links and an enquiry form', 'Two rounds of changes'],
      featured: true,
    },
    {
      t: 'Grow',
      price: 'R19 000',
      d: 'A website with content you can keep up to date yourself.',
      lines: ['Up to six pages', 'Copy written from your answers', 'Three business email accounts', 'Edit two agreed types of content yourself', 'Up to ten content entries added for you', 'A handover session'],
      featured: false,
    },
  ];
  return (
    <section id="offers" className="section section--offers">
      <div className="container">
        <div className="section-head section-head--row">
          <div>
            <Eyebrow>Website packages</Eyebrow>
            <Reveal>
              <h2 className="h2">Your business, online.<br />One clear price.</h2>
            </Reveal>
          </div>
          <Reveal delay={120}>
            <p className="section-sub">
              Choose the website that fits what you need today. We write the copy
              from your answers, design it and build it for you.
            </p>
          </Reveal>
        </div>
        <div className="offers-grid">
          {offers.map((o, i) => (
            <Reveal key={o.t} delay={i * 80}>
              <article className={'offer ' + (o.featured ? 'offer--featured' : '')} style={{ ['--accent']: accent }} aria-labelledby={'offer-' + o.t.toLowerCase()}>
                {o.featured && <div className="offer-flag mono">Recommended</div>}
                <div className="offer-head">
                  <h3 className="offer-t" id={'offer-' + o.t.toLowerCase()}>{o.t}</h3>
                </div>
                <p className="offer-price">{o.price}<span className="mono dim">once-off</span></p>
                <p className="offer-d">{o.d}</p>
                <ul className="offer-list">
                  {o.lines.map((l) => (
                    <li key={l}>
                      <span className="offer-tick" style={{ color: o.featured ? 'var(--accent-ink)' : 'var(--fg-2)' }}>
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M2.5 6.5L5 9L9.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                      {l}
                    </li>
                  ))}
                </ul>
                <a href={'https://wa.me/27731602194?text=' + encodeURIComponent("Hi Tawanda, I'm interested in the " + o.t + ' website package (' + o.price + ').')} target="_blank" rel="noopener noreferrer" aria-label={'Chat on WhatsApp about the ' + o.t + ' website package'} className={'offer-cta ' + (o.featured ? 'offer-cta--accent' : '')}>
                  Chat about {o.t}
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M3 9L9 3M9 3H4M9 3V8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
              </article>
            </Reveal>
          ))}
        </div>
        <div className="offers-details">
          <p>All packages include mobile-friendly layouts, first-year hosting and domain registration up to R300. Renewal fees apply after year one. Prices are the total initial package cost; no VAT is added.</p>
          <p><strong>Business: a first version in five business days after your deposit.</strong> Complete the intake before paying the 50% deposit. Review your first version, then use your two rounds of changes. The balance is payable before launch.</p>
          <p>Online shops, booking systems, quoting and invoicing setup, and custom integrations are scoped separately. Any content system or platform licence fees are listed in your written scope.</p>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// THINKING (insights/blog)
// ─────────────────────────────────────────────────────────────────────────
function FAQ({ audience }) {
  const agency = audience === 'agencies';
  const questions = agency ? [
    ['Can you work under our brand?', 'Yes. White-label work is the main agency service. We agree on communication and handover before we start.'],
    ['Can you build a design we already have?', 'Yes. Share the design and brief so we can check the work and give you a price.'],
    ['How much does it cost?', 'Agency projects are priced to the brief. We agree on the scope, price and timing before work starts.'],
  ] : [
    ['Do I need to write the website copy?', 'No. We write it from your intake answers. You check it for accuracy before launch.'],
    ['What is included in R8 500?', 'Four agreed pages, copywriting, three business email accounts, mobile-friendly design, WhatsApp and call links, an enquiry form and two revision rounds. First-year hosting and domain registration up to R300 are included. No VAT is added.'],
    ['Will my website be live in five days?', 'The Business package’s first version is ready within five business days of your cleared deposit. Complete your intake before paying. Launch follows your feedback, approval and final payment.'],
    ['What happens after the first year?', 'Hosting, email and domain renewal fees apply after the included year. We confirm these costs with you before you commit to the project.'],
    ['Can I change the pages?', 'Yes. Agree on the four pages you need before work starts. Home, About, Services and Contact are a useful starting point.'],
    ['What if I need a shop or booking system?', 'We price online shops, booking systems, quoting and invoicing setup separately. Tell us what you need and we’ll include it in your written scope.'],
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
          <div className="cb-done-h">Got it — we'll call you back.</div>
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
        <span className="cb-label">What does your business need? <span className="cb-opt">optional</span></span>
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
      <p className="cb-consent">We'll only use your number to call you back about your project — never shared, POPIA-friendly.</p>
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

function CTA({ accent, audience }) {
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
                {audience === 'agencies' ? 'Let’s talk about your next client project.' : 'Ready for a website you’re proud to share?'}
              </h2>
            </Reveal>
            <Reveal delay={180}>
              <p className="cta-sub">
                Talk to Tawanda about what you need. We’ll help you find the right next step.
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
function Footer({ accent, audience }) {
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
              <a href="#offers">{audience === 'agencies' ? 'White-label websites' : 'Website packages'}</a>
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
