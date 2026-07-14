# Pixel Pals Game Design Document

## Document Status

This is the foundational Game Design Document for Pixel Pals.

It defines how the product vision becomes actual play. It is intentionally specific enough to guide implementation while preserving clearly marked open decisions for later validation.

The governing product principles remain:

> **Where every friendship changes the world.**

> **Every system strengthens relationships.**

> **Fun comes first.**

## 1. Game Overview

Pixel Pals is a tablet-first storybook life simulation about anthropomorphic animal communities.

Players discover Pals, help them form friendships and families, build homes, develop skills, explore new regions, preserve memories, and watch villages change through connection.

The game rejects combat as the primary progression model. It replaces combat power with relationship depth, skill growth, household life, community contribution, cultural exchange, exploration, and legacy.

### Core player fantasy

The player becomes a trusted participant in a living world.

They are not the owner of the Pals, the ruler of every village, or the only person capable of solving problems.

They help individuals and communities flourish.

### Primary platform

- Android tablets
- iPad
- Installable progressive web application during early development
- Optional native packaging later

Landscape orientation is primary.

### Primary audience

Provisionally, children ages seven through twelve, with younger co-play and adult appeal.

## 2. Design Goals

Pixel Pals should be:

- immediately enjoyable;
- emotionally rich;
- understandable without lengthy instruction;
- safe to stop at any time;
- playable offline;
- respectful of children’s intelligence;
- deep enough to support months or years of play;
- expressive without requiring mastery;
- hopeful without denying difficulty.

The game should not become:

- a chore simulator;
- a stat optimization contest;
- a collection checklist;
- a currency treadmill;
- a laboratory breeding game;
- an educational worksheet;
- a social platform for children;
- a live-service dependency.

## 3. Core Sources of Fun

### 3.1 Character delight

Pals are funny, surprising, imperfect, and expressive.

Fun comes from discovering:

- preferences;
- quirks;
- habits;
- fears;
- unlikely talents;
- jokes;
- unusual friendships;
- unexpected reactions;
- inherited family traits;
- personal growth.

### 3.2 Creative expression

Players shape:

- homes;
- rooms;
- clothing;
- village spaces;
- ceremonies;
- traditions;
- keepsakes;
- gardens;
- shared spaces.

The design should support charming imperfection. A mismatched home can be more memorable than a perfectly optimized one.

### 3.3 Social discovery

Players enjoy learning how Pals relate.

Relationships should produce understandable but not fully predictable outcomes.

### 3.4 Exploration

New regions provide:

- ecosystems;
- species lineages;
- architecture;
- stories;
- traditions;
- environmental puzzles;
- residents;
- mysteries.

### 3.5 Systemic surprise

The simulation should create emergent stories through combinations of:

- traits;
- relationships;
- memories;
- skills;
- household life;
- regional influence;
- inheritance;
- events.

### 3.6 Emotional payoff

The strongest rewards are moments such as:

- a shy Pal joining a group;
- an old friendship becoming family;
- a home finally reflecting its residents;
- a child learning a skill from an elder;
- a Great Tree changing after a ceremony;
- a lost tradition returning in a new form.

## 4. Core Gameplay Loop

The primary loop is:

1. **Notice** a Pal, relationship, opportunity, mystery, or community need.
2. **Choose** who to spend time with and what to do.
3. **Play** through conversation, care, building, exploration, practice, or shared activity.
4. **Discover** a preference, trait, skill, memory, tension, or possibility.
5. **Change** a relationship, home, Pal, village, or region.
6. **Remember** the meaningful result.
7. **Return** later to see how the consequence continues.

The loop should work at multiple scales.

### Five-minute loop

- greet a Pal;
- complete one playful interaction;
- discover or reinforce one small detail;
- save automatically.

### Fifteen-to-twenty-minute loop

- choose a social or creative goal;
- prepare;
- complete a shared activity;
- create a memory;
- observe a relationship or home change.

### Long-session loop

- travel;
- complete several adventure stages;
- make a meaningful decision;
- return with changed skills, memories, and relationships;
- update the village.

## 5. Player Role and Agency

The player role is provisionally a lightly defined caretaker-guide.

