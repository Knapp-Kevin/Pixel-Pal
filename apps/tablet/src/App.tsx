const villageActions = [
  {
    title: 'Meet the Pals',
    description: 'Discover who lives here and learn what makes each Pal unique.',
    accent: 'sun'
  },
  {
    title: 'Visit the Great Tree',
    description: 'Celebrate friendships and see how they shape the village.',
    accent: 'leaf'
  },
  {
    title: 'Build a Home',
    description: 'Create a safe, comfortable place for a Pal or family to live.',
    accent: 'clay'
  }
] as const;

export function App() {
  return (
    <main className="app-shell">
      <section className="storybook-panel" aria-labelledby="welcome-title">
        <div className="landscape" aria-hidden="true">
          <div className="sun-disc" />
          <div className="hill hill-back" />
          <div className="hill hill-front" />
          <div className="great-tree">
            <div className="tree-crown crown-one" />
            <div className="tree-crown crown-two" />
            <div className="tree-crown crown-three" />
            <div className="tree-trunk" />
          </div>
        </div>

        <div className="welcome-copy">
          <p className="eyebrow">Welcome to Willowmere</p>
          <h1 id="welcome-title">Pixel Pals</h1>
          <p className="tagline">Where every friendship changes the world.</p>
          <p className="intro">
            Meet new Pals, build homes, grow friendships, and help a living village flourish.
          </p>
        </div>
      </section>

      <section className="action-grid" aria-label="Village activities">
        {villageActions.map((action) => (
          <button className={`action-card action-${action.accent}`} type="button" key={action.title}>
            <span className="action-title">{action.title}</span>
            <span className="action-description">{action.description}</span>
          </button>
        ))}
      </section>

      <footer className="prototype-note">
        <span>Foundation prototype</span>
        <span>Designed for landscape tablet play</span>
      </footer>
    </main>
  );
}
