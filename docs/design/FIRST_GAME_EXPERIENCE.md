# Pixel Pals First Game Experience

## Status

Working design specification for the first playable vertical slice.

## Outcome

Within the first session, the child MUST:

1. enter the world without creating an online account;
2. choose, name, and visually shape their first Pal;
3. discover at least one part of that Pal's personality through play;
4. meet another resident;
5. help create the beginning of a Pal-to-Pal friendship;
6. create a durable memory;
7. see a small visible change in the village;
8. visit the first Pal's home and make one personal choice there;
9. revisit meaningful events through a memory journal;
10. stop safely and resume later.

## Player and First Pal

The player is a lightly defined caretaker-guide.

The first Pal is not the player's avatar and is not owned by the player. They are the player's first companion, neighbor, and social bridge into village life.

The child chooses:

- the Pal's name;
- one species or body family from a meaningful starting selection;
- one palette or marking option;
- one simple accessory.

The game determines or gradually reveals:

- preferences;
- quirks;
- characteristics;
- emerging skills;
- fears;
- ambitions;
- later relationships.

The first Pal MUST feel partly chosen and partly met.

## Starter Choice Policy

Pixel Pals MUST NOT assign one canonical starter Pal or one canonical starter species.

The first-Pal screen MUST:

- present multiple visually distinct species or body families;
- begin without a species preselected;
- require an intentional player choice before world creation;
- give each starter option equivalent narrative importance;
- avoid labeling one option as recommended, balanced, easiest, rarest, or best;
- preserve the chosen species, appearance, and name in the local world;
- allow every starter option to participate in the same first-session relationship and legacy systems.

The vertical slice MUST support Fox, Deer, Rabbit, Kitten, and Duckling as equal starting choices.

The player-facing labels **Kitten** and **Duckling** describe the young starter life stage. Their persistent biological species identifiers remain **Cat** and **Duck**, allowing the same Pals to mature without changing species records later.

The launch roster SHOULD expand beyond these five after the modular art and animation system is validated.

A focused art-quality pass MAY refine one body family first for production learning, but that internal sequence MUST NOT remove, demote, or narratively privilege the other player-facing choices.

## First Session Flow

### 1. Opening image

A short storybook opening introduces a living village and its Great Tree. It MUST remain brief and skippable.

### 2. First Pal creation

The child selects a species or body family, then names and visually shapes the Pal before prolonged exposition. Suggested names MAY be offered. Confirmation MUST prevent accidental acceptance and permit later renaming through a gentle local process.

No species is selected automatically.

### 3. First playful interaction

The player chooses one of several small activities. The Pal reacts distinctly, revealing a preference or quirk. No currency shower or generic level increase follows.

### 4. Arrival in the village

The first Pal accompanies the player into the village and introduces another resident or reacts to them. This makes the Pal a participant, not tutorial furniture.

### 5. First shared activity

The player helps the two Pals choose or complete a simple activity. Different choices produce different reactions, but no choice is framed as a catastrophic failure.

### 6. First memory

The game records a readable memory containing participants, place, activity, emotional tone, and discovered detail.

### 7. First world change

The relationship causes one visible, modest change, such as a shared object, decorated meeting place, planted flower, repaired bench, or new recurring activity.

### 8. First Great Tree moment

A full Great Tree friendship ceremony MAY occur at the end of the first session or after several short sessions. It MUST feel earned rather than automatic.

The ceremony recognizes a relationship between Pals. It does not certify player ownership.

### 9. First home

After the friendship ceremony, the child may visit the first Pal's home.

The home MUST:

- belong to the Pal rather than act as a player inventory room;
- be accessible to every starter species without species-locked furniture;
- begin simple enough that later household history remains visible;
- preserve chosen objects and changes in the world save;
- support future household members without erasing the original resident's history.

The child chooses one first object from equally valid options:

- a window cushion;
- a memory shelf;
- a story lantern.

No option is mechanically superior. The choice creates a personal memory and a visible, persistent change inside the home.

### 10. Memory journal

The journal presents meaningful events as world history rather than achievements.

Each entry MUST derive from structured memory data and show:

- title;
- participants;
- world day;
- emotional tone;
- readable summary;
- relevant Pal appearance where practical.

The journal MUST be able to grow beyond the first Pal and Fern. Future friends, households, descendants, mentors, departures, and remembrances use the same memory structure.

### 11. Safe exit

The world saves automatically. The child is told plainly that the world is safe and will be waiting. No countdown, streak, missed reward, or guilt message appears.

## Vertical Slice Boundaries

The first experience does not require:

- genetics;
- biological family formation;
- aging or death;
- multiple villages;
- crafting economy;
- backend services;
- public social features.

## Acceptance Criteria

- A child can complete the flow without developer intervention.
- No species is preselected when first-Pal creation opens.
- Fox, Deer, Rabbit, Kitten, and Duckling are presented as equally valid choices.
- The chosen species and first Pal name persist offline.
- Cat and Duck remain the underlying species records for the Kitten and Duckling starter labels.
- The first Pal has at least one discovered and one still-hidden personal trait.
- The first Pal can express preference or refusal.
- The first Pal and another resident gain an explainable relationship change.
- Activity, ceremony, and home memories persist after restart.
- The visible village change persists after restart.
- The chosen home object persists after restart.
- An earlier save without home data receives a deterministic first home without losing memories or relationships.
- The journal renders every stored memory without hardcoding the first event sequence.
- The child can leave after any completed step without penalty.
