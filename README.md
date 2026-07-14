# Pixel Pals

> **Where every friendship changes the world.**

Pixel Pals is a tablet-first storybook life simulation about anthropomorphic animal communities. Players discover Pals, welcome them into villages, build homes, nurture friendships, grow families, develop skills, explore new regions, and watch the world change through connection.

Pixel Pals is not a creature-battling game. Pals are not weapons, units, or collectible statistics. They are individuals with homes, relationships, histories, abilities, cultures, and lives of their own.

## Project Status

Pixel Pals is in early foundation development.

This repository is the clean, canonical implementation of the game. The earlier `pixel-pal-paradise-creations` repository remains a reference implementation and source of selectively migrated assets, ideas, and proven components. Code will be brought forward only when it supports the product principles defined here.

## Product North Star

Pixel Pals is built around one governing principle:

> **Every system strengthens relationships.**

Every feature should deepen a relationship, strengthen a family, enrich a community, preserve a memory, or help a Pal find where they belong.

A feature that does none of those things should be redesigned or excluded.

## Player Promise

Pixel Pals gives children a world where:

- kindness has visible consequences;
- differences create new possibilities;
- families can form in many ways;
- communities grow stronger through cooperation;
- identity is shaped by biology, environment, culture, experience, and choice;
- learning happens naturally through play;
- progress does not require violence, competition, or manipulation.

## Core Gameplay Loop

1. **Discover** a new Pal, family, village, or region.
2. **Welcome** Pals into a safe and suitable community.
3. **Build** homes, shared spaces, and village facilities.
4. **Connect** Pals through friendship, companionship, mentorship, and family.
5. **Grow** skills, characteristics, confidence, and community contribution.
6. **Explore** the world through cooperative storybook adventures.
7. **Remember** meaningful events through journals, keepsakes, and village history.
8. **Transform** the world as new relationships unlock new stories, abilities, traditions, and opportunities.

## Design Pillars

### Every Pal Is a Person

Each Pal is an anthropomorphic animal with an individual identity. A Pal can have:

- a species;
- a regional lineage;
- inherited visual traits;
- learned cultural traditions;
- environmental adaptations;
- personality characteristics;
- developing skills;
- preferences and dislikes;
- friendships and family relationships;
- memories and milestones;
- a home and a role within the village.

Pals are not defined by a single number or level.

### Build Lives, Not Armies

Players create places where Pals can live well. They furnish homes, provide toys and clothing, support hobbies, help Pals practice skills, and build shared village spaces.

Progress is measured through flourishing lives and connected communities rather than combat strength.

### Diversity Creates Possibility

Villages often begin with a strong regional or species identity. A forest settlement may be mostly foxes. An island community may be mostly otters. A volcanic village may be home to fire-influenced cats.

As Pals from different species, lineages, and cultures form relationships, the community gains new combinations of knowledge, ability, art, architecture, traditions, and perspective.

Diversity should unlock genuinely new possibilities rather than provide only numerical bonuses.

### Nature Shapes Identity

A Pal is shaped by several independent influences:

1. **Biology** affects inherited physical traits and natural tendencies.
2. **Environment** affects adaptation, affinity, appearance, and opportunity.
3. **Culture** affects traditions, language, craft, clothing, music, and values.
4. **Experience** affects memories, confidence, preferences, relationships, and skills.
5. **Choice** affects the life a Pal ultimately builds.

Biology influences a Pal, but it never fully determines who that Pal becomes.

### Wonder Without Doctrine

The world contains Great Trees, ancient places, regional essences, quiet mysteries, and forms of natural reverence.

Pixel Pals may feel spiritual, but it does not represent or teach any real-world religion. The world should preserve ambiguity, wonder, and respect without defining gods, doctrine, worship, or belief requirements.

## The Great Trees

A Great Tree stands at the heart of each major village.

Great Trees are places where Pals celebrate lasting connections. Depending on the relationship, a tree may recognize:

- friendship;
- companionship;
- marriage;
- family formation;
- adoption;
- mentorship;
- community service;
- reconciliation;
- remembrance.

The tree changes as the village changes. Its branches, blossoms, lanterns, carvings, and surrounding spaces become a visual history of the community.

The Great Tree is not merely a menu for relationships. It is the emotional and symbolic center of the game.

## Species and Regional Lineages

Pixel Pals separates species from regional lineage.

A Fox remains a Fox, but its lineage may reflect generations of life in a particular environment.

Examples include:

- Forest Fox;
- Snow Fox;
- Sea Fox;
- Ember Fox;
- Marsh Fox.

