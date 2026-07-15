import type { Memory, Pal, World } from '@pixel-pals/content-schema';
import { StorybookMemoryScene } from '@pixel-pals/renderer';
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

export function MemoryJournal({ world, firstPal }: MemoryJournalProps) {
  return (
    <section className="journal-shell" aria-labelledby="journal-title">
      <header className="journal-header">
        <p className="eyebrow">The world remembers</p>
        <h1 id="journal-title">Memory Journal</h1>
        <p className="intro">These are not achievements. They are the moments that became part of this world’s history.</p>
      </header>

      <div className="journal-list">
        {[...world.memories].reverse().map((memory) => {
          const companion = companionForMemory(world, firstPal, memory);

          return (
            <article className="journal-entry" key={memory.id}>
              <StorybookMemoryScene
                eventType={memory.eventType}
                emotionalTone={memory.emotionalTone}
                firstPal={{
                  name: firstPal.name,
                  species: requireRenderableSpecies(firstPal.speciesId),
                  paletteId: firstPal.appearance.paletteId,
                  markingId: firstPal.appearance.markingId,
                  accessoryId: firstPal.appearance.accessoryId,
                  artIdentity: firstPal.artIdentity,
                  expression: memory.emotionalTone === 'calm' ? 'content' : 'delighted',
                  pose: memory.eventType === 'first-shared-activity' ? 'playful' : 'standing'
                }}
                companion={companion
                  ? {
                      name: companion.name,
                      species: requireRenderableSpecies(companion.speciesId),
                      paletteId: companion.appearance.paletteId,
                      markingId: companion.appearance.markingId,
                      accessoryId: companion.appearance.accessoryId,
                      artIdentity: companion.artIdentity,
                      expression: 'delighted',
                      pose: memory.eventType === 'first-shared-activity' ? 'playful' : 'standing'
                    }
                  : undefined}
              />
              <div className="journal-copy">
                <span className="memory-meta">Day {memory.worldDay + 1} · {participantNames(world, memory)}</span>
                <h2>{memory.title}</h2>
                <p>{memory.summary}</p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
