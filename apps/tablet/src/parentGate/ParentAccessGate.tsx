import type { ReactNode } from 'react';
import { ParentGateDialog } from './ParentGateDialog';
import { type ParentGateState, useParentGate } from './useParentGate';

type ParentAccessGateProps = {
  children: ReactNode;
};

function GateTrigger({ gate }: { gate: ParentGateState }) {
  const hasCredential = gate.credential !== null;

  return (
    <button
      className="parent-access-trigger"
      type="button"
      onClick={hasCredential ? gate.openExistingGate : undefined}
      onPointerDown={hasCredential ? undefined : gate.beginHold}
      onPointerUp={hasCredential ? undefined : gate.cancelHold}
      onPointerCancel={hasCredential ? undefined : gate.cancelHold}
      onPointerLeave={hasCredential ? undefined : gate.cancelHold}
    >
      {hasCredential ? 'Parent access' : 'Hold for parent setup'}
    </button>
  );
}

function UnlockedPanel({ gate, children }: { gate: ParentGateState; children: ReactNode }) {
  return (
    <section className="parent-access-unlocked" aria-label="Parent tools">
      <div className="parent-access-heading">
        <div>
          <p className="eyebrow">Adult mode</p>
          <h2>Parent and Playtest Tools</h2>
        </div>
        <div className="adult-action-row">
          <button className="adult-action secondary-adult-action" type="button" onClick={gate.lock}>Lock tools</button>
          <button className="adult-action secondary-adult-action" type="button" onClick={gate.reset}>Change PIN</button>
        </div>
      </div>
      {children}
    </section>
  );
}

export function ParentAccessGate({ children }: ParentAccessGateProps) {
  const gate = useParentGate();

  if (gate.unlocked) {
    return <UnlockedPanel gate={gate}>{children}</UnlockedPanel>;
  }

  return (
    <section className="parent-access-gate" aria-label="Parent access">
      {!gate.gateOpen ? <GateTrigger gate={gate} /> : <ParentGateDialog gate={gate} />}
      <p className="tool-note" aria-live="polite">{gate.status || 'Adult controls remain locked during normal play.'}</p>
    </section>
  );
}
