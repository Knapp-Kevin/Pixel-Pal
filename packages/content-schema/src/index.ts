import { z } from 'zod';

export const CURRENT_SCHEMA_VERSION = 2 as const;

const LIMITS = {
  species: 128,
  lineages: 1024,
  pals: 5000,
  relationships: 20000,
  memories: 20000,
  homes: 5000,
  villages: 256,
  greatTrees: 256,
  palDetails: 128,
  references: 5000
} as const;

const id = z.string().min(1).max(96).regex(/^[a-z0-9][a-z0-9-_]*$/);
const shortText = z.string().trim().min(1).max(80);
const idList = (maximum = LIMITS.references) => z.array(id).max(maximum);

export const CanonStatusSchema = z.enum([
  'established',
  'working',
  'game',
  'player',
  'legend',
  'unknown',
  'retired'
]);

export const LifeStageSchema = z.enum(['child', 'youth', 'adult', 'elder']);

export const SpeciesSchema = z.object({
  id,
  name: shortText,
  bodyFamily: id,
  canonStatus: CanonStatusSchema
});

export const RegionalLineageSchema = z.object({
  id,
  name: shortText,
  speciesId: id,
  regionId: id,
  canonStatus: CanonStatusSchema
});

export const AppearanceSchema = z.object({
  bodyFamily: id,
  paletteId: id,
  markingId: id,
  accessoryId: id.optional()
});

export const PreferenceSchema = z.object({
  id,
  kind: z.enum(['activity', 'object', 'place', 'food', 'social']),
  label: shortText,
  discovered: z.boolean()
});

export const CharacteristicSchema = z.object({
  id,
  value: z.number().finite().min(-1).max(1),
  confidence: z.number().finite().min(0).max(1)
});

export const SkillSchema = z.object({
  id,
  practice: z.number().finite().min(0).max(100),
  demonstratedLevel: z.number().int().min(0).max(5)
});

export const PalSchema = z.object({
  id,
  name: shortText,
  isFirstPal: z.boolean().default(false),
  lifeStage: LifeStageSchema,
  speciesId: id,
  lineageId: id.optional(),
  homeVillageId: id,
  householdId: id.optional(),
  storyRole: id.optional(),
  appearance: AppearanceSchema,
  preferences: z.array(PreferenceSchema).max(LIMITS.palDetails),
  characteristics: z.array(CharacteristicSchema).max(LIMITS.palDetails),
  skills: z.array(SkillSchema).max(LIMITS.palDetails),
  createdBy: z.enum(['canon', 'game', 'player'])
});

export const RelationshipSchema = z.object({
  id,
  fromPalId: id,
  toPalId: id,
  label: z.enum(['acquaintance', 'friend', 'close-friend', 'companion']),
  familiarity: z.number().finite().min(0).max(1),
  trust: z.number().finite().min(0).max(1),
  warmth: z.number().finite().min(-1).max(1),
  respect: z.number().finite().min(0).max(1),
  tension: z.number().finite().min(0).max(1),
  sharedHistory: z.number().finite().min(0).max(1)
});

export const MemorySchema = z.object({
  id,
  title: shortText,
  participantPalIds: idList().min(1),
  villageId: id,
  eventType: id,
  emotionalTone: z.enum(['joyful', 'playful', 'calm', 'uncertain', 'sad', 'hopeful']),
  summary: z.string().trim().min(1).max(500),
  worldDay: z.number().int().nonnegative(),
  significance: z.number().finite().min(0).max(1)
});

export const HomeObjectSchema = z.enum([
  'window-cushion',
  'memory-shelf',
  'story-lantern'
]);

export const HomeSchema = z.object({
  id,
  villageId: id,
  residentPalIds: idList().min(1),
  styleId: id,
  chosenObjectId: HomeObjectSchema.optional(),
  visibleChanges: idList()
});

export const VillageSchema = z.object({
  id,
  name: shortText,
  regionId: id,
  greatTreeId: id,
  canonStatus: CanonStatusSchema,
  residentPalIds: idList(),
  visibleChanges: idList()
});

export const GreatTreeSchema = z.object({
  id,
  villageId: id,
  recognizedMemoryIds: idList(),
  visualHistoryMarkers: idList()
});

