# E0 Experiment Report: Forgotten Orchard Expedition Validator

**Status:** EXECUTED, experimental logic only. Production gameplay / Verdant adoption: **NOT APPROVED**
**Date:** 2026-11-23
**Pixel Pals baseline:** 2fa3f2541c0b5dedc528c7e36f9241b64ae04590
**Code:** scripts/experiments/forgotten-orchard.mjs and forgotten-orchard.test.mjs
**Tracker:** https://github.com/Knapp-Kevin/Pixel-Pal/issues/115
**Architecture boundary:** docs/architecture/ADR-VR-001-VERDANT-INTEGRATION.md

## Objective

Test **E0 before importing an external engine**. Can a tiny, deterministic expedition candidate select landmarks and alternative outcomes, reject clearly impossible choices, provide safe return paths, and produce only memories supported by a real selected action? This is a **fixture experiment**, not the product implementation of the emergent expedition design.

## Execution and observed results

Using Node 22 and the built-in node:test runner in the execution environment:

    node --test scripts/experiments/forgotten-orchard.test.mjs

**Result: 11 of 11 test cases passed, zero failed, approximately 0.51 seconds**, after fixing the adversarial test described below.

The main matrix executed **1,000 seeds × 2 fixture companion groups × 3 simplified accessibility test profiles × 2 distinct adventure outcome actions = 12,000 outcome traces**. Each checked structural recipe validation, a path from invitation to outcome to home, memory/effect/action consistency, and no mutation of the input snapshot object. The first two group identities are synthetic fixtures and establish no new Pixel Pals canon.

Negative fixtures tested and correctly rejected:

- A disconnected landmark / absent safe return path.
- One outcome requiring a resource absent from the party, leaving fewer than two feasible choices.
- An unwilling companion.
- An outcome accessible only through an unsupported precision-drag interaction.
- A duplicate world-effect identity.
- A retrospective memory for an unplayed action, with the wrong participants, or a fabricated completed route.
- An early return altered to claim an invalid path.
- A composition seed altered from an independently supplied recorded seed.

A second independent run **evaluated the exact GitHub-committed module source** (with export keywords removed for execution in the isolated JS runner) across all 12,000 traces and a representative set of adversarial counterexamples. It passed. This is additional logic evidence, not a substitute for the Node test runner or repository CI.

## Adversarial iteration and actual bug caught

A new negative test tried changing the returned record's seed from 123 to 77. The initial checker accepted it: the displayed weather was coincidentally the same for both seeds, and the verifier had no *external seed authority*. A self-reported proposed seed cannot authenticate itself. The first adversarial rerun therefore **failed one of eleven tests**. This was **not** a production bug.

**Correction:** verifyTrace now optionally takes an independently recorded seed and compares it with the proposal; it also recomputes the composed scene descriptor and validates even the early-return route. The exact updated local suite was rerun and **passed 11/11**.

**Design consequence:** The real save format must own recipe ID, recipe/content version, seed, choices and event evidence. A renderer, generator or submitted recap cannot supply its own history as authority. This code does *not* provide cryptographic integrity, durable save integrity or anti-tamper guarantees.

## Limits: what these numbers do NOT establish

- This is a **five-landmark, undirected, unweighted graph**, not terrain traversal or a full dynamic navigation mesh. No barriers, directed routes, hazards, NPC locomotion, mixed physical accessibility constraints or changing world-day routes are simulated.
- Two short **outcome identifiers** and distinct reflection metadata are not demonstrated emotional depth or actual child-recognizable story variety. The same party can choose either path, but meaningful differences in gameplay are still untested.
- Only a **single resolved choice** is executed per simulated expedition. There is no persistent multi-checkpoint story-state automaton, in-game invitation, companion-selection UI, play session, real Pal personality model, or actual canonical memory commit.
- The three named test profiles (touch, keyboard, reduced motion) are **simplified fixtures**, not a complete or orthogonal accessibility model: reduced motion is a preference that may coexist with touch or keyboard. Assistive technology and actual screen-reader navigation remain untested.
- Returning the same snapshot object without changing it proves only **this helper does not mutate the provided object**. It does not demonstrate live Pixel Pals save parity, crash recovery, IndexedDB atomicity, migration, or rollback.
- Node success is not evidence of a real Android or iPad experience. No human-reviewed illustrations or actual-game experiments are present.

