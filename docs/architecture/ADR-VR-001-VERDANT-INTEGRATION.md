# ADR-VR-001: Verdant Integration Feasibility and Boundary

**Status:** PROPOSED; research only, no engine adoption approval
**Reviewed:** 2026-11-22
**Authority:** Supporting technical ADR, subordinate to the design constitution, Game Design Document, Simulation Design Document, production-art contract, and owner
**Canon impact:** None
**Target:** Future exploration research; no M2 family-alpha scope changes
**Related:** [Verdant research #115](https://github.com/Knapp-Kevin/Pixel-Pal/issues/115) · [Emergent Adventures design](../design/PROCEDURAL_EXPLORATION_AND_EMERGENT_ADVENTURES.md) · [discarded Rain Path candidate PR #90](https://github.com/Knapp-Kevin/Pixel-Pal/pull/90)

## 1. Recommendation

**GO for isolated reproducible geometry and art-direction evaluation. NO-GO for immediate Verdant engine migration or unchanged Verdant browser runtime.** The first candidate is a build-time/offline environment generator. A child-facing live viewport is conditional on separately proven visual, performance, accessibility, privacy, and gameplay benefits.

The relationship-first expedition design and canonical world-state simulation must work without any external engine. Verdant may generate region geometry or presentation pixels; it must never own relationships, child-world saves, dialogue facts, Pal agency or canonical outcomes.

A procedurally constructed landscape is not automatically painterly production art. Human approval, asset provenance, responsive crops, fallback behavior and quality gates remain mandatory even after PR #90 was abandoned.

## 2. Verified source snapshot and limits

Source reviewed: [Verdant Engine main SHA 0d8ed4ed314cd09ff925deda6dd69d15082f263d](https://github.com/afflom/verdant-engine/commit/0d8ed4ed314cd09ff925deda6dd69d15082f263d), workspace version **2.17.0**. This is newer than the v2.16.0 / SHA 55488e8 baseline in #115. Do not silently retarget a pinned technical experiment.

Pixel Pals baseline at document creation: [main SHA 1dea313b](https://github.com/Knapp-Kevin/Pixel-Pal/commit/1dea313b98e435c9c6801477c868500d59eacdf7), with React/Vite PWA, TypeScript simulation, local-first persistence, Zod content schema, storybook renderer, and fixed three-stage adventure definitions.

### Evidence-based capability assessment

| Subsystem | What inspected source establishes | What remains unproven |
| --- | --- | --- |
| Geometry | Core contains seeded sculpted terrain, canopy tree, bridge, citadel, water and authoring templates | Pixel Pals woodland art quality, coherent region-kit authoring, camera layouts |
| Browser | Engine worker implements initialization, rendering, frame/resize/camera messages, GLB and UORC interfaces | Safe minimal consumer adapter, Safari/Android lifecycle, real target-device performance |
| Built artifacts | Site tree includes core Wasm 154,462 bytes, optional UORC Wasm 1,738,622 bytes, plus JS and other assets | Actual initial route network size, peak heap/GPU usage and cache footprint |
| Renderer | WebGL2 and Canvas2D fallback implementations; optional higher-definition WebGPU branch | Accessibility equivalence, device coverage, graceful fallback and context-loss recovery |
| CLI | pack-scene creates canonical StandardSceneState and exports GLB, VDNT, UORC | Arbitrary Pixel Pals RegionKit input, direct PNG/WebP/AVIF export, reusable stable tool API |
| Intent | Current embedded CodedSlmDirector is a bounded coded intent router | Open-ended story generation; upstream issue #7 explicitly requests future free-form grounding |
| Dependencies | MIT OR Apache-2.0 root license; git-backed uor-matmul and UOR compression | Complete transitive license and asset provenance; reproducible consumer build |
| CI | [Bootstrap 45003654218](https://github.com/afflom/verdant-engine/actions/runs/45003654218) passed x86/ARM on this SHA | Browser deployment: [Pages 45003654276](https://github.com/afflom/verdant-engine/actions/runs/45003654276) failed assembly |
| CI failure detail | Pages log reports missing Prism/ARIA studio token: setAttribute("role", "tabpanel"), required in site/studio.mjs | Corrected Pages publication, independent browser smoke test |

These are source inspection and GitHub Actions facts, not independent end-to-end reproduction. No Rust compiler or direct GitHub clone access was available in the evaluation environment; no clean cargo build, actual-device benchmark, generated artwork, or child playtest was executed here. Upstream main is changing rapidly; immutable pinning is essential.

Cargo.lock at the inspected commit pins git dependencies to uor-matmul SHA **3cc5882f210667f9ac00fd8c02c5b5957b493f5d** and UOR compression SHA **79e08e2a25e8165932a21bf8567b39b40245286d**. The manifest references mutable main branches. Consumer evaluation must freeze both revisions and validate the full lockfile and licenses.

## 3. Alternative decisions

| Alternative | Advantages | Cost and risks | Decision |
| --- | --- | --- | --- |
| A. Keep storybook renderer; no engine | No runtime, privacy, save or device regression; focus on relationships | Less 3D novelty | **Authoritative baseline** |
| B. Vendored build-time scene-to-art tool | Deterministic geometry for non-child-facing art candidates | Additional tooling, paint-over and license review | **First research target** |
| C. Optional live, presentation-only viewport | Spatial discovery and interactive routes | Wasm memory, GPU/OffscreenCanvas, input, accessibility, support complexity | **Only after separate GO** |
| D. Replace Pixel Pals simulation and renderer with Verdant | Broad integrated engine functionality | Changes game authority, saves, canon, art direction, player experience | **NO-GO** |

Verdant must demonstrate player value against A, not against a fictional infinite fully 3D world. If two-dimensional authored expeditions are equally compelling, prefer the simpler product.

## 4. Actual integration contracts

The existing Pixel Pals boundaries remain authoritative:

- **Simulation:** Owns Pal identity, choices, relationships, memory, world time, adventure outcomes and validated next World. Current adventure implementation returns parseWorld-validated states. A general event ledger and arbitrary-party system are NOT yet implemented.
- **Content-schema:** Owns game content IDs, canon metadata and eligibility. The rendering boundary never defines authoritative new Pal or lore facts.
- **Persistence:** Owns local IndexedDB saves, migrations, backups and recovery. Verdant-native VDNT snapshots are NOT Pixel Pals save documents.
- **Renderer:** Owns approved storybook Pal and scene presentation. Verdant can render *optional background geometry* or propose candidate art, never replace named human art approval.
- **Tablet app:** Owns touch actions, keyboard/screen-reader alternatives, suspend/resume and fallback. A renderer cannot commit game actions.

**Dataflow, phase B:** Author-controlled RegionKit + seed + approved scene style -> pinned restricted geometry exporter -> GLB candidate -> separately controlled camera image output -> art/candidates and provenance -> named human art decision -> production registry only if approved.

**Dataflow, hypothetical phase C:** Pixel Pals creates an immutable, narrowly scoped scene descriptor -> isolated, lazily loaded rendering worker -> pixels/decorative hit regions -> tablet. Actual gameplay input and committed world updates always pass through the existing canonical simulation and persistence. Never hand the whole child-world state or personal notes to a rendering dependency.

**Strong invariant:** Renderer on, off, failed, upgraded or uninstalled yields identical canonical simulation results and saves for identical inputs.

### Future minimal scene descriptor

A possible schema, **not an existing implementation**:

    SceneViewDescriptorV1
      version: 1
      regionKitId: approved ID
      regionKitVersion: content hash
      decorativeSeed: bounded unsigned integer
      landmarkPlacements: bounded array of { approvedAssetId, transform }
      cameraPresetId: approved ID
      orientation: landscape | portrait
      styleKitId: approved ID
      reducedMotion: boolean

All identifiers must resolve locally. Validate before allocating Wasm buffers: finite coordinates, bounded counts and sizes, fixed materials and camera parameters, and no arbitrary code strings, remote URLs, filesystem paths, user prompts, open dialogue, user-created shader inputs or Rust-native snapshots. Generated visual details never mutate game state. The first build-time tool can use a separate authoring format without introducing this descriptor into the tablet app.

## 5. Adversarial findings

### P0: Upstream frame processing is not child-safe by simply omitting inputs

The inspected site/engine-worker.mjs processes observer state on **every frame**, invoking verdant_wasm_step_observer with default gaze-related values even when fields are not supplied. The broader upstream browser includes attention, telemetry, natural-language controls and network/custody features. This does not prove it exports private data, but it means **the existing worker cannot be treated as a minimal privacy-safe renderer**.

**Correction:** Do not copy the upstream worker or site/app.mjs into Pixel Pals. Build a small, auditable adapter around only necessary Wasm exports if live runtime ever qualifies. Exclude observer/attention, communications, live model prompts, multiplayer/custody, remote module loading and external scene streaming by construction. Check the compiled binary and worker import/network surfaces. A failed exclusion test is a runtime NO-GO.

### P0: CLI authoring is not a generic Pixel Pals scene generator

The existing CLI pack-scene command synthesizes its own canonical StandardSceneState and emits GLB/VDNT/UORC; a higher-level Pixel Pals region recipe, palette, painterly style, safe-area camera or output image export is not an input contract shown by the code.

**Correction:** A proof must build one fixed-seed tree/bridge/meadow scene using a constrained wrapper over Verdant geometry APIs, export a valid GLB, then separately capture or render two tablet-sized candidate images. Count the Rust integration and paint-over time. If the cost outweighs authoring 2D art, STOP.

### P0: Canonical saves and stories must be insulated

Verdant has its own story automata, rollback journals, observer and snapshots. Their existence does not make them interoperable with Pixel Pals friendship/family/memory rules. Current Pixel Pals adventure code has fixed story IDs and participants.

**Correction:** First proof is engine-independent, with fixture party variants and no new save schema. Later a typed, version-pinned region/adventure descriptor may be adopted only with explicit migration and replay tests. Never cast arbitrary engine IDs to canonical adventure IDs.

### P1: Performance is not the README benchmark

Current source tree contains a 154 KB core Wasm and 1.74 MB optional decoder Wasm before scenes, textures and scripts. Actual transfer, memory, frame time, thermals and battery are unknown. The worker assumes a canvas supplied by the host and offers renderer fallbacks, but support on older iPad and Android browsers has not been demonstrated.

**Correction:** No Wasm on the initial route. Preserve initial-scene transfer budgets **2.2/3.6/5.2 MB** by compact/standard/large tier. Measure additional lazy-route resources separately on real devices; test OffscreenCanvas and unsupported-WebGL routes, rotation, suspend/resume, reduced motion, keyboard and screen-reader fallbacks.

### P1: Renderer output is not necessarily finished art

PBR geometry does not automatically match Pixel Pals' painterly, storybook visuals. An attractive engine demo may still be incompatible with canonical Pal overlays and safe-area composition.

**Correction:** Compare output against approved art direction in both orientations with actual First Pal/Fern overlay silhouettes, lighting, texture, contrast, scene readability and provenance. A named human art decision is required before production-path inclusion.

### P1: Dependency and CI drift

Version changed between consecutive research snapshots. Rust dependencies reference branches, locked to SHAs only by Cargo.lock; Pages deployment fails on the inspected head though bootstrap passes.

**Correction:** Check out immutable SHA, freeze all git dependency SHAs and toolchain, use locked and offline-repeatable builds, audit licenses/NOTICE/asset attribution, reproduce artifacts and hashes, and distinguish core tests from browser Pages deployment.

### P1: Feature creep before family alpha

Pixel Pals roadmap keeps M2 Family Tablet Alpha first; existing art and hardware playtest evidence remain incomplete.

**Correction:** One isolated scene and two camera views; a live viewport is a separate subsequent decision. No M2/M3 dependency, game-engine swap, new scheduler, runtime AI service or unrelated release work.

## 6. Execution gates

| Gate | Required evidence | Acceptance | Failure disposition |
| --- | --- | --- | --- |
| **G0 Upstream reproducibility** | Exact head+lock+git SHAs, clean locked Rust tests/build, worker build, license review, Pages failure diagnosis | Reproducible documented results; nothing bypassed | Stop |
| **G1 Static generation** | Fixed-seed meadow/tree/bridge generator, valid GLB, same input -> same output hash, no child data | Standalone authoring wrapper works without changing Pixel Pals runtime | Stop art-tool track |
| **G2 Visual quality** | Landscape + portrait captures, painterly references, approved character safe areas, authoring/paint-over effort | Human reviewer can justify stylistic acceptance and provenance | Keep existing 2D assets |
| **G3 Runtime isolation** | Only if G1/G2 pass: audited tiny worker, offline import controls, crash/dispose, CSP, context-loss, WebGL fallback, canonical-save parity | No forbidden observer/network/AI/data flows; no simulation mutation | Stop live viewport |
| **G4 Hardware/experience** | Actual supported iPad/Android, cold start, p95 frame, peak memory, heat, battery, touch, access, offline, suspend/rotate | No unacceptable regression vs measured baseline; children understand and enjoy experience | Stop live viewport |
| **G5 Owner ADR** | Comparison to no engine, maintenance and upstream sustainability, scope/rollback and licensing, child playtest | Explicit owner GO on selected option | No adoption |

No invented universal fps, memory or heat target. Define pass/fail thresholds against existing real-device evidence before testing. G3/G4 are **not prerequisites for an offline authoring-only result**. Even a passing G2 does not bypass the established production-art release gates.

## 7. Immediate bounded work order

1. **Freeze reproducibility inputs.** Choose a reviewed upstream source commit and pinned transitive dependencies, capture script/toolchain hashes, and reproduce its core+Wasm build from clean checkout without changing Pixel Pals.
2. **Make a tiny scene through lower-level APIs.** Static tree, bridge, meadow and safe path, one seed, no Pal models or canonical story changes; export a GLB and validate it. Do not call the generic CLI an existing scene-recipe authoring API.
3. **Generate two art-candidate images externally.** Fixed landscape and portrait cameras with transparent/decorative Pal-safe regions; collect actual captured images, file hashes, byte sizes, generation effort and comparative screenshots.
4. **Red-team art integration.** Human assess visual quality, art continuity, child comprehension, readable navigation, two-orientation composition and provenance against the authored-only baseline.
5. **Stop or decide.** If value is weak, record NO-GO and retain Pixel Pals illustrated renderer. If compelling, propose a *separate* audited, optional live-viewer spike with the G3/G4 gates, not a direct engine migration.

**Evidence unavailable here:** Rust clean-room build, working local demo, browser screenshots, screenshots on target devices, player studies, downstream compatibility and art approvals. None is claimed completed.

**Owner adoption authority remains pending.** This file proposes a scope for research only; it neither installs Verdant into Pixel Pals nor changes its release priorities.
