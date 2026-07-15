import { z } from 'zod';

export const CURRENT_SCHEMA_VERSION = 2 as const;

export const LIMITS = {
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

export const id = z.string().min(1).max(96).regex(/^[a-z0-9][a-z0-9-_]*$/);
export const shortText = z.string().trim().min(1).max(80);
export const idList = (maximum: number = LIMITS.references) => z.array(id).max(maximum);

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
