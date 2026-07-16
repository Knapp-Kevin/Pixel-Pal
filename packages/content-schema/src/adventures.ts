import { z } from 'zod';
import { id, idList, shortText } from './primitives';

export const AdventureIdSchema = z.enum([
  'lanterns-in-the-rain',
  'humming-bridge'
]);

export const AdventureSessionStatusSchema = z.enum(['active', 'completed']);

export const AdventureSessionSchema = z.object({
  id,
  adventureId: AdventureIdSchema,
  status: AdventureSessionStatusSchema,
  stageIndex: z.number().int().min(0).max(3),
  selectedChoiceIds: idList(3),
  participantPalIds: idList(4).min(2),
  villageId: id,
  startedWorldDay: z.number().int().nonnegative(),
  completedWorldDay: z.number().int().nonnegative().optional(),
  memoryId: id.optional(),
  visibleChangeId: id.optional(),
  summary: shortText.optional()
}).superRefine((session, context) => {
  if (new Set(session.selectedChoiceIds).size !== session.selectedChoiceIds.length) {
    context.addIssue({ code: z.ZodIssueCode.custom, message: 'Adventure choices must be unique within one session.' });
  }

  if (session.status === 'active') {
    if (session.stageIndex >= 3) {
      context.addIssue({ code: z.ZodIssueCode.custom, message: 'An active adventure must still have an unfinished stage.' });
    }
    if (session.selectedChoiceIds.length !== session.stageIndex) {
      context.addIssue({ code: z.ZodIssueCode.custom, message: 'An active adventure must record one choice for every completed stage.' });
    }
    if (session.completedWorldDay !== undefined || session.memoryId || session.visibleChangeId || session.summary) {
      context.addIssue({ code: z.ZodIssueCode.custom, message: 'An active adventure cannot claim completed outcomes.' });
    }
    return;
  }

  if (
    session.stageIndex !== 3
    || session.selectedChoiceIds.length !== 3
    || session.completedWorldDay === undefined
    || !session.memoryId
    || !session.visibleChangeId
    || !session.summary
  ) {
    context.addIssue({ code: z.ZodIssueCode.custom, message: 'A completed adventure requires all three choices and its durable outcome.' });
  }
});

export type AdventureId = z.infer<typeof AdventureIdSchema>;
export type AdventureSessionStatus = z.infer<typeof AdventureSessionStatusSchema>;
export type AdventureSession = z.infer<typeof AdventureSessionSchema>;
