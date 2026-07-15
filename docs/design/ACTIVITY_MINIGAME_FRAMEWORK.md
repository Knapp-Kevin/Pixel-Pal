# Activity Mini-Game Framework

## Core rule

Players participate in shared activities. Selecting an activity may open a playable scene, but selection alone must never create a friendship, memory, skill gain, preference discovery, village change, or other meaningful outcome.

## Activity structure

Every shared activity has four stages.

### Invitation

The player sees what the Pals might do together and chooses whether to begin. The invitation does not grant the result.

### Play

The player performs the activity through touch, drag, timing, matching, arranging, tracing, choosing, rhythm, exploration, or another meaningful interaction.

### Cooperation

The other Pal visibly contributes by taking turns, reacting, helping, suggesting, making mistakes, or completing a shared move. The friend cannot be decorative scenery beside a solitary puzzle.

### Resolution

The simulation receives a completed activity result only after play finishes. The result includes the activity identity, completed state, successful actions, cooperative turns, and attempts.

Only a validated completed result may create memories, change relationships, reveal preferences, improve skills, or alter the village.

## Recovery

Early mini-games should avoid harsh failure states. A mistake should produce a visible wobble, miss, surprise, or gentle reset, followed by another attempt. It should not reduce relationship warmth or imply disappointment.

## Accessibility

Every mini-game must support tap-first interaction, a non-drag alternative, reduced-motion behavior, clear focus, color-independent cues, no required audio, readable instructions, and exit without losing the world.

## First-session activities

### Stack Stones

Core verb: choose, drag, and place stones to build a balanced tower.

Cooperation: Fern and the first Pal take turns, then place the final stone together.

Status: active prototype implemented.

### Chase Leaves

Core verb: follow and catch windblown leaves across a bounded scene.

Cooperation direction: one Pal redirects leaves while the other catches them, with roles changing during play.

Status: playable loop required. The invitation card must not resolve the activity.

### Garden Game

Core verb: observe, remember, sort, or identify plants and garden clues.

Cooperation direction: Fern provides garden knowledge while the first Pal notices patterns or remembers locations.

Status: playable loop required. The invitation card must not resolve the activity.

## Release gate

An activity is complete only when:

1. the player performs its core verb;
2. both Pals visibly participate;
3. mistakes recover safely;
4. the activity produces a validated completion result;
5. the resulting memory reflects what was played;
6. the interaction fits the supported tablet viewport without page scrolling.
