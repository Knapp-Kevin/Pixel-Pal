import { useEffect, useState } from 'react';
import type { World } from '@pixel-pals/content-schema';
import { loadWorld, saveWorld } from '@pixel-pals/persistence';
import { PalPortrait, WillowmereScene, type PalSpecies } from '@pixel-pals/renderer';
import {
  completeFirstActivity,
  createFirstWorld,
  type FirstActivity,
  type FirstPalChoice
} from '@pixel-pals/simulation';
import { completeFirstFriendshipCeremony } from '@pixel-pals/simulation/ceremony';

const speciesOptions: Array<{ id: FirstPalChoice['speciesId']; label: string }> = [
  { id: 'fox', label: 'Fox' },
  { id: 'deer', label: 'Deer' },
  { id: 'rabbit', label: 'Rabbit' },
  { id: 'cat', label: 'Kitten' },
  { id: 'duck', label: 'Duckling' }
];

const paletteOptions: Array<{ id: FirstPalChoice['paletteId']; label: string }> = [
  { id: 'sunleaf', label: 'Sunleaf' },
  { id: 'riverstone', label: 'Riverstone' },
  { id: 'berrybloom', label: 'Berrybloom' }
];

const markingOptions: Array<{ id: FirstPalChoice['markingId']; label: string }> = [
  { id: 'soft-mask', label: 'Soft Mask' },
  { id: 'freckles', label: 'Freckles' },
  { id: 'tail-tip', label: 'Light Tail Tip' }
];

const accessoryOptions: Array<{ id: NonNullable<FirstPalChoice['accessoryId']>; label: string }> = [
  { id: 'scarf', label: 'Scarf' },
  { id: 'satchel', label: 'Satchel' },
  { id: 'leaf-pin', label: 'Leaf Pin' }
];

const activityOptions: Array<{
  id: FirstActivity;
  title: string;
  description: string;
  expression: 'curious' | 'thoughtful' | 'delighted';
}> = [
  { id: 'leaf-chase', title: 'Chase Leaves', description: 'Race the wind through Willowmere.', expression: 'delighted' },
  { id: 'stone-stacking', title: 'Stack Stones', description: 'Build something small together.', expression: 'thoughtful' },
  { id: 'garden-game', title: 'Garden Game', description: 'Play Fern’s favorite guessing game.', expression: 'curious' }
];

function renderableSpecies(speciesId: string): PalSpecies {
  if (speciesId === 'deer' || speciesId === 'rabbit' || speciesId === 'cat' || speciesId === 'duck') {
    return speciesId;
  }

  return 'fox';
}

function createLocalWorldSeed(): number {
  if (globalThis.crypto?.getRandomValues) {
    const values = new Uint32Array(1);
    globalThis.crypto.getRandomValues(values);
    return values[0] ?? 0;
  }

  return Date.now() % 4_294_967_296;
}