The player can:

- meet Pals;
- invite participation;
- offer choices;
- help build or decorate;
- facilitate shared activities;
- support conflict repair;
- organize journeys;
- preserve memories;
- help communities connect.

The player cannot simply command every Pal.

Pals may:

- decline activities;
- prefer another companion;
- need rest;
- change their mind;
- pursue their own goals;
- disagree;
- move;
- form relationships outside direct player control.

The player’s agency comes from influence and care, not domination.

## 6. Pal Design

Each Pal is an individual person within the world.

### 6.1 Pal identity model

A Pal may include:

- name;
- age or life stage;
- species;
- regional lineage;
- visual phenotype;
- home region;
- household;
- relationships;
- characteristics;
- skills;
- preferences;
- dislikes;
- affinities;
- memories;
- goals;
- fears;
- cultural knowledge;
- environmental experience;
- family history.

### 6.2 Memorable character test

A child should describe a Pal through story and personality, not utility.

Good:

> “Fern waits for lonely Pals and always brings too much food.”

Bad:

> “Fern is my level eighteen healer.”

### 6.3 Major-character profile

Major Pals should answer:

- Who are they?
- What brings them joy?
- What worries them?
- What are they naturally good at?
- What do they hope to become?
- How do they help their community?
- What makes them funny or imperfect?
- What would a child remember about them?

## 7. Relationship System

Relationships are the central progression system.

### 7.1 Relationship categories

Potential relationship types include:

- acquaintance;
- friend;
- close friend;
- trusted companion;
- mentor and learner;
- household member;
- partner;
- spouse;
- parent and child;
- adoptive family;
- guardian;
- sibling;
- neighbor;
- respected elder;
- reconciled relationship.

Not all types belong in the first vertical slice.

### 7.2 Relationship state

A relationship should not be represented by one affection number alone.

Possible dimensions include:

- familiarity;
- trust;
- warmth;
- shared interests;
- reliability;
- tension;
- respect;
- shared history;
- current emotional context.

The first implementation should remain simpler, but the architecture must not permanently flatten relationships into one score.

### 7.3 Relationship growth

Relationships change through:

- time together;
- compatible activities;
- gifts with meaning;
- conversation;
- shared challenge;
- teaching;
- care;
- humor;
- conflict;
- apology;
- repair;
- ceremonies;
- family events;
- absence;
- grief.

### 7.4 Explainability

The player should understand why a relationship changed.

Examples:

- “Moki trusted Iska more after she stayed with him during the storm.”
- “Vara felt ignored when the group changed the plan without asking.”
- “Naila discovered that Zeebo also loves painting quiet places.”

### 7.5 Compatibility

Compatibility is contextual.

No species or lineage should have fixed social superiority or incompatibility.

Pals may connect through:

- shared interests;
- complementary traits;
- similar values;
- shared memories;
- successful repair;
- mutual care.

## 8. Care and Interaction

Care actions include:

- feeding;
- playing;
- talking;
- gifting;
- resting;
- helping with clothing;
- preparing a room;
- accompanying a Pal;
- helping practice a skill.

Care should not become repetitive meter maintenance.

Every care interaction should ideally do at least one of the following:

- reveal personality;
- create a memory;
- affect a relationship;
- support a skill;
- improve household life;
- create humor;
- change the environment;
- unlock a future option.

Ordinary affection should not automatically dispense currency.

## 9. Homes and Households

Homes are emotional spaces, not inventory containers.

### 9.1 Home purpose

A home should communicate:

- who lives there;
- what they value;
- what they do together;
- what they remember;
- how the environment affects them;
- how the household has changed.

### 9.2 Home interactions

Players may:

- furnish rooms;
- place meaningful objects;
- improve comfort;
- create shared activity spaces;
- adapt homes to climate;
- preserve family items;
- help residents reorganize after change.

### 9.3 Household dynamics

Households may include:

- individuals;
- partners;
- families;
- adoptive families;
- multigenerational homes;
- friends sharing a home;
- mentors and learners.

The game should not assume one family structure.

## 10. Villages

Villages are living communities.

### 10.1 Village identity

Each village includes:

