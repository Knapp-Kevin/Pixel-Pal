import { describe, expect, it } from 'vitest';
import { parseWorld } from '@pixel-pals/content-schema';
import { addFamilyBond, removeFamilyBond } from './familyBonds';
import { createFirstWorld } from './index';

const world = createFirstWorld({
  worldId: 'family-map-world',
  worldName: 'Family Map World',
  seed: 42,
  firstPal: {
    name: 'Pip',
    speciesId: 'fox',
    paletteId: 'sunleaf',
    markingId: 'tail-tip',
    accessoryId: 'scarf'
  }
});

const firstPal = world.pals.find((pal) => pal.id === world.firstPalId)!;
const fern = world.pals.find((pal) => pal.storyRole === 'first-neighbor')!;

describe('family bond schema migration', () => {
  it('migrates a schema-v3 world without losing existing state', () => {
    const { familyBonds: _familyBonds, ...currentWithoutFamilyBonds } = world;
    const legacyWorld = { ...currentWithoutFamilyBonds, schemaVersion: 3 };
    const migrated = parseWorld(JSON.parse(JSON.stringify(legacyWorld)));

    expect(migrated.schemaVersion).toBe(4);
    expect(migrated.familyBonds).toEqual([]);
    expect(migrated.pals).toEqual(world.pals);
    expect(migrated.relationships).toEqual(world.relationships);
    expect(migrated.memories).toEqual(world.memories);
  });
});

describe('addFamilyBond', () => {
  it('adds a durable sibling bond without mutating the source world', () => {
    const before = structuredClone(world);
    const next = addFamilyBond(world, {
      kind: 'sibling',
      fromPalId: firstPal.id,
      toPalId: fern.id
    });

    expect(world).toEqual(before);
    expect(next.familyBonds).toHaveLength(1);
    expect(next.familyBonds[0]?.kind).toBe('sibling');
    expect(parseWorld(JSON.parse(JSON.stringify(next)))).toEqual(next);
  });

  it('normalizes mutual bonds and remains idempotent', () => {
    const once = addFamilyBond(world, {
      kind: 'chosen-family',
      fromPalId: fern.id,
      toPalId: firstPal.id
    });
    const twice = addFamilyBond(once, {
      kind: 'chosen-family',
      fromPalId: firstPal.id,
      toPalId: fern.id
    });

    expect(twice).toEqual(once);
    expect(twice.familyBonds).toHaveLength(1);
    expect(twice.familyBonds[0]?.fromPalId.localeCompare(twice.familyBonds[0]?.toPalId ?? '')).toBeLessThan(0);
  });

  it('rejects unknown Pals and self-links', () => {
    expect(() => addFamilyBond(world, {
      kind: 'guardian',
      fromPalId: firstPal.id,
      toPalId: 'missing-pal'
    })).toThrow(/unknown Pal/i);

    expect(() => addFamilyBond(world, {
      kind: 'sibling',
      fromPalId: firstPal.id,
      toPalId: firstPal.id
    })).toThrow(/itself|self/i);
  });

  it('rejects conflicting caregiving and sibling classifications', () => {
    const parented = addFamilyBond(world, {
      kind: 'biological-parent',
      fromPalId: firstPal.id,
      toPalId: fern.id
    });

    expect(() => addFamilyBond(parented, {
      kind: 'guardian',
      fromPalId: firstPal.id,
      toPalId: fern.id
    })).toThrow(/conflicting caregiving/i);

    expect(() => addFamilyBond(parented, {
      kind: 'biological-parent',
      fromPalId: fern.id,
      toPalId: firstPal.id
    })).toThrow(/caregiving cycle/i);

    expect(() => addFamilyBond(parented, {
      kind: 'sibling',
      fromPalId: firstPal.id,
      toPalId: fern.id
    })).toThrow(/both sibling and caregiver/i);
  });
});

describe('removeFamilyBond', () => {
  it('removes only the selected family bond', () => {
    const bonded = addFamilyBond(world, {
      kind: 'chosen-family',
      fromPalId: firstPal.id,
      toPalId: fern.id
    });
    const bondId = bonded.familyBonds[0]!.id;
    const next = removeFamilyBond(bonded, bondId);

    expect(next.familyBonds).toEqual([]);
    expect(next.relationships).toEqual(world.relationships);
    expect(next.memories).toEqual(world.memories);
    expect(next.pals).toEqual(world.pals);
  });

  it('is idempotent when the bond is already absent', () => {
    expect(removeFamilyBond(world, 'missing-family-bond')).toBe(world);
  });
});