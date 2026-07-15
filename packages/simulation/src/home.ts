import { parseWorld, type HomeObject, type World } from '@pixel-pals/content-schema';

const HOME_OBJECT_LABELS: Record<HomeObject, string> = {
  'window-cushion': 'a soft cushion by the window',
  'memory-shelf': 'a shelf for keepsakes and memories',
  'story-lantern': 'a lantern for evening stories'
};

function stableId(prefix: string, seed: number, suffix: string): string {
  return `${prefix}-${seed.toString(36)}-${suffix}`;
}

export function chooseFirstHomeObject(world: World, objectId: HomeObject): World {
  const firstPal = world.pals.find((pal) => pal.id === world.firstPalId);
  const home = world.homes.find((candidate) => candidate.residentPalIds.includes(world.firstPalId));
  const ceremony = world.memories.find((memory) => memory.eventType === 'first-friendship-ceremony');

  if (!firstPal || !home) {
    throw new Error('Choosing a home object requires the first Pal and their home.');
  }

  if (!ceremony) {
    throw new Error('The first home object becomes available after the friendship ceremony.');
  }

  if (home.chosenObjectId) return world;

  const memoryId = stableId('memory', world.seed, 'first-home-object');
  const objectLabel = HOME_OBJECT_LABELS[objectId];

  return parseWorld({
    ...world,
    memories: [
      ...world.memories,
      {
        id: memoryId,
        title: `${firstPal.name} made the house feel like home`,
        participantPalIds: [firstPal.id],
        villageId: home.villageId,
        eventType: 'first-home-object',
        emotionalTone: 'calm',
        summary: `${firstPal.name} chose ${objectLabel}. It was the first thing in Willowmere that felt entirely their own.`,
        worldDay: world.worldDay,
        significance: 0.7
      }
    ],
    homes: world.homes.map((candidate) =>
      candidate.id === home.id
        ? {
            ...candidate,
            chosenObjectId: objectId,
            visibleChanges: candidate.visibleChanges.includes(objectId)
              ? candidate.visibleChanges
              : [...candidate.visibleChanges, objectId]
          }
        : candidate
    )
  });
}
