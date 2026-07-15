import { useState } from 'react';
import type { Pal } from '@pixel-pals/content-schema';
import { ProductionPalPortrait } from '@pixel-pals/renderer';
import type { WorldDayCompletion, WorldDayInvitation } from '@pixel-pals/simulation';
import { requireRenderableSpecies } from './tabletProfile';

const PATH_ITEMS = [
  { id: 'twigs', label: 'Gather the fallen twigs', symbol: '⌁' },
  { id: 'leaves', label: 'Sweep the leaf pile aside', symbol: '◇' },
  { id: 'pebbles', label: 'Set the loose pebbles back', symbol: '●' }
] as const;

type VillageHelpingSceneProps = {
  invitation: WorldDayInvitation;
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

export function VillageHelpingScene({ invitation, firstPal, friend, onComplete, onCancel }: VillageHelpingSceneProps) {
  const [cleared, setCleared] = useState<string[]>([]);
  const [attempts, setAttempts] = useState(0);
  const [friendTurn, setFriendTurn] = useState(false);
  const [feedback, setFeedback] = useState(`${friend.name} found a small job that will make the village easier to move through.`);

  function clearItem(id: string): void {
    setAttempts((current) => current + 1);
    if (cleared.includes(id)) return;

    const next = [...cleared, id];
    setCleared(next);
    if (next.length === 1) {
      setFriendTurn(true);
      setFeedback(`${firstPal.name} made a start. ${friend.name} moves a small branch from the other side of the path.`);
    } else if (next.length === PATH_ITEMS.length) {
      setFeedback(`${firstPal.name} and ${friend.name} step back. The path feels cared for, not merely cleared.`);
    } else {
      setFeedback('The path is opening up. One more piece still needs a place.');
    }
  }

  return (
    <section className="day-scene-shell helping-scene-shell" aria-labelledby="helping-title">
      <header className="day-scene-header">
        <div>
          <p className="eyebrow">Care for Willowmere</p>
          <h1 id="helping-title">{invitation.title}</h1>
          <p>{invitation.summary}</p>
        </div>
        <button className="inline-action" type="button" onClick={onCancel}>Return to Willowmere</button>
      </header>

      <div className="day-scene-stage helping-stage">
        <ProductionPalPortrait {...portraitProps(firstPal)} expression={cleared.length === PATH_ITEMS.length ? 'delighted' : 'thoughtful'} pose="standing" className="day-scene-pal" />
        <div className="path-care-area" aria-label="Village path items">
          {PATH_ITEMS.map((item) => (
            <button
              className={cleared.includes(item.id) ? 'path-care-item cleared' : 'path-care-item'}
              type="button"
              key={item.id}
              disabled={cleared.includes(item.id)}
              onClick={() => clearItem(item.id)}
              aria-label={item.label}
            >
              <span aria-hidden="true">{item.symbol}</span>
              <strong>{cleared.includes(item.id) ? 'Placed with care' : item.label}</strong>
            </button>
          ))}
          <div className="path-care-progress" aria-label={`${cleared.length} of 3 path tasks completed`}>
            {Array.from({ length: 3 }, (_, index) => <span className={index < cleared.length ? 'complete' : ''} key={index} />)}
          </div>
        </div>
        <ProductionPalPortrait {...portraitProps(friend)} expression={friendTurn ? 'delighted' : 'content'} pose="standing" className="day-scene-pal" />
      </div>

      <div className="day-scene-controls">
        <p aria-live="polite">{feedback}</p>
        {cleared.length === PATH_ITEMS.length ? (
          <button className="action-card action-sun day-finish-button" type="button" onClick={() => onComplete({
            completed: true,
            successfulActions: 3,
            cooperativeTurns: 2,
            attempts: Math.max(attempts, 3)
          })}>
            <span className="action-title">Leave the Path Better</span>
            <span className="action-description">Willowmere will remember this visible act of care.</span>
          </button>
        ) : null}
      </div>
    </section>
  );
}
