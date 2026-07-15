import { describe, expect, it } from 'vitest';
import { CURRENT_SCHEMA_VERSION, parseWorld } from './index';

const versionTwoWorld = {
  schemaVersion: 2 as const,
  worldId: 'day-cycle-world',
  worldName: 'Day Cycle World',
  seed: 42,
  worldDay: 0,
  firstPalId: 'pal-first',
  species: [{ id: 'fox', name: 'Fox', bodyFamily: 'canine', canonStatus: 'game' as const }],
  lineages: [],
  pals: [{
    id: 'pal-first',
    name: 'Pip',
    isFirstPal: true,
    lifeStage: 'youth' as const,
    speciesId: 'fox',
    homeVillageId: 'willowmere',
    householdId: 'home-first',
    appearance: { bodyFamily: 'canine', paletteId: 'sunleaf', markingId: 'tail-tip' },
    preferences: [],
    characteristics: [],
    skills: [],
    createdBy: 'player' as const
  }],
  relationships: [],
  memories: [],
  homes: [{
    id: 'home-first',
    villageId: 'willowmere',
    residentPalIds: ['pal-first'],
    styleId: 'willowmere-roundhouse',
    visibleChanges: []
  }],
  villages: [{
    id: 'willowmere',
    name: 'Willowmere',
    regionId: 'willowmere-wood',
    greatTreeId: 'willowmere-great-tree',
    canonStatus: 'game' as const,
    residentPalIds: ['pal-first'],
    visibleChanges: []
  }],
  greatTrees: [{
    id: 'willowmere-great-tree',
    villageId: 'willowmere',
    recognizedMemoryIds: [],
    visualHistoryMarkers: []
  }]
};

function offeredSession(day = 1) {
  return {
    id: `day-16-${day}-session`,
    day,
    status: 'offered' as const,
    invitations: [
      {
        id: `day-16-${day}-quiet`,
        day,
        kind: 'quiet' as const,
        title: 'Sit Together',
        summary: 'Notice the village together.',
        villageId: 'willowmere',
        sourcePalId: 'pal-first',
        outcomeKey: 'quiet-visit'
      },
      {
        id: `day-16-${day}-help`,
        day,
        kind: 'helping' as const,
        title: 'Help the Village',
        summary: 'Care for one small corner of Willowmere.',
        villageId: 'willowmere',
        sourcePalId: 'pal-first',
        outcomeKey: 'village-help'
      }
    ]
  };
}

describe('repeatable day schema migration', () => {
  it('migrates a version 2 world with empty day history', () => {
    const migrated = parseWorld(versionTwoWorld);
    expect(migrated.schemaVersion).toBe(CURRENT_SCHEMA_VERSION);
    expect(migrated.daySessions).toEqual([]);
  });

  it('accepts one offered session for the next world day', () => {
    const current = parseWorld(versionTwoWorld);
    const withOffer = parseWorld({ ...current, daySessions: [offeredSession()] });
    expect(withOffer.daySessions[0]?.status).toBe('offered');
  });

  it('rejects an offered session that skips world days', () => {
    const current = parseWorld(versionTwoWorld);
    expect(() => parseWorld({ ...current, daySessions: [offeredSession(2)] })).toThrow(/immediately follow/i);
  });

  it('rejects more than one offered session', () => {
    const current = parseWorld(versionTwoWorld);
    expect(() => parseWorld({
      ...current,
      daySessions: [offeredSession(), { ...offeredSession(), id: 'another-session' }]
    })).toThrow(/more than one session|only one offered/i);
  });
});
