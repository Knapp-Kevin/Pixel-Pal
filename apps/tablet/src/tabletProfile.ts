import type { World } from '@pixel-pals/content-schema';
import type { PalSpecies } from '@pixel-pals/renderer';

export const TABLET_PROFILE_SPECIES = ['fox', 'deer', 'rabbit', 'cat', 'duck'] as const satisfies readonly PalSpecies[];

const supportedSpecies = new Set<string>(TABLET_PROFILE_SPECIES);

export type TabletProfileCompatibility = {
  compatible: boolean;
  unsupportedSpeciesIds: string[];
  affectedPalIds: string[];
};

export class TabletProfileCompatibilityError extends Error {
  readonly compatibility: TabletProfileCompatibility;

  constructor(compatibility: TabletProfileCompatibility) {
    super('This world contains Pal artwork that is not available in the current tablet profile.');
    this.name = 'TabletProfileCompatibilityError';
    this.compatibility = compatibility;
  }
}

export function isRenderableSpecies(speciesId: string): speciesId is PalSpecies {
  return supportedSpecies.has(speciesId);
}

export function requireRenderableSpecies(speciesId: string): PalSpecies {
  if (!isRenderableSpecies(speciesId)) {
    throw new TabletProfileCompatibilityError({
      compatible: false,
      unsupportedSpeciesIds: [speciesId],
      affectedPalIds: []
    });
  }

  return speciesId;
}

export function inspectTabletProfileCompatibility(world: World): TabletProfileCompatibility {
  const unsupportedSpeciesIds = [...new Set(
    world.pals
      .map((pal) => pal.speciesId)
      .filter((speciesId) => !isRenderableSpecies(speciesId))
  )].sort();

  const unsupported = new Set(unsupportedSpeciesIds);
  const affectedPalIds = world.pals
    .filter((pal) => unsupported.has(pal.speciesId))
    .map((pal) => pal.id)
    .sort();

  return {
    compatible: unsupportedSpeciesIds.length === 0,
    unsupportedSpeciesIds,
    affectedPalIds
  };
}

export function assertTabletProfileCompatible(world: World): World {
  const compatibility = inspectTabletProfileCompatibility(world);
  if (!compatibility.compatible) throw new TabletProfileCompatibilityError(compatibility);
  return world;
}
