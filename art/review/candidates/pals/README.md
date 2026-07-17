# Canonical Pal Candidate Gate

This directory holds review records and generation anchors for the five starter Pal species. It does not hold production approval merely because an image exists. Civilization has survived this distinction before; the repository will too.

## Required sequence

1. Generate one species asset at a time from the species identity contract in `art/pal-candidate-manifest.json`.
2. Store the file only beneath `art/candidates/pals/<species>/`.
3. Record exact dimensions, byte count, SHA-256 digest, expression, pose, provenance, and human review state in the candidate manifest.
4. Run the candidate manifest verifier and compact tablet review workflow.
5. Compare silhouette, face, proportions, palette, outfit, anchor line, and emotional readability against the approved model sheet.
6. Require a named human decision before copying anything into production or runtime paths.
7. Only after approval, normalize the asset, update the production manifest and generated registry, run the playable game, and capture route evidence.

## Static versus sprite assets

Model sheets and isolated static poses remain ordinary transparent image assets. Sprite atlases are introduced only when a real animation strip or shared-frame sequence requires common anchoring and scale normalization. Static art is not forced into an atlas merely because the word “pipeline” sounds industrious.
