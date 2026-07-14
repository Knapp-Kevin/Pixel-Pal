# Pixel Pals Simulation Design Document

## Purpose

This document defines the rules beneath Pixel Pals.

The Game Design Document describes what players do and feel. This document describes how the world changes, why it changes, and how those changes remain deterministic, explainable, testable, and safe to preserve over years of play.

The simulation must support the product promise:

> **Where every friendship changes the world.**

The simulation must also preserve a second truth:

> **The game continues because life continues.**

## Simulation Goals

The simulation should create a world that feels alive without becoming opaque, punishing, or computationally wasteful.

It should:

- produce understandable but not entirely predictable outcomes;
- give Pals lives beyond the player's direct actions;
- preserve relationships and memories over long periods;
- support ordinary days, major events, growth, conflict, loss, and renewal;
- remain deterministic for save integrity, replay, testing, and debugging;
- operate offline;
- avoid simulating detail that produces no meaningful player experience;
- explain important changes in child-readable language.

## Non-Goals

The simulation is not intended to model:

- biologically exact genetics;
- real-time needs that punish absence;
- every minute of every Pal's day;
- unrestricted artificial intelligence behavior;
- a complete economy;
- competitive optimization;
- species-based moral traits;
- relationship outcomes determined by a single compatibility score;
- a perfectly realistic society.

Believability comes from coherent rules, not exhaustive simulation.

## Architectural Principles

### Deterministic state transitions

Given the same initial state, content version, seed, and ordered commands, the simulation must produce the same resulting state and events.

Randomness is permitted only through an explicit seeded random source.

### Commands produce events

Players and systems submit commands.

Validated commands produce one or more domain events.

Events are applied to world state.

This allows:

- replay;
- debugging;
- save recovery;
- explainability;
- audit of relationship and memory changes;
- future story recaps.

### Rules are framework-neutral

The simulation package must not depend on:

- React;
- browser APIs;
- IndexedDB;
- network services;
- rendering systems;
- device input APIs.

### Content is data-driven

Species, lineages, skills, activities, memories, regions, villages, adventures, and ceremonies are content definitions validated against schemas.

Rules interpret content. UI does not own rules.

### Simulation depth follows emotional value

The game should deeply simulate relationships, memories, households, lineage, and village history because they support the product identity.

It should simplify systems that do not produce meaningful memories or choices.

## World State

The canonical world state contains:

- world metadata;
- simulation clock;
- content version references;
- player profile and permissions;
- Pals;
- relationships;
- memories;
- households;
- homes;
- villages;
- Great Trees;
- regions;
- active and completed activities;
- story and adventure state;
- inventory and shared resources;
- scheduled events;
- world history index;
- save and schema versions.

All world state must be serializable.

Dates should use simulation timestamps rather than JavaScript `Date` objects inside canonical state.

## Identity Model

Each Pal has stable identity independent of appearance, location, role, or relationships.

A Pal record includes:

- immutable Pal ID;
- canonical or player-provided name;
- pronouns or presentation metadata where appropriate;
- birth or arrival timestamp;
- life stage;
- species ID;
- regional lineage IDs;
- genome reference where applicable;
- phenotype definition;
- environmental affinities;
- cultural memberships and learned traditions;
- characteristics;
- skills;
- talents;
- preferences;
- fears and sensitivities;
- household membership;
- home location;
- village citizenship or residency;
- current activity;
- health and wellbeing state;
- relationship references;
- memory references;
- personal history tags;
- alive, absent, moved, or deceased status.

A Pal must remain recognizable as the same individual across all life stages and world changes.

## Simulation Time

### Time layers

Pixel Pals uses three layers of time.

#### Session time

Time spent in the active play session.

Used for:

- interaction pacing;
- animation timing;
- short activities;
- immediate feedback.

Session time is not canonical world history.

#### World time

The fictional calendar used for days, seasons, ages, events, and history.

World time advances through explicit simulation ticks or commands.

#### Real elapsed time

Time between player sessions.

Real elapsed time may inform world progression, but it must not be applied directly without limits and policy.

### Absence progression

The world may progress during absence, but progression must be bounded.

Rules:

- no Pal suffers because the player did not log in;
- relationships do not decay solely from player absence;
- no irreversible major event should be generated without appropriate notification and support rules;
- elapsed time should be compressed after a configured threshold;
- unfinished player-led activities pause safely;
- ordinary background changes may continue;
- major changes create return summaries;
- absence progression must be deterministic from the saved state and elapsed-time input.

