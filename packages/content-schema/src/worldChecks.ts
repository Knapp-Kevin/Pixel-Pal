import { z } from 'zod';
import type { FamilyBond, FamilyBondKind, Home, Pal, Village } from './entities';
import type { WorldShape } from './worldBase';

type Lookups = {
  speciesById: Map<string, WorldShape['species'][number]>;
  lineageById: Map<string, WorldShape['lineages'][number]>;
  palById: Map<string, Pal>;
  homeById: Map<string, Home>;
  villageById: Map<string, Village>;
  memoryById: Map<string, WorldShape['memories'][number]>;
  treeById: Map<string, WorldShape['greatTrees'][number]>;
};

const CAREGIVING_KINDS = new Set<FamilyBondKind>(['biological-parent', 'adoptive-parent', 'guardian']);
const SYMMETRIC_KINDS = new Set<FamilyBondKind>(['sibling', 'chosen-family']);

function issue(context: z.RefinementCtx, message: string, path?: Array<string | number>): void {
  context.addIssue({ code: z.ZodIssueCode.custom, message, ...(path ? { path } : {}) });
}

function duplicateValues(values: readonly string[]): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  for (const value of values) {
    if (seen.has(value)) duplicates.add(value);
    seen.add(value);
  }

  return [...duplicates];
}

function addDuplicateIssues(
  context: z.RefinementCtx,
  label: string,
  values: readonly string[],
  path: Array<string | number>
): void {
  for (const duplicate of duplicateValues(values)) {
    issue(context, `${label} contains duplicate value ${duplicate}.`, path);
  }
}

function buildLookups(world: WorldShape): Lookups {
  return {
    speciesById: new Map(world.species.map((species) => [species.id, species])),
    lineageById: new Map(world.lineages.map((lineage) => [lineage.id, lineage])),
    palById: new Map(world.pals.map((pal) => [pal.id, pal])),
    homeById: new Map(world.homes.map((home) => [home.id, home])),
    villageById: new Map(world.villages.map((village) => [village.id, village])),
    memoryById: new Map(world.memories.map((memory) => [memory.id, memory])),
    treeById: new Map(world.greatTrees.map((tree) => [tree.id, tree]))
  };
}

function validateCollectionIds(world: WorldShape, context: z.RefinementCtx): void {
  const collections: Array<[string, Array<{ id: string }>, string]> = [
    ['Species', world.species, 'species'],
    ['Lineages', world.lineages, 'lineages'],
    ['Pals', world.pals, 'pals'],
    ['Relationships', world.relationships, 'relationships'],
    ['Family bonds', world.familyBonds, 'familyBonds'],
    ['Memories', world.memories, 'memories'],
    ['Homes', world.homes, 'homes'],
    ['Villages', world.villages, 'villages'],
    ['Great Trees', world.greatTrees, 'greatTrees']
  ];

  for (const [label, entries, path] of collections) {
    addDuplicateIssues(context, label, entries.map((entry) => entry.id), [path]);
  }
}

function validateFirstPal(world: WorldShape, context: z.RefinementCtx, lookups: Lookups): void {
  const firstPals = world.pals.filter((pal) => pal.isFirstPal);

  if (!lookups.palById.has(world.firstPalId) || firstPals.length !== 1 || firstPals[0]?.id !== world.firstPalId) {
    issue(context, 'World must contain exactly one matching first Pal.');
  }

  addDuplicateIssues(
    context,
    'Pal story roles',
    world.pals.flatMap((pal) => pal.storyRole ? [pal.storyRole] : []),
    ['pals']
  );
}

function validateLineages(world: WorldShape, context: z.RefinementCtx, lookups: Lookups): void {
  for (const lineage of world.lineages) {
    if (!lookups.speciesById.has(lineage.speciesId)) {
      issue(context, `Lineage ${lineage.id} references unknown species ${lineage.speciesId}.`, ['lineages']);
    }
  }
}

function validatePalHome(pal: Pal, context: z.RefinementCtx, lookups: Lookups): void {
  const village = lookups.villageById.get(pal.homeVillageId);

  if (!village) {
    issue(context, `Pal ${pal.id} references unknown village ${pal.homeVillageId}.`, ['pals']);
  } else if (!village.residentPalIds.includes(pal.id)) {
    issue(context, `Pal ${pal.id} is missing from resident list for ${village.id}.`, ['villages']);
  }

  if (!pal.householdId) return;

  const home = lookups.homeById.get(pal.householdId);
  if (!home) {
    issue(context, `Pal ${pal.id} references unknown household ${pal.householdId}.`, ['pals']);
  } else if (!home.residentPalIds.includes(pal.id)) {
    issue(context, `Household ${home.id} does not list Pal ${pal.id} as a resident.`, ['homes']);
  }
}

