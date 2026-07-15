# Responsive Tablet Layout Contract

## Core rule

Normal play must fit inside the visible tablet viewport without document-level scrolling.

Pixel Pals uses a fixed game stage rather than a vertically flowing web page. The current scene, story context, available choices, navigation, and save state must remain understandable without searching below the fold.

## Scrolling boundaries

Scrolling is reserved for bounded readers such as the Memory Journal and maintenance tools. Village play, home play, first-Pal creation, activities, ceremonies, and ordinary navigation must not scroll.

## Supported layout classes

| Class | Representative viewport | Expected layout |
| --- | --- | --- |
| Compact landscape | 800 x 600 | Compressed split stage with one action row |
| Standard landscape | 1024 x 768 | Primary split stage |
| Large landscape | 1366 x 1024 | Expanded artwork and breathing room |
| Compact portrait | 600 x 800 | Stacked artwork and copy with bounded actions |
| Standard portrait | 768 x 1024 | Stacked stage with readable creation controls |

These are viewport contracts rather than device-brand assumptions.

## Stage structure

The shell reserves four regions:

1. Navigation
2. Scene and story panel
3. Current actions
4. Quiet save and status line

The scene receives all remaining height after navigation, actions, safe areas, and status are reserved.

Maintenance controls do not participate in normal page flow. Locked controls use a small fixed affordance. Unlocked tools become a separate full-screen reader that may scroll internally.

## Responsive behavior

### Landscape

- artwork and story copy remain side by side;
- action choices remain in one bounded row;
- spacing and decorative detail compress before structure changes;
- action names and primary controls remain visible.

### Portrait

- artwork and story copy stack inside the fixed scene region;
- actions remain bounded below the scene;
- portrait play remains functional rather than showing only a rotation message.

## First-Pal creation

Creation must fit without page scrolling.

The compact control grammar is:

- species spans the available width;
- name spans the available width;
- colors and markings may share a row;
- accessories span the available width;
- confirmation spans the available width.

A later paginated creation flow may replace this arrangement, but it must preserve immediate preview and intentional species choice.

## Touch and readability

- Primary touch targets should remain at least 44 CSS pixels in ordinary tablet modes.
- Text must not be reduced below a readable size merely to avoid overflow.
- Decorative copy should be reduced or clamped before action labels or safety messages.
- Safe-area insets and dynamic viewport changes must be respected.
- Larger screens should reveal more art and breathing room rather than simply inflating controls.

## Release validation

Every candidate build must be checked across the supported viewport classes for:

- no document scrollbars;
- no clipped primary actions;
- no overlapping controls;
- readable names and instructions;
- stable orientation changes;
- safe-area behavior;
- maintenance-tool separation;
- internal journal scrolling without moving the game shell.

A viewport that requires page scrolling for ordinary play fails the release gate.
