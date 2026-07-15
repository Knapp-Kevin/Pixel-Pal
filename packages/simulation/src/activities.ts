export type FirstActivity = 'leaf-chase' | 'stone-stacking' | 'garden-game';

export type FirstActivityCompletion = {
  activity: FirstActivity;
  completed: true;
  successfulActions: number;
  cooperativeTurns: number;
  attempts: number;
};

export const ACTIVITY_LABELS: Record<FirstActivity, string> = {
  'leaf-chase': 'chasing windblown leaves',
  'stone-stacking': 'stacking smooth stones',
  'garden-game': 'playing a garden guessing game'
};

const MINIMUM_ACTIVITY_ACTIONS: Record<FirstActivity, number> = {
  'leaf-chase': 5,
  'stone-stacking': 3,
  'garden-game': 4
};

const FIRST_ACTIVITY_PREFERENCES: readonly FirstActivity[] = [
  'leaf-chase',
  'stone-stacking',
  'garden-game'
];

export function preferredFirstActivity(seed: number): FirstActivity {
  return FIRST_ACTIVITY_PREFERENCES[seed % FIRST_ACTIVITY_PREFERENCES.length] ?? 'garden-game';
}

export function validateActivityCompletion(result: FirstActivityCompletion): void {
  if (!result.completed) {
    throw new Error('A shared activity can only resolve after the play experience is complete.');
  }

  if (!Number.isInteger(result.successfulActions) || result.successfulActions < MINIMUM_ACTIVITY_ACTIONS[result.activity]) {
    throw new Error('The shared activity did not contain enough completed play actions.');
  }

  if (!Number.isInteger(result.cooperativeTurns) || result.cooperativeTurns < 2) {
    throw new Error('The shared activity must include participation from both friends.');
  }

  if (!Number.isInteger(result.attempts) || result.attempts < result.successfulActions) {
    throw new Error('The shared activity result contains invalid attempt counts.');
  }
}
