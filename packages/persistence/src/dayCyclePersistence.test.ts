import 'fake-indexeddb/auto';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { CURRENT_SCHEMA_VERSION, parseWorld, type World } from '@pixel-pals/content-schema';
import { clearWorld, exportWorld, importWorld, loadWorld, saveWorld } from './index';

const DATABASE_NAME = 'pixel-pals';
const DATABASE_VERSION = 1;
const STORE_NAME = 'world-checkpoints';
const ACTIVE_KEY = 'active';

function invitation(day: number, kind: 'active' | 'quiet' | 'home' | 'helping', suffix: string) {
  return {
    id: `day-${day}-${suffix}`,
    day,
    kind,
    title: `${kind} invitation`,
    summary: `A saved ${kind} invitation for world day ${day}.`,
    villageId: 'willowmere',
    sourcePalId: 'pal-neighbor',
    activityId: kind === 'active' ? 'garden-game' : undefined,
    homeObjectId: kind === 'home' ? 'story-lantern' as const : undefined,
    outcomeKey: `${kind}-${suffix}`
  };
}

function completedSession(day: number, kind: 'quiet' | 'home' | 'helping'): World['daySessions'][number] {
  const invitations = [
    invitation(day, 'active', 'active'),
    invitation(day, kind, kind),
    invitation(day, kind === 'quiet' ? 'home' : 'quiet', 'context')
  ];
  const selected = invitations.find((candidate) => candidate.kind === kind)!;

  return {
    id: `day-${day}-session`,
    day,
    status: 'completed',
    invitations,
    selectedInvitationId: selected.id,
    outcome: {
      invitationId: selected.id,
      kind,
      participantPalIds: ['pal-first', 'pal-neighbor'],
      summary: `Pip and Fern completed the ${kind} path on day ${day}.`,
      visibleChangeId: kind === 'helping'
        ? 'village-help-cleared-path'
        : kind === 'home'
          ? 'home-day-story-lantern'
          : undefined,
      skillId: kind === 'helping' ? 'village-care' : kind === 'home' ? 'home-making' : 'listening'
    },
    summary: {
      title: `Day ${day} in Willowmere`,
      summary: `The saved world remembers its ${kind} path.`,
      emotionalTone: kind === 'quiet' ? 'calm' : 'hopeful',
      highlightIds: [selected.id]
    }
  };
}

