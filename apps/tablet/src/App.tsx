import { useEffect, useRef, useState } from 'react';
import type { HomeObject, Pal, World } from '@pixel-pals/content-schema';
import { loadWorld, saveWorld } from '@pixel-pals/persistence';
import { HomeScene, PalPortrait, WillowmereScene } from '@pixel-pals/renderer';
import {
  completeFirstActivity,
  createFirstWorld,
  type FirstActivity,
  type FirstPalChoice
} from '@pixel-pals/simulation';
import { completeFirstFriendshipCeremony } from '@pixel-pals/simulation/ceremony';
import { chooseFirstHomeObject } from '@pixel-pals/simulation/home';
import { MemoryJournal } from './MemoryJournal';
import { requireRenderableSpecies } from './tabletProfile';
import { ParentTestTools } from './ParentTestTools';

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
  { id: 'leaf-chase', title: 'Chase Leaves', description: 'Race the wind through the village.', expression: 'delighted' },
  { id: 'stone-stacking', title: 'Stack Stones', description: 'Build something small together.', expression: 'thoughtful' },
  { id: 'garden-game', title: 'Garden Game', description: 'Try a garden guessing game together.', expression: 'curious' }
];

const homeObjectOptions: Array<{ id: HomeObject; title: string; description: string }> = [
  { id: 'window-cushion', title: 'Window Cushion', description: 'A soft place to watch the village wake up.' },
  { id: 'memory-shelf', title: 'Memory Shelf', description: 'A place for keepsakes, gifts, and stories that accumulate over time.' },
  { id: 'story-lantern', title: 'Story Lantern', description: 'A warm light for quiet evenings and shared tales.' }
];

type AppView = 'village' | 'home' | 'journal';
type HomeView = 'exterior' | 'interior';

function createLocalWorldSeed(): number {
  if (globalThis.crypto?.getRandomValues) {
    const values = new Uint32Array(1);
    globalThis.crypto.getRandomValues(values);
    return values[0] ?? 0;
  }
  return Date.now() % 4_294_967_296;
}

function findFirstNeighbor(world: World): Pal | undefined {
  const roleNeighbor = world.pals.find((pal) => pal.storyRole === 'first-neighbor');
  if (roleNeighbor) return roleNeighbor;

  const relationship = world.relationships.find(
    (candidate) => candidate.fromPalId === world.firstPalId && candidate.toPalId !== world.firstPalId
  );
  return world.pals.find((pal) => pal.id === relationship?.toPalId);
}

