import type { FirstActivityCompletion } from '@pixel-pals/simulation';

export type LeafShape = 'round' | 'pointed' | 'heart';
export type LeafLane = 'high' | 'middle' | 'low';

export type LeafOption = {
  id: string;
  shape: LeafShape;
  lane: LeafLane;
  driftOffset: number;
};

export type LeafRound = {
  targetShape: LeafShape;
  options: LeafOption[];
};

export type LeafChasePhase = 'child' | 'friend' | 'celebrate';

export type LeafChaseState = {
  rounds: LeafRound[];
  roundIndex: number;
  catches: number;
  attempts: number;
  friendTurns: number;
  phase: LeafChasePhase;
};

const SHAPES: readonly LeafShape[] = ['round', 'pointed', 'heart'];
const LANES: readonly LeafLane[] = ['high', 'middle', 'low'];
const FRIEND_TURNS_AFTER = new Set([2, 4]);

function positiveModulo(value: number, divisor: number): number {
  return ((value % divisor) + divisor) % divisor;
}

export function createLeafRounds(seed: number): LeafRound[] {
  return Array.from({ length: 5 }, (_, roundIndex) => {
    const targetIndex = positiveModulo(seed + roundIndex * 2, SHAPES.length);
    const laneOffset = positiveModulo(seed * 3 + roundIndex, LANES.length);

    return {
      targetShape: SHAPES[targetIndex] ?? 'round',
      options: SHAPES.map((shape, optionIndex) => ({
        id: `leaf-${roundIndex}-${shape}`,
        shape,
        lane: LANES[positiveModulo(optionIndex + laneOffset, LANES.length)] ?? 'middle',
        driftOffset: positiveModulo(seed + roundIndex * 7 + optionIndex * 11, 9)
      }))
    };
  });
}

export function createLeafChaseState(seed: number): LeafChaseState {
  return {
    rounds: createLeafRounds(seed),
    roundIndex: 0,
    catches: 0,
    attempts: 0,
    friendTurns: 0,
    phase: 'child'
  };
}

export function chooseLeaf(state: LeafChaseState, leafId: string): LeafChaseState {
  if (state.phase !== 'child') return state;

  const round = state.rounds[state.roundIndex];
  const selected = round?.options.find((option) => option.id === leafId);
  if (!round || !selected) return state;

  const attempts = state.attempts + 1;
  if (selected.shape !== round.targetShape) {
    return { ...state, attempts };
  }

  const catches = state.catches + 1;
  if (catches >= state.rounds.length) {
    return { ...state, catches, attempts, phase: 'celebrate' };
  }

  if (FRIEND_TURNS_AFTER.has(catches)) {
    return { ...state, catches, attempts, phase: 'friend' };
  }

  return {
    ...state,
    catches,
    attempts,
    roundIndex: state.roundIndex + 1
  };
}

export function takeLeafFriendTurn(state: LeafChaseState): LeafChaseState {
  if (state.phase !== 'friend') return state;

  return {
    ...state,
    friendTurns: state.friendTurns + 1,
    roundIndex: state.roundIndex + 1,
    phase: 'child'
  };
}

export function leafChaseCompletion(state: LeafChaseState): FirstActivityCompletion {
  if (state.phase !== 'celebrate' || state.catches !== state.rounds.length || state.friendTurns < 2) {
    throw new Error('Leaf Chase is not complete yet.');
  }

  return {
    activity: 'leaf-chase',
    completed: true,
    successfulActions: state.catches,
    cooperativeTurns: state.catches + state.friendTurns,
    attempts: state.attempts
  };
}
