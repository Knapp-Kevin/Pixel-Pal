import { parseWorld, type World } from '@pixel-pals/content-schema';
import { type FirstActivity, type FirstActivityCompletion, validateActivityCompletion } from './activities';
import { getFirstNeighborContext } from './firstNeighbor';

export type WorldDaySession = World['daySessions'][number];
export type WorldDayInvitation = WorldDaySession['invitations'][number];
export type WorldDayCompletion = {
  completed: true;
  successfulActions: number;
  cooperativeTurns: number;
  attempts: number;
  activity?: FirstActivity;
};

const ACTIVITIES: readonly FirstActivity[] = ['leaf-chase', 'stone-stacking', 'garden-game'];
const HELPING_VARIANTS = [
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

function stableDayId(world: World, day: number, suffix: string): string {
  return `day-${world.seed.toString(36)}-${day}-${suffix}`;
}

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
  return [
    activeInvitation(world, day, firstPal.homeVillageId, neighbor.id),
    quietInvitation(world, day, firstPal.homeVillageId, neighbor.id),
    helpingInvitation(world, day, firstPal.homeVillageId, neighbor.id)
  ];
}

export function currentOfferedDay(world: World): WorldDaySession | undefined {
  return world.daySessions.find((session) => session.status === 'offered');
}

