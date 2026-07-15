import { describe, expect, it } from 'vitest';
import { STONE_STACKING_VARIANTS, stoneStackingVariant } from './stoneStackingVariants';

describe('Stone Stacking variants', () => {
  it('selects the same configuration for the same seed', () => {
    expect(stoneStackingVariant(42)).toEqual(stoneStackingVariant(42));
  });

  it('provides multiple target sequences and valid cooperative turns', () => {
    expect(new Set(STONE_STACKING_VARIANTS.map((variant) => variant.childTargets.join('-'))).size).toBeGreaterThan(1);

    for (const variant of STONE_STACKING_VARIANTS) {
      expect(variant.childTargets).toHaveLength(3);
      expect(variant.friendStones).toHaveLength(2);
      expect(variant.choices).toHaveLength(3);
      variant.choices.forEach((choices, round) => {
        expect(choices.some((choice) => choice.size === variant.childTargets[round])).toBe(true);
      });
    }
  });
});
