# Verdant Engine v2.22.4: Incremental Architecture Review

**Review date:** 2026-11-25  
**Upstream baseline:** [Verdant v2.21.7 / `cf25bac29d`](https://github.com/afflom/verdant-engine/commit/cf25bac29df05f97573ca5ef2a1d83c2f201aff3).  
**Reviewed head:** [Verdant v2.22.4 / `9d22f5ac36`](https://github.com/afflom/verdant-engine/commit/9d22f5ac364db8352d12434e1c9c3dbed65ac6c9), [release](https://github.com/afflom/verdant-engine/releases/tag/v2.22.4).  
**Pixel Pals baseline:** [merged source exporter #122](https://github.com/Knapp-Kevin/Pixel-Pal/pull/122), [terrain grounding #123](https://github.com/Knapp-Kevin/Pixel-Pal/pull/123), [author handoff #124](https://github.com/Knapp-Kevin/Pixel-Pal/pull/124), and [research tracker #115](https://github.com/Knapp-Kevin/Pixel-Pal/issues/115).

## Decision

**Continue Verdant as an isolated offline authoring dependency candidate. Do not adopt its browser worker, runtime simulation, anthropomorphic rigs, or generated assets as production Pixel Pals art.** The component review found useful engineering ideas, but no new proof of child-facing benefit or parity with our production-art contract.

The v2.21.7-to-v2.22.4 comparison contains **17 commits**. The substantive change set favors **numeric kernel correctness** (signed float conversion, binary64 arithmetic, Q8 activation formats, Arm logarithm/sine checks) and **module decomposition**, not a new partner-supplied woodland recipe API.

## What changed, and what Pixel Pals can actually use

| Engine surface | Inspected evidence | Pixel Pals judgment |
| --- | --- | --- |
| Certified scalar/tensor math | Recent upstream commits add signed binary64 operations, Q8 decoding, Arm logarithm and sine tests; `crates/verdant-tensor/src/linear/activations.rs` and `scalars_ratchet_m24.rs` changed | **Monitor, do not integrate.** Potentially valuable for reproducible offline mesh baking, but no demonstrated art-quality, portability, battery or child-facing narrative benefit |
| glTF 2.0 exporter/importer | `gltf_io.rs` and `gltf_export.rs` already expose `export_scene_to_glb`, `import_glb_to_scene_bounded`, `validate_glb_bytes`; this update chiefly moves no-image-codec parsing and summary code between modules | **Reuse bounded GLB asset semantics.** Treat the output as untrusted until both structural and offline resource checks pass. No evidence that this refactor adds a new arbitrary-region authoring interface |
| Swept-capsule controller and BVH | `physics_controller.rs` retains CCD, slide, step and clearance outputs; much of the code was moved from `physics.rs` | **Optional future route authoring oracle**, not a gameplay engine migration. A connected landmark graph and ground-following meshes are not proof that a Pal can cross a bridge safely |
| Character skeleton and Foot IK | `character_types.rs` contains a 22-joint **humanoid** rig and two-bone foot telemetry, moved out of `character.rs` | **No direct Pal animation adoption.** Our five starter species and Fern need distinct quadruped/anthropomorphic silhouette design and human-approved painterly motion. A humanoid rig is not evidence of such art parity |
| CLI and external authoring | `verdant pack-scene <out.glb> [seed] [lod]` still builds `StandardSceneState::synthesize_at_lod`; the Pixel Pals external Rust consumer remains the demonstrated bounded recipe-to-GLB path | **Keep the consumer adapter.** Do not replace it with a CLI command that does not accept our authored region input |
| Browser worker | `site/engine-worker.mjs` still performs observer stepping and has fetch-driven loading pathways | **Do not embed in child-facing runtime** without a separately designed render-only component and explicit permission/privacy/security review |
| Release pipeline | [Exact-head bootstrap](https://github.com/afflom/verdant-engine/actions/runs/45584546016) and [stitch release](https://github.com/afflom/verdant-engine/actions/runs/45588938160) pass; [v2.22.4](https://github.com/afflom/verdant-engine/releases/tag/v2.22.4) publishes Cargo index, `verdant-core-2.22.4.crate`, and portable `.holo` | **Upstream green, downstream unknown.** The tested v2.21.7 published core failed outside-workspace compilation; we have **not** recompiled the v2.22.4 archive independently. A release badge does not answer that question |

## Implementation slice delivered by this review

The existing `experiments/verdant-consumer/verify-glb.mjs` already verified embedded geometry buffers, triangle topology, basic material references, required authored nodes, and repeated output bytes. It did **not** inspect external image URIs or texture-to-image references. That leaves a path for a syntactically valid scene with an embedded mesh to silently request images elsewhere.

This review adds a strict **offline resource containment** rule for the *experimental* GLB handoff:

- Reject every `images[].uri`, including `https:`, `file:`, and `data:` URLs. Require a declared embedded `bufferView` and `image/png`, `image/jpeg`, or `image/webp` MIME metadata.
- Reject textures whose `source` does not identify one of those declared embedded images.
- Preserve the existing `buffers[0].uri` refusal, prohibition on required GLB extensions, and deterministic export checks.
- Add isolated Node negative tests and run them **before** the Rust source build in the scoped experiment workflow.

**Scope of proof:** This detects resource-reference violations, **not** malformed image decoder streams, compressed-image bombs, unsafe optional glTF extensions, or approved visual quality. Pixel Pals does not consume these GLBs at runtime today. A future production import still requires bounded image decoding, decoded dimensions, resource/triangle limits, content-policy checks, and real tablet measurements.

## Next bounded slices, in order

1. **P1, released-core consumer matrix:** Re-run the same independent external consumer against *published* `verdant-core=2.22.4`, with default and minimal features kept as **separate outcomes**. Record Cargo.lock, actual .crate hashes and exact failures; never let pinned Git source success substitute for package qualification. The previous v2.21.7 run yielded 17 compiler errors from missing bundled catalog/model files and disabled-feature UORC symbols. No basis yet to mark v2.22.4 repaired.
2. **P1, geometry health / authored traversal diagnostics:** Measure zero-area tree triangles and triangulation defects, check bridge/path continuity, grade crossing approaches with a Pal-sized clearance envelope. The previous orchard had **39 exact zero-area triangles per generated canopy tree**. These diagnostics are authoring evidence, not production physics or actual child walkability.
3. **P2, art-space bridge:** Export fixed-camera **foreground/depth/occlusion masks** and aesthetic crop proposals for portrait and landscape, then compare with reviewed 2D storybook artwork. Human art direction remains authoritative.
4. **Deferred, dynamic animation:** Only evaluate independent animal-specific rigs, reduced-motion clips and mobile performance after canonical Pal model sheets have been approved. Do not retrofit humanoid IK merely because the engine includes it.
5. **Explicit non-goals:** No child-data ingestion, autonomous observer, cloud asset fetch during runtime, story decision authority, save migration, or full game engine swap.

## Completion and governance

The existing [Pixel Pals production art contract](../art/PRODUCTION_ASSET_CONTRACT.md) and [M2 backlog](../BACKLOG.md) remain release authority. Source-generated GLB + valid tests are **experiments**, not human-approved images. The prior published-core defect is still tracked in [#115](https://github.com/Knapp-Kevin/Pixel-Pal/issues/115). Update this review only with an exact upstream SHA and observed downstream evidence; do not imply changing release tags are equivalent to consumer acceptance.