export function offerNextWorldDay(world: World): World {
  const existing = currentOfferedDay(world);
  if (existing) return world;
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

function validateCompletion(invitation: WorldDayInvitation, evidence: WorldDayCompletion): void {
  if (!evidence.completed || !Number.isInteger(evidence.attempts) || evidence.attempts < evidence.successfulActions) {
    throw new Error('The world day contains invalid completion evidence.');
  }

  if (invitation.kind === 'active') {
    if (evidence.activity !== invitation.activityId) throw new Error('The completed mini-game does not match the invitation.');
    validateActivityCompletion(evidence as FirstActivityCompletion);
    return;
  }

  const minimumActions = invitation.kind === 'helping' ? 3 : 2;
  if (evidence.successfulActions < minimumActions) throw new Error('The invitation needs more completed interactions.');
  if (evidence.cooperativeTurns < 2) throw new Error('Both friends must participate in the world day.');
}

function skillForInvitation(invitation: WorldDayInvitation): string {
  if (invitation.kind === 'active') return 'shared-play';
  if (invitation.kind === 'quiet') return 'listening';
  if (invitation.kind === 'helping') return 'village-care';
  return 'home-making';
}

function updateSkill(world: World, palId: string, skillId: string): World['pals'] {
  return world.pals.map((pal) => {
    if (pal.id !== palId) return pal;
    const existing = pal.skills.find((skill) => skill.id === skillId);
    if (!existing) {
      return { ...pal, skills: [...pal.skills, { id: skillId, practice: 8, demonstratedLevel: 1 }] };
    }
    return {
      ...pal,
      skills: pal.skills.map((skill) => skill.id === skillId
        ? { ...skill, practice: Math.min(100, skill.practice + 8), demonstratedLevel: Math.min(5, Math.max(skill.demonstratedLevel, 1)) }
        : skill)
    };
  });
}

function relationshipDeltas(kind: WorldDayInvitation['kind']) {
  if (kind === 'quiet') return { familiarity: 0.06, trust: 0.09, warmth: 0.09, respect: 0.05, sharedHistory: 0.06 };
  if (kind === 'helping') return { familiarity: 0.06, trust: 0.06, warmth: 0.05, respect: 0.1, sharedHistory: 0.07 };
  return { familiarity: 0.08, trust: 0.05, warmth: 0.08, respect: 0.04, sharedHistory: 0.07 };
}

function outcomeCopy(invitation: WorldDayInvitation, firstPalName: string, neighborName: string) {
  if (invitation.kind === 'quiet') {
    return {
      title: 'Two Small Things Noticed',
      summary: `${firstPalName} and ${neighborName} sat together long enough to notice details that hurried Pals might miss.`,
      emotionalTone: 'calm' as const
    };
  }
  if (invitation.kind === 'helping') {
    return {
      title: 'A Little Care for Willowmere',
      summary: `${firstPalName} and ${neighborName} worked side by side, leaving one corner of Willowmere better than they found it.`,
      emotionalTone: 'hopeful' as const
    };
  }
  return {
    title: 'Another Game Shared',
    summary: `${firstPalName} and ${neighborName} played together again and discovered that familiar games can still feel different.`,
    emotionalTone: 'playful' as const
  };
}

export function completeWorldDay(world: World, invitationId: string, evidence: WorldDayCompletion): World {
  const offered = currentOfferedDay(world);
  if (!offered) {
    const completed = world.daySessions.find((session) => session.selectedInvitationId === invitationId);
    if (completed?.status === 'completed') return world;
    throw new Error('No repeatable world day is currently offered.');
  }

  const invitation = offered.invitations.find((candidate) => candidate.id === invitationId);
  if (!invitation) throw new Error('The selected invitation does not belong to the offered world day.');
  validateCompletion(invitation, evidence);

  const { firstPal, neighbor, relationship } = getFirstNeighborContext(world);
  const skillId = skillForInvitation(invitation);
  const copy = outcomeCopy(invitation, firstPal.name, neighbor.name);
  const previousOutcome = world.daySessions.some((session) =>
    session.status === 'completed'
    && session.invitations.find((candidate) => candidate.id === session.selectedInvitationId)?.outcomeKey === invitation.outcomeKey
  );
  const memoryId = previousOutcome ? undefined : stableDayId(world, offered.day, `memory-${invitation.outcomeKey}`);
  const helpingVariant = HELPING_VARIANTS.find((variant) => variant.key === invitation.outcomeKey);
  const visibleChangeId = helpingVariant?.visibleChangeId;
  const deltas = relationshipDeltas(invitation.kind);
  const memory = memoryId ? {
    id: memoryId,
    title: copy.title,
    participantPalIds: [firstPal.id, neighbor.id],
    villageId: invitation.villageId,
    eventType: `world-day-${invitation.kind}`,
    activityId: invitation.activityId,
    emotionalTone: copy.emotionalTone,
    summary: copy.summary,
    worldDay: offered.day,
    significance: invitation.kind === 'helping' ? 0.5 : 0.42
  } : undefined;
  const highlightIds = [relationship.id, skillId, memoryId, visibleChangeId].filter((value): value is string => Boolean(value));

  return parseWorld({
    ...world,
    worldDay: offered.day,
    pals: updateSkill(world, firstPal.id, skillId),
    relationships: world.relationships.map((candidate) => candidate.id === relationship.id ? {
      ...candidate,
      familiarity: Math.min(1, candidate.familiarity + deltas.familiarity),
      trust: Math.min(1, candidate.trust + deltas.trust),
      warmth: Math.min(1, candidate.warmth + deltas.warmth),
      respect: Math.min(1, candidate.respect + deltas.respect),
      sharedHistory: Math.min(1, candidate.sharedHistory + deltas.sharedHistory)
    } : candidate),
    memories: memory ? [...world.memories, memory] : world.memories,
    villages: world.villages.map((village) => village.id === invitation.villageId && visibleChangeId && !village.visibleChanges.includes(visibleChangeId)
      ? { ...village, visibleChanges: [...village.visibleChanges, visibleChangeId] }
      : village),
    daySessions: world.daySessions.map((session) => session.id === offered.id ? {
      ...session,
      status: 'completed',
      selectedInvitationId: invitation.id,
      outcome: {
        invitationId: invitation.id,
        kind: invitation.kind,
        participantPalIds: [firstPal.id, neighbor.id],
        summary: copy.summary,
        memoryId,
        visibleChangeId,
        skillId
      },
      summary: {
        title: `Day ${offered.day} in Willowmere`,
        summary: memory ? copy.summary : `${copy.summary} The moment deepened their shared history without becoming a separate journal memory.`,
        emotionalTone: copy.emotionalTone,
        highlightIds
      }
    } : session)
  });
}
