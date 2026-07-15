import { useState } from 'react';
import type { World } from '@pixel-pals/content-schema';
import { clearWorld, exportWorld } from '@pixel-pals/persistence';
import './playtest.css';

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
  URL.revokeObjectURL(url);
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

export function ParentTestTools({ world, onResetComplete, onStatus }: ParentTestToolsProps) {
  const [notes, setNotes] = useState<ObservationNotes>(emptyNotes);
  const [resetConfirmation, setResetConfirmation] = useState('');
  const firstPal = world.pals.find((pal) => pal.id === world.firstPalId);
  const baseFilename = safeFilename(firstPal?.name ?? world.worldName);

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
              downloadText(`${baseFilename}-world.json`, exportWorld(world), 'application/json');
              onStatus('World backup exported.');
            }}
          >
            Export world backup
          </button>
        </section>

        <section aria-labelledby="observation-title">
          <h2 id="observation-title">Observation notes</h2>
          <p>Record behavior, not compliments. What the child does matters more than what an adult hopes they felt.</p>
          <ObservationField
            label="Where did the child hesitate?"
            value={notes.hesitation}
            onChange={(value) => updateNote('hesitation', value)}
          />
          <ObservationField
            label="What caused visible delight or laughter?"
            value={notes.delight}
            onChange={(value) => updateNote('delight', value)}
          />
          <ObservationField
            label="What did the child repeat without prompting?"
            value={notes.repeated}
            onChange={(value) => updateNote('repeated', value)}
          />
          <ObservationField
            label="What did the child misunderstand?"
            value={notes.misunderstood}
            onChange={(value) => updateNote('misunderstood', value)}
          />
          <ObservationField
            label="What did the child remember later?"
            value={notes.rememberedLater}
            onChange={(value) => updateNote('rememberedLater', value)}
          />
          <ObservationField
            label="Observer summary"
            value={notes.observerSummary}
            onChange={(value) => updateNote('observerSummary', value)}
          />
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
          <p>This permanently removes the active and recovery checkpoints from this browser. Export the world first.</p>
          <label className="field-label">
            <span>Type RESET to confirm</span>
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
            disabled={resetConfirmation !== 'RESET'}
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
