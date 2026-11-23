import test from 'node:test';
import assert from 'node:assert/strict';
import { MODES, ORCHARD_FIXTURE, PARTIES, composeOrchard, route, runOrchard, validateRegion, verifyTrace } from './forgotten-orchard.mjs';

const clone = (obj) => structuredClone(obj);

test('a fixed seed and party always compose the same region', () => {
  const a = composeOrchard(992, PARTIES[0], 'touch');
  assert.deepEqual(a, composeOrchard(992, PARTIES[0], 'touch'));
  assert.equal(a.recipeVersion, 1);
});

test('all valid parties and accessibility modes support both meaningful outcomes and safe return', () => {
  let checked = 0;
  for (let seed = 0; seed < 1000; seed++) {
    for (const party of PARTIES) {
      for (const mode of MODES) {
        assert.deepEqual(validateRegion(ORCHARD_FIXTURE, party, mode), { ok: true, errors: [] });
        for (const action of ORCHARD_FIXTURE.actions) {
          const original = { memory: [], worldDay: 7, relationship: 'unchanged' };
          const result = runOrchard(ORCHARD_FIXTURE, party, mode, action.id, original, seed);
          assert.equal(result.snapshot, original);
          assert.equal(result.status, 'completed');
          assert.ok(verifyTrace(ORCHARD_FIXTURE, party, mode, result));
          assert.equal(result.route.at(-1), 'home');
          checked++;
        }
      }
    }
  }
  assert.equal(checked, 12000);
});

test('outcomes are semantically distinct and party reflections are grounded', () => {
  const region = ORCHARD_FIXTURE;
  const care = PARTIES[0];
  const investigation = PARTIES[1];
  const base = {};
  const water = runOrchard(region, care, 'touch', 'restore-channel', base);
  const history = runOrchard(region, care, 'touch', 'recover-caretaker-story', base);
  const otherParty = runOrchard(region, investigation, 'touch', 'restore-channel', base);
  assert.notEqual(water.events[0].effectId, history.events[0].effectId);
  assert.notEqual(water.memories[0].tag, history.memories[0].tag);
  assert.notEqual(water.memories[0].partyReflection, otherParty.memories[0].partyReflection);
  assert.notDeepEqual(water.memories[0].participants, otherParty.memories[0].participants);
});

test('gentle early return is always available and never invents an outcome or memory', () => {
  const value = { original: 'world-unchanged' };
  const early = runOrchard(ORCHARD_FIXTURE, PARTIES[0], 'keyboard', 'return-home', value);
  assert.equal(early.status, 'returned-early');
  assert.deepEqual(early.events, []);
  assert.deepEqual(early.memories, []);
  assert.equal(early.snapshot, value);
  assert.ok(verifyTrace(ORCHARD_FIXTURE, PARTIES[0], 'keyboard', early));
  for (const landmark of ORCHARD_FIXTURE.landmarks) assert.equal(route(ORCHARD_FIXTURE, landmark, 'home')?.at(-1), 'home');
});

test('rejects disconnected branches and missing return routes', () => {
  const region = clone(ORCHARD_FIXTURE);
  region.paths = [['home', 'arrival'], ['arrival', 'fork'], ['fork', 'channel']];
  const check = validateRegion(region, PARTIES[0], 'touch');
  assert.equal(check.ok, false);
  assert.ok(check.errors.some((error) => error.startsWith('no-safe-return:')));
});

test('rejects a required resource unavailable to the party', () => {
  const region = clone(ORCHARD_FIXTURE);
  region.actions[0].requires = ['rare-tool'];
  assert.ok(validateRegion(region, PARTIES[0], 'touch').errors.includes('no-meaningful-choice'));
});

test('rejects unwilling companions and cannot force an expedition to start', () => {
  const party = clone(PARTIES[0]);
  party.companions[1].willing = false;
  assert.ok(validateRegion(ORCHARD_FIXTURE, party, 'touch').errors.includes('unwilling-companion'));
  assert.throws(() => composeOrchard(0, party, 'touch'), /unwilling-companion/);
});

test('rejects timed or precision-only critical choices across accessible modes', () => {
  const region = clone(ORCHARD_FIXTURE);
  region.actions[1].modes = ['precision-drag'];
  assert.ok(validateRegion(region, PARTIES[0], 'reduced-motion').errors.some((e) => e.startsWith('inaccessible-action:')));
});

test('rejects duplicate effect identities and invalid action identifiers', () => {
  const region = clone(ORCHARD_FIXTURE);
  region.actions[1].effectId = region.actions[0].effectId;
  assert.ok(validateRegion(region, PARTIES[0], 'touch').errors.some((e) => e.startsWith('invalid-effect:')));
});

test('rejects invented, altered or other-party retrospective memory', () => {
  const actual = runOrchard(ORCHARD_FIXTURE, PARTIES[0], 'touch', 'restore-channel', {});
  const imagined = clone(actual);
  imagined.memories[0].actionId = 'recover-caretaker-story';
  assert.equal(verifyTrace(ORCHARD_FIXTURE, PARTIES[0], 'touch', imagined), false);
  const wrongCompanions = clone(actual);
  wrongCompanions.memories[0].participants = ['unknown-child'];
  assert.equal(verifyTrace(ORCHARD_FIXTURE, PARTIES[0], 'touch', wrongCompanions), false);
  const forgedRoute = clone(actual);
  forgedRoute.route = ['arrival', 'home'];
  assert.equal(verifyTrace(ORCHARD_FIXTURE, PARTIES[0], 'touch', forgedRoute), false);
});

test('does not mutate canonical-like snapshots or recipe fixtures', () => {
  const baseline = JSON.stringify(ORCHARD_FIXTURE);
  const party = JSON.stringify(PARTIES[0]);
  const snapshot = { memories: [{ id: 'pre-existing' }], friendships: { a: 0.4 } };
  const original = clone(snapshot);
  runOrchard(ORCHARD_FIXTURE, PARTIES[0], 'touch', 'restore-channel', snapshot);
  assert.deepEqual(snapshot, original);
  assert.equal(JSON.stringify(ORCHARD_FIXTURE), baseline);
  assert.equal(JSON.stringify(PARTIES[0]), party);
});
