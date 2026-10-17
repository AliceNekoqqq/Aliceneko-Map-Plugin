# Minigame completion and modal fixes 1.16.5

Full playthrough testing uncovered a real scope error in the optional R03 marble
challenge: the recipe description was defined only inside the previous dango
step, but both winning and skipping marbles referenced it. These branches threw
before emitting the completion result. The description is now available across
the recipe and marble stages.

Additional verified fixes:

- Starting twice cannot mount duplicate activity roots.
- Escape closes the topmost memory book while retaining the game underneath;
  Tab stays inside that book. Standalone activity mounts retain equivalent keys.
- Repeated memory-book opening cannot stack duplicate books.
- Failed intro cat art is removed cleanly; the existing fallback background stays.
- The outer close button now has a 44px mobile target.

Validation performed with the actual module loaded by a separate hidden helper
iframe, and a secure mocked host origin for durable local-storage checks:

- All ten complete playthroughs, including three marble rounds, returned exactly
  one completion callback and persistent keepsakes. Their modal closes restored
  host scrolling. Image requests were deliberately blocked for these checks.
- All eleven distinct keepsakes survived a full page and helper reload.
- The marble-skip branch preserves and settles the selected dango recipe.
- Dedicated dialog checks passed broken-image cleanup, duplicate starts, Tab,
  Escape and close target size, with zero page errors.
- Existing 390px / 1280px cross-iframe launch regression passed, including network
  failure, retry, delayed launch and stale-request cancellation.
- Sixteen HEAD requests covering all scene/portrait/cat art, including the three
  seaside periods, returned HTTP 200 with image/webp. This checks endpoint
  availability; it is not a visual review of image content.

The user's actual Tavern installation and live model responses were not accessed.
MVU initial values, worldbook and scene walking code were not changed.
