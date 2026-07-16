import type { AdventureId, World } from '@pixel-pals/content-schema';
import type { FirstActivity } from '@pixel-pals/simulation';
import { AdventureLibrary } from '../AdventureLibrary';
import { LocalWorldChooser } from '../LocalWorldChooser';
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
  onChooseDayInvitation: (invitationId: string) => void;
  onOpenAdventure: (adventureId: AdventureId) => void;
  onStartAdventure: (adventureId: AdventureId) => Promise<void>;
  onSwitchWorld: (worldId: string) => Promise<void>;
  onStartNewWorld: () => void;
  onDeleteWorld: () => Promise<void>;
};

function WorldFooter({ saveStatus, memoryCount, worldDay }: { saveStatus: string; memoryCount: number; worldDay: number }) {
  return (
    <footer className="prototype-note" aria-live="polite">
      <span>{saveStatus}</span>
      <span>Day {worldDay + 1} · {memoryCount} remembered moment{memoryCount === 1 ? '' : 's'}</span>
    </footer>
  );
}

function WorldViews({
  world,
  scene,
  save,
  view,
  setView,
  homeView,
  setHomeView,
  onStartActivity,
  onChooseDayInvitation,
  onOpenAdventure,
  onStartAdventure
}: WorldShellProps) {
  const showHome = view === 'home' && Boolean(scene.ceremonyMemory) && scene.firstHome !== undefined;

  if (view === 'village') {
    return (
      <VillageView
        world={world}
        scene={scene}
        saving={save.saving}
        runWorldAction={save.runWorldAction}
        onStartActivity={onStartActivity}
        onChooseDayInvitation={onChooseDayInvitation}
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

  if (view === 'adventures') {
    return (
      <AdventureLibrary
        world={world}
        scene={scene}
        saving={save.saving}
        onOpen={onOpenAdventure}
        onStart={onStartAdventure}
      />
    );
  }

  if (view === 'journal') return <MemoryJournal world={world} firstPal={scene.firstPal} />;
  return null;
}

export function WorldShell(props: WorldShellProps) {
  const {
    world,
    scene,
    save,
    view,
    setView,
    setHomeView,
    onSwitchWorld,
    onStartNewWorld,
    onDeleteWorld
  } = props;

  return (
    <main className="app-shell" aria-busy={save.saving} data-saving={save.saving}>
      <div className="world-toolbar">
        <WorldNav
          view={view}
          hasHome={Boolean(scene.ceremonyMemory)}
          hasAdventures={Boolean(scene.homeMemory)}
          hasJournal={world.memories.length > 0}
          disabled={save.saving}
          onChange={(nextView) => {
            setView(nextView);
            if (nextView === 'home') setHomeView('exterior');
          }}
        />
        <LocalWorldChooser
          worlds={save.worlds}
          selectedWorldId={world.worldId}
          disabled={save.saving}
          onSwitch={onSwitchWorld}
        />
      </div>
      <WorldViews {...props} />
      <ParentTestTools
        world={world}
        worlds={save.worlds}
        onStatus={save.setSaveStatus}
        onStartNewWorld={onStartNewWorld}
        onDeleteWorld={onDeleteWorld}
      />
      <WorldFooter saveStatus={save.saveStatus} memoryCount={world.memories.length} worldDay={world.worldDay} />
    </main>
  );
}
