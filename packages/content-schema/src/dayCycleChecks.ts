import { z } from 'zod';
import type { WorldShape } from './worldBase';

function addIssue(context: z.RefinementCtx, message: string): void {
  context.addIssue({ code: z.ZodIssueCode.custom, message, path: ['daySessions'] });
}

export function validateDaySessions(world: WorldShape, context: z.RefinementCtx): void {
  const sessionIds = new Set<string>();
  const sessionDays = new Set<number>();
  const palIds = new Set(world.pals.map((pal) => pal.id));
  const villageIds = new Set(world.villages.map((village) => village.id));
  const memoryIds = new Set(world.memories.map((memory) => memory.id));
  let offeredCount = 0;
  let highestCompletedDay = 0;

  for (const session of world.daySessions) {
    if (sessionIds.has(session.id)) addIssue(context, `Day sessions contain duplicate identity ${session.id}.`);
    if (sessionDays.has(session.day)) addIssue(context, `World day ${session.day} has more than one session.`);
    sessionIds.add(session.id);
    sessionDays.add(session.day);

    if (session.status === 'offered') {
      offeredCount += 1;
      if (session.day !== world.worldDay + 1) {
        addIssue(context, `Offered day ${session.day} must immediately follow current world day ${world.worldDay}.`);
      }
    } else {
      highestCompletedDay = Math.max(highestCompletedDay, session.day);
      if (session.day > world.worldDay) addIssue(context, `Completed day ${session.day} occurs after the current world day.`);
    }

    for (const invitation of session.invitations) {
      if (!villageIds.has(invitation.villageId)) {
        addIssue(context, `Invitation ${invitation.id} references unknown village ${invitation.villageId}.`);
      }
      if (invitation.sourcePalId && !palIds.has(invitation.sourcePalId)) {
        addIssue(context, `Invitation ${invitation.id} references unknown Pal ${invitation.sourcePalId}.`);
      }
    }

    if (!session.outcome) continue;
    for (const participantId of session.outcome.participantPalIds) {
      if (!palIds.has(participantId)) addIssue(context, `Day outcome references unknown Pal ${participantId}.`);
    }
    if (session.outcome.memoryId && !memoryIds.has(session.outcome.memoryId)) {
      addIssue(context, `Day outcome references unknown memory ${session.outcome.memoryId}.`);
    }
  }

  if (offeredCount > 1) addIssue(context, 'A world may contain only one offered day session.');
  if (world.daySessions.some((session) => session.status === 'completed') && highestCompletedDay !== world.worldDay) {
    addIssue(context, 'The current world day must match the latest completed day session.');
  }
}
