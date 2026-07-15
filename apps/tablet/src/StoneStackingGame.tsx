import { useState, type CSSProperties, type DragEvent } from 'react';
import type { Pal } from '@pixel-pals/content-schema';
import { PalPortrait } from '@pixel-pals/renderer';
import type { FirstActivityCompletion } from '@pixel-pals/simulation';
import { requireRenderableSpecies } from './tabletProfile';

type StoneStackingGameProps = {
  firstPal: Pal;
  friend: Pal;
  onComplete: (result: FirstActivityCompletion) => void;
  onCancel: () => void;
};

type GamePhase = 'child' | 'friend' | 'finish' | 'celebrate';

type StoneChoice = {
  size: number;
  label: string;
};

const CHILD_TARGETS = [6, 4, 2] as const;
const FRIEND_STONES = [5, 3] as const;
const CHOICES: readonly StoneChoice[][] = [
  [
    { size: 4, label: 'narrow stone' },
    { size: 8, label: 'extra-wide stone' },
    { size: 6, label: 'wide stone' }
  ],
  [
    { size: 2, label: 'little stone' },
    { size: 6, label: 'wide stone' },
    { size: 4, label: 'middle stone' }
  ],
  [
    { size: 3, label: 'rounded stone' },
    { size: 2, label: 'small stone' },
    { size: 1, label: 'tiny top stone' }
  ]
];

function stoneStyle(size: number): CSSProperties {
  return {
    width: `${34 + size * 8}%`,
    minWidth: `${42 + size * 5}px`
  };
}

