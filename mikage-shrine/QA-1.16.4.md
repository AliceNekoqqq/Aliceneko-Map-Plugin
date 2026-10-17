# Independent minigame launch fix 1.16.4

Tavern Helper executes scripts in separate hidden iframes. The released minigame
module registered `MikageMinigames` on its own `window`, but the statusbar looked
for that API on the parent Tavern window. The module could load successfully
while the entry continued to say that the stage was preparing.

The modal API, its DOM, activity document and focus animation now use the parent
window. Its lifetime remains owned by the helper script: unloading it closes its
modal and removes its API. The loader publishes an `ensureReady` promise on the
parent window before fetching. The statusbar awaits that promise and opens the
requested activity automatically; timeout / disabled script / startup failure
have actionable messages. Cancelling, switching region or disposing the scene
invalidates pending requests.

`tests/minigames-iframe.test.cjs` runs the real scene module and the real loader /
minigame module in separate hidden sibling iframes, with the statusbar in a third
iframe. At both 390px and 1280px it verified:

- The old immutable release reproduces the isolation failure (optional legacy
  module fixture via `MIKAGE_LEGACY_MODULE`).
- Missing script guidance; all-CDN failure, a retry with fresh import URLs,
  delayed network loading and automatic opening.
- One modal in the main Tavern document, none in the hidden script document.
- Courtyard activity completion reaching the statusbar's keepsake callback.
- All ten regions mounting their actual activity UI.
- Owner cleanup, pending-launch cancellation after travel, zero page errors.

The test needs Playwright and a Chromium executable (`CHROMIUM_PATH`). Image and
font requests were blocked; this validates launch and interaction, not remote
art availability. The real user's Tavern installation was not accessible.

Versioned `runtime/scene-1.16.4.mjs` carries forward the 1.16.3 MVU data guards.
No walking / reduced-motion logic, MVU initial values or game balance changed.
