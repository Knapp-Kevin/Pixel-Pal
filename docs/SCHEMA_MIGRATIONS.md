# Pixel Pals Schema Migrations

## Purpose

Pixel Pals worlds are long-lived local records. Schema changes MUST preserve valid Pals, relationships, memories, homes, and village history whenever a deterministic migration is possible.

A migration MUST NOT silently discard meaningful world data merely to satisfy a newer shape.

## Current version

The current world schema version is **2**.

Every newly created or newly exported world uses version 2.

## Loading rules

The parser MUST:

1. inspect the declared schema version;
2. validate the source version before migration;
3. apply migrations sequentially;
4. validate the complete current-world invariants after migration;
5. reject unknown future versions rather than guessing;
6. leave the stored recovery checkpoint untouched when parsing fails.

## Version 1 to version 2

Version 2 introduces:

- stable optional Pal story roles;
- explicit `first-neighbor` identity for the first relationship path;
- required current-world home collection;
- repaired first-Pal household linkage;
- duplicate identity rejection;
- bounded entity collections;
- finite numeric validation;
- stronger species and lineage references;
- Pal, village, and household consistency;
- relationship endpoint and duplicate-pair validation;
- memory participant, village, and chronology validation;
- Great Tree, village, and recognized-memory consistency.

The migration:

- preserves an existing home containing the first Pal;
- creates a deterministic first home only when none exists;
- links the first Pal to that home when the old household link is absent or invalid;
- derives the first neighbor from the first Pal's directed relationship;
- assigns that Pal the stable `first-neighbor` story role when no role exists;
- preserves all valid relationships, memories, appearance, preferences, skills, village state, and Great Tree state.

## Migration safety rules

A migration MUST be:

- deterministic for the same source world;
- idempotent after the target version is reached;
- free of network requirements;
- validated before persistence;
- covered by regression tests;
- unable to overwrite the previous valid checkpoint until the migrated world is fully accepted.

A migration MUST NOT:

- identify a Pal by display name;
- generate a new identity for an existing Pal;
- delete an unknown field without an explicit migration decision;
- reinterpret a relationship solely to make validation pass;
- silently accept a future schema version;
- replace a valid existing home merely because its style differs from the current starter home.

## Backup compatibility

Backup import uses the same parser and migration path as local save loading.

Before restore, the application MUST:

- reject oversized files;
- parse and migrate the candidate in memory;
- show an adult-facing summary;
- require explicit restore confirmation;
- preserve the current valid world as the recovery checkpoint.

## Adding a future schema version

For each new version:

1. add a source-version schema;
2. write one migration function from the immediately previous version;
3. preserve stable identities;
4. update `CURRENT_SCHEMA_VERSION`;
5. add valid and adversarial migration fixtures;
6. test repeated parsing of the migrated result;
7. test import, active checkpoint, and recovery checkpoint paths;
8. document any information loss explicitly.

Skipping version numbers or writing one unbounded migration from every historic shape directly to the newest version is prohibited. That approach is efficient only until the first real family has kept a world for three years, at which point it becomes a small, avoidable tragedy.
