import { useEffect, useState } from 'react';
import type { World } from '@pixel-pals/content-schema';
import { loadWorld, saveWorld } from '@pixel-pals/persistence';
import {
  completeFirstActivity,
  createFirstWorld,
  type FirstActivity,
  type FirstPalChoice
} from '@pixel-pals/simulation';

const speciesOptions: Array<{ id: FirstPalChoice['speciesId']; label: string }> = [
  { id: 'fox', label: 'Fox' },
  { id: 'deer', label: 'Deer' },
  { id: 'rabbit', label: 'Rabbit' }
];

const activityOptions: Array<{ id: FirstActivity; title: string; description: string }> = [
  { id: 'leaf-chase', title: 'Chase Leaves', description: 'Race the wind through Willowmere.' },
  { id: 'stone-stacking', title: 'Stack Stones', description: 'Build something small together.' },
  { id: 'garden-game', title: 'Garden Game', description: 'Play Fern’s favorite guessing game.' }
];

export function App() {
  const [name, setName] = useState('');
  const [speciesId, setSpeciesId] = useState<FirstPalChoice['speciesId']>('fox');
  const [world, setWorld] = useState<World | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState('Your world is safe on this tablet.');

  useEffect(() => {
    void loadWorld()
      .then((savedWorld) => setWorld(savedWorld))
      .catch(() => setSaveStatus('We could not open the saved world yet.'))
      .finally(() => setLoading(false));
  }, []);

  const firstPal = world?.pals.find((pal) => pal.id === world.firstPalId);
  const firstMemory = world?.memories.find((memory) => memory.eventType === 'first-shared-activity');
  const firstPreference = firstPal?.preferences.find((preference) => preference.id === 'first-play-preference');

  async function persist(nextWorld: World): Promise<void> {
    setWorld(nextWorld);
    setSaveStatus('Saving your world…');

    try {
      await saveWorld(nextWorld);
      setSaveStatus('Saved. Your world will remember this.');
    } catch {
      setSaveStatus('The world changed, but the save needs another try.');
    }
  }

  if (loading) {
    return (
      <main className="app-shell">
        <section className="storybook-panel">
          <div className="welcome-copy">
            <p className="eyebrow">Opening your story</p>
            <h1>Pixel Pals</h1>
            <p className="intro">Finding the world this tablet remembers…</p>
          </div>
        </section>
      </main>
    );
  }

  if (!world) {
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
                if (name.trim().length === 0) return;

                const nextWorld = createFirstWorld({
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

                void persist(nextWorld);
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
          <h1 id="welcome-title">{firstPal?.name}</h1>
          <p className="tagline">Where every friendship changes the world.</p>
          <p className="intro">
            {firstMemory
              ? firstMemory.summary
              : `${firstPal?.name} has met Fern, but their first shared memory is still waiting.`}
          </p>
          {firstPreference?.discovered ? (
            <p className="intro"><strong>Discovered:</strong> {firstPreference.label}</p>
          ) : null}
        </div>
      </section>

      {!firstMemory ? (
        <section className="action-grid" aria-label="Choose a first shared activity">
          {activityOptions.map((activity) => (
            <button
              className="action-card action-leaf"
              type="button"
              key={activity.id}
              onClick={() => void persist(completeFirstActivity(world, activity.id))}
            >
              <span className="action-title">{activity.title}</span>
              <span className="action-description">{activity.description}</span>
            </button>
          ))}
        </section>
      ) : (
        <section className="action-grid" aria-label="First memory complete">
          <article className="action-card action-sun">
            <span className="action-title">A New Memory</span>
            <span className="action-description">{firstMemory.title}</span>
          </article>
          <article className="action-card action-leaf">
            <span className="action-title">A Friendship Began</span>
            <span className="action-description">Fern is now part of this world’s growing legacy.</span>
          </article>
          <article className="action-card action-clay">
            <span className="action-title">Willowmere Changed</span>
            <span className="action-description">Their shared play left a small mark near the village path.</span>
          </article>
        </section>
      )}

      <footer className="prototype-note" aria-live="polite">
        <span>{saveStatus}</span>
        <span>{world.memories.length} remembered moment{world.memories.length === 1 ? '' : 's'}</span>
      </footer>
    </main>
  );
}
