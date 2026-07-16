import { parseWorld, type World } from '@pixel-pals/content-schema';

const DATABASE_NAME = 'pixel-pals';
const DATABASE_VERSION = 1;
const STORE_NAME = 'world-checkpoints';
const LEGACY_ACTIVE_KEY = 'active';
const LEGACY_PREVIOUS_KEY = 'previous';
const CATALOG_KEY = 'world-catalog-v1';

const CATALOG_VERSION = 1 as const;

export const MAX_WORLD_BACKUP_BYTES = 2_000_000;

export type WorldSummary = {
  worldId: string;
  worldName: string;
  firstPalName: string;
  firstPalSpeciesId: World['pals'][number]['speciesId'];
  worldDay: number;
  memoryCount: number;
};

type WorldCatalog = {
  version: typeof CATALOG_VERSION;
  worldIds: string[];
  selectedWorldId: string | null;
};

let mutationQueue: Promise<void> = Promise.resolve();

function enqueueMutation<T>(operation: () => Promise<T>): Promise<T> {
  const result = mutationQueue.then(operation, operation);
  mutationQueue = result.then(() => undefined, () => undefined);
  return result;
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);

    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Could not open Pixel Pals storage.'));
    request.onblocked = () => reject(new Error('Pixel Pals storage is open in another outdated tab.'));
  });
}

function emptyCatalog(): WorldCatalog {
  return { version: CATALOG_VERSION, worldIds: [], selectedWorldId: null };
}

function normalizeCatalog(input: unknown): WorldCatalog | null {
  if (!input || typeof input !== 'object') return null;
  const candidate = input as Partial<WorldCatalog>;
  if (candidate.version !== CATALOG_VERSION || !Array.isArray(candidate.worldIds)) return null;

  const worldIds = [...new Set(candidate.worldIds.filter((value): value is string => typeof value === 'string' && value.length > 0))];
  const selectedWorldId = typeof candidate.selectedWorldId === 'string' && worldIds.includes(candidate.selectedWorldId)
    ? candidate.selectedWorldId
    : worldIds[0] ?? null;

  return { version: CATALOG_VERSION, worldIds, selectedWorldId };
}

function tryParseWorld(input: unknown): World | null {
  try {
    return parseWorld(input);
  } catch {
    return null;
  }
}

function activeKey(worldId: string): string {
  return `world:${worldId}:active`;
}

function previousKey(worldId: string): string {
  return `world:${worldId}:previous`;
}

async function readRaw(key: string): Promise<unknown | undefined> {
  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readonly');
    const request = transaction.objectStore(STORE_NAME).get(key);
    let settled = false;

    const fail = (error: Error) => {
      if (settled) return;
      settled = true;
      database.close();
      reject(error);
    };

    request.onsuccess = () => {
      if (settled) return;
      settled = true;
      resolve(request.result);
    };
    request.onerror = () => fail(request.error ?? new Error('Could not read Pixel Pals storage.'));
    transaction.oncomplete = () => database.close();
    transaction.onerror = () => fail(transaction.error ?? new Error('Could not read Pixel Pals storage.'));
    transaction.onabort = () => fail(transaction.error ?? new Error('Reading Pixel Pals storage was interrupted.'));
  });
}

async function writeRaw(key: string, value: unknown): Promise<void> {
  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readwrite');
    transaction.objectStore(STORE_NAME).put(value, key);

    transaction.oncomplete = () => {
      database.close();
      resolve();
    };
    transaction.onerror = () => {
      database.close();
      reject(transaction.error ?? new Error('Could not update Pixel Pals storage.'));
    };
    transaction.onabort = () => {
      database.close();
      reject(transaction.error ?? new Error('The Pixel Pals storage update was interrupted.'));
    };
  });
}

async function deleteRaw(keys: string[]): Promise<void> {
  if (keys.length === 0) return;
  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    keys.forEach((key) => store.delete(key));

    transaction.oncomplete = () => {
      database.close();
      resolve();
    };
    transaction.onerror = () => {
      database.close();
      reject(transaction.error ?? new Error('Could not remove Pixel Pals storage.'));
    };
    transaction.onabort = () => {
      database.close();
      reject(transaction.error ?? new Error('Removing Pixel Pals storage was interrupted.'));
    };
  });
}

