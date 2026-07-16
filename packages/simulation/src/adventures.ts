import { parseWorld, type AdventureId, type AdventureSession, type World } from '@pixel-pals/content-schema';
import { getFirstNeighborContext } from './firstNeighbor';

export type AdventureRelationshipDimension = 'trust' | 'warmth' | 'respect';

export type AdventureChoice = {
  id: string;
  label: string;
  description: string;
  relationshipDimension: AdventureRelationshipDimension;
};

export type AdventureStage = {
  id: string;
  title: string;
  prompt: string;
  illustrationVariant: string;
  choices: readonly AdventureChoice[];
};

export type AdventureDefinition = {
  id: AdventureId;
  title: string;
  invitationTitle: string;
  summary: string;
  sceneId: string;
  memoryTitle: string;
  memorySummary: (firstPalName: string, neighborName: string) => string;
  visibleChangeId: string;
  preference: { id: string; label: string };
  skillId: string;
  stages: readonly AdventureStage[];
};

export const ADVENTURES: Record<AdventureId, AdventureDefinition> = {
  'lanterns-in-the-rain': {
    id: 'lanterns-in-the-rain',
    title: 'The Lanterns in the Rain',
    invitationTitle: 'Follow the Rain Lanterns',
    summary: 'A sudden shower has moved Willowmere’s path lanterns. Help Fern make the way home feel welcoming again.',
    sceneId: 'adventure-lanterns-in-the-rain',
    memoryTitle: 'A Warm Path Through the Rain',
    memorySummary: (firstPalName, neighborName) => `${firstPalName} and ${neighborName} found three caring ways to guide Willowmere through the rain, and the path glowed warmly again.`,
    visibleChangeId: 'adventure-rain-lantern-path',
    preference: { id: 'adventure-guiding-light', label: 'Enjoys finding calm ways to help others find their way' },
    skillId: 'gentle-wayfinding',
    stages: [
      {
        id: 'notice-the-path',
        title: 'The path looks different',
        prompt: 'Rain has tipped some lanterns and hidden others behind wet leaves. What should the friends do first?',
        illustrationVariant: 'rain-path',
        choices: [
          { id: 'listen-for-neighbors', label: 'Listen for neighbors', description: 'Stand quietly and notice where help is needed most.', relationshipDimension: 'trust' },
          { id: 'lift-the-first-lantern', label: 'Lift the nearest lantern', description: 'Begin with one clear, useful action together.', relationshipDimension: 'respect' },
          { id: 'share-the-umbrella', label: 'Share the broad leaf', description: 'Make room beneath the leaf and decide together.', relationshipDimension: 'warmth' }
        ]
      },
      {
        id: 'choose-the-glow',
        title: 'Three lanterns, three gentle glows',
        prompt: 'The lantern covers cast different colors through the rain. Which glow belongs at the narrow turn?',
        illustrationVariant: 'lantern-colors',
        choices: [
          { id: 'steady-gold', label: 'Steady gold', description: 'A clear light that is easy to follow from far away.', relationshipDimension: 'trust' },
          { id: 'soft-green', label: 'Soft green', description: 'A quiet light that blends with Willowmere’s leaves.', relationshipDimension: 'warmth' },
          { id: 'bright-berry', label: 'Bright berry', description: 'A cheerful light that makes the wet path feel less gloomy.', relationshipDimension: 'respect' }
        ]
      },
      {
        id: 'welcome-the-last-walker',
        title: 'One neighbor is still coming home',
        prompt: 'A small figure appears beyond the rain. How should the friends finish the path?',
        illustrationVariant: 'welcoming-path',
        choices: [
          { id: 'wait-together', label: 'Wait together', description: 'Stay beside the final lantern until the neighbor arrives.', relationshipDimension: 'trust' },
          { id: 'wave-from-the-porch', label: 'Wave from the porch', description: 'Make the end of the path feel bright and friendly.', relationshipDimension: 'warmth' },
          { id: 'check-every-lantern', label: 'Check every lantern', description: 'Walk the whole route once more as a careful team.', relationshipDimension: 'respect' }
        ]
      }
    ]
  },
  'humming-bridge': {
    id: 'humming-bridge',
    title: 'The Humming Bridge',
    invitationTitle: 'Listen Beneath the Little Bridge',
    summary: 'The footbridge hums after the rain. Fern wonders whether Willowmere can turn the strange sound into something shared.',
    sceneId: 'adventure-humming-bridge',
    memoryTitle: 'The Bridge Found Its Song',
    memorySummary: (firstPalName, neighborName) => `${firstPalName} and ${neighborName} listened, experimented, and helped Willowmere’s little bridge discover a song that belonged to everyone.`,
    visibleChangeId: 'adventure-humming-bridge',
    preference: { id: 'adventure-listening-patterns', label: 'Enjoys listening for patterns in shared places' },
    skillId: 'pattern-listening',
    stages: [
      {
        id: 'find-the-hum',
        title: 'Where is the humming coming from?',
        prompt: 'The sound changes when water moves beneath the bridge. What should the friends notice first?',
        illustrationVariant: 'bridge-listening',
        choices: [
          { id: 'close-eyes-and-listen', label: 'Close their eyes and listen', description: 'Let the quiet details become easier to hear.', relationshipDimension: 'trust' },
          { id: 'tap-the-railing', label: 'Tap the railing softly', description: 'Try one careful sound and notice what answers.', relationshipDimension: 'respect' },
          { id: 'hum-the-note-back', label: 'Hum the note back', description: 'Answer the bridge playfully and together.', relationshipDimension: 'warmth' }
        ]
      },
      {
        id: 'make-a-pattern',
        title: 'The bridge answers in little rhythms',
        prompt: 'Three simple patterns fit the bridge’s hum. Which one should the friends try?',
        illustrationVariant: 'bridge-patterns',
        choices: [
          { id: 'slow-rain-rhythm', label: 'Slow rain rhythm', description: 'A patient pattern with room between each sound.', relationshipDimension: 'trust' },
          { id: 'two-friends-rhythm', label: 'Two-friends rhythm', description: 'Take turns so each sound has an answer.', relationshipDimension: 'warmth' },
          { id: 'stepping-stone-rhythm', label: 'Stepping-stone rhythm', description: 'Build the pattern one careful sound at a time.', relationshipDimension: 'respect' }
        ]
      },
      {
        id: 'share-the-song',
        title: 'Other Pals have stopped to listen',
        prompt: 'The bridge has a song now. How should it become part of Willowmere?',
        illustrationVariant: 'bridge-gathering',
        choices: [
          { id: 'teach-it-quietly', label: 'Teach it quietly', description: 'Show one neighbor at a time and let the song travel gently.', relationshipDimension: 'trust' },
          { id: 'invite-a-circle', label: 'Invite a small circle', description: 'Make space for several different sounds together.', relationshipDimension: 'warmth' },
          { id: 'mark-the-pattern', label: 'Mark the pattern nearby', description: 'Place smooth stones so anyone can remember the rhythm.', relationshipDimension: 'respect' }
        ]
      }
    ]
  }
};

