import type { ParentGateState } from './useParentGate';

type PinFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
};

function PinField({ label, value, onChange }: PinFieldProps) {
  return (
    <label className="field-label">
      <span>{label}</span>
      <input
        className="name-input parent-pin-input"
        inputMode="numeric"
        autoComplete="off"
        maxLength={6}
        value={value}
        onChange={(event) => onChange(event.target.value.replace(/\D/g, '').slice(0, 6))}
      />
    </label>
  );
}

function DialogActions({ gate }: { gate: ParentGateState }) {
  const hasCredential = gate.credential !== null;

  return (
    <div className="adult-action-row">
      <button className="adult-action" type="button" disabled={gate.working} onClick={gate.submit}>
        {gate.working ? 'Checking…' : hasCredential ? 'Unlock' : 'Create parent PIN'}
      </button>
      <button
        className="adult-action secondary-adult-action"
        type="button"
        disabled={gate.working}
        onClick={gate.cancelDialog}
      >
        Cancel
      </button>
    </div>
  );
}

export function ParentGateDialog({ gate }: { gate: ParentGateState }) {
  const hasCredential = gate.credential !== null;

  return (
    <div className="parent-access-dialog" role="dialog" aria-modal="false" aria-labelledby="parent-access-title">
      <h2 id="parent-access-title">{hasCredential ? 'Unlock parent tools' : 'Set up parent access'}</h2>
      <p>
        {hasCredential
          ? 'Enter the local six-digit PIN.'
          : 'Choose a six-digit PIN that children using this tablet do not know.'}
      </p>
      <PinField label={hasCredential ? 'Parent PIN' : 'New parent PIN'} value={gate.pin} onChange={gate.setPin} />
      {!hasCredential ? (
        <PinField label="Confirm parent PIN" value={gate.confirmation} onChange={gate.setConfirmation} />
      ) : null}
      <DialogActions gate={gate} />
    </div>
  );
}
