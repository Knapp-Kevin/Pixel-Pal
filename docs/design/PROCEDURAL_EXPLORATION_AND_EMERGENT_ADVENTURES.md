# Procedural Exploration and Emergent Adventures

**Status:** PROVISIONAL design proposal v0.4, adversarially revised; not implementation or engine-adoption approval  
**Authority:** Specialist design proposal beneath the Game Design Document and Simulation Design Document  
**Canon impact:** None. New locations, characters, histories, and changes require their respective canon classification and approval before release  
**Last reviewed:** 2026-11-22  
**Depends on:** docs/design/GAME_DESIGN_DOCUMENT.md; docs/design/SIMULATION_DESIGN_DOCUMENT.md; docs/design/PLAYER_EXPERIENCE_JOURNEYS.md; docs/product/ROADMAP.md; docs/art/PRODUCTION_ASSET_CONTRACT.md; docs/DOCUMENTATION_GOVERNANCE.md  
**Related feasibility issue:** https://github.com/Knapp-Kevin/Pixel-Pal/issues/115  
**Decisions not made:** No Verdant dependency, live generative AI, new release commitment, reordering of M2/M3/M4, or game-state migration authorized by this proposal

## 1. Product thesis

The villages are home: known places and relationships with enduring history. **Expeditions beyond the villages let Pals encounter unfamiliar situations, discover one another, make meaningful decisions, and bring changes back home.**

Not an infinite map. Not an endless quest vending machine. No combat-based power progression. A successful expedition should be memorable because of *who went, what they chose, what they learned together, and what changed afterward*, not its procedural seed.

**Player promise:** "The same place can tell a different story when different friends visit, and their choices will be remembered."

**Definition of generative:** Initially, seeded, deterministic composition of curated environment kits, situations, challenge affordances, dialogue variants, and authored story beats. Runtime free-form generative language or image models are neither required nor approved.

## 2. Design iterations and what changed

### V0: Expansive premise, rejected

V0 proposed unlimited generated regions, adaptive NPC conversations, arbitrary discoveries, and an engine-driven 3D world. It could produce spectacular novelty, but no guarantee of authored meaning, finishability, age-appropriate safety, coherent visual identity, save continuity, or affordable tablet performance.

**Adversarial verdict: NO-GO as an initial product architecture.** Vastness is not depth. A player can forget a thousand places faster than one meaningful encounter.

### V1: Bounded procedural adventure grammar, improved but insufficient

Constrain geography to authored region kits. Compose invitations, motives, route choices, cooperative challenges, discoveries, and closure using validated recipes. Keep generation offline, seeded, and constrained by an authored content grammar.

**Residual issue:** Recombining puzzle pieces can still feel like the same quest with swapped nouns. "Fox opens bridge, Deer opens bridge" is not meaningful personal variation.

### V2: Relationship-first expedition engine, preferred direction

Every recipe declares a *relationship question*, competing legitimate preferences or values, at least two understandable response paths, a playable cooperative action, and a consequence that is explained and represented in the world. Participants can decline or ask for a different route. Different Pal pairs may change the *interpretation, dialogue, choices, and consequences* of the same physical space.

Return home is a designed part of the expedition, not a loot-screen afterthought. Major changes become durable, typed domain events and memory references. A later visit can recognize the changed place or revisit the story with different context.

**Remaining risk:** This design needs substantial authored content and playtesting to avoid repetitive emotional scripting. Prove one convincing episode before building a generic generation framework.

### V3: Minimum viable implementation, recommended first prototype

Implement one region kit and one recipe family with multiple real branches **without Verdant**. Use the existing simulation, adventure commands, storybook presentation, and persistence. Prove child-visible variety and meaningful memory consequences. Only then benchmark whether Verdant adds enough value to optional geography or scene composition.

**Status:** V3 is a proposal, not working code.

## 3. Player-facing expedition contract

An expedition MAY be discovered through a Pal's curiosity, a community connection, an environmental change, a remembered rumor, or a voluntary invitation. It MUST NOT use urgent real-time deadlines, guilt for leaving, or fear of missing rewards.

An expedition has these beats:

