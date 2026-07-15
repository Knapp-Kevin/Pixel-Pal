import { parseWorld, type World } from '@pixel-pals/content-schema';
import {
  ACTIVITY_LABELS,
  ACTIVITY_WORLD_MARKERS,
  preferredFirstActivity,
  validateActivityCompletion,
  type FirstActivityCompletion
} from './activities';
import { getFirstNeighborContext } from './firstNeighbor';

function stableMemoryId(seed: number): string {
  return `memory-${seed.toString(36)}-first-shared-activity`;
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

  const preferred = preferredFirstActivity(world.seed) === result.activity;
  const preferenceLabel = preferred
    ? `Especially loves ${ACTIVITY_LABELS[result.activity]}`
    : `Enjoys ${ACTIVITY_LABELS[result.activity]} more with a friend`;
  const worldMarker = ACTIVITY_WORLD_MARKERS[result.activity];

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
        id: stableMemoryId(world.seed),
        title: `${firstPal.name} and ${neighbor.name} played together`,
        participantPalIds: [firstPal.id, neighbor.id],
        villageId: village.id,
        eventType: 'first-shared-activity',
        activityId: result.activity,
        emotionalTone: preferred ? 'joyful' : 'playful',
        summary: `${firstPal.name} and ${neighbor.name} worked together while ${ACTIVITY_LABELS[result.activity]}. They left knowing each other a little better.`,
        worldDay: world.worldDay,
        significance: 0.6
      }
    ],
    villages: world.villages.map((candidate) =>
      candidate.id === village.id && !candidate.visibleChanges.includes(worldMarker)
        ? { ...candidate, visibleChanges: [...candidate.visibleChanges, worldMarker] }
        : candidate
    )
  });
}
