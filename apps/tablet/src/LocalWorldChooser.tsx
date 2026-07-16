import { useEffect, useState } from 'react';
import type { WorldSummary } from '@pixel-pals/persistence';

const SPECIES_LABELS: Record<string, string> = {
  fox: 'Fox',
  deer: 'Deer',
  rabbit: 'Rabbit',
  cat: 'Kitten',
  duck: 'Duckling'
};

type LocalWorldChooserProps = {
  worlds: WorldSummary[];
  selectedWorldId: string;
  disabled: boolean;
  onSwitch: (worldId: string) => Promise<void>;
};

function summaryLine(world: WorldSummary): string {
  const species = SPECIES_LABELS[world.firstPalSpeciesId] ?? world.firstPalSpeciesId;
  const memories = `${world.memoryCount} remembered moment${world.memoryCount === 1 ? '' : 's'}`;
  return `${species} · Day ${world.worldDay + 1} · ${memories}`;
}

export function LocalWorldChooser({ worlds, selectedWorldId, disabled, onSwitch }: LocalWorldChooserProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [open]);

  if (worlds.length < 2) return null;

  const selected = worlds.find((world) => world.worldId === selectedWorldId);

  return (
    <>
      <button
        className="world-chooser-trigger"
        type="button"
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        Worlds
        <span>{selected?.firstPalName ?? worlds.length}</span>
      </button>

      {open ? (
        <div className="world-chooser-overlay" role="presentation" onMouseDown={(event) => {
          if (event.currentTarget === event.target) setOpen(false);
        }}>
          <section className="world-chooser-dialog" role="dialog" aria-modal="true" aria-labelledby="world-chooser-title">
            <header className="world-chooser-heading">
              <div>
                <p className="eyebrow">Local stories on this tablet</p>
                <h2 id="world-chooser-title">Whose world are we visiting?</h2>
              </div>
              <button className="inline-action world-chooser-close" type="button" onClick={() => setOpen(false)}>Close</button>
            </header>

            <div className="world-card-grid">
              {worlds.map((world) => {
                const current = world.worldId === selectedWorldId;
                return (
                  <button
                    className="world-card"
                    type="button"
                    key={world.worldId}
                    aria-pressed={current}
                    disabled={disabled}
                    onClick={() => {
                      if (current) {
                        setOpen(false);
                        return;
                      }
                      void onSwitch(world.worldId).then(() => setOpen(false));
                    }}
                  >
                    <span className="world-card-name">{world.firstPalName}</span>
                    <span className="world-card-summary">{summaryLine(world)}</span>
                    <span className="world-card-state">{current ? 'Here now' : 'Visit this world'}</span>
                  </button>
                );
              })}
            </div>

            <p className="tool-note">Each world keeps its own friendships, memories, home, and recovery checkpoint.</p>
          </section>
        </div>
      ) : null}
    </>
  );
}
