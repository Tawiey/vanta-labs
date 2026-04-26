// app.jsx — Vanta Labs root

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "dark",
  "accent": "#d8ff3b",
  "heroVariant": "terminal"
}/*EDITMODE-END*/;

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  React.useEffect(() => {
    document.documentElement.dataset.theme = t.theme;
  }, [t.theme]);

  React.useEffect(() => {
    document.documentElement.style.setProperty('--accent', t.accent);
  }, [t.accent]);

  return (
    <>
      <Nav accent={t.accent} theme={t.theme} onToggleTheme={() => setTweak('theme', t.theme === 'dark' ? 'light' : 'dark')} />
      <main>
        <Hero accent={t.accent} variant={t.heroVariant} />
        <Insights accent={t.accent} />
        <LogoStrip />
        <Services accent={t.accent} />
        <Work accent={t.accent} />
        <Process accent={t.accent} />
        <Offers accent={t.accent} />
        <Thinking />
        <CTA accent={t.accent} />
      </main>
      <Footer accent={t.accent} />

      <TweaksPanel title="Vanta · Tweaks">
        <TweakSection label="Theme" />
        <TweakRadio
          label="Mode"
          value={t.theme}
          options={[{ value: 'dark', label: 'Dark' }, { value: 'light', label: 'Light' }]}
          onChange={(v) => setTweak('theme', v)}
        />
        <TweakColor
          label="Accent"
          value={t.accent}
          onChange={(v) => setTweak('accent', v)}
        />
        <div className="twk-row twk-row-h" style={{ gap: 6, flexWrap: 'wrap', justifyContent: 'flex-start' }}>
          {['#d8ff3b', '#ff6b3d', '#7cf2c4', '#a78bfa', '#f5d76e', '#ffffff'].map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setTweak('accent', c)}
              aria-label={'Accent ' + c}
              style={{
                width: 22, height: 22, borderRadius: 6, padding: 0,
                background: c, border: t.accent.toLowerCase() === c.toLowerCase()
                  ? '2px solid rgba(0,0,0,0.7)'
                  : '1px solid rgba(0,0,0,0.15)',
                cursor: 'default',
              }}
            />
          ))}
        </div>

        <TweakSection label="Hero" />
        <TweakRadio
          label="Visual"
          value={t.heroVariant}
          options={[
            { value: 'orbit', label: 'Orbit' },
            { value: 'terminal', label: 'Terminal' },
            { value: 'vanta', label: 'Vanta' },
          ]}
          onChange={(v) => setTweak('heroVariant', v)}
        />
      </TweaksPanel>
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
