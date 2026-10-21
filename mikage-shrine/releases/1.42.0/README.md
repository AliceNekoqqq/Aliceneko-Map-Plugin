# 1.42.0 绘饰檐下 — implementation candidate

The author rejected 1.41.0 because plain CSS materials and floating object cutouts failed to reproduce the approved concept. This revision paints the full craft substrate together: wood, fabric, folds, objects, shadows, irregular labels, frame caps and four tool-button faces. It embeds live map, actual values and existing control handlers into source windows of that painting. This is rendered implementation, not a replacement concept image.

## Maintained implementation

`src/painted-statusbar.css` + `tools/build_painted_statusbar.py`, deriving immutable 1.41.0 only. Build with asset commit `e748f48300630ba8eb4223f51bae2dd311fd539a`. Seven original-image SVG windows map header/map/dialogue/navigation/status/tools/footer into responsive flow. Original built-in imagegen skin is encoded WebP only; no painted image edits outside imagegen. Map and outer decorative silhouette have real alpha. Semantic buttons overlay the six painted physical entries and four painted tool faces; labels and numbers remain text. No flat material substitute in ordinary rendering.

## Behavior

Existing complete 3:2 region image and walking geometry retained. Existing floor-scoped MVU readers, outfits, notification and panel bridges retain IDs and ownership. Idle dialogue folds away; mood remains a small scene tag. Long dialogue uses a separate bounded strip below map. Existing inward/downward label alignment is retained. Time preview is visible normally and with the developer flag, without advancing story time. Only real chapter completion owns a progress track; no invented fame/prosperity percentage. No formal data writes added. Paused 1.39.1 gameplay debugging remains excluded.

## Evidence

`tests/painted-browser.test.cjs`: Chromium 320/375/760, actual HTML + actual character-art API and repository asset routing; seven skin windows, six entries, four external routes, journal/repair toggles, full ordinary/developer time-preview cycle, live notice, 3:2 map, bell-label bounds, long dialogue below map, idle collapse, no horizontal overflow or JavaScript errors. Native rendered idle/day and dialogue/dusk screenshots were visually inspected against the approved proposal. Real screenshots are evidence, not generated mockups.

Startup integration simulation passed three openings, four panels, mount/dedup, rerender, swipe expiry, script reload, chat switch and exact-floor saved data. Worldbook/regex content parity with previous card passed.

Real SillyTavern, remote CDN network behavior and Android hardware acceptance remain pending; source/browser success is not driver acceptance. Author aesthetic acceptance is separate. Preserve 1.41.0 and earlier artifacts.
