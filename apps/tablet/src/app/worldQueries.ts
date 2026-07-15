import type { Memory, Pal, World } from '@pixel-pals/content-schema';
import { requireRenderableSpecies } from '../tabletProfile';

export type WorldScene = {
  firstPal: Pal;
  firstNeighbor: Pal;
  village: World['villages'][number];
  firstMemory: Memory | undefined;
  ceremonyMemory: Memory | undefined;
  homeMemory: Memory | undefined;
  firstPreference: Pal['preferences'][number] | undefined;
  firstHome: World['homes'][number] | undefined;
  latestStory: string;
};

export function createLocalWorldSeed(): number {
  if (globalThis.crypto?.getRandomValues) {
    const values = new Uint32Array(1);
    globalThis.crypto.getRandomValues(values);
    return values[0] ?? 0;
  }
  return Date.now() % 4_294_967_296;
}

export function findFirstNeighbor(world: World): Pal | undefined {
  const roleNeighbor = world.pals.find((pal) => pal.storyRole === 'first-neighbor');
  if (roleNeighbor) return roleNeighbor;

  const relationship = world.relationships.find(
    (candidate) => candidate.fromPalId === world.firstPalId && candidate.toPalId !== world.firstPalId
  );
  return world.pals.find((pal) => pal.id === relationship?.toPalId);
}

export function selectWorldScene(world: World): WorldScene | null {
  const firstPal = world.pals.find((pal) => pal.id === world.firstPalId);
  const firstNeighbor = findFirstNeighbor(world);
  const village = firstPal
    ? world.villages.find((candidate) => candidate.id === firstPal.homeVillageId)
    : undefined;
  if (!firstPal || !firstNeighbor || !village) return null;

  const firstMemory = world.memories.find((memory) => memory.eventType === 'first-shared-activity');
  const ceremonyMemory = world.memories.find((memory) => memory.eventType === 'first-friendship-ceremony');
  const homeMemory = world.memories.find((memory) => memory.eventType === 'first-home-object');
  const firstPreference = firstPal.preferences.find((preference) => preference.id === 'first-play-preference');
  const firstHome = world.homes.find((home) => home.residentPalIds.includes(world.firstPalId));

  const latestStory = homeMemory?.summary
    ?? ceremonyMemory?.summary
    ?? firstMemory?.summary
    ?? `${firstPal.name} has met ${firstNeighbor.name}, but their first shared memory is still waiting.`;

  return {
    firstPal,
    firstNeighbor,
    village,
    firstMemory,
    ceremonyMemory,
    homeMemory,
    firstPreference,
    firstHome,
    latestStory
  };
}

export function palAppearanceProps(pal: Pal) {
  return {
    name: pal.name,
    species: requireRenderableSpecies(pal.speciesId),
    paletteId: pal.appearance.paletteId,
    markingId: pal.appearance.markingId,
    accessoryId: pal.appearance.accessoryId,
    artIdentity: pal.artIdentity
  };
}