### Early product time policy

For the initial vertical slice:

- world time advances only through completed activities and explicit day transitions;
- no aging occurs during real-world absence;
- no death occurs;
- no relationship decay occurs;
- ambient village changes may be selected when a session begins.

This deliberately prevents later life-cycle mechanics from contaminating the first relationship loop.

## Commands and Domain Events

### Command requirements

Every command includes:

- command ID;
- command type;
- acting entity;
- target entities;
- simulation timestamp;
- expected state version;
- command payload;
- optional deterministic seed context.

Commands must be validated before state mutation.

### Initial command set

- `MeetPal`
- `TalkWithPal`
- `GiveGift`
- `PlayActivity`
- `InviteToSharedActivity`
- `AssignPalToHome`
- `PlaceHomeItem`
- `PracticeSkill`
- `TeachSkill`
- `StartAdventure`
- `ResolveAdventureChoice`
- `RecordMemory`
- `BeginConflictRepair`
- `RecognizeFriendshipAtGreatTree`
- `AdvanceWorldTime`
- `CreateLocalProfile`
- `ChangeAccessibilityPreference`

### Example events

- `PalMet`
- `ConversationCompleted`
- `PreferenceDiscovered`
- `GiftReceived`
- `SharedActivityCompleted`
- `RelationshipChanged`
- `MemoryCreated`
- `SkillExperienceGained`
- `SkillMilestoneReached`
- `CharacteristicShifted`
- `PalAssignedToHome`
- `HomeChanged`
- `FriendshipEligibleForRecognition`
- `GreatTreeCeremonyCompleted`
- `VillageFeatureChanged`
- `ConflictStarted`
- `ApologyOffered`
- `TrustPartiallyRestored`
- `PalMovedAway`
- `PalDied`
- `RemembranceCreated`

## Relationship Simulation

Relationships are the central simulation system.

### Relationship edges

Relationships are stored as edges between two entities.

An edge may be:

- Pal to Pal;
- player to Pal;
- Pal to household;
- Pal to village;
- village to village;
- household to village.

Pal-to-Pal relationships are usually bidirectional but may contain directional dimensions.

For example, one Pal may trust another more than that trust is returned.

### Relationship dimensions

A relationship may track:

- familiarity;
- affection;
- trust;
- comfort;
- respect;
- shared history;
- unresolved tension;
- reliability;
- admiration;
- grief or absence state;
- recognized relationship labels.

The player-facing UI should not expose all dimensions as raw numbers.

### Relationship stages

Possible stages include:

- unknown;
- acquainted;
- familiar;
- friend;
- close friend;
- trusted companion;
- partner;
- spouse;
- estranged;
- remembered.

Family relationships such as parent, child, sibling, guardian, and adoptive family are separate structural labels and may coexist with emotional dimensions.

### Relationship change inputs

Relationship changes may derive from:

- shared activities;
- conversation quality;
- remembered preferences;
- gifts;
- reliability;
- mutual interests;
- skill teaching;
- household life;
- adventures;
- support during difficulty;
- conflict;
- apology;
- restitution;
- time spent apart;
- ceremonies;
- family events;
- cultural misunderstanding or learning.

### Contextual compatibility

There is no permanent soulmate score.

Compatibility is calculated for a specific context using:

- current characteristics;
- preferences;
- skills;
- relationship history;
- unresolved tension;
- environment;
- activity type;
- life stage;
- current wellbeing;
- cultural familiarity.

Two Pals may work beautifully together in a garden and struggle during travel.

### Explainability

Every meaningful relationship change must carry reasons.

Example:

```text
Moki and Iska became more comfortable together because:
- Moki remembered that Iska prefers quiet activities.
- They painted beside the river.
- Iska shared a personal memory.
```

The reasons may be stored as event references and localized explanation keys.

### Relationship thresholds

Relationship labels are not awarded from one number alone.

A friendship recognition may require:

- minimum familiarity;
- sufficient trust;
- at least one positive shared memory;
- no unresolved severe conflict;
- a qualifying mutual choice or event.

This prevents repetitive actions from mechanically purchasing friendship.

## Memory Simulation

Memories are durable records of meaningful experiences.

### Memory categories

- first meeting;
- shared play;
- gift;
- discovery;
- home milestone;
- skill milestone;
- adventure;
- festival;
- conflict;
- repair;
- ceremony;
- family event;
- loss;
- remembrance;
- ordinary cherished moment.

### Memory structure

A memory includes:

