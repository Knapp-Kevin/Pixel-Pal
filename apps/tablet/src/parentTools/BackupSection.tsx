import { type ChangeEvent, useState } from 'react';
import type { World } from '@pixel-pals/content-schema';
import { exportWorld, importWorld, MAX_WORLD_BACKUP_BYTES, saveWorld } from '@pixel-pals/persistence';
import {
  assertTabletProfileCompatible,
  TabletProfileCompatibilityError
} from '../tabletProfile';
import { downloadText, firstPalName } from './playtestExport';

type BackupSectionProps = {
  world: World;
  baseFilename: string;
  onStatus: (message: string) => void;
  onExported: () => void;
};

type ReviewActions = {
  onStatus: (message: string) => void;
  setPendingImport: (world: World | null) => void;
  setRestoreConfirmation: (value: string) => void;
};

function reviewBackupFile(input: HTMLInputElement, actions: ReviewActions): void {
  const file = input.files?.[0];
  actions.setPendingImport(null);
  actions.setRestoreConfirmation('');

  if (!file) return;
  if (file.size > MAX_WORLD_BACKUP_BYTES) {
    actions.onStatus('That backup is too large to be a valid Pixel Pals world. Nothing was replaced.');
    input.value = '';
    return;
  }

  void file.text()
    .then((serialized) => importWorld(serialized))
    .then((candidate) => assertTabletProfileCompatible(candidate))
    .then((candidate) => {
      actions.setPendingImport(candidate);
      actions.onStatus('Backup validated and compatible. Review it before restoring.');
    })
    .catch((error: unknown) => {
      if (error instanceof TabletProfileCompatibilityError) {
        actions.onStatus('That backup needs Pal artwork not included in this tablet build. Nothing was replaced.');
      } else {
        actions.onStatus('That file is not a valid Pixel Pals world backup. Nothing was replaced.');
      }
      actions.setPendingImport(null);
    })
    .finally(() => {
      input.value = '';
    });
}

function restoreBackup(pendingImport: World, onStatus: (message: string) => void): void {
  void saveWorld(pendingImport)
    .then(() => {
      onStatus('World backup restored. Reopening the imported world…');
      window.setTimeout(() => window.location.reload(), 250);
    })
    .catch(() => onStatus('The backup could not be restored. The current world remains active.'));
}

type RestoreReviewProps = {
  pendingImport: World;
  confirmation: string;
  setConfirmation: (value: string) => void;
  onStatus: (message: string) => void;
  onCancel: () => void;
};

function RestoreReview({ pendingImport, confirmation, setConfirmation, onStatus, onCancel }: RestoreReviewProps) {
  return (
    <div className="restore-review" role="status">
      <h3>Review backup</h3>
      <p><strong>World:</strong> {pendingImport.worldName}</p>
      <p><strong>First Pal:</strong> {firstPalName(pendingImport)}</p>
      <p><strong>Memories:</strong> {pendingImport.memories.length}</p>
      <label className="field-label">
        <span>Type RESTORE to replace the active world</span>
        <input
          className="name-input"
          value={confirmation}
          autoComplete="off"
          onChange={(event) => setConfirmation(event.target.value)}
        />
      </label>
      <div className="adult-action-row">
        <button
          className="adult-action"
          type="button"
          disabled={confirmation !== 'RESTORE'}
          onClick={() => restoreBackup(pendingImport, onStatus)}
        >
          Restore reviewed backup
        </button>
        <button className="adult-action secondary-adult-action" type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>
      <p className="tool-note">A successful restore keeps the current valid world as the recovery checkpoint.</p>
    </div>
  );
}

function exportBackup({ world, baseFilename, onStatus, onExported }: BackupSectionProps): void {
  try {
    downloadText(`${baseFilename}-world.json`, exportWorld(world), 'application/json');
    onExported();
    onStatus('World backup exported.');
  } catch {
    onStatus('The world could not be exported. Nothing was changed.');
  }
}

export function BackupSection(props: BackupSectionProps) {
  const { onStatus } = props;
  const [pendingImport, setPendingImport] = useState<World | null>(null);
  const [restoreConfirmation, setRestoreConfirmation] = useState('');

  function handleFileChange(event: ChangeEvent<HTMLInputElement>): void {
    reviewBackupFile(event.currentTarget, { onStatus, setPendingImport, setRestoreConfirmation });
  }

  return (
    <section aria-labelledby="world-backup-title">
      <h2 id="world-backup-title">World backup</h2>
      <p>Export a local copy before resetting or moving this playtest to another build.</p>
      <button className="adult-action" type="button" onClick={() => exportBackup(props)}>
        Export world backup
      </button>

      <label className="import-control">
        <span>Choose a world backup to review</span>
        <input type="file" accept="application/json,.json" onChange={handleFileChange} />
      </label>

      {pendingImport ? (
        <RestoreReview
          pendingImport={pendingImport}
          confirmation={restoreConfirmation}
          setConfirmation={setRestoreConfirmation}
          onStatus={onStatus}
          onCancel={() => {
            setPendingImport(null);
            setRestoreConfirmation('');
            onStatus('Backup restore cancelled.');
          }}
        />
      ) : null}
    </section>
  );
}
