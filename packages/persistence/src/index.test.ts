import { describe, expect, it } from 'vitest';
import { CURRENT_SCHEMA_VERSION } from '@pixel-pals/content-schema';
import { importWorld, MAX_WORLD_BACKUP_BYTES } from './index';

const legacyWorld = {
  schemaVersion: 1,
  worldId: 'backup-world',
  worldName: 'Backup World',
  seed: 7,
  worldDay: 0,
  firstPalId: 'pal-7-first',
  species: [{ id: 'fox', name: 'Fox', bodyFamily: 'canine', canonStatus: 'game' }],
  lineages: [],
  pals: [{
    id: 'pal-7-first',
    name: 'Pip',
    isFirstPal: true,
    lifeStage: 'youth',
    speciesId: 'fox',
    homeVillageId: 'willowmere',
    appearance: { bodyFamily: 'canine', paletteId: 'sunleaf', markingId: 'tail-tip' },
    preferences: [],
    characteristics: [],
    skills: [],
    createdBy: 'player'
  }],
  relationships: [],
  memories: [],
  villages: [{
    id: 'willowmere',
    name: 'Willowmere',
    regionId: 'willowmere-wood',
    greatTreeId: 'willowmere-great-tree',
    canonStatus: 'game',
    residentPalIds: ['pal-7-first'],
    visibleChanges: []
  }],
  greatTrees: [{
    id: 'willowmere-great-tree',
    villageId: 'willowmere',
    recognizedMemoryIds: [],
    visualHistoryMarkers: []
  }]
};

describe('world backup import', () => {
  it('validates and migrates a legacy backup', () => {
    const world = importWorld(JSON.stringify(legacyWorld));
    expect(world.schemaVersion).toBe(CURRENT_SCHEMA_VERSION);
    expect(world.homes).toHaveLength(1);
  });

  it('rejects invalid JSON without producing a partial world', () => {
    expect(() => importWorld('{not-json')).toThrow();
  });

  it('rejects oversized input before parsing', () => {
    const oversized = 'x'.repeat(MAX_WORLD_BACKUP_BYTES + 1);
    expect(() => importWorld(oversized)).toThrow(/too large/i);
  });
});