function stableAdventureId(world: World, adventureId: AdventureId, suffix: string): string {
  return `${adventureId}-${world.seed.toString(36)}-${suffix}`;
}

function prerequisitesMet(world: World): boolean {
  return world.memories.some((memory) => memory.eventType === 'first-friendship-ceremony')
    && world.memories.some((memory) => memory.eventType === 'first-home-object');
}

export function availableAdventures(world: World): AdventureDefinition[] {
  if (!prerequisitesMet(world)) return [];
  return Object.values(ADVENTURES);
}

export function activeAdventureSession(world: World): AdventureSession | undefined {
  return world.adventureSessions.find((session) => session.status === 'active');
}

export function adventureSession(world: World, adventureId: AdventureId): AdventureSession | undefined {
  return world.adventureSessions.find((session) => session.adventureId === adventureId);
}

export function startAdventure(world: World, adventureId: AdventureId): World {
  const existing = adventureSession(world, adventureId);
  if (existing) return world;
  if (!prerequisitesMet(world)) throw new Error('Adventures begin after the first friendship and home are established.');
  if (activeAdventureSession(world)) throw new Error('Finish or return from the current adventure before beginning another.');
  if (world.daySessions.some((session) => session.status === 'offered')) {
    throw new Error('A saved world-day invitation is waiting and must remain the clear return point.');
  }

  const { firstPal, neighbor } = getFirstNeighborContext(world);
  return parseWorld({
    ...world,
    adventureSessions: [
      ...world.adventureSessions,
      {
        id: stableAdventureId(world, adventureId, 'session'),
        adventureId,
        status: 'active',
        stageIndex: 0,
        selectedChoiceIds: [],
        participantPalIds: [firstPal.id, neighbor.id],
        villageId: firstPal.homeVillageId,
        startedWorldDay: world.worldDay
      }
    ]
  });
}

