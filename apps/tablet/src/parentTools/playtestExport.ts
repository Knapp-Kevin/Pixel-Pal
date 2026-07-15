import type { World } from '@pixel-pals/content-schema';

export type ObservationNotes = {
  hesitation: string;
  delight: string;
  repeated: string;
  misunderstood: string;
  rememberedLater: string;
  observerSummary: string;
};

export const emptyNotes: ObservationNotes = {
  hesitation: '',
  delight: '',
  repeated: '',
  misunderstood: '',
  rememberedLater: '',
  observerSummary: ''
};

export const observationPrompts: Array<[keyof ObservationNotes, string]> = [
  ['hesitation', 'Where did the child hesitate?'],
  ['delight', 'What caused visible delight or laughter?'],
  ['repeated', 'What did the child repeat without prompting?'],
  ['misunderstood', 'What did the child misunderstand?'],
  ['rememberedLater', 'What did the child remember later?'],
  ['observerSummary', 'Observer summary']
];

export function downloadText(filename: string, content: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function safeFilename(value: string): string {
  const normalized = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return normalized || 'pixel-pals-world';
}

export function firstPalName(world: World): string {
  return world.pals.find((pal) => pal.id === world.firstPalId)?.name ?? 'Unknown';
}

export function notesDocument(world: World, notes: ObservationNotes): string {
  const firstPal = world.pals.find((pal) => pal.id === world.firstPalId);

  return `# Pixel Pals Playtest Notes

- World: ${world.worldName}
- First Pal: ${firstPal?.name ?? 'Unknown'}
- Species: ${firstPal?.speciesId ?? 'Unknown'}
- Memories created: ${world.memories.length}
- World ID: ${world.worldId}

## Where did the child hesitate?

${notes.hesitation || 'Not recorded.'}

## What caused visible delight or laughter?

${notes.delight || 'Not recorded.'}

## What did the child repeat without prompting?

${notes.repeated || 'Not recorded.'}

## What did the child misunderstand?

${notes.misunderstood || 'Not recorded.'}

## What did the child remember later?

${notes.rememberedLater || 'Not recorded.'}

## Observer summary

${notes.observerSummary || 'Not recorded.'}
`;
}
