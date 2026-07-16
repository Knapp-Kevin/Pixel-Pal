import { z } from 'zod';
import { validateAdventureSessions } from './adventureChecks';
import { validateDaySessions } from './dayCycleChecks';
import { BaseWorldSchema } from './worldBase';
import { validateWorld } from './worldChecks';

export const WorldSchema = BaseWorldSchema
  .superRefine(validateWorld)
  .superRefine(validateDaySessions)
  .superRefine(validateAdventureSessions);
export type World = z.infer<typeof WorldSchema>;
