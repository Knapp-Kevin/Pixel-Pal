import { z } from 'zod';
import { AdventureSessionSchema } from './adventures';
import { DaySessionSchema } from './dayCycle';
import {
  FamilyBondSchema,
  GreatTreeSchema,
  HomeSchema,
  MemorySchema,
  PalSchema,
  RegionalLineageSchema,
  RelationshipSchema,
  SpeciesSchema,
  VillageSchema
} from './entities';
import { CURRENT_SCHEMA_VERSION, id, LIMITS, shortText } from './primitives';

export const LegacyWorldFields = {
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

export const WorldV3Fields = {
  ...LegacyWorldFields,
  daySessions: z.array(DaySessionSchema).max(LIMITS.daySessions).default([]),
  adventureSessions: z.array(AdventureSessionSchema).max(LIMITS.adventureSessions).default([])
};

export const WorldFields = {
  ...WorldV3Fields,
  familyBonds: z.array(FamilyBondSchema).max(LIMITS.familyBonds).default([])
};

export const BaseWorldSchema = z.object({ schemaVersion: z.literal(CURRENT_SCHEMA_VERSION), ...WorldFields });
export const WorldV3Schema = z.object({ schemaVersion: z.literal(3), ...WorldV3Fields });
export const WorldV2Schema = z.object({ schemaVersion: z.literal(2), ...LegacyWorldFields });
export const WorldV1Schema = z.object({
  schemaVersion: z.literal(1),
  ...LegacyWorldFields,
  homes: z.array(HomeSchema).max(LIMITS.homes).default([])
});

export type WorldShape = z.infer<typeof BaseWorldSchema>;
export type WorldV3 = z.infer<typeof WorldV3Schema>;
export type WorldV2 = z.infer<typeof WorldV2Schema>;
export type WorldV1 = z.infer<typeof WorldV1Schema>;