Regional lineages can influence:

- palette and markings;
- fur density or texture;
- ear and tail proportions;
- body silhouette within controlled limits;
- environmental affinities;
- inherited adaptations;
- clothing and decoration traditions;
- likely skills and interests.

Lineages are related populations, not separate collectible species.

## Genetics and Inheritance

Pixel Pals uses a simplified but internally consistent genetics system.

The goal is not to simulate every detail of real biology. The goal is to preserve enough real structure that inheritance remains believable, discoverable, and educational.

The system should support:

- two inherited alleles for selected traits;
- dominant and recessive expression;
- codominance;
- incomplete dominance;
- a limited number of polygenic traits;
- hidden carried traits;
- sibling variation;
- occasional mutation;
- family lineage across generations.

The player-facing interface should remain simple. Children may see likely, possible, rare, expressed, and carried traits without needing to understand every internal calculation.

An optional learning view can introduce scientific terms such as DNA, gene, allele, genotype, phenotype, dominant, recessive, and adaptation.

### Genetics Is Not Destiny

Visual inheritance, capabilities, culture, and personality must remain separate systems.

A Pal may inherit strong swimming potential without visually inheriting every aquatic feature. A child may learn the traditions of adoptive parents without those traditions being represented as genetic. A Pal may grow beyond initial tendencies through experience and practice.

The game should clearly demonstrate that identity comes from more than biology.

## Character Art System

Character art should be deterministic, modular, readable, and suitable for static storybook presentation.

Each Pal should be assembled from compatible visual layers such as:

- primary body family;
- head and muzzle shape;
- ears;
- arms and legs;
- paws, feet, or hooves;
- tail;
- base palette;
- markings;
- body proportions;
- hair, mane, antlers, or horns;
- clothing;
- accessories;
- expression;
- pose.

A Pal should normally express:

- one dominant body family;
- a limited number of visible secondary traits;
- one optional ancestral accent;
- colors and markings that carry much of the mixed-lineage identity.

The genome may preserve deeper ancestry than the portrait visibly displays.

This constraint prevents characters from becoming visually incoherent while still allowing a very large number of combinations.

## Skills and Characteristics

Pals do not gain generic RPG levels.

They develop in separate categories.

### Skills

Skills improve through practice, teaching, and shared experience.

Examples include:

- gardening;
- cooking;
- carpentry;
- fishing;
- swimming;
- navigation;
- storytelling;
- music;
- crafting;
- animal care;
- research;
- mediation.

### Characteristics

Characteristics describe how a Pal tends to respond to the world and can change gradually through experience.

Examples include:

- curiosity;
- patience;
- confidence;
- compassion;
- resilience;
- creativity;
- sociability;
- caution;
- generosity.

### Talents and Affinities

Talents and affinities represent natural potential, inherited tendencies, environmental adaptation, or unusual sensitivity.

They create opportunities, but they do not replace practice or personal choice.

## Relationships and Families

Relationships are a central progression system.

Supported relationship forms may include:

- acquaintance;
- friend;
- close friend;
- companion;
- partner;
- spouse;
- sibling;
- parent and child;
- adoptive family;
- mentor and student;
- neighbor;
- trusted adventure partner.

Relationships grow through shared time, compatible interests, gifts, cooperation, conversation, festivals, adventures, conflict resolution, and significant life events.

Family formation should never be reduced to a breeding interface. Biological children are one possible form of family growth alongside adoption, mentorship, guardianship, blended families, and chosen family.

## Villages and Community Growth

Each village should have:

- a distinct environment;
- a Great Tree;
- local architecture;
- cultural traditions;
- regional music and visual motifs;
- community needs;
- a population with individual homes and roles;
- spaces that change as relationships and diversity grow.

Village diversity may unlock:

- hybrid architecture;
- new recipes;
- collaborative crafts;
- mixed festivals;
- new music;
- improved exploration teams;
- ecological restoration projects;
- schools, workshops, gardens, and gathering spaces;
- new story paths.

A village should feel like a living community rather than a collection of upgrade menus.

## Adventures

Adventures are cooperative illustrated stories rather than combat encounters.

An adventure may involve:

- exploring a new region;
- helping another village;
- finding a lost traveler;
- restoring a habitat;
- solving an environmental problem;
- delivering an important gift;
- discovering a family story;
- learning a new craft;
- navigating weather or terrain;
- uncovering a mystery connected to a Great Tree.

Adventures should reveal personality, build skills, strengthen bonds, create memories, and change the world.

## Memories and Legacy

Pals remember meaningful experiences.

Memories may include:

