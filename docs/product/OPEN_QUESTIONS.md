# Pixel Pals Open Questions and Decision Register

## Purpose

This document captures questions that must be answered before they become expensive assumptions. Each question includes a provisional direction so development can continue without pretending uncertainty does not exist.

## Decision Status

- **Decided:** sufficient for implementation.
- **Provisional:** current direction, still subject to playtest or technical evidence.
- **Open:** requires exploration before dependent work is finalized.

## Audience and Age Range

### What is the primary age range?

**Status:** Open

**Provisional direction:** Design the core interaction model for independent use by children roughly 7 to 12, while supporting co-play with younger children and remaining enjoyable for adults.

**Why it matters:** Reading level, navigation depth, genetics explanations, parent controls, session length, and content tone all depend on this.

**Validation:** Observe the intended child players using a paper or tablet prototype without coaching.

### Is the game primarily single-child, sibling-shared, or family-shared?

**Status:** Open

**Provisional direction:** Support multiple local worlds on one tablet, with one active child world at a time and parent-managed backup.

**Validation:** Confirm how the target tablets are currently shared and whether children expect separate saves.

## Platform and Distribution

### Is the first family alpha a PWA or packaged native app?

**Status:** Provisional

**Direction:** Begin as an installable PWA. Evaluate Capacitor packaging only where iPad or Android installation, storage, full-screen behavior, update control, or parental management makes it necessary.

**Decision gate:** M0 device testing.

### Which specific tablets establish the support floor?

**Status:** Open

**Required evidence:** Model, OS version, screen size, available storage, memory, browser version, and parental-control environment for each family tablet.

**Provisional direction:** The oldest family tablet becomes the initial performance floor unless it creates unreasonable constraints.

### Must portrait orientation be supported?

**Status:** Provisional

**Direction:** Landscape is the primary play orientation. Portrait should show a friendly rotate-device screen rather than a broken layout during the first vertical slice.

## Identity and Player Role

### Who is the player inside the world?

**Status:** Open

Options include:

- an unseen caretaker;
- a named village guide;
- a customizable Pal;
- a traveling storyteller;
- a gentle world spirit or keeper.

**Provisional direction:** Use a lightly defined caretaker role that does not make the player the heroic center of every story.

**Why it matters:** Dialogue, agency, home ownership, travel, and relationship boundaries depend on this.

### Can children name Pals, villages, and families freely?

**Status:** Open

**Provisional direction:** Allow local naming with parent controls, safe length limits, and no network publication. Avoid aggressive automated moderation for private offline names unless distribution requirements demand it.

## World and Story

### What is the long-term world objective?

**Status:** Provisional

**Direction:** Reconnect villages, help Great Trees flourish, and build communities where new relationships create visible cultural and ecological growth.

### Is there a central story or an emergent sandbox?

**Status:** Open

**Provisional direction:** A gentle first story arc provides direction, while relationships and village development remain systemic and replayable.

### What are the first regions and species?

**Status:** Open

**Selection criteria:**

- visually distinct;
- culturally rich without stereotypes;
- useful for demonstrating lineage and environmental influence;
- manageable for the modular art pipeline;
- personally meaningful to the original children's-book world.

**Provisional vertical-slice candidates:** Willowmere forest village with Fox, Deer, and Rabbit Pals. This is not final.

## Relationships and Families

### Which relationship types belong in the first release?

**Status:** Provisional

**M1:** acquaintance, friend, close friend.

**M3:** household, mentor, trusted companion.

**M5:** partner, spouse, parent, child, adoptive family, guardian.

### How are compatibility and conflict represented?

**Status:** Open

**Provisional direction:** Use preferences, characteristics, memories, and context. Avoid fixed soulmate scores or species-based compatibility.

### Can any adult Pals form partnerships and families?

**Status:** Open

**Provisional direction:** Relationships should not be restricted by species pairing. Biological offspring may require compatibility rules in the phenotype system, while adoption and chosen family remain universally available.

### How is aging handled?

**Status:** Open

**Provisional direction:** Pals may progress through life stages, but no death mechanic should enter the early product. Elderhood should add mentorship, history, and community value rather than remove a Pal automatically.