function updatePreference(world: World, palId: string, definition: AdventureDefinition): World['pals'] {
  return world.pals.map((pal) => {
    if (pal.id !== palId) return pal;
    const existing = pal.preferences.find((preference) => preference.id === definition.preference.id);
    if (!existing) {
      return {
        ...pal,
        preferences: [...pal.preferences, {
          id: definition.preference.id,
          kind: 'activity' as const,
          subjectId: definition.id,
          label: definition.preference.label,
          discovered: true,
          evidenceCount: 1
        }]
      };
    }
    return {
      ...pal,
      preferences: pal.preferences.map((preference) => preference.id === existing.id
        ? { ...preference, discovered: true, evidenceCount: Math.min(100, preference.evidenceCount + 1) }
        : preference)
    };
  });
}

function updateSkill(pals: World['pals'], palId: string, skillId: string): World['pals'] {
  return pals.map((pal) => {
    if (pal.id !== palId) return pal;
    const existing = pal.skills.find((skill) => skill.id === skillId);
    if (!existing) return { ...pal, skills: [...pal.skills, { id: skillId, practice: 12, demonstratedLevel: 1 }] };
    return {
      ...pal,
      skills: pal.skills.map((skill) => skill.id === skillId
        ? { ...skill, practice: Math.min(100, skill.practice + 12), demonstratedLevel: Math.max(1, skill.demonstratedLevel) }
        : skill)
    };
  });
}

function relationshipBonus(definition: AdventureDefinition, choiceIds: readonly string[]) {
  const bonus = { trust: 0.05, warmth: 0.05, respect: 0.05 };
  for (const stage of definition.stages) {
    const choice = stage.choices.find((candidate) => choiceIds.includes(candidate.id));
    if (choice) bonus[choice.relationshipDimension] += 0.04;
  }
  return bonus;
}

export function chooseAdventureStage(world: World, adventureId: AdventureId, choiceId: string): World {
  const session = adventureSession(world, adventureId);
  if (!session) throw new Error('That adventure has not begun.');
  if (session.status === 'completed') return world;

  const definition = ADVENTURES[adventureId];
  const stage = definition.stages[session.stageIndex];
  if (!stage) throw new Error('The saved adventure stage is not available.');
  if (!stage.choices.some((choice) => choice.id === choiceId)) {
    throw new Error('That choice does not belong to the current adventure stage.');
  }

  const selectedChoiceIds = [...session.selectedChoiceIds, choiceId];
  const nextStageIndex = session.stageIndex + 1;
  if (nextStageIndex < definition.stages.length) {
    return parseWorld({
      ...world,
      adventureSessions: world.adventureSessions.map((candidate) => candidate.id === session.id
        ? { ...candidate, stageIndex: nextStageIndex, selectedChoiceIds }
        : candidate)
    });
  }

  const { firstPal, neighbor, relationship } = getFirstNeighborContext(world);
  const memoryId = stableAdventureId(world, adventureId, 'memory');
  const bonus = relationshipBonus(definition, selectedChoiceIds);
  const preferenceUpdated = updatePreference(world, firstPal.id, definition);
  const pals = updateSkill(preferenceUpdated, firstPal.id, definition.skillId);
  const summary = definition.memorySummary(firstPal.name, neighbor.name);

  return parseWorld({
    ...world,
    pals,
    relationships: world.relationships.map((candidate) => candidate.id === relationship.id ? {
      ...candidate,
      familiarity: Math.min(1, candidate.familiarity + 0.08),
      trust: Math.min(1, candidate.trust + bonus.trust),
      warmth: Math.min(1, candidate.warmth + bonus.warmth),
      respect: Math.min(1, candidate.respect + bonus.respect),
      sharedHistory: Math.min(1, candidate.sharedHistory + 0.14)
    } : candidate),
    memories: world.memories.some((memory) => memory.id === memoryId) ? world.memories : [...world.memories, {
      id: memoryId,
      title: definition.memoryTitle,
      participantPalIds: [firstPal.id, neighbor.id],
      villageId: firstPal.homeVillageId,
      eventType: 'adventure',
      activityId: adventureId,
      emotionalTone: 'hopeful',
      summary,
      worldDay: world.worldDay,
      significance: 0.78
    }],
    villages: world.villages.map((village) => village.id === firstPal.homeVillageId && !village.visibleChanges.includes(definition.visibleChangeId)
      ? { ...village, visibleChanges: [...village.visibleChanges, definition.visibleChangeId] }
      : village),
    adventureSessions: world.adventureSessions.map((candidate) => candidate.id === session.id ? {
      ...candidate,
      status: 'completed',
      stageIndex: 3,
      selectedChoiceIds,
      completedWorldDay: world.worldDay,
      memoryId,
      visibleChangeId: definition.visibleChangeId,
      summary
    } : candidate)
  });
}
