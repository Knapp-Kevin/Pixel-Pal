# Legacy Retention Audit

## Purpose

This document defines what Pixel Pals will retain from `Knapp-Kevin/pixel-pal-paradise-creations` before any legacy code is migrated.

The old repository is a reference implementation, not an upstream codebase. Migration means extracting proven ideas, tests, schemas, or assets and rewriting them to fit the new architecture. It does not mean copying directories wholesale.

## Decision Categories

- **Retain**: preserve the concept and likely reuse substantial implementation after isolation and testing.
- **Adapt**: preserve the concept or selected logic, but rewrite the implementation around the new product model.
- **Reference only**: use as research or visual inspiration, but do not migrate code.
- **Discard**: intentionally leave behind.

## Executive Decision

The old repository contains valuable prototypes for local persistence, touch input abstraction, homes, villages, illustrated adventures, Pal care, journals, traits, and tablet performance planning.

It does not contain a production-ready genetics system, relationship simulation, Great Tree ceremony model, child-safe family system, or clean offline-first architecture. Those systems must be newly designed.

The retained surface is deliberately narrow.

## Retain

### 1. IndexedDB persistence concepts

**Source:** `src/frontend/services/persistence.ts`

Retain:

- IndexedDB as the initial local save technology;
- versioned database initialization;
- explicit save, load, clear, export, and import capabilities;
- storage quota inspection;
- offline-first intent.

Required changes:

- replace the single `current` object with atomic, versioned save records;
- add schema validation at every import and load boundary;
- add migration functions between save versions;
- preserve previous valid save until a new write completes;
- separate simulation state from UI state;
- remove assumptions that inventory and village state are server-owned;
- move parent-controlled backup and restore behind an adult boundary;
- test recovery from corrupted and interrupted writes.

The old code is useful as a behavioral reference, but it should not be copied unchanged.

### 2. Input intention abstraction

**Source:** `src/frontend/systems/InputManager.tsx`

Retain:

- translating raw input into semantic intentions such as select, interact, build, pan, and zoom;
- a subscription model that keeps gameplay logic independent from device events;
- support for touch gestures and future controller or keyboard input.

Required changes:

- eliminate the unexplained `actor` and `god` terminology;
- do not make a virtual joystick part of the default experience;
- separate framework-neutral input types from the React provider;
- provide tap alternatives for every drag, pinch, long-press, or multi-touch action;
- integrate accessibility and reduced-motion requirements;
- avoid storing unbounded or unnecessary input history in production;
- test on actual Android tablets and iPads.

### 3. Tablet performance research

**Source:** `src/testing/performance-budget-tablet.md`

Retain the performance targets and test scenarios only after reviewing them against the currently supported tablet baseline.

The new repository should maintain an explicit tablet performance budget covering:

- startup time;
- memory consumption;
- image decode cost;
- interaction latency;
- service-worker update behavior;
- battery-sensitive animation;
- offline resume;
- low-storage behavior.

### 4. PWA and offline experiments

Retain the lessons and test cases from the old PWA implementation, including installation, service-worker updates, offline banners, and suspended-session recovery.

Do not migrate the old provider hierarchy wholesale. The new application should use a smaller offline boundary and expose network state only where it changes user behavior.

### 5. Selected static art assets

Retain only assets that:

- match the new storybook visual direction;
- are original or have verified rights;
- work at tablet resolutions;
- can be optimized into responsive WebP or AVIF variants;
- do not lock the game into the old visual identity;
- remain useful without the old component tree.

Each retained asset must be listed in an asset provenance manifest before migration.

## Adapt

### 1. Home and room concepts

**Sources:** `HomeInterior.tsx`, `HomeCustomizer.tsx`, home-related types and assets.

Preserve:

- Pals living in assigned homes;
- available beds and household membership;
- living, sleeping, cooking, and shared spaces;
- feeding, playing, furnishing, cleaning, and comfort;
- home themes and environmental suitability.

Rewrite because:

- the old implementation is screen-centric and tightly coupled to game context and API hooks;
- interactions mostly apply direct stat increases and currency rewards;
- room improvement is generic rather than driven by relationships, preferences, or household needs;
- tablet interaction and child comprehension need a more focused flow.

The new home system should strengthen household relationships and visibly reflect who lives there.

### 2. Village representation

**Source:** `Village.tsx` and supporting village components.

Preserve:

- homes arranged within a village;
- village overview and detail views;
- construction and customization;
- village joy or flourishing as an aggregate outcome;
- festivals, workshops, nurseries, maps, and community spaces as possible future systems.

Rewrite because the old village page combines too many unrelated systems into one surface. The new village should be navigated as an illustrated place, not a dashboard of feature buttons.

### 3. Pal care interactions

Preserve feeding, playing, gifting, resting, comfort, and favorite-object concepts.

Rewrite progression so care creates memories, trust, preferences, household effects, and relationship events rather than simply dispensing Sparkles and increasing meters.

### 4. Bond Journal concept

**Source:** `BondJournal.tsx`.

Preserve:

- trait discovery;
- memorable events;
- trust milestones;
- observation confidence;
- a chronological record for each Pal.

Rewrite because the current journal uses mock data and primarily models the player-to-Pal relationship. The new journal must include:

- Pal-to-Pal relationships;
- family events;
- shared adventures;
- household history;
- Great Tree ceremonies;
- learned skills;
- regional and cultural experiences;
- player-readable explanations of why a relationship changed.

### 5. Adventure structure

**Source:** `Adventures.tsx`, API types, and adventure content.

Preserve:

- illustrated staged stories;
- cooperative participation requirements;
- player choices;
- persistent progress;
- relationship and skill requirements;
- outcomes that can change later events.

Rewrite:

