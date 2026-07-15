import { useState } from 'react';
import { clearWorld } from '@pixel-pals/persistence';

type ResetSectionProps = {
  firstPalName: string;
  backupExported: boolean;
  onStatus: (message: string) => void;
  onResetComplete: () => void;
};

export function ResetSection({ firstPalName, backupExported, onStatus, onResetComplete }: ResetSectionProps) {
  const [resetConfirmation, setResetConfirmation] = useState('');
  const resetPhrase = `DELETE ${firstPalName}`;

  function handleReset(): void {
    void clearWorld()
      .then(() => {
        setResetConfirmation('');
        onResetComplete();
      })
      .catch(() => onStatus('The world could not be cleared. The existing save remains available.'));
  }

  return (
    <section className="reset-zone" aria-labelledby="reset-title">
      <h2 id="reset-title">Reset this tablet</h2>
      <p>This permanently removes the active and recovery checkpoints from this browser.</p>
      <p className="tool-note">
        {backupExported
          ? 'A backup was exported during this session.'
          : 'Export the world backup above before reset becomes available.'}
      </p>
      <label className="field-label">
        <span>Type {resetPhrase} to confirm</span>
        <input
          className="name-input"
          value={resetConfirmation}
          autoComplete="off"
          onChange={(event) => setResetConfirmation(event.target.value)}
        />
      </label>
      <button
        className="adult-action dangerous-action"
        type="button"
        disabled={!backupExported || resetConfirmation !== resetPhrase}
        onClick={handleReset}
      >
        Permanently reset playtest world
      </button>
    </section>
  );
}
