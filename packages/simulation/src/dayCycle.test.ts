import { describe, expect, it } from 'vitest';
import {
  completeFirstActivity,
  completeWorldDay,
  createFirstWorld,
  generateDayInvitations,
  offerNextWorldDay,
  type FirstActivityCompletion,
  type WorldDayCompletion
} from './index';
import { completeFirstFriendshipCeremony } from './ceremony';
import { chooseFirstHomeObject } from './home';

const input = {
  worldId: 'repeatable-world',
  worldName: 'Our Pixel Pals',
  seed: 42,
  firstPal: {
    name: 'Pip',
    speciesId: 'fox' as const,
    paletteId: 'sunleaf' as const,
    markingId: 'tail-tip' as const,
    accessoryId: 'scarf' as const
  }
};

const firstCompletion: FirstActivityCompletion = {
  activity: 'garden-game',
  completed: true,
  successfulActions: 4,
  cooperativeTurns: 3,
  attempts: 4
};

const quietCompletion: WorldDayCompletion = {
  completed: true,
  successfulActions: 2,
  cooperativeTurns: 2,
  attempts: 2
};

const helpingCompletion: WorldDayCompletion = {
  completed: true,
  successfulActions: 3,
  cooperativeTurns: 2,
  attempts: 3
};

function readyWorld() {
  return chooseFirstHomeObject(
    completeFirstFriendshipCeremony(
      completeFirstActivity(createFirstWorld(input), firstCompletion)
    ),
    'story-lantern'
  );
}

describe('repeatable world day rhythm', () => {
  it('generates deterministic contextual invitations', () => {
    const world = readyWorld();
    expect(generateDayInvitations(world)).toEqual(generateDayInvitations(world));
    expect(generateDayInvitations(world).map((invitation) => invitation.kind)).toEqual(['active', 'quiet', 'helping']);
  });

  it('offers the next day idempotently', () => {
    const once = offerNextWorldDay(readyWorld());
    const twice = offerNextWorldDay(once);
    expect(twice).toEqual(once);
    expect(once.daySessions).toHaveLength(1);
    expect(once.daySessions[0]?.day).toBe(1);
  });

  it('completes a quiet visit and advances exactly one world day', () => {
    const offered = offerNextWorldDay(readyWorld());
    const quiet = offered.daySessions[0]?.invitations.find((invitation) => invitation.kind === 'quiet');
    const completed = completeWorldDay(offered, quiet!.id, quietCompletion);
    const firstPal = completed.pals.find((pal) => pal.id === completed.firstPalId);

    expect(completed.worldDay).toBe(1);
    expect(completed.daySessions[0]?.status).toBe('completed');
    expect(completed.memories.some((memory) => memory.eventType === 'world-day-quiet')).toBe(true);
    expect(firstPal?.skills.some((skill) => skill.id === 'listening')).toBe(true);
  });

  it('persists a visible village change after helping', () => {
    const offered = offerNextWorldDay(readyWorld());
    const helping = offered.daySessions[0]?.invitations.find((invitation) => invitation.kind === 'helping');
    const completed = completeWorldDay(offered, helping!.id, helpingCompletion);

    expect(completed.villages[0]?.visibleChanges.some((change) => change.startsWith('village-help-'))).toBe(true);
    expect(completed.daySessions[0]?.outcome?.visibleChangeId).toMatch(/^village-help-/);
  });

  it('requires the invited mini-game completion evidence', () => {
    const offered = offerNextWorldDay(readyWorld());
    const active = offered.daySessions[0]?.invitations.find((invitation) => invitation.kind === 'active');

    expect(() => completeWorldDay(offered, active!.id, {
      completed: true,
      activity: active!.activityId === 'leaf-chase' ? 'stone-stacking' : 'leaf-chase',
      successfulActions: 6,
      cooperativeTurns: 7,
      attempts: 6
    })).toThrow(/does not match/i);
  });

  it('deepens repeated quiet visits without duplicating the journal memory', () => {
    const firstOffer = offerNextWorldDay(readyWorld());
    const firstQuiet = firstOffer.daySessions[0]?.invitations.find((invitation) => invitation.kind === 'quiet');
    const dayOne = completeWorldDay(firstOffer, firstQuiet!.id, quietCompletion);
    const secondOffer = offerNextWorldDay(dayOne);
    const secondQuiet = secondOffer.daySessions[1]?.invitations.find((invitation) => invitation.kind === 'quiet');
    const dayTwo = completeWorldDay(secondOffer, secondQuiet!.id, quietCompletion);

    expect(dayTwo.worldDay).toBe(2);
    expect(dayTwo.daySessions).toHaveLength(2);
    expect(dayTwo.memories.filter((memory) => memory.eventType === 'world-day-quiet')).toHaveLength(1);
    expect(dayTwo.daySessions[1]?.outcome?.memoryId).toBeUndefined();
  });
});
