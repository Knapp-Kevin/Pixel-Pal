import type { HomeObject } from '@pixel-pals/content-schema';
import type { FirstActivity, FirstPalChoice } from '@pixel-pals/simulation';

export type AppView = 'village' | 'home' | 'journal';
export type HomeView = 'exterior' | 'interior';

export const speciesOptions: Array<{ id: FirstPalChoice['speciesId']; label: string }> = [
  { id: 'fox', label: 'Fox' },
  { id: 'deer', label: 'Deer' },
  { id: 'rabbit', label: 'Rabbit' },
  { id: 'cat', label: 'Kitten' },
  { id: 'duck', label: 'Duckling' }
];

export const paletteOptions: Array<{ id: FirstPalChoice['paletteId']; label: string }> = [
  { id: 'sunleaf', label: 'Sunleaf' },
  { id: 'riverstone', label: 'Riverstone' },
  { id: 'berrybloom', label: 'Berrybloom' }
];

export const markingOptions: Array<{ id: FirstPalChoice['markingId']; label: string }> = [
  { id: 'soft-mask', label: 'Soft Mask' },
  { id: 'freckles', label: 'Freckles' },
  { id: 'tail-tip', label: 'Light Tail Tip' }
];

export const accessoryOptions: Array<{ id: NonNullable<FirstPalChoice['accessoryId']>; label: string }> = [
  { id: 'scarf', label: 'Scarf' },
  { id: 'satchel', label: 'Satchel' },
  { id: 'leaf-pin', label: 'Leaf Pin' }
];

export const activityOptions: Array<{
  id: FirstActivity;
  title: string;
  description: string;
  expression: 'curious' | 'thoughtful' | 'delighted';
  playable: boolean;
}> = [
  { id: 'leaf-chase', title: 'Chase Leaves', description: 'Catch drifting leaf shapes and take turns helping each other.', expression: 'delighted', playable: true },
  { id: 'stone-stacking', title: 'Stack Stones', description: 'Take turns choosing and balancing stones together.', expression: 'thoughtful', playable: true },
  { id: 'garden-game', title: 'Garden Game', description: 'Playable garden guessing mini-game in development.', expression: 'curious', playable: false }
];

export const homeObjectOptions: Array<{ id: HomeObject; title: string; description: string }> = [
  { id: 'window-cushion', title: 'Window Cushion', description: 'A soft place to watch the village wake up.' },
  { id: 'memory-shelf', title: 'Memory Shelf', description: 'A place for keepsakes, gifts, and stories that accumulate over time.' },
  { id: 'story-lantern', title: 'Story Lantern', description: 'A warm light for quiet evenings and shared tales.' }
];

export const homeObjectSymbols: Record<HomeObject, string> = {
  'window-cushion': '◒',
  'memory-shelf': '▤',
  'story-lantern': '◇'
};
