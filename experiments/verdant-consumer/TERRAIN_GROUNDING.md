# Verdant Orchard E1: Terrain-Conforming Authoring Slice

**Status:** Experimental, subject to exact-source Rust and independent GLB qualification.  
**Based on:** [external consumer PR #122](https://github.com/Knapp-Kevin/Pixel-Pal/pull/122), source Verdant v2.21.7 `cf25bac29df05f97573ca5ef2a1d83c2f201aff3`.  
**Tracking:** [research #115](https://github.com/Knapp-Kevin/Pixel-Pal/issues/115).  
**Code:** `src/grounding.rs`, `src/main.rs`, `verify-grounding.mjs`.

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
