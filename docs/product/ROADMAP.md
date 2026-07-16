# Pixel Pals Product Roadmap

## North Star

**Where every friendship changes the world.**

Pixel Pals succeeds when a child can open the game on a tablet, understand what to do without adult instruction, form meaningful attachments to individual Pals, see relationships change homes and villages, stop safely at any time, and return later without losing progress.

## Roadmap Principles

1. Build the relationship simulation before expanding the feature catalog.
2. Validate on real tablets at every milestone.
3. Preserve offline play as the default.
4. Treat child safety, accessibility, and save integrity as release gates.
5. Prefer illustrated state changes over expensive animation.
6. Add systems only when they strengthen relationships.
7. Separate biology, environment, culture, experience, and choice.
8. Keep the first playable world small enough to finish.

## Release Sequence

### M0: Product Foundation

**Outcome:** The project has a stable technical and design foundation that can support the first complete relationship loop.

**Includes:**

- canonical Pal, relationship, memory, home, village, species, lineage, skill, and characteristic schemas;
- supported tablet baseline;
- offline-first save architecture;
- deterministic simulation boundary;
- input intention abstraction;
- accessibility baseline;
- child-safety and parent-boundary requirements;
- art asset specification and provenance process;
- quality gates and CI;
- documented legacy migration decisions.

**Exit criteria:**

- application builds and installs as a PWA;
- application launches offline after first install;
- save, load, reset, export, migration, and recovery tests pass;
- one sample Pal and one sample village validate against schemas;
- keyboard, touch, reduced-motion, and screen-reader smoke tests pass;
- supported tablet matrix is documented.

**Not included:** gameplay breadth, accounts, cloud sync, multiplayer, genetics UI.

---

### M1: Relationship Vertical Slice

**Outcome:** A child can meet Pals, help two Pals become friends, create a shared memory, and celebrate that friendship at the Great Tree.

**Includes:**

- Willowmere village scene;
- six initial Pals;
- Pal profiles, preferences, and simple characteristics;
- feeding, playing, gifting, and conversation;
- Pal-to-Pal affinity and friendship progression;
- one home with household membership;
- memory journal;
- Great Tree friendship ceremony;
- visible village change after the ceremony;
- local offline persistence.

**Exit criteria:**

- the full friendship loop works without network access;
- a child can complete it without developer tools or manual data editing;
- relationship changes are explainable in the UI;
- the ceremony creates a durable memory and visible world state change;
- save interruption does not corrupt progress;
- tablet playtest identifies no blocking comprehension issue.

**Not included:** family formation, genetics, multiple villages, crafting economy, public release.

---

### M2: Family Tablet Alpha

**Outcome:** The game is stable enough for recurring play on Kevin's children's tablets.

**Includes:**

- install and update flow;
- multiple local child profiles or separate local worlds;
- parent-protected settings;
- readable onboarding;
- stable resume after suspension;
- accessibility preferences;
- several friendship paths;
- basic home furnishing;
- two illustrated adventures;
- content sufficient for repeated short sessions;
- backup and restore managed by an adult.

**Exit criteria:**

- installed on target family tablets;
- seven-day playtest without save loss;
- children can independently launch, navigate, stop, and resume;
- parent settings cannot be entered accidentally;
- no core action requires connectivity;
- performance remains within budget on the oldest supported tablet;
- feedback is recorded as observed behavior, not only verbal preference.

---

### M3: Village Life

**Outcome:** Pals feel like residents whose skills, homes, and relationships shape daily village life.

**Includes:**

- household relationships;
- home customization tied to Pal preferences;
- skill practice and teaching;
- characteristics that change gradually through experience;
- village roles;
- shared spaces;
- village flourishing model;
- festivals and small community events;
- richer memory and journal views.

**Exit criteria:**

- homes visibly reflect residents;
- skills unlock meaningful contribution rather than generic power;
- village changes can be traced to relationships and participation;
- no dominant optimization path invalidates diverse communities;
- repeated care does not degrade into currency grinding.

---

### M4: Exploration and Regional Lineages

**Outcome:** The world expands beyond Willowmere and demonstrates how environment and culture shape related Pals differently.

**Includes:**

- second region and village;
- regional lineage system;
- environmental affinity and adaptation;
- travel between villages;
- cooperative adventure teams;
- regional culture, architecture, clothing, music, and stories;
- cross-village friendships;
- persistent consequences from exploration.

**Exit criteria:**

- a Fox remains biologically recognizable across lineages;
- regional differences are visible without becoming stereotypes;
- environment and culture are modeled separately;
- exploration creates relationships and memories, not only rewards;
- both regions remain playable offline.

---

### M5: Families and Genetics

**Outcome:** Families can grow through biological children, adoption, mentorship, and chosen relationships, with inheritance that is understandable and internally consistent.

**Includes:**

- companionship and family decisions;
- Great Tree family ceremonies;
- adoption and guardianship;
- deterministic genome model;
- dominant, recessive, codominant, and blended traits;
- expressed and carried traits;
- modular phenotype composition;
- lineage and family tree views;
- child-friendly DNA learning surface;
- clear separation of inherited, learned, cultural, and chosen traits.

