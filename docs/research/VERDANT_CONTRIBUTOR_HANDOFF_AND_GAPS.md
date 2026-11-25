# Verdant Engine x Pixel Pals: Contributor Brief and Gap Map

**Audience:** The Verdant Engine creator, maintainers, and prospective technical collaborators  
**Prepared:** 2026-11-23  
**Status:** Public, evidence-based invitation for independent contributions. **Not an engine adoption decision.**  
**Primary tracker:** [Pixel Pals issue #115](https://github.com/Knapp-Kevin/Pixel-Pal/issues/115)  
**Project:** [Pixel Pals](https://github.com/Knapp-Kevin/Pixel-Pal)  
**Engine:** [Verdant Engine](https://github.com/afflom/verdant-engine)

## November 25 executed integration evidence: source GLB PASS, distributed core FAIL

**This is an executed downstream experiment, superseding the November 24 proposed first-build status.** We constructed and ran an independent consumer rather than extrapolating from Verdant's internal build badges.

| Integration question | Observed evidence | Acceptance |
| --- | --- | --- |
| Can an external project generate bounded authored geometry with Verdant's public Rust API? | [Merged Pixel Pals PR #122](https://github.com/Knapp-Kevin/Pixel-Pal/pull/122), [exact-head source CI 45714904551](https://github.com/Knapp-Kevin/Pixel-Pal/actions/runs/45714904551), source pin `cf25bac29d...`, Rust 1.97.1 | **PASS: Git source mode.** Two byte-identical 8-mesh GLBs, 2,372 tris, 131,056B; independent GLB structural/embedded-data validation and a strict invalid-input refusal |
| Is there an independent inspectable visualization? | The real GLB produced **720×480 landscape and 480×720 portrait PNGs** in a zero-dependency camera-locked engineering renderer. A deliberately broken depth ordering hid trees; regression tests detected/fixed it | **PASS: geometry diagnostic only.** Not proof of Verdant's production rendering quality or painterly illustration |
| Does the **published** versioned `verdant-core=2.21.7` package actually compile outside the repo? | [Clean external Cargo attempt 45469597645](https://github.com/Knapp-Kevin/Pixel-Pal/actions/runs/45469597645) resolved the raw Github sparse index and dependencies, then reported **17 compile errors inside Verdant core** | **FAIL: packaged library.** Missing repository-root embedded `catalogs/` and `model/` files plus `default-features=false` UORC gating breakage. Source-mode success does not close this |
| Can authored objects lie on procedural terrain? | [Terrain PR #123](https://github.com/Knapp-Kevin/Pixel-Pal/pull/123), [first full source CI 45715640952](https://github.com/Knapp-Kevin/Pixel-Pal/actions/runs/45715640952) ran 3/3 Rust terrain tests, generated identical 2,432-triangle / 132,768B GLBs, and independently audited actual exported vertices | **Source PASS in initial qualification:** all three tree-base deltas zero, bridge +0.15m, paths +0.065..0.915m, stream +0.045m. Final clean-head and merge status belong to PR #123; not a child walkability proof |

**Concrete upstream request (highest priority now):** Preserve Verdant governance/proof data while packaging `verdant-core` so all compile-time embedded files resolve **inside** a distributable crate; gate optional UORC APIs coherently; add a release-gated **outside-workspace `verdant-core` consumer** that generates and validates a small authored GLB using versioned crate archives, not only a `verdant-tensor` registry smoke test. Confirm minimal supported feature set and a pinned independent Cargo.lock; document any unsupported geometry-only build.

**What Pixel Pals has already contributed:** [Actual Rust source consumer and strict orchard recipe](../../experiments/verdant-consumer/README.md), deterministic GLB/PNG verifiers, [terrain grounding details](https://github.com/Knapp-Kevin/Pixel-Pal/pull/123), malformed input checks and artifact/provenance manifests. These are public and do not require child data, credentials, or repository-write access. Verdant's upstream GitHub Issues are disabled, so the reproduction is currently linked from [Pixel Pals research #115](https://github.com/Knapp-Kevin/Pixel-Pal/issues/115) and the PRs, not a new upstream issue.

**Release freshness qualification:** Verdant has since published v2.22.4, but the exact **executed** downstream source and package matrix above is pinned to v2.21.7. We are not claiming v2.22.4 fixes or reproduces these defects without rerunning the same consumer at that revision.

**Unchanged:** neither source proof nor geometry alignment changes story authority, approved animal illustration, production tablet UI, network permissions, family save data, device performance, accessibility or safe physical routes. The full runtime migration remains deferred.

---
## November 24 reassessment: Verdant v2.21.7

**Source compared:** previous handoff SHA [a51262d](https://github.com/afflom/verdant-engine/commit/a51262d2008b030b290f70cd0b39a080f72cb4e9) (v2.20.0) to current [cf25bac](https://github.com/afflom/verdant-engine/commit/cf25bac29df05f97573ca5ef2a1d83c2f201aff3) (v2.21.7), **54 intervening commits**. See [release v2.21.7](https://github.com/afflom/verdant-engine/releases/tag/v2.21.7). This section supersedes historical release/CI-status statements below; it does **not** supersede the gameplay/art/child-trust boundaries.

| New evidence | Verified result | Pixel Pals implication |
| --- | --- | --- |
| **Upstream x86 + ARM acceptance** | Exact-head [bootstrap 45442139567](https://github.com/afflom/verdant-engine/actions/runs/45442139567) **passed fast gate, Ubuntu x86 acceptance and Ubuntu ARM acceptance** | The previous v2.20 ARM oracle failure is **no longer a current upstream gate blocker** at this SHA; a Pixel Pals independent consumer build and physical tablet run remain untested |
| **Browser release** | Exact-head [Pages 45442139690](https://github.com/afflom/verdant-engine/actions/runs/45442139690) **built, verified and published**; [Stitch release 45447188563](https://github.com/afflom/verdant-engine/actions/runs/45447188563) **passed** | Prior v2.20 FR-03 Pages failure is resolved at this SHA. This is a useful reproducible demo baseline, not proof of mobile frame time or art approval |
| **Version-specific Rust supply** | v2.21.7 GitHub release includes verdant-core, verdant-tensor, verdant-wasm, verdant-cli **.crate archives**, dependency archives, crates-manifest.json and a version-pinned Cargo sparse index tarball | A **standalone external consumer** is now more feasible; ask for a minimum version-locked geometry-only example consuming these artifacts without cloning the complete engine |
| **Registry verification** | release-stitch.yml packages/validates crates and verifies registry over HTTP; build_ops.rs's outside-workspace test project currently uses **verdant-tensor**, not a published verdant-core scene exporter | Do **not** claim an external GLB consumer is already qualified. Extend the upstream example to instantiate terrain/scene and export a GLB |
| **Portable distribution** | v2.21.7 release includes a **916,880-byte .holo artifact**; the portable player supports offline WebGL2 primitives | Potential **developer/demo distribution** pathway. Not a Pixel Pals runtime payload or proof of painterly production visuals |
| **Low-bit tensor/model encodings** | v2.21.1–v2.21.7 commits add certified grouped and importance-grid 1–4-bit weight encoding and recurrent tensor operations | Possible long-term foundation for an offline model, **not** a verified child-safe adaptive narrative system, asset generator, or current M2 requirement. Do not raise adoption priority on encoding features alone |
| **Scene authoring / child-facing runtime** | Current CLI pack-scene still exports an internally synthesized StandardSceneState; general worker frame path still calls step_observer | **Original highest-value gaps are unchanged:** bounded partner scene input, camera captures / masks, minimal render-only consumer boundary |

**Updated first contribution request:** Rather than starting by fixing general Verdant CI or introducing a new package-distribution mechanism, take the now-green **v2.21.7 exact source and release-pinned crate set** and build a tiny **out-of-tree consumer** that uses verdant-core's smallest viable features, takes an orchard/stream/tree/bridge fixture, exports validated GLB, and produces a manifest with input seed, version pins, SHA-256, triangles, and bytes. A standard GLB viewer and one camera-fixed PNG are sufficient for the first review. Include one intentionally invalid region/asset fixture and document what is unsupported.

**Source-design caution:** verdant-core has optional default features (UORC streaming, shader oracle, capsule gzip, glTF image decoding), but core still depends on verdant-tensor and uor-matmul. Using default-features=false *might* reduce optional features; the dependency closure and success must be measured rather than guessed. Cargo.toml on the upstream source tree still names mutable git main branches, so prefer the released version-specific index and verify the actual resolved lock/source hashes.

**Net conclusion:** G0 upstream baseline **improved**, G0 independent consumer **not yet completed**, G1 arbitrary nature-scene GLB **not yet demonstrated**, G2 painterly 2.5D art **not evaluated**, G3 child-facing renderer **still a separate authorization gate**. Keep M2 art and physical-device milestones prioritized. No changes to Pixel Pals production dependencies are justified by this update.

---

## The short invitation

We are exploring whether Verdant could help Pixel Pals create richer, repeatable, relationship-driven expeditions while preserving a warm, painterly, offline-first tablet experience.

We see meaningful potential in Verdant's seeded geometry, glTF export, navigation, and browser tools. The important question is not whether Verdant can replace our game engine. It is **which small, reusable Verdant capabilities could make the worlds easier to author, validate, and eventually explore**.

This document is intentionally a request for technical dialogue and optional contributions, **not a list of defects assigned to the Verdant team**. Some apparent gaps might already have solutions we overlooked. Corrections and counterexamples, especially a working API or reproducible demo at a pinned revision, are welcome.

A particularly useful contribution would be a **one-scene, independent proof**: produce a reproducible small meadow, stream, bridge and tree layout from a constrained input, export a valid GLB, and document the exact commands and artifacts. A polished art generator and a full runtime integration are *not* prerequisites for that first proof.

## 1. What Pixel Pals actually needs

Pixel Pals is a family-friendly game centered on relationships between distinct Pals, life in a small village, continuity, and accessible exploratory adventures. The current application is a React/Vite tablet PWA with TypeScript simulation, local-first persistence and a modular illustrated renderer. The immediate delivery priority is **M2 Family Tablet Alpha**, not a 3D migration.

Our future exploration design favors bounded regions, meaningful companion contributions, a readable route home, authored and coherent outcomes, offline play, reversible or gentle choices, and memories grounded in things that actually happened.

The intended art direction is **painterly children's-book illustration**, including clear silhouettes, expressions, safe character-overlay regions, and portrait/landscape layouts. Procedural geometry is a possible supporting authoring tool, not a substitute for illustration direction or human review.

Pixel Pals must retain sole authority for Pal identity, relationships, actual choices, committed memories, canonical world state, and local saves. A render tool should never need private child profiles, personal notes, full saved worlds or engine-owned social state.

## 2. What we have actually verified

| Area | Source-backed finding | Confidence / distinction |
| --- | --- | --- |
| Procedural scene assets | Verdant core has seeded terrain and specialized HD sector builders; glTF export APIs construct and validate GLB meshes | **Code verified**. We have not independently generated or viewed a Pixel Pals-specific GLB |
| Current authoring interfaces | Verdant CLI pack-scene synthesizes a canonical StandardSceneState from a seed/LOD, then emits GLB, VDNT and UORC | **Code verified**. Not the same as reading an arbitrary partner-supplied region recipe |
| Editable Studio primitives | Studio supports five primitive types (box, platform, pillar, ramp, beacon orb) and several architectural world archetypes | **Code verified**. Not proof of a woodland/illustrative layout API |
| Portable preview | portable_player.rs produces a compact, offline, interactive WebGL2 HTML player for five primitives | **Code verified**. A promising developer review surface, not a validated child-facing game |
| Navigation | navmesh.rs builds walkable polygons and A* corridors | **Code verified**. Does not establish child-accessible routes, landmark legibility or safe story completion |
| Story validation | narrative.rs StoryAutomaton checks structural reachability and resource conservation | **Code verified**. Runtime transitions can still fail for inventory and spatial restrictions; companion-specific reachability is not proven |
| Browser runtime | site/engine-worker.mjs has render, frame and camera handling, but its frame path invokes observer processing even when gaze fields are omitted | **Code verified**. We will not import this general worker into the child-facing PWA unchanged |
| Licenses | Verdant root source is MIT OR Apache-2.0 | **Verified root**. Full third-party code/asset provenance and exact transitive dependency handling are not yet independently audited |
| Pixel Pals expeditions | E0: 11 passing tests and 12,000 simple outcome traces; E0b: 13 passing tests and 4,096 staged traces; both merged to Pixel Pals main with repository CI passing | **Executed fixture evidence**, not a playable child-reviewed adventure |
| Cross-platform qualification | Verdant v2.20.0 SHA a51262d: Linux x86 bootstrap passed but Linux ARM failed building a ggml C++ vector oracle; Pages failed its first-visit weight gate | **Exact upstream CI evidence**, not independent proof that Verdant's production renderer itself fails on ARM tablets |

**Source version:** [Verdant main v2.20.0 at a51262d](https://github.com/afflom/verdant-engine/commit/a51262d2008b030b290f70cd0b39a080f72cb4e9), inspected on 2026-11-23. The latest passing and failing CI checks may change after this snapshot. The historical source-review sequence is v2.16 through v2.20. A research pin is not a production approval.

**Current technical gate:** We have not completed a clean, independent Cargo build, GLB export, cross-device render, stylization review or real tablet benchmark. It would be inaccurate to call Verdant either integrated or definitively unsuitable.

## 3. Where Verdant could be more useful to us: prioritized gaps

These are **consumer-facing missing or undemonstrated capabilities at the inspected API surface**, not assertions that the engine has no underlying implementation.

| Priority | Gap for our use case | What exists today | What would help / a possible contribution |
| --- | --- | --- | --- |
| **P1** | **Small declarative scene input -> standalone GLB** | Seeded canonical scenes, geometry and GLB exporters; pack-scene CLI | Expose a stable, documented **headless** API/CLI accepting a constrained set of terrain, trees, path, stream, bridge and camera hints. Export one validated GLB without requiring Verdant's native world snapshot format or full runtime |
| **P1** | **Reproducible partner-consumer starter kit** | Cargo workspace, tests, examples and locked direct/transitive code in Verdant's own tree | Independent example project pinned to an exact Verdant SHA, Rust toolchain and transitive git SHA; one command, expected output hashes and error explanations. This should work from a clean checkout, not only inside Verdant's complete governance/release environment |
| **P1** | **Visual authoring outputs for 2D/2.5D games** | PBR mesh/renderer and portable primitive viewer | Fixed-camera captures, ideally optional depth/foreground/occlusion masks, plus reliable named landmarks and character-safe areas. **A PNG screenshot first** is more valuable than a claim of automatically production-ready painterly illustration |
| **P1** | **Independent cross-platform consumer evidence** | As of v2.21.7, upstream Linux x86, ARM and Pages CI are green; published Cargo archive/index distribution is available | Provide an **out-of-tree geometry-only verdant-core build/export** on supported hosts and a real tablet preview. Explain feature flags, optional oracle/model dependencies, memory and actual payload/performance |
| **P2** | **Minimal render-only browser adapter** | Full browser worker runs camera, simulation, observer, decoding and optional other features | Optional API/feature set that **only renders allowlisted local assets**. No observer, model/director, network, remote module bootstrap, game-state mutation, analytics or custody/multiplayer machinery in the child app. An export-to-GLB + generic viewer may be simpler and remains a valid alternative |
| **P2** | **Landmark route validation with authoring diagnostics** | Walkable mesh extraction and A* pathfinding | Build-time proof that start, exits, and landmarks are connected; explain unreachable places, path costs and route alternatives. The domain gameplay rules remain outside Verdant |
| **P2** | **Authored exploration/visual-state variants** | Seeded sectors and templates | Deterministic alternative scene variants (e.g., clear/overgrown/restored path) with stable IDs, repeatable geometry and no regenerated canonical history. Pixel Pals decides which variant is valid |
| **P3** | **Animal-specific expressive animation** | Articulated humanoid character and external mesh APIs | Evidence of stylized quadruped/bird/long-ear rigs retaining approved silhouettes, poses, expression/ear/tail consistency and reduced-motion options. This is a separate research track, **not** our initial request |
| **Not requested** | Generic AI quest writing, network hosting, multiplayer, engine-owned memories/saves | Verdant has bounded intent, own narratives, snapshots, hosting and operator capabilities | These do **not** address our first integration need and should not be expanded on our behalf |

**Important distinction:** We have deliberately not asked Verdant to implement Pixel Pals-specific lore, story rules, relationships, approval workflows or canonical memory logic. Those belong in Pixel Pals. We are looking for reusable **developer-facing engine capabilities** that could also benefit other teams producing small offline narrative games.

## 4. Choose-your-own-contribution menu

The Verdant author should feel free to challenge the ranking or suggest a simpler approach. The following tasks are **independent alternatives**, not a mandatory sequence assigned to an outside contributor.

### A. Best first build: reproducible headless scene export

Build a minimal, version-pinned Verdant example that takes a small authored region specification and produces a valid, standalone GLB. The input can be a new tiny JSON schema or an equivalent typed Rust builder; the author can choose which is most maintainable.

**Illustrative input shape, not a finalized contract:**

    {
      "schemaVersion": 1,
      "seed": 314159,
      "regionId": "small-orchard-demo",
      "landmarks": [
        { "id": "start", "kind": "clearing" },
        { "id": "bridge", "kind": "bridge" },
        { "id": "tree", "kind": "canopy-tree" }
      ],
      "paths": [["start", "bridge"], ["bridge", "tree"]],
      "camera": { "preset": "storybook-overlook" }
    }

**Minimum deliverables:** documented reproducible command; an authored input file; GLB that loads in a standard independent glTF viewer; an output manifest listing SHA-256, triangle count, byte size, source pin, geometry version and any unsupported features; repeated generation comparison; an example preview image or video; and explicit error behavior for invalid input. Geometry-only export should avoid a compulsory external model, remote account or child-user data.

**How we would assess it:** same seed/input/toolchain produces identical validated artifacts (or a documented canonicalized semantic comparison if nondeterministic metadata is unavoidable), independent GLB loading succeeds, appropriate landmarks are visible, no hidden network call is required after source setup, and authoring time is competitive with a small manually arranged 2D mockup.

### B. Valuable companion contribution: camera and layer export

Provide two named viewpoints and ability to capture a fixed-camera image and, optionally, character-occlusion mattes or depth layers. This can be a sample script outside the core engine. No promise of automated final art is required.

**Assessment:** compare camera-locked landscape and portrait output against the same region geometry; demonstrate legible paths and sufficient space for illustrated Pal overlays. A human Pixel Pals art reviewer determines whether outputs are candidate-worthy. The existing production-art approval process remains the gate.

### C. Useful targeted engineering feedback: the smallest safe consumer surface

Demonstrate what a **geometry-only** Verdant dependency actually needs: crate features, build time, transitive license inventory, Wasm payload, required imports, and whether an application could use it without Studio, observer, language-model, operator MCP and live networking.

A concrete Rust feature example, minimized build, or written explanation that a GLB-only workflow is preferable would be a valuable contribution. A well-supported conclusion that our planned use does *not* fit Verdant would also be useful.

### D. Optional advanced contribution: route graph evidence

Provide a build-time report identifying unreachable landmarks, missing return paths and potential navmesh/mesh inconsistencies. A graph proof on its own does not guarantee an actual child can complete a quest: resource, party-consent, accessibility and narrative guards remain Pixel Pals responsibilities.

## 5. What acceptance is and is not

**Evidence we would welcome:**

1. A specific pinned code revision, clear setup instructions and source link.
2. A runnable, bounded demonstration or independently checked input/output pair.
3. GLB/artifact hashes, sizes, geometry counts, compile/test output and relevant errors.
4. At least one negative test (bad input, disconnected path, invalid mesh or unsupported backend) that fails clearly.
5. An explanation of which components are reusable upstream and which would require custom Pixel Pals code.
6. A concise note about limitations, licensing, accessibility, and mobile risks.

**Not required for the first collaboration:** whole-engine migration, working multiplayer, prompt-to-world AI, deterministic free-form narrative, 3D characters, finished storybook assets, or an unbounded procedural game.

**Not acceptable as proof:** an upstream green badge without its tested revision, screenshots without source/provenance, the presence of an API without a successful consumer example, or claims that basic NavMesh graph reachability means every party can finish an adventure.

We understand that the engine's release infrastructure and governance constraints may be important to its maintainers. We are not requesting that they be weakened. The question is whether a small independent *consumer API* can offer a reliable narrow integration boundary.

## 6. Collaborative ownership and safe boundaries

- **The Verdant author chooses their own development path.** They can respond with existing capabilities, propose an alternative technical approach, open an upstream issue or PR, or build a standalone example.
- **Verdant-side reusable code belongs upstream in Verdant** or in a separately owned demo repository, following its own maintainer's process. Do not require the author to adopt Pixel Pals' internal process.
- **Pixel Pals integration remains in Pixel Pals** and is gated by the project owner, human art reviewers, device tests and save/child-safety controls.
- No contributor needs Pixel Pals private data, child accounts, network credentials or repository-write authority. The public issue and docs are sufficient context.
- Candidate artwork remains candidate-only. Repeated scene variants must never overwrite child world history. No Verdant-native snapshot is a Pixel Pals save.
- Pixel Pals will review and, where useful, contribute specific reproduction cases back to Verdant. If a different renderer is a better consumer of Verdant-produced GLB, that does not diminish the value of the geometry tooling.

## 7. Where to start / questions for the engine developer

If you have limited time, the most useful feedback would be answers to **any two or three** of these:

1. Is there already a documented way to build **arbitrary authored scenes** from a small declarative input and export GLB, independent of the canonical StandardSceneState packer? We would love a concrete example.
2. What is the smallest, reproducible crate/feature selection for **geometry-only offline tools**? Does it avoid model/oracle, full Studio, operator and network dependencies?
3. Does Verdant already support fixed-camera image or depth/mask output suitable for a 2.5D compositing workflow, or would you build that in an external tool?
4. Can you extend the now-passing v2.21.7 release-pinned Cargo consumer example from verdant-tensor to **verdant-core geometry and GLB export**, using the smallest viable features? Which exact lock/source hashes, license obligations and ARM/tablet implications should downstream consumers adopt?
5. Which use case do you believe is **outside Verdant's intended design** and would be better implemented in Pixel Pals or another library? We welcome that answer as much as a feature proposal.

A small code example, technical correction, or first independent proof is more valuable than a large commitment. There is no expectation that the author implements every row above.

## 8. Evidence links for optional deeper reading

**Start here, not with the full issue history:**

- [Verdant research issue #115](https://github.com/Knapp-Kevin/Pixel-Pal/issues/115): technical evidence and decisions; comprehensive but lengthy
- [ADR-VR-001](../architecture/ADR-VR-001-VERDANT-INTEGRATION.md): proposed integration boundaries, tradeoffs and acceptance gates
- [Procedural Exploration design](../design/PROCEDURAL_EXPLORATION_AND_EMERGENT_ADVENTURES.md): why relationships, memory and safe returns matter
- [E0 results](VERDANT_E0_FORGOTTEN_ORCHARD_RESULTS.md) and [E0b results](VERDANT_E0B_STAGED_ORCHARD_RESULTS.md): executed Pixel Pals-only deterministic tests, not engine benchmarks
- [Production art plan](../art/PRODUCTION_ART_PLAN.md): the painterly quality target and human art approval

**Relevant upstream source:**

- [Verdant CLI scene packer](https://github.com/afflom/verdant-engine/blob/a51262d2008b030b290f70cd0b39a080f72cb4e9/crates/verdant-cli/src/lib.rs)
- [Geometry library](https://github.com/afflom/verdant-engine/blob/a51262d2008b030b290f70cd0b39a080f72cb4e9/crates/verdant-core/src/geometry.rs) and [world templates](https://github.com/afflom/verdant-engine/blob/a51262d2008b030b290f70cd0b39a080f72cb4e9/crates/verdant-core/src/hd_world_templates.rs)
- [GLB exporter](https://github.com/afflom/verdant-engine/blob/a51262d2008b030b290f70cd0b39a080f72cb4e9/crates/verdant-core/src/gltf_export.rs)
- [Portable WebGL2 player](https://github.com/afflom/verdant-engine/blob/a51262d2008b030b290f70cd0b39a080f72cb4e9/crates/verdant-core/src/portable_player.rs)
- [Navigation](https://github.com/afflom/verdant-engine/blob/a51262d2008b030b290f70cd0b39a080f72cb4e9/crates/verdant-core/src/navmesh.rs) and [narrative automaton](https://github.com/afflom/verdant-engine/blob/a51262d2008b030b290f70cd0b39a080f72cb4e9/crates/verdant-core/src/narrative.rs)
- [Browser worker](https://github.com/afflom/verdant-engine/blob/a51262d2008b030b290f70cd0b39a080f72cb4e9/site/engine-worker.mjs)
- [v2.20 bootstrap result](https://github.com/afflom/verdant-engine/actions/runs/45218483657) and [Pages result](https://github.com/afflom/verdant-engine/actions/runs/45218483481)

**Proposed first shared success:** A reproducible, visually inspectable **small nature region** generated from bounded inputs, emitted as an ordinary interoperable artifact, with no change to Pixel Pals' game authority or child-facing runtime.
