# Verdant v2.21.7: External Woodland Scene Consumer

**Status:** isolated integration experiment. Do not add this Rust crate to Pixel Pals' runtime or workspace.
**Source basis:** [Verdant v2.21.7](https://github.com/afflom/verdant-engine/releases/tag/v2.21.7), commit [cf25bac](https://github.com/afflom/verdant-engine/commit/cf25bac29df05f97573ca5ef2a1d83c2f201aff3).
**Tracker:** [Pixel Pals #115](https://github.com/Knapp-Kevin/Pixel-Pal/issues/115).

## Objective

Qualify Verdant as a **standalone, external offline scene-authoring library** by building a separate Rust consumer against its public released crates, without importing the observer, network runtime, native Verdant world snapshot or child data.

The fixture contains a seeded terrain mesh, three Verdant sculpted canopy-tree meshes, a Verdant stone arch bridge, authored landmark connections drawn as platform paths, and a stream slab. It uses **Verdant public generation and GLB export APIs**, not an independent replacement mesh exporter. The output is one ordinary glTF 2.0 binary container.

This is a deliberately small **geometry-only integration probe**, not a painterly art asset, game level, character animation, safe pathfinding implementation, or proof that natural landforms align visually.

## Build and run

Requires Rust **1.97.1** (the pinned upstream toolchain) and Node 22. Run commands **inside this directory** so Cargo loads its local released-version sparse registry configuration:

```bash
rustup toolchain install 1.97.1 --profile minimal
cargo +1.97.1 run --release -- orchard.json output/orchard-first.glb
cargo +1.97.1 run --release -- orchard.json output/orchard-second.glb
node verify-glb.mjs output/orchard-first.glb output/orchard-second.glb output/manifest.json
```

The relative output directory must already exist: `mkdir -p output` first. The scoped GitHub Actions experiment creates it. The preexisting Pixel Pals JavaScript build, dependencies and saved worlds are untouched.

The consumer uses exactly `verdant-core=2.21.7` from Verdant's version-specific sparse registry mirror, with `default-features=false`. This explicitly **does not prove the entire transitive dependency closure is minimal**. The GitHub Actions job captures the resolved `Cargo.lock` as evidence. Upstream verifies a standalone **verdant-tensor** crate consumer, but not this specific `verdant-core` authored-scene consumer.

## Acceptance matrix

1. **External Rust consumer:** Cargo resolves all packages from the release index and builds the isolated program without copying Verdant source into Pixel Pals.
2. **Generated geometry:** Verdant creates terrain, trees, a bridge and a stream from `orchard.json`; every procedural mesh passes Verdant's mesh validator and the combined GLB passes Verdant's GLB validator.
3. **Independent artifact validation:** Node examines glTF 2.0 binary framing, embedded BIN, accessors, views, material references and required authored node identifiers. No runtime URL or externally referenced buffers are accepted.
4. **Reproducibility:** two independent runs with the same recipe and toolchain must produce byte-identical GLB outputs with matching SHA-256. If this fails, retain both artifacts, diagnose before loosening the acceptance contract.
5. **Adversarial failure:** an invalid recipe referring to a nonexistent landmark must fail before writing any GLB.
6. **Provenance:** generate a manifest with version, exact upstream commit, input SHA-256, output SHA-256, byte size, triangle count and recorded Cargo lockfile.

## Boundaries and shortcomings

- The accepted input is deliberately restrictive: five fixed primitive classes (terrain, tree, bridge, walkway, stream), three or more landmarks, finite bounded coordinates, no unsupported attributes or dynamic scripts, and a connected undirected home-return path.
- Safety of a graph path does not guarantee a physically traversable 3D route or accessibility for real children. No collision/navigation/guard conformance is claimed.
- Tree and bridge meshes originate from Verdant, but materials are chosen by the consumer. This is a **low-fidelity authoring fixture**, not production illustration or a child-safe scene.
- No independent GLB visual preview, two-camera composition, texture art, WebGL2 renderer, iPad/Android benchmark, offline cold-start, energy usage or human approval is implied by passing this test.
- Only this experiment's request JSON is consumed. Real Pal identities, world memories, save data and player preferences remain outside the experiment.
- The real Pixel Pals renderer and canonical saves remain authoritative; this produces static assets only.
- Cargo registry URLs and release-hosted archives require internet access **at build time**. The exported GLB is self-contained and contains no network imports.
- **If upstream packages do not compile or export as described, fail explicitly.** Do not silently fall back to a homegrown GLB writer and call it Verdant evidence.

## Continuing gates

Once this build passes, the next proof is a visually inspectable camera-locked screenshot, followed by a portrait/landscape composition comparison with human-reviewed painterly illustrations. Only if that earns approval should we benchmark an optional GLB viewer on physical tablets. The minimum Pixel Pals Family Tablet Alpha artwork and device-validation obligations remain higher priority.
