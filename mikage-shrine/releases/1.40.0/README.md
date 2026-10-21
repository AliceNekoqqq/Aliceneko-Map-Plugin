# 1.40.0 暮樱结缘之庭

Approved torii concept implemented as a presentation-only statusbar over delivered 1.39.0. The paused 1.39.1 gameplay work is excluded.

## Source and build

Maintained CSS: `src/torii-statusbar.css`. Builder: `tools/build_torii_statusbar.py --asset-commit 1cdbd2832c73723b8d796d3455da4b773370814f`. This explicit adapter derives the current scene from immutable 1.39.0, not historical build_roam output. It retains all existing IDs, floor-scoped state reads, panel routing, walking logic and 3:2 region image geometry. Presentation does not write formal MVU state.

Frame PNG and reference illustration are original built-in imagegen outputs, encoded to WebP without painted edits. The six object illustrations use CSS windows into the approved reference; captions remain real text. Decorative frame is pointer-inert. Fox brass bell is the existing time-preview control. Ema wishlight uses the existing pending-main-quest notice. All six main controls retain accessible names and touch targets. Reduced motion is respected. Existing watermarks remain, with an additional visible source line in the statusbar.

## Verification

`node tests/torii-browser.test.cjs`: 320/375/760 widths; six entries, four external panel routes, notebook and repair expand/collapse, time preview, notice on/off, uncropped 3:2 scene, touch sizes, no horizontal overflow or JS errors. Local routes supply actual repository assets.

`node tests/startup-integration.test.cjs 1.40.0`: actual module execution in simulated iframe host; three openings, mount/dedup, all four panels, rerender, swipe expiry, script reload, chat switching, exact-floor saved data.

Worldbook and regex data are byte-equivalent JSON values to 1.39.0. Runtime modules other than scene remain unchanged. Formal rules, initial data and wardrobe assets are unchanged.

Real SillyTavern, phone hardware and CDN network execution remain unverified. No driver acceptance is claimed. Check in host: old-chat import/update, message rerender, opening selection, panel open/close and current-floor status. This is a new importable candidate, not a claim of full runtime acceptance.