export function App() {
  const [name, setName] = useState('');
  const [speciesId, setSpeciesId] = useState<FirstPalChoice['speciesId'] | null>(null);
  const [paletteId, setPaletteId] = useState<FirstPalChoice['paletteId']>('sunleaf');
  const [markingId, setMarkingId] = useState<FirstPalChoice['markingId']>('tail-tip');
  const [accessoryId, setAccessoryId] = useState<NonNullable<FirstPalChoice['accessoryId']>>('scarf');
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
  const ceremonyMemory = world?.memories.find((memory) => memory.eventType === 'first-friendship-ceremony');
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

  if (!world) {
    return (
      <main className="app-shell">
        <section className="storybook-panel creation-panel" aria-labelledby="first-pal-title">
          <div className="storybook-art creation-art">
            <div className="preview-glow" aria-hidden="true" />
            {speciesId ? (
              <PalPortrait
                className="first-pal-preview"
                name={name.trim() || 'Your new Pal'}
                species={speciesId}
                paletteId={paletteId}
                markingId={markingId}
                accessoryId={accessoryId}
                expression="curious"
              />
            ) : (
              <div className="unselected-pal" role="status">
                <span className="unselected-pal-shapes" aria-hidden="true">
                  <span>◇</span><span>○</span><span>△</span><span>☆</span><span>◌</span>
                </span>
                <strong>Choose who you meet</strong>
                <span>Fox, Deer, Rabbit, Kitten, and Duckling are all waiting.</span>
              </div>
            )}
          </div>

          <div className="welcome-copy creation-copy">
            <p className="eyebrow">Your story begins with a Pal</p>
            <h1 id="first-pal-title">Who did you meet?</h1>
            <p className="intro">Choose their species and a few things you can see. Their personality will reveal itself through the life you share.</p>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                if (name.trim().length === 0 || !speciesId) return;

                const seed = createLocalWorldSeed();
                const nextWorld = createFirstWorld({
                  worldId: `local-family-world-${seed.toString(36)}`,
                  worldName: 'Our Pixel Pals',
                  seed,
                  firstPal: {
                    name: name.trim(),
                    speciesId,
                    paletteId,
                    markingId,
                    accessoryId
                  }
                });

                void persist(nextWorld);
              }}
            >
              <ChoiceGroup
                legend="Choose a species"
                options={speciesOptions}
                selected={speciesId}
                onSelect={setSpeciesId}
              />

              <label className="field-label">
                <span className="action-title">Pal name</span>
                <input
                  className="name-input"
                  aria-label="Pal name"
                  maxLength={32}
                  required
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />
              </label>

              <ChoiceGroup legend="Colors" options={paletteOptions} selected={paletteId} onSelect={setPaletteId} />
              <ChoiceGroup legend="Markings" options={markingOptions} selected={markingId} onSelect={setMarkingId} />
              <ChoiceGroup
                legend="Something to wear"
                options={accessoryOptions}
                selected={accessoryId}
                onSelect={setAccessoryId}
              />

              <button
                className="action-card action-sun meet-button"
                type="submit"
                disabled={name.trim().length === 0 || !speciesId}
              >
                <span className="action-title">Meet my Pal</span>
                <span className="action-description">
                  {speciesId
                    ? 'This name and appearance stay in your local world.'
                    : 'Choose a species first. None is selected for you.'}
                </span>
              </button>
            </form>
          </div>
        </section>
      </main>
    );
  }

  if (!firstPal) {
    return <main className="app-shell"><p>The saved world could not find its first Pal.</p></main>;
  }

  const latestStory = ceremonyMemory?.summary ?? firstMemory?.summary ?? `${firstPal.name} has met Fern, but their first shared memory is still waiting.`;

  return (
    <main className="app-shell">
      <section className="storybook-panel world-panel" aria-labelledby="welcome-title">
        <div className="storybook-art world-art">
          <WillowmereScene
            className="willowmere-scene"
            showPlayMarker={Boolean(firstMemory)}
            showCeremonyMarker={Boolean(ceremonyMemory)}
          />
          <div className="pal-pair" aria-label={`${firstPal.name} and Fern in Willowmere`}>
            <PalPortrait
              className="scene-pal scene-pal-first"
              name={firstPal.name}
              species={renderableSpecies(firstPal.speciesId)}
              paletteId={firstPal.appearance.paletteId}
              markingId={firstPal.appearance.markingId}
              accessoryId={firstPal.appearance.accessoryId}
              expression={firstMemory ? 'delighted' : 'curious'}
              pose={firstMemory ? 'playful' : 'standing'}
            />
            <PalPortrait
              className="scene-pal scene-pal-fern"
              name="Fern"
              species="rabbit"
              paletteId="mosscream"
              markingId="ear-dapple"
              accessoryId="leaf-pin"
              expression={firstMemory ? 'delighted' : 'content'}
              pose={firstMemory ? 'playful' : 'standing'}
            />
          </div>
        </div>

        <div className="welcome-copy world-copy">
          <p className="eyebrow">Welcome to Willowmere</p>
          <h1 id="welcome-title">{firstPal.name}</h1>
          <p className="tagline">Where every friendship changes the world.</p>
          <p className="intro">{latestStory}</p>
          {firstPreference?.discovered ? (
            <p className="discovery"><strong>Discovered:</strong> {firstPreference.label}</p>
          ) : null}
        </div>
      </section>

      {!firstMemory ? (
        <section className="action-grid" aria-label="Choose a first shared activity">
          {activityOptions.map((activity) => (
            <button
              className="action-card activity-card"
              type="button"
              key={activity.id}
              onClick={() => void persist(completeFirstActivity(world, activity.id))}
            >
              <span className="activity-portrait" aria-hidden="true">
                <PalPortrait
                  name={firstPal.name}
                  species={renderableSpecies(firstPal.speciesId)}
                  paletteId={firstPal.appearance.paletteId}
                  markingId={firstPal.appearance.markingId}
                  accessoryId={firstPal.appearance.accessoryId}
                  expression={activity.expression}
                  pose={activity.id === 'leaf-chase' ? 'playful' : 'standing'}
                />
              </span>
              <span className="action-title">{activity.title}</span>
              <span className="action-description">{activity.description}</span>
            </button>
          ))}
        </section>
      ) : !ceremonyMemory ? (
        <section className="action-grid" aria-label="Friendship ready for recognition">
          <article className="action-card action-sun memory-card">
            <span className="action-title">A New Memory</span>
            <span className="action-description">{firstMemory.title}</span>
          </article>
          <article className="action-card action-leaf memory-card">
            <span className="action-title">A Friendship Began</span>
            <span className="action-description">Fern is now part of this world’s growing legacy.</span>
          </article>
          <button
            className="action-card action-clay ceremony-button"
            type="button"
            onClick={() => void persist(completeFirstFriendshipCeremony(world))}
          >
            <span className="action-title">Visit the Great Tree</span>
            <span className="action-description">Let Willowmere recognize the friendship they have begun.</span>
          </button>
        </section>
      ) : (
        <section className="action-grid" aria-label="First friendship ceremony complete">
          <article className="action-card action-sun memory-card">
            <span className="action-title">The Tree Remembers</span>
            <span className="action-description">A ribbon now marks {firstPal.name} and Fern’s friendship.</span>
          </article>
          <article className="action-card action-leaf memory-card">
            <span className="action-title">Legacy Began</span>
            <span className="action-description">This friendship now belongs to Willowmere’s visible history.</span>
          </article>
          <article className="action-card action-clay memory-card">
            <span className="action-title">The World Changed</span>
            <span className="action-description">The play stones and friendship ribbons will remain after the tablet closes.</span>
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

type ChoiceGroupProps<T extends string> = {
  legend: string;
  options: Array<{ id: T; label: string }>;
  selected: T | null;
  onSelect: (value: T) => void;
};

function ChoiceGroup<T extends string>({ legend, options, selected, onSelect }: ChoiceGroupProps<T>) {
  return (
    <fieldset className="choice-group">
      <legend className="action-title">{legend}</legend>
      <div className="choice-row">
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            className="choice-button"
            aria-pressed={selected === option.id}
            onClick={() => onSelect(option.id)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
