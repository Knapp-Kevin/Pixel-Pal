import type { HomeObject, World } from '@pixel-pals/content-schema';
import type { FirstActivity } from './activities';

export const ACTIVITIES: readonly FirstActivity[] = ['leaf-chase', 'stone-stacking', 'garden-game'];

export const HELPING_VARIANTS = [
  {
    key: 'clear-great-tree-path',
    title: 'Clear the Great Tree Path',
    summary: 'Gather fallen twigs with Fern so the path feels open and welcoming.',
    visibleChangeId: 'village-help-cleared-path'
  },
  {
    key: 'water-village-beds',
    title: 'Water the Village Beds',
    summary: 'Carry small watering cups together and help the young plants stand tall.',
    visibleChangeId: 'village-help-watered-beds'
  },
  {
    key: 'hang-wind-ribbons',
    title: 'Hang Gentle Wind Ribbons',
    summary: 'Choose quiet ribbons with Fern and tie them where the breeze can find them.',
    visibleChangeId: 'village-help-wind-ribbons'
  }
] as const;

export const HOME_VARIANTS: Record<HomeObject, {
  title: string;
  summary: string;
  outcomeKey: string;
  visibleChangeId: string;
  memoryTitle: string;
  memorySummary: (firstPalName: string, neighborName: string) => string;
}> = {
  'window-cushion': {
    title: 'Share the Window Cushion',
    summary: 'Invite Fern inside and notice how Willowmere looks from the warm window seat.',
    outcomeKey: 'home-window-cushion-visit',
    visibleChangeId: 'shared-day-window-cushion',
    memoryTitle: 'The View from Home',
    memorySummary: (firstPalName, neighborName) => `${firstPalName} and ${neighborName} shared the window cushion and watched Willowmere settle into a gentler light.`
  },
  'memory-shelf': {
    title: 'Arrange the Memory Shelf',
    summary: 'Choose where two keepsakes belong and let Fern add one small story of her own.',
    outcomeKey: 'home-memory-shelf-visit',
    visibleChangeId: 'shared-day-memory-shelf',
    memoryTitle: 'A Shelf with Two Stories',
    memorySummary: (firstPalName, neighborName) => `${firstPalName} and ${neighborName} arranged the memory shelf until both of their stories had a place.`
  },
  'story-lantern': {
    title: 'Tell a Story by Lantern Light',
    summary: 'Light the story lantern with Fern and choose two details for a small shared tale.',
    outcomeKey: 'home-story-lantern-visit',
    visibleChangeId: 'shared-day-story-lantern',
    memoryTitle: 'A Story in the Lantern Glow',
    memorySummary: (firstPalName, neighborName) => `${firstPalName} and ${neighborName} made a small story together while the lantern warmed the room.`
  }
};

export function stableDayId(world: World, day: number, suffix: string): string {
  return `day-${world.seed.toString(36)}-${day}-${suffix}`;
}
