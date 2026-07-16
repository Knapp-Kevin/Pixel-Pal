import 'fake-indexeddb/auto';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { CURRENT_SCHEMA_VERSION, parseWorld, type World } from '@pixel-pals/content-schema';
import {
  clearAllWorlds,
  clearWorld,
  deleteWorld,
  importWorld,
  listWorlds,
  loadWorld,
  MAX_WORLD_BACKUP_BYTES,
  saveWorld,
  selectWorld
} from './index';

const DATABASE_NAME = 'pixel-pals';
const DATABASE_VERSION = 1;
const STORE_NAME = 'world-checkpoints';
const LEGACY_ACTIVE_KEY = 'active';
const LEGACY_PREVIOUS_KEY = 'previous';
const CATALOG_KEY = 'world-catalog-v1';

const activeKey = (worldId: string) => `world:${worldId}:active`;
const previousKey = (worldId: string) => `world:${worldId}:previous`;

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

function worldAtDay(
  worldDay: number,
  worldId = 'integration-world',
  worldName = 'Integration World',
  firstPalName = 'Pip'
): World {
  return parseWorld({
    schemaVersion: 2,
    worldId,
    worldName,
    seed: worldId.length * 17,
    worldDay,
    firstPalId: `${worldId}-pal-first`,
    species: [
      { id: 'fox', name: 'Fox', bodyFamily: 'canine', canonStatus: 'game' }
    ],
    lineages: [],
    pals: [
      {
        id: `${worldId}-pal-first`,
        name: firstPalName,
        isFirstPal: true,
        lifeStage: 'youth',
        speciesId: 'fox',
        homeVillageId: `${worldId}-willowmere`,
        householdId: `${worldId}-home-first`,
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
        id: `${worldId}-home-first`,
        villageId: `${worldId}-willowmere`,
        residentPalIds: [`${worldId}-pal-first`],
        styleId: 'willowmere-roundhouse',
        visibleChanges: []
      }
    ],
    villages: [
      {
        id: `${worldId}-willowmere`,
        name: 'Willowmere',
        regionId: 'willowmere-wood',
        greatTreeId: `${worldId}-great-tree`,
        canonStatus: 'game',
        residentPalIds: [`${worldId}-pal-first`],
        visibleChanges: []
      }
    ],
    greatTrees: [
      {
        id: `${worldId}-great-tree`,
        villageId: `${worldId}-willowmere`,
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
  await clearAllWorlds().catch(() => undefined);
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

describe('local world catalog migration', () => {
  it('migrates the legacy active and recovery checkpoints into one catalog world', async () => {
    await putRaw(LEGACY_PREVIOUS_KEY, worldAtDay(1));
    await putRaw(LEGACY_ACTIVE_KEY, worldAtDay(2));

    const loaded = await loadWorld();
    const catalog = await readRaw(CATALOG_KEY) as { worldIds: string[]; selectedWorldId: string };
    const migratedActive = await readRaw(activeKey('integration-world')) as World;
    const migratedPrevious = await readRaw(previousKey('integration-world')) as World;

    expect(loaded?.worldDay).toBe(2);
    expect(catalog.worldIds).toEqual(['integration-world']);
    expect(catalog.selectedWorldId).toBe('integration-world');
    expect(migratedActive.worldDay).toBe(2);
    expect(migratedPrevious.worldDay).toBe(1);
    expect(await readRaw(LEGACY_ACTIVE_KEY)).toBeUndefined();
    expect(await readRaw(LEGACY_PREVIOUS_KEY)).toBeUndefined();
  });

  it('recovers a legacy malformed active checkpoint from the legacy recovery checkpoint', async () => {
    await putRaw(LEGACY_PREVIOUS_KEY, worldAtDay(4));
    await putRaw(LEGACY_ACTIVE_KEY, { broken: true });

    const loaded = await loadWorld();

    expect(loaded?.worldDay).toBe(4);
    expect((await listWorlds())[0]?.worldId).toBe('integration-world');
  });
});

describe('isolated IndexedDB world checkpoints', () => {
  it('rotates recovery checkpoints independently for each world', async () => {
    await saveWorld(worldAtDay(1, 'world-a', 'A World', 'Pip'));
    await saveWorld(worldAtDay(2, 'world-a', 'A World', 'Pip'));
    await saveWorld(worldAtDay(5, 'world-b', 'B World', 'Moss'));
    await saveWorld(worldAtDay(6, 'world-b', 'B World', 'Moss'));

    expect((await readRaw(activeKey('world-a')) as World).worldDay).toBe(2);
    expect((await readRaw(previousKey('world-a')) as World).worldDay).toBe(1);
    expect((await readRaw(activeKey('world-b')) as World).worldDay).toBe(6);
    expect((await readRaw(previousKey('world-b')) as World).worldDay).toBe(5);
  });

  it('lists validated worlds and keeps the most recently saved world selected', async () => {
    await saveWorld(worldAtDay(2, 'world-a', 'A World', 'Pip'));
    await saveWorld(worldAtDay(7, 'world-b', 'B World', 'Moss'));

    const summaries = await listWorlds();
    const selected = await loadWorld();

    expect(summaries).toEqual([
      expect.objectContaining({ worldId: 'world-a', firstPalName: 'Pip', worldDay: 2 }),
      expect.objectContaining({ worldId: 'world-b', firstPalName: 'Moss', worldDay: 7 })
    ]);
    expect(selected?.worldId).toBe('world-b');
  });

  it('switches worlds without rotating either recovery chain', async () => {
    await saveWorld(worldAtDay(1, 'world-a'));
    await saveWorld(worldAtDay(2, 'world-a'));
    await saveWorld(worldAtDay(8, 'world-b'));

    const selected = await selectWorld('world-a');

    expect(selected.worldDay).toBe(2);
    expect((await loadWorld())?.worldId).toBe('world-a');
    expect((await readRaw(previousKey('world-a')) as World).worldDay).toBe(1);
    expect(await readRaw(previousKey('world-b'))).toBeUndefined();
  });

  it('recovers corruption inside one world without changing another world', async () => {
    await saveWorld(worldAtDay(1, 'world-a'));
    await saveWorld(worldAtDay(2, 'world-a'));
    await saveWorld(worldAtDay(9, 'world-b'));
    await putRaw(activeKey('world-a'), { broken: true });

    const recoveredA = await selectWorld('world-a');
    const intactB = await selectWorld('world-b');

    expect(recoveredA.worldDay).toBe(1);
    expect(intactB.worldDay).toBe(9);
    expect((await readRaw(activeKey('world-a')) as World).worldDay).toBe(1);
  });

  it('does not promote a malformed active checkpoint over a valid recovery world', async () => {
    await saveWorld(worldAtDay(1));
    await saveWorld(worldAtDay(2));
    await putRaw(activeKey('integration-world'), { not: 'a world' });
    await saveWorld(worldAtDay(3));
    await putRaw(activeKey('integration-world'), { broken: true });

    const recovered = await loadWorld();

    expect(recovered?.worldDay).toBe(1);
  });

  it('serializes rapid saves in invocation order inside one world', async () => {
    await Promise.all([
      saveWorld(worldAtDay(1)),
      saveWorld(worldAtDay(2)),
      saveWorld(worldAtDay(3))
    ]);

    const active = await loadWorld();
    const previous = await readRaw(previousKey('integration-world')) as World;

    expect(active?.worldDay).toBe(3);
    expect(previous.worldDay).toBe(2);
  });

  it('deletes one world and selects the remaining valid world', async () => {
    await saveWorld(worldAtDay(3, 'world-a'));
    await saveWorld(worldAtDay(4, 'world-b'));

    const next = await deleteWorld('world-b');

    expect(next?.worldId).toBe('world-a');
    expect((await listWorlds()).map((world) => world.worldId)).toEqual(['world-a']);
    expect(await readRaw(activeKey('world-b'))).toBeUndefined();
    expect((await loadWorld())?.worldId).toBe('world-a');
  });

  it('clears only the selected world for backward-compatible reset behavior', async () => {
    await saveWorld(worldAtDay(3, 'world-a'));
    await saveWorld(worldAtDay(4, 'world-b'));
    await clearWorld();

    expect((await loadWorld())?.worldId).toBe('world-a');
    expect((await listWorlds()).map((world) => world.worldId)).toEqual(['world-a']);
    expect(await readRaw(activeKey('world-b'))).toBeUndefined();
  });
});
