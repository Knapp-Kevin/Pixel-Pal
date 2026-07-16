import { describe, expect, it } from 'vitest';
import {
  resolvePalArtwork,
  resolveSceneArtwork,
  type PalArtworkRequest,
  type ProductionArtRegistry
} from '@pixel-pals/renderer';
import { createFirstWorld } from '@pixel-pals/simulation';

const rabbitRequest: PalArtworkRequest = {
  name: 'Pip',
  species: 'rabbit',
  paletteId: 'sunleaf',
  markingId: 'freckles',
  accessoryId: 'scarf',
  expression: 'curious',
  pose: 'standing'
};

const registry: ProductionArtRegistry = {
  palAssets: [
    {
      id: 'rabbit-generic',
      status: 'production',
      src: '/art/rabbit-generic.webp',
      width: 512,
      height: 768,
      species: 'rabbit'
    },
    {
      id: 'rabbit-curious',
      status: 'production',
      src: '/art/rabbit-curious.webp',
      width: 512,
      height: 768,
      species: 'rabbit',
      expression: 'curious'
    },
    {
      id: 'fern-curious',
      status: 'production',
      src: '/art/fern-curious.webp',
      width: 512,
      height: 768,
      species: 'rabbit',
      artIdentity: 'fern',
      expression: 'curious'
    },
    {
      id: 'rabbit-benchmark',
      status: 'benchmark',
      src: '/art/rabbit-benchmark.webp',
      width: 512,
      height: 768,
      species: 'rabbit',
      paletteId: 'riverstone'
    }
  ],
  sceneAssets: [
    {
      id: 'willowmere-base',
      status: 'production',
      src: '/art/willowmere-base.webp',
      width: 1600,
      height: 900,
      portraitSrc: '/art/willowmere-base-portrait.webp',
      portraitWidth: 900,
      portraitHeight: 1600,
      sceneId: 'willowmere-village',
      alt: 'Willowmere village'
    },
    {
      id: 'willowmere-garden',
      status: 'production',
      src: '/art/willowmere-garden.webp',
      width: 1600,
      height: 900,
      sceneId: 'willowmere-village',
      variant: 'garden',
      alt: 'Willowmere with newly tended blooms'
    }
  ]
};

describe('production art resolution', () => {
  it('uses an exact expression frame before a generic species frame', () => {
    expect(resolvePalArtwork(registry, rabbitRequest)?.id).toBe('rabbit-curious');
  });

  it('uses a stable individual identity before generic species art', () => {
    expect(resolvePalArtwork(registry, { ...rabbitRequest, name: 'Fern', artIdentity: 'fern' })?.id).toBe('fern-curious');
  });

  it('does not activate benchmark art in production mode', () => {
    const riverstone = { ...rabbitRequest, paletteId: 'riverstone' };
    expect(resolvePalArtwork(registry, riverstone, 'production')?.id).toBe('rabbit-curious');
    expect(resolvePalArtwork(registry, riverstone, 'benchmark')?.id).toBe('rabbit-benchmark');
  });

  it('prefers an exact scene variant but can fall back to the base scene', () => {
    expect(resolveSceneArtwork(registry, 'willowmere-village', 'garden')?.id).toBe('willowmere-garden');
    expect(resolveSceneArtwork(registry, 'willowmere-village', 'stones')?.id).toBe('willowmere-base');
  });

  it('keeps responsive portrait scene sources attached to the resolved scene', () => {
    const scene = resolveSceneArtwork(registry, 'willowmere-village', 'stones');
    expect(scene?.portraitSrc).toBe('/art/willowmere-base-portrait.webp');
    expect(scene?.portraitWidth).toBe(900);
    expect(scene?.portraitHeight).toBe(1600);
  });

  it('assigns Fern a stable art identity without assigning one to the player-created Pal', () => {
    const world = createFirstWorld({
      worldId: 'art-identity-test',
      worldName: 'Art Identity Test',
      seed: 17,
      firstPal: {
        name: 'Pip',
        speciesId: 'rabbit',
        paletteId: 'sunleaf',
        markingId: 'freckles',
        accessoryId: 'scarf'
      }
    });
    const firstPal = world.pals.find((pal) => pal.id === world.firstPalId);
    const fern = world.pals.find((pal) => pal.storyRole === 'first-neighbor');

    expect(firstPal?.artIdentity).toBeUndefined();
    expect(fern?.artIdentity).toBe('fern');
  });
});
