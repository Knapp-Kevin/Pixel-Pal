import { describe, expect, it } from 'vitest';
import type { AdventureId } from '@pixel-pals/content-schema';
import {
  activeAdventureSession,
  adventureSession,
  availableAdventures,
  chooseAdventureStage,
  createFirstWorld,
  startAdventure,
  type FirstActivityCompletion,
  type FirstPalChoice
} from './index';
import { completeFirstActivity } from './completeActivity';
import { completeFirstFriendshipCeremony } from './ceremony';
import { chooseFirstHomeObject } from './home';

const firstCompletion: FirstActivityCompletion = {
  activity: 'garden-game', completed: true, successfulActions: 4, cooperativeTurns: 3, attempts: 4
};

function readyWorld(speciesId: FirstPalChoice['speciesId'] = 'fox') {
  const seed = 84 + ['fox', 'deer', 'rabbit', 'cat', 'duck'].indexOf(speciesId);
  return chooseFirstHomeObject(
    completeFirstFriendshipCeremony(
      completeFirstActivity(createFirstWorld({
        worldId: `adventure-${speciesId}`,
        worldName: `${speciesId} adventure`,
        seed,
        firstPal: {
          name: `Pal-${speciesId}`,
          speciesId,
          paletteId: 'sunleaf',
          markingId: 'tail-tip',
          accessoryId: 'scarf'
        }
      }), firstCompletion)
    ),
    'story-lantern'
  );
}

function completeAdventure(world: ReturnType<typeof readyWorld>, adventureId: AdventureId) {
  const choices: Record<AdventureId, string[]> = {
    'lanterns-in-the-rain': ['listen-for-neighbors', 'soft-green', 'check-every-lantern'],
    'humming-bridge': ['hum-the-note-back', 'two-friends-rhythm', 'mark-the-pattern']
  };
  return choices[adventureId].reduce(
    (current, choiceId) => chooseAdventureStage(current, adventureId, choiceId),
    startAdventure(world, adventureId)
  );
}

describe('saved relationship adventures', () => {
  it('does not offer adventures before friendship and home prerequisites', () => {
    const world = createFirstWorld({
      worldId: 'too-early',
      worldName: 'Too Early',
      seed: 12,
      firstPal: { name: 'Pip', speciesId: 'fox', paletteId: 'sunleaf', markingId: 'tail-tip' }
    });
    expect(availableAdventures(world)).toEqual([]);
    expect(() => startAdventure(world, 'lanterns-in-the-rain')).toThrow(/friendship and home/i);
  });

  it('starts one resumable adventure without changing world history', () => {
    const world = readyWorld();
    const started = startAdventure(world, 'lanterns-in-the-rain');
    const session = activeAdventureSession(started);

    expect(session).toEqual(expect.objectContaining({
      adventureId: 'lanterns-in-the-rain',
      status: 'active',
      stageIndex: 0,
      selectedChoiceIds: []
    }));
    expect(started.memories).toEqual(world.memories);
    expect(started.villages).toEqual(world.villages);
    expect(startAdventure(started, 'lanterns-in-the-rain')).toEqual(started);
    expect(() => startAdventure(started, 'humming-bridge')).toThrow(/current adventure/i);
  });

  it('records one valid choice for each completed stage', () => {
    const started = startAdventure(readyWorld(), 'humming-bridge');
    expect(() => chooseAdventureStage(started, 'humming-bridge', 'steady-gold')).toThrow(/current adventure stage/i);

    const stageTwo = chooseAdventureStage(started, 'humming-bridge', 'close-eyes-and-listen');
    expect(adventureSession(stageTwo, 'humming-bridge')).toEqual(expect.objectContaining({
      stageIndex: 1,
      selectedChoiceIds: ['close-eyes-and-listen']
    }));
  });

  it.each<AdventureId>(['lanterns-in-the-rain', 'humming-bridge'])('completes %s exactly once with durable outcomes', (adventureId) => {
    const world = readyWorld();
    const relationshipBefore = world.relationships[0]!;
    const completed = completeAdventure(world, adventureId);
    const session = adventureSession(completed, adventureId)!;
    const definition = availableAdventures(completed).find((adventure) => adventure.id === adventureId)!;
    const firstPal = completed.pals.find((pal) => pal.id === completed.firstPalId)!;
    const relationshipAfter = completed.relationships[0]!;

    expect(session.status).toBe('completed');
    expect(session.stageIndex).toBe(3);
    expect(session.selectedChoiceIds).toHaveLength(3);
    expect(completed.memories.filter((memory) => memory.activityId === adventureId)).toHaveLength(1);
    expect(completed.villages[0]?.visibleChanges).toContain(definition.visibleChangeId);
    expect(firstPal.preferences.some((preference) => preference.subjectId === adventureId && preference.discovered)).toBe(true);
    expect(firstPal.skills.some((skill) => skill.id === definition.skillId)).toBe(true);
    expect(relationshipAfter.sharedHistory).toBeGreaterThan(relationshipBefore.sharedHistory);
    expect(chooseAdventureStage(completed, adventureId, session.selectedChoiceIds[2]!)).toEqual(completed);
  });

  it('preserves equal structural progression for every starter species', () => {
    const results = (['fox', 'deer', 'rabbit', 'cat', 'duck'] as const).map((speciesId) => {
      const completed = completeAdventure(readyWorld(speciesId), 'lanterns-in-the-rain');
      const firstPal = completed.pals.find((pal) => pal.id === completed.firstPalId)!;
      const session = adventureSession(completed, 'lanterns-in-the-rain')!;
      return {
        speciesId,
        status: session.status,
        choices: session.selectedChoiceIds.length,
        memories: completed.memories.filter((memory) => memory.activityId === 'lanterns-in-the-rain').length,
        villageChange: completed.villages[0]?.visibleChanges.includes('adventure-rain-lantern-path'),
        skill: firstPal.skills.find((skill) => skill.id === 'gentle-wayfinding')?.practice,
        relationship: completed.relationships[0]?.sharedHistory
      };
    });

    expect(results.map(({ speciesId: _speciesId, ...result }) => result)).toEqual(
      Array.from({ length: 5 }, () => results[0] && (({ speciesId: _speciesId, ...result }) => result)(results[0]))
    );
  });
});
