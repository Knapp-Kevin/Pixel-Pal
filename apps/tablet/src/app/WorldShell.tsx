import type { World } from '@pixel-pals/content-schema';
import type { FirstActivity } from '@pixel-pals/simulation';
import { MemoryJournal } from '../MemoryJournal';
import { ParentTestTools } from '../ParentTestTools';
import { HomeView } from './HomeView';
import type { AppView, HomeView as HomeViewMode } from './options';
import type { WorldSave } from './useWorldSave';
import { VillageView } from './VillageView';
import { WorldNav } from './WorldNav';
import type { WorldScene } from './worldQueries';

type WorldShellProps = {
  world: World;
  scene: WorldScene;
  save: WorldSave;
  view: AppView;
  setView: (view: AppView) => void;
  homeView: HomeViewMode;
  setHomeView: (view: HomeViewMode) => void;
  onStartActivity: (activity: FirstActivity) => void;
  onReset: () => void;
};

function WorldFooter({ saveStatus, memoryCount }: { saveStatus: string; memoryCount: number }) {
  return (
    <footer className="prototype-note" aria-live="polite">
      <span>{saveStatus}</span>
      <span>{memoryCount} remembered moment{memoryCount === 1 ? '' : 's'}</span>
    </footer>
  );
}

function WorldViews({ world, scene, save, view, setView, homeView, setHomeView, onStartActivity }: WorldShellProps) {
  const showHome = view === 'home' && Boolean(scene.ceremonyMemory) && scene.firstHome !== undefined;

  if (view === 'village') {
    return (
      <VillageView
        world={world}
        scene={scene}
        saving={save.saving}
        runWorldAction={save.runWorldAction}
        onStartActivity={onStartActivity}
        onOpenJournal={() => setView('journal')}
        onVisitHome={() => {
          setHomeView('exterior');
          setView('home');
        }}
      />
    );
  }

  if (showHome && scene.firstHome) {
    return (
      <HomeView
        world={world}
        scene={scene}
        firstHome={scene.firstHome}
        saving={save.saving}
        homeView={homeView}
        setHomeView={setHomeView}
        runWorldAction={save.runWorldAction}
        onOpenJournal={() => setView('journal')}
        onReturnVillage={() => setView('village')}
      />
    );
  }

  if (view === 'journal') return <MemoryJournal world={world} firstPal={scene.firstPal} />;
  return null;
}

export function WorldShell(props: WorldShellProps) {
  const { world, scene, save, view, setView, setHomeView, onReset } = props;

  return (
    <main className="app-shell" aria-busy={save.saving} data-saving={save.saving}>
      <WorldNav
        view={view}
        hasHome={Boolean(scene.ceremonyMemory)}
        hasJournal={world.memories.length > 0}
        disabled={save.saving}
        onChange={(nextView) => {
          setView(nextView);
          if (nextView === 'home') setHomeView('exterior');
        }}
      />
      <WorldViews {...props} />
      <ParentTestTools world={world} onStatus={save.setSaveStatus} onResetComplete={onReset} />
      <WorldFooter saveStatus={save.saveStatus} memoryCount={world.memories.length} />
    </main>
  );
}
