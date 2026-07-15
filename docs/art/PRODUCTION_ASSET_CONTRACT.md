# Pixel Pals Production Asset Contract

## Purpose

This contract turns the production art plan into testable asset requirements. The current SVG renderer remains an alpha development fallback. It does not satisfy this contract and cannot be the default visual presentation for a live release.

The machine-readable source of truth is `art/production-manifest.json`.

## Approval states

Every asset uses one of four states.

| State | Meaning |
| --- | --- |
| `planned` | The slot is defined, but no reviewable file has been supplied. |
| `benchmark` | The asset is being used to settle anatomy, texture, lighting, motion, and tooling. |
| `approved` | The asset passed visual, technical, crop, accessibility, and provenance review. |
| `production` | The approved asset was optimized, integrated, and verified in release builds. |

A release-required asset may not ship in `planned` or `benchmark` state.

## Benchmark rule

The first benchmark may use one starter body family for production efficiency, but that choice does not define a canonical starter. The benchmark family remains `null` in the manifest until an explicit art-direction review selects it.

The benchmark must include one complete starter-family model sheet, Fern's model sheet, living-world atlases for both, the Willowmere village scene, the Great Tree clearing, and one finished Great Tree friendship illustration.

## Character requirements

Each starter family and Fern require:

- front, three-quarter, profile, and back views;
- standing, walking, sitting, resting, carrying, working, and playing poses;
- content, curious, delighted, uncertain, thoughtful, sad, and hopeful expressions;
- species-specific anatomy and posture;
- accessory anchor points;
- palette and marking boundaries;
- age-stage notes;
- silhouette tests at compact tablet size.

Fern must remain individually recognizable without labels, clothing, or the generic Rabbit starter design.

## Living-world atlases

Each atlas must document frame dimensions, frame names, pivot points, ground-contact points, accessory anchors, layer ordering, expression overlays, reduced-motion poses, supported palettes and markings, and unsupported combinations.

A compressed character atlas should remain below 850 KB unless tablet profiling justifies a documented exception.

## Scene kits

Scene kits must be layered rather than delivered as one immovable screenshot. Each kit requires background, midground, and foreground layers where appropriate, character anchors, interaction zones, persistent-change layers, safe crops, reduced-motion alternatives, and export settings.

Required viewport crops are:

- 800 x 600;
- 1024 x 768;
- 1366 x 1024;
- 600 x 800;
- 768 x 1024.

The focal interaction and primary characters must remain visible in every crop.

## Storybook illustrations

Storybook illustrations are authored compositions, not screenshots of the living-world renderer. Each illustration requires a full master, approved landscape and portrait crops, readable expressions at compact size, narrative specificity, documented ownership, and a compressed release export below 1.9 MB unless profiling approves an exception.

The first shared activity requires distinct compositions for Leaf Chase, Stone Stacking, and Garden Game.

## Performance budgets

| Asset or load group | Initial compressed budget |
| --- | ---: |
| Compact initial scene | 2.2 MB |
| Standard initial scene | 3.6 MB |
| Large initial scene | 5.2 MB |
| Single character atlas | 850 KB |
| Single scene layer | 1.1 MB |
| Single storybook illustration | 1.9 MB |
| Simultaneously active animation data | 1.5 MB |

Assets should use WebP or AVIF for release imagery when target-browser support and visual testing permit it. PNG remains appropriate for masters, masks, and lossless transparency.

## Provenance requirements

Every non-planned asset requires a record containing the creator or responsible vendor, creation method and tools, source-reference identifiers, ownership basis, creation or acquisition date, modification history, reviewer, approval date, and any restrictions or attribution requirements.

## Naming and paths

Release files must use lowercase kebab-case names. The recommended structure is:

```text
art/
  production-manifest.json
  production/
    characters/
    scenes/
    activities/
    storybook/
    motion/
    provenance/
```

The manifest is the authoritative mapping between stable asset IDs and files. Runtime code must refer to stable asset IDs rather than guessing paths from Pal names.

## Runtime resolution

The application-level production-art boundary is `ProductionArtProvider`. Its registry is mounted once at the tablet root and supplies character and scene assets to every first-session surface.

Normal builds require `production` status. Art-review builds may explicitly set `VITE_PIXEL_PALS_ART_STATUS` to `approved` or `benchmark`. Lowering the threshold is an intentional review action and must not alter the release manifest.

Character requests may include species, stable `artIdentity`, palette, marking, accessory, expression, and pose. Resolution uses the most specific eligible asset. A stable individual identity such as `fern` takes precedence over generic Rabbit-family art. Player-created Pals remain species-driven and do not receive a canonical individual identity.

`Pal.artIdentity` is optional and backward compatible. It is reserved for characters with canonical visual identity. It must not be derived from display names or world-specific Pal IDs.

Scene requests use stable scene IDs and state variants. Examples include Willowmere base, stones, leaf garland, garden blooms, ceremony combinations, home exterior, empty home interior, and each personalized home-object state. A missing exact variant may use an approved base scene only when the remaining state is still represented by composited runtime layers. It may not silently erase a persistent world change.

When no eligible production asset exists, the alpha SVG renderer remains the explicit fallback. This allows incremental integration without allowing benchmark art to ship accidentally. The fallback is acceptable for development, automated tests, and incomplete art review. It remains a live-release blocker.

Storybook illustrations are resolved separately from living-world characters and scenes. A finished storybook illustration may include authored characters and composition, while living-world surfaces remain modular and stateful. These asset classes must not be treated as interchangeable files.

## Automated verification

`npm run verify:art-plan` validates the manifest structure while planned slots remain allowed.

`npm run verify:production-art` is the release gate. It requires every release-required asset to be in `production` state, checks that each file exists, verifies its size budget, and requires complete provenance metadata.

Resolver tests must prove approval thresholds, stable individual identity precedence, expression and pose specificity, scene variant selection, and alpha fallback behavior.

A strict verification failure blocks production release. The alpha renderer may remain available only as an explicit development and automated-test fallback.
