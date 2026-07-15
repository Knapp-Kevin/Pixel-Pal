import { describe, expect, it } from 'vitest';
import {
  chooseBloom,
  createGardenGameState,
  createGardenRounds,
  gardenGameCompletion,
  takeGardenFriendTurn
} from './gardenGameModel';

function chooseTarget(state: ReturnType<typeof createGardenGameState>) {
  const round = state.rounds[state.roundIndex];
  const target = round?.options.find(
    (option) => option.shape === round.targetShape && option.color === round.targetColor
  );
  if (!target) throw new Error('Missing target bloom.');
  return chooseBloom(state, target.id);
}

describe('Garden Game model', () => {
  it('creates deterministic rounds with one target per round', () => {
    const rounds = createGardenRounds(42);
    expect(rounds).toEqual(createGardenRounds(42));
    expect(rounds).not.toEqual(createGardenRounds(43));

    for (const round of rounds) {
      expect(round.options.filter(
        (option) => option.shape === round.targetShape && option.color === round.targetColor
      )).toHaveLength(1);
    }
  });

  it('keeps the current garden clue after a miss', () => {
    const state = createGardenGameState(42);
    const round = state.rounds[0];
    const wrong = round?.options.find(
      (option) => option.shape !== round.targetShape || option.color !== round.targetColor
    );
    if (!wrong) throw new Error('Missing decoy bloom.');

    const next = chooseBloom(state, wrong.id);
    expect(next.roundIndex).toBe(0);
    expect(next.matches).toBe(0);
    expect(next.attempts).toBe(1);
  });

  it('requires two friend turns before completion', () => {
    let state = createGardenGameState(42);
    state = chooseTarget(state);
    expect(state.phase).toBe('friend');
    state = takeGardenFriendTurn(state);

    state = chooseTarget(state);
    state = chooseTarget(state);
    expect(state.phase).toBe('friend');
    state = takeGardenFriendTurn(state);

    state = chooseTarget(state);
    expect(state.phase).toBe('celebrate');
    expect(gardenGameCompletion(state)).toEqual({
      activity: 'garden-game',
      completed: true,
      successfulActions: 4,
      cooperativeTurns: 6,
      attempts: 4
    });
  });

  it('rejects premature completion', () => {
    expect(() => gardenGameCompletion(createGardenGameState(42))).toThrow(/not complete/i);
  });
});
