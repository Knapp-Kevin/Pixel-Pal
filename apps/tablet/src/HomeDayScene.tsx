import { useState } from 'react';
import type { HomeObject, Pal } from '@pixel-pals/content-schema';
import { PalArtwork } from '@pixel-pals/renderer';
import type { WorldDayCompletion, WorldDayInvitation } from '@pixel-pals/simulation';
import { requireRenderableSpecies } from './tabletProfile';

const HOME_ACTIONS: Record<HomeObject, readonly [
  { id: string; title: string; detail: string; symbol: string },
  { id: string; title: string; detail: string; symbol: string },
  { id: string; title: string; detail: string; symbol: string }
]> = {
  'window-cushion': [
    { id: 'sky', title: 'Notice the sky', detail: 'The clouds move slowly above the Great Tree.', symbol: '◌' },
    { id: 'path', title: 'Watch the path', detail: 'Two distant Pals pause to greet each other.', symbol: '⌁' },
    { id: 'garden', title: 'Find the garden', detail: 'One bright bloom is visible between the roofs.', symbol: '✿' }
  ],
  'memory-shelf': [
    { id: 'smooth-stone', title: 'Place the smooth stone', detail: 'It rests beside the memory of the first shared game.', symbol: '●' },
    { id: 'leaf-token', title: 'Add a pressed leaf', detail: 'Fern remembers where the wind carried it.', symbol: '◆' },
    { id: 'woven-loop', title: 'Hang a woven loop', detail: 'The small loop makes room for another story later.', symbol: '∞' }
  ],
  'story-lantern': [
    { id: 'beginning', title: 'Choose a beginning', detail: 'A tiny traveler finds a path beneath the willow.', symbol: '◇' },
    { id: 'companion', title: 'Choose a companion', detail: 'A patient friend joins without needing to be asked twice.', symbol: '○' },
    { id: 'ending', title: 'Choose a gentle ending', detail: 'They return home with one new thing to remember.', symbol: '☆' }
  ]
};

const OBJECT_LABELS: Record<HomeObject, string> = {
  'window-cushion': 'window cushion',
  'memory-shelf': 'memory shelf',
  'story-lantern': 'story lantern'
};

type HomeDaySceneProps = {
  firstPal: Pal;
  friend: Pal;
  invitation: WorldDayInvitation;
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

export function HomeDayScene({ firstPal, friend, invitation, onComplete, onCancel }: HomeDaySceneProps) {
  const objectId = invitation.homeObjectId;
  const actions = objectId ? HOME_ACTIONS[objectId] : undefined;
  const [selected, setSelected] = useState<string[]>([]);
  const [attempts, setAttempts] = useState(0);
  const [feedback, setFeedback] = useState(
    objectId
      ? `${friend.name} came inside. Choose two ways to share the ${OBJECT_LABELS[objectId]}.`
      : 'This home invitation is missing its chosen object.'
  );

  function choose(id: string): void {
    setAttempts((current) => current + 1);
    if (!actions || selected.includes(id) || selected.length >= 2) return;
    const action = actions.find((candidate) => candidate.id === id);
    if (!action) return;
    const next = [...selected, id];
    setSelected(next);
    setFeedback(next.length === 1
      ? `${action.detail} ${friend.name} adds one small thought of their own.`
      : `${action.detail} The room now holds something they made together.`);
  }

  return (
    <section className="day-scene-shell home-day-shell" aria-labelledby="home-day-title">
      <header className="day-scene-header">
        <div>
          <p className="eyebrow">A shared part of home</p>
          <h1 id="home-day-title">{invitation.title}</h1>
          <p>{invitation.summary}</p>
        </div>
        <button className="inline-action" type="button" onClick={onCancel}>Return to Willowmere</button>
      </header>

      <div className="day-scene-stage home-day-stage">
        <PalArtwork {...portraitProps(firstPal)} expression="curious" pose="standing" className="day-scene-pal" />
        <div className="home-day-action-grid" aria-label="Ways to spend time together at home">
          {actions?.map((action) => (
            <button
              className={selected.includes(action.id) ? 'home-day-action chosen' : 'home-day-action'}
              type="button"
              key={action.id}
              disabled={selected.includes(action.id) || selected.length >= 2}
              onClick={() => choose(action.id)}
            >
              <span aria-hidden="true">{action.symbol}</span>
              <strong>{action.title}</strong>
            </button>
          ))}
        </div>
        <PalArtwork {...portraitProps(friend)} expression={selected.length ? 'content' : 'curious'} pose="standing" className="day-scene-pal" />
      </div>

      <div className="day-scene-controls">
        <p aria-live="polite">{feedback}</p>
        {selected.length === 2 ? (
          <button className="action-card action-sun day-finish-button" type="button" onClick={() => onComplete({
            completed: true,
            successfulActions: 2,
            cooperativeTurns: 2,
            attempts: Math.max(attempts, 2)
          })}>
            <span className="action-title">Let Home Remember This</span>
            <span className="action-description">The home and friendship will carry this shared moment forward.</span>
          </button>
        ) : null}
      </div>
    </section>
  );
}
