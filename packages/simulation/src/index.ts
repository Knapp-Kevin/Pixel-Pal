import { parseWorld, type World } from '@pixel-pals/content-schema';

export type FirstPalChoice = {
  name: string;
  speciesId: 'fox' | 'deer' | 'rabbit';
  paletteId: 'sunleaf' | 'riverstone' | 'berrybloom';
  markingId: 'soft-mask' | 'freckles' | 'tail-tip';
  accessoryId?: 'scarf' | 'satchel' | 'leaf-pin';
};

export type CreateWorldInput = {
  worldId: string;
  worldName: string;
  seed: number;
  firstPal: FirstPalChoice;
};

const BODY_FAMILY_BY_SPECIES: Record<FirstPalChoice['speciesId'], string> = {
  fox: 'canine',
  deer: 'cervid',
  rabbit: 'lagomorph'
};

function stableId(prefix: string, seed: number, suffix: string): string {
  return `${prefix}-${seed.toString(36)}-${suffix}`;
}

export function createFirstWorld(input: CreateWorldInput): World {
  const firstPalId = stableId('pal', input.seed, 'first');
  const residentId = stableId('pal', input.seed, 'neighbor');
  const villageId = 'willowmere';
  const treeId = 'willowmere-great-tree';

  return parseWorld({
    schemaVersion: 1,
    worldId: input.worldId,
    worldName: input.worldName,
    seed: input.seed,
    worldDay: 0,
    firstPalId,
    species: [
      { id: 'fox', name: 'Fox', bodyFamily: 'canine', canonStatus: 'game' },
      { id: 'deer', name: 'Deer', bodyFamily: 'cervid', canonStatus: 'game' },
      { id: 'rabbit', name: 'Rabbit', bodyFamily: 'lagomorph', canonStatus: 'game' }
    ],
    lineages: [],
    pals: [
      {
        id: firstPalId,
        name: input.firstPal.name,
        isFirstPal: true,
        lifeStage: 'youth',
        speciesId: input.firstPal.speciesId,
        homeVillageId: villageId,
        appearance: {
          bodyFamily: BODY_FAMILY_BY_SPECIES[input.firstPal.speciesId],
          paletteId: input.firstPal.paletteId,
          markingId: input.firstPal.markingId,
          accessoryId: input.firstPal.accessoryId
        },
        preferences: [
          { id: 'first-play-preference', kind: 'activity', label: 'Unknown favorite game', discovered: false }
        ],
        characteristics: [
          { id: 'curiosity', value: 0.25, confidence: 0.15 },
          { id: 'confidence', value: 0, confidence: 0.1 }
        ],
        skills: [],
        createdBy: 'player'
      },
      {
        id: residentId,
        name: 'Fern',
        isFirstPal: false,
        lifeStage: 'youth',
        speciesId: 'rabbit',
        homeVillageId: villageId,
        appearance: {
          bodyFamily: 'lagomorph',
          paletteId: 'mosscream',
          markingId: 'ear-dapple'
        },
        preferences: [
          { id: 'garden-games', kind: 'activity', label: 'Garden games', discovered: true }
        ],
        characteristics: [
          { id: 'generosity', value: 0.45, confidence: 0.6 }
        ],
        skills: [
          { id: 'gardening', practice: 20, demonstratedLevel: 1 }
        ],
        createdBy: 'game'
      }
    ],
    relationships: [
      {
        id: stableId('relationship', input.seed, 'first-neighbor'),
        fromPalId: firstPalId,
        toPalId: residentId,
        label: 'acquaintance',
        familiarity: 0.1,
        trust: 0.05,
        warmth: 0.1,
        respect: 0.05,
        tension: 0,
        sharedHistory: 0
      }
    ],
    memories: [],
    villages: [
      {
        id: villageId,
        name: 'Willowmere',
        regionId: 'willowmere-wood',
        greatTreeId: treeId,
        canonStatus: 'game',
        residentPalIds: [firstPalId, residentId],
        visibleChanges: []
      }
    ],
    greatTrees: [
      {
        id: treeId,
        villageId,
        recognizedMemoryIds: [],
        visualHistoryMarkers: []
      }
    ]
  });
}
