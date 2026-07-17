import { type ReactNode, useEffect, useState } from 'react';
import type { World } from '@pixel-pals/content-schema';
import { deleteWorld, listWorlds, loadWorld, type WorldSummary } from '@pixel-pals/persistence';
import { ParentTestTools } from './ParentTestTools';
import { inspectTabletProfileCompatibility } from './tabletProfile';

type TabletProfileBoundaryProps = {
  children: ReactNode;
};

export function TabletProfileBoundary({ children }: TabletProfileBoundaryProps) {
  const [world, setWorld] = useState<World | null>(null);
  const [worlds, setWorlds] = useState<WorldSummary[]>([]);
  const [checked, setChecked] = useState(false);
  const [status, setStatus] = useState('The saved world remains unchanged.');

  useEffect(() => {
    void loadWorld()
      .then(async (savedWorld) => {
        setWorld(savedWorld);
        setWorlds(await listWorlds());
      })
      .catch(() => {
        setWorld(null);
        setWorlds([]);
      })
      .finally(() => setChecked(true));
  }, []);

  if (!checked) {
    return (
      <main className="app-shell">
        <section className="storybook-panel loading-panel">
          <div className="welcome-copy">
            <p className="eyebrow">Opening your story</p>
            <h1>Pixel Pals</h1>
            <p className="intro">Checking that this version can show every Pal correctly…</p>
          </div>
        </section>
      </main>
    );
  }

  if (!world) return <>{children}</>;

  const compatibility = inspectTabletProfileCompatibility(world);
  if (compatibility.compatible) return <>{children}</>;

  return (
    <main className="app-shell compatibility-shell">
      <section className="storybook-panel compatibility-panel" aria-labelledby="compatibility-title">
        <div className="compatibility-art" aria-hidden="true">
          <span className="compatibility-leaf">◆</span>
          <span className="compatibility-stars">· ✦ ·</span>
        </div>
        <div className="welcome-copy">
          <p className="eyebrow">This story is safe</p>
          <h1 id="compatibility-title">This version needs newer Pal artwork</h1>
          <p className="intro">
            Every Pal and memory is still saved exactly as it was. This tablet build will not show the wrong kind of Pal just to open the story.
          </p>
          <p className="intro">A parent can export this world, restore a compatible backup, or remove only this local world below.</p>
        </div>
      </section>

      <ParentTestTools
        world={world}
        worlds={worlds}
        saving={true}
        runWorldAction={() => setStatus('Family changes stay read-only until compatible Pal artwork is installed.')}
        onStatus={setStatus}
        onStartNewWorld={() => setStatus('Install a compatible tablet build before beginning another local world.')}
        onDeleteWorld={async () => {
          await deleteWorld(world.worldId);
          window.location.reload();
        }}
      />

      <footer className="prototype-note" aria-live="polite">
        <span>{status}</span>
        <span>Compatibility protection active</span>
      </footer>
    </main>
  );
}