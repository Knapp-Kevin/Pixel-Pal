import { z } from 'zod';
import { CanonStatusSchema, id, idList, LIMITS, LifeStageSchema, shortText } from './primitives';

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

export type Pal = z.infer<typeof PalSchema>;
export type Village = z.infer<typeof VillageSchema>;
export type Relationship = z.infer<typeof RelationshipSchema>;
export type Memory = z.infer<typeof MemorySchema>;
export type Home = z.infer<typeof HomeSchema>;
export type HomeObject = z.infer<typeof HomeObjectSchema>;