- memory ID;
- title key or generated summary;
- timestamp;
- participants;
- location;
- source event IDs;
- emotional tags;
- relationship consequences;
- associated objects;
- associated skills or traditions;
- visibility permissions;
- significance score for presentation only;
- canonical facts;
- optional player note or selected keepsake.

### Memory significance

Significance affects recap and journal placement, not whether a memory exists.

Significance may increase when:

- it is a first experience;
- it changes a relationship stage;
- it occurs during a major world event;
- it connects to an existing important memory;
- it is referenced later;
- it is recognized at a Great Tree;
- it becomes part of family or village history.

### Memory influence

Memories can influence future behavior through tags and references.

Examples:

- a frightening storm may affect travel comfort;
- a successful repair may increase trust;
- a favorite game may become a preferred shared activity;
- a remembered kindness may support reconciliation;
- grief may change how a location feels for a time.

Memories should influence but not permanently imprison a Pal in one response.

### Forgetting

Canonical important memories do not disappear.

Minor memories may be compressed into summaries for performance and presentation.

The system may reduce detail while preserving:

- participants;
- emotional meaning;
- relationship effects;
- historical references.

## Characteristics

Characteristics describe evolving tendencies.

Examples:

- curiosity;
- patience;
- confidence;
- compassion;
- resilience;
- creativity;
- sociability;
- caution;
- generosity;
- adaptability.

### Characteristic rules

- characteristics are not moral scores;
- low confidence is not badness;
- high caution is not cowardice;
- change is gradual;
- context matters;
- characteristics affect likely responses, not guaranteed behavior;
- major experiences may create temporary modifiers;
- repeated supported experiences may create durable shifts.

### Temporary and durable state

A Pal may have:

- baseline characteristic value;
- current context modifier;
- recent experience modifier;
- life-stage modifier;
- environmental modifier.

The UI may describe behavior instead of presenting raw values.

## Skills

Skills improve through use, teaching, observation, and reflection.

### Skill model

A skill includes:

- skill ID;
- experience;
- proficiency tier;
- confidence using the skill;
- teaching capability;
- associated memories;
- cultural variants;
- environmental applicability.

### Proficiency tiers

Suggested tiers:

- unfamiliar;
- learning;
- practiced;
- capable;
- skilled;
- expert;
- mentor.

These are descriptive, not power levels.

### Skill growth

Growth depends on:

- activity difficulty;
- instruction quality;
- relationship with teacher;
- Pal interest;
- prior experience;
- environment;
- rest and wellbeing;
- novelty;
- success, partial success, or reflective failure.

Failure can still generate learning.

### Teaching

Teaching strengthens both skill and relationship systems.

A teacher may pass onward:

- technique;
- cultural style;
- story;
- tool preference;
- confidence;
- tradition.

## Talents and Affinities

Talents describe unusual natural potential.

Affinities describe comfort or sensitivity related to species, lineage, environment, or spiritual resonance.

Examples:

- keen hearing;
- balance;
- heat tolerance;
- underwater comfort;
- pattern recognition;
- plant sensitivity;
- memory for stories.

Talents influence opportunity and learning rate but never replace practice.

Affinities must not be treated as moral or cultural destiny.

## Wellbeing

Wellbeing provides context without creating neglect loops.

Possible dimensions:

- rested;
- comfortable;
- connected;
- stimulated;
- physically well;
- emotionally supported.

Rules:

- wellbeing does not collapse during player absence;
- ordinary needs are handled by households and communities;
- the player can improve conditions but is not solely responsible for survival;
- temporary low wellbeing changes available choices and support needs;
- no manipulative “your Pal is starving because you closed the game” system is permitted.

## Homes and Households

### Household model

A household is a social unit, not merely a building occupancy list.

A household includes:

- members;
- relationship roles;
- shared routines;
- responsibilities;
- traditions;
- shared objects;
- conflicts;
- memories;
- home assignment.

### Home model

A home includes:

- location;
- rooms;
- capacity;
- accessibility features;
- environmental properties;
- furniture and keepsakes;
- resident preferences;
- maintenance state;
- history.

### Home effects

Homes influence:

- comfort;
- shared activity availability;
- household routines;
- skill practice;
- memories;
- identity expression;
- response to climate.

Home effects should arise from meaningful qualities, not a simplistic furniture score.

### Household autonomy

Households continue ordinary life without constant player input.

Residents may:

- prepare meals;
- rest;
- practice skills;
- spend time together;
- care for children;
- repair small problems;
- create minor memories.

The player supports and shapes households but does not micromanage every action.