1. **Invitation:** A child-readable reason to go and a clear opt-out.
2. **Companions:** Choose willing Pals. A Pal's preferences are expressed, not overridden or reduced to optimal utility.
3. **Preparation:** A few intelligible options; no excessive inventory or compulsory grinding.
4. **Discovery:** An unfamiliar place, person, ecological pattern, or mystery; include some moments of wonder without a "problem" at all.
5. **Cooperation:** A concrete activity or choice that allows Pals to contribute in more than one way.
6. **Response:** The environment or another character responds credibly, including partial success or different priorities.
7. **Return:** A gentle exit at any meaningful checkpoint; no punishment for stopping.
8. **Reflection:** A memory naming participants, actions, emotions, and reasoned consequences.
9. **Continuity:** A visible or conversational consequence on later village or region visits.

Suggested episode lengths for testing, **not validated requirements**: 3–5 minutes (discovery vignette), 8–15 minutes (short expedition), and 20–30 minutes (multi-stage exploration). Every stage must be suspendable and locally recoverable.

## 4. Three layers of exploration

### A. Regional world kits

Use a **small, navigable graph of authored landmarks**, not infinitely streaming terrain. A region kit contains a landscape identity, flora/fauna/ecology, lighting and weather variants, traversal accessibility, a few landmark types, camera-safe compositions, suitable NPCs, and eligible expedition recipes. Environmental identity is separate from species, culture, morality, and ability.

A fixed generation seed can select paths, water channels, canopy shapes, ruined structures, and object placement **within safety and art constraints**. Deeply unique locations may be authored separately. Maps should keep orienting landmarks, a clear path back, and optional quiet locations.

### B. Adventure composer

The composer selects from **authored recipes and tested branches** using a deterministic input envelope. Recipes specify their dramatic question, eligible region contexts, invitations, cooperative actions, meaningful decisions, resolution branches, eligibility, disallowed combinations, and post-return effects.

Variation dimensions: current environment; companions' stated preferences; shared history; previously visited landmarks; current community needs; seasonal atmosphere; and player choice. Variation may alter what matters, not merely names or cosmetic colors. Do not equate uniqueness with more text.

### C. Continuity and memory

Only the existing TypeScript simulation may authorize world-state changes. **Current code validates and returns the next World via parseWorld; it does not implement the general event ledger described in the aspirational Simulation Design Document.** Typed domain effects and event-grounded history are a proposed extension, not a shipped abstraction. Expedition facts, decisions, and generated scene descriptors have no authority on their own.

The memory created after an expedition should identify an actual player-observed event and can later affect dialogue, relationship context, household activities, a changing region, or village history. **No invented memory or invisible retrospective relationship change.**

## 5. Canon, agency, safety, and accessibility contracts

- **Canon:** Established and working canon is read-only input. The generator may introduce scoped Player Canon within approved templates, never overwrite known biographies, change book lore, invent unapproved cultural stereotypes, or make a Legend retroactively true.
- **Pal agency:** Pals are not equipment slots. They MAY decline, request rest, disagree, or prefer alternatives; the experience MUST provide valid choices without making a reluctant companion the only solution.
- **Fairness:** No species, ancestry, disability, family arrangement, or cultural membership is intrinsically "better" for an expedition. Distinct approaches are valuable without turning identity into locked powers. Skills and experience can unlock options, but at least one respectful route remains.
- **Emotional safety:** Curated tension, uncertainty, mistakes, disagreements, and sadness are permissible when authored and reviewed; random generation MUST NOT create graphic harm, coercive affection, punitive death, abandonment guilt, bullying presented as comedy, or trauma as a novelty reward.
- **Child privacy:** No remote inference or telemetry, public chat, external naming upload, open prompt field, unsolicited recording, gaze tracking, or user-generated sharing in the first design slice.
- **Access:** No color-only, audio-only, precision-drag-only, hover-only, or timed-only critical solution. Provide large touch targets, readable alternatives, adjustable text, reduced-motion variants, and a navigable stage on target tablets.
- **Stopping:** Every checkpoint saves safely. Abandoning a trip never causes disaster or relationship decay. Major irreversible consequences require an appropriate preview and explicit player choice.
- **Visual identity:** Canonical Pals and major story illustrations remain in the human-approved painterly art pipeline. Procedural meshes do not become approved art merely by existing.

