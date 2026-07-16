import { useState } from 'react';

type ResetSectionProps = {
  firstPalName: string;
  backupExported: boolean;
  otherWorldCount: number;
  onStatus: (message: string) => void;
  onDeleteWorld: () => Promise<void>;
};

export function ResetSection({ firstPalName, backupExported, otherWorldCount, onStatus, onDeleteWorld }: ResetSectionProps) {
  const [resetConfirmation, setResetConfirmation] = useState('');
  const resetPhrase = `DELETE ${firstPalName}`;

  function handleReset(): void {
    void onDeleteWorld()
      .then(() => setResetConfirmation(''))
      .catch(() => onStatus('The world could not be removed. Its existing save remains available.'));
  }

  return (
    <section className="reset-zone" aria-labelledby="reset-title">
      <h2 id="reset-title">Delete this world</h2>
      <p>
        This permanently removes {firstPalName}’s active and recovery checkpoints from this tablet.
        {otherWorldCount > 0 ? ` The other ${otherWorldCount} local world${otherWorldCount === 1 ? '' : 's'} will remain.` : ' A new story can begin afterward.'}
      </p>
      <p className="tool-note">
        {backupExported
          ? 'A backup of this world was exported during this session.'
          : 'Export this world above before deletion becomes available.'}
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
        Permanently delete {firstPalName}’s world
      </button>
    </section>
  );
}
