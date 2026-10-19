const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const source = fs.readFileSync(path.join(__dirname, '../src/scene-host.mjs'), 'utf8');
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
assert.ok(catalog.portraitLayout.maxAspect >= maxAspect, 'responsive portrait width cap accommodates every outfit');
assert.equal(catalog.portraitLayout.maxAspect, maxAspect, 'layout uses the widest registered outfit');
for (const id of ['chibi','kariginu','butler','wedding']) {
  const item = catalog.actors.tomoe.outfits.find(x => x.id === id);
  assert.ok(item?.portrait && item.spriteSheet?.atlas, `${id} portrait and atlas are registered`);
}
for (const id of ['kagura','shiromuku','gym','heian-travel']) {
  const item = catalog.actors.player.outfits.find(x => x.id === id);
  assert.ok(item?.portrait && item.spriteSheet?.atlas, `${id} portrait and atlas are registered`);
}
console.log(`PASS ${outfits.length} wardrobe portraits; layout aspect ${maxAspect.toFixed(6)} covers all registered silhouettes`);
