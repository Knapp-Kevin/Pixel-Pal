# Canonical Pal Candidate Gate

This directory holds review records and generation anchors for the five starter Pal families and Fern. It does not hold production approval merely because an image exists. Civilization has survived this distinction before; the repository will too.

The canonical package order is:

1. Fox starter family
2. Deer starter family
3. Rabbit starter family
4. Kitten starter family, using runtime species key `cat`
5. Duckling starter family, using runtime species key `duck`
6. Fern, using runtime species key `rabbit` and stable art identity `fern`

## Candidate intake

Preserve generated or painted source art as a transparent PNG. Candidate sources may be larger than the runtime budget because destructive runtime compression belongs after visual approval, not before it.

```bash
npm run import:pal-candidate -- \
  --character-key starter-fox \
  --asset-key idle-happy \
  --source /absolute/path/to/fox-idle-happy.png \
  --source-references chat-generation:<reference>
```

The command validates the canonical package and asset key, requires a real alpha channel, checks dimensions and source byte budget, calculates SHA-256, copies the PNG beneath `art/candidates/pals/<character-key>/`, updates `art/pal-candidate-manifest.json`, and creates a digest-bound pending review record in this directory.

Existing candidates are not overwritten silently. An intentional replacement requires `--replace true`, creates a new digest-bound pending review record, and invalidates any prior visual decision for those bytes.

## Required sequence

1. Generate one character asset at a time from the identity contract in `art/pal-candidate-manifest.json`.
2. Import the transparent source through `scripts/import-pal-candidate.mjs` rather than copying files or editing JSON manually.
3. Run the candidate manifest verifier and compact tablet review workflow.
4. Compare silhouette, face, proportions, palette, outfit, anchor line, and emotional readability against the approved model sheet.
5. Require a named human decision before copying anything into production or runtime paths.
6. Only after approval, normalize the asset, update the production manifest and generated registry, run the playable game, and capture route evidence.

## Static versus sprite assets

Model sheets and isolated static poses remain ordinary transparent image assets. Sprite atlases are introduced only when a real animation strip or shared-frame sequence requires common anchoring and scale normalization. Static art is not forced into an atlas merely because the word “pipeline” sounds industrious.