## Village Simulation

A village is a network of residents, households, places, traditions, resources, relationships, and history.

### Village dimensions

A village may track:

- belonging;
- trust between groups;
- ecological health;
- shared knowledge;
- accessibility;
- hospitality;
- cultural variety;
- resilience;
- unresolved community tensions;
- Great Tree history.

These dimensions should be inferred from world state where practical rather than maintained as arbitrary meters.

### Village change

Villages change through:

- new residents;
- friendships;
- family growth;
- shared construction;
- festivals;
- learned skills;
- cultural exchange;
- environmental events;
- conflict and repair;
- loss;
- new travel routes;
- Great Tree ceremonies.

### Diversity effects

Diversity should create new combinations.

Examples:

- two building traditions create a new structure type;
- mixed ecological knowledge restores a habitat;
- different musical traditions create a festival performance;
- varied skills enable a safer expedition;
- multiple food traditions create new communal meals.

Diversity must not be represented as a universal percentage bonus.

### Isolation

Isolated villages may possess deep specialization, strong continuity, and cultural richness.

Isolation is not automatically evil.

Its risks may include:

- reduced adaptability;
- suspicion of outsiders;
- limited knowledge exchange;
- fragile dependence on one solution;
- unresolved myths about other groups.

The simulation should preserve nuance.

## Great Tree Simulation

Each Great Tree contains a history of recognized communal events.

### Tree records

A Great Tree record may include:

- village ID;
- age or era;
- ceremonies;
- relationship recognitions;
- remembrances;
- visual growth state;
- decorations;
- seasonal state;
- community traditions;
- unresolved mysteries.

### Ceremony eligibility

Ceremonies require world-state conditions rather than menu access alone.

Examples:

- qualifying relationship state;
- mutual consent;
- shared memory;
- household or family readiness;
- community context;
- selected ceremony tradition.

### Ceremony outcomes

A ceremony may:

- recognize a relationship label;
- create a high-significance memory;
- modify the Great Tree appearance;
- unlock dialogue or activities;
- influence village belonging;
- create an heirloom or marker;
- become part of family history.

The tree does not magically force relationships.

It witnesses and recognizes them.

## Activities

Activities are structured interactions involving one or more Pals.

An activity definition includes:

- participants;
- location requirements;
- skill opportunities;
- preference tags;
- relationship contexts;
- possible outcomes;
- memory templates;
- time cost;
- interruption policy;
- accessibility alternatives.

Examples:

- painting;
- cooking;
- gardening;
- building;
- storytelling;
- exploring;
- playing a game;
- repairing;
- fishing;
- stargazing;
- music;
- quiet companionship.

Activities should be reusable in different emotional contexts.

## Adventures

Adventures are multi-stage activities with choices and persistent consequences.

### Adventure state

An adventure includes:

- participants;
- destination;
- stages;
- choices;
- skill and relationship context;
- environmental conditions;
- memories created;
- world changes;
- resumable checkpoint.

### Outcome model

Outcomes may be:

- successful;
- partially successful;
- changed objective;
- unresolved;
- compassionate failure;
- safe retreat.

No generic “quest failed” state should erase the meaning of the attempt.

### Risk

Risk may affect:

- time;
- supplies;
- comfort;
- temporary injury;
- relationship tension;
- world outcome;
- future choices.

Risk should not default to combat or death.

## Conflict and Repair

Conflict is represented as a state with causes, severity, participants, and unresolved needs.

### Conflict causes

- misunderstanding;
- broken promise;
- careless harm;
- jealousy;
- fear;
- resource disagreement;
- cultural difference;
- grief response;
- incompatible goals;
- accumulated minor tension.

### Conflict state

A conflict may track:

- triggering events;
- perceived harm by each participant;
- severity;
- trust impact;
- boundaries;
- attempted repairs;
- current openness to conversation;
- mediator involvement.

### Repair options

- listening;
- apology;
- restitution;
- changed behavior;
- shared work;
- mediation;
- time apart;
- boundary setting;
- accepting a changed relationship.

Forgiveness is not guaranteed or mandatory.

Repair success should depend on context and behavior, not selecting the correct dialogue button once.

## Life Stages and Aging

Potential life stages:

- infant or young child;
- child;
- adolescent;
- young adult;
- adult;
- elder.

### Aging principles

- aging should be slow enough for attachment;
- life-stage transitions should be meaningful events;
- aging should unlock new roles rather than only reduce capability;
- elders retain value through knowledge, mentorship, memory, and community standing;
- no Pal is automatically removed at a life-stage threshold;
- aging must be configurable for family play preferences if needed.

