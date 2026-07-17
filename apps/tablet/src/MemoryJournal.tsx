import type { Memory, Pal, World } from '@pixel-pals/content-schema';
import {
  FamilyMemoryScene,
  StorybookMemoryScene,
  type PalArtworkRequest
} from '@pixel-pals/renderer';
import { requireRenderableSpecies } from './tabletProfile';

export type MemoryJournalProps = {
  world: World;
  firstPal: Pal;
};

function participantNames(world: World, memory: Memory): string {
  return memory.participantPalIds
    .map((palId) => world.pals.find((pal) => pal.id === palId)?.name)
    .filter((name): name is string => Boolean(name))
    .join(' and ');
}

function companionForMemory(world: World, firstPal: Pal, memory: Memory): Pal | undefined {
  const companionId = memory.participantPalIds.find((palId) => palId !== firstPal.id);
  return world.pals.find((pal) => pal.id === companionId);
}

function palArtworkRequest(
  pal: Pal,
  expression: PalArtworkRequest['expression'],
  pose: PalArtworkRequest['pose'] = 'standing'
): PalArtworkRequest {
  return {
    name: pal.name,
    species: requireRenderableSpecies(pal.speciesId),
    paletteId: pal.appearance.paletteId,
    markingId: pal.appearance.markingId,
    accessoryId: pal.appearance.accessoryId,
    artIdentity: pal.artIdentity,
    expression,
    pose
  };
}

function MemoryArtwork({ world, firstPal, memory }: { world: World; firstPal: Pal; memory: Memory }) {
  if (memory.familyHistory) {
    const participants = memory.participantPalIds
      .map((palId) => world.pals.find((pal) => pal.id === palId))
      .filter((pal): pal is Pal => Boolean(pal));
    const [first, second] = participants;
    if (first && second) {
      return (
        <FamilyMemoryScene
          sceneVariant={memory.familyHistory.sceneVariant}
          firstPal={palArtworkRequest(first, memory.emotionalTone === 'calm' ? 'content' : 'delighted')}
          companion={palArtworkRequest(second, 'delighted')}
        />
      );
    }
  }

  const companion = companionForMemory(world, firstPal, memory);
  return (
    <StorybookMemoryScene
      eventType={memory.eventType}
      activityId={memory.activityId}
      emotionalTone={memory.emotionalTone}
      firstPal={palArtworkRequest(
        firstPal,
        memory.emotionalTone === 'calm' ? 'content' : 'delighted',
        memory.eventType === 'first-shared-activity' ? 'playful' : 'standing'
      )}
      companion={companion
        ? palArtworkRequest(
            companion,
            'delighted',
            memory.eventType === 'first-shared-activity' ? 'playful' : 'standing'
          )
        : undefined}
    />
  );
}

export function MemoryJournal({ world, firstPal }: MemoryJournalProps) {
  return (
    <section className="journal-shell" aria-labelledby="journal-title">
      <header className="journal-header">
        <p className="eyebrow">The world remembers</p>
        <h1 id="journal-title">Memory Journal</h1>
        <p className="intro">These are not achievements. They are the moments that became part of this world’s history.</p>
      </header>

      <div className="journal-list">
        {[...world.memories].reverse().map((memory) => (
          <article
            className={["journal-entry", memory.familyHistory ? "journal-entry-family" : ""].filter(Boolean).join(' ')}
            key={memory.id}
            data-memory-id={memory.id}
            data-memory-kind={memory.familyHistory ? 'family-history' : memory.eventType}
          >
            <MemoryArtwork world={world} firstPal={firstPal} memory={memory} />
            <div className="journal-copy">
              <span className="memory-meta">Day {memory.worldDay + 1} · {participantNames(world, memory)}</span>
              <h2>{memory.title}</h2>
              <p>{memory.summary}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