- first friendships;
- favorite toys;
- homes lived in;
- important gifts;
- festivals attended;
- adventures completed;
- skills learned;
- family milestones;
- conflicts resolved;
- places visited;
- relationships recognized at a Great Tree.

Over time, personal memories become family history, and family history becomes village history.

Legacy is not a score. It is the visible history of a world shaped by relationships.

## Educational Foundation

Pixel Pals is educational because its systems model meaningful ideas, not because it interrupts play with quizzes.

The game can naturally introduce:

- genetics and inheritance;
- biodiversity;
- adaptation and evolution;
- ecology;
- environmental stewardship;
- probability;
- geography;
- architecture;
- cooperation;
- empathy;
- conflict resolution;
- family diversity;
- cultural exchange;
- the distinction between inherited, learned, and chosen traits.

Learning should remain optional, age-appropriate, accurate, and embedded in discovery.

## Tablet-First Product Requirements

Pixel Pals is being designed first for children using tablets.

Primary target surfaces are:

- Android tablets;
- iPad;
- installable progressive web application;
- native tablet packaging where platform capabilities require it.

Desktop and controller support may follow, but tablet interaction is the source of truth.

### Interaction Requirements

- Landscape orientation is the primary gameplay layout.
- Core actions must be comfortable with touch.
- Interactive targets should generally be at least 48 by 48 CSS pixels.
- Critical interactions must not depend on hover.
- Drag interactions require tap-based alternatives.
- Text must remain readable without browser zoom.
- Navigation depth should remain shallow.
- Common actions should require few steps.
- Interfaces should avoid dense tables and tiny inventory grids.
- Sessions should support both five-minute check-ins and longer shared play.
- The game should resume safely after suspension, battery loss, or lost connectivity.

### Performance Requirements

- The first playable screen should load quickly on mid-range family tablets.
- Static illustration should be favored over continuous heavy animation.
- Motion should be brief, purposeful, and reducible.
- Battery consumption should remain modest.
- Large art assets should use responsive sizing and efficient formats.
- Memory use should be tested against older supported tablets.
- Core play should remain available offline after installation.

### Accessibility Requirements

- Adjustable text size;
- dyslexia-friendly font option;
- reduced-motion mode;
- high-contrast mode;
- color-independent status indicators;
- subtitles and text alternatives for audio;
- screen-reader labels for navigation and controls;
- no time pressure for core activities;
- no punishment for interrupted sessions;
- clear confirmation before destructive actions.

## Child Safety and Privacy

Pixel Pals is intended for children and must be designed accordingly from the beginning.

The product should default to:

- no advertising;
- no behavioral profiling;
- no loot boxes;
- no gambling-like mechanics;
- no manipulative daily streaks;
- no public chat;
- no direct messaging with strangers;
- no public location sharing;
- no unnecessary personal information;
- no dark patterns intended to extend playtime;
- no purchase prompts directed at children.

Any account, cloud save, analytics, social, or monetization feature must receive an explicit child-safety and privacy review before implementation.

Parent-facing controls should be clear, separate from child-facing play, and protected from accidental access.

## Offline and Save Model

The game should be offline-first.

A child should be able to open the game on a tablet without an active internet connection and continue playing safely.

The initial save model should support:

- local-first persistence;
- deterministic world state;
- atomic saves;
- recovery from interrupted writes;
- versioned migrations;
- export and backup;
- optional parent-managed cloud synchronization later.

Cloud services must enhance continuity without becoming a requirement for core play.

## Technical Direction

The initial implementation target is:

- TypeScript;
- React;
- Vite;
- an installable progressive web application;
- a touch-first responsive interface;
- deterministic simulation logic separated from rendering;
- IndexedDB or an equivalent durable local store;
- automated unit, integration, accessibility, and end-to-end testing;
- optional Capacitor packaging for Android and iPad distribution.

Technology choices may change when evidence supports a better tablet experience. The product principles are more important than preserving a particular framework.

## Architecture Principles

1. **Simulation logic is deterministic.** The same inputs and seed should produce the same inherited traits and outcomes.
2. **Rendering is replaceable.** Game state must not depend on a specific art renderer or UI framework.
3. **Content is data-driven.** Species, lineages, traits, regions, adventures, skills, and memories should be defined through validated schemas.
4. **Offline is a first-class mode.** Network availability must not control core gameplay.
5. **Accessibility is structural.** It must not be postponed until visual design is complete.
6. **Child safety is architectural.** Privacy and parental boundaries must shape data collection and social features.
7. **Migration is selective.** Legacy code is imported only after confirming that it supports this repository's design and quality standards.

