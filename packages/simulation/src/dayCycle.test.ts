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
  activity: 'garden-game', completed: true, successfulActions: 4, cooperativeTurns: 3, attempts: 4
};
const quietCompletion: WorldDayCompletion = { completed: true, successfulActions: 2, cooperativeTurns: 2, attempts: 2 };
const helpingCompletion: WorldDayCompletion = { completed: true, successfulActions: 3, cooperativeTurns: 2, attempts: 3 };
const homeCompletion: WorldDayCompletion = { completed: true, successfulActions: 2, cooperativeTurns: 2, attempts: 2 };

function readyWorld() {
  return chooseFirstHomeObject(
    completeFirstFriendshipCeremony(completeFirstActivity(createFirstWorld(input), firstCompletion)),
    'story-lantern'
  );
}

function invitationOfKind(world: ReturnType<typeof offerNextWorldDay>, kind: 'active' | 'quiet' | 'home' | 'helping') {
  return world.daySessions.find((session) => session.status === 'offered')?.invitations.find((invitation) => invitation.kind === kind);
}

describe('repeatable world day rhythm', () => {
  it('generates deterministic contextual invitations', () => {
    const world = readyWorld();
    expect(generateDayInvitations(world)).toEqual(generateDayInvitations(world));
    expect(generateDayInvitations(world).map((invitation) => invitation.kind)).toEqual(['active', 'quiet', 'helping']);
  });

  it('rotates the chosen home object into day two', () => {
    const firstOffer = offerNextWorldDay(readyWorld());
    const dayOne = completeWorldDay(firstOffer, invitationOfKind(firstOffer, 'helping')!.id, helpingCompletion);
    const dayTwoInvitations = generateDayInvitations(dayOne);
    const home = dayTwoInvitations.find((invitation) => invitation.kind === 'home');
    expect(dayTwoInvitations.map((invitation) => invitation.kind)).toEqual(['active', 'home', 'helping']);
    expect(home?.homeObjectId).toBe('story-lantern');
  });

  it('offers the next day idempotently', () => {
    const once = offerNextWorldDay(readyWorld());
    expect(offerNextWorldDay(once)).toEqual(once);
    expect(once.daySessions[0]?.day).toBe(1);
  });

  it('completes a quiet visit and advances exactly one world day', () => {
    const offered = offerNextWorldDay(readyWorld());
    const completed = completeWorldDay(offered, invitationOfKind(offered, 'quiet')!.id, quietCompletion);
    const firstPal = completed.pals.find((pal) => pal.id === completed.firstPalId);
    expect(completed.worldDay).toBe(1);
    expect(completed.memories.some((memory) => memory.eventType === 'world-day-quiet')).toBe(true);
    expect(firstPal?.skills.some((skill) => skill.id === 'listening')).toBe(true);
  });

  it('persists a visible village change after helping', () => {
    const offered = offerNextWorldDay(readyWorld());
    const completed = completeWorldDay(offered, invitationOfKind(offered, 'helping')!.id, helpingCompletion);
    expect(completed.villages[0]?.visibleChanges.some((change) => change.startsWith('village-help-'))).toBe(true);
  });

  it('persists the home path in the actual home', () => {
    const firstOffer = offerNextWorldDay(readyWorld());
    const dayOne = completeWorldDay(firstOffer, invitationOfKind(firstOffer, 'helping')!.id, helpingCompletion);
    const secondOffer = offerNextWorldDay(dayOne);
    const dayTwo = completeWorldDay(secondOffer, invitationOfKind(secondOffer, 'home')!.id, homeCompletion);
    const firstHome = dayTwo.homes.find((candidate) => candidate.residentPalIds.includes(dayTwo.firstPalId));
    expect(dayTwo.worldDay).toBe(2);
    expect(firstHome?.visibleChanges).toContain('shared-day-story-lantern');
    expect(dayTwo.memories.some((memory) => memory.eventType === 'world-day-home')).toBe(true);
    expect(dayTwo.pals.find((pal) => pal.id === dayTwo.firstPalId)?.skills.some((skill) => skill.id === 'home-making')).toBe(true);
  });

  it('requires the invited mini-game completion evidence', () => {
    const offered = offerNextWorldDay(readyWorld());
    const active = invitationOfKind(offered, 'active');
    expect(() => completeWorldDay(offered, active!.id, {
      completed: true,
      activity: active!.activityId === 'leaf-chase' ? 'stone-stacking' : 'leaf-chase',
      successfulActions: 6,
      cooperativeTurns: 7,
      attempts: 6
    })).toThrow(/does not match/i);
  });

  it('deepens a later quiet visit without duplicating its memory', () => {
    const firstOffer = offerNextWorldDay(readyWorld());
    const dayOne = completeWorldDay(firstOffer, invitationOfKind(firstOffer, 'quiet')!.id, quietCompletion);
    const secondOffer = offerNextWorldDay(dayOne);
    const dayTwo = completeWorldDay(secondOffer, invitationOfKind(secondOffer, 'home')!.id, homeCompletion);
    const thirdOffer = offerNextWorldDay(dayTwo);
    const dayThree = completeWorldDay(thirdOffer, invitationOfKind(thirdOffer, 'quiet')!.id, quietCompletion);
    expect(dayThree.worldDay).toBe(3);
    expect(dayThree.daySessions).toHaveLength(3);
    expect(dayThree.memories.filter((memory) => memory.eventType === 'world-day-quiet')).toHaveLength(1);
    expect(dayThree.daySessions[2]?.outcome?.memoryId).toBeUndefined();
  });
});
