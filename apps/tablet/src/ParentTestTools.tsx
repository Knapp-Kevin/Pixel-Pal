import { useState } from 'react';
import type { World } from '@pixel-pals/content-schema';
import {
  clearWorld,
  exportWorld,
  importWorld,
  MAX_WORLD_BACKUP_BYTES,
  saveWorld
} from '@pixel-pals/persistence';

type ParentTestToolsProps = {
  world: World;
  onResetComplete: () => void;
  onStatus: (message: string) => void;
};

type ObservationNotes = {
  hesitation: string;
  delight: string;
  repeated: string;
  misunderstood: string;
  rememberedLater: string;
  observerSummary: string;
};

const emptyNotes: ObservationNotes = {
  hesitation: '',
  delight: '',
  repeated: '',
  misunderstood: '',
  rememberedLater: '',
  observerSummary: ''
};

function downloadText(filename: string, content: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function safeFilename(value: string): string {
  const normalized = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return normalized || 'pixel-pals-world';
}

function notesDocument(world: World, notes: ObservationNotes): string {
  const firstPal = world.pals.find((pal) => pal.id === world.firstPalId);

  return `# Pixel Pals Playtest Notes

- World: ${world.worldName}
- First Pal: ${firstPal?.name ?? 'Unknown'}
- Species: ${firstPal?.speciesId ?? 'Unknown'}
- Memories created: ${world.memories.length}
- World ID: ${world.worldId}

## Where did the child hesitate?

${notes.hesitation || 'Not recorded.'}

## What caused visible delight or laughter?

${notes.delight || 'Not recorded.'}

## What did the child repeat without prompting?

${notes.repeated || 'Not recorded.'}

## What did the child misunderstand?

${notes.misunderstood || 'Not recorded.'}

## What did the child remember later?

${notes.rememberedLater || 'Not recorded.'}

## Observer summary

${notes.observerSummary || 'Not recorded.'}
`;
}

function firstPalName(world: World): string {
  return world.pals.find((pal) => pal.id === world.firstPalId)?.name ?? 'Unknown';
}

export function ParentTestTools({ world, onResetComplete, onStatus }: ParentTestToolsProps) {
  const [notes, setNotes] = useState<ObservationNotes>(emptyNotes);
  const [pendingImport, setPendingImport] = useState<World | null>(null);
  const [restoreConfirmation, setRestoreConfirmation] = useState('');
  const [resetConfirmation, setResetConfirmation] = useState('');
  const [backupExported, setBackupExported] = useState(false);
  const currentFirstPalName = firstPalName(world);
  const baseFilename = safeFilename(currentFirstPalName || world.worldName);
  const resetPhrase = `DELETE ${currentFirstPalName}`;

  function updateNote(field: keyof ObservationNotes, value: string): void {
    setNotes((current) => ({ ...current, [field]: value }));
  }

  return (
    <details className="parent-tools">
      <summary>Parent and Playtest Tools</summary>
      <div className="parent-tools-panel">
        <section aria-labelledby="world-backup-title">
          <h2 id="world-backup-title">World backup</h2>
          <p>Export a local copy before resetting or moving this playtest to another build.</p>
          <button
            className="adult-action"
            type="button"
            onClick={() => {
              try {
                downloadText(`${baseFilename}-world.json`, exportWorld(world), 'application/json');
                setBackupExported(true);
                onStatus('World backup exported.');
              } catch {
                onStatus('The world could not be exported. Nothing was changed.');
              }
            }}
          >
            Export world backup
          </button>

          <label className="import-control">
            <span>Choose a world backup to review</span>
            <input
              type="file"
              accept="application/json,.json"
              onChange={(event) => {
                const input = event.currentTarget;
                const file = input.files?.[0];
                setPendingImport(null);
                setRestoreConfirmation('');

                if (!file) return;
                if (file.size > MAX_WORLD_BACKUP_BYTES) {
                  onStatus('That backup is too large to be a valid Pixel Pals world. Nothing was replaced.');
                  input.value = '';
                  return;
                }

                void file.text()
                  .then((serialized) => importWorld(serialized))
                  .then((candidate) => {
                    setPendingImport(candidate);
                    onStatus('Backup validated. Review it before restoring.');
                  })
                  .catch(() => {
                    onStatus('That file is not a valid Pixel Pals world backup. Nothing was replaced.');
                    setPendingImport(null);
                  })
                  .finally(() => {
                    input.value = '';
                  });
              }}
            />
          </label>

          {pendingImport ? (
            <div className="restore-review" role="status">
              <h3>Review backup</h3>
              <p><strong>World:</strong> {pendingImport.worldName}</p>
              <p><strong>First Pal:</strong> {firstPalName(pendingImport)}</p>
              <p><strong>Memories:</strong> {pendingImport.memories.length}</p>
              <label className="field-label">
                <span>Type RESTORE to replace the active world</span>
                <input
                  className="name-input"
                  value={restoreConfirmation}
                  autoComplete="off"
                  onChange={(event) => setRestoreConfirmation(event.target.value)}
                />
              </label>
              <div className="adult-action-row">
                <button
                  className="adult-action"
                  type="button"
                  disabled={restoreConfirmation !== 'RESTORE'}
                  onClick={() => {
                    void saveWorld(pendingImport)
                      .then(() => {
                        onStatus('World backup restored. Reopening the imported world…');
                        window.setTimeout(() => window.location.reload(), 250);
                      })
                      .catch(() => onStatus('The backup could not be restored. The current world remains active.'));
                  }}
                >
                  Restore reviewed backup
                </button>
                <button
                  className="adult-action secondary-adult-action"
                  type="button"
                  onClick={() => {
                    setPendingImport(null);
                    setRestoreConfirmation('');
                    onStatus('Backup restore cancelled.');
                  }}
                >
                  Cancel
                </button>
              </div>
              <p className="tool-note">A successful restore keeps the current valid world as the recovery checkpoint.</p>
            </div>
          ) : null}
        </section>

        <section aria-labelledby="observation-title">
          <h2 id="observation-title">Observation notes</h2>
          <p>Record behavior, not compliments. What the child does matters more than what an adult hopes they felt.</p>
          <ObservationField label="Where did the child hesitate?" value={notes.hesitation} onChange={(value) => updateNote('hesitation', value)} />
          <ObservationField label="What caused visible delight or laughter?" value={notes.delight} onChange={(value) => updateNote('delight', value)} />
          <ObservationField label="What did the child repeat without prompting?" value={notes.repeated} onChange={(value) => updateNote('repeated', value)} />
          <ObservationField label="What did the child misunderstand?" value={notes.misunderstood} onChange={(value) => updateNote('misunderstood', value)} />
          <ObservationField label="What did the child remember later?" value={notes.rememberedLater} onChange={(value) => updateNote('rememberedLater', value)} />
          <ObservationField label="Observer summary" value={notes.observerSummary} onChange={(value) => updateNote('observerSummary', value)} />
          <button
            className="adult-action"
            type="button"
            onClick={() => {
              downloadText(`${baseFilename}-playtest-notes.md`, notesDocument(world, notes), 'text/markdown');
              onStatus('Playtest notes exported.');
            }}
          >
            Export observation notes
          </button>
        </section>

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
            onClick={() => {
              void clearWorld()
                .then(() => {
                  setResetConfirmation('');
                  onResetComplete();
                })
                .catch(() => onStatus('The world could not be cleared. The existing save remains available.'));
            }}
          >
            Permanently reset playtest world
          </button>
        </section>
      </div>
    </details>
  );
}

type ObservationFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
};

function ObservationField({ label, value, onChange }: ObservationFieldProps) {
  return (
    <label className="observation-field">
      <span>{label}</span>
      <textarea rows={3} value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}
