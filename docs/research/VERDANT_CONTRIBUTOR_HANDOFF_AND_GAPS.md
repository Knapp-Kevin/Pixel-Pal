# Verdant Engine x Pixel Pals: Contributor Brief and Gap Map

**Audience:** The Verdant Engine creator, maintainers, and prospective technical collaborators  
**Prepared:** 2026-11-23  
**Status:** Public, evidence-based invitation for independent contributions. **Not an engine adoption decision.**  
**Primary tracker:** [Pixel Pals issue #115](https://github.com/Knapp-Kevin/Pixel-Pal/issues/115)  
**Project:** [Pixel Pals](https://github.com/Knapp-Kevin/Pixel-Pal)  
**Engine:** [Verdant Engine](https://github.com/afflom/verdant-engine)

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
| **P1** | **Cross-platform qualification evidence** | Linux x86 checks passed at inspected v2.20 source | Identify whether the ARM ggml-oracle failure is a test/dependency configuration issue or an engine-wide blocker, and provide an independent minimized ARM build/export proof. Explain required feature flags and how optional model/oracle dependencies are excluded from geometry-only consumers |
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
4. What is the practical path to a standalone, pinned example that compiles on both x86 and ARM, including the relevant lockfile and toolchain? Is the observed ARM ggml-oracle failure isolated from the geometry-only path?
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
