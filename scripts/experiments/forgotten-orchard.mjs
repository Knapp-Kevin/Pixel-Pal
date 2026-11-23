// Pixel Pals E0: experimental fixture and validator. Not imported by production.
export const MODES = Object.freeze(['touch', 'keyboard', 'reduced-motion']);
const LANDMARKS = Object.freeze(['home', 'arrival', 'fork', 'channel', 'caretaker']);
const PATHS = Object.freeze([
  ['home', 'arrival'], ['arrival', 'fork'],
  ['fork', 'channel'], ['fork', 'caretaker']
]);
const ACTIONS = Object.freeze([
  { id: 'restore-channel', at: 'channel', requires: [],
    modes: MODES, effectId: 'orchard-water-flow-restored', memoryTag: 'shared-care' },
  { id: 'recover-caretaker-story', at: 'caretaker', requires: [],
    modes: MODES, effectId: 'orchard-caretaker-story-recovered', memoryTag: 'shared-discovery' }
]);

export const ORCHARD_FIXTURE = Object.freeze({
  id: 'forgotten-orchard-e0', version: 1,
  landmarks: LANDMARKS, paths: PATHS, actions: ACTIONS
});
export const PARTIES = Object.freeze([
  Object.freeze({ id: 'care-team', companions: [
    { id: 'patient-pal', style: 'thoughtful', willing: true },
    { id: 'builder-pal', style: 'hands-on', willing: true }
  ], items: [] }),
  Object.freeze({ id: 'discovery-team', companions: [
    { id: 'curious-pal', style: 'observant', willing: true },
    { id: 'playful-pal', style: 'playful', willing: true }
  ], items: [] })
]);

function isId(value) {
  return typeof value === 'string' && /^[a-z][a-z0-9-]{0,63}$/.test(value);
}

function neighbors(region, from) {
  const result = [];
  for (const path of region.paths) {
    if (path[0] === from) result.push(path[1]);
    if (path[1] === from) result.push(path[0]);
  }
  return result;
}

export function route(region, from, to) {
  if (!region.landmarks.includes(from) || !region.landmarks.includes(to)) return null;
  const explored = new Set([from]);
  const pending = [[from]];
  while (pending.length) {
    const path = pending.shift();
    const tail = path[path.length - 1];
    if (tail === to) return path;
    for (const next of neighbors(region, tail)) {
      if (!explored.has(next)) {
        explored.add(next);
        pending.push([...path, next]);
      }
    }
  }
  return null;
}

function errorsFor(region, party, mode) {
  const errors = [];
  if (!region || !Array.isArray(region.landmarks) || !Array.isArray(region.paths) || !Array.isArray(region.actions)) {
    return ['invalid-region-shape'];
  }
  if (!Number.isSafeInteger(region.version) || region.version < 1) errors.push('invalid-version');
  if (region.landmarks.length !== new Set(region.landmarks).size ||
      !region.landmarks.every(isId) || !region.landmarks.includes('home') || !region.landmarks.includes('arrival')) {
    errors.push('invalid-landmarks');
  }
  for (const path of region.paths) {
    if (!Array.isArray(path) || path.length !== 2 || path[0] === path[1] ||
        !path.every((id) => region.landmarks.includes(id))) errors.push('invalid-path');
  }
  for (const landmark of region.landmarks) {
    if (!route(region, landmark, 'home')) errors.push('no-safe-return:' + landmark);
  }
  if (!party || !Array.isArray(party.companions) || party.companions.length !== 2 ||
      party.companions.some((pal) => !isId(pal.id)) ||
      new Set(party.companions.map((pal) => pal.id)).size !== 2) errors.push('invalid-party');
  if (party?.companions?.some((pal) => pal.willing !== true)) errors.push('unwilling-companion');
  if (!Array.isArray(party?.items)) errors.push('invalid-inventory');
  if (!MODES.includes(mode)) errors.push('unsupported-mode');
  const actionIds = new Set();
  const effects = new Set();
  let feasible = 0;
  for (const action of region.actions) {
    if (!isId(action.id) || actionIds.has(action.id)) errors.push('invalid-action-id');
    actionIds.add(action.id);
    if (!region.landmarks.includes(action.at) || !route(region, 'arrival', action.at)) errors.push('unreachable-action:' + action.id);
    if (!isId(action.effectId) || effects.has(action.effectId) || !isId(action.memoryTag)) errors.push('invalid-effect:' + action.id);
    effects.add(action.effectId);
    if (!Array.isArray(action.modes) || !MODES.every((m) => action.modes.includes(m))) errors.push('inaccessible-action:' + action.id);
    if (!Array.isArray(action.requires) || !action.requires.every(isId)) errors.push('invalid-requirements:' + action.id);
    const items = party?.items ?? [];
    if (Array.isArray(items) && Array.isArray(action.requires) && action.requires.every((req) => items.includes(req)) &&
        Array.isArray(action.modes) && action.modes.includes(mode) && route(region, 'arrival', action.at)) feasible++;
  }
  if (feasible < 2) errors.push('no-meaningful-choice');
  return [...new Set(errors)].sort();
}