const WorldFields = {
  worldId: id,
  worldName: shortText,
  seed: z.number().int().nonnegative().max(0xffffffff),
  worldDay: z.number().int().nonnegative(),
  firstPalId: id,
  species: z.array(SpeciesSchema).min(1).max(LIMITS.species),
  lineages: z.array(RegionalLineageSchema).max(LIMITS.lineages),
  pals: z.array(PalSchema).min(1).max(LIMITS.pals),
  relationships: z.array(RelationshipSchema).max(LIMITS.relationships),
  memories: z.array(MemorySchema).max(LIMITS.memories),
  homes: z.array(HomeSchema).max(LIMITS.homes),
  villages: z.array(VillageSchema).min(1).max(LIMITS.villages),
  greatTrees: z.array(GreatTreeSchema).min(1).max(LIMITS.greatTrees)
};

const WorldV1Schema = z.object({
  schemaVersion: z.literal(1),
  ...WorldFields,
  homes: z.array(HomeSchema).max(LIMITS.homes).default([])
});

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
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: `${label} contains duplicate value ${duplicate}.`,
      path
    });
  }
}

export const WorldSchema = z.object({
  schemaVersion: z.literal(CURRENT_SCHEMA_VERSION),
  ...WorldFields
}).superRefine((world, context) => {
  const collections: Array<[string, Array<{ id: string }>, string]> = [
    ['Species', world.species, 'species'],
    ['Lineages', world.lineages, 'lineages'],
    ['Pals', world.pals, 'pals'],
    ['Relationships', world.relationships, 'relationships'],
    ['Memories', world.memories, 'memories'],
    ['Homes', world.homes, 'homes'],
    ['Villages', world.villages, 'villages'],
    ['Great Trees', world.greatTrees, 'greatTrees']
  ];

  for (const [label, entries, path] of collections) {
    addDuplicateIssues(context, label, entries.map((entry) => entry.id), [path]);
  }

  const speciesById = new Map(world.species.map((species) => [species.id, species]));
  const lineageById = new Map(world.lineages.map((lineage) => [lineage.id, lineage]));
  const palById = new Map(world.pals.map((pal) => [pal.id, pal]));
  const homeById = new Map(world.homes.map((home) => [home.id, home]));
  const villageById = new Map(world.villages.map((village) => [village.id, village]));
  const memoryById = new Map(world.memories.map((memory) => [memory.id, memory]));
  const treeById = new Map(world.greatTrees.map((tree) => [tree.id, tree]));
  const firstPals = world.pals.filter((pal) => pal.isFirstPal);

  if (!palById.has(world.firstPalId) || firstPals.length !== 1 || firstPals[0]?.id !== world.firstPalId) {
    context.addIssue({ code: z.ZodIssueCode.custom, message: 'World must contain exactly one matching first Pal.' });
  }

  addDuplicateIssues(
    context,
    'Pal story roles',
    world.pals.flatMap((pal) => pal.storyRole ? [pal.storyRole] : []),
    ['pals']
  );

  for (const lineage of world.lineages) {
    if (!speciesById.has(lineage.speciesId)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Lineage ${lineage.id} references unknown species ${lineage.speciesId}.`,
        path: ['lineages']
      });
    }
  }

  for (const pal of world.pals) {
    const species = speciesById.get(pal.speciesId);
    const village = villageById.get(pal.homeVillageId);

    if (!species) {
      context.addIssue({ code: z.ZodIssueCode.custom, message: `Pal ${pal.id} references unknown species ${pal.speciesId}.`, path: ['pals'] });
    }

    if (pal.lineageId) {
      const lineage = lineageById.get(pal.lineageId);
      if (!lineage) {
        context.addIssue({ code: z.ZodIssueCode.custom, message: `Pal ${pal.id} references unknown lineage ${pal.lineageId}.`, path: ['pals'] });
      } else if (lineage.speciesId !== pal.speciesId) {
        context.addIssue({ code: z.ZodIssueCode.custom, message: `Pal ${pal.id} lineage does not match its species.`, path: ['pals'] });
      }
    }

    if (!village) {
      context.addIssue({ code: z.ZodIssueCode.custom, message: `Pal ${pal.id} references unknown village ${pal.homeVillageId}.`, path: ['pals'] });
    } else if (!village.residentPalIds.includes(pal.id)) {
      context.addIssue({ code: z.ZodIssueCode.custom, message: `Pal ${pal.id} is missing from resident list for ${village.id}.`, path: ['villages'] });
    }

    if (pal.householdId) {
      const home = homeById.get(pal.householdId);
      if (!home) {
        context.addIssue({ code: z.ZodIssueCode.custom, message: `Pal ${pal.id} references unknown household ${pal.householdId}.`, path: ['pals'] });
      } else if (!home.residentPalIds.includes(pal.id)) {
        context.addIssue({ code: z.ZodIssueCode.custom, message: `Household ${home.id} does not list Pal ${pal.id} as a resident.`, path: ['homes'] });
      }
    }

    addDuplicateIssues(context, `Pal ${pal.id} preferences`, pal.preferences.map((value) => value.id), ['pals']);
    addDuplicateIssues(context, `Pal ${pal.id} characteristics`, pal.characteristics.map((value) => value.id), ['pals']);
    addDuplicateIssues(context, `Pal ${pal.id} skills`, pal.skills.map((value) => value.id), ['pals']);
  }

  const relationshipPairs = new Set<string>();
  for (const relationship of world.relationships) {
    if (!palById.has(relationship.fromPalId) || !palById.has(relationship.toPalId)) {
      context.addIssue({ code: z.ZodIssueCode.custom, message: `Relationship ${relationship.id} references an unknown Pal.`, path: ['relationships'] });
    }
    if (relationship.fromPalId === relationship.toPalId) {
      context.addIssue({ code: z.ZodIssueCode.custom, message: `Relationship ${relationship.id} cannot be self-directed.`, path: ['relationships'] });
    }

    const pair = `${relationship.fromPalId}>${relationship.toPalId}`;
    if (relationshipPairs.has(pair)) {
      context.addIssue({ code: z.ZodIssueCode.custom, message: `Duplicate directed relationship ${pair}.`, path: ['relationships'] });
    }
    relationshipPairs.add(pair);
  }

  for (const memory of world.memories) {
    addDuplicateIssues(context, `Memory ${memory.id} participants`, memory.participantPalIds, ['memories']);

    for (const participantId of memory.participantPalIds) {
      if (!palById.has(participantId)) {
        context.addIssue({ code: z.ZodIssueCode.custom, message: `Memory ${memory.id} references unknown Pal ${participantId}.`, path: ['memories'] });
      }
    }
    if (!villageById.has(memory.villageId)) {
      context.addIssue({ code: z.ZodIssueCode.custom, message: `Memory ${memory.id} references unknown village ${memory.villageId}.`, path: ['memories'] });
    }
    if (memory.worldDay > world.worldDay) {
      context.addIssue({ code: z.ZodIssueCode.custom, message: `Memory ${memory.id} occurs after the current world day.`, path: ['memories'] });
    }
  }

  for (const home of world.homes) {
    const village = villageById.get(home.villageId);
    if (!village) {
      context.addIssue({ code: z.ZodIssueCode.custom, message: `Home ${home.id} references unknown village ${home.villageId}.`, path: ['homes'] });
    }

    addDuplicateIssues(context, `Home ${home.id} residents`, home.residentPalIds, ['homes']);
    addDuplicateIssues(context, `Home ${home.id} visible changes`, home.visibleChanges, ['homes']);

    for (const residentPalId of home.residentPalIds) {
      const resident = palById.get(residentPalId);
      if (!resident) {
        context.addIssue({ code: z.ZodIssueCode.custom, message: `Home ${home.id} references unknown resident Pal ${residentPalId}.`, path: ['homes'] });
      } else if (resident.homeVillageId !== home.villageId) {
        context.addIssue({ code: z.ZodIssueCode.custom, message: `Home ${home.id} resident ${residentPalId} belongs to another village.`, path: ['homes'] });
      }
    }

    if (home.chosenObjectId && !home.visibleChanges.includes(home.chosenObjectId)) {
      context.addIssue({ code: z.ZodIssueCode.custom, message: `Home ${home.id} chosen object is missing from visible changes.`, path: ['homes'] });
    }
  }

  for (const village of world.villages) {
    addDuplicateIssues(context, `Village ${village.id} residents`, village.residentPalIds, ['villages']);
    addDuplicateIssues(context, `Village ${village.id} visible changes`, village.visibleChanges, ['villages']);

    for (const residentPalId of village.residentPalIds) {
      const resident = palById.get(residentPalId);
      if (!resident) {
        context.addIssue({ code: z.ZodIssueCode.custom, message: `Village ${village.id} references unknown resident Pal ${residentPalId}.`, path: ['villages'] });
      } else if (resident.homeVillageId !== village.id) {
        context.addIssue({ code: z.ZodIssueCode.custom, message: `Village ${village.id} lists Pal ${residentPalId} whose home is elsewhere.`, path: ['villages'] });
      }
    }

    const tree = treeById.get(village.greatTreeId);
    if (!tree) {
      context.addIssue({ code: z.ZodIssueCode.custom, message: `Village ${village.id} references unknown Great Tree ${village.greatTreeId}.`, path: ['villages'] });
    } else if (tree.villageId !== village.id) {
      context.addIssue({ code: z.ZodIssueCode.custom, message: `Great Tree ${tree.id} belongs to another village.`, path: ['greatTrees'] });
    }
  }

  for (const tree of world.greatTrees) {
    if (!villageById.has(tree.villageId)) {
      context.addIssue({ code: z.ZodIssueCode.custom, message: `Great Tree ${tree.id} references unknown village ${tree.villageId}.`, path: ['greatTrees'] });
    }

    addDuplicateIssues(context, `Great Tree ${tree.id} recognized memories`, tree.recognizedMemoryIds, ['greatTrees']);
    addDuplicateIssues(context, `Great Tree ${tree.id} visual markers`, tree.visualHistoryMarkers, ['greatTrees']);

    for (const memoryId of tree.recognizedMemoryIds) {
      const memory = memoryById.get(memoryId);
      if (!memory) {
        context.addIssue({ code: z.ZodIssueCode.custom, message: `Great Tree ${tree.id} recognizes unknown memory ${memoryId}.`, path: ['greatTrees'] });
      } else if (memory.villageId !== tree.villageId) {
        context.addIssue({ code: z.ZodIssueCode.custom, message: `Great Tree ${tree.id} recognizes a memory from another village.`, path: ['greatTrees'] });
      }
    }
  }
});

export type Pal = z.infer<typeof PalSchema>;
export type Relationship = z.infer<typeof RelationshipSchema>;
export type Memory = z.infer<typeof MemorySchema>;
export type Home = z.infer<typeof HomeSchema>;
export type HomeObject = z.infer<typeof HomeObjectSchema>;
export type World = z.infer<typeof WorldSchema>;

type WorldV1 = z.infer<typeof WorldV1Schema>;

function availableHomeId(baseId: string, homes: WorldV1['homes']): string {
  const existing = new Set(homes.map((home) => home.id));
  if (!existing.has(baseId)) return baseId;

  let counter = 2;
  while (existing.has(`${baseId}-${counter}`)) counter += 1;
  return `${baseId}-${counter}`;
}

function migrateV1(world: WorldV1): World {
  const firstPal = world.pals.find((pal) => pal.id === world.firstPalId);
  if (!firstPal) {
    return WorldSchema.parse({ ...world, schemaVersion: CURRENT_SCHEMA_VERSION });
  }

  const firstRelationship = world.relationships.find(
    (relationship) => relationship.fromPalId === firstPal.id && relationship.toPalId !== firstPal.id
  );
  const firstNeighborId = firstRelationship?.toPalId;

  let homes = [...world.homes];
  let firstHome = homes.find((home) => home.residentPalIds.includes(firstPal.id));

  if (!firstHome) {
    const homeId = availableHomeId(`home-${world.seed.toString(36)}-first`, homes);
    firstHome = {
      id: homeId,
      villageId: firstPal.homeVillageId,
      residentPalIds: [firstPal.id],
      styleId: 'willowmere-roundhouse',
      visibleChanges: []
    };
    homes = [...homes, firstHome];
  }

  const pals = world.pals.map((pal) => {
    const nextPal = { ...pal };

    if (pal.id === firstPal.id && (!pal.householdId || !homes.some((home) => home.id === pal.householdId && home.residentPalIds.includes(pal.id)))) {
      nextPal.householdId = firstHome.id;
    }

    if (pal.id === firstNeighborId && !pal.storyRole) {
      nextPal.storyRole = 'first-neighbor';
    }

    return nextPal;
  });

  return WorldSchema.parse({
    ...world,
    schemaVersion: CURRENT_SCHEMA_VERSION,
    pals,
    homes
  });
}

export function parseWorld(input: unknown): World {
  if (typeof input === 'object' && input !== null && 'schemaVersion' in input && input.schemaVersion === 1) {
    return migrateV1(WorldV1Schema.parse(input));
  }

  return WorldSchema.parse(input);
}