function advancedWorld(includeOfferedDayFour: boolean): World {
  const daySessions: World['daySessions'] = [
    completedSession(1, 'helping'),
    completedSession(2, 'home'),
    completedSession(3, 'quiet')
  ];

  if (includeOfferedDayFour) {
    daySessions.push({
      id: 'day-4-session',
      day: 4,
      status: 'offered',
      invitations: [
        invitation(4, 'active', 'garden'),
        invitation(4, 'home', 'lantern'),
        invitation(4, 'helping', 'path')
      ]
    });
  }

  return parseWorld({
    schemaVersion: CURRENT_SCHEMA_VERSION,
    worldId: 'advanced-world',
    worldName: 'Advanced World',
    seed: 42,
    worldDay: 3,
    firstPalId: 'pal-first',
    species: [
      { id: 'fox', name: 'Fox', bodyFamily: 'canine', canonStatus: 'game' },
      { id: 'rabbit', name: 'Rabbit', bodyFamily: 'lagomorph', canonStatus: 'game' }
    ],
    lineages: [],
    pals: [
      {
        id: 'pal-first',
        name: 'Pip',
        isFirstPal: true,
        lifeStage: 'youth',
        speciesId: 'fox',
        homeVillageId: 'willowmere',
        householdId: 'home-first',
        appearance: { bodyFamily: 'canine', paletteId: 'sunleaf', markingId: 'tail-tip' },
        preferences: [],
        characteristics: [],
        skills: [
          { id: 'village-care', practice: 8, demonstratedLevel: 1 },
          { id: 'home-making', practice: 8, demonstratedLevel: 1 },
          { id: 'listening', practice: 8, demonstratedLevel: 1 }
        ],
        createdBy: 'player'
      },
      {
        id: 'pal-neighbor',
        name: 'Fern',
        isFirstPal: false,
        lifeStage: 'youth',
        speciesId: 'rabbit',
        homeVillageId: 'willowmere',
        storyRole: 'first-neighbor',
        artIdentity: 'fern',
        appearance: { bodyFamily: 'lagomorph', paletteId: 'mosscream', markingId: 'ear-dapple' },
        preferences: [],
        characteristics: [],
        skills: [],
        createdBy: 'game'
      }
    ],
    relationships: [{
      id: 'relationship-first-neighbor',
      fromPalId: 'pal-first',
      toPalId: 'pal-neighbor',
      label: 'friend',
      familiarity: 0.6,
      trust: 0.55,
      warmth: 0.65,
      respect: 0.5,
      tension: 0,
      sharedHistory: 0.5
    }],
    memories: [{
      id: 'memory-first-home',
      title: 'It Feels Like Home',
      participantPalIds: ['pal-first'],
      villageId: 'willowmere',
      eventType: 'first-home-object',
      emotionalTone: 'calm',
      summary: 'Pip chose a story lantern for the first home.',
      worldDay: 0,
      significance: 0.7
    }],
    homes: [{
      id: 'home-first',
      villageId: 'willowmere',
      residentPalIds: ['pal-first'],
      styleId: 'willowmere-roundhouse',
      chosenObjectId: 'story-lantern',
      visibleChanges: ['story-lantern', 'home-day-story-lantern']
    }],
    villages: [{
      id: 'willowmere',
      name: 'Willowmere',
      regionId: 'willowmere-wood',
      greatTreeId: 'willowmere-great-tree',
      canonStatus: 'game',
      residentPalIds: ['pal-first', 'pal-neighbor'],
      visibleChanges: ['village-help-cleared-path']
    }],
    greatTrees: [{
      id: 'willowmere-great-tree',
      villageId: 'willowmere',
      recognizedMemoryIds: [],
      visualHistoryMarkers: []
    }],
    daySessions
  });
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME)) request.result.createObjectStore(STORE_NAME);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function putRawActive(value: unknown): Promise<void> {
  const database = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readwrite');
    transaction.objectStore(STORE_NAME).put(value, ACTIVE_KEY);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  });
  database.close();
}

async function deleteDatabase(): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const request = indexedDB.deleteDatabase(DATABASE_NAME);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error('Test database deletion was blocked.'));
  });
}

beforeEach(deleteDatabase);
afterEach(async () => {
  await clearWorld().catch(() => undefined);
  await deleteDatabase();
});

describe('advanced living-world persistence', () => {
  it('preserves the exact offered day after backup export and restore', () => {
    const world = advancedWorld(true);
    const restored = importWorld(exportWorld(world));

    expect(restored.worldDay).toBe(3);
    expect(restored.daySessions).toEqual(world.daySessions);
    expect(restored.daySessions.at(-1)?.status).toBe('offered');
    expect(restored.daySessions.at(-1)?.invitations.map((candidate) => candidate.id))
      .toEqual(world.daySessions.at(-1)?.invitations.map((candidate) => candidate.id));
  });

  it('loads an advanced offered day without changing its invitations', async () => {
    const world = advancedWorld(true);
    await saveWorld(world);
    const loaded = await loadWorld();

    expect(loaded).toEqual(world);
    expect(loaded?.daySessions.at(-1)?.invitations).toEqual(world.daySessions.at(-1)?.invitations);
  });

  it('recovers the last completed day when the offered active checkpoint is corrupted', async () => {
    const completedDayThree = advancedWorld(false);
    const offeredDayFour = advancedWorld(true);
    await saveWorld(completedDayThree);
    await saveWorld(offeredDayFour);
    await putRawActive({ schemaVersion: CURRENT_SCHEMA_VERSION, worldId: 'broken' });

    const recovered = await loadWorld();

    expect(recovered).toEqual(completedDayThree);
    expect(recovered?.worldDay).toBe(3);
    expect(recovered?.daySessions).toHaveLength(3);
    expect(recovered?.daySessions.every((session) => session.status === 'completed')).toBe(true);
  });
});
