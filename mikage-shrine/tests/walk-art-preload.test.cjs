const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '../src/scene-host.mjs'), 'utf8');
const artStart = source.indexOf('((host)=>{', source.indexOf('One immutable asset catalog'));
const artEnd = source.indexOf('/* Tavern Helper adapter', artStart);
assert(artStart >= 0 && artEnd > artStart, 'character-art bundle is present');
const artBundle = source.slice(artStart, artEnd);

function createArt({ failPath } = {}) {
  const images = [];
  class FakeImage {
    set src(value) { this.url = value; images.push(this); }
    get src() { return this.url || ''; }
    decode() { return Promise.resolve(); }
    load() { this.onload?.(); }
    fail() { this.onerror?.(); }
  }
  const host = { Image: FakeImage, Event: class {}, dispatchEvent() {} };
  vm.runInNewContext(artBundle, host);
  return { api: host.MikageCharacterArt, images, failPath };
}

async function verifyDelayedAssets() {
  const { api, images } = createArt();
  const pending = api.preloadWalk();
  assert(images.length > 0, 'walking atlases begin preloading');

  const before = api.sprite('player', 'daily', 'front', 1);
  assert.match(before.atlas, /player-atlas/);
  assert.equal(before.frame, 0, 'an unloaded walking atlas is not selected');
  const sheetBefore = api.sprite('player', 'sakura', 'front', 1);
  assert.equal(sheetBefore.row, 0, 'a costume sheet stays on its standing row while loading');

  const painted = { dataset: {}, style: {}, setAttribute() {}, classList: { remove() {} } };
  api.paint(painted, 'player', 'daily', 'front', 1);
  assert.match(painted.style.backgroundImage, /player-atlas/);

  images.forEach(image => image.load());
  await pending;
  assert.match(api.sprite('player', 'daily', 'front', 1).atlas, /player-walk-a/);
  assert.match(api.sprite('player', 'daily', 'front', 3).atlas, /player-walk-b/);
  assert.equal(api.sprite('player', 'sakura', 'front', 1).row, 1);
  api.paint(painted, 'player', 'daily', 'front', 1);
  assert.match(painted.style.backgroundImage, /player-walk-a/);
}

async function verifyMissingAtlasFallback() {
  const { api, images } = createArt();
  const pending = api.preloadWalk().catch(error => error);
  const missing = images.find(image => image.src.includes('player-walk-a.webp'));
  assert(missing, 'player left-to-right walking atlas is preloaded');
  images.forEach(image => image === missing ? image.fail() : image.load());
  assert.match(String(await pending), /走路帧载入失败/);
  await new Promise(resolve => setImmediate(resolve));
  assert.match(api.sprite('player', 'daily', 'front', 1).atlas, /player-atlas/);
  assert.match(api.sprite('player', 'daily', 'front', 3).atlas, /player-walk-b/);
}

(async () => {
  await verifyDelayedAssets();
  await verifyMissingAtlasFallback();
  console.log('PASS delayed and failed walk atlases keep a stable standing frame; loaded atlases activate normally');
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
