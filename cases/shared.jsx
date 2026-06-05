// shared.jsx — shared components for Vanta Labs case study pages

const { useState, useEffect, useRef } = React;

// ── Reveal ────────────────────────────────────────────────────────────────
function Reveal({ children, delay = 0, y = 14, as: Tag = 'div', ...rest }) {
  const ref = useRef(null);
  const [phase, setPhase] = useState('pre');
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf1, raf2, fallback;
    const trigger = () => {
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
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { trigger(); io.unobserve(el); } }),
      { threshold: 0.1, rootMargin: '0px 0px -6% 0px' }
    );
    io.observe(el);
    fallback = setTimeout(trigger, 1500);
    return () => { io.disconnect(); clearTimeout(fallback); cancelAnimationFrame(raf1); cancelAnimationFrame(raf2); };
  }, []);
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
  return <Tag ref={ref} {...rest} style={style}>{children}</Tag>;
}

// ── Tilt ──────────────────────────────────────────────────────────────────
function Tilt({ children, max = 5, className, style }) {
  const ref = useRef(null);
  const onMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(1000px) rotateX(${(-y * max).toFixed(2)}deg) rotateY(${(x * max).toFixed(2)}deg)`;
  };
  const onLeave = () => { if (ref.current) ref.current.style.transform = ''; };
  return (
    <div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave}
         className={className}
         style={{ transition: 'transform 400ms cubic-bezier(.2,.7,.2,1)', ...style }}>
      {children}
    </div>
  );
}

// ── DeviceShot ──────────────────────────────────────────────────────────────
// Real screenshot in a browser frame with a phone mockup overlapping the
// bottom-right corner. Styles (.shot*) live in ../styles.css.
function DeviceShot({ desktop, mobile, url, bg1 = '#0a0a0c', bg2 = '#15151a' }) {
  return (
    <div className="shot" style={{ background: `linear-gradient(160deg, ${bg1}, ${bg2})` }}>
      <div className="shot-browser">
        <div className="shot-bar">
          {['#ff5f57', '#febc2e', '#28c840'].map((c) => (
            <span key={c} className="shot-dot" style={{ background: c }} />
          ))}
          {url && <span className="shot-url">{url}</span>}
        </div>
        <div className="shot-screen">
          <img src={desktop} alt="" loading="lazy" />
        </div>
      </div>
      {mobile && (
        <div className="shot-phone">
          <img src={mobile} alt="" loading="lazy" />
        </div>
      )}
    </div>
  );
}

// ── Eyebrow ───────────────────────────────────────────────────────────────
function Eyebrow({ children, num }) {
  return (
    <div className="eyebrow">
      <span className="eyebrow-dot" />
      {num && <span className="eyebrow-num">{num}</span>}
      <span>{children}</span>
    </div>
  );
}

// ── CaseNav ───────────────────────────────────────────────────────────────
function CaseNav({ accent }) {
  const [scrolled, setScrolled] = useState(false);
  const [dark, setDark] = useState(document.documentElement.getAttribute('data-theme') !== 'light');
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', h, { passive: true });
    h();
    return () => window.removeEventListener('scroll', h);
  }, []);
  const toggleTheme = () => {
    const next = dark ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    setDark(!dark);
  };
  return (
    <header className={'nav ' + (scrolled ? 'nav--scrolled' : '')}>
      <div className="nav-inner" style={{ gridTemplateColumns:'auto 1fr auto auto', gap:'12px' }}>
        <a href="../index.html" className="brand" aria-label="Vanta Labs home">
          <span className="brand-mark"><span className="brand-mark-inner" /></span>
          <span className="brand-name">Vanta<span style={{ opacity: 0.5 }}>/</span>Labs</span>
        </a>
        <nav className="nav-links" aria-label="Primary">
          <a href="../index.html#work">Work</a>
          <a href="../index.html#services">Services</a>
          <a href="../index.html#process">Process</a>
          <a href="../index.html#thinking">Thinking</a>
        </nav>
        <button onClick={toggleTheme} aria-label="Toggle theme" style={{
          width:36, height:36, borderRadius:'50%', border:'1px solid var(--line-2)',
          background:'var(--bg-2)', display:'grid', placeItems:'center', cursor:'pointer',
          color:'var(--fg-3)', flexShrink:0,
          transition:'background .2s, border-color .2s, color .2s'
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
        <a href="../index.html#contact" className="btn btn--accent" style={{ ['--accent']: accent }}>
          Start a project
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path d="M3 9L9 3M9 3H4M9 3V8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
      </div>
    </header>
  );
}

// ── CaseFooter ────────────────────────────────────────────────────────────
function CaseFooter({ accent }) {
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
              <a href="../index.html#work">Work</a>
              <a href="../index.html#process">Process</a>
              <a href="../index.html#thinking">Thinking</a>
            </div>
            <div>
              <div className="mono dim foot-h">Engage</div>
              <a href="../index.html#offers">Sprint Site</a>
              <a href="../index.html#offers">Product Sprint</a>
              <a href="../index.html#offers">Studio On-Call</a>
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

Object.assign(window, { Reveal, Tilt, Eyebrow, CaseNav, CaseFooter, DeviceShot });
