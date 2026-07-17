import { describe, expect, it } from 'vitest';
import { createFirstWorld } from './index';
import { createInheritancePreview, palTraitProfile } from './inheritance';

const world = createFirstWorld({
  worldId: 'traits-lab-world',
  worldName: 'Traits Lab World',
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

describe('palTraitProfile', () => {
  it('derives stable expressed and hidden alleles without mutating the world', () => {
    const before = structuredClone(world);
    const first = palTraitProfile(world, firstPal.id);
    const second = palTraitProfile(world, firstPal.id);

    expect(first).toEqual(second);
    expect(first.loci.palette[0].id).toBe(firstPal.appearance.paletteId);
    expect(first.loci.marking[0].id).toBe(firstPal.appearance.markingId);
    expect(first.loci.palette).toHaveLength(2);
    expect(first.loci.marking).toHaveLength(2);
    expect(world).toEqual(before);
  });

  it('rejects an unknown Pal', () => {
    expect(() => palTraitProfile(world, 'missing-pal')).toThrow(/unknown Pal/i);
  });
});

describe('createInheritancePreview', () => {
  it('is deterministic for the same world, pair, and sample', () => {
    expect(createInheritancePreview(world, firstPal.id, fern.id, 0)).toEqual(
      createInheritancePreview(world, firstPal.id, fern.id, 0)
    );
  });

  it('produces valid variation across four sibling-style samples', () => {
    const signatures = new Set(
      [0, 1, 2, 3].map((sampleIndex) => createInheritancePreview(world, firstPal.id, fern.id, sampleIndex)
        .outcomes.map((outcome) => `${outcome.expressed.id}:${outcome.carried?.id ?? 'none'}`)
        .join('|'))
    );

    expect(signatures.size).toBeGreaterThan(1);
  });

  it('inherits exactly one allele from each source profile at every locus', () => {
    const preview = createInheritancePreview(world, firstPal.id, fern.id, 2);

    for (const outcome of preview.outcomes) {
      expect(outcome.inherited[0].sourcePalId).toBe(firstPal.id);
      expect(outcome.inherited[1].sourcePalId).toBe(fern.id);
      expect(preview.sourceProfiles[0].loci[outcome.locus].map((allele) => allele.id)).toContain(outcome.inherited[0].id);
      expect(preview.sourceProfiles[1].loci[outcome.locus].map((allele) => allele.id)).toContain(outcome.inherited[1].id);
    }
  });

  it('keeps non-genetic identity outside the preview', () => {
    const preview = createInheritancePreview(world, firstPal.id, fern.id, 1);

    expect(preview.learningBoundary).toMatch(/culture/i);
    expect(preview.learningBoundary).toMatch(/personality/i);
    expect(preview.learningBoundary).toMatch(/adoption/i);
    expect(preview.learningBoundary).toMatch(/belonging/i);
    expect(JSON.stringify(preview)).not.toContain('characteristics');
    expect(JSON.stringify(preview)).not.toContain('skills');
  });

  it('requires two distinct Pals and a valid sample index', () => {
    expect(() => createInheritancePreview(world, firstPal.id, firstPal.id, 0)).toThrow(/two different Pals/i);
    expect(() => createInheritancePreview(world, firstPal.id, fern.id, -1)).toThrow(/non-negative integer/i);
  });
});
