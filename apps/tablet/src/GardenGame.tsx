import { useState } from 'react';
import type { Pal } from '@pixel-pals/content-schema';
import { PalArtwork } from '@pixel-pals/renderer';
import type { FirstActivityCompletion } from '@pixel-pals/simulation';
import {
  chooseBloom,
  createGardenGameState,
  gardenGameCompletion,
  takeGardenFriendTurn,
  type BloomColor,
  type BloomShape
} from './gardenGameModel';
import { requireRenderableSpecies } from './tabletProfile';

type GardenGameProps = {
  firstPal: Pal;
  friend: Pal;
  seed: number;
  onComplete: (result: FirstActivityCompletion) => void;
  onCancel: () => void;
};

const SHAPE_NAMES: Record<BloomShape, string> = {
  round: 'round-petal',
  star: 'star-petal',
  bell: 'bell-shaped'
};

const COLOR_NAMES: Record<BloomColor, string> = {
  sun: 'golden',
  berry: 'berry-purple',
  river: 'river-blue'
};

function Bloom({ shape, color }: { shape: BloomShape; color: BloomColor }) {
  return (
    <span className={`garden-bloom bloom-shape-${shape} bloom-color-${color}`} aria-hidden="true">
      <span className="garden-bloom-center" />
    </span>
  );
}

function palArtProps(pal: Pal) {
  return {
    name: pal.name,
    species: requireRenderableSpecies(pal.speciesId),
    paletteId: pal.appearance.paletteId,
    markingId: pal.appearance.markingId,
    accessoryId: pal.appearance.accessoryId,
    artIdentity: pal.artIdentity
  };
}

export function GardenGame({ firstPal, friend, seed, onComplete, onCancel }: GardenGameProps) {
  const [state, setState] = useState(() => createGardenGameState(seed));
  const [feedback, setFeedback] = useState(
    `${friend.name} made a garden clue. Find the bloom that matches both its color and shape.`
  );

  const round = state.rounds[state.roundIndex];

  function selectBloom(bloomId: string): void {
    if (!round || state.phase !== 'child') return;

    const selected = round.options.find((option) => option.id === bloomId);
    if (!selected) return;

    const next = chooseBloom(state, bloomId);
    setState(next);

    if (next.matches === state.matches) {
      setFeedback(
        `That bloom is close. Look for the ${COLOR_NAMES[round.targetColor]} ${SHAPE_NAMES[round.targetShape]} flower.`
      );
      return;
    }

    if (next.phase === 'friend') {
      setFeedback(`${firstPal.name} found it. Tap ${friend.name} so your friend can tend the next garden bed.`);
    } else if (next.phase === 'celebrate') {
      setFeedback(`${firstPal.name} and ${friend.name} found every bloom and helped the garden wake up.`);
    } else {
      setFeedback('That is the match. A new bloom clue is ready.');
    }
  }

  function friendTurn(): void {
    const next = takeGardenFriendTurn(state);
    if (next === state) return;
    setState(next);
    setFeedback(`${friend.name} watered a sleepy sprout. Now it is ${firstPal.name}’s turn to find the next bloom.`);
  }

  return (
    <section className="garden-game-shell" aria-labelledby="garden-game-title">
      <header className="garden-game-header">
        <div>
          <p className="eyebrow">Play together</p>
          <h1 id="garden-game-title">Garden Guessing Game</h1>
          <p className="garden-game-instruction">Match the bloom in the guide. Look at both the petal shape and the color.</p>
        </div>
        <button className="inline-action garden-game-exit" type="button" onClick={onCancel}>Return to Willowmere</button>
      </header>

      <div className="garden-game-stage">
        <div className="garden-game-pal garden-game-pal-left">
          <PalArtwork
            {...palArtProps(firstPal)}
            expression={state.phase === 'celebrate' ? 'delighted' : 'curious'}
            pose="standing"
          />
          <strong>{firstPal.name}</strong>
        </div>

        <div className="garden-board" aria-label="Garden bloom matching area">
          <div className="garden-target-guide" aria-live="polite">
            {round && state.phase === 'child' ? (
              <>
                <Bloom shape={round.targetShape} color={round.targetColor} />
                <span>Find this bloom</span>
              </>
            ) : (
              <span>{state.phase === 'friend' ? `${friend.name} can tend the garden now` : 'Every bloom is awake'}</span>
            )}
          </div>

          <div className="garden-bed-row">
            {state.phase === 'child' && round ? round.options.map((option) => (
              <button
                className={`garden-bed garden-bed-${option.bed}`}
                type="button"
                key={option.id}
                aria-label={`Choose the ${COLOR_NAMES[option.color]} ${SHAPE_NAMES[option.shape]} bloom`}
                onClick={() => selectBloom(option.id)}
              >
                <Bloom shape={option.shape} color={option.color} />
                <span className="garden-leaves" aria-hidden="true" />
                <span className="garden-soil" aria-hidden="true" />
              </button>
            )) : null}
          </div>

          <div className="garden-progress" aria-label={`${state.matches} of 4 bloom clues matched`}>
            {Array.from({ length: 4 }, (_, index) => (
              <span className={index < state.matches ? 'matched' : ''} key={index} aria-hidden="true" />
            ))}
          </div>
        </div>

        <button
          className="garden-game-pal garden-game-pal-right"
          type="button"
          disabled={state.phase !== 'friend'}
          onClick={friendTurn}
          aria-label={state.phase === 'friend' ? `Let ${friend.name} tend the next garden bed` : `${friend.name} is watching the blooms`}
        >
          <PalArtwork
            {...palArtProps(friend)}
            expression={state.phase === 'friend' || state.phase === 'celebrate' ? 'delighted' : 'content'}
            pose="standing"
          />
          <strong>{friend.name}</strong>
          {state.phase === 'friend' ? <span>Your friend’s turn</span> : null}
        </button>
      </div>

      <div className="garden-game-controls">
        <p className="garden-feedback" aria-live="polite">{feedback}</p>
        {state.phase === 'celebrate' ? (
          <button className="action-card action-sun garden-finish-button" type="button" onClick={() => onComplete(gardenGameCompletion(state))}>
            <span className="action-title">Remember This Garden Game</span>
            <span className="action-description">The blooms and this new friendship will become part of Willowmere.</span>
          </button>
        ) : null}
      </div>
    </section>
  );
}
