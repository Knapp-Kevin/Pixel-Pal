# Verdant Orchard: External Scene-Authoring Experiment

**Scope:** Public, isolated research. Does not modify Pixel Pals gameplay, dependencies, saved worlds, Pal identity or production art.

**Pinned upstream:** [Verdant v2.21.7 at cf25bac29df05f97573ca5ef2a1d83c2f201aff3](https://github.com/afflom/verdant-engine/commit/cf25bac29df05f97573ca5ef2a1d83c2f201aff3).  
**Tracker:** [Pixel Pals #115](https://github.com/Knapp-Kevin/Pixel-Pal/issues/115).  
**Development PR:** [#122](https://github.com/Knapp-Kevin/Pixel-Pal/pull/122).

## Read this first: two different acceptance results

| Qualification | Status | Evidence |
| --- | --- | --- |
| **Exact-source Rust consumer / authored GLB** | **PASS**, initially demonstrated | [External action 45470050027](https://github.com/Knapp-Kevin/Pixel-Pal/actions/runs/45470050027): independent Git-source consumer built, exported identical outputs, validated GLB, rejected invalid recipe |
| **Published verdant-core v2.21.7 crate** | **FAIL / NOT CONSUMER READY** | [Action 45469597645](https://github.com/Knapp-Kevin/Pixel-Pal/actions/runs/45469597645): 17 Rust compile errors because catalog/model includes leave the .crate archive and no-default-feature UORC references are unresolved |
| **Diagnostic PNG generation** | **Local Node unit tests PASS; real-scene qualification pending scoped CI** | `preview-glb.test.mjs`: five tests for deterministic nonblank PNGs, independent portrait/landscape, materials, invalid indices/header, dimension bounds. The current scoped workflow generates both PNGs from a real exported GLB |
| **Pixel Pals game / real hardware** | **NOT STARTED / NOT APPROVED** | No tablet renderer, no approved artwork, no schema/save or engine adoption |

The earlier source test generated an **8-mesh / 2,372-triangle / 131,056-byte** GLB twice with identical SHA-256 `8e3efaa8351ee48297eca3b99ce4bc3d68204cb731df7c2763ec36c80a5d0053`. That proof does not repair the published Cargo package.

Do not silently replace Verdant with an unrelated GLB exporter or weaken the failing published-package test to manufacture a green badge.

## What the working code does

- `src/main.rs` reads strict `orchard.json`, validates seed, bounded coordinates, unique IDs, safe-home graph connectivity, tree/path counts and bridge dimensions, then uses Verdant's public **terrain**, **canopy tree**, **parabolic bridge**, **studio primitive**, **scene graph**, and **glTF exporter** APIs.
- `verify-glb.mjs` independently checks GLB 2.0 framing, embedded binary, buffer-view bounds, materials, mesh accessors, required named nodes, and deterministic byte identity; it writes `source-manifest.json`.
- `preview-glb.mjs` independently reads the exported GLB and produces **fixed-camera diagnostic orthographic PNG previews** at landscape 720×480 and portrait 480×720, with real mesh triangles, simple material colors and a z-buffer. It writes hashes and pixel counts in `preview-manifest.json`.
- `preview-glb.test.mjs` runs without external packages. The PNG renderer is **for source review only**, not a replacement for painterly assets, real-time WebGL, image quality approval or production compositing.
- `invalid-orchard.json` deliberately references an unknown destination in an otherwise correctly shaped recipe. The consumer must reject it before writing a GLB.
- `run-source.sh` makes a clean temporary consumer directory, pins `verdant-core` to an **exact Git commit** with upstream default features, builds two GLBs, validates them, generates two previews, proves the negative test, and copies evidence into ignored `output/`. Source is compiled externally but still requires access to Verdant's full Git source tree at build time.

## Execute the functional source lane

Prerequisites: Rust **1.97.1**, Node.js **22**, Bash, Python 3, Git, network access for first-time Cargo resolution.

From this experiment directory:

```bash
rustup toolchain install 1.97.1 --profile minimal
node --test preview-glb.test.mjs
bash run-source.sh
```

The successful script creates these local-only outputs under `output/`:

| File | Purpose |
| --- | --- |
| `source-orchard.glb` | Actual authored Verdant-exported scene |
| `source-manifest.json` | Source pin, input/output SHA-256, mesh/triangle/node counts and output bytes |
| `source-Cargo.lock`, `source-cargo-lock.sha256` | Resolved transitive dependency evidence |
| `orchard-landscape.png`, `orchard-portrait.png` | Generated geometry debug previews at two fixed orientations |
| `preview-manifest.json` | Preview dimensions, painted-pixel counts and image SHA-256 |

The standalone tool's output is a portable binary GLB. Pixel Pals never loads this experiment's generated data automatically.

## Reproduce the **published-package failure** separately

The directory's `Cargo.toml` deliberately references `verdant-core =2.21.7` from Verdant's **release-specific sparse registry**, `default-features=false`. Its local `.cargo/config.toml` points to the versioned raw GitHub mirror. This path is *not* what `run-source.sh` uses.

```bash
mkdir -p output
cargo +1.97.1 run --release -- orchard.json output/released-orchard.glb
```

At the pinned release, this fails while compiling Verdant's own `.crate`: embedded `../../../catalogs/` and `../../../model/` files are outside the packaged source, and optional UORC symbols are not consistently feature-guarded. The dependency archives themselves resolve via the raw mirror. An earlier jsDelivr mirror returned HTTP 403 for a transitive index entry.

The [scoped workflow](../../.github/workflows/verdant-consumer.yml) executes **source and diagnostic PNG tests on each experiment PR**. The strict released-package probe is available only via `workflow_dispatch` with `test_released_crate=true`, and is **expected to fail until upstream fixes its release**. A green source job must never be cited as a green package test.

## First actual GLB visual inspection: source proof

A real Verdant-generated GLB (source SHA-256 `8e3efaa8351ee48297eca3b99ce4bc3d68204cb731df7c2763ec36c80a5d0053`) was downloaded from [source-run 45470050027](https://github.com/Knapp-Kevin/Pixel-Pal/actions/runs/45470050027), rendered locally into landscape/portrait PNGs, and inspected. The scene visibly contains **three canopy-tree forms, a bridge, two authored path segments, a blue water slab and a broad terrain surface**.

**Positive technical result:** both images render offline from the actual portable GLB without loading any Verdant runtime. Corrected diagnostic previews are nonblank and produced by drawing the actual triangles with z-buffer occlusion; no AI-generated illustration or substitute game scene was used.

**Adversarial correction:** first render incorrectly favored farther surfaces and obscured trees behind terrain. The depth sign and camera framing were corrected. A new regression test draws exactly overlapping near-red/far-green geometry: **old implementation 5 pass / 1 fail; corrected implementation 6/6 pass locally**. The GitHub workflow must independently reconfirm the committed fix.

**Visual quality finding:** the broad mostly flat land plate dominates the view, the three canopy trees look similar, and the sparse bridge/stream/path composition does not yet read as a painterly children's-book environment. Path legibility is weak, especially where bridge and pathway overlap. These are findings about **this simplified authored fixture and diagnostic renderer**, not claims about Verdant's maximum artistic capability. They establish concrete next-generation needs: richer foliage silhouette variation, believable riverbank/bridge alignment, visible paths and intentional foreground/background layer composition.

**Local preview qualification (corrected renderer):**

| Diagnostic viewport | Resolution | GLB triangles traversed | PNG SHA-256 |
| --- | --- | --- | --- |
| Landscape | 720×480 | 2,372 | `771a81ae7c48575dd55705ff4811186e3422d96b46bba92873aa3b7b364e481d` |
| Portrait | 480×720 | 2,372 | `5f80d2e594f23b6bf5af90d392f933fb2a044c4263effe80eb1525ba1c18f005` |

**These are debug previews only.** No approved art, physical tablet rendering, collision/route validation or family playtest resulted from this visual inspection. The scoped workflow uploads fresh images for independent review after it completes.

## Acceptance criteria and next useful fixes

**Source baseline:** exact revision; successful external Rust compile; real Verdant mesh generation; valid self-contained GLB; **two byte-identical exports**; seed/recipe and lock provenance; unknown destination refused; two generated PNGs with image hashes. The image previews must be visually reviewed before any quality conclusion.

**Published-package recovery:** the Verdant author packages all required embedded catalogs or refactors their paths, correctly gates UORC methods under disabled features, and adds an **outside-workspace verdant-core scene-export consumer** to the release checks. The registry workflow's external `verdant-tensor` smoke test alone is insufficient.

**Future optional art qualification:** inspect landscape/portrait images, test composition legibility, compare with hand-authored painterly 2D/2.5D candidates, measure authored correction effort, then measure actual tablet memory, load time, frame rate, offline behavior, accessibility and battery. No general observer, AI, player-memory authority or networking enters Pixel Pals' child-facing app on this evidence.

## Boundaries and limitations

The geometry fixture is a five-kind scene (terrain, trees, bridge, paths and stream), **not a complete game level**. A connected undirected graph does not demonstrate that children can physically traverse the path, that the path is obstruction-free, or that any story can be safely completed. The simple diagnostic renderer ignores advanced materials, textures, alpha blending, animations, occlusion masks, browser-specific render effects and painterly art direction; it provides no automated aesthetic approval.

The Git revision and Rust toolchain are pinned, and the resulting resolved `Cargo.lock` is captured as evidence, but the first source build resolves registry packages online and is **not a formally hermetic offline build**. No actual child data is read or stored. An artifact's successful generation is not production acceptance.
