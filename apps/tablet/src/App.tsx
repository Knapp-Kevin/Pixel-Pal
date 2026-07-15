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
      onReset={() => {
        save.setWorldDirect(null);
        setView('village');
        setHomeView('exterior');
        setActiveActivity(null);
        setActiveDayInvitationId(null);
        save.setSaveStatus('Playtest world cleared. A new story can begin.');
      }}
    />
  );
}
