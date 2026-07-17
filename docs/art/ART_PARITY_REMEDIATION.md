# Pixel Pals Art Parity Remediation

## Status

Pixel Pals is not visually production-ready.

The existing alpha SVG renderer remains useful as a functional test fixture, but it does not meet the product’s required painterly storybook standard. It must not be presented as the product’s finished visual identity.

Normal tablet builds therefore block missing production art instead of silently substituting alpha character or scene artwork. Alpha fallback requires the explicit environment variable:

```text
VITE_PIXEL_PALS_ALLOW_ALPHA_FALLBACK=true
```

That variable is permitted only for engineering fixtures and deliberate art-review builds.

## Governing release rule

A live release is blocked until every release-required art record reaches `production` status and has:

- a repository-owned source reference;
- an optimized runtime asset;
- provenance and ownership metadata;
- cryptographic file digests;
- responsive or composable variants where required;
- human review with every required criterion passing;
- compact and large tablet screenshot evidence;
- performance and offline-packaging evidence.

`npm run verify:production-art` and `npm run verify:art-parity-release` are the strict release gates.

## Production batches

### 1. Canonical Pals

Tracked by Issue #85.

Deliver model sheets and reusable living-world atlases for:

- Fox;
- Deer;
- Rabbit;
- Kitten;
- Duckling;
- Fern.

Character art must remain reusable across creation, village, home, activities, Family Map, Family Chronicle, and Memory Journal. Feature-specific duplicate portraits are prohibited.

### 2. Core living-world environments

Tracked by Issue #86.

Deliver reusable painterly scene kits for:

- Willowmere village center;
- Great Tree clearing;
- first-home exterior;
- first-home interior.

Scene kits must preserve interaction and live-character safe areas while supporting landscape and portrait tablet compositions.

### 3. Activities and storybook memories

Tracked by Issue #87.

Deliver active scene kits for Leaf Chase, Stone Stacking, and Garden Game, plus first-session, ceremony, home, and family-memory storybook environments.

### 4. Adventures

Tracked by Issue #88.

Deliver landscape and portrait production pairs for all six adventure variants across Lanterns in the Rain and The Humming Bridge.

The painterly Rain Path pair generated in the working ChatGPT session establishes the intended quality direction, but visual direction alone is not completion. The pair still requires deterministic repository import, human review, tablet evidence, and production promotion.

## Responsive scene intake

Use the repository importer after landscape and portrait WebP files are available locally:

```bash
npm run import:responsive-scene-art -- \
  --asset-id lanterns-in-the-rain-adventure \
  --variant rain-path \
  --landscape /absolute/path/rain-path-landscape.webp \
  --portrait /absolute/path/rain-path-portrait.webp \
  --creator "OpenAI assistant" \
  --ownership-basis "User-directed work product for MythologIQ Labs, LLC" \
  --source-references "chat-generation-landscape,chat-generation-portrait"
```

The importer:

1. verifies both files are readable WebP assets;
2. verifies landscape and portrait orientation;
3. enforces manifest byte budgets;
4. copies source, production, and runtime files;
5. calculates SHA-256 digests;
6. updates manifest dimensions and provenance;
7. creates or refreshes a pending human-review decision;
8. regenerates the runtime registry.

Import always produces a `benchmark` candidate. Import is not human approval.

## Review and promotion

Human review must evaluate:

- visual quality;
- storybook identity;
- environmental depth;
- live-Pal safe areas;
- portrait and landscape continuity;
- child suitability;
- accessibility;
- source originality and similarity risk;
- ownership and rights;
- tablet readability;
- performance evidence.

Only reviewed assets may move to `approved` or `production`.

## CI separation

CI now builds and tests three distinct configurations:

1. Honest production build: alpha fallback blocked, with explicit evidence that missing art does not render as alpha SVGs.
2. Alpha functional fixture: alpha fallback explicitly enabled for gameplay and persistence regression tests.
3. Benchmark art-review build: benchmark environments enabled with alpha character fixtures only where production character art is not yet available.

These configurations must remain separate. Passing functional tests with alpha fixtures does not demonstrate production visual readiness.

## Coverage reporting

Run:

```bash
npm run generate:art-parity
```

The report is written to `artifacts/art-parity/` and identifies every release-required record that remains planned, benchmark, or approved rather than production.

The report is retained as CI evidence on every pull request.
