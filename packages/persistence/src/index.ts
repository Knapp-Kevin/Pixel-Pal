import { parseWorld, type World } from '@pixel-pals/content-schema';

const DATABASE_NAME = 'pixel-pals';
const DATABASE_VERSION = 1;
const STORE_NAME = 'world-checkpoints';
const ACTIVE_KEY = 'active';
const PREVIOUS_KEY = 'previous';

export const MAX_WORLD_BACKUP_BYTES = 2_000_000;

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

function tryParseWorld(input: unknown): World | null {
  try {
    return parseWorld(input);
  } catch {
    return null;
  }
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

async function writeWorldAtomic(activeWorld: World): Promise<void> {
  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const currentRequest = store.get(ACTIVE_KEY);
    let prepared = false;

    currentRequest.onsuccess = () => {
      const current = tryParseWorld(currentRequest.result);
      if (current) store.put(current, PREVIOUS_KEY);
      store.put(activeWorld, ACTIVE_KEY);
      prepared = true;
    };

    currentRequest.onerror = () => transaction.abort();

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
  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readwrite');
    transaction.objectStore(STORE_NAME).put(world, ACTIVE_KEY);

    transaction.oncomplete = () => {
      database.close();
      resolve();
    };
    transaction.onerror = () => {
      database.close();
      reject(transaction.error ?? new Error('Could not repair the active Pixel Pals checkpoint.'));
    };
    transaction.onabort = () => {
      database.close();
      reject(transaction.error ?? new Error('Checkpoint repair was interrupted.'));
    };
  });
}

export function saveWorld(world: World): Promise<void> {
  const validated = parseWorld(world);
  return enqueueMutation(() => writeWorldAtomic(validated));
}

export async function loadWorld(): Promise<World | null> {
  await mutationQueue;

  const active = await readRaw(ACTIVE_KEY);
  const parsedActive = tryParseWorld(active);
  if (parsedActive) return parsedActive;

  const previous = await readRaw(PREVIOUS_KEY);
  const recovered = tryParseWorld(previous);
  if (!recovered) return null;

  await enqueueMutation(() => replaceActiveWithoutRotation(recovered));
  return recovered;
}

export function clearWorld(): Promise<void> {
  return enqueueMutation(async () => {
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