## 6. Bounded architecture and data proposal

Follow existing app boundaries, with no new runtime dependency for the first proof:

**Content schema (data):** An ExpeditionRecipe, RegionKit, DecisionNode, VariationSlot, EffectDeclaration, AccessibilityFallback, and content version. Every recipe declares allowable facts, required steps, and bounded variants.

**Simulation (pure logic, proposed):** A seeded SelectExpedition operation produces a proposed, versioned expedition. A pure ValidateExpedition operation checks reachable resolutions, permitted combinations, participant willingness, and authorized effects. Today the existing startAdventure / chooseAdventureStage functions return validated World replacements; an explicit typed effect dispatcher/event record does **not yet exist**. Introduce one only when needed with specific migration and replay tests. Until then, experimental recipes may compute proposals and use a dedicated, allowlisted transition instead of claiming generic event-sourcing exists.

**Persistence (future schema extension):** Store a stable expedition ID, content version, used seed, materialized choice/branch identifiers, checkpoint, actual choices, transition IDs (event IDs only once implemented), and a compact snapshot of facts needed to reconstruct its presentation. A new generator version may affect future expeditions, but MUST NOT silently rewrite an expedition already started or mutate prior history.

**Renderer:** The current React/storybook renderer is the baseline. An optional read-only Verdant rendering bridge can consume an immutable scene descriptor for environment presentation. It cannot author relationships, overwrite world saves, or bypass asset approvals.

Suggested logical shape (illustrative, not the current schema):

    ExpeditionInstance:
      id, recipeId, recipeVersion, regionKitId, regionKitVersion
      seed, participantIds, participantConsentVersion
      materializedNodes, currentCheckpoint, playerChoiceEvents
      presentationFacts, completionState
      validatedWorldEffectIds, memoryEventIds

The recipe version is pinned. "seed alone" is not a durable save contract when templates or PRNG algorithms change. Treat generated text as display only; meaningful effects must reference allowlisted, typed commands.

### Actual code boundary verified in adversarial iteration v0.4

The current packages/simulation/src/adventures.ts contains **two static ADVENTURES definitions** (The Lanterns in the Rain and The Humming Bridge), a fixed AdventureId union, a three-stage index, and participant selection through getFirstNeighborContext (first Pal plus first neighbor). startAdventure and chooseAdventureStage return parseWorld-validated World replacements; on completion they write a fixed memory summary, visible village marker, skill/preference changes, and positive relationship bonuses. The current tests prove idempotence, resume, stage validity, and five-species structural parity; they do **not** prove arbitrary parties, version-pinned recipes, graph branching, or choice-grounded memories.

Consequences for implementation:

- **Do not retrofit a generic event framework in the first spike.** Prototype region and recipe selection as a pure deterministic function with fixtures and no persistent mutation. Preserve the original two adventures unchanged.
- The first Orchard should use two *test-fixture* party variants. Real arbitrary companion selection requires a distinct, reviewed domain contract; no pretending getFirstNeighborContext already supports it.
- Do not assume more than three stages or a graph-shaped session model currently exists. Materialized recipe branches, version pinning, optional checkpoint states, and content-schema migration require separate implementation and exact replay tests before persistence.
- Existing relationship bonuses are uniformly positive and the existing memorySummary does not depend on selectedChoiceIds. The prototype must demonstrate a distinct meaningful later acknowledgment, not simply tweak a score or replace nouns in that same summary.
- Preserve the present single-active-adventure and offered-world-day exclusion semantics until a deliberately reviewed change. Never cast arbitrary recipe IDs into AdventureId to evade schema validation.

**Architecture red-team verdict:** The conceptual model is valid as a *target*, but it is not a description of shipped infrastructure. The first spike should be smaller than the design, not a clandestine engine refactor.

## 7. Procedural integrity gates

A generated expedition MUST pass these before surfacing to a child:

