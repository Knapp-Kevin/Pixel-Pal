import type { AdventureId, World } from '@pixel-pals/content-schema';
import { ADVENTURES, adventureSession, chooseAdventureStage } from '@pixel-pals/simulation';
import { AdventureIllustration } from './AdventureIllustration';
import type { WorldSave } from './app/useWorldSave';
import type { WorldScene } from './app/worldQueries';

const CHOICE_TONES = ['action-sun', 'action-leaf', 'action-clay'] as const;

type AdventureScreenProps = {
  adventureId: AdventureId;
  world: World;
  scene: WorldScene;
  save: WorldSave;
  onExit: () => void;
};

export function AdventureScreen({ adventureId, world, scene, save, onExit }: AdventureScreenProps) {
  const definition = ADVENTURES[adventureId];
  const session = adventureSession(world, adventureId);

  if (!session) {
    return (
      <main className="app-shell">
        <section className="adventure-completion-panel">
          <h1>This adventure has not begun</h1>
          <button className="inline-action" type="button" onClick={onExit}>Return to Adventures</button>
        </section>
      </main>
    );
  }

  if (session.status === 'completed') {
    return (
      <main className="app-shell" aria-busy={save.saving} data-saving={save.saving}>
        <section
          className={`adventure-completion-panel adventure-completion-${adventureId}`}
          data-adventure-id={adventureId}
          data-adventure-status="completed"
          aria-labelledby="adventure-completion-title"
        >
          <p className="eyebrow">Adventure remembered</p>
          <h1 id="adventure-completion-title">{definition.memoryTitle}</h1>
          <p className="adventure-completion-summary">{session.summary}</p>
          <div className="adventure-choice-trail" aria-label="Choices remembered from this adventure">
            {session.selectedChoiceIds.map((choiceId) => {
              const choice = definition.stages.flatMap((stage) => stage.choices).find((candidate) => candidate.id === choiceId);
              return choice ? <span key={choiceId}>{choice.label}</span> : null;
            })}
          </div>
          <button className="action-card action-leaf adventure-return-button" type="button" onClick={onExit}>
            <span className="action-title">Return to Willowmere</span>
            <span className="action-description">The journal and village will remember what changed.</span>
          </button>
        </section>
        <footer className="prototype-note" aria-live="polite"><span>{save.saveStatus}</span><span>Adventure safely remembered</span></footer>
      </main>
    );
  }

  const stage = definition.stages[session.stageIndex];
  if (!stage) return null;

  return (
    <main className="app-shell" aria-busy={save.saving} data-saving={save.saving}>
      <section
        className="adventure-stage-shell"
        data-adventure-id={adventureId}
        data-adventure-status="active"
        data-stage-index={session.stageIndex}
        aria-labelledby="adventure-stage-title"
      >
        <header className="adventure-stage-header">
          <div>
            <p className="eyebrow">{definition.title} · Part {session.stageIndex + 1} of 3</p>
            <h1 id="adventure-stage-title">{stage.title}</h1>
            <p>{stage.prompt}</p>
          </div>
          <button className="inline-action adventure-exit" type="button" disabled={save.saving} onClick={onExit}>
            Return to Willowmere
          </button>
        </header>

        <AdventureIllustration definition={definition} stage={stage} scene={scene} />

        <section className="adventure-choice-grid" aria-label="Choose how the friends continue">
          {stage.choices.map((choice, index) => (
            <button
              className={`action-card adventure-choice ${CHOICE_TONES[index] ?? 'action-leaf'}`}
              data-adventure-choice-id={choice.id}
              type="button"
              key={choice.id}
              disabled={save.saving}
              onClick={() => {
                void save.persist(chooseAdventureStage(world, adventureId, choice.id));
              }}
            >
              <span className="action-title">{choice.label}</span>
              <span className="action-description">{choice.description}</span>
            </button>
          ))}
        </section>
      </section>
      <footer className="prototype-note" aria-live="polite">
        <span>{save.saveStatus}</span>
        <span>Part {session.stageIndex + 1} of 3 · Stop safely at any time</span>
      </footer>
    </main>
  );
}
