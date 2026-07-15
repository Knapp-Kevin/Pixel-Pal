# Pixel Pals Adversarial Design and Code Review

## Review metadata

- Date: 2026-07-15
- Scope: first playable vertical slice, offline persistence, world schema, simulation transitions, backup and restore, child-facing failure behavior, parent controls, PWA lifecycle, and CI reproducibility
- Review posture: assume malformed data, rapid repeated input, interrupted writes, stale clients, mistaken adult actions, hostile or accidental imports, and future content growth
- Release judgment: suitable for internal observed playtesting; not yet approved for public release

## Failure model

This review assumes that:

- a child may tap the same action repeatedly or navigate during a save;
- a child may give their Pal the same name as an existing resident;
- a browser write may be interrupted or a checkpoint may become malformed;
- an adult may select the wrong backup file;
- imported JSON may be malformed, oversized, internally inconsistent, or from an unsupported schema version;
- duplicate IDs or dangling references may enter through future tooling;
- a service worker may discover an update during active play;
- dependency ranges may resolve differently on different days;
- future developers may mistake display text for identity;
- graceful recovery matters more than preserving a partially applied action.

## Findings and remediation

| ID | Severity | Finding | Status | Remediation |
| --- | --- | --- | --- | --- |
| AR-001 | Critical | The first neighbor was resolved by the display name `Fern`. A first Pal also named Fern could break activity and ceremony logic. | Fixed | Added stable `storyRole` identity with relationship fallback. Simulation and journal code now use IDs and roles rather than names. |
| AR-002 | Critical | A malformed active checkpoint could be rotated into the recovery slot during a later save, destroying the last valid fallback. | Fixed | Checkpoint rotation now validates the active world inside one atomic transaction and promotes only a valid checkpoint. |
| AR-003 | Critical | Multiple rapid saves could race and apply out of order. | Fixed | Persistence mutations are serialized, and UI actions are locked while a save is active. |
| AR-004 | Critical | A selected backup immediately replaced the active world after validation, without a review step. | Fixed | Restore is staged, summarized, and requires an explicit `RESTORE` confirmation. |
| AR-005 | Critical | The world schema accepted duplicate identities and multiple dangling or inconsistent references. | Fixed | Schema version 2 adds duplicate checks, bounded collections, relationship checks, memory checks, household consistency, village residency consistency, and Great Tree reference validation. |
| AR-006 | High | Backup files had no size ceiling. | Fixed | Backup import and export are limited to 2 MB, with file size checked before reading and serialized byte length checked before parsing. |
| AR-007 | High | UI state changed optimistically but did not roll back when persistence failed. | Fixed | The app returns to the previous valid world and reports that the action was not saved. |
| AR-008 | High | A render exception could leave a blank application surface. | Fixed | Added a child-safe error boundary that preserves the save and offers a reload action. |
| AR-009 | High | The PWA used automatic service-worker activation, allowing a running session to change underneath the player. | Fixed | Updates are staged and require an explicit `Update and reopen` action. |
| AR-010 | High | The repository had no deterministic dependency lockfile, and CI used `npm install`. | Fixed | Added `package-lock.json`; CI now uses `npm ci`, pinned Action commits, lockfile-based caching, and a high-severity production dependency audit. |
| AR-011 | High | Persistence transaction behavior lacks a browser-like IndexedDB integration test. | Open | Add `fake-indexeddb` or browser-level persistence tests covering interrupted writes, active corruption, recovery promotion, and queued saves. |
| AR-012 | Medium | Parent and playtest tools are visible behind a one-tap disclosure rather than a true adult gate. | Open for production | Internal playtests may use the current panel. Public builds require a parent-mode entry pattern that is inaccessible through casual child interaction. |
| AR-013 | Medium | Unsupported imported species currently fall back visually to Fox in the tablet renderer. | Open | Reject non-renderable species in the current tablet profile or add a deliberate generic fallback body family. Never silently misrepresent species. |
| AR-014 | Medium | Deployment security headers and a Content Security Policy are not yet defined. | Open | Add hosting-specific CSP, frame, referrer, MIME-sniffing, permissions, and cache headers before private external deployment. |
| AR-015 | Medium | PWA manifest icons and final installability assets are incomplete. | Open | Add approved icons and validate installability on each target tablet. |
| AR-016 | Medium | The current first-session event functions use one global event type as their idempotency key. | Accepted for vertical slice | Replace with explicit event-instance identity before multiple activities or ceremonies of the same type become possible. |
| AR-017 | Medium | Schema validation can become expensive as saves approach maximum collection sizes. | Partially mitigated | Collection and backup limits constrain exposure. Convert remaining repeated membership checks to precomputed sets before large-world testing. |
| AR-018 | Medium | No oldest-device performance, storage-quota, or low-memory failure test has been completed. | Open | Test the oldest target tablet with offline installation, save growth, update activation, and storage pressure. |

## Design-level adversarial conclusions

### The first Pal must remain chosen without becoming owned

The current design correctly avoids a canonical starter and does not treat the first Pal as an inventory item. Future progression systems must not convert emotional importance into mechanical superiority, exclusive rewards, or ownership language.

### Memory must remain history rather than scoring

The journal currently presents structured events rather than achievements. Future significance values must remain internal simulation metadata. They must not become a visible score that teaches children to optimize affection.

### Legacy requires durable identity

Names are presentation. IDs and explicit roles are identity. Every future relationship, household, move, death, adoption, mentorship, and descendant system must preserve stable Pal IDs and immutable historical references.

### Failure must be emotionally quiet

A failed write should cancel or roll back the action. It must not imply that a Pal was harmed, disappointed, abandoned, or lost because the browser failed. Technical failure language belongs in adult tools, not the relationship fiction.

### Adult power must remain separated from play

Backup import, export, reset, test controls, and future diagnostics must remain outside the ordinary child navigation. Destructive controls require explicit review and confirmation. Public builds need a stronger adult gate than the current internal-playtest disclosure.

## Verification completed

The final hardening pipeline passed:

1. lockfile-based `npm ci` installation;
2. high-severity production dependency audit;
3. TypeScript checks;
4. schema and migration tests;
5. simulation transition and idempotency tests;
6. persistence import and backup-boundary tests;
7. production build.

Manual restore, reset, service-worker activation, storage-pressure, and oldest-device checks remain required on real target hardware.

## Remaining release blockers

Pixel Pals is not ready for a public release until at least the following are complete:

- IndexedDB integration tests;
- parent-mode gate;
- deployment security headers;
- installability icons;
- oldest-device and storage-pressure testing;
- accessibility and child-observation findings from the first internal playtest;
- final art and asset-provenance review.

## Current judgment

The hardened vertical slice has a stronger world contract, safer persistence, safer adult controls, stable entity identity, deterministic dependencies, explicit PWA updates, and quieter failure handling than the pre-review build. It is appropriate for internal observed playtesting.

It remains intentionally short of public-release approval. Children should find the bugs in whether the game is fun, not whether the database remembers who their friend was.
