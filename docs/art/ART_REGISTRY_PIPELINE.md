# Manifest-Driven Production Art Registry

## Purpose

The production art manifests are the source of truth for art status, responsive files, dimensions, crop positions, provenance, and release eligibility.

Runtime registry entries must be generated from those manifests. They must not be maintained independently by hand.

## Commands

```bash
npm run generate:art-registry
npm run verify:art-registry
```

`generate:art-registry` writes `apps/tablet/src/generatedProductionArtRegistry.ts`.

`verify:art-registry` compares the checked-in generated registry to the current manifests and fails when they differ.

## Promotion rules

For an adventure scene variant:

1. Landscape and portrait views remain `planned` while concepts are being explored.
2. Landscape and portrait must be promoted together.
3. Both orientations must use the same status.
4. Non-planned files must live beneath `apps/tablet/public/` so the PWA can cache them offline.
5. The generated registry converts those repository paths into root-relative application URLs.
6. Normal builds still require `production` status.
7. Review builds may explicitly allow `benchmark` or `approved` assets.

A half-promoted responsive pair is rejected. A hand-edited generated registry is rejected. A planned concept never enters the runtime merely because a file exists somewhere in the repository.

## Character composition

Adventure environment art does not contain a fixed first Pal or a baked-in Fern. The runtime composites the saved first Pal and the stable first-neighbor identity over the environment layer.

This preserves all five equal starter choices and prevents storybook art from quietly turning one species into the canonical protagonist.
