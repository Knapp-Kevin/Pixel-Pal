import type { World } from '@pixel-pals/content-schema';
import { completeFirstActivity, type FirstActivity } from '@pixel-pals/simulation';
import { LeafChaseGame } from '../LeafChaseGame';
import { StoneStackingGame } from '../StoneStackingGame';
import type { WorldSave } from './useWorldSave';
import type { WorldScene } from './worldQueries';

type ActivityScreenProps = {
  activity: FirstActivity;
  world: World;
  scene: WorldScene;
  save: WorldSave;
  onExit: () => void;
};

export function ActivityScreen({ activity, world, scene, save, onExit }: ActivityScreenProps) {
  const sharedProps = {
    firstPal: scene.firstPal,
    friend: scene.firstNeighbor,
    onCancel: () => {
      onExit();
      save.setSaveStatus('The game will be waiting when you are ready.');
    },
    onComplete: (result: Parameters<typeof completeFirstActivity>[1]) => {
      onExit();
      save.runWorldAction(() => completeFirstActivity(world, result));
    }
  };

  return (
    <main className="app-shell" aria-busy={save.saving} data-saving={save.saving}>
      {activity === 'leaf-chase' ? <LeafChaseGame {...sharedProps} seed={world.seed} /> : null}
      {activity === 'stone-stacking' ? <StoneStackingGame {...sharedProps} /> : null}
      <footer className="prototype-note" aria-live="polite">
        <span>{save.saveStatus}</span>
        <span>Playing together in {scene.village.name}</span>
      </footer>
    </main>
  );
}
