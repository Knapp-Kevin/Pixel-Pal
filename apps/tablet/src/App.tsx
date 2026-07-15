import { useState } from 'react';
import type { FirstActivity } from '@pixel-pals/simulation';
import { ActivityScreen } from './app/ActivityScreen';
import { CreationPanel } from './app/CreationPanel';
import type { AppView, HomeView } from './app/options';
import { LoadingPanel, RepairPanel } from './app/StatusPanels';
import { useWorldSave } from './app/useWorldSave';
import { selectWorldScene } from './app/worldQueries';
import { WorldShell } from './app/WorldShell';

export function App() {
  const save = useWorldSave();
  const [view, setView] = useState<AppView>('village');
  const [homeView, setHomeView] = useState<HomeView>('exterior');
  const [activeActivity, setActiveActivity] = useState<FirstActivity | null>(null);

  if (save.loading) return <LoadingPanel />;

  if (!save.world) {
    return <CreationPanel saving={save.saving} saveStatus={save.saveStatus} persist={save.persist} onCreateError={save.setSaveStatus} />;
  }

  const scene = selectWorldScene(save.world);
  if (!scene) return <RepairPanel />;

  if (activeActivity && !scene.firstMemory) {
    return (
      <ActivityScreen
        activity={activeActivity}
        world={save.world}
        scene={scene}
        save={save}
        onExit={() => setActiveActivity(null)}
      />
    );
  }

  return (
    <WorldShell
      world={save.world}
      scene={scene}
      save={save}
      view={view}
      setView={setView}
      homeView={homeView}
      setHomeView={setHomeView}
      onStartActivity={setActiveActivity}
      onReset={() => {
        save.setWorldDirect(null);
        setView('village');
        setHomeView('exterior');
        setActiveActivity(null);
        save.setSaveStatus('Playtest world cleared. A new story can begin.');
      }}
    />
  );
}
