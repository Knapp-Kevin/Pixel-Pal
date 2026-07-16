import { useState } from 'react';
import { currentOfferedDay, type FirstActivity, type WorldDayInvitation } from '@pixel-pals/simulation';
import { ActivityScreen } from './app/ActivityScreen';
import { CreationPanel } from './app/CreationPanel';
import { DayCycleScreen } from './app/DayCycleScreen';
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
  const [activeDayInvitationId, setActiveDayInvitationId] = useState<string | null>(null);
  const [creatingNewWorld, setCreatingNewWorld] = useState(false);

  function resetTransientViews(): void {
    setView('village');
    setHomeView('exterior');
    setActiveActivity(null);
    setActiveDayInvitationId(null);
  }

  if (save.loading) return <LoadingPanel />;

  if (creatingNewWorld || !save.world) {
    return (
      <CreationPanel
        saving={save.saving}
        saveStatus={save.saveStatus}
        persist={save.persist}
        onCreateError={save.setSaveStatus}
        existingWorldCount={save.worlds.length}
        onCreated={() => {
          setCreatingNewWorld(false);
          resetTransientViews();
        }}
        onCancel={save.world ? () => setCreatingNewWorld(false) : undefined}
      />
    );
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

  const offeredDay = currentOfferedDay(save.world);
  const activeDayInvitation: WorldDayInvitation | undefined = offeredDay?.invitations.find(
    (invitation) => invitation.id === activeDayInvitationId
  );

  if (activeDayInvitation) {
    return (
      <DayCycleScreen
        invitation={activeDayInvitation}
        world={save.world}
        scene={scene}
        save={save}
        onExit={() => setActiveDayInvitationId(null)}
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
      onChooseDayInvitation={setActiveDayInvitationId}
      onSwitchWorld={async (worldId) => {
        await save.switchWorld(worldId);
        resetTransientViews();
      }}
      onStartNewWorld={() => {
        resetTransientViews();
        setCreatingNewWorld(true);
        save.setSaveStatus('The current worlds remain safe while another story begins.');
      }}
      onDeleteWorld={async () => {
        await save.removeWorld(save.world!.worldId);
        resetTransientViews();
      }}
    />
  );
}