function validatePalEntry(pal: Pal, context: z.RefinementCtx, lookups: Lookups): void {
  if (!lookups.speciesById.has(pal.speciesId)) {
    issue(context, `Pal ${pal.id} references unknown species ${pal.speciesId}.`, ['pals']);
  }

  if (pal.lineageId) {
    const lineage = lookups.lineageById.get(pal.lineageId);
    if (!lineage) {
      issue(context, `Pal ${pal.id} references unknown lineage ${pal.lineageId}.`, ['pals']);
    } else if (lineage.speciesId !== pal.speciesId) {
      issue(context, `Pal ${pal.id} lineage does not match its species.`, ['pals']);
    }
  }

  validatePalHome(pal, context, lookups);

  addDuplicateIssues(context, `Pal ${pal.id} preferences`, pal.preferences.map((value) => value.id), ['pals']);
  addDuplicateIssues(context, `Pal ${pal.id} characteristics`, pal.characteristics.map((value) => value.id), ['pals']);
  addDuplicateIssues(context, `Pal ${pal.id} skills`, pal.skills.map((value) => value.id), ['pals']);
}

function validateRelationships(world: WorldShape, context: z.RefinementCtx, lookups: Lookups): void {
  const relationshipPairs = new Set<string>();

  for (const relationship of world.relationships) {
    if (!lookups.palById.has(relationship.fromPalId) || !lookups.palById.has(relationship.toPalId)) {
      issue(context, `Relationship ${relationship.id} references an unknown Pal.`, ['relationships']);
    }
    if (relationship.fromPalId === relationship.toPalId) {
      issue(context, `Relationship ${relationship.id} cannot be self-directed.`, ['relationships']);
    }

    const pair = `${relationship.fromPalId}>${relationship.toPalId}`;
    if (relationshipPairs.has(pair)) {
      issue(context, `Duplicate directed relationship ${pair}.`, ['relationships']);
    }
    relationshipPairs.add(pair);
  }
}

function unorderedPair(left: string, right: string): string {
  return [left, right].sort().join('<>');
}

function semanticBondKey(bond: FamilyBond): string {
  if (SYMMETRIC_KINDS.has(bond.kind)) {
    return `${bond.kind}:${unorderedPair(bond.fromPalId, bond.toPalId)}`;
  }
  return `${bond.kind}:${bond.fromPalId}>${bond.toPalId}`;
}

function validateFamilyBonds(world: WorldShape, context: z.RefinementCtx, lookups: Lookups): void {
  const semanticKeys = new Set<string>();
  const caregivingDirections = new Map<string, FamilyBondKind>();
  const kindsByPair = new Map<string, Set<FamilyBondKind>>();

  for (const bond of world.familyBonds) {
    if (!lookups.palById.has(bond.fromPalId) || !lookups.palById.has(bond.toPalId)) {
      issue(context, `Family bond ${bond.id} references an unknown Pal.`, ['familyBonds']);
    }
    if (bond.fromPalId === bond.toPalId) {
      issue(context, `Family bond ${bond.id} cannot connect a Pal to itself.`, ['familyBonds']);
    }
    if (bond.establishedWorldDay > world.worldDay) {
      issue(context, `Family bond ${bond.id} is dated after the current world day.`, ['familyBonds']);
    }

    const semanticKey = semanticBondKey(bond);
    if (semanticKeys.has(semanticKey)) {
      issue(context, `Duplicate family bond ${semanticKey}.`, ['familyBonds']);
    }
    semanticKeys.add(semanticKey);

    const pair = unorderedPair(bond.fromPalId, bond.toPalId);
    const existingKinds = kindsByPair.get(pair) ?? new Set<FamilyBondKind>();
    const existingCaregiving = [...existingKinds].find((kind) => CAREGIVING_KINDS.has(kind));
    const existingSymmetric = [...existingKinds].find((kind) => SYMMETRIC_KINDS.has(kind));

    if (CAREGIVING_KINDS.has(bond.kind)) {
      const direction = `${bond.fromPalId}>${bond.toPalId}`;
      const reverse = `${bond.toPalId}>${bond.fromPalId}`;
      if (caregivingDirections.has(reverse)) {
        issue(context, `Family bond ${bond.id} creates a reciprocal caregiving cycle.`, ['familyBonds']);
      }
      if (existingCaregiving && existingCaregiving !== bond.kind) {
        issue(context, `Family pair ${pair} has conflicting caregiving classifications.`, ['familyBonds']);
      }
      if (existingKinds.has('sibling')) {
        issue(context, `Family pair ${pair} cannot be both sibling and caregiver-child.`, ['familyBonds']);
      }
      caregivingDirections.set(direction, bond.kind);
    }

    if (bond.kind === 'sibling' && existingCaregiving) {
      issue(context, `Family pair ${pair} cannot be both sibling and caregiver-child.`, ['familyBonds']);
    }

    if (SYMMETRIC_KINDS.has(bond.kind) && existingSymmetric && existingSymmetric !== bond.kind) {
      issue(context, `Family pair ${pair} has conflicting symmetric family classifications.`, ['familyBonds']);
    }

    existingKinds.add(bond.kind);
    kindsByPair.set(pair, existingKinds);
  }
}