async function ensureCatalogUnlocked(): Promise<WorldCatalog> {
  const existing = normalizeCatalog(await readRaw(CATALOG_KEY));
  if (existing) {
    await deleteRaw([LEGACY_ACTIVE_KEY, LEGACY_PREVIOUS_KEY]);
    return existing;
  }

  const legacyActive = tryParseWorld(await readRaw(LEGACY_ACTIVE_KEY));
  const legacyPrevious = tryParseWorld(await readRaw(LEGACY_PREVIOUS_KEY));
  const selected = legacyActive ?? legacyPrevious;

  if (!selected) {
    const catalog = emptyCatalog();
    await writeRaw(CATALOG_KEY, catalog);
    await deleteRaw([LEGACY_ACTIVE_KEY, LEGACY_PREVIOUS_KEY]);
    return catalog;
  }

  if (legacyPrevious?.worldId === selected.worldId) {
    await writeRaw(previousKey(selected.worldId), legacyPrevious);
  }
  await writeRaw(activeKey(selected.worldId), selected);

  const catalog: WorldCatalog = {
    version: CATALOG_VERSION,
    worldIds: [selected.worldId],
    selectedWorldId: selected.worldId
  };
  await writeRaw(CATALOG_KEY, catalog);
  await deleteRaw([LEGACY_ACTIVE_KEY, LEGACY_PREVIOUS_KEY]);
  return catalog;
}

async function writeWorldAtomic(activeWorld: World): Promise<void> {
  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const currentRequest = store.get(activeKey(activeWorld.worldId));
    const catalogRequest = store.get(CATALOG_KEY);
    let currentReady = false;
    let catalogReady = false;
    let prepared = false;

    const prepare = () => {
      if (!currentReady || !catalogReady || prepared) return;

      const current = tryParseWorld(currentRequest.result);
      if (current?.worldId === activeWorld.worldId) {
        store.put(current, previousKey(activeWorld.worldId));
      }

      const catalog = normalizeCatalog(catalogRequest.result) ?? emptyCatalog();
      const worldIds = catalog.worldIds.includes(activeWorld.worldId)
        ? catalog.worldIds
        : [...catalog.worldIds, activeWorld.worldId];

      store.put(activeWorld, activeKey(activeWorld.worldId));
      store.put({ ...catalog, worldIds, selectedWorldId: activeWorld.worldId }, CATALOG_KEY);
      prepared = true;
    };

    currentRequest.onsuccess = () => {
      currentReady = true;
      prepare();
    };
    catalogRequest.onsuccess = () => {
      catalogReady = true;
      prepare();
    };
    currentRequest.onerror = () => transaction.abort();
    catalogRequest.onerror = () => transaction.abort();

    transaction.oncomplete = () => {
      database.close();
      if (prepared) resolve();
      else reject(new Error('The Pixel Pals save transaction completed without writing.'));
    };
    transaction.onerror = () => {
      database.close();
      reject(transaction.error ?? new Error('Could not save the Pixel Pals world.'));
    };
    transaction.onabort = () => {
      database.close();
      reject(transaction.error ?? new Error('The Pixel Pals save was interrupted.'));
    };
  });
}

async function replaceActiveWithoutRotation(world: World): Promise<void> {
  await writeRaw(activeKey(world.worldId), world);
}

async function loadWorldByIdUnlocked(worldId: string): Promise<World | null> {
  const active = tryParseWorld(await readRaw(activeKey(worldId)));
  if (active?.worldId === worldId) return active;

  const recovered = tryParseWorld(await readRaw(previousKey(worldId)));
  if (recovered?.worldId !== worldId) return null;

  await replaceActiveWithoutRotation(recovered);
  return recovered;
}

async function writeCatalog(catalog: WorldCatalog): Promise<void> {
  await writeRaw(CATALOG_KEY, catalog);
}

async function removeWorldUnlocked(catalog: WorldCatalog, worldId: string): Promise<WorldCatalog> {
  await deleteRaw([activeKey(worldId), previousKey(worldId)]);
  const worldIds = catalog.worldIds.filter((candidate) => candidate !== worldId);
  const selectedWorldId = catalog.selectedWorldId === worldId
    ? worldIds[0] ?? null
    : catalog.selectedWorldId;
  const next = { ...catalog, worldIds, selectedWorldId };
  await writeCatalog(next);
  return next;
}

function summarizeWorld(world: World): WorldSummary {
  const firstPal = world.pals.find((pal) => pal.id === world.firstPalId);
  if (!firstPal) throw new Error('A local world is missing its first Pal.');

  return {
    worldId: world.worldId,
    worldName: world.worldName,
    firstPalName: firstPal.name,
    firstPalSpeciesId: firstPal.speciesId,
    worldDay: world.worldDay,
    memoryCount: world.memories.length
  };
}