- environment;
- local species and lineages;
- architecture;
- history;
- culture;
- governance;
- traditions;
- community tensions;
- local activities;
- a Great Tree or equivalent central landmark;
- individual homes and residents.

### 10.2 Village change

Villages change through:

- new relationships;
- migration;
- construction;
- environmental events;
- skills;
- traditions;
- loss;
- conflict;
- cultural exchange;
- generations.

### 10.3 Diversity system

Diversity should unlock qualitative possibilities.

Examples:

- new building styles;
- collaborative crafts;
- mixed festivals;
- new recipes;
- ecological solutions;
- new forms of music;
- stronger exploration teams;
- fresh approaches to conflict.

Diversity must not be reduced to a generic percentage bonus.

## 11. Great Trees

Great Trees are ceremonial, historical, and emotional centers.

### 11.1 Functions

Great Trees may recognize:

- friendship;
- partnership;
- marriage;
- adoption;
- mentorship;
- reconciliation;
- remembrance;
- community service;
- family formation.

### 11.2 Visual history

The Great Tree may change through:

- blossoms;
- ribbons;
- lanterns;
- carved marks;
- painted stones;
- surrounding gardens;
- memorial objects;
- community gathering spaces.

### 11.3 Design guardrail

The Great Tree must never become merely:

- a quest board;
- an upgrade station;
- a relationship vending machine;
- a generic menu with decorative leaves.

## 12. Memories and Legacy

Memory is one of the defining systems.

### 12.1 Memory types

- first meeting;
- shared joke;
- favorite toy;
- home milestone;
- friendship event;
- adventure;
- festival;
- conflict and repair;
- family event;
- teaching moment;
- loss;
- remembrance;
- discovery;
- place association.

### 12.2 Memory effects

Memories may affect:

- dialogue;
- preferences;
- relationship context;
- future choices;
- home decoration;
- ceremonies;
- journals;
- later generations;
- village stories.

### 12.3 Legacy

Legacy may continue through:

- stories;
- recipes;
- songs;
- sayings;
- habits;
- objects;
- family resemblance;
- apprentices;
- buildings;
- traditions;
- Great Tree records.

Legacy should not become a score.

## 13. Skills, Characteristics, Talents, and Affinities

Pals do not use generic RPG levels.

### 13.1 Skills

Skills grow through practice, teaching, and experience.

Examples:

- gardening;
- cooking;
- carpentry;
- painting;
- navigation;
- fishing;
- storytelling;
- music;
- mediation;
- research;
- animal care;
- swimming.

### 13.2 Characteristics

Characteristics shift gradually.

Examples:

- curiosity;
- patience;
- confidence;
- compassion;
- resilience;
- creativity;
- caution;
- sociability;
- generosity.

Characteristics should not be moralized into good and bad personality scores.

### 13.3 Talents and affinities

Talents and affinities represent natural potential, inherited tendencies, environmental adaptations, or unusual sensitivities.

They create opportunity but do not replace effort.

## 14. Exploration and Adventures

Adventures are cooperative illustrated stories.

They are not combat encounters with softer artwork.

### 14.1 Adventure goals

Adventures may involve:

- helping another village;
- finding a traveler;
- restoring a habitat;
- delivering something important;
- learning a craft;
- investigating a mystery;
- navigating weather;
- repairing a route;
- discovering family history;
- resolving misunderstanding.

### 14.2 Adventure structure

A typical adventure includes:

1. invitation or need;
2. choosing companions;
3. preparation;
4. illustrated stage;
5. choice or challenge;
6. relationship consequence;
7. discovery;
8. return;
9. memory and village change.

### 14.3 Failure

Failure should create story, not a dead screen.

Possible outcomes:

- partial success;
- delayed success;
- changed relationship;
- new information;
- repair opportunity;
- alternate solution;
- compassionate response.

The game may allow genuinely sad outcomes, but should avoid arbitrary punishment.

## 15. Conflict and Repair

Conflict is necessary for emotional depth.

### 15.1 Sources

- misunderstanding;
- fear;
- jealousy;
- incompatible needs;
- broken promises;
- cultural difference;
- grief;
- careless behavior;
- competition;
- damaged trust.

