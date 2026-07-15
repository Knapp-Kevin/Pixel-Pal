# Rabbit and Fern Visual Benchmark

## Status

**Draft benchmark direction. Not yet approved production art.**

The Rabbit body family is the first benchmark target because it creates a demanding and useful recognition test: a player-created Rabbit and Fern must share convincing species anatomy while remaining unmistakably different individuals without relying on names, labels, or clothing alone.

This choice is internal to art production. It does not make Rabbit the canonical, recommended, default, or mechanically privileged starter. Fox, Deer, Rabbit, Kitten, and Duckling remain equal player choices.

The production manifest keeps `benchmarkFamily` unset until a visual review explicitly approves this direction.

The tablet runtime is ready to preview the benchmark without changing normal release behavior. A review build may set `VITE_PIXEL_PALS_ART_STATUS=benchmark`; ordinary builds continue to require `production` assets and otherwise use the alpha fallback.

## Benchmark purpose

The benchmark should settle:

- living-world anatomy and proportions;
- painterly texture translated into an efficient tablet grammar;
- face and eye treatment;
- fur handling;
- line treatment and edge softness;
- clothing materials;
- natural lighting;
- expression readability;
- species recognition;
- individual recognition;
- compact-tablet silhouette readability;
- the visual relationship between living-world assets and storybook illustrations.

## Shared Rabbit-family anatomy

Both characters should read immediately as young anthropomorphic rabbits through:

- long expressive ears with believable attachment and weight;
- compact rabbit muzzles rather than generic child faces;
- visible cheek and nose structure;
- strong hind-leg influence without forcing a permanent crouch;
- small forepaws capable of holding objects;
- short tails that remain readable in profile and rear views;
- soft fur direction that follows anatomy;
- light, alert posture;
- age-appropriate rounded proportions without becoming plush toys.

Avoid generic mascot anatomy, oversized anime eyes, human hands pasted onto animal arms, identical face templates, and clothing that obscures the species silhouette.

## Player-created Rabbit benchmark

The player-created Rabbit represents the adaptable starter family rather than one canonical individual.

Draft visual characteristics:

- youthful but capable body proportions;
- warm oat, honey, or soft clay base palette for the benchmark only;
- broad, curious eyes with a slightly forward posture;
- balanced ear position, one subtly more active than the other;
- simple handmade scarf or satchel demonstrating accessory anchors;
- neutral markings that prove customization without defining one permanent identity;
- open, exploratory energy;
- readable curious, thoughtful, delighted, uncertain, calm, and hopeful expressions.

The design must leave room for palette, marking, accessory, and later age-stage variation.

Player-created Rabbits remain species-driven in the runtime and do not receive one canonical individual art identity.

## Fern benchmark

Fern is a specific individual and must not look like the starter Rabbit with a different color swatch.

Required distinguishing traits:

- moss-cream fur palette;
- soft ear dappling as a stable signature feature;
- narrower, more observant eye shape;
- one ear commonly angled toward the activity or other Pal;
- slightly smaller, grounded posture;
- gentle confidence rather than generic cheerfulness;
- practical handmade garden clothing or satchel details;
- visible evidence of gardening habits without turning her into a costume theme;
- distinct muzzle, cheek, brow, and ear proportions;
- recognizable silhouette at compact tablet size.

Fern should feel generous, attentive, and quietly playful. She should not read as a tutorial mascot or a permanently excited sidekick.

Fern uses the stable runtime art identity `fern`, which takes precedence over generic Rabbit-family art.

## Required benchmark board

The first review board should contain, without text embedded in the artwork:

1. Full-body three-quarter view of the starter Rabbit.
2. Full-body three-quarter view of Fern.
3. Side-by-side neutral silhouettes.
4. Curious, thoughtful, and delighted expressions for each.
5. One shared garden interaction pose.
6. One shared stone-stacking interaction pose.
7. A small Willowmere environmental vignette establishing lighting and palette.

The board should use a quiet parchment or natural-paper ground with subtle foliage framing. It should feel like a professional animation or game art benchmark, not a marketing poster.

## Runtime review package

The first integrated review package must include:

- benchmark assets registered for generic Rabbit and stable identity `fern`;
- explicit expression and pose selectors;
- required Willowmere scene variants;
- provenance records for every supplied file;
- crop review at all five supported tablet profiles;
- a benchmark build using `VITE_PIXEL_PALS_ART_STATUS=benchmark`;
- confirmation that a normal build still uses the alpha fallback until assets reach `production` status.

Missing benchmark states must fall back honestly. The resolver may not substitute an unrelated expression, identity, or persistent scene state merely because an image exists.

## Visual language

Target qualities:

- warm storybook illustration;
- gouache, watercolor, or softly textured digital paint character;
- controlled painterly edges;
- natural indirect light with gentle golden highlights;
- rounded but anatomically convincing silhouettes;
- expressive posture before facial exaggeration;
- handmade textiles and natural materials;
- calm composition with breathing room;
- no text, logos, UI, labels, or decorative typography in the image.

The target must not imitate a named living artist, franchise, film studio, or copyrighted character style.

## Review gates

The draft fails if:

- Fern and the starter Rabbit are difficult to distinguish without clothing;
- either character reads as a generic plush mascot;
- anatomy changes between poses;
- expressions depend only on eyebrow changes;
- ears behave as decorative antennae rather than weighted anatomy;
- the compact silhouette collapses into the same shape;
- the living-world interpretation feels unrelated to the storybook tone;
- details become noisy at 800 x 600;
- the composition requires scrolling or cropping out either character.

The draft may be promoted to an approved benchmark only after visual review, compact and large tablet review, provenance completion, and an explicit update to `art/production-manifest.json`.
