const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, '../src/time-of-day.js'), 'utf8');
function load(catalog) {
  const window = { MikageTimeSceneCatalog: catalog };
  vm.runInNewContext(source, { window });
  return window.MikageDaylight;
}
function element(region) {
  return { dataset: { region, period: 'original' }, style: {
    backgroundImage: 'url("original.webp")', backgroundSize: 'cover', backgroundPosition: 'left'
  } };
}
function root(elements) {
  return { querySelectorAll(selector) {
    assert.equal(selector, '.life-region-art[data-region]');
    return elements;
  } };
}
test('resolves story periods and safe defaults', () => {
  const api = load();
  for (const value of ['凌晨', '夜晚', 'night', ' NIGHT ']) assert.equal(api.resolve(value), 'night');
  for (const value of ['傍晚', '黄昏', 'dusk', ' DUSK ']) assert.equal(api.resolve(value), 'dusk');
  for (const value of ['清晨', '白昼', 'day', '未知', '', null, undefined]) assert.equal(api.resolve(value), 'day');
});
test('matches all thirty region-period catalog URLs and applies whole images', () => {
  const catalog = {};
  for (let n = 1; n <= 10; n++) {
    const region = 'R' + String(n).padStart(2, '0');
    catalog[region] = Object.fromEntries(['day', 'dusk', 'night'].map(period =>
      [period, `https://assets.example/regions/${region}-${period}.webp`]));
  }
  const api = load(catalog);
  const elements = Object.keys(catalog).map(element);
  for (const period of ['day', 'dusk', 'night']) {
    assert.equal(api.apply(root(elements), period), true);
    for (const item of elements) {
      const expected = catalog[item.dataset.region][period];
      assert.equal(api.url(item.dataset.region, period), expected);
      assert.equal(item.style.backgroundImage, 'url(' + JSON.stringify(expected) + ')');
      assert.equal(item.style.backgroundSize, '100% 100%');
      assert.equal(item.style.backgroundPosition, 'center');
      assert.equal(item.dataset.period, period);
    }
  }
});
test('missing catalog, region or period preserves original fallback artwork', () => {
  const original = element('R01');
  const before = JSON.stringify(original);
  for (const catalog of [undefined, {}, { R02: { day: 'other.webp' } }, { R01: { night: 'night.webp' } }, { R01: { day: '' } }]) {
    const api = load(catalog);
    assert.equal(api.url('R01', 'day'), null);
    assert.equal(api.apply(root([original]), 'day'), false);
    assert.equal(JSON.stringify(original), before);
  }
  assert.equal(load().apply(null, 'day'), false);
});
test('partial catalog updates only available regions', () => {
  const available = element('R01'), fallback = element('R02');
  const before = JSON.stringify(fallback);
  assert.equal(load({ R01: { dusk: 'dusk.webp' } }).apply(root([available, fallback]), '黄昏'), true);
  assert.equal(available.dataset.period, 'dusk');
  assert.equal(JSON.stringify(fallback), before);
});
