# Pixel Pals Documentation Governance

## Authority Order

When documents conflict, use this order:

1. `docs/design/DESIGN_CONSTITUTION.md`
2. `docs/product/VISION_AND_PRODUCT_BRIEF.md`
3. `docs/design/GAME_DESIGN_DOCUMENT.md`
4. `docs/design/SIMULATION_DESIGN_DOCUMENT.md`
5. Specialist bibles and implementation specifications
6. `docs/product/ROADMAP.md`
7. `docs/product/OPEN_QUESTIONS.md`
8. README and historical review documents

Higher-authority documents define intent. Lower-authority documents must conform or explicitly record a proposed change.

## Normative Language

- **MUST**: required.
- **SHOULD**: expected unless evidence justifies an exception.
- **MAY**: optional.
- **PROVISIONAL**: active assumption awaiting validation.

## Canon Classes

- **Established Canon**: verified source-world fact. Changes require an explicit retcon decision.
- **Working Canon**: accepted for current design, still refinable.
- **Game Canon**: fact introduced specifically for the game continuity.
- **Player Canon**: facts created uniquely within a saved world.
- **Legend**: in-world belief that may not be literally true.
- **Unknown**: intentionally unanswered.
- **Retired**: previously considered, no longer active.

## Continuity Policy

The children's-book material is the source-world foundation. The game shares that world but may introduce Game Canon locations, residents, and events. Established book characters retain canonical identities, while player-created worlds may form relationships with them without rewriting their verified backstories unless a deliberate adaptation decision is recorded.

## Current Decisions

- Official title: **Pixel Pals**.
- Official tagline: **Where every friendship changes the world.**
- Governing principle: **Every system strengthens relationships.**
- Fun is a required product outcome, not a secondary benefit.
- The first Pal is named by the player and is partly chosen, partly discovered.
- The player is a lightly defined caretaker-guide, not a Pal owner or ruler.
- The first Pal is the player's first companion and social bridge into the world, not the player's avatar.
- Frostspring is Established Canon.
- Willowmere is PROVISIONAL Game Canon for the first playable village until world review confirms or replaces it.
- Core play is offline-first and tablet-first.

## Change Process

A change to a constitutional or established-canon decision MUST include:

1. the current rule;
2. the proposed replacement;
3. affected documents and systems;
4. reason for the change;
5. migration or continuity impact;
6. explicit approval.

## Document Header Standard

Major documents SHOULD include:

- Status
- Authority
- Canon impact
- Last reviewed
- Depends on
- Open decisions

## Review Rule

Before implementation begins for a system, its governing design document, simulation rules, data schema, and unresolved questions MUST agree. Code does not settle design disputes by accident.
