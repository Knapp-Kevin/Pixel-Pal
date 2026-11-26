# Pixel Pals Backlog: Live Triage

**Snapshot:** 2026-11-25, public `main` at [`c17a497d`](https://github.com/Knapp-Kevin/Pixel-Pal/commit/c17a497df5320df44cb7e764da075677cc5dc81c).  
**Live authority:** [open issues](https://github.com/Knapp-Kevin/Pixel-Pal/issues?q=is%3Aissue+is%3Aopen), [open PRs](https://github.com/Knapp-Kevin/Pixel-Pal/pulls), [product roadmap](product/ROADMAP.md), and the production art manifests. This document is a **dated snapshot**, not an automated issue tracker.

Snapshot: **16 open issues, zero open PRs**. Latest main CI and public-source disclosure passed.

## M2 Family Tablet Alpha: critical path

| Order | Issues | Verified state and next deliverable |
| --- | --- | --- |
| **P0 live-Pal art** | [#25](https://github.com/Knapp-Kevin/Pixel-Pal/issues/25), [#85](https://github.com/Knapp-Kevin/Pixel-Pal/issues/85) | Alpha renderer and validation pipeline exist, but **23/23 slots in `art/production-manifest.json`** and **12/12 slots in `art/pal-runtime-manifest.json`** remain `planned`. Require model sheets, living-world atlases, human art review, provenance, byte budgets and approved registry promotion |
| **P0 core environment art** | [#86](https://github.com/Knapp-Kevin/Pixel-Pal/issues/86) | Willowmere, Great Tree and first home need complete responsive scene kits, child-facing overlay-safe compositions, and explicit human acceptance |
| **P0 activity/storybook art** | [#87](https://github.com/Knapp-Kevin/Pixel-Pal/issues/87) | Playable activity software exists; finished activity kits and family-memory illustrations need review, provenance and performance evidence |
| **P0 adventure art** | [#88](https://github.com/Knapp-Kevin/Pixel-Pal/issues/88) | `art/adventure-production-manifest.json`: **12 views total, two `benchmark`, ten `planned`, zero `production`**. Require all 12 approved landscape/portrait views, source/provenance, compositing review and tablet checks |
| **P0 physical tablet acceptance** | [#21](https://github.com/Knapp-Kevin/Pixel-Pal/issues/21), [#1](https://github.com/Knapp-Kevin/Pixel-Pal/issues/1) | Software runs the five-profile desktop browser matrix; **real target tablets are not qualified**. Capture exact models, oldest/lowest-memory device, offline install/save/recovery, parent actions, HTTPS header behavior, heat/battery, independent child navigation and seven-day family observation |

**Order:** production art, then real-device and observed family-play acceptance. Passing desktop CI does not override human art approval, restore safety, physical accessibility or offline acceptance. The manifests still report `manifestStatus: "alpha-blocked"`.

## Valid open work, not reasons to expand scope

| Category | Issues | Triage |
| --- | --- | --- |
| Family Chronicle and Great Tree history | [#84](https://github.com/Knapp-Kevin/Pixel-Pal/issues/84) | Bond/Family Map software exists. Verify the full parent-gated Chronicle edit, migration, persistence, Journal/Great Tree visibility and scene slot before closure |
| Cooperative mini-games | [#26](https://github.com/Knapp-Kevin/Pixel-Pal/issues/26) | Stone Stacking, Leaf Chase and Garden Game are implemented and tested. Remaining issue checkboxes cover actual child tuning, replay variety and physical touch feel. Do not reimplement the trio |
| Historical M0/M1 exit work | [#2](https://github.com/Knapp-Kevin/Pixel-Pal/issues/2), [#3](https://github.com/Knapp-Kevin/Pixel-Pal/issues/3), [#4](https://github.com/Knapp-Kevin/Pixel-Pal/issues/4), [#5](https://github.com/Knapp-Kevin/Pixel-Pal/issues/5), [#6](https://github.com/Knapp-Kevin/Pixel-Pal/issues/6), [#7](https://github.com/Knapp-Kevin/Pixel-Pal/issues/7) | Roadmap reports **software scope implemented**. Before closing individual original issues, reconcile their precise criteria with tested code and any missing physical performance, actual-child comprehension or art-compatibility proof |
| Verdant optional authoring research | [#115](https://github.com/Knapp-Kevin/Pixel-Pal/issues/115) | [#122](https://github.com/Knapp-Kevin/Pixel-Pal/pull/122), [#123](https://github.com/Knapp-Kevin/Pixel-Pal/pull/123), [#124](https://github.com/Knapp-Kevin/Pixel-Pal/pull/124) are **merged**: real pinned-source geometry/GLB, independent terrain validation and public contributor handoff. Published Verdant core 2.21.7 still fails independent consumer compile; painterly review and actual tablet costs are unproved. Research does not authorize full runtime adoption |

**Do not allow M3+ exploration, inference or engine migration to displace M2 art and real-device acceptance.**

## Completed security cleanup (2026-11-25)

- [#108](https://github.com/Knapp-Kevin/Pixel-Pal/issues/108) **closed completed** after merged [security PR #109](https://github.com/Knapp-Kevin/Pixel-Pal/pull/109). Content-schema now declares patched Zod `^4.6.7`, lockfile resolves `4.6.7`, and unchanged `npm audit --omit=dev --audit-level=high` passes on main.
- [#111](https://github.com/Knapp-Kevin/Pixel-Pal/issues/111) **closed duplicate** of #108 for the same advisory. This fixes that specific historical security finding, not all future vulnerability risk.

## Repository hygiene and closure rules

- No open PRs at snapshot. [Main CI](https://github.com/Knapp-Kevin/Pixel-Pal/actions/runs/45718829109) and [public-source audit](https://github.com/Knapp-Kevin/Pixel-Pal/actions/runs/45718829242) were green.
- `docs/SYSTEM_STATE.md`, `docs/META_LEDGER.md`, and `docs/FILE_INDEX.md` contain **historical July governance evidence**. Do not treat those snapshots as live status or erase their provenance. [Feature Index](FEATURE_INDEX.md) gives the current source/test map.
- Historical suggestions such as new genetics packages, a shared UI workspace or Capacitor packaging are **deferred**, not current M2 release blockers.
- Close an issue only when its actual original acceptance criteria are evidenced. Distinguish **software-implemented**, **art/user/device-unverified**, and **deferred**; green CI alone does not certify a child-facing release.