export function App() {
  const [name, setName] = useState('');
  const [speciesId, setSpeciesId] = useState<FirstPalChoice['speciesId'] | null>(null);
  const [paletteId, setPaletteId] = useState<FirstPalChoice['paletteId']>('sunleaf');
  const [markingId, setMarkingId] = useState<FirstPalChoice['markingId']>('tail-tip');
  const [accessoryId, setAccessoryId] = useState<NonNullable<FirstPalChoice['accessoryId']>>('scarf');
  const [world, setWorld] = useState<World | null>(null);
  const [view, setView] = useState<AppView>('village');
  const [homeView, setHomeView] = useState<HomeView>('exterior');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('Your world is safe on this tablet.');
  const saveInFlight = useRef(false);

  useEffect(() => {
    void loadWorld()
      .then((savedWorld) => setWorld(savedWorld))
      .catch(() => setSaveStatus('We could not open a valid saved world. No data was erased.'))
      .finally(() => setLoading(false));
  }, []);

  const firstPal = world?.pals.find((pal) => pal.id === world.firstPalId);
  const firstNeighbor = world ? findFirstNeighbor(world) : undefined;
  const village = world && firstPal
    ? world.villages.find((candidate) => candidate.id === firstPal.homeVillageId)
    : undefined;
  const firstMemory = world?.memories.find((memory) => memory.eventType === 'first-shared-activity');
  const ceremonyMemory = world?.memories.find((memory) => memory.eventType === 'first-friendship-ceremony');
  const homeMemory = world?.memories.find((memory) => memory.eventType === 'first-home-object');
  const firstPreference = firstPal?.preferences.find((preference) => preference.id === 'first-play-preference');
  const firstHome = world?.homes.find((home) => home.residentPalIds.includes(world.firstPalId));

  async function persist(nextWorld: World): Promise<void> {
    if (saveInFlight.current) return;

    const previousWorld = world;
    saveInFlight.current = true;
    setSaving(true);
    setWorld(nextWorld);
    setSaveStatus('Saving your world…');

    try {
      await saveWorld(nextWorld);
      setSaveStatus('Saved. Your world will remember this.');
    } catch {
      setWorld(previousWorld);
      setSaveStatus('That change could not be saved, so the world returned to its last safe state.');
    } finally {
      saveInFlight.current = false;
      setSaving(false);
    }
  }

  function runWorldAction(action: () => World): void {
    if (saveInFlight.current) return;

    try {
      void persist(action());
    } catch {
      setSaveStatus('That action did not fit the current world state. Nothing changed.');
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
      <main className="app-shell" aria-busy={saving} data-saving={saving}>
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
                if (name.trim().length === 0 || !speciesId || saving) return;

                try {
                  const seed = createLocalWorldSeed();
                  void persist(createFirstWorld({
                    worldId: `local-family-world-${seed.toString(36)}`,
                    worldName: 'Our Pixel Pals',
                    seed,
                    firstPal: { name: name.trim(), speciesId, paletteId, markingId, accessoryId }
                  }));
                } catch {
                  setSaveStatus('That Pal could not be created. Nothing was saved.');
                }
              }}
            >
              <ChoiceGroup legend="Choose a species" options={speciesOptions} selected={speciesId} onSelect={setSpeciesId} disabled={saving} />

              <label className="field-label">
                <span className="action-title">Pal name</span>
                <input
                  className="name-input"
                  aria-label="Pal name"
                  maxLength={32}
                  required
                  disabled={saving}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />
              </label>

              <ChoiceGroup legend="Colors" options={paletteOptions} selected={paletteId} onSelect={setPaletteId} disabled={saving} />
              <ChoiceGroup legend="Markings" options={markingOptions} selected={markingId} onSelect={setMarkingId} disabled={saving} />
              <ChoiceGroup legend="Something to wear" options={accessoryOptions} selected={accessoryId} onSelect={setAccessoryId} disabled={saving} />

              <button className="action-card action-sun meet-button" type="submit" disabled={saving || name.trim().length === 0 || !speciesId}>
                <span className="action-title">Meet my Pal</span>
                <span className="action-description">
                  {speciesId ? 'This name and appearance stay in your local world.' : 'Choose a species first. None is selected for you.'}
                </span>
              </button>
            </form>
          </div>
        </section>
        <footer className="prototype-note" aria-live="polite"><span>{saveStatus}</span></footer>
      </main>
    );
  }

  if (!firstPal || !firstNeighbor || !village) {
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

  const latestStory = homeMemory?.summary
    ?? ceremonyMemory?.summary
    ?? firstMemory?.summary
    ?? `${firstPal.name} has met ${firstNeighbor.name}, but their first shared memory is still waiting.`;

  return (
    <main className="app-shell" aria-busy={saving} data-saving={saving}>
      <WorldNav
        view={view}
        hasHome={Boolean(ceremonyMemory)}
        hasJournal={world.memories.length > 0}
        disabled={saving}
        onChange={(nextView) => {
          setView(nextView);
          if (nextView === 'home') setHomeView('exterior');
        }}
      />

      {view === 'village' ? (
        <>
          <section className="storybook-panel world-panel" aria-labelledby="welcome-title">
            <div className="storybook-art world-art">
              <WillowmereScene className="willowmere-scene" showPlayMarker={Boolean(firstMemory)} showCeremonyMarker={Boolean(ceremonyMemory)} />
              <div className="pal-pair" aria-label={`${firstPal.name} and ${firstNeighbor.name} in ${village.name}`}>
                <PalPortrait
                  className="scene-pal scene-pal-first"
                  name={firstPal.name}
                  species={requireRenderableSpecies(firstPal.speciesId)}
                  paletteId={firstPal.appearance.paletteId}
                  markingId={firstPal.appearance.markingId}
                  accessoryId={firstPal.appearance.accessoryId}
                  expression={firstMemory ? 'delighted' : 'curious'}
                  pose={firstMemory ? 'playful' : 'standing'}
                />
                <PalPortrait
                  className="scene-pal scene-pal-fern"
                  name={firstNeighbor.name}
                  species={requireRenderableSpecies(firstNeighbor.speciesId)}
                  paletteId={firstNeighbor.appearance.paletteId}
                  markingId={firstNeighbor.appearance.markingId}
                  accessoryId={firstNeighbor.appearance.accessoryId}
                  expression={firstMemory ? 'delighted' : 'content'}
                  pose={firstMemory ? 'playful' : 'standing'}
                />
              </div>
            </div>

            <div className="welcome-copy world-copy">
              <p className="eyebrow">Welcome to {village.name}</p>
              <h1 id="welcome-title">{firstPal.name}</h1>
              <p className="tagline">Where every friendship changes the world.</p>
              <p className="intro">{latestStory}</p>
              {firstPreference?.discovered ? <p className="discovery"><strong>Discovered:</strong> {firstPreference.label}</p> : null}
            </div>
          </section>

          {!firstMemory ? (
            <section className="action-grid" aria-label="Choose a first shared activity">
              {activityOptions.map((activity) => (
                <button
                  className="action-card activity-card"
                  type="button"
                  disabled={saving}
                  key={activity.id}
                  onClick={() => runWorldAction(() => completeFirstActivity(world, activity.id))}
                >
                  <span className="activity-portrait" aria-hidden="true">
                    <PalPortrait
                      name={firstPal.name}
                      species={requireRenderableSpecies(firstPal.speciesId)}
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
              <button className="action-card action-sun memory-card" type="button" disabled={saving} onClick={() => setView('journal')}>
                <span className="action-title">Read the New Memory</span>
                <span className="action-description">{firstMemory.title}</span>
              </button>
              <article className="action-card action-leaf memory-card">
                <span className="action-title">A Friendship Began</span>
                <span className="action-description">{firstNeighbor.name} is now part of this world’s growing legacy.</span>
              </article>
              <button className="action-card action-clay ceremony-button" type="button" disabled={saving} onClick={() => runWorldAction(() => completeFirstFriendshipCeremony(world))}>
                <span className="action-title">Visit the Great Tree</span>
                <span className="action-description">Let {village.name} recognize the friendship they have begun.</span>
              </button>
            </section>
          ) : (
            <section className="action-grid" aria-label="First friendship ceremony complete">
              <button className="action-card action-sun memory-card" type="button" disabled={saving} onClick={() => setView('journal')}>
                <span className="action-title">Open the Journal</span>
                <span className="action-description">Read the moments {village.name} already remembers.</span>
              </button>
              <button className="action-card action-leaf memory-card" type="button" disabled={saving} onClick={() => { setHomeView('exterior'); setView('home'); }}>
                <span className="action-title">Visit {firstPal.name}’s Home</span>
                <span className="action-description">Choose the first object that will make it feel personal.</span>
              </button>
              <article className="action-card action-clay memory-card">
                <span className="action-title">The World Changed</span>
                <span className="action-description">The play stones and friendship ribbons remain after the tablet closes.</span>
              </article>
            </section>
          )}
        </>
      ) : null}

      {view === 'home' && ceremonyMemory && firstHome ? (
        <>
          <section className="storybook-panel home-panel" aria-labelledby="home-title">
            <div className="storybook-art home-art">
              <HomeScene className="home-scene" view={homeView} chosenObjectId={firstHome.chosenObjectId} />
              {homeView === 'interior' ? (
                <PalPortrait
                  className="home-pal"
                  name={firstPal.name}
                  species={requireRenderableSpecies(firstPal.speciesId)}
                  paletteId={firstPal.appearance.paletteId}
                  markingId={firstPal.appearance.markingId}
                  accessoryId={firstPal.appearance.accessoryId}
                  expression={firstHome.chosenObjectId ? 'content' : 'curious'}
                />
              ) : null}
            </div>
            <div className="welcome-copy home-copy">
              <p className="eyebrow">A place in {village.name}</p>
              <h1 id="home-title">{firstPal.name}’s Home</h1>
              <p className="intro">
                {homeView === 'exterior'
                  ? 'A quiet roundhouse waits beside the village path. The inside is simple, warm, and ready to become personal.'
                  : homeMemory?.summary ?? 'Choose one object that feels right. There is no best choice, only the beginning of a home.'}
              </p>
              <button className="inline-action" type="button" disabled={saving} onClick={() => setHomeView(homeView === 'exterior' ? 'interior' : 'exterior')}>
                {homeView === 'exterior' ? 'Go inside' : 'Step outside'}
              </button>
            </div>
          </section>

          {homeView === 'interior' && !firstHome.chosenObjectId ? (
            <section className="action-grid" aria-label="Choose the first home object">
              {homeObjectOptions.map((option) => (
                <button className="action-card home-object-card" type="button" disabled={saving} key={option.id} onClick={() => runWorldAction(() => chooseFirstHomeObject(world, option.id))}>
                  <span className="home-object-symbol" aria-hidden="true">{option.id === 'window-cushion' ? '◒' : option.id === 'memory-shelf' ? '▤' : '◇'}</span>
                  <span className="action-title">{option.title}</span>
                  <span className="action-description">{option.description}</span>
                </button>
              ))}
            </section>
          ) : null}

          {homeView === 'interior' && firstHome.chosenObjectId ? (
            <section className="action-grid" aria-label="Home object chosen">
              <article className="action-card action-sun memory-card">
                <span className="action-title">It Feels Like Home</span>
                <span className="action-description">The chosen object will remain here as this household grows.</span>
              </article>
              <button className="action-card action-leaf memory-card" type="button" disabled={saving} onClick={() => setView('journal')}>
                <span className="action-title">Read the New Memory</span>
                <span className="action-description">The journal now remembers this first personal choice.</span>
              </button>
              <button className="action-card action-clay memory-card" type="button" disabled={saving} onClick={() => setView('village')}>
                <span className="action-title">Return to {village.name}</span>
                <span className="action-description">The house will be waiting exactly as it is.</span>
              </button>
            </section>
          ) : null}
        </>
      ) : null}

      {view === 'journal' ? <MemoryJournal world={world} firstPal={firstPal} /> : null}

      <ParentTestTools
        world={world}
        onStatus={setSaveStatus}
        onResetComplete={() => {
          setWorld(null);
          setName('');
          setSpeciesId(null);
          setView('village');
          setHomeView('exterior');
          setSaveStatus('Playtest world cleared. A new story can begin.');
        }}
      />

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
  disabled?: boolean;
};

function ChoiceGroup<T extends string>({ legend, options, selected, onSelect, disabled = false }: ChoiceGroupProps<T>) {
  return (
    <fieldset className="choice-group" disabled={disabled}>
      <legend className="action-title">{legend}</legend>
      <div className="choice-row">
        {options.map((option) => (
          <button key={option.id} type="button" className="choice-button" aria-pressed={selected === option.id} disabled={disabled} onClick={() => onSelect(option.id)}>
            {option.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

type WorldNavProps = {
  view: AppView;
  hasHome: boolean;
  hasJournal: boolean;
  disabled?: boolean;
  onChange: (view: AppView) => void;
};

function WorldNav({ view, hasHome, hasJournal, disabled = false, onChange }: WorldNavProps) {
  return (
    <nav className="world-nav" aria-label="World places">
      <button type="button" aria-pressed={view === 'village'} disabled={disabled} onClick={() => onChange('village')}>Village</button>
      <button type="button" aria-pressed={view === 'home'} disabled={disabled || !hasHome} onClick={() => onChange('home')}>Home</button>
      <button type="button" aria-pressed={view === 'journal'} disabled={disabled || !hasJournal} onClick={() => onChange('journal')}>Journal</button>
    </nav>
  );
}