1. Valid schema and stable IDs; every referenced region, character, art slot, and content version exists.
2. Allowed combinations preserve canonical facts and the family-friendly content rating.
3. Every reachable state has a child-readable next step, a safe stop/return, and at least one valid non-punitive resolution.
4. At least two *meaningfully distinct* choices exist where a recipe promises branching; otherwise label it a vignette rather than fake a decision.
5. All co-op tasks have accessible non-timed, touch-friendly alternatives and cannot dead-end due to party composition.
6. Every proposed world effect is typechecked, consented where necessary, and commit-safe through a narrow, explicitly reviewed simulation transition.
7. Return/memory hooks are matched to actual events; no rewards or memories for unplayed branches.
8. Variation remains within available approved art/crop budgets and does not require unapproved images.

If a sampled recipe fails validation, fall back to a known-good authored expedition or a quiet exploratory vignette. Never present broken procedural output and ask the child to debug it.

## 8. Adversarial challenge matrix

| Threat and severity | Plausible failure | Revised defense | Required evidence |
| --- | --- | --- | --- |
| **P0: Procedural sameness** | 200 quests repeat the same three errands | Relationship questions and outcomes vary, not only scenery | Blinded comparison of same-place/different-party playthroughs; children can describe what differed |
| **P0: Broken narrative** | An event contradicts canon or an NPC remembers something that never happened | Canon classes, typed effects, event-grounded memories | Planted contradiction, false-memory, and invalid-branch tests must fail closed |
| **P0: No valid route** | One species or skill is required, or a Pal declines | Validated alternate cooperative routes and willingness checks | Run every recipe across supported parties, refusal states, and accessibility profiles |
| **P0: Safety drift** | Randomized stories add manipulative urgency or inappropriate loss | Curated content grammar, reviewed outcome sets, no unrestricted runtime text generation | Negative content fixtures and actual adult-child review |
| **P0: Save corruption** | Generator update regenerates different history mid-adventure | Version-pinned materialized state, atomic validated world transitions (future event ledger optional), migration and replay tests | Old-save, suspend/resume, mid-transition interruption and rollback recovery |
| **P0: Architecture mismatch** | Treat proposed event ledger and arbitrary companions as if implemented today | Pure fixture spike first; explicitly contract and test any schema/transition extension | Compare proposed features to current adventures.ts, content-schema, and tested saved sessions |
| **P1: Village becomes irrelevant** | Endless adventures eclipse daily community life | Return-home stories and quiet village sessions remain complete; no loot treadmill | Observe preferred activities across sessions, not just novelty on first encounter |
| **P1: Unequal identity portrayal** | Lineage/species become destiny or cultural cliché | Contextual affordances without identity superiority | Content audit with counterexamples and diverse party fixtures |
| **P1: Visual fragmentation** | Generated PBR scenes clash with painterly Pals | Fixed style kits; authored render-to-asset option; human approvals | Side-by-side art gate on actual target screens |
| **P1: Performance and maintenance** | Wasm/3D costs dominate old tablet memory/battery | 2D-first, optional lazy scene rendering, hard fallback | Cold load, p95 frame time, peak memory, battery/heat and offline tests versus baseline |
| **P1: Fake choices** | Different options lead to identical outcomes | Branch distinctions measured in action, personal response, or future continuity, not only dialogue | Differential trace comparisons and observed player explanations |
| **P2: Scope explosion** | Team invents world simulation platform before first game is fun | One region, one recipe, narrow extension of existing architecture | First prototype shipped and playtested before new framework work |

A green CI job cannot replace the child-play, art-direction, privacy, and target-device evidence above.

## 9. The first proof: Forgotten Orchard

**Working title only; new location is not established canon.**

An invitation emerges because an old orchard beyond Willowmere is unusually quiet. The place contains a water channel, a sheltered clearing, an old caretaking mark, and a plausible route home. The visit is not an emergency.

**Pair A:** A patient gardener and an adventurous builder may choose to carefully restore a blocked channel, ask nearby residents about the orchard, or create a temporary water path. Their existing rapport determines tone, not whether the trip is winnable.

**Pair B:** A quiet researcher and a playful newcomer encounter the same site but notice different evidence. They might locate a forgotten caretaker's notebook, follow animals to an alternate source, or make a small social connection with a local resident. They still have agency to choose the waterwork route.

