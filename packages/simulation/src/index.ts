import { CURRENT_SCHEMA_VERSION, parseWorld, type World } from '@pixel-pals/content-schema';

export { completeFirstActivity } from './completeActivity';
export type { FirstActivity, FirstActivityCompletion } from './activities';

export type FirstPalChoice = {
  name: string;
  speciesId: 'fox' | 'deer' | 'rabbit' | 'cat' | 'duck';
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
  rabbit: 'lagomorph',
  cat: 'feline',
  duck: 'waterfowl'
};

const FIRST_PAL_PROFILES = [
  [
    { id: 'curiosity', value: 0.55, confidence: 0.15 },
    { id: 'confidence', value: -0.05, confidence: 0.1 },
    { id: 'patience', value: 0.2, confidence: 0.1 }
  ],
  [
    { id: 'curiosity', value: 0.2, confidence: 0.15 },
    { id: 'confidence', value: 0.4, confidence: 0.15 },
    { id: 'playfulness', value: 0.35, confidence: 0.1 }
  ],
  [
    { id: 'curiosity', value: 0.35, confidence: 0.15 },
    { id: 'confidence', value: 0.1, confidence: 0.1 },
    { id: 'patience', value: 0.55, confidence: 0.15 }
  ]
] as const;

function stableId(prefix: string, seed: number, suffix: string): string {
  return `${prefix}-${seed.toString(36)}-${suffix}`;
}

function firstPalCharacteristics(seed: number) {
  const profile = FIRST_PAL_PROFILES[seed % FIRST_PAL_PROFILES.length] ?? FIRST_PAL_PROFILES[0];
  return profile.map((characteristic) => ({ ...characteristic }));
}

export function createFirstWorld(input: CreateWorldInput): World {
  const firstPalId = stableId('pal', input.seed, 'first');
  const residentId = stableId('pal', input.seed, 'neighbor');
  const villageId = 'willowmere';
  const treeId = 'willowmere-great-tree';
  const homeId = stableId('home', input.seed, 'first');

  return parseWorld({
    schemaVersion: CURRENT_SCHEMA_VERSION,
    worldId: input.worldId,
    worldName: input.worldName,
    seed: input.seed,
    worldDay: 0,
    firstPalId,
    species: [
      { id: 'fox', name: 'Fox', bodyFamily: 'canine', canonStatus: 'game' },
      { id: 'deer', name: 'Deer', bodyFamily: 'cervid', canonStatus: 'game' },
      { id: 'rabbit', name: 'Rabbit', bodyFamily: 'lagomorph', canonStatus: 'game' },
      { id: 'cat', name: 'Cat', bodyFamily: 'feline', canonStatus: 'game' },
      { id: 'duck', name: 'Duck', bodyFamily: 'waterfowl', canonStatus: 'game' }
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
        householdId: homeId,
        appearance: {
          bodyFamily: BODY_FAMILY_BY_SPECIES[input.firstPal.speciesId],
          paletteId: input.firstPal.paletteId,
          markingId: input.firstPal.markingId,
          accessoryId: input.firstPal.accessoryId
        },
        preferences: [
          { id: 'first-play-preference', kind: 'activity', label: 'A favorite way to play is still unknown', discovered: false }
        ],
        characteristics: firstPalCharacteristics(input.seed),
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
        storyRole: 'first-neighbor',
        artIdentity: 'fern',
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
    homes: [
      {
        id: homeId,
        villageId,
        residentPalIds: [firstPalId],
        styleId: 'willowmere-roundhouse',
        visibleChanges: []
      }
    ],
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
