import { describe, expect, it } from 'vitest';
import { completeFirstActivity, createFirstWorld, type FirstPalChoice } from './index';
import { completeFirstFriendshipCeremony } from './ceremony';
import { chooseFirstHomeObject } from './home';

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

const starterBodyFamilies: Array<{
  speciesId: FirstPalChoice['speciesId'];
  bodyFamily: string;
}> = [
  { speciesId: 'fox', bodyFamily: 'canine' },
  { speciesId: 'deer', bodyFamily: 'cervid' },
  { speciesId: 'rabbit', bodyFamily: 'lagomorph' },
  { speciesId: 'cat', bodyFamily: 'feline' },
  { speciesId: 'duck', bodyFamily: 'waterfowl' }
];

function createCelebratedWorld() {
  return completeFirstFriendshipCeremony(
    completeFirstActivity(createFirstWorld(input), 'garden-game')
  );
}

describe('createFirstWorld', () => {
  it('creates exactly one matching first Pal', () => {
    const world = createFirstWorld(input);
    const firstPals = world.pals.filter((pal) => pal.isFirstPal);

    expect(firstPals).toHaveLength(1);
    expect(firstPals[0]?.id).toBe(world.firstPalId);
    expect(firstPals[0]?.name).toBe('Pip');
    expect(firstPals[0]?.createdBy).toBe('player');
  });

  it.each(starterBodyFamilies)('preserves the $speciesId starter and its body family', ({ speciesId, bodyFamily }) => {
    const world = createFirstWorld({
      ...input,
      firstPal: { ...input.firstPal, speciesId }
    });
    const firstPal = world.pals.find((pal) => pal.id === world.firstPalId);

    expect(firstPal?.speciesId).toBe(speciesId);
    expect(firstPal?.appearance.bodyFamily).toBe(bodyFamily);
  });

  it('registers all five starter species in the world', () => {
    const world = createFirstWorld(input);
    expect(world.species.map((species) => species.id)).toEqual(['fox', 'deer', 'rabbit', 'cat', 'duck']);
  });

  it('creates a stable first home for the chosen Pal', () => {
    const world = createFirstWorld(input);
    const home = world.homes.find((candidate) => candidate.residentPalIds.includes(world.firstPalId));
    const firstPal = world.pals.find((pal) => pal.id === world.firstPalId);

    expect(home).toBeDefined();
    expect(firstPal?.householdId).toBe(home?.id);
    expect(home?.chosenObjectId).toBeUndefined();
  });

  it('assigns the first neighbor a stable story role', () => {
    const world = createFirstWorld(input);
    expect(world.pals.find((pal) => pal.storyRole === 'first-neighbor')?.name).toBe('Fern');
  });

  it('is deterministic for the same input', () => {
    expect(createFirstWorld(input)).toEqual(createFirstWorld(input));
  });

  it('uses different seeds to create distinct starting identities', () => {
    const firstWorld = createFirstWorld({ ...input, seed: 42 });
    const secondWorld = createFirstWorld({ ...input, worldId: 'another-world', seed: 43 });
    const firstPal = firstWorld.pals.find((pal) => pal.id === firstWorld.firstPalId);
    const secondPal = secondWorld.pals.find((pal) => pal.id === secondWorld.firstPalId);

    expect(firstWorld.firstPalId).not.toBe(secondWorld.firstPalId);
    expect(firstPal?.characteristics).not.toEqual(secondPal?.characteristics);
  });

  it('begins with personality left to discover', () => {
    const world = createFirstWorld(input);
    const firstPal = world.pals.find((pal) => pal.id === world.firstPalId);
    expect(firstPal?.preferences.some((preference) => !preference.discovered)).toBe(true);
  });
});

