# Human Art Review and Promotion

Pixel Pals does not treat a technically valid image as production art merely because it loads, decodes, fits a viewport, or came from a convenient generation tool. That would be an impressively efficient way to ship placeholder art forever.

This workflow governs promotion from `benchmark` to `approved` and then to `production`.

## Status meanings

- `planned`: the slot exists, but no file or provenance claim is allowed.
- `benchmark`: a file may exercise crop, registry, decode, packaging, and performance behavior. It is not visually approved.
- `approved`: a named human reviewer approved the exact responsive pair and every required review criterion passed.
- `production`: the approved pair is release-ready and remains bound to its reviewed file digests and provenance.

## Decision records

Human review decisions live under:

```text
art/review/decisions/
```

Use `art/review/HUMAN_ART_REVIEW_TEMPLATE.json` as the starting point.

Each decision binds one manifest asset and one responsive variant to:

- the exact landscape and portrait view IDs;
- a decision of `pending`, `rejected`, or `approved`;
- a named human reviewer for approval;
- a review timestamp;
- SHA-256 digests for both reviewed files;
- explicit pass, fail, or pending states for every criterion;
- required revisions;
- review notes.

AI systems, build tools, and technical intake automation may prepare evidence, but they do not satisfy the human reviewer requirement.

## Required review criteria

Approval requires `pass` for all of the following:

1. `visualQuality`: anatomy, rendering, lighting, texture, composition, and finish meet the intended production bar.
2. `storybookIdentity`: the image belongs to Pixel Pals rather than resembling a generic game background or unrelated franchise.
3. `environmentalDepth`: the scene has meaningful foreground, middle distance, atmosphere, and readable spatial storytelling.
4. `livePalSafeAreas`: the saved first Pal and Fern can be overlaid without covering essential scene information.
5. `portraitAndLandscapeContinuity`: both orientations depict the same place, moment, lighting, and narrative facts.
6. `childSuitability`: the scene is inviting, age-appropriate, understandable, and free of distressing accidental imagery.
7. `accessibility`: meaning does not depend on color alone, important forms remain readable, and reduced-motion presentation remains complete.
8. `sourceSimilarity`: the work does not imitate a named artist, studio, franchise, copyrighted character, or identifiable protected composition.
9. `ownershipAndRights`: origin, generation or creation method, modifications, and release rights are documented.
10. `tabletReadability`: the scene reads at every declared tablet profile without tiny essential detail or destructive cropping.
11. `performanceEvidence`: browser decode, encoded size, memory growth, and responsive source selection remain within the declared budgets.

## Promotion sequence

1. Produce the landscape and portrait files outside normal production builds.
2. Record complete provenance in the manifest.
3. Keep both views at `benchmark` while technical and visual review occurs.
4. Run:

```bash
npm run verify:art-plan
npm run verify:art-reviews
npm run verify:art-registry
npm run generate:art-review
```

5. Review both orientations against the generated safe-area report and physical tablet evidence.
6. Complete the decision record with a named human reviewer, timestamp, exact file digests, criteria, and revisions.
7. Promote both manifest views together to `approved` only after the decision is approved.
8. Re-run the full CI matrix with `VITE_PIXEL_PALS_ART_STATUS=approved` before any production promotion.
9. Promote to `production` only after physical tablet verification and release review.

Landscape and portrait files are one responsive unit. Half-promoted pairs are invalid.

## Automated enforcement

`npm run verify:art-reviews` fails when:

- a non-planned responsive pair has no decision record;
- view IDs or statuses disagree;
- an approved or production pair lacks an approved human decision;
- approval lacks a named human reviewer or valid timestamp;
- any required criterion is not `pass`;
- required revisions remain open;
- reviewed file digests no longer match the current files;
- manifest provenance does not state `humanArtApproval: true`;
- the provenance reviewer does not match the decision reviewer;
- a reviewed file is missing or exceeds its byte budget.

The verification writes retained evidence to:

```text
artifacts/art-review-decisions/summary.json
```

## Current Rain Path state

The current Rain Path landscape and portrait files remain technical benchmarks. Their decision is `pending`, and only the performance criterion is presently satisfied. They must not be promoted without replacement by a painterly, human-reviewed pair or an explicit human decision that the final pair meets the production bar.
