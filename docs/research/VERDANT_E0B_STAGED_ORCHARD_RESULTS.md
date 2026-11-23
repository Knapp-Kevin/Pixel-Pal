# E0b Results: Multi-Checkpoint Forgotten Orchard

**Status:** LOCALLY EXECUTED, 13/13 tests passed. **Integration:** experiment-only, NOT shipped gameplay.
**Date:** 2026-11-23
**Pixel Pals starting main:** d28d57632e8b999ee0e574df87943e96331f4a5f
**Code:** scripts/experiments/forgotten-orchard-staged.mjs
**Tests:** scripts/experiments/forgotten-orchard-staged.test.mjs
**Tracker:** https://github.com/Knapp-Kevin/Pixel-Pal/issues/115
**Previous baseline:** docs/research/VERDANT_E0_FORGOTTEN_ORCHARD_RESULTS.md

## Tested goal and boundaries

Continue E0 beyond one-step outcomes: validate a bounded, three-checkpoint companion expedition and its event history without importing Verdant or mutating the Pixel Pals World schema. Preserve the M2 tablet-alpha priority and existing storybook route.

The experiment defines five named landmarks, two survey choices, three authored responses (two clue-specific and one nonpunitive alternative), and a required home-return action before a proposed world effect or memory is finalized. It has two fixture companion groups and four orthogonal accessibility test configurations: touch or keyboard input, each with reduced-motion enabled or disabled.

The states are **ephemeral test objects**, not actual game saves. The words 'inventory', 'effect', and 'memory' describe fixture fields, not canonical content-schema entries.

## Evidence and measured outcomes

Executed in the local container with **Node v22.16.0**:

    node --test scripts/experiments/forgotten-orchard-staged.test.mjs

**Observed:** 13 tests passed, 0 failed, 0 skipped; test-runner duration approximately **0.64 seconds**. Main matrix: **128 seeds × 2 parties × 4 access combinations × 2 survey choices × 2 eligible resolutions = 4,096 completed routes**. For each route, deterministic replay yielded three events, companion-matched reflections, and a valid return home.

Additional positive evidence: JSON serialize/parse/resume from survey checkpoint equals uninterrupted execution; complete and early-return traces can be replayed; the same player decisions with two different teams produce different trace-grounded contribution metadata; pending effects remain null until the final home-return action.

Adversarial negative tests: disconnection, duplicate effects, a disabled alternative leaving a dead end, missing clue/guarded response, companion refusal, unsupported precision-only control mode, premature return-to-finalize, unknown action, too-long trace, forged seed, version, party identity, path and memory, fabricated inventory and altered pending outcome. Malformed claimed checkpoints fail against recomputed history before a transition is allowed.

**Source integrity:** The two GitHub-uploaded UTF-8 files have byte lengths **9,845** and **8,821**, and their CRC32 checksums **8e346cdb** and **82190ec9** match those of the exact files run locally. CRC32 is a transfer-equivalence check, not a security signature.

## Adversarial correction applied

A critical subtlety is that replay against a caller-supplied trace proves **consistency**, not the authenticity of that trace. A malicious or corrupted caller can manufacture a *different internally consistent* trace unless the durable authoritative system independently stores event acceptance and version/seed. Accordingly:

- Public test-only state transitions reject a claimed checkpoint unless its event sequence replays to the same entire checkpoint object.
- Independent verification accepts authority and recorded actions *separately* from claimed state.
- No claim of cryptographic integrity, actual IndexedDB resume, atomic effect application, save migration, rejection of all possible malicious states, or child identity assurance is made.
- For real game integration, the canonical TypeScript simulation and existing persistence must own the commit and deduplication decision, with replayable version-pinned event history and crash-safe atomicity.

## Interpretation

**E0b PASS for a guarded multi-checkpoint prototype**: a party can investigate, choose an available response, and return home; branches have distinguishable effects and trace-bound memories; every checkpoint allows a gentle exit with no invented committed effect.

**Not a player-experience PASS:** There is no child-facing text/UI, art, map, emotional dialogue, observed family play or real Pal agency beyond labels/contribution descriptors. This proves consistency of authored action options, not quality of generated adventures. Accessibility checks are simplified mode combinations, not actual assistive-tech testing. Geometry is a five-node undirected graph, not a moving 3D world or NavMesh.

The *next Pixel Pals proof* is a controlled authored-versus-generated story variant in the actual tablet UX, with human-reviewed wording, age-readability, acceptance under real save/reload and child observation, but only after M2 commitments permit it.

## Verdant G0 status, checked again

**Verdant source HEAD inspected:** [v2.20.0, a51262d2008b030b290f70cd0b39a080f72cb4e9](https://github.com/afflom/verdant-engine/commit/a51262d2008b030b290f70cd0b39a080f72cb4e9), 2026-11-23.

- [Bootstrap 45218483657](https://github.com/afflom/verdant-engine/actions/runs/45218483657): Linux x86 acceptance **passed**; Linux ARM acceptance **failed** in the locked SDK template gate. ARM logs identify a C++ **ggml-vector-oracle build failure** in ggml-cpu ops.cpp, including missing vector helper definitions. This is **different** from v2.19's 10 failing tensor tests. The new v2.20 changes have not proven successful cross-architecture qualification.
- [Pages 45218483481](https://github.com/afflom/verdant-engine/actions/runs/45218483481): **failed** at FR-03 first-visit weight check; the publish job was skipped. The previous content-persona check was not the latest failure.
- Local environment check: Node v22.16.0 available. No rustc or cargo binaries. GitHub domain lookup fails from the container. GitHub connector permits pinned source and Actions-log inspection, but **cannot independently execute cargo**. Therefore no independent Verdant Rust compilation, GLB generation, reproducible hash or tablet image was produced.
- Do not infer failure of every ARM tablet or renderer from a host-side C++ oracle build failure alone. Equally, do not call v2.20 fully qualified until the exact required gates are green and independent build/export proof is collected.

**G0 remains BLOCKED / NOT PASSED**. Avoid using the latest upstream moving main as an integration pin. Avoid additional Pixel Pals CI experiments purely to chase an upstream failure.

## Scope decision and next gate

No external engine dependency, Wasm, art candidate, saved-world schema, production adventure, runtime prompt system, network call or CI workflow is added.

Suggested next decisions:

1. Preserve E0/E0b as a bounded local validation pattern, not product functionality.
2. Obtain a reproducible exact-SHA Verdant build and static GLB export in a Rust-capable environment; compare the same scene twice with measured artifact hashes, then inspect painterly quality.
3. Run a real tablet proof before any optional live renderer decision. Separate art production and Family Tablet Alpha obligations continue.
