# Minigame popup positioning fix 1.16.6

The full-screen popup used fixed positioning under `body`. A chat page that
transforms its document while scrolling can make fixed descendants follow that
transformed containing block, which moves the popup outside the viewport. The
popup now opens as a manual browser popover in the top layer. Browsers without
the Popover API use a root-level fixed fallback outside `body`.

Validation:

- Popup and overlay bounds were checked at 390×520, 390×844 and 1280×800 while
  both the document and chat area were translated. The popup stayed centered.
- The root-level fallback was exercised with Popover API methods disabled and a
  transformed `body`; the popup remained visible and Escape closed it.
- All ten locations completed; all eleven keepsakes remained after a full page
  and helper reload; modal close restored host scrolling.
- Marble win/skip settlement, nested memory-book Escape and Tab, duplicate start
  prevention, 44px close target and broken-image fallback passed.
- The independent helper/statusbar iframe test passed at 390px and 1280px,
  including delayed loading, ten scene mounts, stale launch cancellation and
  owner teardown.
- The popup was visually checked over a translated chat page. This is a browser
  simulation, not a live Tavern installation; actual Android WebView behavior
  still requires import-side confirmation.

Character description, worldbook, MVU initialization, scene walking and reduced
motion behavior were not changed.
