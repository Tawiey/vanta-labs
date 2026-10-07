// testimonials.jsx — homepage "Testimonials" section (CLAUDE.md §10).
//
// Loads published client testimonials from /api/published-testimonials (Notion rows
// with both "Can quote" and "Publish" ticked) and renders them in one of three
// layouts, switchable from the Tweaks panel: 'spotlight' | 'marquee' | 'grid'.
// If there's nothing published (or the API isn't running, e.g. under
// `python -m http.server`), the section renders nothing at all.
//
// Design preview: add ?testimonials=demo to the URL to fill the section with clearly
// labelled placeholder cards. Never ship placeholder copy as real testimonials.
//
// Depends on Reveal + Eyebrow from sections.jsx (loaded earlier).

const { useState: useStateT, useEffect: useEffectT, useRef: useRefT } = React;

const TM_DEMO = [
  { id: 'd1', name: 'Sample Client', role: 'Founder', company: 'Placeholder Co.', project: 'Website rebuild', when: 'Mar 2026', rating: 5,
    quote: 'Placeholder copy to preview the layout. A real testimonial will appear here once a client submits one and it is ticked "Publish" in Notion.' },
  { id: 'd2', name: 'Sample Client', role: 'Head of Marketing', company: 'Example Ltd', project: 'Product sprint', when: '2025', rating: 5,
    quote: 'Short placeholder quote.' },
  { id: 'd3', name: 'Sample Client', role: 'COO', company: 'Demo Group', project: 'Booking platform', when: 'Nov 2025', rating: 4,
    quote: 'A longer placeholder to check how the cards handle more text. Real testimonials can run to a few paragraphs, so the layout clamps long ones and lets the reader expand them in place without the grid jumping around too much.' },
  { id: 'd4', name: 'Sample Client', role: 'Director', company: 'Test & Co', project: 'Brand site', when: '2024', rating: 5,
    quote: 'Another placeholder, medium length, so the marquee rows have some rhythm to them.' },
];

function useTestimonials() {
  const demo = typeof location !== 'undefined' && new URLSearchParams(location.search).get('testimonials') === 'demo';
  const [state, setState] = useStateT({ status: demo ? 'ready' : 'loading', items: demo ? TM_DEMO : [], demo });
  useEffectT(() => {
    if (demo) return;
    let alive = true;
    fetch('/api/published-testimonials')
      .then((r) => (r.ok ? r.json() : { testimonials: [] }))
      .then((d) => alive && setState({ status: 'ready', items: Array.isArray(d.testimonials) ? d.testimonials : [], demo: false }))
      .catch(() => alive && setState({ status: 'ready', items: [], demo: false }));
    return () => { alive = false; };
  }, []);
  return state;
}

function TmStars({ value, size = 14 }) {
  if (!value) return null;
  return (
    <span className="tm-stars-row" role="img" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24" aria-hidden="true"
          className={i <= value ? 'is-on' : ''}>
          <path d="M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2l-5.7 3.1 1.2-6.4-4.7-4.4 6.4-.8z" strokeLinejoin="round" />
        </svg>
      ))}
    </span>
  );
}

function refInitials(name) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('');
}

function TmByline({ r }) {
  const sub = [r.role, r.company].filter(Boolean).join(', ');
  return (
    <div className="tm-by">
      <span className="tm-avatar" aria-hidden="true">{refInitials(r.name)}</span>
      <span className="tm-by-txt">
        <span className="tm-by-name">{r.name}</span>
        {sub && <span className="tm-by-sub">{sub}</span>}
      </span>
    </div>
  );
}

function TmMeta({ r }) {
  const bits = [r.project, r.when].filter(Boolean);
  if (!bits.length) return null;
  return <span className="mono dim tm-meta">{bits.join(' · ')}</span>;
}

// A card with a clamped quote that expands in place.
function TmCard({ r, clamp = true }) {
  const [open, setOpen] = useStateT(false);
  const long = r.quote.length > 260;
  return (
    <figure className="tm-card">
      <div className="tm-card-top">
        <TmStars value={r.rating} />
        <TmMeta r={r} />
      </div>
      <blockquote className={'tm-card-q' + (clamp && long && !open ? ' is-clamped' : '')}>
        {r.quote}
      </blockquote>
      {clamp && long && (
        <button type="button" className="tm-more" onClick={() => setOpen(!open)} aria-expanded={open}>
          {open ? 'Show less' : 'Read the full testimonial'}
        </button>
      )}
      <figcaption><TmByline r={r} /></figcaption>
    </figure>
  );
}

