import 'fake-indexeddb/auto';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { CURRENT_SCHEMA_VERSION, parseWorld, type World } from '@pixel-pals/content-schema';
import {
  clearWorld,
  importWorld,
  loadWorld,
  MAX_WORLD_BACKUP_BYTES,
  saveWorld
} from './index';

const DATABASE_NAME = 'pixel-pals';
const DATABASE_VERSION = 1;
const STORE_NAME = 'world-checkpoints';
const ACTIVE_KEY = 'active';
const PREVIOUS_KEY = 'previous';

const legacyWorld = {
  schemaVersion: 1,
  worldId: 'backup-world',
  worldName: 'Backup World',
  seed: 7,
  worldDay: 0,
  firstPalId: 'pal-7-first',
  species: [{ id: 'fox', name: 'Fox', bodyFamily: 'canine', canonStatus: 'game' }],
  lineages: [],
  pals: [{
    id: 'pal-7-first',
    name: 'Pip',
    isFirstPal: true,
    lifeStage: 'youth',
    speciesId: 'fox',
    homeVillageId: 'willowmere',
    appearance: { bodyFamily: 'canine', paletteId: 'sunleaf', markingId: 'tail-tip' },
    preferences: [],
    characteristics: [],
    skills: [],
    createdBy: 'player'
  }],
  relationships: [],
  memories: [],
  villages: [{
    id: 'willowmere',
    name: 'Willowmere',
    regionId: 'willowmere-wood',
    greatTreeId: 'willowmere-great-tree',
    canonStatus: 'game',
    residentPalIds: ['pal-7-first'],
    visibleChanges: []
  }],
  greatTrees: [{
    id: 'willowmere-great-tree',
    villageId: 'willowmere',
    recognizedMemoryIds: [],
    visualHistoryMarkers: []
  }]
};

function worldAtDay(worldDay: number): World {
  return parseWorld({
    schemaVersion: 2,
    worldId: 'integration-world',
    worldName: 'Integration World',
    seed: 77,
    worldDay,
    firstPalId: 'pal-first',
    species: [
      { id: 'fox', name: 'Fox', bodyFamily: 'canine', canonStatus: 'game' }
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
        appearance: {
          bodyFamily: 'canine',
          paletteId: 'sunleaf',
          markingId: 'tail-tip'
        },
        preferences: [],
        characteristics: [],
        skills: [],
        createdBy: 'player'
      }
    ],
    relationships: [],
    memories: [],
    homes: [
      {
        id: 'home-first',
        villageId: 'willowmere',
        residentPalIds: ['pal-first'],
        styleId: 'willowmere-roundhouse',
        visibleChanges: []
      }
    ],
    villages: [
      {
        id: 'willowmere',
        name: 'Willowmere',
        regionId: 'willowmere-wood',
        greatTreeId: 'willowmere-great-tree',
        canonStatus: 'game',
        residentPalIds: ['pal-first'],
        visibleChanges: []
      }
    ],
    greatTrees: [
      {
        id: 'willowmere-great-tree',
        villageId: 'willowmere',
        recognizedMemoryIds: [],
        visualHistoryMarkers: []
      }
    ]
  });
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME)) {
        request.result.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function putRaw(key: string, value: unknown): Promise<void> {
  const database = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readwrite');
    transaction.objectStore(STORE_NAME).put(value, key);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  });
  database.close();
}

async function readRaw(key: string): Promise<unknown> {
  const database = await openDatabase();
  const value = await new Promise<unknown>((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readonly');
    const request = transaction.objectStore(STORE_NAME).get(key);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  database.close();
  return value;
}

async function deleteDatabase(): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const request = indexedDB.deleteDatabase(DATABASE_NAME);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error('Test database deletion was blocked.'));
  });
}

beforeEach(async () => {
  await deleteDatabase();
});

afterEach(async () => {
  await clearWorld().catch(() => undefined);
  await deleteDatabase();
});

describe('world backup import', () => {
  it('validates and migrates a legacy backup', () => {
    const world = importWorld(JSON.stringify(legacyWorld));
    expect(world.schemaVersion).toBe(CURRENT_SCHEMA_VERSION);
    expect(world.homes).toHaveLength(1);
    expect(world.daySessions).toEqual([]);
  });

  it('rejects invalid JSON without producing a partial world', () => {
    expect(() => importWorld('{not-json')).toThrow();
  });

  it('rejects oversized input before parsing', () => {
    const oversized = 'x'.repeat(MAX_WORLD_BACKUP_BYTES + 1);
    expect(() => importWorld(oversized)).toThrow(/too large/i);
  });
});

describe('IndexedDB world checkpoints', () => {
  it('rotates the last valid active world into the recovery checkpoint', async () => {
    await saveWorld(worldAtDay(1));
    await saveWorld(worldAtDay(2));

    const active = await readRaw(ACTIVE_KEY) as World;
    const previous = await readRaw(PREVIOUS_KEY) as World;

    expect(active.worldDay).toBe(2);
    expect(previous.worldDay).toBe(1);
  });

  it('recovers from a malformed active checkpoint and repairs it', async () => {
    await saveWorld(worldAtDay(1));
    await saveWorld(worldAtDay(2));
    await putRaw(ACTIVE_KEY, { schemaVersion: 2, worldId: 'broken' });

    const recovered = await loadWorld();
    const repairedActive = await readRaw(ACTIVE_KEY) as World;

    expect(recovered?.worldDay).toBe(1);
    expect(repairedActive.worldDay).toBe(1);
  });

  it('does not promote a malformed active checkpoint over a valid recovery world', async () => {
    await saveWorld(worldAtDay(1));
    await saveWorld(worldAtDay(2));
    await putRaw(ACTIVE_KEY, { not: 'a world' });
    await saveWorld(worldAtDay(3));
    await putRaw(ACTIVE_KEY, { broken: true });

    const recovered = await loadWorld();

    expect(recovered?.worldDay).toBe(1);
  });

  it('serializes rapid saves in invocation order', async () => {
    await Promise.all([
      saveWorld(worldAtDay(1)),
      saveWorld(worldAtDay(2)),
      saveWorld(worldAtDay(3))
    ]);

    const active = await loadWorld();
    const previous = await readRaw(PREVIOUS_KEY) as World;

    expect(active?.worldDay).toBe(3);
    expect(previous.worldDay).toBe(2);
  });

  it('clears both active and recovery checkpoints', async () => {
    await saveWorld(worldAtDay(1));
    await saveWorld(worldAtDay(2));
    await clearWorld();

    expect(await loadWorld()).toBeNull();
    expect(await readRaw(PREVIOUS_KEY)).toBeUndefined();
  });
});