## Genetics and Art

### How biologically realistic should inheritance be?

**Status:** Provisional

**Direction:** Use real conceptual foundations with a simplified trait model. Preserve genotype, phenotype, dominance, recessiveness, codominance, blended expression, limited polygenic traits, and mutation.

### How many visual loci can the art system support?

**Status:** Open

**Required prototype:** Build a compatibility test using three species, three lineages, two poses, and a limited set of inherited layers.

### Can traits cross anatomical families?

**Status:** Open

**Provisional direction:** Use compatibility groups and phenotype rules rather than unrestricted part swapping. Secondary heritage should often appear through color, markings, ears, tail, proportions, or accents.

### Are environmental essences genetic, developmental, spiritual, or all three?

**Status:** Open

**Provisional model:**

- inherited adaptations may affect biological traits;
- living in a region may affect developmental expression;
- cultural essence is learned;
- spiritual resonance remains ambiguous and is not treated as a measurable religion statistic.

### Will generated AI art be used?

**Status:** Provisional

**Direction:** Do not depend on runtime generative AI. Use deterministic modular assets. AI may assist concept exploration only when licensing, consistency, and child-safety review permit it.

## Skills, Characteristics, and Progression

### How many skills should a Pal track?

**Status:** Open

**Provisional direction:** Use a small visible set per Pal and a broader content catalog. Do not display dozens of irrelevant zero-value skills.

### Can characteristics decrease or become negative?

**Status:** Open

**Provisional direction:** Characteristics shift gradually and contextually. Avoid moralized good-versus-bad personality meters.

### What is the economy?

**Status:** Open

**Provisional direction:** Avoid rewarding ordinary affection with currency. Materials, favors, shared resources, and community contribution may support construction and gifts. Any economy must strengthen relationships rather than create grind.

## Tablet UX

### How much text can the target children comfortably read?

**Status:** Open

**Validation:** Test dialogue length, button wording, journal density, and genetics explanations with the actual players.

### Is voice narration needed?

**Status:** Open

**Provisional direction:** Design content so optional narration can be added without making audio required. Text must remain complete and accessible.

### What interactions feel natural on the target tablets?

**Status:** Open

Test:

- tap;
- drag;
- pinch;
- long press;
- swipe;
- accessible alternatives;
- stylus behavior if relevant.

## Save, Profiles, and Parent Controls

### How are multiple child saves separated?

**Status:** Open

**Provisional direction:** Local profiles with icon-based selection and optional simple child PIN only if sibling interference becomes a real problem.

### What belongs behind the parent gate?

**Status:** Provisional

- reset world;
- export and import;
- cloud synchronization;
- external links;
- purchases, if ever introduced;
- analytics consent;
- account management;
- content and accessibility defaults.

### What happens when storage is nearly full?

**Status:** Open

The product needs a child-safe warning, parent-facing detail, and tested recovery path.

## Business and Distribution

### Is this a private family project, commercial product, or both?

**Status:** Open

**Provisional direction:** Build the family alpha as a complete private product while preserving architecture suitable for later commercial distribution.

### What monetization models are acceptable?

**Status:** Provisional

Acceptable candidates:

- one-time purchase;
- paid expansion packs;
- family license;
- optional physical books or art products.

Rejected:

- advertising;
- loot boxes;
- child-directed purchase pressure;
- gambling-like mechanics;
- manipulative streaks;
- selling personal data.

### Does the children's book become canon, source material, or a separate adaptation?

**Status:** Open

This decision affects names, regions, species, lore, art ownership, and future publishing rights.

## Immediate Research Queue

These questions should be answered during M0 in this order:

1. Identify exact target tablets and support floor.
2. Confirm primary age range and reading level.
3. Decide local profile and tablet-sharing model.
4. Define the player's role in the world.
5. Select the first village, three species, and three lineages.
6. Prototype the modular phenotype compatibility model.
7. Define the M1 relationship state machine.
8. Define atomic save and recovery behavior.
9. Establish art provenance and licensing rules.
10. Decide whether the children's book is canonical source material.
