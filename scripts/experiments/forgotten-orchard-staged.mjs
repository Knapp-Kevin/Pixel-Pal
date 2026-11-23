// E0b: bounded multi-checkpoint adventure experiment. Not imported by Pixel Pals production.
// All state is a disposable test fixture; no Player World schema or persistence is changed.
export const STAGED_ORCHARD = Object.freeze({
  id: 'forgotten-orchard-staged', version: 1,
  landmarks: ['home', 'arrival', 'fork', 'channel', 'caretaker'],
  paths: [['home', 'arrival'], ['arrival', 'fork'], ['fork', 'channel'], ['fork', 'caretaker']],
  surveys: [
    { id: 'inspect-water', at: 'channel', clue: 'water-note' },
    { id: 'read-marker', at: 'caretaker', clue: 'keeper-note' }
  ],
  responses: [
    { id: 'restore-channel', at: 'channel', requires: ['water-note'], effectId: 'water-running', memoryTag: 'repaired-together' },
    { id: 'share-keeper-story', at: 'caretaker', requires: ['keeper-note'], effectId: 'tradition-shared', memoryTag: 'remembered-together' },
    { id: 'plan-return-visit', at: 'fork', requires: [], effectId: 'return-visit-planned', memoryTag: 'curiosity-together' }
  ]
});

export const STAGED_PARTIES = Object.freeze([
  { id: 'care', companions: [{ id: 'patient-pal', contribution: 'steadied' }, { id: 'builder-pal', contribution: 'crafted' }], willing: true },
  { id: 'discovery', companions: [{ id: 'curious-pal', contribution: 'noticed' }, { id: 'playful-pal', contribution: 'invited' }], willing: true }
]);

export const ACCESS_PROFILES = Object.freeze([
  { input: 'touch', reducedMotion: false },
  { input: 'touch', reducedMotion: true },
  { input: 'keyboard', reducedMotion: false },
  { input: 'keyboard', reducedMotion: true }
]);

const id = (value) => typeof value === 'string' && /^[a-z][a-z0-9-]{0,63}$/.test(value);
const json = (value) => JSON.stringify(value);
const copy = (value) => JSON.parse(json(value));
function requireValid(condition, code) { if (!condition) throw new Error(code); }

export function walk(region, from, to) {
  if (!region.landmarks.includes(from) || !region.landmarks.includes(to)) return null;
  const queue = [[from]];
  const visited = new Set([from]);
  for (let i = 0; i < queue.length; i++) {
    const path = queue[i];
    if (path.at(-1) === to) return path;
    for (const [a, b] of region.paths) {
      const next = a === path.at(-1) ? b : b === path.at(-1) ? a : null;
      if (next !== null && !visited.has(next)) { visited.add(next); queue.push([...path, next]); }
    }
  }
  return null;
}

export function validateStagedRecipe(region) {
  const errors = [];
  if (!region || !id(region.id) || region.version !== 1 ||
      !Array.isArray(region.landmarks) || !Array.isArray(region.paths) ||
      !Array.isArray(region.surveys) || !Array.isArray(region.responses)) return ['bad-shape'];
  if (region.landmarks.length < 3 || region.landmarks.length > 12 ||
      new Set(region.landmarks).size !== region.landmarks.length ||
      !region.landmarks.every(id) || !region.landmarks.includes('home') || !region.landmarks.includes('arrival')) errors.push('bad-landmarks');
  if (region.paths.length > 24 || region.paths.some((p) => !Array.isArray(p) || p.length !== 2 || p[0] === p[1] ||
    !p.every((x) => region.landmarks.includes(x)))) errors.push('bad-path');
  if (!errors.includes('bad-path')) for (const landmark of region.landmarks) {
    if (!walk(region, landmark, 'home')) errors.push('no-home-route:' + landmark);
  }
  const all = [...region.surveys, ...region.responses];
  if (region.surveys.length !== 2 || region.responses.length !== 3 ||
      all.some((a) => !id(a.id) || !region.landmarks.includes(a.at)) ||
      new Set(all.map((a) => a.id)).size !== all.length) errors.push('bad-actions');
  if (region.surveys.some((a) => !id(a.clue)) || new Set(region.surveys.map((a) => a.clue)).size !== 2) errors.push('bad-clues');
  if (region.responses.some((a) => !Array.isArray(a.requires) || !a.requires.every((x) => region.surveys.some((s) => s.clue === x)) ||
      !id(a.effectId) || !id(a.memoryTag)) ||
      new Set(region.responses.map((a) => a.effectId)).size !== region.responses.length) errors.push('bad-effects');
  // Every survey must permit the common gentler resolution and one distinct resolution.
  for (const survey of region.surveys) {
    const permitted = region.responses.filter((a) => a.requires?.every((x) => x === survey.clue));
    if (permitted.length < 2) errors.push('dead-end-after:' + survey.id);
  }
  return [...new Set(errors)].sort();
}

