const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.join(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'src/scene-host.mjs'), 'utf8');
const portraitMetadata = JSON.parse(fs.readFileSync(path.join(root, 'assets/wardrobe/v129-portraits.json'), 'utf8'));
const marker = 'const catalog=';
const start = source.indexOf(marker) + marker.length;
const end = source.indexOf(';\n  if(host.MikageCharacterArt', start);
assert.ok(start >= marker.length && end > start, 'catalog literal is present');
const catalog = JSON.parse(source.slice(start, end));
const outfits = ['player', 'tomoe'].flatMap(actor => catalog.actors[actor].outfits);
const maxAspect = Math.max(...outfits.map(item => {
  const b = item.portraitMetrics?.bounds;
  assert.ok(Array.isArray(b) && b.length === 4, `${item.id} has portrait bounds`);
  return (b[2] - b[0]) / (b[3] - b[1]);
}));
assert.ok(catalog.portraitLayout.maxAspect >= maxAspect, 'responsive width cap accommodates every outfit');
assert.equal(catalog.portraitLayout.maxAspect, maxAspect, 'layout uses the widest registered outfit');
const metadata = new Map(portraitMetadata.portraits.map(x => [x.id, x]));
for (const id of ['tomoe-chibi','tomoe-kariginu','tomoe-butler','tomoe-wedding','player-kagura','player-shiromuku','player-gym','player-heian-travel']) {
  const actor = id.startsWith('tomoe-') ? 'tomoe' : 'player';
  const outfitId = id.replace(/^tomoe-/, '').replace(/^player-/, '');
  const item = catalog.actors[actor].outfits.find(x => x.id === outfitId);
  assert.ok(item?.portrait && item.spriteSheet?.atlas, `${id} portrait and atlas are registered`);
  assert.ok(metadata.has(id), `${id} alpha bounds are recorded`);
  const [x,y,r,b] = item.portraitMetrics.bounds;
  const [ax,ay,ar,ab] = metadata.get(id).portrait.alphaBounds;
  assert.equal(b, ab, `${id} aligns to the shared floor line`);
  if (id === 'tomoe-chibi') {
    assert.equal(x, ax); assert.equal(r, ar);
    assert.equal(b-y, (ab-ay)*2, 'chibi keeps half-height while sharing the floor line');
  } else assert.deepEqual(item.portraitMetrics.bounds, [ax,ay,ar,ab], `${id} display bounds match visible pixels`);
}
console.log(`PASS ${outfits.length} wardrobe portraits; shared floor and visible scale; widest aspect ${maxAspect.toFixed(6)}`);
