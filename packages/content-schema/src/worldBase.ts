import { z } from 'zod';
import {
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

export const WorldFields = {
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

export const BaseWorldSchema = z.object({
  schemaVersion: z.literal(CURRENT_SCHEMA_VERSION),
  ...WorldFields
});

export const WorldV1Schema = z.object({
  schemaVersion: z.literal(1),
  ...WorldFields,
  homes: z.array(HomeSchema).max(LIMITS.homes).default([])
});

export type WorldShape = z.infer<typeof BaseWorldSchema>;
export type WorldV1 = z.infer<typeof WorldV1Schema>;