- combat-coded language and sword imagery;
- generic difficulty and reward framing;
- currency-first outcomes;
- automatic selection of the first available Pals;
- server dependency for core play.

Adventures should strengthen specific relationships, reveal personality, develop skills, create memories, and visibly alter villages or regions.

### 6. Pal traits and existing type definitions

**Sources:** `game.types.ts`, `PalTraitSystem.tsx`, related schemas.

Retain only the vocabulary and fields that still fit the new identity model.

The new domain model must explicitly separate:

- species;
- regional lineage;
- genome;
- expressed phenotype;
- environment;
- culture;
- learned skills;
- characteristics;
- talents and affinities;
- relationships;
- memories;
- household and village membership.

Existing broad `Pal` interfaces should not become the new canonical schema without decomposition.

### 7. Icon wrapper and accessibility primitives

**Sources:** `components/ui/Icon.tsx`, selected UI primitives.

Retain only components that already provide accessible names, predictable sizing, touch-safe behavior, and no dependence on the old design token system.

The new UI package should remain small. Migrating the entire shadcn or Radix component inventory is explicitly rejected.

## Reference Only

### 1. Giving Tree implementation

**Source:** `GivingTree.tsx`.

The concept is relevant, but the implementation should not migrate.

The old tree:

- selects two Pals;
- creates a generic hybrid Sprout;
- treats family formation as an offering transaction;
- removes elders from the active population in exchange for an inventory memento.

The new Great Tree has a broader role as the emotional and historical center of the village. It must recognize friendship, companionship, marriage, adoption, mentorship, reconciliation, service, remembrance, and family formation.

The `Sprout` metaphor may survive in world lore, but not as the core genetics or relationship implementation.

### 2. Advanced Breeding Lab

**Source:** `AdvancedBreedingLab.tsx`.

Use only to identify prior UI ideas and terminology that should be avoided. The laboratory framing conflicts with the family-centered product direction and risks turning Pals into optimization material.

### 3. Backend breeding API and tests

**Source:** `src/backend/src/breeding/*`, breeding API contracts.

The implementation is only a stub that produces a `mixed` genome and a generic second-generation Pal. It contains no useful inheritance logic.

The test structure may inform future contract testing, but the service and controller should not migrate.

### 4. NestJS and Prisma backend

Keep as architectural research only.

The first playable product is local-first and does not require a server for core simulation. A backend may later support parent-managed synchronization, content delivery, or carefully governed social features. It should not be inherited merely because one already exists.

### 5. Redux and RTK Query organization

Reference only.

The old repository splits state between local context, Redux, RTK Query, IndexedDB, and backend persistence. The new application should first establish one deterministic simulation store and one persistence boundary. Additional state technology must earn its complexity.

### 6. Three.js, React Three Fiber, Matter.js, scene managers, camera systems, and virtual joystick

Reference only unless a later prototype proves they are required.

The intended experience is illustrated, tablet-first, battery-conscious, and minimally animated. A real-time game-engine layer is not part of the initial vertical slice.

### 7. Festivals, crafting, quests, codex, nursery, shop, transit, and adoption screens

These are idea inventories, not migration candidates.

Individual concepts may return only after the relationship vertical slice works and each system has a clear answer to the North Star question.

## Discard

The following should not enter the new repository:

- `.agent/` staging, prompts, responses, archives, and tribunal artifacts;
- orchestration plans unrelated to the shipped game;
- generated execution verdicts;
- duplicate migration plans;
- generic Lovable project documentation;
- legacy route structure;
- mock production data embedded in UI components;
- `Sparkles` as the default reward for ordinary affection and care;
- combat-coded adventure language;
- global feature dashboards;
- server-required core play;
- breeding-lab framing;
- automatic elder removal;
- unrestricted particle, tilt, and decorative motion systems;
- unused UI component inventory;
- duplicate input managers and bridge layers;
- old authentication screens for child accounts;
- Docker and deployment infrastructure not required by the local-first tablet vertical slice.

## Migration Order

No source code should be migrated until the corresponding new domain boundary exists.

1. **Asset provenance audit**
2. **Tablet performance budget review**
3. **Canonical Pal, village, home, relationship, and memory schemas**
4. **Local persistence package with migrations and recovery**
5. **Input intention package with accessible alternatives**
6. **Selected art assets**
7. **Home and care behaviors**
8. **Journal concepts**
9. **Adventure content model**
10. **Only then, individual UI components where reuse is cheaper and safer than rewriting**

## Acceptance Rule

A legacy artifact may be migrated only when all of the following are true:

- it supports the new domain model;
- it strengthens relationships;
- it works offline;
- it is appropriate for children;
- it is usable on tablets;
- it has a clear accessibility path;
- it is covered by tests or can be isolated for testing;
- its ownership and asset rights are known;
- it reduces implementation cost more than it increases legacy coupling.

## Final Retention Summary

### Retain or substantially reuse

- IndexedDB persistence behaviors;
- input-intention concepts;
- tablet performance research;
- PWA lessons;
- selected verified static assets.

### Adapt through redesign

- homes and rooms;
- villages;
- care interactions;
- journals and traits;
- illustrated adventures;
- selected domain vocabulary;
- a very small set of accessible UI primitives.

### Rebuild from first principles

- relationships;
- Great Tree ceremonies;
- family formation;
- genetics and phenotype rendering;
- species and regional lineages;
- culture and environmental influence;
- skill and characteristic progression;
- memories and legacy;
- deterministic simulation state;
- child-safe parent boundaries.

### Leave behind

- the old backend as a starting architecture;
- breeding implementation;
- feature-heavy village dashboard;
- game-engine and joystick layers;
- broad dependency inventory;
- agent orchestration residue;
- legacy deployment infrastructure.
