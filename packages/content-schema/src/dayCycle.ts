import { z } from 'zod';
import { HomeObjectSchema } from './entities';
import { id, idList, shortText } from './primitives';

export const DayInvitationKindSchema = z.enum(['active', 'quiet', 'home', 'helping']);
export const DaySessionStatusSchema = z.enum(['offered', 'completed']);

export const DayInvitationSchema = z.object({
  id,
  day: z.number().int().positive(),
  kind: DayInvitationKindSchema,
  title: shortText,
  summary: z.string().trim().min(1).max(240),
  villageId: id,
  sourcePalId: id.optional(),
  activityId: id.optional(),
  homeObjectId: HomeObjectSchema.optional(),
  outcomeKey: id
});

export const DayOutcomeSchema = z.object({
  invitationId: id,
  kind: DayInvitationKindSchema,
  participantPalIds: idList(8).min(1),
  summary: z.string().trim().min(1).max(320),
  memoryId: id.optional(),
  visibleChangeId: id.optional(),
  skillId: id.optional()
});

export const DaySessionSummarySchema = z.object({
  title: shortText,
  summary: z.string().trim().min(1).max(420),
  emotionalTone: z.enum(['joyful', 'playful', 'calm', 'hopeful']),
  highlightIds: idList(6)
});

export const DaySessionSchema = z.object({
  id,
  day: z.number().int().positive(),
  status: DaySessionStatusSchema,
  invitations: z.array(DayInvitationSchema).min(2).max(3),
  selectedInvitationId: id.optional(),
  outcome: DayOutcomeSchema.optional(),
  summary: DaySessionSummarySchema.optional()
}).superRefine((session, context) => {
  const invitationIds = new Set(session.invitations.map((invitation) => invitation.id));
  if (invitationIds.size !== session.invitations.length) {
    context.addIssue({ code: z.ZodIssueCode.custom, message: 'Day session invitations must have unique identities.' });
  }

  for (const invitation of session.invitations) {
    if (invitation.day !== session.day) {
      context.addIssue({ code: z.ZodIssueCode.custom, message: 'Every invitation must belong to its containing world day.' });
    }
  }

  if (session.status === 'offered') {
    if (session.selectedInvitationId || session.outcome || session.summary) {
      context.addIssue({ code: z.ZodIssueCode.custom, message: 'An offered day session cannot contain a completed outcome.' });
    }
    return;
  }

  if (!session.selectedInvitationId || !session.outcome || !session.summary) {
    context.addIssue({ code: z.ZodIssueCode.custom, message: 'A completed day session requires a selected invitation, outcome, and summary.' });
    return;
  }

  if (!invitationIds.has(session.selectedInvitationId)) {
    context.addIssue({ code: z.ZodIssueCode.custom, message: 'The selected day invitation must belong to the session.' });
  }
  if (session.outcome.invitationId !== session.selectedInvitationId) {
    context.addIssue({ code: z.ZodIssueCode.custom, message: 'The day outcome must match the selected invitation.' });
  }
});

export type DayInvitationKind = z.infer<typeof DayInvitationKindSchema>;
export type DayInvitation = z.infer<typeof DayInvitationSchema>;
export type DayOutcome = z.infer<typeof DayOutcomeSchema>;
export type DaySessionSummary = z.infer<typeof DaySessionSummarySchema>;
export type DaySession = z.infer<typeof DaySessionSchema>;
