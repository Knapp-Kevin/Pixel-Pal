import { z } from 'zod';
import { validateDaySessions } from './dayCycleChecks';
import { BaseWorldSchema } from './worldBase';
import { validateWorld } from './worldChecks';

export const WorldSchema = BaseWorldSchema.superRefine(validateWorld).superRefine(validateDaySessions);
export type World = z.infer<typeof WorldSchema>;