export function validateRegion(region, party, mode) {
  const errors = errorsFor(region, party, mode);
  return { ok: errors.length === 0, errors };
}

function hashSeed(seed) {
  let x = seed >>> 0;
  x ^= x << 13; x ^= x >>> 17; x ^= x << 5;
  return x >>> 0;
}

export function composeOrchard(seed, party, mode, region = ORCHARD_FIXTURE) {
  if (!Number.isSafeInteger(seed) || seed < 0 || seed > 0xffffffff) throw new Error('invalid-seed');
  const check = validateRegion(region, party, mode);
  if (!check.ok) throw new Error(check.errors.join(','));
  const weather = ['misted-morning', 'soft-sun', 'silver-clouds'][hashSeed(seed) % 3];
  return {
    recipeId: region.id, recipeVersion: region.version, seed, weather,
    partyId: party.id, companionIds: party.companions.map((c) => c.id),
    paths: region.paths.map((p) => [...p]),
    choices: region.actions.map(({ id, at, effectId }) => ({ id, at, effectId }))
  };
}

export function runOrchard(region, party, mode, choiceId, snapshot, seed = 123) {
  const proposed = composeOrchard(seed, party, mode, region);
  if (choiceId === 'return-home') {
    return { proposed, status: 'returned-early', route: route(region, 'arrival', 'home'),
      events: [], memories: [], snapshot };
  }
  const action = region.actions.find((a) => a.id === choiceId);
  if (!action) throw new Error('unknown-choice');
  if (action.requires.some((req) => !party.items.includes(req))) throw new Error('missing-resource');
  if (!action.modes.includes(mode)) throw new Error('inaccessible-choice');
  const outbound = route(region, 'arrival', action.at);
  const homebound = route(region, action.at, 'home');
  if (!outbound || !homebound) throw new Error('route-unavailable');
  const event = { actionId: action.id, effectId: action.effectId, companions: [...proposed.companionIds] };
  const memory = {
    tag: action.memoryTag, actionId: action.id, effectId: action.effectId,
    participants: [...proposed.companionIds], partyReflection: party.companions.map((pal) => pal.style).join('+')
  };
  return { proposed, status: 'completed', route: [...outbound, ...homebound.slice(1)],
    events: [event], memories: [memory], snapshot };
}

// Recompute from observed action trace; retrospective memories are not authoritative.
export function verifyTrace(region, party, mode, result) {
  const check = validateRegion(region, party, mode);
  if (!check.ok) return false;
  if (result.status === 'returned-early') return result.events.length === 0 && result.memories.length === 0;
  if (result.status !== 'completed' || result.events.length !== 1 || result.memories.length !== 1) return false;
  const event = result.events[0];
  const memory = result.memories[0];
  const action = region.actions.find((candidate) => candidate.id === event.actionId);
  if (!action || action.effectId !== event.effectId || action.memoryTag !== memory.tag ||
      memory.actionId !== event.actionId || memory.effectId !== event.effectId) return false;
  const ids = party.companions.map((pal) => pal.id);
  return JSON.stringify(event.companions) === JSON.stringify(ids) &&
    JSON.stringify(memory.participants) === JSON.stringify(ids) &&
    memory.partyReflection === party.companions.map((pal) => pal.style).join('+') &&
    action.requires.every((req) => party.items.includes(req)) && action.modes.includes(mode) &&
    JSON.stringify(result.route) === JSON.stringify([
      ...route(region, 'arrival', action.at), ...route(region, action.at, 'home').slice(1)
    ]);
}
