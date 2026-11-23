import test from 'node:test';
import assert from 'node:assert/strict';
import {
  STAGED_ORCHARD, STAGED_PARTIES, ACCESS_PROFILES, validateStagedRecipe,
  startStagedExpedition, availableStagedActions, stepStagedExpedition,
  replayStagedExpedition, verifyStagedCheckpoint, walk
} from './forgotten-orchard-staged.mjs';
const copy = structuredClone;
const authority = (party = STAGED_PARTIES[0], access = ACCESS_PROFILES[0], seed = 54, recipe = STAGED_ORCHARD) =>
  ({ party, access, seed, recipe });

test('fixture is structurally sound with return paths for every landmark', () => {
  assert.deepEqual(validateStagedRecipe(STAGED_ORCHARD), []);
  for (const place of STAGED_ORCHARD.landmarks) assert.equal(walk(STAGED_ORCHARD, place, 'home')?.at(-1), 'home');
});

test('each survey permits two guarded outcomes for both parties and orthogonal access modes', () => {
  let checked = 0;
  for (let seed = 0; seed < 128; seed++) for (const party of STAGED_PARTIES) for (const access of ACCESS_PROFILES) {
    const a = authority(party, access, seed);
    for (const survey of STAGED_ORCHARD.surveys) {
      const first = stepStagedExpedition(a, startStagedExpedition(a), survey.id);
      const eligible = availableStagedActions(a, first).filter((x) => x !== 'return-early');
      assert.equal(eligible.length, 2);
      for (const resolution of eligible) {
        const trace = [survey.id, resolution, 'go-home'];
        const done = replayStagedExpedition(a, trace);
        assert.equal(done.status, 'completed');
        assert.equal(done.at, 'home');
        assert.deepEqual(done.companions, party.companions.map((x) => x.id));
        assert.deepEqual(done.memory.companions, done.companions);
        assert.equal(done.events.length, 3);
        assert.equal(done.memory.survey, survey.id);
        assert.equal(done.memory.response, resolution);
        assert.equal(verifyStagedCheckpoint(a, trace, copy(done)), true);
        checked++;
      }
    }
  }
  assert.equal(checked, 4096);
});

test('surveys are consequential: water clue cannot unlock keeper story and vice versa', () => {
  const a = authority();
  const water = replayStagedExpedition(a, ['inspect-water']);
  const marker = replayStagedExpedition(a, ['read-marker']);
  assert.ok(availableStagedActions(a, water).includes('restore-channel'));
  assert.ok(!availableStagedActions(a, water).includes('share-keeper-story'));
  assert.ok(availableStagedActions(a, marker).includes('share-keeper-story'));
  assert.ok(!availableStagedActions(a, marker).includes('restore-channel'));
  assert.throws(() => stepStagedExpedition(a, water, 'share-keeper-story'), /action-refused/);
});

test('each checkpoint can terminate gently without fabricating a memory or effect', () => {
  const a = authority();
  for (const prefix of [[], ['read-marker'], ['read-marker', 'share-keeper-story']]) {
    const state = replayStagedExpedition(a, prefix);
    const after = stepStagedExpedition(a, state, 'return-early');
    assert.equal(after.status, 'returned-early');
    assert.equal(after.at, 'home');
    assert.equal(after.memory, null);
    assert.equal(after.effect, null);
    assert.equal(after.pending, null);
    assert.equal(verifyStagedCheckpoint(a, [...prefix, 'return-early'], after), true);
  }
});

test('a pending outcome is not a world effect until the return checkpoint', () => {
  const a = authority();
  const pending = replayStagedExpedition(a, ['inspect-water', 'restore-channel']);
  assert.equal(pending.status, 'active');
  assert.equal(pending.effect, null);
  assert.equal(pending.memory, null);
  assert.equal(pending.pending.effectId, 'water-running');
  const done = stepStagedExpedition(a, pending, 'go-home');
  assert.equal(done.effect, 'water-running');
  assert.equal(done.memory.tag, 'repaired-together');
  assert.equal(done.events.at(-1).actionId, 'go-home');
});

test('different companion personalities alter grounded reflection without inventing events', () => {
  const trace = ['inspect-water', 'restore-channel', 'go-home'];
  const care = replayStagedExpedition(authority(STAGED_PARTIES[0]), trace);
  const discovery = replayStagedExpedition(authority(STAGED_PARTIES[1]), trace);
  assert.equal(care.effect, discovery.effect);
  assert.notEqual(care.memory.contribution, discovery.memory.contribution);
  assert.notDeepEqual(care.memory.companions, discovery.memory.companions);
  assert.deepEqual(care.events.map((x) => x.actionId), discovery.events.map((x) => x.actionId));
});

