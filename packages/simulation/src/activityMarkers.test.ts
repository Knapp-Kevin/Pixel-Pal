import { describe, expect, it } from 'vitest';
import { completeFirstActivity, createFirstWorld, type FirstActivity } from './index';

const markerByActivity: Record<FirstActivity, string> = {
  'leaf-chase': 'shared-play-leaf-garland',
  'stone-stacking': 'shared-play-stones',
  'garden-game': 'shared-play-garden-blooms'
};

const actionsByActivity: Record<FirstActivity, number> = {
  'leaf-chase': 5,
  'stone-stacking': 3,
  'garden-game': 4
};

function worldFor(activity: FirstActivity) {
  const world = createFirstWorld({
    worldId: `marker-${activity}`,
    worldName: 'Marker Test',
    seed: 42,
    firstPal: {
      name: 'Pip',
      speciesId: 'fox',
      paletteId: 'sunleaf',
      markingId: 'tail-tip',
      accessoryId: 'scarf'
    }
  });

  return completeFirstActivity(world, {
    activity,
    completed: true,
    successfulActions: actionsByActivity[activity],
    cooperativeTurns: actionsByActivity[activity] + 2,
    attempts: actionsByActivity[activity]
  });
}

describe('activity world markers', () => {
  it.each(Object.entries(markerByActivity) as Array<[FirstActivity, string]>)('records only the %s marker', (activity, marker) => {
    const world = worldFor(activity);
    const changes = world.villages.find((village) => village.id === 'willowmere')?.visibleChanges ?? [];

    expect(changes).toContain(marker);
    expect(changes.filter((change) => change.startsWith('shared-play-'))).toEqual([marker]);
  });
});
