const STORAGE_KEY = 'pixel-pals-parent-gate-v1';
const SESSION_KEY = 'pixel-pals-parent-unlocked';
const ITERATIONS = 210_000;

export const PIN_PATTERN = /^\d{6}$/;
export const HOLD_DURATION_MS = 3_500;

export type StoredCredential = {
  version: 1;
  salt: string;
  hash: string;
  iterations: number;
};

function ownedArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return copy.buffer;
}

function toBase64(bytes: Uint8Array): string {
  let value = '';
  for (const byte of bytes) value += String.fromCharCode(byte);
  return btoa(value);
}

function fromBase64(value: string): Uint8Array {
  const decoded = atob(value);
  const bytes = new Uint8Array(decoded.length);
  for (let index = 0; index < decoded.length; index += 1) {
    bytes[index] = decoded.charCodeAt(index);
  }
  return bytes;
}

async function derivePinHash(pin: string, salt: Uint8Array, iterations: number): Promise<Uint8Array> {
  const pinBytes = new TextEncoder().encode(pin);
  const material = await crypto.subtle.importKey(
    'raw',
    ownedArrayBuffer(pinBytes),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt: ownedArrayBuffer(salt), iterations },
    material,
    256
  );
  return new Uint8Array(bits);
}

function equalBytes(left: Uint8Array, right: Uint8Array): boolean {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) {
    difference |= (left[index] ?? 0) ^ (right[index] ?? 0);
  }
  return difference === 0;
}

export function hasSubtleCrypto(): boolean {
  return Boolean(crypto.subtle);
}

export function readCredential(): StoredCredential | null {
  try {
    const serialized = localStorage.getItem(STORAGE_KEY);
    if (!serialized) return null;
    const parsed = JSON.parse(serialized) as Partial<StoredCredential>;
    if (
      parsed.version !== 1
      || typeof parsed.salt !== 'string'
      || typeof parsed.hash !== 'string'
      || !Number.isInteger(parsed.iterations)
      || (parsed.iterations ?? 0) < 100_000
    ) {
      return null;
    }
    return parsed as StoredCredential;
  } catch {
    return null;
  }
}

export async function storeNewCredential(pin: string): Promise<StoredCredential> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await derivePinHash(pin, salt, ITERATIONS);
  const credential: StoredCredential = {
    version: 1,
    salt: toBase64(salt),
    hash: toBase64(hash),
    iterations: ITERATIONS
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(credential));
  return credential;
}

export async function verifyPin(pin: string, credential: StoredCredential): Promise<boolean> {
  const candidate = await derivePinHash(pin, fromBase64(credential.salt), credential.iterations);
  return equalBytes(candidate, fromBase64(credential.hash));
}

export function isSessionUnlocked(): boolean {
  try {
    return sessionStorage.getItem(SESSION_KEY) === 'true';
  } catch {
    return false;
  }
}

export function markSessionUnlocked(): void {
  sessionStorage.setItem(SESSION_KEY, 'true');
}

export function clearSessionUnlock(): void {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    // The in-memory state still locks the controls.
  }
}

export function removeCredential(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    // State is still cleared for the current page.
  }
}
