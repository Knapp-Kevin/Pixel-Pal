# Verdant Engine + Pixel Pals: Start Here

**A public collaboration invitation, 2026-11-23.**  
**Owner:** Pixel Pals | **Technical tracker:** [#115](https://github.com/Knapp-Kevin/Pixel-Pal/issues/115)  
**Expanded evidence and gap map:** [Contributor Handoff and Capability Gaps](VERDANT_CONTRIBUTOR_HANDOFF_AND_GAPS.md)


## November 24 update: a better integration starting point

**Important change since this brief was written:** Verdant has reached [v2.21.7](https://github.com/afflom/verdant-engine/releases/tag/v2.21.7), exact source [cf25bac](https://github.com/afflom/verdant-engine/commit/cf25bac29df05f97573ca5ef2a1d83c2f201aff3). At that revision, [bootstrap passed on Linux x86 and ARM](https://github.com/afflom/verdant-engine/actions/runs/45442139567) and [Pages assembled and published successfully](https://github.com/afflom/verdant-engine/actions/runs/45442139690). The earlier v2.20 failures described in the longer research history are **resolved at the latest inspected upstream CI head**, not ongoing failures.

**New opportunity:** the [v2.21.7 release](https://github.com/afflom/verdant-engine/releases/tag/v2.21.7) publishes versioned archives for all four Verdant Rust products plus a **release-pinned Cargo sparse index** and dependency archives. This makes a standalone *external* geometry-only consumer demo a more realistic first collaboration. Verdant's registry verification includes an outside-workspace consumer of **verdant-tensor**; we have **not yet independently compiled a verdant-core geometry consumer**, generated a Pixel Pals GLB, or validated actual tablets. The next best contribution is now a **minimal verdant-core consumer built from these released packages**, including an authored GLB, hash manifest and screenshot. A small portable offline .holo release artifact may also help share an authoring demonstration, not replace Pixel Pals' app.

**What did not change:** the CLI still builds the engine's canonical scene in pack-scene; a Pixel Pals authored nature-region input interface and fixed-camera image/depth-layer exporter are **not demonstrated**. The general browser worker still invokes the observer during frames. Recent low-bit model-weight encoders are interesting engineering work but **do not establish child-safe local AI or better adventure storytelling**. Preserve game authority, privacy, artistic review and tablet testing.

## Why we're reaching out

We're building [Pixel Pals](https://github.com/Knapp-Kevin/Pixel-Pal), an offline-first, family-friendly tablet game in which relationships and memories matter more than collecting items. Our next-generation adventure concept includes bounded, explorable regions, different companion contributions, and worlds that remember what players actually did.

We've reviewed [Verdant Engine](https://github.com/afflom/verdant-engine) and see real potential in its procedural geometry, GLB export, navigation and portable 3D tooling. We're **not asking to replace the Pixel Pals game engine**, rewrite our saves, or adopt all Verdant subsystems. We'd like to learn whether a **small independent capability** could help us build and review better places to explore.

**We welcome correction.** If there's already a Verdant capability we missed, a working example is more valuable than a new feature. If our desired use is outside Verdant's scope, that's useful feedback too.

## The gaps most relevant to us

| Need | What we verified | What's missing or not demonstrated for our use |
| --- | --- | --- |
| **1. Authored nature region -> GLB** | Verdant has seeded terrain/templates and GLB exporters; current CLI pack-scene builds its own canonical scene | A documented, constrained, standalone input-to-GLB workflow for a specific meadow/trees/bridge/path layout |
| **2. Reproducible geometry-only consumer** | Verdant builds in its own workspace with pinned Cargo.lock inputs | Clean external example with explicit source, toolchain, transitive pins, output hash, and minimal feature/dependency surface |
| **3. 2D/2.5D art tooling** | PBR renderers and an offline WebGL2 primitive player exist | Repeatable fixed-camera captures, safe areas, optional depth or foreground masks suitable for later *human-reviewed* painterly artwork |
| **4. Optional child-facing viewer** | Current general worker renders scenes but also steps observer state on frames | A small renderer-only API without observer, network, AI, multiplayer, operator tools or engine-owned saves. **This is not our initial ask** |
| **5. Build/device confidence** | At v2.21.7, Linux x86 and ARM bootstrap plus Pages checks pass | Independent geometry-only external consumer build, real tablet hardware and production-art evidence are still needed |

These are **consumer gaps**, not a claim that the underlying engine cannot do the work. In particular, geometric pathfinding and narrative-state reachability already exist in Verdant. Pixel Pals keeps authority for Pal identity, relationship outcomes, consent, accessibility decisions and persistence.

## A useful first contribution, if it fits Verdant's roadmap

**One small offline nature scene, reproducibly exported as an ordinary GLB.**

The inputs could be a tiny JSON recipe or a Rust builder: fixed seed, clearing, canopy tree, stream/bridge, two landmarks, connecting path and camera preset. We'd value:

1. An exact source pin and documented one-command build/export from a clean environment.
2. A standard valid GLB, plus a manifest of byte size, geometry count and SHA-256; prove repeated results or explain any non-deterministic bytes.
3. A preview image or short video so we can evaluate composition and practicality.
4. One meaningful negative test and a note explaining dependency/licensing and ARM implications.

**No full game, no child data, no account, no final artwork, and no obligation to build a runtime integration.**

A second optional contribution would be camera-locked image/depth-mask export; a third could be a documented minimal geometry-only crate configuration or explanation of why a different tool is more suitable.

## What we've already accomplished on our side

We have two isolated, merged Pixel Pals experiments for deterministic adventures:

- [E0 results](VERDANT_E0_FORGOTTEN_ORCHARD_RESULTS.md): 11 passing local tests, 12,000 single-outcome fixture traces.
- [E0b results](VERDANT_E0B_STAGED_ORCHARD_RESULTS.md): 13 passing local tests, 4,096 multi-checkpoint paths with guarded actions, gentle return and replay consistency.

Those prove a **small fixture validation approach**, not production narrative quality. Neither uses Verdant. They are available to inspect if you want to understand why our region geometry, safe return and event-grounding needs exist.

## Questions we'd genuinely like your opinion on

- Is there already a supported way to construct **arbitrary authored scenes** and export GLB outside Verdant's canonical scene packer?
- What is the least complicated **geometry-only, offline** Verdant integration? Which crates and features would you use?
- Can the existing toolchain produce consistent scene screenshots, camera views, or depth layers without importing the full runtime?
- Can the newly green ARM build and released Cargo closure be demonstrated in a **small external verdant-core geometry consumer**?
- Would you approach this as a Verdant export example, a reusable authoring API, or something entirely different?

**Our suggested first shared success:** a repeatable tree/bridge/meadow GLB built from bounded source inputs. From there we can compare painterly 2.5D composition with an optional live 3D scene on actual tablets. Adoption remains a separate decision.

## Where to contribute or respond

You can comment on [Pixel Pals research issue #115](https://github.com/Knapp-Kevin/Pixel-Pal/issues/115) with corrections, examples or proposed scope. Reusable engine changes belong in your own Verdant repository and under your own development process. No Pixel Pals write access is required.

For underlying code, acceptance gates, source links, precise CI findings and tradeoffs, use the [expanded contributor brief](VERDANT_CONTRIBUTOR_HANDOFF_AND_GAPS.md). Our [architecture ADR](../architecture/ADR-VR-001-VERDANT-INTEGRATION.md) explains why Pixel Pals' game authority, artwork approval and child-facing trust boundaries stay separate.