### Early product rule

Aging is deferred beyond the friendship vertical slice.

The initial architecture should support it without activating it.

## Family Formation

Family structures may include:

- biological parent and child;
- adoptive parent and child;
- guardian and child;
- siblings;
- blended family;
- partners or spouses;
- chosen family;
- mentor relationships.

Family formation requires:

- consent where applicable;
- life-stage eligibility;
- household readiness;
- relationship context;
- story or ceremony conditions;
- player support without player ownership of the decision.

## Genetics

Genetics is deterministic and based on a simplified genome.

### Genome model

A genome contains loci.

Each locus contains inherited alleles and expression rules.

Trait systems may include:

- complete dominance;
- recessiveness;
- codominance;
- incomplete dominance;
- limited polygenic expression;
- mutation;
- sex-independent or context-dependent expression where appropriate.

### Genetic categories

Possible visual and biological categories:

- body family;
- size tendency;
- body build;
- fur density;
- base color;
- markings;
- ear shape;
- tail type;
- eye color;
- antlers, horns, mane, or similar features;
- environmental adaptation;
- sensory affinity.

### Phenotype resolution

Phenotype generation must:

- use compatibility rules;
- select one primary anatomical family;
- limit visible secondary anatomical traits;
- use color and markings for much secondary heritage;
- preserve hidden genotype;
- generate deterministic asset keys;
- provide safe fallbacks for invalid combinations.

### Genetics boundaries

Genetics does not encode:

- culture;
- morality;
- occupation;
- intelligence as a universal rank;
- kindness;
- social worth;
- destiny.

### Mutation

Mutation should be rare, bounded, and content-defined.

It may introduce:

- new color variation;
- marking;
- minor physical trait;
- environmental adaptation.

It should not produce arbitrary anatomy outside the art pipeline.

## Environment and Adaptation

Environmental influence has three distinct paths.

### Inherited adaptation

Traits shaped across generations and represented genetically.

Examples:

- fur density;
- heat tolerance;
- water comfort;
- color variation.

### Developmental adaptation

Changes shaped during a Pal's life.

Examples:

- swimming skill;
- climate comfort;
- posture;
- practiced movement;
- acquired visual accents where lore permits.

### Cultural adaptation

Learned traditions and knowledge.

Examples:

- clothing;
- architecture;
- food preparation;
- music;
- navigation methods;
- ceremonies.

These paths may interact but must remain distinguishable.

## Spiritual Resonance

Some Pals, places, species, or lineages may feel spiritually attuned.

The simulation may represent this through ambiguous tags such as:

- sense of place;
- tree affinity;
- dream sensitivity;
- calm presence;
- awareness of natural patterns.

The simulation should not define real-world religion, gods, worship, doctrine, or objective spiritual superiority.

Spiritual outcomes should remain interpretable as mystery, intuition, ecology, tradition, or magic.

## Health, Injury, Illness, and Death

### Health

Health should be event-driven and contextual rather than a constantly decaying survival meter.

Possible states:

- well;
- tired;
- mildly ill;
- injured;
- recovering;
- chronically limited;
- seriously ill.

### Injury

Injuries may result from:

- accidents;
- storms;
- exploration;
- work;
- environmental hazards.

Presentation must remain non-graphic.

Injury creates care, adaptation, rest, and community support opportunities.

### Death

Death is not active in the initial release.

When introduced, death may result from:

- old age;
- illness;
- accident;
- environmental event;
- story-specific sacrifice only under strict review.

Rules:

- death is never random spectacle;
- death is never caused by player absence;
- death is never used as a monetization or retention threat;
- presentation is non-graphic;
- important relationships receive grief and remembrance events;
- the Pal remains in history, memories, family records, and Great Tree records;
- the world continues.

### Grief

Grief is modeled through temporary and evolving states, not one universal meter.

Possible responses include:

- sadness;
- quietness;
- storytelling;
- anger;
- need for company;
- need for space;
- preserving objects;
- continuing traditions;
- humor and affectionate remembrance.

Grief changes over time but is not erased.

## Movement and Migration

Pals may:

- visit another village;
- travel temporarily;
- join an adventure;
- move households;
- migrate permanently;
- return later.

Migration considers:

- relationships;
- opportunity;
- environmental comfort;
- cultural familiarity;
- household ties;
- personal goals;
- village hospitality.

The player may support or influence migration but should not move Pals as inventory.

