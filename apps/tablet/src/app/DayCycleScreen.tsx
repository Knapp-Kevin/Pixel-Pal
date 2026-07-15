import type { ReactNode } from 'react';
import type { World } from '@pixel-pals/content-schema';
import {
  completeWorldDay,
  type FirstActivityCompletion,
  type WorldDayCompletion,
  type WorldDayInvitation
} from '@pixel-pals/simulation';
import { GardenGame } from '../GardenGame';
import { HomeDayScene } from '../HomeDayScene';
import { LeafChaseGame } from '../LeafChaseGame';
import { QuietVisitScene } from '../QuietVisitScene';
import { StoneStackingGame } from '../StoneStackingGame';
import { VillageHelpingScene } from '../VillageHelpingScene';
import type { WorldSave } from './useWorldSave';
import type { WorldScene } from './worldQueries';

type DayCycleScreenProps = {
  invitation: WorldDayInvitation;
  world: World;
  scene: WorldScene;
  save: WorldSave;
  onExit: () => void;
};

export function DayCycleScreen({ invitation, world, scene, save, onExit }: DayCycleScreenProps) {
  function finish(evidence: WorldDayCompletion): void {
    onExit();
    save.runWorldAction(() => completeWorldDay(world, invitation.id, evidence));
  }

  function cancel(): void {
    onExit();
    save.setSaveStatus('Nothing changed. This invitation will wait in Willowmere.');
  }

  const shared = {
    firstPal: scene.firstPal,
    friend: scene.firstNeighbor,
    onCancel: cancel
  };

  let content: ReactNode = null;
  if (invitation.kind === 'active' && invitation.activityId === 'garden-game') {
    content = <GardenGame {...shared} seed={world.seed + invitation.day} onComplete={(result: FirstActivityCompletion) => finish(result)} />;
  } else if (invitation.kind === 'active' && invitation.activityId === 'leaf-chase') {
    content = <LeafChaseGame {...shared} seed={world.seed + invitation.day} onComplete={(result: FirstActivityCompletion) => finish(result)} />;
  } else if (invitation.kind === 'active' && invitation.activityId === 'stone-stacking') {
    content = <StoneStackingGame {...shared} onComplete={(result: FirstActivityCompletion) => finish(result)} />;
  } else if (invitation.kind === 'quiet') {
    content = <QuietVisitScene {...shared} onComplete={finish} />;
  } else if (invitation.kind === 'home') {
    content = <HomeDayScene {...shared} invitation={invitation} onComplete={finish} />;
  } else if (invitation.kind === 'helping') {
    content = <VillageHelpingScene {...shared} invitation={invitation} onComplete={finish} />;
  }

  return (
    <main className="app-shell" aria-busy={save.saving} data-saving={save.saving}>
      {content ?? (
        <section className="day-scene-shell" aria-labelledby="unavailable-day-title">
          <header className="day-scene-header">
            <div>
              <p className="eyebrow">This invitation is still growing</p>
              <h1 id="unavailable-day-title">Return to Willowmere</h1>
              <p>This saved invitation is safe, but this version of the tablet does not yet have its playable scene.</p>
            </div>
            <button className="inline-action" type="button" onClick={cancel}>Return to Willowmere</button>
          </header>
        </section>
      )}
      <footer className="prototype-note" aria-live="polite">
        <span>{save.saveStatus}</span>
        <span>Day {invitation.day} in {scene.village.name}</span>
      </footer>
    </main>
  );
}
