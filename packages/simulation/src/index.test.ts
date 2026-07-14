import { describe, expect, it } from 'vitest';
import { createFirstWorld } from './index';

const input = {
  worldId: 'kevin-family-world',
  worldName: 'Our Pixel Pals',
  seed: 42,
  firstPal: {
    name: 'Pip',
    speciesId: 'fox' as const,
    paletteId: 'sunleaf' as const,
    markingId: 'tail-tip' as const,
    accessoryId: 'scarf' as const
  }
};

describe('createFirstWorld', () => {
  it('creates exactly one matching first Pal', () => {
    const world = createFirstWorld(input);
    const firstPals = world.pals.filter((pal) => pal.isFirstPal);

    expect(firstPals).toHaveLength(1);
    expect(firstPals[0]?.id).toBe(world.firstPalId);
    expect(firstPals[0]?.name).toBe('Pip');
    expect(firstPals[0]?.createdBy).toBe('player');
  });

  it('is deterministic for the same input', () => {
    expect(createFirstWorld(input)).toEqual(createFirstWorld(input));
  });

  it('begins with personality left to discover', () => {
    const world = createFirstWorld(input);
    const firstPal = world.pals.find((pal) => pal.id === world.firstPalId);

    expect(firstPal?.preferences.some((preference) => !preference.discovered)).toBe(true);
  });
});
