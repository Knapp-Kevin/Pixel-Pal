import { describe, expect, it } from 'vitest';
import { chooseLeaf, createLeafChaseState, createLeafRounds, leafChaseCompletion, takeLeafFriendTurn } from './leafChaseModel';

function chooseTarget(state: ReturnType<typeof createLeafChaseState>) {
  const round = state.rounds[state.roundIndex];
  const target = round?.options.find((option) => option.shape === round.targetShape);
  if (!target) throw new Error('Missing target leaf.');
  return chooseLeaf(state, target.id);
}

describe('Leaf Chase model', () => {
  it('creates deterministic rounds', () => {
    expect(createLeafRounds(42)).toEqual(createLeafRounds(42));
    expect(createLeafRounds(42)).not.toEqual(createLeafRounds(43));
  });

  it('keeps the round after a miss', () => {
    const state = createLeafChaseState(42);
    const round = state.rounds[0];
    const wrong = round?.options.find((option) => option.shape !== round.targetShape);
    if (!wrong) throw new Error('Missing decoy leaf.');
    const next = chooseLeaf(state, wrong.id);
    expect(next.roundIndex).toBe(0);
    expect(next.catches).toBe(0);
    expect(next.attempts).toBe(1);
  });

  it('requires both friend turns before completion', () => {
    let state = createLeafChaseState(42);
    state = chooseTarget(state);
    state = chooseTarget(state);
    state = takeLeafFriendTurn(state);
    state = chooseTarget(state);
    state = chooseTarget(state);
    state = takeLeafFriendTurn(state);
    state = chooseTarget(state);

    expect(state.phase).toBe('celebrate');
    expect(leafChaseCompletion(state)).toEqual({
      activity: 'leaf-chase', completed: true, successfulActions: 5, cooperativeTurns: 7, attempts: 5
    });
  });

  it('rejects premature completion', () => {
    expect(() => leafChaseCompletion(createLeafChaseState(42))).toThrow(/not complete/i);
  });
});
