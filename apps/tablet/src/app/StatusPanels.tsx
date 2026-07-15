export function LoadingPanel() {
  return (
    <main className="app-shell">
      <section className="storybook-panel loading-panel">
        <div className="welcome-copy">
          <p className="eyebrow">Opening your story</p>
          <h1>Pixel Pals</h1>
          <p className="intro">Finding the world this tablet remembers…</p>
        </div>
      </section>
    </main>
  );
}

export function RepairPanel() {
  return (
    <main className="app-shell">
      <section className="storybook-panel loading-panel" role="alert">
        <div className="welcome-copy">
          <p className="eyebrow">The world needs repair</p>
          <h1>Pixel Pals could not connect this story safely</h1>
          <p className="intro">The saved world remains on this tablet. Use the parent tools from a valid backup build to restore it.</p>
        </div>
      </section>
    </main>
  );
}
