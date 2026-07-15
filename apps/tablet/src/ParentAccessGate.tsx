import { type ReactNode, useEffect, useRef, useState } from 'react';

const STORAGE_KEY = 'pixel-pals-parent-gate-v1';
const SESSION_KEY = 'pixel-pals-parent-unlocked';
const ITERATIONS = 210_000;
const PIN_PATTERN = /^\d{6}$/;
const HOLD_DURATION_MS = 3_500;

type StoredCredential = {
  version: 1;
  salt: string;
  hash: string;
  iterations: number;
};

type ParentAccessGateProps = {
  children: ReactNode;
};

function toBase64(bytes: Uint8Array): string {
  let value = '';
  for (const byte of bytes) value += String.fromCharCode(byte);
  return btoa(value);
}

function fromBase64(value: string): Uint8Array {
  const decoded = atob(value);
  return Uint8Array.from(decoded, (character) => character.charCodeAt(0));
}

async function derivePinHash(pin: string, salt: Uint8Array, iterations: number): Promise<Uint8Array> {
  const material = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(pin),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations },
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

function readCredential(): StoredCredential | null {
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

function isSessionUnlocked(): boolean {
  try {
    return sessionStorage.getItem(SESSION_KEY) === 'true';
  } catch {
    return false;
  }
}

export function ParentAccessGate({ children }: ParentAccessGateProps) {
  const [credential, setCredential] = useState<StoredCredential | null>(() => readCredential());
  const [unlocked, setUnlocked] = useState(() => isSessionUnlocked());
  const [gateOpen, setGateOpen] = useState(false);
  const [pin, setPin] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [status, setStatus] = useState('');
  const [working, setWorking] = useState(false);
  const holdTimer = useRef<number | null>(null);

  useEffect(() => () => {
    if (holdTimer.current !== null) window.clearTimeout(holdTimer.current);
  }, []);

  function beginHold(): void {
    if (credential || holdTimer.current !== null) return;
    setStatus('Keep holding to begin parent setup…');
    holdTimer.current = window.setTimeout(() => {
      holdTimer.current = null;
      setGateOpen(true);
      setStatus('Create a six-digit parent PIN for this tablet.');
    }, HOLD_DURATION_MS);
  }

  function cancelHold(): void {
    if (holdTimer.current === null) return;
    window.clearTimeout(holdTimer.current);
    holdTimer.current = null;
    setStatus('Parent setup was not opened.');
  }

  function openExistingGate(): void {
    if (!credential) return;
    setGateOpen(true);
    setStatus('Enter the parent PIN for this tablet.');
  }

  async function createCredential(): Promise<void> {
    if (!PIN_PATTERN.test(pin)) {
      setStatus('Use exactly six digits.');
      return;
    }
    if (pin !== confirmation) {
      setStatus('The two PIN entries do not match.');
      return;
    }
    if (!crypto.subtle) {
      setStatus('Secure parent access is not available in this browser.');
      return;
    }

    setWorking(true);
    try {
      const salt = crypto.getRandomValues(new Uint8Array(16));
      const hash = await derivePinHash(pin, salt, ITERATIONS);
      const nextCredential: StoredCredential = {
        version: 1,
        salt: toBase64(salt),
        hash: toBase64(hash),
        iterations: ITERATIONS
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextCredential));
      sessionStorage.setItem(SESSION_KEY, 'true');
      setCredential(nextCredential);
      setUnlocked(true);
      setGateOpen(false);
      setPin('');
      setConfirmation('');
      setStatus('Parent access is ready for this session.');
    } catch {
      setStatus('The parent PIN could not be stored on this tablet.');
    } finally {
      setWorking(false);
    }
  }

  async function unlock(): Promise<void> {
    if (!credential || !PIN_PATTERN.test(pin)) {
      setStatus('Enter the six-digit parent PIN.');
      return;
    }
    if (!crypto.subtle) {
      setStatus('Secure parent access is not available in this browser.');
      return;
    }

    setWorking(true);
    try {
      const candidate = await derivePinHash(pin, fromBase64(credential.salt), credential.iterations);
      const expected = fromBase64(credential.hash);
      if (!equalBytes(candidate, expected)) {
        setStatus('That PIN did not match.');
        setPin('');
        return;
      }
      sessionStorage.setItem(SESSION_KEY, 'true');
      setUnlocked(true);
      setGateOpen(false);
      setPin('');
      setStatus('Parent tools unlocked for this session.');
    } catch {
      setStatus('Parent access could not be verified.');
    } finally {
      setWorking(false);
    }
  }

  function lock(): void {
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch {
      // The in-memory state still locks the controls.
    }
    setUnlocked(false);
    setGateOpen(false);
    setPin('');
    setConfirmation('');
    setStatus('Parent tools locked.');
  }

  function resetCredential(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
      sessionStorage.removeItem(SESSION_KEY);
    } catch {
      // State is still cleared for the current page.
    }
    setCredential(null);
    setUnlocked(false);
    setGateOpen(false);
    setPin('');
    setConfirmation('');
    setStatus('Parent PIN removed. Hold the setup button to create a new one.');
  }

  if (unlocked) {
    return (
      <section className="parent-access-unlocked" aria-label="Parent tools">
        <div className="parent-access-heading">
          <div>
            <p className="eyebrow">Adult mode</p>
            <h2>Parent and Playtest Tools</h2>
          </div>
          <div className="adult-action-row">
            <button className="adult-action secondary-adult-action" type="button" onClick={lock}>Lock tools</button>
            <button className="adult-action secondary-adult-action" type="button" onClick={resetCredential}>Change PIN</button>
          </div>
        </div>
        {children}
      </section>
    );
  }

  return (
    <section className="parent-access-gate" aria-label="Parent access">
      {!gateOpen ? (
        <button
          className="parent-access-trigger"
          type="button"
          onClick={credential ? openExistingGate : undefined}
          onPointerDown={credential ? undefined : beginHold}
          onPointerUp={credential ? undefined : cancelHold}
          onPointerCancel={credential ? undefined : cancelHold}
          onPointerLeave={credential ? undefined : cancelHold}
        >
          {credential ? 'Parent access' : 'Hold for parent setup'}
        </button>
      ) : (
        <div className="parent-access-dialog" role="dialog" aria-modal="false" aria-labelledby="parent-access-title">
          <h2 id="parent-access-title">{credential ? 'Unlock parent tools' : 'Set up parent access'}</h2>
          <p>{credential ? 'Enter the local six-digit PIN.' : 'Choose a six-digit PIN that children using this tablet do not know.'}</p>
          <label className="field-label">
            <span>{credential ? 'Parent PIN' : 'New parent PIN'}</span>
            <input
              className="name-input parent-pin-input"
              inputMode="numeric"
              autoComplete="off"
              maxLength={6}
              value={pin}
              onChange={(event) => setPin(event.target.value.replace(/\D/g, '').slice(0, 6))}
            />
          </label>
          {!credential ? (
            <label className="field-label">
              <span>Confirm parent PIN</span>
              <input
                className="name-input parent-pin-input"
                inputMode="numeric"
                autoComplete="off"
                maxLength={6}
                value={confirmation}
                onChange={(event) => setConfirmation(event.target.value.replace(/\D/g, '').slice(0, 6))}
              />
            </label>
          ) : null}
          <div className="adult-action-row">
            <button
              className="adult-action"
              type="button"
              disabled={working}
              onClick={() => void (credential ? unlock() : createCredential())}
            >
              {working ? 'Checking…' : credential ? 'Unlock' : 'Create parent PIN'}
            </button>
            <button
              className="adult-action secondary-adult-action"
              type="button"
              disabled={working}
              onClick={() => {
                setGateOpen(false);
                setPin('');
                setConfirmation('');
                setStatus('Parent access closed.');
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      <p className="tool-note" aria-live="polite">{status || 'Adult controls remain locked during normal play.'}</p>
    </section>
  );
}
