import { useState } from 'react';
import type { World } from '@pixel-pals/content-schema';
import {
  downloadText,
  emptyNotes,
  notesDocument,
  type ObservationNotes,
  observationPrompts
} from './playtestExport';

type ObservationSectionProps = {
  world: World;
  baseFilename: string;
  onStatus: (message: string) => void;
};

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

export function ObservationSection({ world, baseFilename, onStatus }: ObservationSectionProps) {
  const [notes, setNotes] = useState<ObservationNotes>(emptyNotes);

  function updateNote(field: keyof ObservationNotes, value: string): void {
    setNotes((current) => ({ ...current, [field]: value }));
  }

  function handleExport(): void {
    downloadText(`${baseFilename}-playtest-notes.md`, notesDocument(world, notes), 'text/markdown');
    onStatus('Playtest notes exported.');
  }

  return (
    <section aria-labelledby="observation-title">
      <h2 id="observation-title">Observation notes</h2>
      <p>Record behavior, not compliments. What the child does matters more than what an adult hopes they felt.</p>
      {observationPrompts.map(([field, label]) => (
        <ObservationField key={field} label={label} value={notes[field]} onChange={(value) => updateNote(field, value)} />
      ))}
      <button className="adult-action" type="button" onClick={handleExport}>
        Export observation notes
      </button>
    </section>
  );
}