**E0 engineering result:** **PASS for a first isolated reachability/trace-grounding proof.** **NO-GO for claiming production-ready emergent adventures.** The next evidence step is a guarded multi-stage scenario with explicit accessibility alternatives, true party influence, version-pinned continuation, and comparisons with an authored baseline, after the current family-alpha commitments.

## Parallel G0: Verdant reproducibility feasibility status

**Execution blocker:** This environment has Node and GitHub source access through the connected service, but **does not have a Rust compiler or Cargo, and cannot resolve github.com from its local container**. A clean independent Verdant clone, cargo build, Wasm export, GLB generation and cross-platform benchmark **were not executed**. G0 must remain **BLOCKED / NOT PASSED**.

Most recent inspected Verdant main commit during this experiment:
[573cede903fdcb1330c9446aab6ec7204f519534](https://github.com/afflom/verdant-engine/commit/573cede903fdcb1330c9446aab6ec7204f519534), workspace v2.19.0. Cargo.lock changed its git pin revisions to:
- UOR matmul: c00aa3bb34bdc7e8b0348879b5c32b4e842b1c4a
- UOR compression: 88bfaf1d7ff1709b65c923966a009c9078720665

**Upstream CI observed on that exact head:**

- [Bootstrap run 45139983830](https://github.com/afflom/verdant-engine/actions/runs/45139983830): x86_64 Ubuntu accepted; **Ubuntu ARM failed**, in the locked SDK template gate. Relevant log showed the verdant-tensor library suite with **55 passed and 10 failed** in matrix products, packed words, float conversion and related assertions. This is a concrete ARM qualification blocker; the cause and applicability to Pixel Pals have not been independently determined.
- [Pages run 45139983962](https://github.com/afflom/verdant-engine/actions/runs/45139983962): **failed** in the site content-model gate because stakeholder Community Stitch Seeder and Host has no persona in model/content.json. Earlier ARIA token failure is *not* the recorded cause for this later run.

Older v2.18.0 baseline at SHA ba1425942f2cdc0f1d647df2fb71ab1e57bca507 had a [successful bootstrap](https://github.com/afflom/verdant-engine/actions/runs/45054808463) but a [failed Pages build](https://github.com/afflom/verdant-engine/actions/runs/45054808455). It is a more promising **candidate for a clean build experiment**, not an approved pin or proof of deployability. All transitive dependencies, exact source, visual output and device behavior still require independent verification.

**G0 conclusion:** **NO-GO for using v2.19 main as a claimed cross-platform-qualified release** and **NOT YET VERIFIED** for any integrated Verdant build. Do not infer that a CI failure necessarily breaks every particular mobile target; investigate it before adoption.

## Next implementation evidence

1. Expand E0 to an actual guarded, multi-checkpoint authored recipe with resource changes, companion preferences, orthogonal accessibility settings and an explicitly stored seed/version. Show all reachable checkpoint exits and reject false memory across resumed traces.
2. Compare the E0 story against two carefully authored alternatives through observed child use. Measure remembered decisions and world-change acknowledgment rather than number of different strings.
3. Independently reproduce Verdant source (candidate pin v2.18.0, unless a subsequent fully green SHA qualifies), validate locked sources and compiler, export one GLB twice, and capture hashes and actual scene renders. Do not use the child-facing player, upstream observer or MCP operator.
4. Move to 2.5D art and optional 3D comparison only after the GLB and art-direction quality gates pass.

This experiment **does not change Pixel Pals runtime, game saves, dependency list, production-art approval, roadmap or release gates**. No new periodic monitoring or CI workflow was added.
