# File Index — Razor Remediation Movement Log

**Generated**: 2026-07-15 by `/qor-organize` (within `/qor-auto-dev-1` cycle)
**Archetype**: npm-monorepo (high confidence — workspaces in root package.json)
**Scope**: audit V1 razor-overage remediation. Structure-only decomposition; no behavior change.

## Convention Assessment

The decomposition follows detected conventions: feature folders under `apps/tablet/src/` (`app/`, `parentGate/`, `parentTools/`), module-per-concern under `packages/content-schema/src/` with a barrel `index.ts` preserving the public API. No deviations introduced. Governance directories (`.agent/`, `.claude/`, `.qor/`) untouched per isolation mandate.

## Movement Log

| # | Action | Source | Destination(s) |
|---|--------|--------|----------------|
| 1 | split | `packages/content-schema/src/index.ts` (386 lines) | `primitives.ts`, `entities.ts`, `worldBase.ts`, `worldChecks.ts`, `world.ts`, `migration.ts`, re-export barrel `index.ts` |
| 2 | split + move | `apps/tablet/src/ParentAccessGate.tsx` (295 lines, deleted) | `parentGate/credential.ts`, `parentGate/useParentGate.ts`, `parentGate/ParentGateDialog.tsx`, `parentGate/ParentAccessGate.tsx` |
| 3 | split | `apps/tablet/src/ParentTestTools.tsx` (262 lines, rewritten as 40-line composer) | `parentTools/playtestExport.ts`, `parentTools/BackupSection.tsx`, `parentTools/ObservationSection.tsx`, `parentTools/ResetSection.tsx` |
| 4 | split | `apps/tablet/src/App.tsx` (497 lines, rewritten as 49-line orchestrator) | `app/options.ts`, `app/worldQueries.ts`, `app/useWorldSave.ts`, `app/StatusPanels.tsx`, `app/ChoiceGroup.tsx`, `app/CreationPanel.tsx`, `app/VillageView.tsx`, `app/HomeView.tsx`, `app/WorldNav.tsx`, `app/WorldShell.tsx` |

Incidental fixes (structure-only): nested ternary in home-object symbol rendering replaced with `homeObjectSymbols` lookup map; nested ternary in village action-grid branching replaced with early-return `VillageActions` component.

## Rollback

All changes are in git on branch `feat/pixel-pals-genesis`. Roll back with `git revert <refactor-commit>` or `git checkout <pre-refactor-sha> -- apps/tablet/src packages/content-schema/src`. Pre-refactor baseline: commit `ca49928`.

## Verification

- Typecheck: all 5 workspaces PASS
- Tests: 43/43 PASS (tablet 4, content-schema 8, persistence 8, simulation 23)
- Production build + PWA precache: PASS; `verify:artifacts`: PASS
- Dev server HMR: applied cleanly, HTTP 200
- Razor: 0 files > 250 lines (max: simulation/index.ts at 244, pre-existing)