### 15.2 Repair tools

- listening;
- apology;
- restitution;
- changed behavior;
- mediation;
- shared work;
- time;
- boundaries;
- acceptance that closeness may not return.

Forgiveness should not be mandatory or instant.

## 16. Loss, Grief, and Continuation

Pixel Pals uses gentle truth.

Possible losses include:

- moving away;
- family change;
- damaged home;
- ended tradition;
- illness;
- failed rescue;
- peaceful death;
- non-graphic death through accident, illness, or environmental event.

Loss must never be used as:

- punishment for absence;
- spectacle;
- guilt manipulation;
- cheap emotional escalation.

The game supports grief through:

- conversation;
- memory;
- ceremony;
- humor;
- tears;
- objects;
- music;
- planting;
- teaching something onward;
- revisiting meaningful places.

Regardless of loss, the game continues, as life does.

The world is not frozen in grief and does not erase it.

## 17. Time, Seasons, and Aging

This system remains partially open.

### 17.1 Time goals

Time should support:

- changing daily routines;
- seasons;
- festivals;
- growth;
- aging;
- long-term memory;
- village history.

### 17.2 Time guardrails

- No punishment for not playing.
- No real-time deadlines for core relationships.
- No required daily login.
- No major irreversible event without appropriate safeguards.
- Absence should be summarized gently.

### 17.3 Life stages

Potential life stages:

- child;
- adolescent;
- young adult;
- adult;
- elder.

Aging speed must be slow enough to preserve attachment and may need player or parent controls.

## 18. Species, Lineages, Environment, and Culture

These systems must remain separate.

### 18.1 Species

Species defines broad biological structure.

### 18.2 Regional lineage

Lineage represents inherited adaptation over generations in a region.

### 18.3 Environment

Environment influences development, opportunity, appearance, routine, and challenge.

### 18.4 Culture

Culture is learned through family, village, travel, and experience.

### 18.5 Spiritual resonance

Some Pals, places, or lineages may feel spiritually attuned.

This remains intentionally ambiguous and should not become a real-world religious analogue or a quantified morality system.

## 19. Genetics and Family Formation

Genetics is a later-stage system but must be anticipated architecturally.

### 19.1 Supported concepts

- genes and alleles;
- genotype and phenotype;
- dominant and recessive expression;
- codominance;
- incomplete dominance;
- limited polygenic traits;
- mutation;
- hidden carried traits;
- sibling variation;
- lineage inheritance.

### 19.2 Art constraint

The phenotype system should use:

- one primary body family;
- limited secondary visible traits;
- color and markings as major heritage carriers;
- compatibility groups;
- deterministic rendering;
- safe fallbacks.

### 19.3 Family dignity

Biological children, adoption, guardianship, mentorship, blended families, and chosen family must all be treated as meaningful paths.

## 20. Economy and Resources

The initial product should avoid a large abstract currency economy.

Potential resources include:

- gathered materials;
- crafted objects;
- community favors;
- shared supplies;
- time and participation;
- special keepsakes.

Currency may exist later, but must not become the reward for ordinary affection.

The game should avoid:

- loot boxes;
- premium currencies;
- randomized paid items;
- artificial scarcity;
- grind-heavy construction;
- child-directed purchase pressure.

## 21. Rewards

Rewards should favor meaning over accumulation.

Examples:

- new dialogue;
- a memory;
- a home object;
- a changed relationship;
- a new activity;
- a place becoming accessible;
- a Pal learning something;
- a village tradition;
- visual change;
- a keepsake;
- a story.

## 22. Onboarding

The first experience should teach through play.

### Onboarding sequence

1. arrive in one village;
2. meet one Pal;
3. complete one playful interaction;
4. make one understandable choice;
5. observe one visible consequence;
6. meet another Pal;
7. help create one shared moment;
8. record one memory;
9. visit the Great Tree.

No system should be introduced before the player needs it.

## 23. Day-to-Day Session Design

A normal session should offer a small number of meaningful possibilities rather than an enormous task list.

Possible daily openings:

