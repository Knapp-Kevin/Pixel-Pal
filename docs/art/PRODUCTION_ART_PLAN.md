# Pixel Pals Production Art Plan

## Current status

The checked-in modular SVG renderer is an alpha implementation aid. It proves deterministic species rendering, palette and marking variation, accessory placement, pose switching, scene composition, and data-to-art integration.

It does not meet live-production quality and must not be described as final or launch-ready.

## Production target

The finished visual system must preserve the warmth and painterly identity of the canonical storybook references while remaining practical for repeated tablet play.

The living-world layer needs convincing anatomy, expressive faces, natural poses, material texture, controlled lighting, and coherent environmental depth. The storybook layer needs richer composition, gesture, atmosphere, and narrative specificity than the living-world layer.

## Required workstreams

### Character system

Complete production designs for Fox, Deer, Rabbit, Kitten, and Duckling.

Each starter requires:

- approved proportions and silhouette;
- front, three-quarter, profile, and back references;
- a full expression sheet;
- standing, walking, sitting, resting, carrying, working, and playing poses;
- clothing and accessory anchors;
- palette and marking rules;
- tablet-size silhouette validation;
- age-stage evolution notes.

Fern requires a final canonical model sheet and expression set rather than a generic rabbit variation.

### Living-world scenes

Produce cohesive scene kits for:

- Willowmere village center;
- Great Tree clearing;
- first home exterior;
- first home interior;
- garden activity area;
- leaf-chase path;
- stone-stacking area;
- persistent village changes.

Each scene needs depth layers, lighting states, interaction zones, and safe crops for supported tablet aspect ratios.

### Storybook illustrations

Create finished compositions for:

- first meeting;
- first shared activity;
- Great Tree friendship ceremony;
- first home personalization;
- first major memory.

These should be authored as illustrations rather than screenshots of the living-world renderer.

### Motion system

Define breathing and idle motion, blinking, ear and tail movement, walk and run cycles, reaction poses, simple interaction loops, scene ambience, and reduced-motion alternatives.

Motion should support emotional readability rather than constant stimulation.

## Asset architecture

Production assets must support deterministic assembly, explicit anchor points, consistent layer ordering, multiple resolution tiers, aspect-ratio-safe scene crops, provenance metadata, automated missing-asset checks, and deliberate compatibility failure rather than silent substitution.

## Quality gates

A character is not production-ready until it passes species recognition, individual recognition, silhouette recognition, expression readability, pose consistency, accessory compatibility, compact-screen readability, large-screen inspection, performance limits, and provenance review.

A scene is not production-ready until it passes focal hierarchy, interaction-zone readability, aspect-ratio-safe composition, character scale consistency, lighting and palette coherence, compact-screen review, performance limits, and provenance review.

## Milestones

### Visual benchmark

Produce one near-final starter body family, final Fern, one Willowmere scene, and one Great Tree memory illustration. Use this benchmark to lock anatomy, rendering, texture, lighting, and tooling.

The benchmark is internal and does not make that species the canonical starter.

### Complete starter roster

Bring all five starter forms to the approved benchmark with equivalent pose, expression, clothing, and customization support.

### First-session scene kit

Complete every scene and memory illustration required by the current vertical slice.

### Production validation

Run art integration, performance, aspect-ratio, accessibility, provenance, and observed-play reviews before external release.

## Release rule

The alpha SVG renderer may remain as a development fallback and automated-test fixture. It must not be the default visual presentation in a live production release.
