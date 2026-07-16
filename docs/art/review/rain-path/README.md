# Rain Path Art Review

This page is the stable repository review surface for the first responsive Pixel Pals adventure-art benchmark.

The files shown here are committed directly to the repository. No CI artifact download is required.

## Review status

| Field | Current state |
| --- | --- |
| Adventure | The Lanterns in the Rain |
| Variant | Rain Path |
| Manifest status | `benchmark` |
| Human art approval | `false` |
| Release eligibility | Not eligible |
| Technical purpose | Responsive registry, orientation selection, browser decode, offline packaging, crop behavior, and performance validation |
| Visual purpose | None. These simplified files are not the intended production art direction. |

## Responsive source pair

<table>
  <tr>
    <th>Landscape, 1600 × 1000</th>
    <th>Portrait, 1000 × 1600</th>
  </tr>
  <tr>
    <td align="center">
      <img src="../../../../art/production/adventures/lanterns-in-the-rain/rain-path-landscape.webp" alt="Simplified technical Rain Path landscape benchmark" width="640">
    </td>
    <td align="center">
      <img src="../../../../art/production/adventures/lanterns-in-the-rain/rain-path-portrait.webp" alt="Simplified technical Rain Path portrait benchmark" width="360">
    </td>
  </tr>
</table>

Open the files directly:

- [Landscape benchmark WebP](../../../../art/production/adventures/lanterns-in-the-rain/rain-path-landscape.webp)
- [Portrait benchmark WebP](../../../../art/production/adventures/lanterns-in-the-rain/rain-path-portrait.webp)

The application-served copies are kept under:

```text
apps/tablet/public/art/adventures/lanterns-in-the-rain/
```

## What to evaluate in the replacement art

The eventual painterly pair must be reviewed as one responsive unit.

1. The landscape and portrait files depict the same location, moment, lighting, weather, and narrative facts.
2. Essential scene information remains outside the protected live-character overlay areas.
3. The child-selected first Pal and Fern remain live rendered characters rather than baked-in fixed figures.
4. The scene has production-quality anatomy-independent environment rendering, texture, lighting, depth, and visual identity.
5. The work is inviting and age-appropriate without relying on color alone.
6. Cropping remains readable across all declared tablet profiles.
7. Provenance, rights, source originality, byte budgets, browser decode, and memory evidence remain valid.

## Approval records

The machine-readable decision for this responsive pair is stored at:

```text
art/review/decisions/lanterns-in-the-rain-rain-path.json
```

The decision remains `pending`. The current files satisfy technical performance validation only.

See [Human Art Review and Promotion](../../HUMAN_ART_REVIEW_AND_PROMOTION.md) for the complete promotion contract.

## Canonical implementation paths

| Purpose | Path |
| --- | --- |
| Governed source assets | `art/production/adventures/lanterns-in-the-rain/` |
| Runtime assets | `apps/tablet/public/art/adventures/lanterns-in-the-rain/` |
| Responsive manifest | `art/adventure-production-manifest.json` |
| Generated runtime registry | `apps/tablet/src/generatedProductionArtRegistry.ts` |
| Human review decision | `art/review/decisions/lanterns-in-the-rain-rain-path.json` |
| Review policy | `docs/art/HUMAN_ART_REVIEW_AND_PROMOTION.md` |

## Current conclusion

The pipeline is ready for real art. The current artwork is not.

Replace both files with a coherent painterly responsive pair, complete the human review record, validate the exact reviewed digests in CI, and perform physical tablet review before promotion to `approved` or `production`.
