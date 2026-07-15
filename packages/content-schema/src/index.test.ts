import { describe, expect, it } from 'vitest';
import { CURRENT_SCHEMA_VERSION, parseWorld } from './index';

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

describe('parseWorld versioned migration', () => {
  it('adds a deterministic first home to a version 1 save', () => {
    const world = parseWorld(earlierSave);

    expect(world.schemaVersion).toBe(CURRENT_SCHEMA_VERSION);
    expect(world.homes).toHaveLength(1);
    expect(world.homes[0]?.id).toBe('home-16-first');
    expect(world.homes[0]?.residentPalIds).toEqual(['pal-16-first']);
    expect(world.pals[0]?.householdId).toBe('home-16-first');
  });

  it('preserves an existing home and repairs the household link', () => {
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
    expect(withHome.pals[0]?.householdId).toBe('custom-home');
  });

  it('rejects unsupported schema versions', () => {
    expect(() => parseWorld({ ...earlierSave, schemaVersion: 999 })).toThrow();
  });
});

describe('WorldSchema adversarial invariants', () => {
  const validWorld = parseWorld(earlierSave);

  it('rejects duplicate entity identities', () => {
    expect(() => parseWorld({
      ...validWorld,
      pals: [...validWorld.pals, { ...validWorld.pals[0], isFirstPal: false }]
    })).toThrow(/duplicate/i);
  });

  it('rejects memories with missing participants', () => {
    expect(() => parseWorld({
      ...validWorld,
      memories: [
        {
          id: 'memory-broken',
          title: 'A broken memory',
          participantPalIds: ['missing-pal'],
          villageId: 'willowmere',
          eventType: 'broken-event',
          emotionalTone: 'uncertain',
          summary: 'This memory points at someone who is not in the world.',
          worldDay: 0,
          significance: 0.2
        }
      ]
    })).toThrow(/unknown Pal/i);
  });

  it('rejects Great Tree recognition of nonexistent memories', () => {
    expect(() => parseWorld({
      ...validWorld,
      greatTrees: validWorld.greatTrees.map((tree) => ({
        ...tree,
        recognizedMemoryIds: ['missing-memory']
      }))
    })).toThrow(/unknown memory/i);
  });

  it('rejects a chosen home object that is not visibly present', () => {
    expect(() => parseWorld({
      ...validWorld,
      homes: validWorld.homes.map((home) => ({
        ...home,
        chosenObjectId: 'story-lantern',
        visibleChanges: []
      }))
    })).toThrow(/chosen object/i);
  });

  it('rejects duplicate story roles', () => {
    const secondPal = {
      ...validWorld.pals[0],
      id: 'pal-second',
      name: 'Second',
      isFirstPal: false,
      householdId: undefined,
      storyRole: 'first-neighbor'
    };

    expect(() => parseWorld({
      ...validWorld,
      pals: [
        { ...validWorld.pals[0], storyRole: 'first-neighbor' },
        secondPal
      ],
      villages: validWorld.villages.map((village) => ({
        ...village,
        residentPalIds: [...village.residentPalIds, secondPal.id]
      }))
    })).toThrow(/story roles/i);
  });
});
