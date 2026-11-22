# Public source readiness

Pixel Pals is a public repository containing a tablet-first game in engineering alpha. Visibility was changed by the repository owner. This document records a **bounded source-level review**, not a completed public child-play release or a certified security review.

## Completed source inspection

- Repository visibility: **public**, default branch: `main`.
- README: refreshed to distinguish source availability, playable engineering alpha, unfinished production art, and physical-device release blockers.
- Checked the default branch's **278 tracked tree entries** for filename-level indications of committed secrets, credentials, backups, large databases, and common private key formats. No such obvious secret filename was present.
- Inspected two tracked `.env` files, `apps/tablet/.env.alpha-fixture` and `apps/tablet/.env.benchmark-art`. Both contained build-art flags only, no credentials.
- Inspected `apps/tablet/src/parentGate/credential.ts`: the parent gate derives a local PIN hash; no embedded parent PIN was identified. **This is not a full security evaluation**.
- Reviewed `docs/deployment/PRIVATE_TABLET_DEPLOYMENT.md`. It describes hosting constraints and cautions, not identifiable playtest data.
- The repository does not have a root `LICENSE` file. Its public visibility does not grant an open-source reuse license.
- The existing README is source-maintained, with no detected README generator ownership markers. Existing detailed sections were retained.

## Not yet verified

- **Entire Git history**, release assets, issues, discussions, PR attachments, or external service configurations for sensitive information. A clean current tree cannot prove historical safety. Run historical secret scanning before wider promotion.
- GitHub secret scanning, private vulnerability reporting, branch protection, and dependency/security settings: verify in GitHub repository settings; the source tree alone cannot establish account-side configuration.
- Effective HTTPS response headers and CSP on a public deployed origin.
- Art rights and redistribution terms, including distinct treatment of source code versus human- or AI-assisted images.
- Production game acceptance, final model sheets, full environment atlas, named human visual approval, and physical tablet playtesting.
- Rendering of the prepared PNG README banner and social preview on GitHub after repository upload.
- Local formatter execution and new-contributor quick-start execution as part of this documentation-only review.

## Publication decisions still required

1. **License:** Choose an explicit license for code and a separate clear policy for illustrations and other art assets. Keep “all rights reserved” as the default absent a grant.
2. **Branding:** Upload the PNG banner to `assets/brand/readme-banner.png` and the PNG preview to `assets/brand/social-preview.png`, then add the verified banner link to the README. Set the social preview in **Settings → General → Social preview** using the uploaded 1280×640 image. The file's presence in Git alone does not set repository metadata.
3. **History and privacy:** Run full-history secret scanning and inspect publicly visible issue/PR attachments and GitHub Actions logs for family or credential information.
4. **Gameplay-release gate:** Keep M3 Production Art, named human review, accessibility, and physical-device evidence mandatory before describing the game as released.

## Scope boundary

This public-facing repository packaging does not change gameplay, persistence, the art registry, production-release blockers, or the owner's approval authority. A green README-only PR does not complete M3 art or a public children’s game release.
