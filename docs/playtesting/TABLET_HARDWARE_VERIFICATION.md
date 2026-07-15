# Pixel Pals Tablet Hardware Verification

## Purpose

This checklist covers failures that unit tests and desktop browsers cannot prove away. Run it on every supported tablet family before external playtesting and on the oldest device intended for release.

## Required device matrix

Record at least:

| Device | OS version | Browser or installed PWA | Memory | Free storage | Result |
| --- | --- | --- | --- | --- | --- |
| Newest target tablet |  |  |  |  |  |
| Oldest target tablet |  |  |  |  |  |
| Lowest-memory target |  |  |  |  |  |
| Family daily-use tablet |  |  |  |  |  |

## Installation

1. Open the private deployment over HTTPS.
2. Confirm the Pixel Pals icon appears correctly in browser installation UI.
3. Install the application.
4. Confirm the icon is readable on the home screen and remains inside the maskable safe area.
5. Launch from the installed icon.
6. Confirm standalone mode, landscape orientation, theme color, and splash treatment.
7. Confirm no external network permission, camera, microphone, location, payment, Bluetooth, serial, or USB prompt appears.

## Offline lifecycle

1. Create and name a first Pal while online.
2. Complete the shared activity and friendship ceremony.
3. Close the application completely.
4. Disable Wi-Fi and cellular connectivity.
5. Reopen from the installed icon.
6. Confirm the world, memories, home, and village changes load.
7. Complete a new local action offline.
8. Close and reopen again while still offline.
9. Confirm the new action persisted.
10. Restore connectivity and confirm the local world remains unchanged.

## Checkpoint recovery

1. Export a valid world backup from parent mode.
2. Complete another action and confirm it saves.
3. Use browser developer tools or a controlled test build to corrupt only the active checkpoint.
4. Reload the application.
5. Confirm the previous valid checkpoint opens automatically.
6. Confirm child-facing copy does not imply that a Pal was harmed or lost.
7. Reopen once more and confirm the repaired checkpoint remains valid.

## Parent access

1. Before handing over the tablet, hold the setup control and create a six-digit parent PIN.
2. Confirm normal play does not render backup, restore, reset, or observation controls.
3. Close and reopen the app. Confirm parent tools are locked again for the new browser session.
4. Enter an incorrect PIN and confirm no tools appear.
5. Enter the correct PIN and confirm tools unlock.
6. Lock the tools manually and confirm they disappear from the document.
7. Confirm reset remains unavailable until a backup has been exported during that session.
8. Confirm backup restore requires review plus the exact `RESTORE` phrase.
9. Confirm reset requires the exact Pal-specific deletion phrase.

## Service-worker update

1. Keep an installed build open with a valid world.
2. Deploy a new build.
3. Return to the existing session.
4. Confirm the current session does not reload automatically.
5. Confirm the update notice appears.
6. Complete or cancel any in-progress child action before accepting the update.
7. Select `Update and reopen`.
8. Confirm the new build opens and the existing world remains valid.

## Storage pressure

1. Record available storage before testing.
2. Create or import a near-limit valid backup below 2 MB.
3. Confirm import review remains responsive.
4. Reduce available device storage using ordinary test files or OS tools.
5. Attempt a save under storage pressure.
6. Confirm the UI rolls back to the previous valid world if the write fails.
7. Confirm no partial memory, relationship, or home change appears after reopening.
8. Confirm a backup can still be exported when browser storage remains readable.

## Repeated input and interruption

1. Tap each major world action rapidly several times.
2. Confirm only one action is applied while the save lock is active.
3. Background the app during a save.
4. Rotate the tablet during a save.
5. Force-close the app immediately after tapping an action.
6. Reopen and confirm the world is either fully advanced or safely rolled back, never partially updated.

## Performance observations

Record for each device:

- cold launch time;
- resume time;
- time from action tap to saved confirmation;
- frame drops during Pal and journal rendering;
- input delay;
- memory-related browser termination;
- heat or battery concerns after 20 minutes;
- layout clipping in landscape and portrait warning behavior.

## Security-header verification

On the deployed HTTPS response, confirm:

- Content Security Policy is present;
- framing is denied;
- MIME sniffing is disabled;
- referrer policy is `no-referrer`;
- unnecessary browser permissions are disabled;
- the service worker and HTML document are not served with immutable caching;
- hashed static assets are served with long immutable caching.

The repository `_headers` file is a deployment contract, not proof that the hosting provider applied it. Inspect the actual response headers.

## Release decision

A failed checkpoint, restore, parent-access, offline, or update test blocks external playtesting. Performance concerns may be accepted only with a named device exclusion or a documented remediation plan.
