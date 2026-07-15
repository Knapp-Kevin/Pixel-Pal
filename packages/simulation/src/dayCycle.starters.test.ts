import { describe, expect, it } from 'vitest';
import { completeFirstFriendshipCeremony } from './ceremony';
import { chooseFirstHomeObject } from './home';
import {
  completeFirstActivity,
  completeWorldDay,
  createFirstWorld,
  offerNextWorldDay,
  type FirstPalChoice,
  type WorldDayCompletion
} from './index';

const STARTERS: FirstPalChoice['speciesId'][] = ['fox', 'deer', 'rabbit', 'cat', 'duck'];

const helpingCompletion: WorldDayCompletion = {
  completed: true,
  successfulActions: 3,
  cooperativeTurns: 2,
  attempts: 3
};

const quietOrHomeCompletion: WorldDayCompletion = {
  completed: true,
  successfulActions: 2,
  cooperativeTurns: 2,
  attempts: 2
};

function completeInvitationByKind(
  world: ReturnType<typeof createFirstWorld>,
  kind: 'helping' | 'home' | 'quiet',
  evidence: WorldDayCompletion
) {
  const offered = offerNextWorldDay(world);
  const session = offered.daySessions.find((candidate) => candidate.status === 'offered');
  const invitation = session?.invitations.find((candidate) => candidate.kind === kind);
  if (!invitation) throw new Error(`Expected a ${kind} invitation.`);
  return completeWorldDay(offered, invitation.id, evidence);
}

function completeThreeDayWorld(speciesId: FirstPalChoice['speciesId']) {
  const created = createFirstWorld({
    worldId: `starter-${speciesId}`,
    worldName: 'Starter Equality World',
    seed: 42,
    firstPal: {
      name: `Pal-${speciesId}`,
      speciesId,
      paletteId: 'sunleaf',
      markingId: 'tail-tip',
      accessoryId: 'scarf'
    }
  });

  const firstActivity = completeFirstActivity(created, {
    activity: 'garden-game',
    completed: true,
    successfulActions: 4,
    cooperativeTurns: 3,
    attempts: 4
  });
  const ceremony = completeFirstFriendshipCeremony(firstActivity);
  const home = chooseFirstHomeObject(ceremony, 'story-lantern');
  const dayOne = completeInvitationByKind(home, 'helping', helpingCompletion);
  const dayTwo = completeInvitationByKind(dayOne, 'home', quietOrHomeCompletion);
  return completeInvitationByKind(dayTwo, 'quiet', quietOrHomeCompletion);
}

function outcomeShape(world: ReturnType<typeof completeThreeDayWorld>) {
  const firstPal = world.pals.find((pal) => pal.id === world.firstPalId);
  const relationship = world.relationships.find((candidate) => candidate.fromPalId === world.firstPalId);
  const home = world.homes.find((candidate) => candidate.residentPalIds.includes(world.firstPalId));
  const village = world.villages.find((candidate) => candidate.id === firstPal?.homeVillageId);

  return {
    worldDay: world.worldDay,
    sessionStatuses: world.daySessions.map((session) => session.status),
    sessionKinds: world.daySessions.map((session) => session.outcome?.kind),
    memoryTypes: world.memories.map((memory) => memory.eventType).sort(),
    skills: firstPal?.skills.map((skill) => skill.id).sort(),
    relationship: relationship
      ? {
          familiarity: relationship.familiarity,
          trust: relationship.trust,
          warmth: relationship.warmth,
          respect: relationship.respect,
          sharedHistory: relationship.sharedHistory
        }
      : null,
    homeChanges: home?.visibleChanges.slice().sort(),
    villageChanges: village?.visibleChanges.slice().sort()
  };
}

describe('starter equality through the repeatable living-world loop', () => {
  it('gives every starter species equivalent progression and persistent outcomes', () => {
    const worlds = STARTERS.map((speciesId) => completeThreeDayWorld(speciesId));
    const baseline = outcomeShape(worlds[0]!);

    for (const [index, world] of worlds.entries()) {
      expect(world.pals.find((pal) => pal.id === world.firstPalId)?.speciesId).toBe(STARTERS[index]);
      expect(outcomeShape(world)).toEqual(baseline);
    }
  });
});
