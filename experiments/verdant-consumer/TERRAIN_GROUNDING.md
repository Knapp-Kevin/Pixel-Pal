# Verdant Orchard E1: Terrain-Conforming Authoring Slice

**Status:** Experimental, subject to exact-source Rust and independent GLB qualification.  
**Based on:** [external consumer PR #122](https://github.com/Knapp-Kevin/Pixel-Pal/pull/122), source Verdant v2.21.7 `cf25bac29df05f97573ca5ef2a1d83c2f201aff3`.  
**Tracking:** [research #115](https://github.com/Knapp-Kevin/Pixel-Pal/issues/115).  
**Code:** `src/grounding.rs`, `src/main.rs`, `verify-grounding.mjs`.

## Executed results (2026-11-25)

**First full hosted proof:** [Actions run 45715640952](https://github.com/Knapp-Kevin/Pixel-Pal/actions/runs/45715640952) at source commit `970ff11e33536712cb4f9cc3559b6696e1a740cc` passed exact-pinned Verdant source build/export, **3/3 Rust terrain unit tests**, independent GLB structural check, independent exported-mesh ground clearance audit, six preview-script tests, two camera PNGs, and invalid path refusal. Ordinary Pixel Pals CI and public-source checks also passed. The PR was subsequently history-cleaned to an eight-file diff against merged #122; exact-final-head requalification is required before merge.

| Actual observation | Measured result |
| --- | --- |
| Generated GLB | **8 meshes**, **2,432 triangles**, **132,768 bytes** |
| Deterministic identity | Same bytes across two exports, SHA-256 `e106aa47de5365185a1ce47575bb57c1db20a0ceb0ece3d10217c34bacde2e0b` |
| Tree ground offsets | Canopy west **0.000m**, canopy east **0.000m**, memory tree **0.000m** |
| Bridge origin | **+0.150m** over sampled terrain |
| Each path ribbon | **34 vertices**, sampled clearance **+0.065m through +0.915m** (includes intentional bridge ramps) |
| Water ribbon | **34 vertices**, all samples at **+0.045m** over terrain |
| Landscape diagnostic | **720×480** PNG, SHA-256 `dd7aac222561c86fb62516bfd864d58580865d757acf221ef5042e0db2f13003` |
| Portrait diagnostic | **480×720** PNG, SHA-256 `fd66d9744da6464d2c3680493fcf8b9f7ff0a5a2ac2a78844a2b7e1cc0d6740d` |

**Source of numbers:** Host test output and the uploaded GLB, PNG and manifest files from the run. The artifact bytes were separately downloaded and rehashed against their source and preview manifests. These figures qualify **the source-pinned consumer**, not Verdant's broken published crate or an on-device child experience.

**Visual assessment:** The resulting bridge, paths, three trees and stream are recognizable, and paths follow terrain rather than floating at global height zero. The scene remains a simple low-poly debug composition, without a realistic riverbed, foliage silhouette diversity, approved painterly treatment or child-accessible movement. This is an authoring-geometry improvement, not an art/UX acceptance.

## Why this slice exists

The E0 consumer generated a valid, deterministic GLB, but inspecting its actual geometry revealed a **scene-composition error in our consumer**, not proven to be a Verdant bug. The objects were authored at fixed global heights while the procedural terrain had varying local height.

Independent measurements on the original GLB:

| Object position | Terrain height (approx.) | Authored height | Mismatch |
| --- | ---: | ---: | ---: |
| Canopy east at (7,-4) | -1.45 m | 0.00 m | **Floats +1.45 m** |
| Memory tree at (8,5) | -0.24 m | 0.00 m | **Floats +0.24 m** |
| Bridge-path junction (0,0) | -0.80 m | 0.02 m | **Floats +0.82 m** |
| Stream top at (0,0) | -0.80 m | -0.28 m | **Sits +0.52 m above terrain** |

A technically valid GLB is not automatically a coherent explorable environment. Fixed-y platforms made paths difficult to read in our debug previews; they cannot be considered traversable solely because the region graph is connected.

## Implementation

1. `terrain_height_at` samples the **triangles of the exact Verdant-generated terrain mesh** using barycentric interpolation. It does not approximate or replace Verdant's procedural height function. Out-of-bounds points and non-finite inputs are refused.
2. Trees are translated so their mesh bases align with that sampled surface.
3. The bridge is anchored 0.15 m above its actual terrain sample. The authored recipe now explicitly names the bridge's crossing landmark and requires it to be within 0.75 m of the bridge center.
4. Each authored path is a tessellated ribbon whose two edges independently follow terrain. It has a 0.065 m nominal surface clearance and a bounded elevation ramp towards the bridge crossing. The generated path is a `verdant_core::geometry::ProceduralMesh` validated and exported by Verdant. This adds narrow **consumer-side authoring glue**, not a competing engine/exporter.
5. The stream is a terrain-following blue ribbon at 0.045 m surface clearance instead of a constant-y box. This represents water in a prototype; it does **not** carve a riverbed or solve hydraulics.
6. `verify-grounding.mjs` independently parses the GLB and checks three tree-base offsets, bridge origin, both path ribbons and the surface-following stream using the **exported ground triangles**, not Rust's claimed internal heights.

## Executable acceptance

`bash run-source.sh` now includes three Rust unit tests for terrain interpolation, ribbon construction and invalid configurations, followed by the normal duplicate-export GLB checks, independent terrain verifier, portrait/landscape PNG generation and invalid-recipe check.

The independent audit's required bounds are:

| Assertion | Required |
| --- | --- |
| Three tree bases | Absolute offset from actual terrain at anchor <= 0.03 m |
| Bridge origin | 0.15 m above terrain sample, tolerance 0.03 m |
| Water ribbon vertices | 0.025–0.065 m above terrain |
| Path ribbon vertices | 0.045–0.94 m above terrain (includes intentional bridge approach) |
| Ribbon tessellation | At least 18 vertices each |
| GLB export | Two byte-identical validated portable outputs |
| Bad endpoint | Must be refused without an output GLB |

**Negative control:** running `verify-grounding.mjs` against the previous valid E0 GLB fails because the tree bases are not terrain-conforming. Therefore the new verification checks a genuine missing property, not merely syntactic construction.

## Limitations and remaining responsibilities

- These are **visual/authoring clearance checks**, not walkability, NavMesh connectivity, real child control access, collision acceptance or physically correct geometry.
- Constant-up normals on ribbons are suitable for low-poly debug geometry, not realistic lighting; curved paths, contour smoothing and bridges spanning varying banks remain open.
- The simple bridge-to-path ramp is an authored heuristic based on the current bridge template's crown rise, not an independently measured continuous surface between bank and deck. Do not treat it as fully collision-safe until a geometry-level clearance/capsule traversal test passes.
- The stream ribbon is not a carved channel and may cross shallow terrain protrusions. The physical relationship between surface and water is aesthetic only.
- Painterly art approval, animal silhouettes, tablet heat/battery, local save authority and release readiness remain completely separate.
- **Published Verdant v2.21.7 crate remains unqualified** as a downstream dependency due to its independent packaging errors. The exact-source path cannot be promoted to a green published-package claim.

### Completion rule

Merge this slice only after the source-mode Rust unit tests, generated artifact, independent GLB/terrain audits, both debug renders, existing Pixel Pals CI, and public-source checks pass at the exact PR head. Otherwise leave in draft and report the failing gate with its log.
