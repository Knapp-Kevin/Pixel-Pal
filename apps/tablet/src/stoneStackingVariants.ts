export type StoneChoice = {
  size: number;
  label: string;
};

export type StoneStackingVariant = {
  id: string;
  opening: string;
  baseStone: number;
  childTargets: readonly number[];
  friendStones: readonly number[];
  choices: readonly (readonly StoneChoice[])[];
};

export const STONE_STACKING_VARIANTS: readonly StoneStackingVariant[] = [
  {
    id: 'river-steps',
    opening: 'Fern placed a broad river stone. Choose the steady step that fits next.',
    baseStone: 7,
    childTargets: [6, 4, 2],
    friendStones: [5, 3],
    choices: [
      [
        { size: 4, label: 'narrow stone' },
        { size: 8, label: 'extra-wide stone' },
        { size: 6, label: 'wide stone' }
      ],
      [
        { size: 2, label: 'little stone' },
        { size: 6, label: 'wide stone' },
        { size: 4, label: 'middle stone' }
      ],
      [
        { size: 3, label: 'rounded stone' },
        { size: 2, label: 'small stone' },
        { size: 1, label: 'tiny top stone' }
      ]
    ]
  },
  {
    id: 'willow-arch',
    opening: 'Fern found a taller foundation stone near the willow roots. Build a gentle arching tower.',
    baseStone: 8,
    childTargets: [7, 5, 3],
    friendStones: [6, 4],
    choices: [
      [
        { size: 9, label: 'oversized stone' },
        { size: 7, label: 'broad arch stone' },
        { size: 5, label: 'middle stone' }
      ],
      [
        { size: 3, label: 'small stone' },
        { size: 7, label: 'broad arch stone' },
        { size: 5, label: 'steady middle stone' }
      ],
      [
        { size: 4, label: 'rounded stone' },
        { size: 2, label: 'tiny stone' },
        { size: 3, label: 'small cap stone' }
      ]
    ]
  },
  {
    id: 'garden-cairn',
    opening: 'Fern brought a wide garden stone with three smooth companions. Shape them into a small cairn.',
    baseStone: 9,
    childTargets: [8, 6, 4],
    friendStones: [7, 5],
    choices: [
      [
        { size: 6, label: 'garden middle stone' },
        { size: 10, label: 'too-wide garden stone' },
        { size: 8, label: 'wide garden stone' }
      ],
      [
        { size: 4, label: 'small garden stone' },
        { size: 8, label: 'wide garden stone' },
        { size: 6, label: 'smooth middle stone' }
      ],
      [
        { size: 5, label: 'Fern’s rounded stone' },
        { size: 3, label: 'tiny garden stone' },
        { size: 4, label: 'small cairn stone' }
      ]
    ]
  }
];

export function stoneStackingVariant(seed = 0): StoneStackingVariant {
  const normalized = Math.abs(Math.trunc(seed));
  return STONE_STACKING_VARIANTS[normalized % STONE_STACKING_VARIANTS.length] ?? STONE_STACKING_VARIANTS[0]!;
}
