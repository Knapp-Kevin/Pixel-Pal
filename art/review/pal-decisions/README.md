# PalArtwork Human Review Decisions

Each non-planned entry in `art/pal-runtime-manifest.json` requires exactly one JSON decision record in this directory.

A decision binds a named human review to the exact runtime asset ID and SHA-256 digest. Approval requires every criterion to pass, no outstanding revisions, matching production and runtime bytes, and provenance that records the same reviewer and approval timestamp.

Candidate review does not satisfy this gate. Candidate files remain under `art/candidates/pals/`; approved runtime files live under `art/production/pals/` and `apps/tablet/public/art/pals/`.