function validateAuthority(authority) {
  requireValid(authority?.recipe?.version === 1 && validateStagedRecipe(authority.recipe).length === 0, 'invalid-recipe');
  requireValid(Number.isSafeInteger(authority.seed) && authority.seed >= 0 && authority.seed <= 0xffffffff, 'invalid-seed');
  const party = authority.party;
  requireValid(party && id(party.id) && party.willing === true && Array.isArray(party.companions) &&
    party.companions.length === 2 && party.companions.every((p) => id(p.id) && id(p.contribution)) &&
    new Set(party.companions.map((p) => p.id)).size === 2, 'invalid-party');
  requireValid(['touch', 'keyboard'].includes(authority.access?.input) && typeof authority.access?.reducedMotion === 'boolean', 'invalid-access');
}

export function startStagedExpedition(authority) {
  validateAuthority(authority);
  return {
    recipeId: authority.recipe.id, recipeVersion: authority.recipe.version, seed: authority.seed,
    partyId: authority.party.id, companions: authority.party.companions.map((p) => p.id),
    access: copy(authority.access), checkpoint: 'survey', at: 'arrival',
    inventory: [], events: [], effect: null, memory: null, status: 'active'
  };
}

export function availableStagedActions(authority, state) {
  validateAuthority(authority);
  if (state.status !== 'active') return [];
  const options = state.checkpoint === 'survey' ? authority.recipe.surveys :
    state.checkpoint === 'response' ? authority.recipe.responses.filter((r) => r.requires.every((x) => state.inventory.includes(x))) :
    state.checkpoint === 'return' ? [{ id: 'go-home', at: 'home' }] : [];
  return [...options.map((x) => x.id), 'return-early'];
}

// A pure transition: never trust client-supplied details of an event or memory.
function advanceUnchecked(authority, state, actionId) {
  validateAuthority(authority);
  requireValid(state?.status === 'active' && availableStagedActions(authority, state).includes(actionId), 'action-refused');
  requireValid(state.recipeId === authority.recipe.id && state.recipeVersion === authority.recipe.version &&
    state.seed === authority.seed && state.partyId === authority.party.id &&
    json(state.companions) === json(authority.party.companions.map((x) => x.id)) &&
    json(state.access) === json(authority.access), 'authority-mismatch');
  const region = authority.recipe;
  if (actionId === 'return-early') {
    const path = walk(region, state.at, 'home');
    requireValid(path !== null, 'route-blocked');
    return { ...state, checkpoint: 'done', status: 'returned-early', at: 'home',
      events: [...state.events, { actionId, checkpoint: state.checkpoint, path }],
      pending: null, effect: null, memory: null };
  }
  const action = [...region.surveys, ...region.responses, { id: 'go-home', at: 'home' }].find((x) => x.id === actionId);
  requireValid(action !== undefined, 'unknown-action');
  const path = walk(region, state.at, action.at);
  requireValid(path !== null, 'route-blocked');
  const events = [...state.events, { checkpoint: state.checkpoint, actionId, path }];
  if (state.checkpoint === 'survey') {
    return { ...state, at: action.at, checkpoint: 'response', inventory: [...state.inventory, action.clue], events };
  }
  if (state.checkpoint === 'response') {
    return { ...state, at: action.at, checkpoint: 'return', events,
      // Proposed only. No canonical effect is applied until safe return.
      pending: { actionId, effectId: action.effectId, memoryTag: action.memoryTag } };
  }
  const survey = region.surveys.find((a) => a.id === state.events[0]?.actionId);
  requireValid(survey && state.pending, 'incomplete-history');
  const signature = authority.party.companions.map((p) => p.contribution).join('+');
  return { ...state, at: 'home', checkpoint: 'done', status: 'completed', events,
    effect: state.pending.effectId,
    memory: { tag: state.pending.memoryTag, survey: survey.id, response: state.pending.actionId,
      companions: authority.party.companions.map((p) => p.id), contribution: signature }, pending: null };
}

export function replayStagedExpedition(authority, recordedActions) {
  requireValid(Array.isArray(recordedActions) && recordedActions.length <= 3 && recordedActions.every(id), 'invalid-trace');
  return recordedActions.reduce((current, action) => advanceUnchecked(authority, current, action), startStagedExpedition(authority));
}

// Reject inconsistent claimed checkpoints before applying an action. The caller is still
// responsible for independently storing the canonical trace; this is not authentication.
export function stepStagedExpedition(authority, state, actionId) {
  requireValid(Array.isArray(state?.events) && state.events.length <= 2, 'invalid-checkpoint');
  const trace = state.events.map((event) => event?.actionId);
  requireValid(trace.every(id), 'invalid-checkpoint');
  let replayed;
  try { replayed = replayStagedExpedition(authority, trace); }
  catch { throw new Error('checkpoint-mismatch'); }
  requireValid(json(replayed) === json(state), 'checkpoint-mismatch');
  return advanceUnchecked(authority, state, actionId);
}

// Authority and actions are supplied independently, not taken from the claimed state.
// This proves repeatability/consistency, not tamper-evident storage or authentication.
export function verifyStagedCheckpoint(authority, recordedActions, claimed) {
  try { return json(replayStagedExpedition(authority, recordedActions)) === json(claimed); }
  catch { return false; }
}
