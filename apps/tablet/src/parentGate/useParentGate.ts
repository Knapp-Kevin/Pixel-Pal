import { type MutableRefObject, useEffect, useRef, useState } from 'react';
import {
  clearSessionUnlock,
  hasSubtleCrypto,
  HOLD_DURATION_MS,
  isSessionUnlocked,
  markSessionUnlocked,
  PIN_PATTERN,
  readCredential,
  removeCredential,
  storeNewCredential,
  type StoredCredential,
  verifyPin
} from './credential';

type GateSetters = {
  setCredential: (credential: StoredCredential | null) => void;
  setUnlocked: (unlocked: boolean) => void;
  setGateOpen: (open: boolean) => void;
  setPin: (pin: string) => void;
  setConfirmation: (confirmation: string) => void;
  setStatus: (status: string) => void;
  setWorking: (working: boolean) => void;
};

type HoldTimer = MutableRefObject<number | null>;

export type ParentGateState = {
  credential: StoredCredential | null;
  unlocked: boolean;
  gateOpen: boolean;
  pin: string;
  confirmation: string;
  status: string;
  working: boolean;
  setPin: (pin: string) => void;
  setConfirmation: (confirmation: string) => void;
  beginHold: () => void;
  cancelHold: () => void;
  openExistingGate: () => void;
  submit: () => void;
  cancelDialog: () => void;
  lock: () => void;
  reset: () => void;
};

function beginHold(credential: StoredCredential | null, holdTimer: HoldTimer, s: GateSetters): void {
  if (credential || holdTimer.current !== null) return;
  s.setStatus('Keep holding to begin parent setup…');
  holdTimer.current = window.setTimeout(() => {
    holdTimer.current = null;
    s.setGateOpen(true);
    s.setStatus('Create a six-digit parent PIN for this tablet.');
  }, HOLD_DURATION_MS);
}

function cancelHold(holdTimer: HoldTimer, s: GateSetters): void {
  if (holdTimer.current === null) return;
  window.clearTimeout(holdTimer.current);
  holdTimer.current = null;
  s.setStatus('Parent setup was not opened.');
}

async function submitCreate(pin: string, confirmation: string, s: GateSetters): Promise<void> {
  if (!PIN_PATTERN.test(pin)) {
    s.setStatus('Use exactly six digits.');
    return;
  }
  if (pin !== confirmation) {
    s.setStatus('The two PIN entries do not match.');
    return;
  }
  if (!hasSubtleCrypto()) {
    s.setStatus('Secure parent access is not available in this browser.');
    return;
  }

  s.setWorking(true);
  try {
    const credential = await storeNewCredential(pin);
    markSessionUnlocked();
    s.setCredential(credential);
    s.setUnlocked(true);
    s.setGateOpen(false);
    s.setPin('');
    s.setConfirmation('');
    s.setStatus('Parent access is ready for this session.');
  } catch {
    s.setStatus('The parent PIN could not be stored on this tablet.');
  } finally {
    s.setWorking(false);
  }
}

async function submitUnlock(pin: string, credential: StoredCredential, s: GateSetters): Promise<void> {
  if (!PIN_PATTERN.test(pin)) {
    s.setStatus('Enter the six-digit parent PIN.');
    return;
  }
  if (!hasSubtleCrypto()) {
    s.setStatus('Secure parent access is not available in this browser.');
    return;
  }

  s.setWorking(true);
  try {
    if (!(await verifyPin(pin, credential))) {
      s.setStatus('That PIN did not match.');
      s.setPin('');
      return;
    }
    markSessionUnlocked();
    s.setUnlocked(true);
    s.setGateOpen(false);
    s.setPin('');
    s.setStatus('Parent tools unlocked for this session.');
  } catch {
    s.setStatus('Parent access could not be verified.');
  } finally {
    s.setWorking(false);
  }
}

function lockGate(s: GateSetters): void {
  clearSessionUnlock();
  s.setUnlocked(false);
  s.setGateOpen(false);
  s.setPin('');
  s.setConfirmation('');
  s.setStatus('Parent tools locked.');
}

function resetGate(s: GateSetters): void {
  removeCredential();
  s.setCredential(null);
  s.setUnlocked(false);
  s.setGateOpen(false);
  s.setPin('');
  s.setConfirmation('');
  s.setStatus('Parent PIN removed. Hold the setup button to create a new one.');
}

function cancelDialog(s: GateSetters): void {
  s.setGateOpen(false);
  s.setPin('');
  s.setConfirmation('');
  s.setStatus('Parent access closed.');
}

export function useParentGate(): ParentGateState {
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

  const setters: GateSetters = { setCredential, setUnlocked, setGateOpen, setPin, setConfirmation, setStatus, setWorking };

  return {
    credential, unlocked, gateOpen, pin, confirmation, status, working,
    setPin, setConfirmation,
    beginHold: () => beginHold(credential, holdTimer, setters),
    cancelHold: () => cancelHold(holdTimer, setters),
    openExistingGate: () => {
      if (!credential) return;
      setGateOpen(true);
      setStatus('Enter the parent PIN for this tablet.');
    },
    submit: () => void (credential ? submitUnlock(pin, credential, setters) : submitCreate(pin, confirmation, setters)),
    cancelDialog: () => cancelDialog(setters),
    lock: () => lockGate(setters),
    reset: () => resetGate(setters)
  };
}
