import { parseWorld, type FamilyBond, type FamilyBondKind, type World } from '@pixel-pals/content-schema';

export type FamilyBondInput = Pick<FamilyBond, 'kind' | 'fromPalId' | 'toPalId'>;

const SYMMETRIC_KINDS = new Set<FamilyBondKind>(['sibling', 'chosen-family']);

function normalizedParticipants(input: FamilyBondInput): Pick<FamilyBondInput, 'fromPalId' | 'toPalId'> {
  if (!SYMMETRIC_KINDS.has(input.kind)) {
    return { fromPalId: input.fromPalId, toPalId: input.toPalId };
  }

  const [fromPalId, toPalId] = [input.fromPalId, input.toPalId].sort();
  return { fromPalId, toPalId };
}

function familyBondId(input: FamilyBondInput): string {
  const participants = normalizedParticipants(input);
  return `family-${input.kind}-${participants.fromPalId}-${participants.toPalId}`;
}

export function addFamilyBond(world: World, input: FamilyBondInput): World {
  const participants = normalizedParticipants(input);
  const bond: FamilyBond = {
    id: familyBondId(input),
    kind: input.kind,
    fromPalId: participants.fromPalId,
    toPalId: participants.toPalId,
    establishedWorldDay: world.worldDay
  };

  if (world.familyBonds.some((candidate) => candidate.id === bond.id)) return world;

  return parseWorld({
    ...world,
    familyBonds: [...world.familyBonds, bond]
  });
}

export function removeFamilyBond(world: World, bondId: string): World {
  if (!world.familyBonds.some((bond) => bond.id === bondId)) return world;

  return parseWorld({
    ...world,
    familyBonds: world.familyBonds.filter((bond) => bond.id !== bondId)
  });
}

export const FAMILY_BOND_LABELS: Record<FamilyBondKind, string> = {
  'biological-parent': 'Biological parent',
  'adoptive-parent': 'Adoptive parent',
  guardian: 'Guardian',
  sibling: 'Sibling',
  'chosen-family': 'Chosen family'
};

export const FAMILY_BOND_HELP: Record<FamilyBondKind, string> = {
  'biological-parent': 'Records a biological parent-to-child relationship. It does not determine personality, culture, or belonging.',
  'adoptive-parent': 'Records an adoptive parent-to-child relationship with full family status independent of genetics.',
  guardian: 'Records a guardian-to-dependent care relationship without redefining other family bonds.',
  sibling: 'Records a mutual sibling relationship. The stored direction has no meaning.',
  'chosen-family': 'Records a mutual chosen-family relationship grounded in commitment rather than biology.'
};