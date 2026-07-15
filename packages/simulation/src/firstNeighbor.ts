import type { Pal, Relationship, World } from '@pixel-pals/content-schema';

export type FirstNeighborContext = {
  firstPal: Pal;
  neighbor: Pal;
  relationship: Relationship;
};

export function getFirstNeighborContext(world: World): FirstNeighborContext {
  const firstPal = world.pals.find((pal) => pal.id === world.firstPalId);

  if (!firstPal) {
    throw new Error('The world does not contain its first Pal.');
  }

  const roleNeighbor = world.pals.find((pal) => pal.storyRole === 'first-neighbor');
  const relationship = world.relationships.find(
    (candidate) =>
      candidate.fromPalId === firstPal.id
      && candidate.toPalId !== firstPal.id
      && (!roleNeighbor || candidate.toPalId === roleNeighbor.id)
  );
  const neighbor = roleNeighbor
    ?? world.pals.find((pal) => pal.id === relationship?.toPalId);

  if (!neighbor || !relationship) {
    throw new Error('The first-neighbor relationship is missing from the world.');
  }

  return { firstPal, neighbor, relationship };
}