**Genuine consequences:** An accessible route can be restored, a regional resident can become known, a shared memory records the *actual* method and companions, and a later village scene references the discovery. Not every outcome needs a collectible or permanent environmental overhaul.

**Adversarial test:** With the same geography, two Pal pairs and two player decisions must yield intelligibly different actions and at least one different later-world acknowledgment, without hardcoded "best" companions. The child should recognize what the Pals chose and remember the experience later.

## 10. Test and acceptance strategy

**Pure simulation tests:** Repeatability for identical seed+version+inputs; branch coverage; no missing exits; no invalid effects; difference between proposed and committed state; replay after saved transitions; migration of older saved expeditions **once those features are actually implemented**. The first pure fixture need not change save schemas.

**Property/fuzz tests:** Generate a representative seed/party/environment matrix, including invalid combinations, and verify invariants. Start with 1,000 cases per version as a proposed automated floor; revise based on runtime and bug yield. Exhaustive tests are required for the bounded authored branch graph.

**Experience tests:** Put two different pairs through the Orchard without explaining the design. Ask: What changed? Why did the Pals choose that? Can the child stop and return? Does the place feel worth revisiting? Avoid prompting the desired answers.

**Novelty measure:** Count *different player actions, relationship responses, and later acknowledgments*, not number of maps or strings generated. Strongest outcome is meaningful choice recall and return desire, not the highest entropy score.

**Tech gates:** Existing art-status and provenance policy, responsive viewports and orientation, accessibility, offline resume, backup/migration, device resource limits, and the M2/M3 release gates still apply. Verdant is optional and must separately pass the issue #115 evidence gate.

## 11. Dependency and implementation order

1. **Now, design only:** Review this proposal and its adversarial objections. Do not let it displace current production-art and physical-tablet commitments.
2. **First experiment, engine-independent:** Write a tiny ExpeditionRecipe prototype integrated into existing adventures; exercise the Forgotten Orchard with two parties, a stable seed, and a saved memory. Keep the code behind a test/demo gate until approved.
3. **Playtest:** Run observed child play and compare against a bespoke authored baseline. If uniqueness is not felt, simplify to authored branches.
4. **Optional Verdant track:** Separately complete issue #115. Only if visually appropriate, device-safe, and maintainable, try one optional scene preview or an offline art-generator; the game logic remains independent.
5. **M4 adoption decision:** If content variation and return-home memory deliver value, approve a bounded regional kit at the planned exploration milestone. A live AI writer, broad open world, or full engine swap each requires its own proposal and explicit owner decision.

**STOP conditions:** Broken canon; fabricated memories; impossible party/accessibility combinations; unreliable saves; child-comprehension failure; no meaningful difference versus authored-only; major art incoherence; unacceptable tablet cost; or maintenance burden without demonstrated player value.

## 12. Explicitly unresolved design questions

- How much geographic freedom is actually fun for the youngest independent players: a map with authored links, a 2.5D traversable scene, or an optional 3D route?
- How should children express that they prefer low-pressure discovery today rather than a structured challenge, without adding menus?
- How long should an expedition be, and which kinds of consequence need preview and reversibility?
- How do we make relationship tension authentic without trapping a child in an emotional problem they did not consent to solve?
- How much replay variety remains meaningful after the first ten expeditions? Must be learned through observation, not author intuition.
- Which regional areas are canonically available? Coordinate with the broader world/source-book decisions before naming them as established lore.

## 13. Decision record

**Provisional GO:** Continue concept development of *bounded relationship-first expeditions*, with an engine-independent proof first.  
**Explicit NO-GO:** Unlimited procedurally generated world, arbitrary AI-authored quest canon, runtime AI content generation to children, a Verdant engine replacement, or an early M2/M3 release dependency.  
**Owner decision still required:** Approval to begin a new implementation slice or change a roadmap milestone.  
**Definition of done for this design:** Reviewed, internally consistent, cross-linked to existing authority; followed by a separately approved playable prototype, real child playtest, and measured technical acceptance.

This document is a design proposal, not a claim that any of the mechanics have shipped.
