import { describe, expect, it } from 'vitest';
import type { World } from '@pixel-pals/content-schema';
import { createFirstWorld } from '@pixel-pals/simulation';
import {
  assertTabletProfileCompatible,
  inspectTabletProfileCompatibility,
  requireRenderableSpecies
} from './tabletProfile';

function supportedWorld(): World {
  return createFirstWorld({
    worldId: 'tablet-profile-test',
    worldName: 'Tablet Profile Test',
    seed: 99,
    firstPal: {
      name: 'Pip',
      speciesId: 'cat',
      paletteId: 'sunleaf',
      markingId: 'tail-tip',
      accessoryId: 'scarf'
    }
  });
}

function worldWithUnsupportedPal(): World {
  const world = structuredClone(supportedWorld());
  world.species.push({
    id: 'owl',
    name: 'Owl',
    bodyFamily: 'avian',
    canonStatus: 'game'
  });

  const firstPal = world.pals.find((pal) => pal.id === world.firstPalId);
  if (!firstPal) throw new Error('Test world is missing its first Pal.');
  firstPal.speciesId = 'owl';
  firstPal.appearance.bodyFamily = 'avian';
  return world;
}

describe('tablet art profile compatibility', () => {
  it('accepts every current starter species', () => {
    for (const speciesId of ['fox', 'deer', 'rabbit', 'cat', 'duck'] as const) {
      expect(requireRenderableSpecies(speciesId)).toBe(speciesId);
    }
    expect(inspectTabletProfileCompatibility(supportedWorld()).compatible).toBe(true);
  });

  it('never converts an unsupported species into a supported one', () => {
    expect(() => requireRenderableSpecies('owl')).toThrow(/artwork/i);
  });

  it('identifies the affected Pal and blocks the incompatible world', () => {
    const world = worldWithUnsupportedPal();
    const compatibility = inspectTabletProfileCompatibility(world);

    expect(compatibility.compatible).toBe(false);
    expect(compatibility.unsupportedSpeciesIds).toEqual(['owl']);
    expect(compatibility.affectedPalIds).toEqual([world.firstPalId]);
    expect(() => assertTabletProfileCompatible(world)).toThrow(/artwork/i);
  });
});
