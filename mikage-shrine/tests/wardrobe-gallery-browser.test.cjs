const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '../..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const base = 'mikage-shrine/releases/1.49.39';
const panel = read('mikage-shrine/releases/1.49.44/modules/panels.mjs');
const html = JSON.parse(panel.match(/^const MikagePanelHTML=(.+);$/m)[1]);
const scene = read(base + '/modules/scene.mjs');
const art = scene.slice(scene.indexOf('((host)=>{', scene.indexOf('/* One immutable asset catalog')),
  scene.indexOf('/* Tavern Helper adapter'));
const mvuSource = read(base + '/modules/mvu.mjs');
const mvu = mvuSource.slice(mvuSource.indexOf('const ShrineFieldSpec'), mvuSource.indexOf('const owns=v=>'));
const engine = vm.createContext({ console });
vm.runInContext(mvu + ';this.game=ShrineCard;this.initial=ShrineInitial', engine);
const clone = value => JSON.parse(JSON.stringify(value));
const assetPaths = new Map(JSON.parse(read(base + '/assets-map.json')).mapping
  .map(row => [row.targetPath, path.join(root, row.path)]));

async function openWardrobe(browser, width) {
  const page = await browser.newPage({ viewport: { width, height: 840 }, reducedMotion: 'reduce' });
  const state = { game: clone(engine.initial), actions: [], errors: [] };
  page.on('pageerror', error => state.errors.push(error.message));
  await page.route('https://**/*', async route => {
    const pathname = new URL(route.request().url()).pathname;
    const name = path.basename(pathname);
    const candidates = [assetPaths.get('assets/' + name)];
    if (process.env.WARDROBE_ASSETS) candidates.push(path.join(process.env.WARDROBE_ASSETS, name));
    const filename = candidates.find(candidate => candidate && fs.existsSync(candidate));
    if (filename) await route.fulfill({ path: filename });
    else await route.abort();
  });
  const snapshot = () => {
    const result = clone(state.game);
    result.衣装支线 = engine.game.config.wardrobeQuests.map(q => engine.game.wardrobeQuestView(state.game, q.id));
    delete result.记录;
    return result;
  };
  await page.exposeFunction('hostState', snapshot);
  await page.exposeFunction('hostAction', (name, payload) => {
    state.actions.push({ name, payload });
    state.game = engine.game.action(state.game, name, payload);
    return { ok: true, state: snapshot() };
  });
  await page.evaluate(({ config, life, html, art }) => {
    window.ShrineLifeConfig = life;
    window.MikageShrinePanels = {
      config,
      bridge: {
        getState: () => hostState(),
        getLifeView: () => ({ items: [], unlocked: { stage: 1 }, recipes: [], inventory: {} }),
        act: (name, payload) => hostAction(name, payload),
        subscribe: () => () => {},
      },
    };
    (0, eval)(art);
    document.open();
    document.write(html);
    document.close();
  }, { config: clone(engine.game.config), life: clone(engine.game.life.config), html, art });
  await page.waitForFunction(() => window.ShrinePanel?.ready);
  await page.evaluate(() => ShrinePanel.openWardrobe());
  return { page, state };
}

async function verifyWardrobe(page, state) {
  const wardrobe = page.locator('#wardrobe-dialog');
  const thumb = wardrobe.locator('.outfit-thumb');
  assert.equal(await wardrobe.locator('[data-robe-toy], .panel-outfit-image').count(), 0);
  assert.equal(await wardrobe.locator('.wardrobe-portrait-wrap').evaluate(el =>
    getComputedStyle(el, '::after').display), 'none');
  const worn = wardrobe.locator('[data-outfit-id="daily"]');
  assert.equal(await worn.getAttribute('aria-pressed'), 'true');
  assert.equal(await thumb.count(), 14);
  for (const sprite of await thumb.all()) {
    const box = await sprite.boundingBox();
    assert(box.width > 44, JSON.stringify(box));
    assert(Math.abs(box.width - box.height) < 0.1, JSON.stringify(box));
    assert.match(await sprite.evaluate(el => el.style.backgroundImage), /\/assets\/\w+\.(webp|png)/);
  }

  await wardrobe.locator('[data-outfit-id="shrine"]').click();
  await page.waitForFunction(() => document.querySelector('[data-outfit-id="shrine"].is-worn'));
  assert(state.actions.some(({ name, payload }) => name === 'setOutfit' && payload.actor === 'player' && payload.outfit === 'shrine'));

  await wardrobe.locator('[data-wardrobe-actor="tomoe"]').click();
  assert.equal(await thumb.count(), 16);
  assert.equal(await wardrobe.locator('[data-outfit-id="usual"] .outfit-thumb').getAttribute('data-actor'), 'tomoe');
  const writeCount = state.actions.length;
  await wardrobe.locator('[data-outfit-id="aoba"]').click();
  assert.equal(await wardrobe.locator('#wardrobe-look-state').textContent(), '仅供预览');
  assert.equal(await wardrobe.locator('.wardrobe-portrait').getAttribute('data-outfit'), 'aoba');
  assert.equal(state.actions.length, writeCount);
  assert.equal(await wardrobe.locator('[data-outfit-id="usual"]').getAttribute('aria-pressed'), 'true');

  const extras = wardrobe.locator('#panel-robe-extras');
  await wardrobe.locator('.outfit-choice').last().focus();
  await page.keyboard.press('Tab');
  assert.equal(await extras.locator('summary').evaluate(el => document.activeElement === el), true);
  await page.keyboard.press('Enter');
  assert.equal(await extras.evaluate(el => el.open), true);
  for (const direction of ['right', 'back', 'left', 'front']) {
    const control = extras.locator('[data-direction="' + direction + '"].wardrobe-direction');
    await control.click();
    assert.equal(await control.getAttribute('aria-pressed'), 'true');
    assert.equal(await extras.locator('.wardrobe-direction').count(), 4);
    assert.equal(await extras.locator('[data-art="wardrobe-mini"]').getAttribute('data-direction'), direction);
  }
  for (const sprite of await extras.locator('.character-sprite').all()) {
    const box = await sprite.boundingBox();
    assert(box.width > 20);
    assert(Math.abs(box.width - box.height) < 0.1, JSON.stringify(box));
  }
  assert.equal(state.actions.length, writeCount);
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  assert.deepEqual(state.errors, []);
}

(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium',
    headless: true, args: ['--no-sandbox'] });
  try {
    for (const width of [320, 375, 1280]) {
      const { page, state } = await openWardrobe(browser, width);
      await verifyWardrobe(page, state);
      if (process.env.WARDROBE_CAPTURE && width === 375) {
        await page.locator('#toast').waitFor({ state: 'hidden' });
        await page.evaluate(() => scrollTo(0, 0));
        await page.screenshot({ path: path.join(process.env.WARDROBE_CAPTURE, 'wardrobe-mobile.png') });
        await page.locator('#panel-robe-extras').scrollIntoViewIfNeeded();
        await page.screenshot({ path: path.join(process.env.WARDROBE_CAPTURE, 'wardrobe-sprites.png') });
      }
      await page.close();
      console.log('Wardrobe gallery passed at ' + width + 'px');
    }
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