// Layout 1 — one big serif quote at a time, auto-advancing, with a picker.
function TmSpotlight({ items }) {
  const [i, setI] = useStateT(0);
  const [paused, setPaused] = useStateT(false);
  const n = items.length;
  useEffectT(() => {
    if (n < 2 || paused) return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = setTimeout(() => setI((x) => (x + 1) % n), 9000);
    return () => clearTimeout(t);
  }, [i, n, paused]);
  const r = items[i];
  const size = r.quote.length > 420 ? 'is-long' : r.quote.length > 200 ? 'is-mid' : '';
  return (
    <div className={'tm-spot' + (n < 2 ? ' is-single' : '')} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}>
      <figure className="tm-spot-main" key={r.id} aria-live="polite">
        <div className="tm-spot-top">
          <TmStars value={r.rating} size={16} />
          <TmMeta r={r} />
        </div>
        <span className="tm-spot-mark" aria-hidden="true">“</span>
        <blockquote className={'tm-spot-q ' + size}>{r.quote}</blockquote>
        <figcaption><TmByline r={r} /></figcaption>
      </figure>
      {n > 1 && (
        <div className="tm-spot-nav">
          <div className="tm-spot-list" role="tablist" aria-label="Testimonials">
            {items.map((x, k) => (
              <button key={x.id} type="button" role="tab" aria-selected={k === i}
                className={'tm-spot-pick' + (k === i ? ' is-active' : '')} onClick={() => setI(k)}>
                <span className="tm-avatar" aria-hidden="true">{refInitials(x.name)}</span>
                <span className="tm-spot-pick-txt">
                  <span className="tm-by-name">{x.name}</span>
                  <span className="tm-by-sub">{x.company || x.project}</span>
                </span>
                {k === i && !paused && <span className="tm-spot-progress" />}
              </button>
            ))}
          </div>
          <div className="tm-spot-arrows">
            <button type="button" className="tm-arrow" aria-label="Previous testimonial" onClick={() => setI((i - 1 + n) % n)}>
              <svg width="14" height="14" viewBox="0 0 12 12" fill="none"><path d="M7.5 2.5L4 6l3.5 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            <span className="mono dim">{String(i + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}</span>
            <button type="button" className="tm-arrow" aria-label="Next testimonial" onClick={() => setI((i + 1) % n)}>
              <svg width="14" height="14" viewBox="0 0 12 12" fill="none"><path d="M4.5 2.5L8 6 4.5 9.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Layout 2 — endless horizontal rows (two rows when there are enough).
function TmMarquee({ items }) {
  if (items.length < 3) return <TmGrid items={items} />;
  const half = Math.ceil(items.length / 2);
  const rows = items.length >= 6 ? [items.slice(0, half), items.slice(half)] : [items];
  return (
    <div className="tm-marquee">
      {rows.map((row, k) => (
        <div key={k} className={'tm-marquee-row' + (k ? ' is-reverse' : '')}>
          <div className="tm-marquee-track" style={{ ['--tm-dur']: `${Math.max(30, row.length * 12)}s` }}>
            {[...row, ...row].map((r, j) => (
              <div key={r.id + '-' + j} className="tm-marquee-item" aria-hidden={j >= row.length}>
                <TmCard r={r} clamp={false} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// Layout 3 — masonry columns.
function TmGrid({ items }) {
  return (
    <div className="tm-grid">
      {items.map((r, k) => (
        <Reveal key={r.id} delay={(k % 3) * 80} className="tm-grid-item">
          <TmCard r={r} />
        </Reveal>
      ))}
    </div>
  );
}

function Testimonials({ accent, layout = 'spotlight' }) {
  const { status, items, demo } = useTestimonials();
  if (status !== 'ready' || !items.length) return null;

  const rated = items.filter((r) => r.rating);
  const avg = rated.length ? rated.reduce((s, r) => s + r.rating, 0) / rated.length : 0;

  return (
    <section id="testimonials" className={'section section--testimonials tm--' + layout}>
      <div className="container">
        <div className="section-head section-head--row">
          <div>
            <Eyebrow num="05">Testimonials</Eyebrow>
            <Reveal>
              <h2 className="h2">In their words,<br /><span className="display-em">not ours.</span></h2>
            </Reveal>
          </div>
          <Reveal delay={120}>
            <div className="tm-summary">
              {rated.length >= 3 && (
                <div className="tm-summary-score">
                  <span className="tm-summary-num">{avg.toFixed(1)}</span>
                  <span>
                    <TmStars value={Math.round(avg)} size={15} />
                    <span className="mono dim tm-summary-l">Average from {rated.length} clients</span>
                  </span>
                </div>
              )}
              <p className="section-sub">
                Unedited testimonials from the teams we've shipped with, published with their permission.
              </p>
              {demo && <span className="tag tm-demo-tag">Preview data · ?testimonials=demo</span>}
            </div>
          </Reveal>
        </div>

        {layout === 'marquee' ? <TmMarquee items={items} />
          : layout === 'grid' ? <TmGrid items={items} />
          : <TmSpotlight items={items} accent={accent} />}
      </div>
    </section>
  );
}

Object.assign(window, { Testimonials });
