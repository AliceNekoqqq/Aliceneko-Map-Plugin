# MVU initialization hotfix 1.16.3

The 1.16.2 InitVar accidentally encoded scalar fields as `[value, description]`.
The pinned MVU core preserves that encoding as arrays. This disagrees with the
card's plain-value Zod schema; false-in-an-array is also truthy in the status UI.

## Changes

- InitVar now uses the runtime's canonical plain initial state.
- A schema-directed normalizer decodes only tuples with the exact known field
  description and correct primitive type. Real lists retain all real entries.
- Initialization/update listeners register before the MVU core is imported.
- Existing visible message snapshots can be repaired in place. Their chapter,
  inventory, quests, wardrobe and other values are retained. The converter fails
  closed on partial, foreign or otherwise invalid data. It never supplies default
  progress. Exact message/swipe/chat fences prevent queued cross-chat writes.
- Empty primitive lists now keep their declared string type and append template.
- Diagnostics check actual field types. Scene/panel bridges withhold invalid
  snapshots rather than rendering descriptions or false-positive completion.
- Duplicate update rejection notifications are suppressed for five seconds.
- No movement, reduced-motion, artwork or gameplay-balance changes.

## Evidence

11 Node regression groups passed using real Zod 4.1.12 and the schema inference /
metadata-cleanup functions extracted verbatim from the card's pinned MVU bundle.
Tests reproduce the screenshot's old failure, cover raw and core-processed legacy
data, preserve nondefault values and chapter-two unlocks, reject malformed data,
exercise quest acceptance / travel / clothing, and test the actual async bootstrap
with a mocked Tavern host, persisted repairs, rollback and chat-change fencing.

Actual scene and panel modules passed Chromium tests at 390px and 1280px. Checked
chapter one, day one, fame zero, prosperity ten, quest count 0/2, calm mood, legacy
snapshot views, invalid-data withholding and zero page errors. Art/network requests
were blocked; this is a data/rendering regression check, not an art-loading test.

The user's real SillyTavern session and live model-generated updates were not
available. Importing the updated card/worldbook/scripts is still required.

## Rebuilding the versioned modules

Place the companion patch scripts and JS fragments in one directory. Obtain
`mvu-original.mjs` and `panels-original.mjs` from repository commit
`11322ee60e1f88df7a17207f9e83d3e71244c890`, and `scene-original.mjs` from
`514e496447e7968c4cb97ace93a4f5dba1935eef` (their original paths are
`mikage-shrine/runtime/{mvu,panels,scene}.mjs`). Run `python patch_mvu.py` and
`python patch_views.py`. Their outputs are the three versioned 1.16.3 modules.
