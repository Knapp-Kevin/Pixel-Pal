import { parseWorld, type World } from '@pixel-pals/content-schema';
import type { FirstActivity } from './activities';
import { ACTIVITIES, HELPING_VARIANTS, HOME_VARIANTS, stableDayId } from './dayContent';
import { preferenceEvidence } from './dayPreferences';
import { getFirstNeighborContext } from './firstNeighbor';

export type WorldDaySession = World['daySessions'][number];
export type WorldDayInvitation = WorldDaySession['invitations'][number];

type ContextKind = 'quiet' | 'home' | 'helping';

function isActivity(value: string | undefined): value is FirstActivity {
  return value !== undefined && ACTIVITIES.includes(value as FirstActivity);
}

function previousActiveActivity(world: World): FirstActivity | undefined {
  for (const session of [...world.daySessions].reverse()) {
    if (session.status !== 'completed' || !session.selectedInvitationId) continue;
    const selected = session.invitations.find((invitation) => invitation.id === session.selectedInvitationId);
    if (selected?.kind === 'active' && isActivity(selected.activityId)) return selected.activityId;
  }
  return undefined;
}

function preferredActivity(world: World): FirstActivity | undefined {
  const firstPal = world.pals.find((pal) => pal.id === world.firstPalId);
  const preferences = firstPal?.preferences
    .filter((preference) => preference.discovered && isActivity(preference.subjectId))
    .sort((left, right) => right.evidenceCount - left.evidenceCount || left.id.localeCompare(right.id));
  return preferences?.[0]?.subjectId as FirstActivity | undefined;
}

function rotatingActivity(world: World, day: number): FirstActivity {
  const previous = previousActiveActivity(world);
  const startIndex = (world.seed + day) % ACTIVITIES.length;
  for (let offset = 0; offset < ACTIVITIES.length; offset += 1) {
    const candidate = ACTIVITIES[(startIndex + offset) % ACTIVITIES.length] ?? 'garden-game';
    if (candidate !== previous || ACTIVITIES.length === 1) return candidate;
  }
  return 'garden-game';
}

function activeInvitation(world: World, day: number, villageId: string, neighborId: string): WorldDayInvitation {
  const preferred = preferredActivity(world);
  const rotated = rotatingActivity(world, day);
  const activity = preferred && (world.seed + day) % 2 === 0 ? preferred : rotated;
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
    summary: preferred === activity
      ? `${summaries[activity]} Fern remembered that this kind of play mattered to your Pal.`
      : summaries[activity],
    villageId,
    sourcePalId: neighborId,
    activityId: activity,
    outcomeKey: `active-${activity}`
  };
}

function quietInvitation(world: World, day: number, villageId: string, neighborId: string): WorldDayInvitation {
  const familiar = preferenceEvidence(world, 'quiet-noticing') > 0;
  return {
    id: stableDayId(world, day, 'quiet-fern'),
    day,
    kind: 'quiet',
    title: familiar ? 'Notice What Changed with Fern' : 'Sit Quietly with Fern',
    summary: familiar
      ? 'Return to a calm place and discover which small details are different today.'
      : 'Notice two small things together and share what each of you heard or remembered.',
    villageId,
    sourcePalId: neighborId,
    outcomeKey: 'quiet-fern-listening'
  };
}

function homeInvitation(world: World, day: number, villageId: string, neighborId: string): WorldDayInvitation | undefined {
  const home = world.homes.find((candidate) => candidate.residentPalIds.includes(world.firstPalId));
  if (!home?.chosenObjectId) return undefined;
  const variant = HOME_VARIANTS[home.chosenObjectId];
  const familiar = preferenceEvidence(world, home.chosenObjectId) > 0;

  return {
    id: stableDayId(world, day, variant.outcomeKey),
    day,
    kind: 'home',
    title: familiar ? `Return to ${variant.title}` : variant.title,
    summary: familiar
      ? `${variant.summary} The object already carries part of your shared history.`
      : variant.summary,
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
  const familiar = preferenceEvidence(world, 'village-helping') > 0;

  return {
    id: stableDayId(world, day, `help-${variant.key}`),
    day,
    kind: 'helping',
    title: variant.title,
    summary: familiar
      ? `${variant.summary} Fern remembered how carefully your Pal helped before.`
      : variant.summary,
    villageId,
    sourcePalId: neighborId,
    outcomeKey: variant.key
  };
}

function completedKindCount(world: World, kind: ContextKind): number {
  return world.daySessions.filter((session) => session.status === 'completed' && session.outcome?.kind === kind).length;
}

function contextualScore(world: World, kind: ContextKind, day: number): number {
  const { relationship } = getFirstNeighborContext(world);
  const home = world.homes.find((candidate) => candidate.residentPalIds.includes(world.firstPalId));
  const rotationKind: ContextKind = day % 3 === 1 ? 'quiet' : day % 3 === 2 ? 'helping' : 'home';
  const novelty = completedKindCount(world, kind) === 0 ? 2 : 0;
  const rotation = kind === rotationKind ? 1.5 : 0;

  if (kind === 'quiet') {
    return novelty + rotation + preferenceEvidence(world, 'quiet-noticing') * 0.35 + relationship.trust * 1.2 + relationship.warmth;
  }
  if (kind === 'home') {
    const subjectId = home?.chosenObjectId;
    return novelty + rotation + (subjectId ? preferenceEvidence(world, subjectId) * 0.35 : 0) + relationship.warmth * 1.2 + relationship.familiarity;
  }
  return novelty + rotation + preferenceEvidence(world, 'village-helping') * 0.35 + relationship.respect * 1.2 + relationship.sharedHistory;
}

function selectContextualInvitations(
  world: World,
  day: number,
  invitations: Partial<Record<ContextKind, WorldDayInvitation | undefined>>
): WorldDayInvitation[] {
  const requiredKind: ContextKind = day % 3 === 1 ? 'helping' : day % 3 === 2 ? 'home' : 'quiet';
  const required = invitations[requiredKind];
  const candidates = (Object.entries(invitations) as Array<[ContextKind, WorldDayInvitation | undefined]>)
    .filter(([kind, invitation]) => kind !== requiredKind && invitation)
    .sort(([left], [right]) => contextualScore(world, right, day) - contextualScore(world, left, day)
      || left.localeCompare(right));

  return [required, candidates[0]?.[1]].filter((invitation): invitation is WorldDayInvitation => Boolean(invitation));
}

export function generateDayInvitations(world: World): WorldDayInvitation[] {
  const { firstPal, neighbor } = getFirstNeighborContext(world);
  const day = world.worldDay + 1;
  const contextual = selectContextualInvitations(world, day, {
    quiet: quietInvitation(world, day, firstPal.homeVillageId, neighbor.id),
    home: homeInvitation(world, day, firstPal.homeVillageId, neighbor.id),
    helping: helpingInvitation(world, day, firstPal.homeVillageId, neighbor.id)
  });

  return [
    activeInvitation(world, day, firstPal.homeVillageId, neighbor.id),
    ...contextual
  ].slice(0, 3);
}

export function currentOfferedDay(world: World): WorldDaySession | undefined {
  return world.daySessions.find((session) => session.status === 'offered');
}

export function offerNextWorldDay(world: World): World {
  if (currentOfferedDay(world)) return world;
  if (world.adventureSessions.some((session) => session.status === 'active')) {
    throw new Error('The unfinished adventure is the current saved return point.');
  }
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
