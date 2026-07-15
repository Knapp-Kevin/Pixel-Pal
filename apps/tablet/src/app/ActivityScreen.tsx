import type { World } from '@pixel-pals/content-schema';
import { completeFirstActivity } from '@pixel-pals/simulation';
import { StoneStackingGame } from '../StoneStackingGame';
import type { WorldSave } from './useWorldSave';
import type { WorldScene } from './worldQueries';

type ActivityScreenProps = {
  world: World;
  scene: WorldScene;
  save: WorldSave;
  onExit: () => void;
};

export function ActivityScreen({ world, scene, save, onExit }: ActivityScreenProps) {
  return (
    <main className="app-shell" aria-busy={save.saving} data-saving={save.saving}>
      <StoneStackingGame
        firstPal={scene.firstPal}
        friend={scene.firstNeighbor}
        onCancel={() => {
          onExit();
          save.setSaveStatus('The stones will be waiting when you are ready.');
        }}
        onComplete={(result) => {
          onExit();
          save.runWorldAction(() => completeFirstActivity(world, result));
        }}
      />
      <footer className="prototype-note" aria-live="polite">
        <span>{save.saveStatus}</span>
        <span>Playing together in {scene.village.name}</span>
      </footer>
    </main>
  );
}