async function firstValidWorldUnlocked(catalog: WorldCatalog): Promise<{ catalog: WorldCatalog; world: World | null }> {
  let currentCatalog = catalog;
  const candidates = [
    ...(catalog.selectedWorldId ? [catalog.selectedWorldId] : []),
    ...catalog.worldIds.filter((worldId) => worldId !== catalog.selectedWorldId)
  ];

  for (const worldId of candidates) {
    const world = await loadWorldByIdUnlocked(worldId);
    if (world) {
      if (currentCatalog.selectedWorldId !== worldId) {
        currentCatalog = { ...currentCatalog, selectedWorldId: worldId };
        await writeCatalog(currentCatalog);
      }
      return { catalog: currentCatalog, world };
    }
    currentCatalog = await removeWorldUnlocked(currentCatalog, worldId);
  }

  return { catalog: currentCatalog, world: null };
}

export function saveWorld(world: World): Promise<void> {
  const validated = parseWorld(world);
  return enqueueMutation(async () => {
    await ensureCatalogUnlocked();
    await writeWorldAtomic(validated);
  });
}

export function loadWorld(): Promise<World | null> {
  return enqueueMutation(async () => {
    const catalog = await ensureCatalogUnlocked();
    return (await firstValidWorldUnlocked(catalog)).world;
  });
}

export function listWorlds(): Promise<WorldSummary[]> {
  return enqueueMutation(async () => {
    let catalog = await ensureCatalogUnlocked();
    const summaries: WorldSummary[] = [];

    for (const worldId of [...catalog.worldIds]) {
      const world = await loadWorldByIdUnlocked(worldId);
      if (!world) {
        catalog = await removeWorldUnlocked(catalog, worldId);
        continue;
      }
      summaries.push(summarizeWorld(world));
    }

    return summaries;
  });
}

export function selectWorld(worldId: string): Promise<World> {
  return enqueueMutation(async () => {
    const catalog = await ensureCatalogUnlocked();
    if (!catalog.worldIds.includes(worldId)) throw new Error('That local world is not available on this tablet.');

    const world = await loadWorldByIdUnlocked(worldId);
    if (!world) {
      await removeWorldUnlocked(catalog, worldId);
      throw new Error('That local world could not be recovered.');
    }

    await writeCatalog({ ...catalog, selectedWorldId: worldId });
    return world;
  });
}

export function deleteWorld(worldId: string): Promise<World | null> {
  return enqueueMutation(async () => {
    const catalog = await ensureCatalogUnlocked();
    const nextCatalog = await removeWorldUnlocked(catalog, worldId);
    return (await firstValidWorldUnlocked(nextCatalog)).world;
  });
}

export function clearWorld(): Promise<void> {
  return enqueueMutation(async () => {
    const catalog = await ensureCatalogUnlocked();
    if (!catalog.selectedWorldId) return;
    await removeWorldUnlocked(catalog, catalog.selectedWorldId);
  });
}

export function clearAllWorlds(): Promise<void> {
  return enqueueMutation(async () => {
    const database = await openDatabase();

    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, 'readwrite');
      transaction.objectStore(STORE_NAME).clear();

      transaction.oncomplete = () => {
        database.close();
        resolve();
      };
      transaction.onerror = () => {
        database.close();
        reject(transaction.error ?? new Error('Could not clear Pixel Pals storage.'));
      };
      transaction.onabort = () => {
        database.close();
        reject(transaction.error ?? new Error('Clearing Pixel Pals storage was interrupted.'));
      };
    });
  });
}

function serializedByteLength(serialized: string): number {
  return new TextEncoder().encode(serialized).byteLength;
}

export function exportWorld(world: World): string {
  const serialized = JSON.stringify(parseWorld(world), null, 2);
  if (serializedByteLength(serialized) > MAX_WORLD_BACKUP_BYTES) {
    throw new Error('This world is too large for the current backup format.');
  }
  return serialized;
}

export function importWorld(serialized: string): World {
  if (serialized.length > MAX_WORLD_BACKUP_BYTES || serializedByteLength(serialized) > MAX_WORLD_BACKUP_BYTES) {
    throw new Error('The selected world backup is too large.');
  }

  return parseWorld(JSON.parse(serialized) as unknown);
}
