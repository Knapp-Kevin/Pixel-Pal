import { useState, type CSSProperties } from 'react';
import type { Pal } from '@pixel-pals/content-schema';
import { PalPortrait } from '@pixel-pals/renderer';
import type { FirstActivityCompletion } from '@pixel-pals/simulation';
import {
  chooseLeaf,
  createLeafChaseState,
  leafChaseCompletion,
  takeLeafFriendTurn,
  type LeafLane,
  type LeafShape
} from './leafChaseModel';
import { requireRenderableSpecies } from './tabletProfile';

type LeafChaseGameProps = {
  firstPal: Pal;
  friend: Pal;
  seed: number;
  onComplete: (result: FirstActivityCompletion) => void;
  onCancel: () => void;
};

const SHAPE_NAMES: Record<LeafShape, string> = {
  round: 'round leaf',
  pointed: 'pointed leaf',
  heart: 'heart-shaped leaf'
};

const LANE_TOP: Record<LeafLane, string> = {
  high: '16%',
  middle: '43%',
  low: '69%'
};

export function LeafChaseGame({ firstPal, friend, seed, onComplete, onCancel }: LeafChaseGameProps) {
  const [state, setState] = useState(() => createLeafChaseState(seed));
  const [feedback, setFeedback] = useState(
    `${friend.name} spotted the first leaves. Catch the shape shown in the guide.`
  );

  const round = state.rounds[state.roundIndex];

  function catchLeaf(leafId: string): void {
    if (!round || state.phase !== 'child') return;

    const selected = round.options.find((option) => option.id === leafId);
    if (!selected) return;

    const next = chooseLeaf(state, leafId);
    setState(next);

    if (next.catches === state.catches) {
      setFeedback(`That one drifted past. Look for the ${SHAPE_NAMES[round.targetShape]}.`);
      return;
    }

    if (next.phase === 'friend') {
      setFeedback(`${firstPal.name} caught it. Tap ${friend.name} so your friend can help with the next gust.`);
    } else if (next.phase === 'celebrate') {
      setFeedback(`${firstPal.name} and ${friend.name} caught the last leaf together.`);
    } else {
      setFeedback('Caught it. A new gust is carrying more leaves across the path.');
    }
  }

  function friendTurn(): void {
    const next = takeLeafFriendTurn(state);
    if (next === state) return;
    setState(next);
    setFeedback(`${friend.name} swept a leaf out of the brambles. Now it is ${firstPal.name}’s turn again.`);
  }

  return (
    <section className="leaf-game-shell" aria-labelledby="leaf-game-title">
      <header className="leaf-game-header">
        <div>
          <p className="eyebrow">Play together</p>
          <h1 id="leaf-game-title">Chase the Leaves</h1>
          <p className="leaf-game-instruction">Watch the guide, then tap the matching leaf as it drifts across the path.</p>
        </div>
        <button className="inline-action leaf-game-exit" type="button" onClick={onCancel}>Return to Willowmere</button>
      </header>

      <div className="leaf-game-stage">
        <div className="leaf-game-pal leaf-game-pal-left">
          <PalPortrait
            name={firstPal.name}
            species={requireRenderableSpecies(firstPal.speciesId)}
            paletteId={firstPal.appearance.paletteId}
            markingId={firstPal.appearance.markingId}
            accessoryId={firstPal.appearance.accessoryId}
            expression={state.phase === 'celebrate' ? 'delighted' : 'curious'}
            pose="playful"
          />
          <strong>{firstPal.name}</strong>
        </div>

        <div className="leaf-chase-field" aria-label="Windblown leaf path">
          <div className="leaf-target-guide" aria-live="polite">
            {round && state.phase === 'child' ? (
              <>
                <span className={`leaf-shape leaf-shape-${round.targetShape}`} aria-hidden="true" />
                <span>Find the {SHAPE_NAMES[round.targetShape]}</span>
              </>
            ) : (
              <span>{state.phase === 'friend' ? `${friend.name} can help now` : 'The path is full of color'}</span>
            )}
          </div>

          <div className="wind-line wind-line-one" aria-hidden="true" />
          <div className="wind-line wind-line-two" aria-hidden="true" />

          {state.phase === 'child' && round ? round.options.map((leaf) => {
            const style: CSSProperties = {
              top: LANE_TOP[leaf.lane],
              left: `${12 + leaf.driftOffset * 7}%`,
              animationDelay: `${leaf.driftOffset * -0.43}s`
            };

            return (
              <button
                className="drifting-leaf-button"
                type="button"
                style={style}
                key={leaf.id}
                aria-label={`Catch the ${SHAPE_NAMES[leaf.shape]}`}
                onClick={() => catchLeaf(leaf.id)}
              >
                <span className={`leaf-shape leaf-shape-${leaf.shape}`} aria-hidden="true" />
              </button>
            );
          }) : null}

          <div className="leaf-catch-progress" aria-label={`${state.catches} of 5 leaves caught`}>
            {Array.from({ length: 5 }, (_, index) => (
              <span className={index < state.catches ? 'caught' : ''} key={index} aria-hidden="true" />
            ))}
          </div>
        </div>

        <button
          className="leaf-game-pal leaf-game-pal-right"
          type="button"
          disabled={state.phase !== 'friend'}
          onClick={friendTurn}
          aria-label={state.phase === 'friend' ? `Let ${friend.name} catch the next leaf` : `${friend.name} is watching the path`}
        >
          <PalPortrait
            name={friend.name}
            species={requireRenderableSpecies(friend.speciesId)}
            paletteId={friend.appearance.paletteId}
            markingId={friend.appearance.markingId}
            accessoryId={friend.appearance.accessoryId}
            expression={state.phase === 'friend' || state.phase === 'celebrate' ? 'delighted' : 'content'}
            pose="playful"
          />
          <strong>{friend.name}</strong>
          {state.phase === 'friend' ? <span>Your friend’s turn</span> : null}
        </button>
      </div>

      <div className="leaf-game-controls">
        <p className="leaf-feedback" aria-live="polite">{feedback}</p>
        {state.phase === 'celebrate' ? (
          <button className="action-card action-leaf leaf-finish-button" type="button" onClick={() => onComplete(leafChaseCompletion(state))}>
            <span className="action-title">Remember This Chase</span>
            <span className="action-description">The caught leaves and this shared game will become part of Willowmere.</span>
          </button>
        ) : null}
      </div>
    </section>
  );
}
