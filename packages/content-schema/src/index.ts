import { z } from 'zod';

const id = z.string().min(1).max(96).regex(/^[a-z0-9][a-z0-9-_]*$/);
const shortText = z.string().trim().min(1).max(80);

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
  value: z.number().min(-1).max(1),
  confidence: z.number().min(0).max(1)
});

export const SkillSchema = z.object({
  id,
  practice: z.number().min(0).max(100),
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
  appearance: AppearanceSchema,
  preferences: z.array(PreferenceSchema),
  characteristics: z.array(CharacteristicSchema),
  skills: z.array(SkillSchema),
  createdBy: z.enum(['canon', 'game', 'player'])
});

export const RelationshipSchema = z.object({
  id,
  fromPalId: id,
  toPalId: id,
  label: z.enum(['acquaintance', 'friend', 'close-friend', 'companion']),
  familiarity: z.number().min(0).max(1),
  trust: z.number().min(0).max(1),
  warmth: z.number().min(-1).max(1),
  respect: z.number().min(0).max(1),
  tension: z.number().min(0).max(1),
  sharedHistory: z.number().min(0).max(1)
});

export const MemorySchema = z.object({
  id,
  title: shortText,
  participantPalIds: z.array(id).min(1),
  villageId: id,
  eventType: id,
  emotionalTone: z.enum(['joyful', 'playful', 'calm', 'uncertain', 'sad', 'hopeful']),
  summary: z.string().trim().min(1).max(500),
  worldDay: z.number().int().nonnegative(),
  significance: z.number().min(0).max(1)
});

export const VillageSchema = z.object({
  id,
  name: shortText,
  regionId: id,
  greatTreeId: id,
  canonStatus: CanonStatusSchema,
  residentPalIds: z.array(id),
  visibleChanges: z.array(id)
});

export const GreatTreeSchema = z.object({
  id,
  villageId: id,
  recognizedMemoryIds: z.array(id),
  visualHistoryMarkers: z.array(id)
});

export const WorldSchema = z.object({
  schemaVersion: z.literal(1),
  worldId: id,
  worldName: shortText,
  seed: z.number().int().nonnegative(),
  worldDay: z.number().int().nonnegative(),
  firstPalId: id,
  species: z.array(SpeciesSchema),
  lineages: z.array(RegionalLineageSchema),
  pals: z.array(PalSchema),
  relationships: z.array(RelationshipSchema),
  memories: z.array(MemorySchema),
  villages: z.array(VillageSchema),
  greatTrees: z.array(GreatTreeSchema)
}).superRefine((world, context) => {
  const palIds = new Set(world.pals.map((pal) => pal.id));
  const villageIds = new Set(world.villages.map((village) => village.id));
  const firstPals = world.pals.filter((pal) => pal.isFirstPal);

  if (!palIds.has(world.firstPalId) || firstPals.length !== 1 || firstPals[0]?.id !== world.firstPalId) {
    context.addIssue({ code: z.ZodIssueCode.custom, message: 'World must contain exactly one matching first Pal.' });
  }

  for (const pal of world.pals) {
    if (!villageIds.has(pal.homeVillageId)) {
      context.addIssue({ code: z.ZodIssueCode.custom, message: `Pal ${pal.id} references an unknown village.` });
    }
  }

  for (const relationship of world.relationships) {
    if (!palIds.has(relationship.fromPalId) || !palIds.has(relationship.toPalId)) {
      context.addIssue({ code: z.ZodIssueCode.custom, message: `Relationship ${relationship.id} references an unknown Pal.` });
    }
    if (relationship.fromPalId === relationship.toPalId) {
      context.addIssue({ code: z.ZodIssueCode.custom, message: `Relationship ${relationship.id} cannot be self-directed.` });
    }
  }
});

export type Pal = z.infer<typeof PalSchema>;
export type Relationship = z.infer<typeof RelationshipSchema>;
export type Memory = z.infer<typeof MemorySchema>;
export type World = z.infer<typeof WorldSchema>;

export function parseWorld(input: unknown): World {
  return WorldSchema.parse(input);
}
