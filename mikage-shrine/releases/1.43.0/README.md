# 1.43.0 会回应的神社棋盘

Cosmetic interaction update over immutable 1.42.0. Existing art is decomposed into a painted empty shelf/background and eight independently movable sprites (bell, six navigation objects, paper fox). Objects are original built-in imagegen outputs, encoded WebP only. Two original richly painted fabric runners, trim and shadows remain; no plain CSS material substitute. The regenerated empty skin contains haze in its map opening, so the live map explicitly retains the alpha-zero 1.42 frame; no hazy raster is overlaid on the landscape. All source windows are native SVG with explicit clips, not external image edits.

## Maintained sources

`src/board-interaction.js`, `src/board-interaction.css`, `tools/build_interactive_board.py`. Asset commit `da40f818eb375224e93fbc6ff07ea18ed11c61c6`. Derives releases/1.42.0; earlier releases and paused 1.39.1 gameplay debugging are excluded. Only scene runtime is updated. Five immutable lightweight loaders, worldbook, rules, initial data and other modules remain unchanged.

## Player feedback

All six navigation entries press and rebound, with distinct real sprite motion: map roll/stretch, ema sway/foxfire, kimono swish/petals, teacup wobble/steam, journal flutter/paper-fox hop, mallet tap/sparks. Four lower controls have independent illustrated face layers that depress/rebound, warm glints, live state markers and a short actual-state message. Moment-face restoration survives the original moment button rerender. Pointer focus/tap blue chrome is suppressed; keyboard focus retains a warm visible outline.

Three independent toys: ring fox bell, brush cherry branch, tap origami fox. Three bell taps within four seconds make the paper fox hop. No sound, network request, chat send, resource spend, time advancement, MVU write or hidden reward is introduced. Existing time preview remains preview-only.

External navigation retains the original handlers, replayed exactly once after 180ms so the press can be seen. Same-button rapid clicks coalesce. A changed bridge/floor/swipe/chat scope or disposal cancels pending replay. Reduced motion has no replay delay or particles, with a short opacity response and retained status marks. Main scene disposal, pagehide and document hiding clear pending work; particles capped at 28; animations terminate and are replaced per target; no permanent rendering loop or audio context.

## Verification

`tests/board-browser.test.cjs`: 320/375/760 actual HTML + real character-art API, repository asset routing. All ten controls visibly animate; all four tool faces fill their control area; existing route/panel/diary/repair behavior retained; physical toy/fox movement; warm toggles and status messages; native pointer-outline/tap chrome removed; rapid-click dedup; scope-change cancellation; bounded particle cleanup; unchanged formal state; reduced-motion no-particles/no-delay; main-scene disposal removes board API. Existing 3:2 map, safe bell label, long/idle dialogue, notification and ordinary/developer time-cycle checks retained.

Startup integration simulation passed three openings, four panel shells, mount/dedup, rerender/swipe/script reload/chat switch and exact-floor saved data. Native Chromium click recording is implementation evidence, not generated animation or real-host evidence. Real SillyTavern, remote CDN execution and Android hardware remain pending.