## Background Simulation

The world should feel active without processing every Pal continuously.

### Event-based scheduling

Background life uses scheduled events and bounded simulation windows.

Examples:

- household meal;
- skill practice;
- village gathering;
- seasonal transition;
- visitor arrival;
- minor conflict;
- repair completion.

### Level of detail

Simulation detail depends on relevance.

- active scene: detailed state transitions;
- current village: moderate activity simulation;
- distant village: summarized events;
- long absence: compressed historical changes.

### No invisible cruelty

The background simulation must not generate severe loss or harm merely because a player was absent, unless the event was already explicitly scheduled by a known story and the return experience is designed for it.

## Return Summaries

When world state changes during absence, the game creates a return summary.

It should include:

- major relationship changes;
- household changes;
- arrivals and departures;
- village changes;
- important memories;
- unfinished player decisions;
- grief or remembrance context where relevant.

The summary must remain concise and child-readable.

## Resources and Economy

The simulation may track:

- materials;
- food;
- crafted goods;
- gifts;
- keepsakes;
- shared village resources;
- favors or contribution records.

Rules:

- ordinary care does not produce currency;
- affection cannot be purchased through repetition alone;
- resources should connect to activities, homes, gifts, community work, and exploration;
- scarcity should create choices, not anxiety;
- no premium currency or real-money dependency is permitted in the core simulation.

## Invariants

The simulation must enforce invariants such as:

- every active Pal has a valid species;
- every resident belongs to at most one primary household at a time;
- every household home reference resolves or is explicitly unhoused;
- deceased Pals cannot perform active commands;
- memories reference valid historical entities or preserved tombstone records;
- recognized family relationships remain structurally consistent;
- parent-child cycles are impossible;
- relationship event history remains ordered;
- save schema and content versions are present;
- no command partially mutates state after failure;
- Great Tree ceremonies reference valid participants and prerequisites.

## Validation and Testing

### Unit tests

Test pure rules for:

- relationship changes;
- skill growth;
- characteristic shifts;
- memory creation;
- ceremony eligibility;
- genetics;
- phenotype resolution;
- time advancement;
- conflict repair;
- aging and death when introduced.

### Property tests

Useful properties include:

- deterministic replay;
- no invalid family cycles;
- no orphaned references;
- no negative resource values unless explicitly supported;
- no relationship label without prerequisites;
- phenotype always resolves to valid assets or fallback;
- save round-trip preserves state.

### Scenario tests

Maintain readable scenarios such as:

- two strangers become friends through varied activities;
- repetitive gifts fail to manufacture a friendship;
- a conflict changes trust and is partially repaired;
- a child inherits hidden traits;
- an adopted child learns household culture without genetic inheritance;
- a Pal moves away and later returns;
- a death creates remembrance and later legacy events;
- a long absence does not punish the player.

## Vertical Slice Simulation Scope

The first relationship vertical slice implements only:

- six fixed Pals;
- one village;
- one home;
- basic preferences;
- a small characteristic set;
- a small skill set;
- player-to-Pal familiarity;
- Pal-to-Pal friendship;
- shared activities;
- memory creation;
- one Great Tree friendship ceremony;
- one visible village change;
- explicit world-time advancement;
- deterministic replay;
- offline save integration.

Deferred:

- aging;
- death;
- biological children;
- genetics UI;
- migration;
- multiple villages;
- background progression during long absence;
- complex conflict;
- broad economy;
- dynamic procedural characters.

## Open Simulation Decisions

The following require explicit decisions before their dependent milestones:

1. Exact world calendar and time scale.
2. Player identity in canonical state.
3. Relationship dimensions shown to players.
4. Whether relationship stages can regress and under what conditions.
5. Aging pace and family-configurable options.
6. Whether major life events can occur during absence.
7. First supported family structures.
8. Initial genetic loci and compatibility groups.
9. Degree of environmental phenotype change within one lifetime.
10. Illness and death content controls for parents.
11. How much village autonomy occurs without player involvement.
12. Whether player notes become canonical memories or private annotations.

## Final Simulation Principle

The simulation does not exist to prove that the world is complicated.

It exists to make relationships, choices, and time feel consequential.

A strong Pixel Pals simulation should allow a child to understand why two Pals became friends, why a home feels different after a family moves in, why an inherited trait appeared generations later, why a village changed after welcoming newcomers, and why someone who is gone still matters.

The rules should be deep enough to remain believable, simple enough to remain explainable, and gentle enough to support a child through both joy and change.
