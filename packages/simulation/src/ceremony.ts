import { parseWorld, type World } from '@pixel-pals/content-schema';

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

  const firstPal = world.pals.find((pal) => pal.id === world.firstPalId);
  const fern = world.pals.find((pal) => pal.name === 'Fern');
  const relationship = world.relationships.find(
    (candidate) => candidate.fromPalId === firstPal?.id && candidate.toPalId === fern?.id
  );

  if (!firstPal || !fern || !relationship) {
    throw new Error('The first friendship ceremony requires the first Pal, Fern, and their relationship.');
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
        title: `${firstPal.name} and Fern were welcomed as friends`,
        participantPalIds: [firstPal.id, fern.id],
        villageId: 'willowmere',
        eventType: 'first-friendship-ceremony',
        emotionalTone: 'hopeful',
        summary: `Beneath Willowmere’s Great Tree, ${firstPal.name} and Fern tied a ribbon for the friendship they had begun.`,
        worldDay: world.worldDay,
        significance: 0.85
      }
    ],
    villages: world.villages.map((village) =>
      village.id === 'willowmere' && !village.visibleChanges.includes(treeMarkerId)
        ? { ...village, visibleChanges: [...village.visibleChanges, treeMarkerId] }
        : village
    ),
    greatTrees: world.greatTrees.map((tree) =>
      tree.id === 'willowmere-great-tree'
        ? {
            ...tree,
            recognizedMemoryIds: tree.recognizedMemoryIds.includes(ceremonyMemoryId)
              ? tree.recognizedMemoryIds
              : [...tree.recognizedMemoryIds, ceremonyMemoryId],
            visualHistoryMarkers: tree.visualHistoryMarkers.includes(treeMarkerId)
              ? tree.visualHistoryMarkers
              : [...tree.visualHistoryMarkers, treeMarkerId]
          }
        : tree
    )
  });
}
