import { CURRENT_SCHEMA_VERSION } from './primitives';
import { WorldV1Schema, type WorldV1 } from './worldBase';
import { WorldSchema, type World } from './world';

function availableHomeId(baseId: string, homes: WorldV1['homes']): string {
  const existing = new Set(homes.map((home) => home.id));
  if (!existing.has(baseId)) return baseId;

  let counter = 2;
  while (existing.has(`${baseId}-${counter}`)) counter += 1;
  return `${baseId}-${counter}`;
}

function ensureFirstHome(world: WorldV1, firstPal: WorldV1['pals'][number]): { homes: WorldV1['homes']; firstHomeId: string } {
  const homes = [...world.homes];
  const existingHome = homes.find((home) => home.residentPalIds.includes(firstPal.id));
  if (existingHome) return { homes, firstHomeId: existingHome.id };

  const firstHome = {
    id: availableHomeId(`home-${world.seed.toString(36)}-first`, homes),
    villageId: firstPal.homeVillageId,
    residentPalIds: [firstPal.id],
    styleId: 'willowmere-roundhouse',
    visibleChanges: []
  };
  return { homes: [...homes, firstHome], firstHomeId: firstHome.id };
}

function migratePals(
  world: WorldV1,
  firstPalId: string,
  firstNeighborId: string | undefined,
  firstHomeId: string,
  homes: WorldV1['homes']
): WorldV1['pals'] {
  return world.pals.map((pal) => {
    const nextPal = { ...pal };

    const householdValid = pal.householdId
      && homes.some((home) => home.id === pal.householdId && home.residentPalIds.includes(pal.id));
    if (pal.id === firstPalId && !householdValid) {
      nextPal.householdId = firstHomeId;
    }

    if (pal.id === firstNeighborId && !pal.storyRole) {
      nextPal.storyRole = 'first-neighbor';
    }

    return nextPal;
  });
}

function migrateV1(world: WorldV1): World {
  const firstPal = world.pals.find((pal) => pal.id === world.firstPalId);
  if (!firstPal) {
    return WorldSchema.parse({ ...world, schemaVersion: CURRENT_SCHEMA_VERSION });
  }

  const firstRelationship = world.relationships.find(
    (relationship) => relationship.fromPalId === firstPal.id && relationship.toPalId !== firstPal.id
  );
  const { homes, firstHomeId } = ensureFirstHome(world, firstPal);
  const pals = migratePals(world, firstPal.id, firstRelationship?.toPalId, firstHomeId, homes);

  return WorldSchema.parse({
    ...world,
    schemaVersion: CURRENT_SCHEMA_VERSION,
    pals,
    homes
  });
}

export function parseWorld(input: unknown): World {
  if (typeof input === 'object' && input !== null && 'schemaVersion' in input && input.schemaVersion === 1) {
    return migrateV1(WorldV1Schema.parse(input));
  }

  return WorldSchema.parse(input);
}
