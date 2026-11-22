# Public Release Preparation for Pixel Pals

**Status:** PUBLIC SOURCE, ART/SAFETY RELEASE GATES REMAIN ON HOLD. The owner changed GitHub visibility to public on November 22, 2026. That action does **not** authorize deploying a child-facing game or promoting artwork to production.

## Product identity and source authority

- Repository: `Knapp-Kevin/Pixel-Pal`, default branch `main`.
- Starting public-readiness baseline: commit `d8813c7adfe6eb9612f88f8bd27542f7d084ccdf`.
- README uplift: Repository README Architect v0.3.0, UPLIFT mode.
- Audience: curious players and parents, interested contributors, and developers examining an offline-first tablet PWA.
- This project grew from ideas explored with the creator's children. Do not publish children's names, photographs, schedules, devices, correspondence or personally identifying stories.

## Verified at the baseline

- [x] At the July 2026 preparation baseline, the repository was private. **Current live visibility is public (verified November 22, 2026).**
- [x] The root README contains a truthful engineering-alpha status, runnable source-checkout commands, architecture, product boundaries and art limitations.
- [x] Root `package.json` uses private npm-workspace packaging, Node.js 22+ and explicitly defines `dev`, `build`, `typecheck` and `test` scripts.
- [x] The two tracked `apps/tablet/.env.*` mode fixtures contain art build flags, not access tokens.
- [x] A recursive baseline tree inventory found no filenames ending in `.pem`, `.p12`, `.pfx`, or `.key`, and no obvious committed `secrets` or token files.
- [x] The new README avoids presenting concept branding as finished gameplay art.
- [x] The banner and social preview have been committed as real PNGs: 1600×520 (786,531 bytes) and 1280×640 (813,564 bytes). The dedicated image renderer and PNG signature/dimension verifier passed on GitHub Actions.
- [x] README source-level preservation and local navigation check: all 40 baseline headings retained; 22 linked references checked; seven internal anchors; zero unresolved local paths or anchors. This is not a full remote link or browser-rendering audit.
- [x] Read-only public-source disclosure job passed on the PR branch: 235 tracked text files scanned, zero high-confidence secret patterns, seven binary files excluded. One contact-like reference was the public vendor contact in the `glob` package's deprecation notice within `package-lock.json`. Job evidence: [Public source disclosure run](https://github.com/Knapp-Kevin/Pixel-Pal/actions/runs/44995813325). This is **not** a full personal-name, history, binary or GitHub Actions-log audit.

## Public-source cleanup and remaining child-facing release gates

- [ ] **License decision.** No root `LICENSE` was present at baseline. Choose terms deliberately for code, documentation, original characters, concept artwork and model/third-party generated assets. Public visibility alone is not an open-source license; do not silently choose MIT for family creative work.
- [ ] **Full content and history disclosure review.** Inspect all tracked source, documents, issue/PR discussion, commit author metadata and reachable Git history for tokens, credentials, private links, personal names, child/family records and unpublished material. A filename scan is not a secrets scan.
- [ ] **Rights/provenance review.** Confirm ownership or permission for the painterly source artwork, fonts, brand image, icons and other creative assets before redistribution.
- [ ] **README/asset verification.** Confirm the checked-in `assets/brand/readme-banner.png` renders on GitHub; confirm `assets/brand/social-preview.png` is 1280×640 and legible at small preview sizes. Both files are in this PR but are not on `main` until the PR merges.
- [x] **Zod advisory remediation.** [PR #109](https://github.com/Knapp-Kevin/Pixel-Pal/pull/109) merged the Zod 4.6.7 fix on November 22, 2026 with a passing exact-head CI run. Each remaining PR must still pass its own integration checks.
- [ ] **Exact-head CI and maintainer review.** Check the final PR commit, local link/heading verification, required repository checks and unresolved review threads before merging. A green unrelated job is not evidence of release readiness.
- [ ] **Safety and disclosure.** Confirm public docs make no claim of a finished, child-ready app, security certification or completed physical tablet testing.
- [x] **Owner visibility decision.** The owner independently changed the repository to public on November 22, 2026. This is a fact, not a statement that the unchecked release gates passed.
- [ ] **Social preview setting.** The committed PNG is under GitHub's recommended 1 MB limit. After the repository is public, upload `assets/brand/social-preview.png` in GitHub repository settings under **General → Social preview**. Checking a file into the repo does not automatically configure GitHub's social card.
- [ ] **Public smoke test.** From a logged-out browser verify the README, banner, image/card preview, license notice, clone instructions and documentation links, then file any discrepancies.

## Asset separation

The banner and social card are *public identity/brand compositions* based on an isolated painterly Rain Path **concept**. They are not registered through the production game-art runtime or the named-human game-art promotion gate. Game-art review remains independently blocked until its own requirements are satisfied.

## README uplift preservation receipt

Baseline: `README.md` at `d8813c7`, SHA-1 Git blob `9d8a509fbcd415943a5d083a816a8c21ee4765b8`.

All baseline major sections and preexisting technical content are retained. The changes are **additive or wording-only**: new banner and accessible alt text; a family-origin explanation; updated alpha/publication wording; an internal art-status link; an explicit development-build warning; and this public-license disclosure. No existing generated region is present, and no technical section is removed or relocated.

No applicable Markdown formatter was detected in the baseline root configuration; `.editorconfig` prescribes UTF-8, LF and final newline. Local formatter execution remains `NOT_RUN`. Readme anchor/link validation, brand-art generation, browser rendering and exact-head CI must be confirmed separately before marking the PR ready.