export function StoneStackingGame({ firstPal, friend, onComplete, onCancel }: StoneStackingGameProps) {
  const [tower, setTower] = useState<number[]>([7]);
  const [round, setRound] = useState(0);
  const [phase, setPhase] = useState<GamePhase>('child');
  const [attempts, setAttempts] = useState(0);
  const [successfulActions, setSuccessfulActions] = useState(0);
  const [feedback, setFeedback] = useState(
    `${friend.name} placed a broad base stone. Choose the stone that fits next.`
  );

  const target = CHILD_TARGETS[round];
  const choices = CHOICES[round] ?? [];

  function tryStone(size: number): void {
    if (phase !== 'child' || target === undefined) return;

    setAttempts((current) => current + 1);

    if (size !== target) {
      setFeedback(
        size > target
          ? 'That stone is too wide for the one below it. The tower wobbles, but nothing falls. Try a narrower one.'
          : 'That stone could fit later, but it leaves too large a jump. Try one that matches the next step.'
      );
      return;
    }

    setTower((current) => [...current, size]);
    setSuccessfulActions((current) => current + 1);

    if (round < FRIEND_STONES.length) {
      setPhase('friend');
      setFeedback(`${firstPal.name} found a steady fit. Tap ${friend.name} so your friend can add the next stone.`);
    } else {
      setPhase('finish');
      setFeedback('Only the tiny top stone remains. Place it together.');
    }
  }

  function handleDrop(event: DragEvent<HTMLDivElement>): void {
    event.preventDefault();
    const raw = event.dataTransfer.getData('text/plain');
    const size = Number(raw);
    if (Number.isInteger(size)) tryStone(size);
  }

  function takeFriendTurn(): void {
    if (phase !== 'friend') return;
    const friendStone = FRIEND_STONES[round];
    if (friendStone === undefined) return;

    setTower((current) => [...current, friendStone]);
    setRound((current) => current + 1);
    setPhase('child');
    setFeedback(`${friend.name} added a stone. Now choose the next steady fit for ${firstPal.name}.`);
  }

  function finishTower(): void {
    if (phase !== 'finish') return;
    setTower((current) => [...current, 1]);
    setPhase('celebrate');
    setFeedback(`${firstPal.name} and ${friend.name} balanced the final stone together.`);
  }

  return (
    <section className="stone-game-shell" aria-labelledby="stone-game-title">
      <header className="stone-game-header">
        <div>
          <p className="eyebrow">Play together</p>
          <h1 id="stone-game-title">Stack the Stones</h1>
          <p className="stone-game-instruction">Take turns building a steady tower. Tap a stone, or drag it to the tower.</p>
        </div>
        <button className="inline-action stone-game-exit" type="button" onClick={onCancel}>Return to Willowmere</button>
      </header>

      <div className="stone-game-stage">
        <div className="stone-game-friend stone-game-pal-left">
          <PalPortrait
            name={firstPal.name}
            species={requireRenderableSpecies(firstPal.speciesId)}
            paletteId={firstPal.appearance.paletteId}
            markingId={firstPal.appearance.markingId}
            accessoryId={firstPal.appearance.accessoryId}
            expression={phase === 'celebrate' ? 'delighted' : 'thoughtful'}
            pose="standing"
          />
          <strong>{firstPal.name}</strong>
        </div>

        <div
          className="stone-tower-zone"
          onDragOver={(event) => event.preventDefault()}
          onDrop={handleDrop}
          aria-label="Stone tower"
        >
          <div className="stone-tower" aria-live="polite">
            {[...tower].reverse().map((size, index) => (
              <span
                className={`stacked-stone stone-size-${size}`}
                style={stoneStyle(size)}
                key={`${size}-${index}`}
                aria-hidden="true"
              />
            ))}
          </div>
          <span className="tower-count">{tower.length} stone{tower.length === 1 ? '' : 's'}</span>
        </div>

        <button
          className="stone-game-friend stone-game-pal-right"
          type="button"
          disabled={phase !== 'friend'}
          onClick={takeFriendTurn}
          aria-label={phase === 'friend' ? `Let ${friend.name} place the next stone` : `${friend.name} is waiting`}
        >
          <PalPortrait
            name={friend.name}
            species={requireRenderableSpecies(friend.speciesId)}
            paletteId={friend.appearance.paletteId}
            markingId={friend.appearance.markingId}
            accessoryId={friend.appearance.accessoryId}
            expression={phase === 'friend' || phase === 'celebrate' ? 'delighted' : 'content'}
            pose="standing"
          />
          <strong>{friend.name}</strong>
          {phase === 'friend' ? <span>Your friend’s turn</span> : null}
        </button>
      </div>

      <div className="stone-game-controls">
        <p className="stone-feedback" aria-live="polite">{feedback}</p>

        {phase === 'child' ? (
          <div className="stone-bank" aria-label="Choose the next stone">
            {choices.map((choice) => (
              <button
                className="loose-stone-button"
                type="button"
                draggable
                key={`${round}-${choice.size}`}
                onDragStart={(event) => event.dataTransfer.setData('text/plain', String(choice.size))}
                onClick={() => tryStone(choice.size)}
                aria-label={`Try the ${choice.label}`}
              >
                <span className={`loose-stone stone-size-${choice.size}`} style={stoneStyle(choice.size)} aria-hidden="true" />
                <span>{choice.label}</span>
              </button>
            ))}
          </div>
        ) : null}

        {phase === 'finish' ? (
          <button className="action-card action-sun stone-finish-button" type="button" onClick={finishTower}>
            <span className="action-title">Place the Top Stone Together</span>
            <span className="action-description">Finish the tower with one shared move.</span>
          </button>
        ) : null}

        {phase === 'celebrate' ? (
          <button
            className="action-card action-leaf stone-finish-button"
            type="button"
            onClick={() => onComplete({
              activity: 'stone-stacking',
              completed: true,
              successfulActions,
              cooperativeTurns: 7,
              attempts
            })}
          >
            <span className="action-title">Remember This Moment</span>
            <span className="action-description">The tower and this new friendship will become part of Willowmere.</span>
          </button>
        ) : null}
      </div>
    </section>
  );
}
