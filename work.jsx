// Recent client websites. Screenshots supplied by Tawanda; no result claims.
const WEBSITE_PROJECTS = [
  {slug:'aucor-property', name:'Aucor Property', type:'Property auctions', description:'A clear introduction to the business, with the next auction and registration action easy to find.'},
  {slug:'cm-plumbing', name:'CM Plumbing & Renovations', type:'Plumbing & renovations', description:'Services, experience and a clear way to ask for a quote. Built to make calling or sending a WhatsApp message easy.'},
  {slug:'scis-wits', name:'SCIS at Wits', type:'Research & education', description:'A home for research, news and ideas, with clear paths to explore the centre’s work.'},
  {slug:'trailbrew', name:'TrailBrew', type:'iOS app · In-house product', description:'A mountain biking app for service tracking, group rides and trails, designed and built with an AI workflow and shaped by beta riders.', app:true, href:'cases/TrailBrew.html'},
];

// App projects show a single phone; a missing screenshot shows a labelled empty frame.
function AppPreview({project}) {
  const [missing, setMissing] = React.useState(false);
  return <div className="project-preview project-preview--app" role="img" aria-label={project.name + ' app shown on a phone'}>
    <div className={'project-app-phone' + (missing ? ' project-app-phone--empty' : '')}>
      {missing ? <span>App screens coming soon</span> : <img src={'assets/work/trailbrew/garage.png'} alt="" loading="lazy" onError={() => setMissing(true)} />}
    </div>
  </div>;
}

function ProjectPreview({project, priority = false}) {
  if (project.app) return <AppPreview project={project} />;
  return <div className="project-preview" role="img" aria-label={project.name + ' website shown on desktop and mobile'}>
    <div className="project-desktop"><div className="project-browser-bar" aria-hidden="true"><i/><i/><i/></div><img src={'assets/work/recent/'+project.slug+'-desktop.webp'} alt="" loading={priority ? 'eager' : 'lazy'} fetchPriority={priority ? 'high' : 'auto'} /></div>
    <div className="project-mobile"><img src={'assets/work/recent/'+project.slug+'-mobile.webp'} alt="" loading={priority ? 'eager' : 'lazy'} /></div>
  </div>;
}

// The transform follows scroll directly, with no timer or independent animation.
function WebsiteReveal() {
  const stageRef = React.useRef(null);
  React.useEffect(() => {
    const stage = stageRef.current;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    const update = () => {
      frame = 0;
      if (motion.matches) {
        stage.style.setProperty('--reveal-angle', '0deg');
        stage.style.setProperty('--reveal-scale', '1');
        return;
      }
      const top = stage.getBoundingClientRect().top;
      const range = Math.max(1, window.innerHeight * .8 - 100);
      const progress = Math.min(1, Math.max(0, (window.innerHeight * .8 - top) / range));
      const eased = 1 - Math.pow(1 - progress, 2);
      const angle = window.innerWidth < 700 ? 18 : 48;
      stage.style.setProperty('--reveal-angle', ((1 - eased) * angle).toFixed(2) + 'deg');
      stage.style.setProperty('--reveal-scale', (.92 + eased * .08).toFixed(4));
    };
    const requestUpdate = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', requestUpdate, {passive:true});
    window.addEventListener('resize', requestUpdate);
    motion.addEventListener('change', requestUpdate);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', requestUpdate);
      window.removeEventListener('resize', requestUpdate);
      motion.removeEventListener('change', requestUpdate);
    };
  }, []);
  return <div className="website-reveal container" ref={stageRef}>
    <div className="website-reveal-glow" aria-hidden="true" />
    <div className="website-reveal-device" role="img" aria-label="Aucor Property website on a desktop screen">
      <div className="project-browser-bar" aria-hidden="true"><i/><i/><i/></div>
      <img src="assets/work/recent/aucor-property-desktop.webp" alt="" fetchPriority="high" />
    </div>
  </div>;
}

function Work() {
  return <section id="work" className="section"><div className="container">
    <div className="section-head section-head--row"><div><Eyebrow>Recent work</Eyebrow><h2 className="h2">Different products.<br />Designed around their users.</h2></div><p className="section-sub">A few projects we’ve designed recently, from public websites to research platforms.</p></div>
    <div className="recent-projects">{WEBSITE_PROJECTS.map(project => <article className="recent-project" key={project.slug}><ProjectPreview project={project}/><div className="project-copy"><span className="mono dim">{project.type}</span><h3>{project.name}</h3><p>{project.description}</p>{project.href && <a className="project-link" href={project.href}>Read the case study ↗</a>}</div></article>)}</div>
      </div></section>;
}
Object.assign(window, {WEBSITE_PROJECTS, AppPreview, ProjectPreview, WebsiteReveal, Work});
