import { parseWorld, type World } from '@pixel-pals/content-schema';

const DATABASE_NAME = 'pixel-pals';
const DATABASE_VERSION = 1;
const STORE_NAME = 'world-checkpoints';
const ACTIVE_KEY = 'active';
const PREVIOUS_KEY = 'previous';

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
  });
}

async function readRaw(key: string): Promise<unknown | undefined> {
  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readonly');
    const request = transaction.objectStore(STORE_NAME).get(key);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Could not read Pixel Pals storage.'));
    transaction.oncomplete = () => database.close();
  });
}

async function writePair(previous: unknown | undefined, active: World): Promise<void> {
  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    if (previous !== undefined) store.put(previous, PREVIOUS_KEY);
    store.put(active, ACTIVE_KEY);

    transaction.oncomplete = () => {
      database.close();
      resolve();
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

export async function saveWorld(world: World): Promise<void> {
  const validated = parseWorld(world);
  const current = await readRaw(ACTIVE_KEY);
  await writePair(current, validated);
}

export async function loadWorld(): Promise<World | null> {
  const active = await readRaw(ACTIVE_KEY);

  if (active !== undefined) {
    const parsed = parseWorld.safeParse(active);
    if (parsed.success) return parsed.data;
  }

  const previous = await readRaw(PREVIOUS_KEY);
  if (previous === undefined) return null;

  const recovered = parseWorld.safeParse(previous);
  return recovered.success ? recovered.data : null;
}

export async function clearWorld(): Promise<void> {
  const database = await openDatabase();

  return new Promise((resolve, reject) => {
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
  });
}

export function exportWorld(world: World): string {
  return JSON.stringify(parseWorld(world), null, 2);
}

export function importWorld(serialized: string): World {
  return parseWorld(JSON.parse(serialized) as unknown);
}
