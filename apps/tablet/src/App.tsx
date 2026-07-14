import { useMemo, useState } from 'react';
import { createFirstWorld, type FirstPalChoice } from '@pixel-pals/simulation';

const speciesOptions: Array<{ id: FirstPalChoice['speciesId']; label: string }> = [
  { id: 'fox', label: 'Fox' },
  { id: 'deer', label: 'Deer' },
  { id: 'rabbit', label: 'Rabbit' }
];

export function App() {
  const [name, setName] = useState('');
  const [speciesId, setSpeciesId] = useState<FirstPalChoice['speciesId']>('fox');
  const [worldCreated, setWorldCreated] = useState(false);

  const world = useMemo(() => {
    if (!worldCreated) return null;

    return createFirstWorld({
      worldId: 'local-family-world',
      worldName: 'Our Pixel Pals',
      seed: 42,
      firstPal: {
        name: name.trim(),
        speciesId,
        paletteId: 'sunleaf',
        markingId: 'tail-tip',
        accessoryId: 'scarf'
      }
    });
  }, [name, speciesId, worldCreated]);

  const firstPal = world?.pals.find((pal) => pal.id === world.firstPalId);

  if (!worldCreated) {
    return (
      <main className="app-shell">
        <section className="storybook-panel" aria-labelledby="first-pal-title">
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
            <p className="eyebrow">Your story begins with a Pal</p>
            <h1 id="first-pal-title">Who did you meet?</h1>
            <p className="intro">Choose their kind and give them a name. You will discover the rest together.</p>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                if (name.trim().length > 0) setWorldCreated(true);
              }}
            >
              <label>
                <span className="action-title">Pal name</span>
                <input
                  aria-label="Pal name"
                  maxLength={32}
                  required
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  style={{ minHeight: 52, width: '100%', padding: 12, borderRadius: 14, fontSize: '1.1rem' }}
                />
              </label>

              <fieldset style={{ border: 0, padding: 0, margin: '20px 0' }}>
                <legend className="action-title">Choose a species</legend>
                <div className="action-grid">
                  {speciesOptions.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      className={`action-card ${speciesId === option.id ? 'action-leaf' : 'action-clay'}`}
                      aria-pressed={speciesId === option.id}
                      onClick={() => setSpeciesId(option.id)}
                    >
                      <span className="action-title">{option.label}</span>
                    </button>
                  ))}
                </div>
              </fieldset>

              <button className="action-card action-sun" type="submit" disabled={name.trim().length === 0}>
                <span className="action-title">Meet my Pal</span>
                <span className="action-description">This name stays in your local world.</span>
              </button>
            </form>
          </div>
        </section>
      </main>
    );
  }

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
          <h1 id="welcome-title">Meet {firstPal?.name}</h1>
          <p className="tagline">Where every friendship changes the world.</p>
          <p className="intro">
            {firstPal?.name} is your first companion, but not a character you already know completely. Their favorite game is still waiting to be discovered.
          </p>
        </div>
      </section>

      <section className="action-grid" aria-label="First activities">
        <button className="action-card action-sun" type="button">
          <span className="action-title">Play Together</span>
          <span className="action-description">Try a small game and discover what {firstPal?.name} enjoys.</span>
        </button>
        <button className="action-card action-leaf" type="button">
          <span className="action-title">Meet Fern</span>
          <span className="action-description">Begin the first friendship in your world.</span>
        </button>
        <button className="action-card action-clay" type="button">
          <span className="action-title">Find a Home</span>
          <span className="action-description">Choose a place where {firstPal?.name} can feel comfortable.</span>
        </button>
      </section>

      <footer className="prototype-note">
        <span>Foundation build</span>
        <span>Local world created and schema validated</span>
      </footer>
    </main>
  );
}
