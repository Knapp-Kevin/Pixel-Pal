import { describe, expect, it } from 'vitest';
import { parseWorld } from './index';

const earlierSave = {
  schemaVersion: 1 as const,
  worldId: 'earlier-save',
  worldName: 'Earlier World',
  seed: 42,
  worldDay: 0,
  firstPalId: 'pal-16-first',
  species: [
    { id: 'fox', name: 'Fox', bodyFamily: 'canine', canonStatus: 'game' as const }
  ],
  lineages: [],
  pals: [
    {
      id: 'pal-16-first',
      name: 'Pip',
      isFirstPal: true,
      lifeStage: 'youth' as const,
      speciesId: 'fox',
      homeVillageId: 'willowmere',
      appearance: {
        bodyFamily: 'canine',
        paletteId: 'sunleaf',
        markingId: 'tail-tip'
      },
      preferences: [],
      characteristics: [],
      skills: [],
      createdBy: 'player' as const
    }
  ],
  relationships: [],
  memories: [],
  villages: [
    {
      id: 'willowmere',
      name: 'Willowmere',
      regionId: 'willowmere-wood',
      greatTreeId: 'willowmere-great-tree',
      canonStatus: 'game' as const,
      residentPalIds: ['pal-16-first'],
      visibleChanges: []
    }
  ],
  greatTrees: [
    {
      id: 'willowmere-great-tree',
      villageId: 'willowmere',
      recognizedMemoryIds: [],
      visualHistoryMarkers: []
    }
  ]
};

describe('parseWorld home migration', () => {
  it('adds a deterministic first home to an earlier save', () => {
    const world = parseWorld(earlierSave);

    expect(world.homes).toHaveLength(1);
    expect(world.homes[0]?.id).toBe('home-16-first');
    expect(world.homes[0]?.residentPalIds).toEqual(['pal-16-first']);
    expect(world.pals[0]?.householdId).toBe('home-16-first');
  });

  it('does not replace an existing home', () => {
    const withHome = parseWorld({
      ...earlierSave,
      homes: [
        {
          id: 'custom-home',
          villageId: 'willowmere',
          residentPalIds: ['pal-16-first'],
          styleId: 'custom-style',
          chosenObjectId: 'story-lantern',
          visibleChanges: ['story-lantern']
        }
      ]
    });

    expect(withHome.homes).toHaveLength(1);
    expect(withHome.homes[0]?.id).toBe('custom-home');
    expect(withHome.homes[0]?.chosenObjectId).toBe('story-lantern');
  });
});
