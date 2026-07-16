import type { AdventureId, World } from '@pixel-pals/content-schema';
import { ADVENTURES, activeAdventureSession, adventureSession, availableAdventures } from '@pixel-pals/simulation';
import type { WorldScene } from './app/worldQueries';

const ADVENTURE_SYMBOLS: Record<AdventureId, string> = {
  'lanterns-in-the-rain': '◇',
  'humming-bridge': '♪'
};

type AdventureLibraryProps = {
  world: World;
  scene: WorldScene;
  saving: boolean;
  onOpen: (adventureId: AdventureId) => void;
  onStart: (adventureId: AdventureId) => Promise<void>;
};

export function AdventureLibrary({ world, scene, saving, onOpen, onStart }: AdventureLibraryProps) {
  const definitions = availableAdventures(world);
  const active = activeAdventureSession(world);

  return (
    <section className="adventure-library" aria-labelledby="adventure-library-title">
      <header className="adventure-library-header">
        <div>
          <p className="eyebrow">Shared journeys from Willowmere</p>
          <h1 id="adventure-library-title">Adventures</h1>
          <p>
            {scene.firstPal.name} and {scene.firstNeighbor.name} can explore one illustrated story at a time. Every choice is a caring way forward.
          </p>
        </div>
      </header>

      <div className="adventure-card-grid">
        {definitions.map((definition) => {
          const session = adventureSession(world, definition.id);
          const blockedByAnother = Boolean(active && active.adventureId !== definition.id);
          const state = session?.status === 'completed'
            ? 'Remembered'
            : session?.status === 'active'
              ? `Stage ${session.stageIndex + 1} of 3`
              : blockedByAnother
                ? 'Another adventure is waiting'
                : 'Ready to begin';

          return (
            <article className={`adventure-card adventure-card-${definition.id}`} key={definition.id}>
              <span className="adventure-card-symbol" aria-hidden="true">{ADVENTURE_SYMBOLS[definition.id]}</span>
              <div>
                <span className="adventure-card-state">{state}</span>
                <h2>{definition.title}</h2>
                <p>{definition.summary}</p>
              </div>
              <button
                className="adult-action adventure-open-button"
                type="button"
                disabled={saving || blockedByAnother}
                onClick={() => {
                  if (session) {
                    onOpen(definition.id);
                  } else {
                    void onStart(definition.id);
                  }
                }}
              >
                {session?.status === 'completed' ? 'Read this memory' : session?.status === 'active' ? 'Continue the adventure' : 'Begin the adventure'}
              </button>
            </article>
          );
        })}
      </div>

      {definitions.length === 0 ? (
        <article className="adventure-locked-note">
          <h2>Adventures are still gathering</h2>
          <p>Begin a friendship and make the first home feel personal. Then Willowmere will have longer stories to share.</p>
        </article>
      ) : null}
    </section>
  );
}
