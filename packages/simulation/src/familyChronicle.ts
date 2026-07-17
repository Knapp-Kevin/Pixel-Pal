import {
  parseWorld,
  type FamilyMemoryTheme,
  type Memory,
  type World
} from '@pixel-pals/content-schema';

export type FamilyMemoryTone = Memory['emotionalTone'];

export type RecordFamilyMemoryInput = {
  familyBondId: string;
  householdId: string;
  title: string;
  summary: string;
  emotionalTone: FamilyMemoryTone;
  sceneVariant: FamilyMemoryTheme;
};

export const FAMILY_MEMORY_THEMES: Record<FamilyMemoryTheme, { label: string; description: string; defaultTone: FamilyMemoryTone }> = {
  'welcome-home': {
    label: 'Welcome home',
    description: 'A moment when family made room, offered safety, or marked a new beginning.',
    defaultTone: 'hopeful'
  },
  'helping-day': {
    label: 'Helping day',
    description: 'A day of practical care, shared work, or showing up when someone needed help.',
    defaultTone: 'joyful'
  },
  'family-tradition': {
    label: 'Family tradition',
    description: 'A repeated custom, story, meal, craft, or ritual the family chooses to carry forward.',
    defaultTone: 'calm'
  },
  'promise-kept': {
    label: 'Promise kept',
    description: 'A remembered act of trust, protection, return, or commitment.',
    defaultTone: 'hopeful'
  }
};

function nextFamilyMemoryIdentity(world: World, sceneVariant: FamilyMemoryTheme): { memoryId: string; markerId: string } {
  let counter = world.memories.length;
  const existingMemoryIds = new Set(world.memories.map((memory) => memory.id));
  const existingMarkers = new Set(world.greatTrees.flatMap((tree) => tree.visualHistoryMarkers));

  while (true) {
    const suffix = `${world.seed.toString(36)}-${world.worldDay.toString(36)}-${counter.toString(36)}`;
    const memoryId = `family-memory-${suffix}`;
    const markerId = `family-${sceneVariant}-${suffix}`;
    if (!existingMemoryIds.has(memoryId) && !existingMarkers.has(markerId)) return { memoryId, markerId };
    counter += 1;
  }
}

export function recordFamilyMemory(world: World, input: RecordFamilyMemoryInput): World {
  const bond = world.familyBonds.find((candidate) => candidate.id === input.familyBondId);
  if (!bond) throw new Error('Choose a recorded family bond before adding a family memory.');

  const home = world.homes.find((candidate) => candidate.id === input.householdId);
  if (!home) throw new Error('Choose an available household for this family memory.');

  if (!home.residentPalIds.some((palId) => palId === bond.fromPalId || palId === bond.toPalId)) {
    throw new Error('The selected household must belong to at least one Pal in the family bond.');
  }

  const village = world.villages.find((candidate) => candidate.id === home.villageId);
  if (!village) throw new Error('The selected household does not belong to a valid village.');

  const tree = world.greatTrees.find((candidate) => candidate.id === village.greatTreeId);
  if (!tree) throw new Error('The village Great Tree is not available to recognize this memory.');

  const title = input.title.trim();
  const summary = input.summary.trim();
  if (!title) throw new Error('Add a title for the family memory.');
  if (!summary) throw new Error('Add a short description of what happened.');

  const { memoryId, markerId } = nextFamilyMemoryIdentity(world, input.sceneVariant);
  const memory: Memory = {
    id: memoryId,
    title,
    participantPalIds: [bond.fromPalId, bond.toPalId],
    villageId: village.id,
    eventType: 'family-history',
    emotionalTone: input.emotionalTone,
    summary,
    worldDay: world.worldDay,
    significance: 0.8,
    familyHistory: {
      familyBondId: bond.id,
      householdId: home.id,
      sceneVariant: input.sceneVariant,
      treeMarkerId: markerId
    }
  };

  return parseWorld({
    ...world,
    memories: [...world.memories, memory],
    homes: world.homes.map((candidate) => candidate.id === home.id
      ? { ...candidate, familyMemoryIds: [...candidate.familyMemoryIds, memory.id] }
      : candidate),
    greatTrees: world.greatTrees.map((candidate) => candidate.id === tree.id
      ? {
          ...candidate,
          recognizedMemoryIds: [...candidate.recognizedMemoryIds, memory.id],
          visualHistoryMarkers: [...candidate.visualHistoryMarkers, markerId]
        }
      : candidate)
  });
}

export function removeFamilyMemory(world: World, memoryId: string): World {
  const memory = world.memories.find((candidate) => candidate.id === memoryId);
  if (!memory?.familyHistory) return world;

  const { householdId, treeMarkerId } = memory.familyHistory;

  return parseWorld({
    ...world,
    memories: world.memories.filter((candidate) => candidate.id !== memory.id),
    homes: world.homes.map((home) => home.id === householdId
      ? { ...home, familyMemoryIds: home.familyMemoryIds.filter((candidate) => candidate !== memory.id) }
      : home),
    greatTrees: world.greatTrees.map((tree) => tree.villageId === memory.villageId
      ? {
          ...tree,
          recognizedMemoryIds: tree.recognizedMemoryIds.filter((candidate) => candidate !== memory.id),
          visualHistoryMarkers: tree.visualHistoryMarkers.filter((candidate) => candidate !== treeMarkerId)
        }
      : tree)
  });
}
