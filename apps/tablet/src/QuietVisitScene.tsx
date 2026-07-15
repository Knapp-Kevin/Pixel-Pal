import { useState } from 'react';
import type { Pal } from '@pixel-pals/content-schema';
import { PalArtwork } from '@pixel-pals/renderer';
import type { WorldDayCompletion } from '@pixel-pals/simulation';
import { requireRenderableSpecies } from './tabletProfile';

const OBSERVATIONS = [
  { id: 'birds', title: 'Listen for birds', detail: 'A tiny call answers from the willow branches.' },
  { id: 'ribbons', title: 'Watch the ribbons', detail: 'One friendship ribbon moves before the others.' },
  { id: 'garden', title: 'Notice the garden', detail: 'A closed bloom is beginning to lean toward the light.' }
] as const;

type QuietVisitSceneProps = {
  firstPal: Pal;
  friend: Pal;
  onComplete: (evidence: WorldDayCompletion) => void;
  onCancel: () => void;
};

function portraitProps(pal: Pal) {
  return {
    name: pal.name,
    species: requireRenderableSpecies(pal.speciesId),
    artIdentity: pal.artIdentity,
    paletteId: pal.appearance.paletteId,
    markingId: pal.appearance.markingId,
    accessoryId: pal.appearance.accessoryId
  };
}

export function QuietVisitScene({ firstPal, friend, onComplete, onCancel }: QuietVisitSceneProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const [attempts, setAttempts] = useState(0);
  const [feedback, setFeedback] = useState(`${friend.name} found a quiet place near the willow. Choose something to notice together.`);

  function notice(id: string): void {
    setAttempts((current) => current + 1);
    if (selected.includes(id) || selected.length >= 2) return;
    const observation = OBSERVATIONS.find((candidate) => candidate.id === id);
    if (!observation) return;

    const next = [...selected, id];
    setSelected(next);
    setFeedback(next.length === 1
      ? `${observation.detail} ${friend.name} listens too, then points out a soft rustle near the path.`
      : `${observation.detail} You each noticed something the other might have missed.`);
  }

  return (
    <section className="day-scene-shell quiet-visit-shell" aria-labelledby="quiet-visit-title">
      <header className="day-scene-header">
        <div>
          <p className="eyebrow">A quiet part of the day</p>
          <h1 id="quiet-visit-title">Sit Quietly with {friend.name}</h1>
          <p>Choose two small things to notice. There is no quickest or best answer.</p>
        </div>
        <button className="inline-action" type="button" onClick={onCancel}>Return to Willowmere</button>
      </header>

      <div className="day-scene-stage quiet-visit-stage">
        <PalArtwork {...portraitProps(firstPal)} expression="thoughtful" pose="standing" className="day-scene-pal" />
        <div className="quiet-observation-grid" aria-label="Things to notice">
          {OBSERVATIONS.map((observation) => (
            <button
              className={selected.includes(observation.id) ? 'quiet-observation chosen' : 'quiet-observation'}
              type="button"
              key={observation.id}
              disabled={selected.includes(observation.id) || selected.length >= 2}
              onClick={() => notice(observation.id)}
            >
              <span aria-hidden="true">{observation.id === 'birds' ? '◌' : observation.id === 'ribbons' ? '≈' : '✿'}</span>
              <strong>{observation.title}</strong>
            </button>
          ))}
        </div>
        <PalArtwork {...portraitProps(friend)} expression={selected.length ? 'content' : 'curious'} pose="standing" className="day-scene-pal" />
      </div>

      <div className="day-scene-controls">
        <p aria-live="polite">{feedback}</p>
        {selected.length === 2 ? (
          <button className="action-card action-leaf day-finish-button" type="button" onClick={() => onComplete({
            completed: true,
            successfulActions: 2,
            cooperativeTurns: 2,
            attempts: Math.max(attempts, 2)
          })}>
            <span className="action-title">Carry This Quiet Moment Forward</span>
            <span className="action-description">The day can change through noticing as well as doing.</span>
          </button>
        ) : null}
      </div>
    </section>
  );
}
