# Pixel Pals Foundation Delivery Plan

## Objective

Deliver M0: Product Foundation and prepare M1: Relationship Vertical Slice without importing legacy architecture prematurely.

## Foundation Outcomes

By the end of M0, Pixel Pals will have:

- a buildable and testable tablet application;
- a documented device support floor;
- canonical domain schemas;
- deterministic simulation boundaries;
- durable local-first persistence;
- accessible touch input primitives;
- child-safe parent boundaries;
- art and content pipelines;
- CI quality gates;
- a complete implementation plan for the first friendship loop.

## Workstream 1: Repository and Quality Foundation

### Deliverables

- workspace installation and lockfile;
- build, typecheck, test, lint, and format scripts;
- CI workflow;
- dependency review policy;
- pull request template;
- issue templates;
- architecture decision record template;
- contribution and coding standards;
- release and versioning conventions.

### Exit tests

- clean checkout installs reproducibly;
- build succeeds;
- tests run in CI;
- no missing scripts or placeholder quality gates;
- dependency updates are visible and reviewable.

## Workstream 2: Device and Tablet Baseline

### Deliverables

- exact family tablet inventory;
- supported OS and browser matrix;
- landscape and portrait behavior;
- minimum touch target standard;
- memory, startup, image, and interaction budgets;
- suspension, resume, and low-storage test cases;
- real-device test checklist.

### Exit tests

- prototype runs on each target tablet;
- oldest supported device meets minimum performance budget;
- rotation, suspension, and offline resume behave predictably;
- unsupported devices receive a clear explanation rather than silent failure.

## Workstream 3: Canonical Domain Model

### Deliverables

Validated schemas and TypeScript types for:

- Pal identity;
- species;
- regional lineage;
- phenotype references;
- characteristics;
- skills;
- preferences;
- relationship edges;
- memories;
- households;
- homes;
- villages;
- Great Tree records;
- player world metadata;
- content identifiers and versions.

### Domain rules

- IDs are stable and opaque;
- simulation dates are serializable;
- content references are versionable;
- biology, culture, environment, and experience remain separate;
- relationships are directional where appropriate;
- all saved state validates before entering simulation.

### Exit tests

- a sample Willowmere world validates;
- invalid state produces useful errors;
- schemas serialize and deserialize without loss;
- no UI component owns canonical game rules.

## Workstream 4: Deterministic Simulation Core

### Deliverables

- seeded random source;
- command and event model;
- pure state transition functions;
- relationship state machine;
- memory creation rules;
- time advancement policy;
- world-state invariant checks;
- replayable simulation tests.

### Initial commands

- meet Pal;
- talk with Pal;
- give item;
- play together;
- assign Pal to home;
- invite Pals to shared activity;
- record shared memory;
- recognize friendship at Great Tree.

### Exit tests

- same seed and commands produce the same world;
- invalid commands fail safely;
- relationship progression is explainable;
- replay reconstructs final state;
- simulation runs without React or browser APIs.

## Workstream 5: Local-First Persistence

### Deliverables

- IndexedDB adapter;
- save envelope with schema and content versions;
- atomic checkpoint writes;
- previous-save recovery;
- migrations;
- corruption detection;
- export and import;
- storage quota behavior;
- parent-gated reset and restore.

### Exit tests

- interrupted save preserves previous valid state;
- corrupted latest save falls back safely;
- migrations are tested from every retained version;
- exported save can be restored;
- no network is required.

## Workstream 6: Input and Accessibility Foundation

### Deliverables

- semantic input intentions;
- tap-first controls;
- keyboard equivalents;
- drag alternatives;
- focus management;
- reduced-motion behavior;
- text size and contrast foundations;
- screen-reader landmarks and labels;
- orientation guidance.

### Exit tests

- all foundation actions work with touch;
- all critical actions work without hover or long press;
- keyboard navigation has no traps;
- reduced motion removes ornamental transitions;
- child-readable labels are used instead of implementation terminology.

## Workstream 7: Child Safety and Parent Boundary

### Deliverables

- local child profile model;
- parent gate design;
- protected actions inventory;
- data collection prohibition by default;
- external link policy;
- naming and free-text policy;
- session stop and resume behavior;
- privacy threat model.

### Exit tests

- child cannot accidentally reset or export a world;
- no unnecessary personal data is requested;
- no external navigation is reachable from child play;
- all protected actions are documented and tested.

## Workstream 8: Art and Content Pipeline

### Deliverables

- asset provenance manifest;
- image naming and versioning rules;
- responsive image pipeline;
- modular Pal art specification;
- pose and anchor specification;
- species and lineage content schema;
- dialogue and adventure content schema;
- validation tooling.

### Exit tests

- one Pal portrait can be assembled deterministically;
- one village scene loads within performance budget;
- missing assets fail with a safe placeholder;
- every asset has known ownership and source;
- content errors fail during validation rather than during child play.

## Workstream 9: M1 Experience Design

### Deliverables

- Willowmere interaction map;
- six initial Pal profiles;
- first home design;
- relationship progression table;
- memory journal wireflow;
- Great Tree friendship ceremony storyboard;
- onboarding flow;
- child playtest script;
- M1 content inventory.

### Exit tests

- the entire friendship loop is represented in a clickable or coded prototype;
- every step answers the North Star question;
- no step depends on later genetics or family systems;
- expected child misunderstandings have recovery paths.

## Dependency Order

1. Repository quality foundation
2. Device baseline and audience decisions
3. Canonical schemas
4. Deterministic simulation
5. Persistence
6. Input and accessibility
7. Safety and parent boundary
8. Art and content pipeline
9. M1 experience integration

Some workstreams can proceed in parallel, but schemas must precede persistence and simulation integration. The phenotype prototype may proceed independently as a risk-reduction experiment.

## Critical Risks

### Art combinatorics

Mitigation: prototype three species and three lineages before committing to the full genetics model.

### Save corruption

Mitigation: atomic checkpoints, validation, previous-save fallback, migration tests.

### Child comprehension

Mitigation: observe behavior on real tablets and simplify presentation without flattening simulation logic.

### Feature expansion

Mitigation: M0 and M1 scope gates. Later roadmap systems may not enter the critical path.

### State architecture fragmentation

Mitigation: one canonical simulation state and one persistence boundary before adding convenience state libraries.

### Educational inaccuracy

Mitigation: distinguish simplified model from literal biology and require review before educational release claims.

## M0 Completion Checklist

- [ ] Target tablets documented
- [ ] Primary age range provisionally fixed
- [ ] Build and CI green
- [ ] Canonical schemas published
- [ ] Deterministic simulation package tested
- [ ] Save and recovery package tested
- [ ] Accessible input primitives tested
- [ ] Parent boundary documented and prototyped
- [ ] Asset provenance process active
- [ ] One deterministic Pal portrait prototype complete
- [ ] Willowmere content seed validates
- [ ] M1 friendship loop storyboard approved
- [ ] Real-device foundation test completed

## Next Build Target

The next implementation target is the canonical content and simulation schema layer. It must remain framework-neutral and should begin with one complete sample world rather than a catalog of empty abstractions.
