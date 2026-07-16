import { z } from 'zod';
import type { WorldShape } from './worldBase';

function issue(context: z.RefinementCtx, message: string, path?: Array<string | number>): void {
  context.addIssue({ code: z.ZodIssueCode.custom, message, ...(path ? { path } : {}) });
}

export function validateAdventureSessions(world: WorldShape, context: z.RefinementCtx): void {
  const palIds = new Set(world.pals.map((pal) => pal.id));
  const villageById = new Map(world.villages.map((village) => [village.id, village]));
  const memoryById = new Map(world.memories.map((memory) => [memory.id, memory]));
  const adventureIds = new Set<string>();

  for (const [index, session] of world.adventureSessions.entries()) {
    const path = ['adventureSessions', index];

    if (adventureIds.has(session.adventureId)) {
      issue(context, `Adventure ${session.adventureId} may only have one saved session.`, path);
    }
    adventureIds.add(session.adventureId);

    if (new Set(session.participantPalIds).size !== session.participantPalIds.length) {
      issue(context, `Adventure ${session.id} contains duplicate participants.`, path);
    }
    for (const palId of session.participantPalIds) {
      if (!palIds.has(palId)) issue(context, `Adventure ${session.id} references unknown Pal ${palId}.`, path);
    }

    const village = villageById.get(session.villageId);
    if (!village) issue(context, `Adventure ${session.id} references unknown village ${session.villageId}.`, path);
    if (session.startedWorldDay > world.worldDay) {
      issue(context, `Adventure ${session.id} begins after the current world day.`, path);
    }

    if (session.status !== 'completed') continue;
    if ((session.completedWorldDay ?? 0) > world.worldDay) {
      issue(context, `Adventure ${session.id} completes after the current world day.`, path);
    }

    const memory = session.memoryId ? memoryById.get(session.memoryId) : undefined;
    if (!memory) {
      issue(context, `Adventure ${session.id} references an unknown completion memory.`, path);
    } else {
      if (memory.villageId !== session.villageId) {
        issue(context, `Adventure ${session.id} completion memory belongs to another village.`, path);
      }
      for (const participantId of session.participantPalIds) {
        if (!memory.participantPalIds.includes(participantId)) {
          issue(context, `Adventure ${session.id} completion memory omits participant ${participantId}.`, path);
        }
      }
    }

    if (session.visibleChangeId && village && !village.visibleChanges.includes(session.visibleChangeId)) {
      issue(context, `Adventure ${session.id} visible change is missing from ${village.id}.`, path);
    }
  }
}
