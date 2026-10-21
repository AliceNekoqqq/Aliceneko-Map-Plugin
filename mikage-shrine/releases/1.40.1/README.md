# 1.40.1 透明素材与时间入口修复

Derives the presentation from the same immutable 1.39.0 baseline as 1.40.0. Paused gameplay debugging remains excluded.

The frame already has alpha-zero openings; the purple portal backdrop and opaque root/dock backgrounds are removed. Six isolated illustrated objects replace rectangular screenshot crops. New object atlas is original built-in imagegen with real alpha, encoded only to WebP. SVG source windows preserve object silhouettes without painting edits. Paper captions remain intentionally opaque for readability. The original bottom `#lantern` time-preview button is retained, with its visible label and existing handler; ordinary and developer modes both have the same bottom entrance. Existing courtyard geometry, IDs, variable paths, opening flows, formal state and other runtime modules are unchanged. Time previews do not advance story time or write MVU.

Build: `python tools/build_torii_statusbar.py --asset-commit 0a505dd5c29f719cd734e2115f62b647dc97c2f4`. New current output is releases/1.40.1. Historical 1.40.0 is preserved.

Verification passed: 320/375/760 browser checks cover computed transparent backgrounds, bottom time button visibility in ordinary + simulated active-developer modes, complete automatic/day/dusk/night cycle, existing six navigation controls, 3:2 scene geometry, notices, no horizontal overflow or JavaScript errors. Startup integration simulation passed all three openings, four panels, rerender/swipe/chat-switch and persisted exact-floor data. Artwork alpha-zero sample checks passed; no JPEG or fake checkerboard background used. Real SillyTavern and phone hardware acceptance remain pending.
