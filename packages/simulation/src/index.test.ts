import { describe, expect, it } from 'vitest';
import { completeFirstActivity, createFirstWorld } from './index';

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

describe('completeFirstActivity', () => {
  it('discovers a preference and creates a shared memory', () => {
    const world = completeFirstActivity(createFirstWorld(input), 'garden-game');
    const firstPal = world.pals.find((pal) => pal.id === world.firstPalId);

    expect(firstPal?.preferences[0]?.discovered).toBe(true);
    expect(firstPal?.preferences[0]?.label).toBe('Playing a garden guessing game');
    expect(world.memories).toHaveLength(1);
    expect(world.memories[0]?.participantPalIds).toHaveLength(2);
  });

  it('moves the first relationship from acquaintance to friend', () => {
    const world = completeFirstActivity(createFirstWorld(input), 'leaf-chase');

    expect(world.relationships[0]?.label).toBe('friend');
    expect(world.relationships[0]?.sharedHistory).toBeGreaterThan(0);
  });

  it('does not duplicate the first memory when repeated', () => {
    const once = completeFirstActivity(createFirstWorld(input), 'stone-stacking');
    const twice = completeFirstActivity(once, 'garden-game');

    expect(twice).toEqual(once);
    expect(twice.memories).toHaveLength(1);
  });
});
