import type { Memory, Pal, World } from '@pixel-pals/content-schema';
import { StorybookMemoryScene, type PalSpecies } from '@pixel-pals/renderer';

export type MemoryJournalProps = {
  world: World;
  firstPal: Pal;
};

function renderableSpecies(speciesId: string): PalSpecies {
  if (speciesId === 'deer' || speciesId === 'rabbit' || speciesId === 'cat' || speciesId === 'duck') {
    return speciesId;
  }

  return 'fox';
}

function participantNames(world: World, memory: Memory): string {
  return memory.participantPalIds
    .map((palId) => world.pals.find((pal) => pal.id === palId)?.name)
    .filter((name): name is string => Boolean(name))
    .join(' and ');
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
          const includesFern = memory.participantPalIds.some(
            (palId) => world.pals.find((pal) => pal.id === palId)?.name === 'Fern'
          );

          return (
            <article className="journal-entry" key={memory.id}>
              <StorybookMemoryScene
                eventType={memory.eventType}
                emotionalTone={memory.emotionalTone}
                firstPal={{
                  name: firstPal.name,
                  species: renderableSpecies(firstPal.speciesId),
                  paletteId: firstPal.appearance.paletteId,
                  markingId: firstPal.appearance.markingId,
                  accessoryId: firstPal.appearance.accessoryId,
                  expression: memory.emotionalTone === 'calm' ? 'content' : 'delighted',
                  pose: memory.eventType === 'first-shared-activity' ? 'playful' : 'standing'
                }}
                companion={includesFern
                  ? {
                      name: 'Fern',
                      species: 'rabbit',
                      paletteId: 'mosscream',
                      markingId: 'ear-dapple',
                      accessoryId: 'leaf-pin',
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