test('JSON round-trip checkpoint resume reproduces complete event and memory', () => {
  const a = authority(STAGED_PARTIES[1], ACCESS_PROFILES[3], 128);
  const prefix = ['read-marker'];
  const recorded = JSON.parse(JSON.stringify(replayStagedExpedition(a, prefix)));
  assert.ok(verifyStagedCheckpoint(a, prefix, recorded));
  const resumed = stepStagedExpedition(a, recorded, 'share-keeper-story');
  const done = stepStagedExpedition(a, resumed, 'go-home');
  assert.deepEqual(done, replayStagedExpedition(a, [...prefix, 'share-keeper-story', 'go-home']));
  assert.ok(verifyStagedCheckpoint(a, [...prefix, 'share-keeper-story', 'go-home'], done));
});

test('replay refuses forged recorded actions, versions, seeds and claimed memories', () => {
  const a = authority();
  const trace = ['inspect-water', 'restore-channel', 'go-home'];
  const done = replayStagedExpedition(a, trace);
  const forged = copy(done); forged.memory.tag = 'imaginary-legend';
  assert.equal(verifyStagedCheckpoint(a, trace, forged), false);
  const seed = copy(done); seed.seed++;
  assert.equal(verifyStagedCheckpoint(a, trace, seed), false);
  const version = copy(done); version.recipeVersion++;
  assert.equal(verifyStagedCheckpoint(a, trace, version), false);
  const party = copy(done); party.companions[0] = 'imposter';
  assert.equal(verifyStagedCheckpoint(a, trace, party), false);
  const path = copy(done); path.events[1].path = ['home'];
  assert.equal(verifyStagedCheckpoint(a, trace, path), false);
  assert.equal(verifyStagedCheckpoint(a, ['restore-channel', 'go-home'], done), false);
  assert.equal(verifyStagedCheckpoint(a, ['inspect-water', 'share-keeper-story', 'go-home'], done), false);
});

test('rejects companion refusal and incorrect accessibility configuration', () => {
  const p = copy(STAGED_PARTIES[0]); p.willing = false;
  assert.throws(() => startStagedExpedition(authority(p)), /invalid-party/);
  assert.throws(() => startStagedExpedition(authority(STAGED_PARTIES[0], { input: 'precision-drag', reducedMotion: false })), /invalid-access/);
});

test('replay must refuse premature go-home, extra commands and unknown actions', () => {
  const a = authority();
  assert.throws(() => replayStagedExpedition(a, ['go-home']), /action-refused/);
  assert.throws(() => replayStagedExpedition(a, ['read-marker', 'go-home']), /action-refused/);
  assert.throws(() => replayStagedExpedition(a, ['read-marker', 'share-keeper-story', 'go-home', 'restore-channel']), /invalid-trace/);
  assert.throws(() => replayStagedExpedition(a, ['read-marker', 'totally-imaginary']), /action-refused/);
});

test('validator rejects disconnected region, duplicate effects, missing alternate solution', () => {
  const broken = copy(STAGED_ORCHARD); broken.paths.pop();
  assert.ok(validateStagedRecipe(broken).some((x) => x.startsWith('no-home-route')));
  const duplicate = copy(STAGED_ORCHARD); duplicate.responses[1].effectId = duplicate.responses[0].effectId;
  assert.ok(validateStagedRecipe(duplicate).includes('bad-effects'));
  const deadend = copy(STAGED_ORCHARD); deadend.responses[2].requires = ['keeper-note'];
  assert.ok(validateStagedRecipe(deadend).includes('dead-end-after:inspect-water'));
});

test('staged runner does not mutate its inputs or original state', () => {
  const a = authority();
  const original = copy(a);
  const first = startStagedExpedition(a);
  const unchanged = copy(first);
  stepStagedExpedition(a, first, 'inspect-water');
  assert.deepEqual(a, original);
  assert.deepEqual(first, unchanged);
});

test('forged inventory and pending outcome are refused at the checkpoint boundary', () => {
  const a = authority();
  const first = replayStagedExpedition(a, ['read-marker']);
  const forgedItems = copy(first);
  forgedItems.inventory.push('water-note');
  assert.throws(() => stepStagedExpedition(a, forgedItems, 'restore-channel'), /checkpoint-mismatch/);
  const pending = replayStagedExpedition(a, ['read-marker', 'share-keeper-story']);
  const forgedOutcome = copy(pending);
  forgedOutcome.pending.effectId = 'imagined-effect';
  assert.throws(() => stepStagedExpedition(a, forgedOutcome, 'go-home'), /checkpoint-mismatch/);
  const forgedEvent = copy(first);
  forgedEvent.events[0].actionId = 'inspect-water';
  assert.throws(() => stepStagedExpedition(a, forgedEvent, 'plan-return-visit'), /checkpoint-mismatch/);
});