function validateMemories(world: WorldShape, context: z.RefinementCtx, lookups: Lookups): void {
  for (const memory of world.memories) {
    addDuplicateIssues(context, `Memory ${memory.id} participants`, memory.participantPalIds, ['memories']);

    for (const participantId of memory.participantPalIds) {
      if (!lookups.palById.has(participantId)) {
        issue(context, `Memory ${memory.id} references unknown Pal ${participantId}.`, ['memories']);
      }
    }
    if (!lookups.villageById.has(memory.villageId)) {
      issue(context, `Memory ${memory.id} references unknown village ${memory.villageId}.`, ['memories']);
    }
    if (memory.worldDay > world.worldDay) {
      issue(context, `Memory ${memory.id} occurs after the current world day.`, ['memories']);
    }
  }
}

function validateHomeResidents(home: Home, context: z.RefinementCtx, lookups: Lookups): void {
  for (const residentPalId of home.residentPalIds) {
    const resident = lookups.palById.get(residentPalId);
    if (!resident) {
      issue(context, `Home ${home.id} references unknown resident Pal ${residentPalId}.`, ['homes']);
    } else if (resident.homeVillageId !== home.villageId) {
      issue(context, `Home ${home.id} resident ${residentPalId} belongs to another village.`, ['homes']);
    }
  }
}

function validateHomes(world: WorldShape, context: z.RefinementCtx, lookups: Lookups): void {
  for (const home of world.homes) {
    if (!lookups.villageById.has(home.villageId)) {
      issue(context, `Home ${home.id} references unknown village ${home.villageId}.`, ['homes']);
    }

    addDuplicateIssues(context, `Home ${home.id} residents`, home.residentPalIds, ['homes']);
    addDuplicateIssues(context, `Home ${home.id} visible changes`, home.visibleChanges, ['homes']);

    validateHomeResidents(home, context, lookups);

    if (home.chosenObjectId && !home.visibleChanges.includes(home.chosenObjectId)) {
      issue(context, `Home ${home.id} chosen object is missing from visible changes.`, ['homes']);
    }
  }
}

function validateVillageResidents(village: Village, context: z.RefinementCtx, lookups: Lookups): void {
  for (const residentPalId of village.residentPalIds) {
    const resident = lookups.palById.get(residentPalId);
    if (!resident) {
      issue(context, `Village ${village.id} references unknown resident Pal ${residentPalId}.`, ['villages']);
    } else if (resident.homeVillageId !== village.id) {
      issue(context, `Village ${village.id} lists Pal ${residentPalId} whose home is elsewhere.`, ['villages']);
    }
  }
}

function validateVillages(world: WorldShape, context: z.RefinementCtx, lookups: Lookups): void {
  for (const village of world.villages) {
    addDuplicateIssues(context, `Village ${village.id} residents`, village.residentPalIds, ['villages']);
    addDuplicateIssues(context, `Village ${village.id} visible changes`, village.visibleChanges, ['villages']);

    validateVillageResidents(village, context, lookups);

    const tree = lookups.treeById.get(village.greatTreeId);
    if (!tree) {
      issue(context, `Village ${village.id} references unknown Great Tree ${village.greatTreeId}.`, ['villages']);
    } else if (tree.villageId !== village.id) {
      issue(context, `Great Tree ${tree.id} belongs to another village.`, ['greatTrees']);
    }
  }
}

function validateGreatTrees(world: WorldShape, context: z.RefinementCtx, lookups: Lookups): void {
  for (const tree of world.greatTrees) {
    if (!lookups.villageById.has(tree.villageId)) {
      issue(context, `Great Tree ${tree.id} references unknown village ${tree.villageId}.`, ['greatTrees']);
    }

    addDuplicateIssues(context, `Great Tree ${tree.id} recognized memories`, tree.recognizedMemoryIds, ['greatTrees']);
    addDuplicateIssues(context, `Great Tree ${tree.id} visual markers`, tree.visualHistoryMarkers, ['greatTrees']);

    for (const memoryId of tree.recognizedMemoryIds) {
      const memory = lookups.memoryById.get(memoryId);
      if (!memory) {
        issue(context, `Great Tree ${tree.id} recognizes unknown memory ${memoryId}.`, ['greatTrees']);
      } else if (memory.villageId !== tree.villageId) {
        issue(context, `Great Tree ${tree.id} recognizes a memory from another village.`, ['greatTrees']);
      }
    }
  }
}

export function validateWorld(world: WorldShape, context: z.RefinementCtx): void {
  const lookups = buildLookups(world);

  validateCollectionIds(world, context);
  validateFirstPal(world, context, lookups);
  validateLineages(world, context, lookups);
  for (const pal of world.pals) validatePalEntry(pal, context, lookups);
  validateRelationships(world, context, lookups);
  validateFamilyBonds(world, context, lookups);
  validateMemories(world, context, lookups);
  validateHomes(world, context, lookups);
  validateVillages(world, context, lookups);
  validateGreatTrees(world, context, lookups);
}