# Pixel Pals Private Tablet Deployment

## Scope

This document defines the minimum hosting contract for internal and invited-family playtests. It does not authorize a public release.

## Build contract

Use the repository root and run:

```text
npm ci
npm run typecheck
npm test
npm run build
```

The deployable output is the tablet application's Vite `dist` directory.

## Hosting requirements

The host must provide:

- HTTPS only;
- automatic redirect from HTTP to HTTPS;
- immutable caching only for fingerprinted static assets;
- no-store or no-cache behavior for HTML, manifest, and service worker files;
- support for the repository `apps/tablet/public/_headers` rules or equivalent provider configuration;
- SPA fallback to `index.html` without converting missing assets into HTML responses;
- no injected analytics, advertising, session recording, chat widgets, or third-party scripts;
- access restriction appropriate to the private playtest audience.

## Required response headers

The deployed responses must enforce:

- Content Security Policy;
- `X-Content-Type-Options: nosniff`;
- `Referrer-Policy: no-referrer`;
- framing denial;
- a restrictive Permissions Policy;
- same-origin opener and resource policies where supported.

The checked-in `_headers` file is a provider-oriented reference implementation. Inspect the real HTTPS responses after every hosting change. A committed header file that the host ignores is merely optimistic literature.

## Content Security Policy expectations

The current application should require only:

- scripts from the same origin;
- styles from the same origin, with temporary inline-style allowance while prototype inline styles remain;
- images from the same origin plus local `data:` and `blob:` sources;
- same-origin fetches;
- same-origin or blob workers for the PWA lifecycle;
- no objects, frames, external forms, cameras, microphones, location, payment, USB, serial, or Bluetooth access.

Any new integration that requires widening this policy needs a documented architecture and privacy review before deployment.

## Privacy boundary

Private playtest deployments must not collect:

- child names;
- Pal names;
- world backups;
- observation notes;
- interaction analytics;
- device identifiers;
- IP-derived location beyond unavoidable transient hosting logs.

World state remains inside browser storage unless an adult explicitly exports a local backup file.

## Parent controls

Before the tablet is given to a child:

1. Open parent setup with the deliberate hold gesture.
2. Create a six-digit PIN not known to the child.
3. Confirm tools lock again after the browser session ends.
4. Export a world backup before destructive test operations.

The PIN is a local casual-access boundary, not remote authentication. It prevents ordinary child interaction with backup and deletion controls. It does not protect against a technically capable person with device or developer-tools access.

## Deployment verification

After every deployment:

1. Inspect actual response headers.
2. Install the PWA on at least one target tablet.
3. Verify the normal and maskable icons.
4. Complete an offline save and reopen.
5. Deploy a second build and verify update prompting rather than automatic reload.
6. Confirm the parent PIN remains locked in a new browser session.
7. Run the relevant sections of `docs/playtesting/TABLET_HARDWARE_VERIFICATION.md`.

## Rollback

Keep the previous verified deployment available until the new build passes tablet smoke testing. A rollback must not require deleting browser storage. Never instruct testers to clear site data as a normal upgrade procedure.