describe('completeFirstActivity', () => {
  it('discovers a seed-dependent preference and creates a shared memory', () => {
    const world = completeFirstActivity(createFirstWorld(input), 'garden-game');
    const firstPal = world.pals.find((pal) => pal.id === world.firstPalId);

    expect(firstPal?.preferences[0]?.discovered).toBe(true);
    expect(firstPal?.preferences[0]?.label).toContain('garden guessing game');
    expect(world.memories).toHaveLength(1);
    expect(world.memories[0]?.participantPalIds).toHaveLength(2);
  });

  it('moves the first relationship from acquaintance to friend', () => {
    const world = completeFirstActivity(createFirstWorld(input), 'leaf-chase');
    expect(world.relationships[0]?.label).toBe('friend');
    expect(world.relationships[0]?.sharedHistory).toBeGreaterThan(0);
  });

  it('does not confuse a first Pal named Fern with the first neighbor', () => {
    const world = completeFirstActivity(createFirstWorld({
      ...input,
      firstPal: { ...input.firstPal, name: 'Fern' }
    }), 'stone-stacking');

    expect(world.memories).toHaveLength(1);
    expect(new Set(world.memories[0]?.participantPalIds).size).toBe(2);
    expect(world.relationships[0]?.label).toBe('friend');
  });

  it('does not duplicate the first memory when repeated', () => {
    const once = completeFirstActivity(createFirstWorld(input), 'stone-stacking');
    const twice = completeFirstActivity(once, 'garden-game');
    expect(twice).toEqual(once);
    expect(twice.memories).toHaveLength(1);
  });
});

describe('completeFirstFriendshipCeremony', () => {
  it('adds a ceremony memory and visible Great Tree marker', () => {
    const played = completeFirstActivity(createFirstWorld(input), 'garden-game');
    const celebrated = completeFirstFriendshipCeremony(played);
    const tree = celebrated.greatTrees.find((candidate) => candidate.id === 'willowmere-great-tree');

    expect(celebrated.memories.some((memory) => memory.eventType === 'first-friendship-ceremony')).toBe(true);
    expect(tree?.visualHistoryMarkers).toContain('first-friendship-ribbon');
    expect(tree?.recognizedMemoryIds).toHaveLength(1);
  });

  it('works when the first Pal is also named Fern', () => {
    const namedFern = createFirstWorld({ ...input, firstPal: { ...input.firstPal, name: 'Fern' } });
    const celebrated = completeFirstFriendshipCeremony(completeFirstActivity(namedFern, 'leaf-chase'));
    const ceremony = celebrated.memories.find((memory) => memory.eventType === 'first-friendship-ceremony');

    expect(ceremony?.participantPalIds).toHaveLength(2);
    expect(new Set(ceremony?.participantPalIds).size).toBe(2);
  });

  it('requires a shared activity first', () => {
    expect(() => completeFirstFriendshipCeremony(createFirstWorld(input))).toThrow(
      'The first friendship ceremony requires a shared activity memory.'
    );
  });

  it('does not duplicate the ceremony', () => {
    const played = completeFirstActivity(createFirstWorld(input), 'leaf-chase');
    const once = completeFirstFriendshipCeremony(played);
    const twice = completeFirstFriendshipCeremony(once);

    expect(twice).toEqual(once);
    expect(twice.memories.filter((memory) => memory.eventType === 'first-friendship-ceremony')).toHaveLength(1);
  });
});

describe('chooseFirstHomeObject', () => {
  it('persists the chosen object and creates a personal memory', () => {
    const world = chooseFirstHomeObject(createCelebratedWorld(), 'memory-shelf');
    const home = world.homes.find((candidate) => candidate.residentPalIds.includes(world.firstPalId));
    const memory = world.memories.find((candidate) => candidate.eventType === 'first-home-object');

    expect(home?.chosenObjectId).toBe('memory-shelf');
    expect(home?.visibleChanges).toContain('memory-shelf');
    expect(memory?.participantPalIds).toEqual([world.firstPalId]);
    expect(memory?.emotionalTone).toBe('calm');
  });

  it('requires the friendship ceremony first', () => {
    const played = completeFirstActivity(createFirstWorld(input), 'garden-game');
    expect(() => chooseFirstHomeObject(played, 'story-lantern')).toThrow(
      'The first home object becomes available after the friendship ceremony.'
    );
  });

  it('does not replace or duplicate the first chosen object', () => {
    const once = chooseFirstHomeObject(createCelebratedWorld(), 'window-cushion');
    const twice = chooseFirstHomeObject(once, 'story-lantern');

    expect(twice).toEqual(once);
    expect(twice.memories.filter((memory) => memory.eventType === 'first-home-object')).toHaveLength(1);
  });
});
