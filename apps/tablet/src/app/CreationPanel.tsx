import { useState } from 'react';
import type { World } from '@pixel-pals/content-schema';
import { PalArtwork } from '@pixel-pals/renderer';
import { createFirstWorld, type FirstPalChoice } from '@pixel-pals/simulation';
import { ChoiceGroup } from './ChoiceGroup';
import { accessoryOptions, markingOptions, paletteOptions, speciesOptions } from './options';
import { createLocalWorldSeed } from './worldQueries';

type CreationDraft = {
  name: string;
  speciesId: FirstPalChoice['speciesId'] | null;
  paletteId: FirstPalChoice['paletteId'];
  markingId: FirstPalChoice['markingId'];
  accessoryId: NonNullable<FirstPalChoice['accessoryId']>;
};

const emptyDraft: CreationDraft = {
  name: '',
  speciesId: null,
  paletteId: 'sunleaf',
  markingId: 'tail-tip',
  accessoryId: 'scarf'
};

type CreationPanelProps = {
  saving: boolean;
  saveStatus: string;
  persist: (world: World) => Promise<boolean>;
  onCreateError: (message: string) => void;
  existingWorldCount?: number;
  onCreated?: () => void;
  onCancel?: () => void;
};

async function submitCreation(draft: CreationDraft, props: CreationPanelProps): Promise<void> {
  if (draft.name.trim().length === 0 || !draft.speciesId || props.saving) return;

  try {
    const seed = createLocalWorldSeed();
    const firstPalName = draft.name.trim();
    const saved = await props.persist(createFirstWorld({
      worldId: `local-family-world-${seed.toString(36)}`,
      worldName: `${firstPalName}’s Willowmere`,
      seed,
      firstPal: {
        name: firstPalName,
        speciesId: draft.speciesId,
        paletteId: draft.paletteId,
        markingId: draft.markingId,
        accessoryId: draft.accessoryId
      }
    }));

    if (saved) props.onCreated?.();
  } catch {
    props.onCreateError('That Pal could not be created. Nothing was saved.');
  }
}

function CreationPreview({ draft }: { draft: CreationDraft }) {
  return (
    <div className="storybook-art creation-art">
      <div className="preview-glow" aria-hidden="true" />
      {draft.speciesId ? (
        <PalArtwork
          className="first-pal-preview"
          name={draft.name.trim() || 'Your new Pal'}
          species={draft.speciesId}
          paletteId={draft.paletteId}
          markingId={draft.markingId}
          accessoryId={draft.accessoryId}
          expression="curious"
        />
      ) : (
        <div className="unselected-pal" role="status">
          <span className="unselected-pal-shapes" aria-hidden="true">
            <span>◇</span><span>○</span><span>△</span><span>☆</span><span>◌</span>
          </span>
          <strong>Choose who you meet</strong>
          <span>Fox, Deer, Rabbit, Kitten, and Duckling are all waiting.</span>
        </div>
      )}
    </div>
  );
}

type CreationFieldsProps = {
  draft: CreationDraft;
  update: (patch: Partial<CreationDraft>) => void;
  saving: boolean;
};

function CreationFields({ draft, update, saving }: CreationFieldsProps) {
  const ready = draft.name.trim().length > 0 && draft.speciesId !== null;

  return (
    <>
      <ChoiceGroup legend="Choose a species" options={speciesOptions} selected={draft.speciesId} onSelect={(id) => update({ speciesId: id })} disabled={saving} />

      <label className="field-label">
        <span className="action-title">Pal name</span>
        <input
          className="name-input"
          aria-label="Pal name"
          maxLength={32}
          required
          disabled={saving}
          value={draft.name}
          onChange={(event) => update({ name: event.target.value })}
        />
      </label>

      <ChoiceGroup legend="Colors" options={paletteOptions} selected={draft.paletteId} onSelect={(id) => update({ paletteId: id })} disabled={saving} />
      <ChoiceGroup legend="Markings" options={markingOptions} selected={draft.markingId} onSelect={(id) => update({ markingId: id })} disabled={saving} />
      <ChoiceGroup legend="Something to wear" options={accessoryOptions} selected={draft.accessoryId} onSelect={(id) => update({ accessoryId: id })} disabled={saving} />

      <button className="action-card action-sun meet-button" type="submit" disabled={saving || !ready}>
        <span className="action-title">Meet my Pal</span>
        <span className="action-description">
          {draft.speciesId ? 'This name and appearance stay in this local world.' : 'Choose a species first. None is selected for you.'}
        </span>
      </button>
    </>
  );
}

export function CreationPanel(props: CreationPanelProps) {
  const [draft, setDraft] = useState<CreationDraft>(emptyDraft);
  const update = (patch: Partial<CreationDraft>) => setDraft((current) => ({ ...current, ...patch }));
  const isAdditionalWorld = (props.existingWorldCount ?? 0) > 0;

  return (
    <main className="app-shell" aria-busy={props.saving} data-saving={props.saving}>
      <section className="storybook-panel creation-panel" aria-labelledby="first-pal-title">
        <CreationPreview draft={draft} />

        <div className="welcome-copy creation-copy">
          <p className="eyebrow">{isAdditionalWorld ? 'Another local story' : 'Your story begins with a Pal'}</p>
          <h1 id="first-pal-title">Who did you meet?</h1>
          <p className="intro">
            Choose their species and a few things you can see. Their personality will reveal itself through the life you share.
            {isAdditionalWorld ? ' Existing worlds remain safely stored on this tablet.' : ''}
          </p>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              void submitCreation(draft, props);
            }}
          >
            <CreationFields draft={draft} update={update} saving={props.saving} />
          </form>

          {props.onCancel ? (
            <button className="inline-action creation-cancel" type="button" disabled={props.saving} onClick={props.onCancel}>
              Return to the current world
            </button>
          ) : null}
        </div>
      </section>
      <footer className="prototype-note" aria-live="polite"><span>{props.saveStatus}</span></footer>
    </main>
  );
}