- someone wants company;
- a household is planning something;
- weather changes activity;
- a visitor arrives;
- a skill practice is underway;
- a small humorous event occurs;
- nothing urgent happens.

Quiet observation is valid play.

## 24. Returning After Absence

The game should:

- welcome the player;
- summarize meaningful change;
- preserve their place;
- avoid guilt;
- avoid missed-reward walls;
- provide context for major events;
- allow remembrance when needed.

## 25. Shared Play and Introducing a Friend

The first social model should be local and supervised.

Possible features:

- guest village tour;
- read-only memory sharing;
- local cooperative activity;
- temporary guest participation;
- host approval for any permanent change.

No public child profiles, public chat, or unrestricted messaging are required.

## 26. Accessibility

Core requirements:

- large touch targets;
- adjustable text;
- reduced motion;
- high contrast;
- dyslexia-friendly option;
- screen-reader labels;
- no hover dependency;
- tap alternatives for drag or pinch;
- no time pressure for core actions;
- safe undo or confirmation for destructive actions.

## 27. Offline and Persistence Design

The game is local-first.

Requirements:

- automatic saving;
- atomic checkpoints;
- previous-save fallback;
- versioned migrations;
- corruption detection;
- parent-managed export and restore;
- no network requirement for core play;
- safe suspension and resume.

## 28. Vertical Slice Design

The first relationship vertical slice should prove the complete emotional and mechanical loop.

### Included

- one village;
- one Great Tree;
- six Pals;
- one home;
- basic care and play;
- simple preferences and characteristics;
- Pal-to-Pal friendship progression;
- one shared activity or adventure;
- one memory journal entry;
- one Great Tree friendship ceremony;
- one visible village change;
- offline save and resume;
- tablet-first onboarding.

### Excluded

- full genetics;
- children and generational simulation;
- multiple regions;
- public multiplayer;
- backend dependence;
- broad crafting economy;
- procedural world generation;
- complex aging.

### Vertical-slice success test

A child should be able to:

1. open the game;
2. understand where to go;
3. meet Pals;
4. help two Pals share a meaningful experience;
5. see their friendship change;
6. preserve the memory;
7. complete a Great Tree ceremony;
8. observe a lasting world change;
9. close the game safely;
10. return later and find the change preserved.

## 29. Content Design Rules

Every content item should identify:

- who it is about;
- which relationship it affects;
- what makes it fun;
- what can surprise the player;
- what changes;
- what memory may result;
- what the safe stopping point is;
- whether it works offline;
- what emotional risks exist.

## 30. Design Anti-Patterns

Reject or redesign features that rely on:

- repetitive meter filling;
- affection as currency production;
- daily streaks;
- fear of missing out;
- species stereotypes;
- one correct family structure;
- arbitrary irreversible loss;
- unexplained stat changes;
- meaningless rarity;
- giant feature dashboards;
- constant notifications;
- combat language applied to non-combat play;
- complexity added only because simulation permits it.

## 31. Open Design Decisions

The following still require explicit decisions or prototypes:

- exact player identity;
- first village used in gameplay;
- first six Pals;
- exact relationship dimensions for M1;
- time scale;
- aging controls;
- economy model;
- narration;
- book canon versus game canon;
- initial profile model;
- first species and lineages;
- how much the world changes during absence;
- whether children can freely rename canonical Pals;
- how major loss events are gated;
- the first Great Tree ceremony interaction.

## 32. Definition of a Successful Feature

A feature is ready only when it answers:

- Is it fun?
- Which relationship does it strengthen?
- What feeling does it create?
- What visibly changes?
- What memory can it produce?
- Can a child understand it?
- Can the child stop safely?
- Does it work offline?
- Does it preserve trust?
- Does it still belong without currency or engagement pressure?

## 33. Final Design Promise

Pixel Pals should feel like a place children love visiting, not a system demanding attention.

It should create laughter, wonder, creativity, affection, conflict, growth, grief, memory, and hope.

The game does not end when a task is completed, a Pal leaves, or a generation passes.

The world continues.

Relationships leave marks on homes, families, villages, Great Trees, and future lives.

The player’s lasting achievement is not power.

It is a world made richer by the lives that touched it.
