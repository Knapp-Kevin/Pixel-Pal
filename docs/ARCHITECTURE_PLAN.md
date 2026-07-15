# Architecture Plan

## Risk Grade: L2

### Risk Assessment
- [ ] Contains security/auth logic -> L3 (no auth or accounts exist; deferred by design)
- [x] Modifies existing APIs / logic-critical paths -> L2 (deterministic simulation, persistence integrity, backup import/restore, child-safety constraints are architectural)
- [ ] UI-only changes -> L1

Child safety and privacy are architectural requirements (README § Child Safety and Privacy). Any future account, cloud-save, analytics, social, or monetization feature escalates to **L3** and requires an explicit child-safety and privacy review before implementation.

## File Tree (The Contract — as built)

```text
pixel-pal/
├── apps/
│   └── tablet/                 # Tablet-first PWA game client (TypeScript, React, Vite)
│       └── src/
│           ├── app/            # App shell decomposition: views, nav, world-save hook, options
│           ├── parentGate/     # PIN credential module + gate components
│           └── parentTools/    # Backup, observation, and reset sections
├── packages/
│   ├── simulation/             # Deterministic world and relationship simulation
│   ├── content-schema/         # Validated game content definitions (primitives/entities/world/checks/migration modules)
│   ├── persistence/            # Local-first saves, migrations, backup import/export
│   └── renderer/               # Portrait and scene composition (README names this "art-runtime")
├── scripts/                    # Build-artifact and deployment verification (verify:artifacts, verify:deployment)
├── .github/                    # CI: typecheck, test, installability + deployment verification
└── docs/                       # Governance, schema migrations, Qor-logic DNA
```

Planned-but-not-yet-created boundaries (introduce only when working code requires them, per README):
- `packages/genetics/` — genome, inheritance, phenotype, lineage logic (Phase 3)
- `packages/ui/` — shared accessible touch components
- `content/` — species, lineages, regions, cultures, adventures, skills data

## Interface Contracts

### @pixel-pals/simulation
- **Input**: seed + world state + player/Pal actions
- **Output**: next deterministic world state (same inputs + seed ⇒ same outcomes)
- **Side Effects**: none — pure simulation, rendering-agnostic

### @pixel-pals/persistence
- **Input**: world state; imported backup files
- **Output**: atomic durable saves (IndexedDB or equivalent); versioned migrations; export/backup
- **Side Effects**: local storage writes only. Must recover from interrupted writes; must reject art/schema-incompatible backups before restore (see commits `bed1a7a`, `bedfc26`)

### @pixel-pals/content-schema
- **Input**: game content definitions (species, lineages, traits, regions, adventures, skills)
- **Output**: validated, typed content objects
- **Side Effects**: none — validation only

### @pixel-pals/renderer
- **Input**: Pal/scene descriptors from simulation state
- **Output**: composed modular portraits and scenes (deterministic, static-storybook presentation)
- **Side Effects**: none — game state must not depend on the renderer

### @pixel-pals/tablet (app)
- **Input**: touch-first user interaction (≥48×48 CSS px targets, no hover dependency, landscape-primary)
- **Output**: installable PWA; offline-capable core play
- **Side Effects**: orchestrates simulation ↔ persistence ↔ renderer

## Data Flow

Touch input → tablet app → simulation (deterministic state transition) → persistence (atomic local save) → renderer (storybook presentation) → screen

Network is never on the core-play path (offline is a first-class mode).

## Dependencies

| Package | Justification | Vanilla Alternative |
|---------|---------------|---------------------|
| TypeScript | Type safety across simulation/schema boundaries | no |
| React + react-dom | Tablet UI client (README technical direction) | no |
| Vite | Dev server + PWA build tooling | no |
| vite-plugin-pwa | Installable PWA + offline precache (README tablet-first requirement) | no |
| zod | Validated content schemas (Architecture Principle 3: content is data-driven through validated schemas) | no |
| vitest (dev) | Test runner for unit/integration suites across all workspaces | no |
| fake-indexeddb (dev) | IndexedDB test double for persistence tests without a browser | no |
| @vitejs/plugin-react-swc, @types/* (dev) | React build/type tooling | n/a |
| Node ≥22, npm workspaces | Monorepo package boundaries | n/a |

New dependencies require justification against the child-safety and offline-first constraints (no analytics/tracking SDKs by default). This table is the enforceable baseline: a dependency absent here is unapproved.

## Section 4 Razor Pre-Check (measured 2026-07-15, post-remediation)
- [x] All files <= 250 lines (max: `packages/simulation/src/index.ts` at 244; verified by line-count sweep)
- [x] All logic functions <= 40 lines (handlers/validators extracted to module scope; declarative JSX subcomponents kept small by decomposition)
- [x] No nesting > 3 levels
- [x] No nested ternaries (two pre-existing instances removed during razor remediation)

History: genesis sealed with 4 file-level violations (audit V1, VETO); remediated via /qor-refactor on 2026-07-15 (see docs/FILE_INDEX.md for the movement log). This pre-check now states measured reality, not aspiration.

---
*Blueprint sealed. Awaiting GATE tribunal.*
