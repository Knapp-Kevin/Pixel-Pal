import { parseWorld, type World } from '@pixel-pals/content-schema';
import { getFirstNeighborContext } from './firstNeighbor';

function stableId(prefix: string, seed: number, suffix: string): string {
  return `${prefix}-${seed.toString(36)}-${suffix}`;
}

export function completeFirstFriendshipCeremony(world: World): World {
  const sharedActivity = world.memories.find((memory) => memory.eventType === 'first-shared-activity');
  const existingCeremony = world.memories.find((memory) => memory.eventType === 'first-friendship-ceremony');

  if (existingCeremony) return world;
  if (!sharedActivity) {
    throw new Error('The first friendship ceremony requires a shared activity memory.');
  }

  const { firstPal, neighbor, relationship } = getFirstNeighborContext(world);
  const village = world.villages.find((candidate) => candidate.id === firstPal.homeVillageId);
  const tree = world.greatTrees.find((candidate) => candidate.id === village?.greatTreeId);

  if (!village || !tree) {
    throw new Error('The first friendship ceremony requires the first Pal’s village and Great Tree.');
  }

  if (!sharedActivity.participantPalIds.includes(firstPal.id) || !sharedActivity.participantPalIds.includes(neighbor.id)) {
    throw new Error('The shared activity memory does not belong to the first friendship.');
  }

  const ceremonyMemoryId = stableId('memory', world.seed, 'first-friendship-ceremony');
  const treeMarkerId = 'first-friendship-ribbon';

  return parseWorld({
    ...world,
    relationships: world.relationships.map((candidate) =>
      candidate.id === relationship.id
        ? {
            ...candidate,
            trust: Math.min(1, candidate.trust + 0.15),
            warmth: Math.min(1, candidate.warmth + 0.15),
            respect: Math.min(1, candidate.respect + 0.15),
            sharedHistory: Math.min(1, candidate.sharedHistory + 0.2)
          }
        : candidate
    ),
    memories: [
      ...world.memories,
      {
        id: ceremonyMemoryId,
        title: `${firstPal.name} and ${neighbor.name} were welcomed as friends`,
        participantPalIds: [firstPal.id, neighbor.id],
        villageId: village.id,
        eventType: 'first-friendship-ceremony',
        emotionalTone: 'hopeful',
        summary: `Beneath ${village.name}’s Great Tree, ${firstPal.name} and ${neighbor.name} tied a ribbon for the friendship they had begun.`,
        worldDay: world.worldDay,
        significance: 0.85
      }
    ],
    villages: world.villages.map((candidate) =>
      candidate.id === village.id && !candidate.visibleChanges.includes(treeMarkerId)
        ? { ...candidate, visibleChanges: [...candidate.visibleChanges, treeMarkerId] }
        : candidate
    ),
    greatTrees: world.greatTrees.map((candidate) =>
      candidate.id === tree.id
        ? {
            ...candidate,
            recognizedMemoryIds: candidate.recognizedMemoryIds.includes(ceremonyMemoryId)
              ? candidate.recognizedMemoryIds
              : [...candidate.recognizedMemoryIds, ceremonyMemoryId],
            visualHistoryMarkers: candidate.visualHistoryMarkers.includes(treeMarkerId)
              ? candidate.visualHistoryMarkers
              : [...candidate.visualHistoryMarkers, treeMarkerId]
          }
        : candidate
    )
  });
}
