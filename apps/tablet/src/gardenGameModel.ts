import type { FirstActivityCompletion } from '@pixel-pals/simulation';

export type BloomShape = 'round' | 'star' | 'bell';
export type BloomColor = 'sun' | 'berry' | 'river';
export type GardenBed = 'left' | 'center' | 'right';

export type BloomOption = {
  id: string;
  shape: BloomShape;
  color: BloomColor;
  bed: GardenBed;
};

export type GardenRound = {
  targetShape: BloomShape;
  targetColor: BloomColor;
  options: BloomOption[];
};

export type GardenGamePhase = 'child' | 'friend' | 'celebrate';

export type GardenGameState = {
  rounds: GardenRound[];
  roundIndex: number;
  matches: number;
  attempts: number;
  friendTurns: number;
  phase: GardenGamePhase;
};

const SHAPES: readonly BloomShape[] = ['round', 'star', 'bell'];
const COLORS: readonly BloomColor[] = ['sun', 'berry', 'river'];
const BEDS: readonly GardenBed[] = ['left', 'center', 'right'];
const FRIEND_TURNS_AFTER = new Set([1, 3]);

function positiveModulo(value: number, divisor: number): number {
  return ((value % divisor) + divisor) % divisor;
}

function rotate<T>(values: readonly T[], offset: number): T[] {
  return values.map((_, index) => values[positiveModulo(index + offset, values.length)] as T);
}

export function createGardenRounds(seed: number): GardenRound[] {
  return Array.from({ length: 4 }, (_, roundIndex) => {
    const targetShapeIndex = positiveModulo(seed + roundIndex, SHAPES.length);
    const targetColorIndex = positiveModulo(seed * 2 + roundIndex, COLORS.length);
    const targetShape = SHAPES[targetShapeIndex] ?? 'round';
    const targetColor = COLORS[targetColorIndex] ?? 'sun';

    const shapes = rotate(SHAPES, positiveModulo(seed + roundIndex * 2, SHAPES.length));
    const colors = rotate(COLORS, positiveModulo(seed * 3 + roundIndex, COLORS.length));
    const targetPosition = positiveModulo(seed + roundIndex * 5, BEDS.length);

    const options = BEDS.map((bed, optionIndex) => {
      if (optionIndex === targetPosition) {
        return {
          id: `bloom-${roundIndex}-target`,
          shape: targetShape,
          color: targetColor,
          bed
        };
      }

      const shape = shapes.find((candidate) => candidate !== targetShape)
        ?? SHAPES[positiveModulo(targetShapeIndex + optionIndex, SHAPES.length)]
        ?? 'star';
      const color = colors.find((candidate) => candidate !== targetColor)
        ?? COLORS[positiveModulo(targetColorIndex + optionIndex, COLORS.length)]
        ?? 'berry';

      shapes.push(shapes.shift() as BloomShape);
      colors.push(colors.shift() as BloomColor);

      return {
        id: `bloom-${roundIndex}-decoy-${optionIndex}`,
        shape,
        color,
        bed
      };
    });

    return { targetShape, targetColor, options };
  });
}

export function createGardenGameState(seed: number): GardenGameState {
  return {
    rounds: createGardenRounds(seed),
    roundIndex: 0,
    matches: 0,
    attempts: 0,
    friendTurns: 0,
    phase: 'child'
  };
}

export function chooseBloom(state: GardenGameState, bloomId: string): GardenGameState {
  if (state.phase !== 'child') return state;

  const round = state.rounds[state.roundIndex];
  const selected = round?.options.find((option) => option.id === bloomId);
  if (!round || !selected) return state;

  const attempts = state.attempts + 1;
  const matchesTarget = selected.shape === round.targetShape && selected.color === round.targetColor;
  if (!matchesTarget) return { ...state, attempts };

  const matches = state.matches + 1;
  if (matches >= state.rounds.length) {
    return { ...state, matches, attempts, phase: 'celebrate' };
  }

  if (FRIEND_TURNS_AFTER.has(matches)) {
    return { ...state, matches, attempts, phase: 'friend' };
  }

  return {
    ...state,
    matches,
    attempts,
    roundIndex: state.roundIndex + 1
  };
}

export function takeGardenFriendTurn(state: GardenGameState): GardenGameState {
  if (state.phase !== 'friend') return state;

  return {
    ...state,
    friendTurns: state.friendTurns + 1,
    roundIndex: state.roundIndex + 1,
    phase: 'child'
  };
}

export function gardenGameCompletion(state: GardenGameState): FirstActivityCompletion {
  if (state.phase !== 'celebrate' || state.matches !== state.rounds.length || state.friendTurns < 2) {
    throw new Error('Garden Game is not complete yet.');
  }

  return {
    activity: 'garden-game',
    completed: true,
    successfulActions: state.matches,
    cooperativeTurns: state.matches + state.friendTurns,
    attempts: state.attempts
  };
}
