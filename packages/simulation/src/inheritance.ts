import type { Pal, World } from '@pixel-pals/content-schema';

export type TraitLocus = 'palette' | 'marking';

export type TraitAllele = {
  id: string;
  label: string;
  dominance: number;
};

export type PalTraitProfile = {
  palId: string;
  palName: string;
  loci: Record<TraitLocus, readonly [TraitAllele, TraitAllele]>;
};

export type InheritedTraitOutcome = {
  locus: TraitLocus;
  label: string;
  inherited: readonly [
    TraitAllele & { sourcePalId: string; sourcePalName: string },
    TraitAllele & { sourcePalId: string; sourcePalName: string }
  ];
  expressed: TraitAllele;
  carried: TraitAllele | null;
  explanation: string;
};

export type InheritancePreview = {
  id: string;
  sampleNumber: number;
  sourceProfiles: readonly [PalTraitProfile, PalTraitProfile];
  outcomes: readonly InheritedTraitOutcome[];
  learningBoundary: string;
};

const PALETTE_ALLELES: readonly TraitAllele[] = [
  { id: 'mosscream', label: 'Moss Cream', dominance: 5 },
  { id: 'sunleaf', label: 'Sunleaf', dominance: 4 },
  { id: 'riverstone', label: 'Riverstone', dominance: 3 },
  { id: 'berrybloom', label: 'Berrybloom', dominance: 2 }
];

const MARKING_ALLELES: readonly TraitAllele[] = [
  { id: 'soft-mask', label: 'Soft Mask', dominance: 4 },
  { id: 'ear-dapple', label: 'Ear Dapple', dominance: 3 },
  { id: 'freckles', label: 'Freckles', dominance: 2 },
  { id: 'tail-tip', label: 'Light Tail Tip', dominance: 1 }
];

const LOCUS_LABELS: Record<TraitLocus, string> = {
  palette: 'Coat palette',
  marking: 'Visible marking'
};

function hashText(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function normalizedAllele(catalog: readonly TraitAllele[], id: string): TraitAllele {
  return catalog.find((candidate) => candidate.id === id) ?? {
    id,
    label: id
      .split('-')
      .map((part) => `${part.slice(0, 1).toUpperCase()}${part.slice(1)}`)
      .join(' '),
    dominance: 1
  };
}

function hiddenAllele(
  catalog: readonly TraitAllele[],
  expressedId: string,
  worldSeed: number,
  palId: string,
  locus: TraitLocus
): TraitAllele {
  if (catalog.length < 2) return normalizedAllele(catalog, expressedId);
  const expressedIndex = Math.max(0, catalog.findIndex((candidate) => candidate.id === expressedId));
  const offset = 1 + (hashText(`${worldSeed}:${palId}:${locus}:hidden`) % (catalog.length - 1));
  return catalog[(expressedIndex + offset) % catalog.length] ?? catalog[0]!;
}

function locusProfile(
  pal: Pal,
  worldSeed: number,
  locus: TraitLocus
): readonly [TraitAllele, TraitAllele] {
  const catalog = locus === 'palette' ? PALETTE_ALLELES : MARKING_ALLELES;
  const expressedId = locus === 'palette' ? pal.appearance.paletteId : pal.appearance.markingId;
  return [
    normalizedAllele(catalog, expressedId),
    hiddenAllele(catalog, expressedId, worldSeed, pal.id, locus)
  ];
}

export function palTraitProfile(world: World, palId: string): PalTraitProfile {
  const pal = world.pals.find((candidate) => candidate.id === palId);
  if (!pal) throw new Error(`Cannot build a trait profile for unknown Pal ${palId}.`);

  return {
    palId: pal.id,
    palName: pal.name,
    loci: {
      palette: locusProfile(pal, world.seed, 'palette'),
      marking: locusProfile(pal, world.seed, 'marking')
    }
  };
}

function inheritedAllele(
  profile: PalTraitProfile,
  locus: TraitLocus,
  sampleIndex: number,
  sourceIndex: 0 | 1
): TraitAllele & { sourcePalId: string; sourcePalName: string } {
  const offset = hashText(`${profile.palId}:${locus}:source-${sourceIndex}`) % 2;
  const cycle = sourceIndex === 0 ? sampleIndex : Math.floor(sampleIndex / 2);
  const selected = profile.loci[locus][(cycle + offset) % 2] ?? profile.loci[locus][0];
  return { ...selected, sourcePalId: profile.palId, sourcePalName: profile.palName };
}

function resolveExpression(
  locus: TraitLocus,
  first: InheritedTraitOutcome['inherited'][0],
  second: InheritedTraitOutcome['inherited'][1]
): Pick<InheritedTraitOutcome, 'expressed' | 'carried' | 'explanation'> {
  if (first.id === second.id) {
    return {
      expressed: first,
      carried: null,
      explanation: `Both source profiles contributed ${first.label}, so that trait is expressed without a different carried allele.`
    };
  }

  const expressed = first.dominance >= second.dominance ? first : second;
  const carried = expressed === first ? second : first;
  return {
    expressed,
    carried,
    explanation: `${expressed.label} is expressed in this sample. ${carried.label} remains carried and could appear in a later generation.`
  };
}

export function createInheritancePreview(
  world: World,
  firstPalId: string,
  secondPalId: string,
  sampleIndex: number
): InheritancePreview {
  if (firstPalId === secondPalId) throw new Error('Inheritance preview requires two different Pals.');
  if (!Number.isInteger(sampleIndex) || sampleIndex < 0) {
    throw new Error('Inheritance sample index must be a non-negative integer.');
  }

  const firstProfile = palTraitProfile(world, firstPalId);
  const secondProfile = palTraitProfile(world, secondPalId);
  const outcomes = (['palette', 'marking'] as const).map((locus) => {
    const inherited = [
      inheritedAllele(firstProfile, locus, sampleIndex, 0),
      inheritedAllele(secondProfile, locus, sampleIndex, 1)
    ] as const;
    return {
      locus,
      label: LOCUS_LABELS[locus],
      inherited,
      ...resolveExpression(locus, inherited[0], inherited[1])
    };
  });

  return {
    id: `inheritance-${world.worldId}-${firstPalId}-${secondPalId}-${sampleIndex}`,
    sampleNumber: sampleIndex + 1,
    sourceProfiles: [firstProfile, secondProfile],
    outcomes,
    learningBoundary: 'This preview models inherited appearance only. It does not create a child or relationship, and it never treats culture, personality, skills, adoption, or belonging as genetic.'
  };
}
