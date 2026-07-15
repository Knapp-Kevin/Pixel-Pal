import { CURRENT_SCHEMA_VERSION, parseWorld, type World } from '@pixel-pals/content-schema';
import {
  ACTIVITY_LABELS,
  type FirstActivity,
  type FirstActivityCompletion,
  preferredFirstActivity,
  validateActivityCompletion
} from './activities';
import { getFirstNeighborContext } from './firstNeighbor';

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

export function completeFirstActivity(world: World, result: FirstActivityCompletion): World {
  if (world.memories.some((memory) => memory.eventType === 'first-shared-activity')) {
    return world;
  }

  validateActivityCompletion(result);

  const { firstPal, neighbor, relationship } = getFirstNeighborContext(world);
  const village = world.villages.find((candidate) => candidate.id === firstPal.homeVillageId);

  if (!village) {
    throw new Error('The first activity requires the first Pal’s home village.');
  }

  const memoryId = stableId('memory', world.seed, 'first-shared-activity');
  const preferred = preferredFirstActivity(world.seed) === result.activity;
  const preferenceLabel = preferred
    ? `Especially loves ${ACTIVITY_LABELS[result.activity]}`
    : `Enjoys ${ACTIVITY_LABELS[result.activity]} more with a friend`;

  return parseWorld({
    ...world,
    pals: world.pals.map((pal) =>
      pal.id === firstPal.id
        ? {
            ...pal,
            preferences: pal.preferences.map((preference) =>
              preference.id === 'first-play-preference'
                ? { ...preference, label: preferenceLabel, discovered: true }
                : preference
            ),
            characteristics: pal.characteristics.map((characteristic) =>
              characteristic.id === 'confidence'
                ? {
                    ...characteristic,
                    value: Math.min(1, characteristic.value + (preferred ? 0.2 : 0.1)),
                    confidence: Math.min(1, characteristic.confidence + 0.2)
                  }
                : characteristic
            )
          }
        : pal
    ),
    relationships: world.relationships.map((candidate) =>
      candidate.id === relationship.id
        ? {
            ...candidate,
            label: 'friend',
            familiarity: Math.min(1, candidate.familiarity + 0.25),
            trust: Math.min(1, candidate.trust + 0.2),
            warmth: Math.min(1, candidate.warmth + (preferred ? 0.3 : 0.2)),
            respect: Math.min(1, candidate.respect + 0.1),
            sharedHistory: Math.min(1, candidate.sharedHistory + 0.25)
          }
        : candidate
    ),
    memories: [
      ...world.memories,
      {
        id: memoryId,
        title: `${firstPal.name} and ${neighbor.name} played together`,
        participantPalIds: [firstPal.id, neighbor.id],
        villageId: village.id,
        eventType: 'first-shared-activity',
        emotionalTone: preferred ? 'joyful' : 'playful',
        summary: `${firstPal.name} and ${neighbor.name} worked together while ${ACTIVITY_LABELS[result.activity]}. They left knowing each other a little better.`,
        worldDay: world.worldDay,
        significance: 0.6
      }
    ],
    villages: world.villages.map((candidate) =>
      candidate.id === village.id && !candidate.visibleChanges.includes('shared-play-stones')
        ? { ...candidate, visibleChanges: [...candidate.visibleChanges, 'shared-play-stones'] }
        : candidate
    )
  });
}