## Proposed Repository Structure

```text
Pixel-Pal/
├── apps/
│   └── tablet/                 # Tablet-first game client
├── packages/
│   ├── simulation/             # Deterministic world and relationship simulation
│   ├── genetics/               # Genome, inheritance, phenotype, and lineage logic
│   ├── content-schema/         # Validated game content definitions
│   ├── art-runtime/            # Modular portrait and scene composition
│   ├── persistence/            # Local-first saves and migrations
│   └── ui/                     # Shared accessible touch components
├── content/
│   ├── species/
│   ├── lineages/
│   ├── regions/
│   ├── cultures/
│   ├── adventures/
│   └── skills/
├── docs/
│   ├── product/
│   ├── design/
│   ├── architecture/
│   ├── safety/
│   └── art/
└── tests/
```

This structure is a target, not a reason to create empty complexity. Packages should be introduced only when working code requires the boundary.

## Initial Vertical Slice

The first playable vertical slice should prove the core promise with minimal scope.

### Included

- one village;
- one Great Tree;
- three species;
- three regional lineages;
- six to twelve individual Pals;
- one home type with several furnishing choices;
- basic touch-first navigation;
- feeding, playing, gifting, and conversation;
- Pal-to-Pal friendship growth;
- two or three skills;
- simple characteristics;
- one cooperative illustrated adventure;
- one Great Tree friendship ceremony;
- local offline save;
- a minimal memory journal;
- a first deterministic inheritance prototype in a protected developer or parent-facing view.

### Explicitly Deferred

- public multiplayer;
- public chat;
- competitive play;
- combat;
- real-money economy;
- large-scale procedural worlds;
- unrestricted generative character art;
- complex polygenic simulation;
- native store distribution;
- account creation for children.

## Legacy Migration Policy

The `pixel-pal-paradise-creations` repository is not being copied wholesale.

Potential migration candidates include:

- proven touch interaction patterns;
- accessible UI components;
- home and village concepts;
- adventure content structures;
- Pal data models;
- useful static art assets;
- offline and PWA experiments;
- tests that describe still-valid behavior.

Every migrated component must pass these questions:

1. Does it strengthen relationships?
2. Does it support tablet-first play?
3. Is it understandable to a child?
4. Does it respect privacy and safety?
5. Is it maintainable without legacy orchestration baggage?
6. Does it support the current product identity rather than the abandoned prototype direction?

## Development Phases

### Phase 0: Foundation

- establish product and engineering documentation;
- define supported tablet baseline;
- create the application shell;
- configure quality gates;
- define content schemas;
- establish local-first persistence;
- document child-safety requirements.

### Phase 1: Relationship Vertical Slice

- render one illustrated village;
- introduce a small Pal roster;
- support homes and basic care;
- implement Pal-to-Pal friendship;
- record shared memories;
- complete a Great Tree friendship ceremony.

### Phase 2: Growth and Exploration

- add skills and characteristics;
- add a cooperative adventure;
- connect outcomes to relationships and village change;
- introduce a second region and regional lineage.

### Phase 3: Family and Inheritance

- implement deterministic genomes;
- display expressed and carried traits;
- create family lineage views;
- support biological and adoptive family growth;
- validate educational explanations.

### Phase 4: Community Diversity

- model village composition;
- unlock collaborative buildings, traditions, and stories;
- introduce cultural exchange and environmental adaptation;
- visually evolve the Great Tree and village.

## Definition of Done

A feature is not complete until it includes:

- child-readable UX;
- touch interaction;
- keyboard support where applicable;
- reduced-motion behavior;
- offline behavior or an explicit offline limitation;
- persistence behavior;
- tests for critical logic;
- documentation for new systems;
- privacy and safety review when data or social behavior is involved;
- evidence that it supports the product North Star.

## Contribution Expectations

Pixel Pals is currently a private, family-oriented project in active design and development.

Contributions should favor:

- clarity over cleverness;
- deterministic systems over opaque generation;
- accessible interfaces over visual density;
- meaningful choices over repetitive grinding;
- durable documentation over undocumented assumptions;
- small, reviewable changes over broad speculative rewrites.

## Guiding Questions

Before adding or changing a system, ask:

- Which relationship becomes stronger because this exists?
- What does the child understand through play?
- What changes visibly in the world?
- Can the child safely stop at any time?
- Does this work on a tablet without explanation?
- Does this preserve wonder without sacrificing coherence?
- Does this help a Pal, family, or village flourish?

## Name and Tagline

**Pixel Pals**

**Where every friendship changes the world.**