**Exit criteria:**

- the same genome always produces the same phenotype;
- siblings can differ predictably;
- hidden traits can reappear later;
- invalid visual combinations fall back safely;
- adoption and biological family paths receive equal narrative dignity;
- educational explanations are reviewed for accuracy and age appropriateness;
- the system avoids language that treats Pals as breeding assets.

---

### M6: Diverse Community Simulation

**Outcome:** Mixed communities unlock new capabilities, traditions, and solutions that homogeneous communities cannot produce alone.

**Includes:**

- village composition model;
- cultural exchange;
- collaborative buildings;
- hybrid festivals and recipes;
- cross-lineage skill combinations;
- ecological restoration projects;
- conflict, misunderstanding, mediation, and reconciliation;
- Great Tree evolution tied to village history.

**Exit criteria:**

- diversity creates qualitatively new options, not only numerical bonuses;
- no species or lineage is framed as inherently superior;
- community benefits can arise through migration, friendship, adoption, mentorship, and cooperation, not only biological offspring;
- conflict mechanics teach repair without moralizing or humiliation.

---

### M7: Content-Complete Family Beta

**Outcome:** The intended family experience is coherent, replayable, accessible, and stable across the supported tablet set.

**Includes:**

- several regions;
- mature save migration system;
- complete first story arc;
- balanced progression;
- broader Pal roster;
- accessibility review;
- device performance review;
- privacy and child-safety review;
- structured family feedback cycle;
- polished onboarding and parent documentation.

**Exit criteria:**

- no blocker or critical data-loss defects;
- progression remains understandable over several weeks;
- children form attachments to individual Pals rather than only chasing unlocks;
- all critical screens pass accessibility checks;
- content gaps are known and prioritized;
- release scope is frozen.

---

### M8: Release Candidate

**Outcome:** Pixel Pals is ready for controlled external distribution.

**Includes:**

- packaging decision for PWA, Android, and iPad;
- release signing and update strategy;
- privacy disclosures;
- parental consent model if accounts are introduced;
- crash reporting strategy with minimal data collection;
- backup and recovery documentation;
- store assets and product page;
- final performance, security, privacy, accessibility, and content reviews.

**Exit criteria:**

- distribution path is approved;
- child-safety and privacy requirements are met;
- recovery procedures are tested;
- telemetry is absent or strictly minimized and documented;
- release build is reproducible;
- known limitations are documented.

## Cross-Cutting Workstreams

Every milestone advances these workstreams:

- **Product:** scope, usability, player outcomes, playtesting.
- **Simulation:** deterministic world, relationships, skills, memories, genetics.
- **Tablet UX:** touch, readability, orientation, suspension, battery use.
- **Art:** modular Pals, illustrated scenes, asset provenance, responsive delivery.
- **Content:** Pals, regions, dialogue, adventures, traditions, memories.
- **Persistence:** local saves, migrations, backup, recovery.
- **Accessibility:** reduced motion, text size, contrast, labels, no time pressure.
- **Safety and privacy:** parent boundaries, minimal data, no manipulative mechanics.
- **Quality:** tests, performance budgets, device matrix, release gates.

## Product Validation Framework

Each milestone must answer:

1. Can a child understand the next action without an adult explanation?
2. Which relationship becomes stronger?
3. What visibly changes in the world?
4. Can the child stop at any moment without penalty?
5. Does the feature work offline?
6. Is the result preserved safely?
7. Does the feature remain comfortable on the oldest supported tablet?
8. Does it teach through play rather than instruction?
9. Does it respect different family structures and identities?
10. Is the mechanic still Pixel Pals if rewards and currency are removed?

## Current Priority

The active implementation target remains **M2: Family Tablet Alpha**.

The M0 and M1 software scope is implemented and verified through the full offline relationship loop, repeatable world days, deterministic persistence, recovery, and the five-profile tablet browser matrix. Their remaining exit evidence is physical: actual-device accessibility checks and observed child playtesting.

### M2 implementation status

1. **Complete:** accessibility preferences and durable device-local settings.
2. **Complete:** stable suspension, reload, and resume verification.
3. **Complete:** multiple isolated local worlds with migration, independent recovery checkpoints, switching, backup, and selected-world deletion.
4. **Software complete:** two saved relationship-centered illustrated adventures, **The Lanterns in the Rain** and **The Humming Bridge**. Both support all five starter species equally, resume after reload, create durable memories and village changes, and pass the five-profile tablet browser matrix.
5. **Art production pending:** the runtime uses structured offline storybook fallbacks and production-art scene IDs. Final raster adventure assets remain planned until files, provenance, responsive crops, performance budgets, and release approval are complete.
6. **Physical evidence pending:** installation, update behavior, oldest-device performance, actual-device accessibility, independent child navigation, and a seven-day observed family playtest on the target tablets.

The next implementation work is final production art creation and provenance integration, followed immediately by target-tablet installation and observed Family Tablet Alpha validation. No M3 system should displace these outcomes unless it changes a foundational architecture decision.
