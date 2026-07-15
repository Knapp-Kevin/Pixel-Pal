import { parseWorld, type World } from '@pixel-pals/content-schema';
import type { FirstActivity } from './activities';
import { ACTIVITIES, HELPING_VARIANTS, HOME_VARIANTS, stableDayId } from './dayContent';
import { getFirstNeighborContext } from './firstNeighbor';

export type WorldDaySession = World['daySessions'][number];
export type WorldDayInvitation = WorldDaySession['invitations'][number];

function activeInvitation(world: World, day: number, villageId: string, neighborId: string): WorldDayInvitation {
  const activity = ACTIVITIES[(world.seed + day) % ACTIVITIES.length] ?? 'garden-game';
  const titles: Record<FirstActivity, string> = {
    'leaf-chase': 'Follow a New Gust',
    'stone-stacking': 'Build a Different Tower',
    'garden-game': 'Wake Another Garden Bed'
  };
  const summaries: Record<FirstActivity, string> = {
    'leaf-chase': 'The wind has carried a different pattern of leaves across Willowmere.',
    'stone-stacking': 'Fern found a new group of stones that may balance in surprising ways.',
    'garden-game': 'Fresh blooms have opened with a new set of colors and shapes.'
  };

  return {
    id: stableDayId(world, day, `active-${activity}`),
    day,
    kind: 'active',
    title: titles[activity],
    summary: summaries[activity],
    villageId,
    sourcePalId: neighborId,
    activityId: activity,
    outcomeKey: `active-${activity}`
  };
}

function quietInvitation(world: World, day: number, villageId: string, neighborId: string): WorldDayInvitation {
  return {
    id: stableDayId(world, day, 'quiet-fern'),
    day,
    kind: 'quiet',
    title: 'Sit Quietly with Fern',
    summary: 'Notice two small things together and share what each of you heard or remembered.',
    villageId,
    sourcePalId: neighborId,
    outcomeKey: 'quiet-fern-listening'
  };
}

function homeInvitation(world: World, day: number, villageId: string, neighborId: string): WorldDayInvitation | undefined {
  const home = world.homes.find((candidate) => candidate.residentPalIds.includes(world.firstPalId));
  if (!home?.chosenObjectId) return undefined;
  const variant = HOME_VARIANTS[home.chosenObjectId];

  return {
    id: stableDayId(world, day, variant.outcomeKey),
    day,
    kind: 'home',
    title: variant.title,
    summary: variant.summary,
    villageId,
    sourcePalId: neighborId,
    homeObjectId: home.chosenObjectId,
    outcomeKey: variant.outcomeKey
  };
}

function helpingInvitation(world: World, day: number, villageId: string, neighborId: string): WorldDayInvitation {
  const village = world.villages.find((candidate) => candidate.id === villageId);
  const firstUnseen = HELPING_VARIANTS.find((variant) => !village?.visibleChanges.includes(variant.visibleChangeId));
  const variant = firstUnseen ?? HELPING_VARIANTS[(world.seed + day) % HELPING_VARIANTS.length] ?? HELPING_VARIANTS[0];

  return {
    id: stableDayId(world, day, `help-${variant.key}`),
    day,
    kind: 'helping',
    title: variant.title,
    summary: variant.summary,
    villageId,
    sourcePalId: neighborId,
    outcomeKey: variant.key
  };
}

export function generateDayInvitations(world: World): WorldDayInvitation[] {
  const { firstPal, neighbor } = getFirstNeighborContext(world);
  const day = world.worldDay + 1;
  const quiet = quietInvitation(world, day, firstPal.homeVillageId, neighbor.id);
  const home = homeInvitation(world, day, firstPal.homeVillageId, neighbor.id);
  const helping = helpingInvitation(world, day, firstPal.homeVillageId, neighbor.id);
  const contextual = day % 3 === 1
    ? [quiet, helping]
    : day % 3 === 2
      ? [home, helping]
      : [quiet, home];

  return [
    activeInvitation(world, day, firstPal.homeVillageId, neighbor.id),
    ...contextual.filter((invitation): invitation is WorldDayInvitation => Boolean(invitation))
  ].slice(0, 3);
}

export function currentOfferedDay(world: World): WorldDaySession | undefined {
  return world.daySessions.find((session) => session.status === 'offered');
}

export function offerNextWorldDay(world: World): World {
  if (currentOfferedDay(world)) return world;
  if (!world.memories.some((memory) => memory.eventType === 'first-home-object')) {
    throw new Error('The repeatable world rhythm begins after the first home is personalized.');
  }

  const day = world.worldDay + 1;
  return parseWorld({
    ...world,
    daySessions: [
      ...world.daySessions,
      {
        id: stableDayId(world, day, 'session'),
        day,
        status: 'offered',
        invitations: generateDayInvitations(world)
      }
    ]
  });
}
