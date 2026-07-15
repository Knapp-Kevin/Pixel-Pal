import { z } from 'zod';
import { BaseWorldSchema } from './worldBase';
import { validateWorld } from './worldChecks';

export const WorldSchema = BaseWorldSchema.superRefine(validateWorld);

export type World = z.infer<typeof WorldSchema>;
