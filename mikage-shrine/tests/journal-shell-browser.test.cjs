const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '../..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const base = 'mikage-shrine/releases/1.49.39';
const panel = read('mikage-shrine/releases/1.49.45/modules/panels.mjs');
const scene = read(base + '/modules/scene.mjs');
const art = scene.slice(scene.indexOf('((host)=>{', scene.indexOf('/* One immutable asset catalog')),
  scene.indexOf('/* Tavern Helper adapter'));
const mvu = read(base + '/modules/mvu.mjs');
const engine = mvu.slice(mvu.indexOf('const ShrineFieldSpec'), mvu.indexOf('const owns=v=>'));
const assetPaths = new Map(JSON.parse(read(base + '/assets-map.json')).mapping
  .map(row => [row.targetPath, path.join(root, row.path)]));

async function checkShell(page, width, height) {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.route('https://**/*', async route => {
    const name = path.basename(new URL(route.request().url()).pathname);
    const candidates = [assetPaths.get('assets/' + name)];
    if (process.env.JOURNAL_ASSETS) candidates.push(path.join(process.env.JOURNAL_ASSETS, name));
    const filename = candidates.find(candidate => candidate && fs.existsSync(candidate));
    if (filename) await route.fulfill({ path: filename });
    else await route.abort();
  });
  await page.setContent('<body style="background:#e8e1e9;padding:12px"><div style="height:94vh;border:2px dashed #3e293d;border-radius:22px;background:repeating-linear-gradient(90deg,#ffffff75 0 1px,transparent 1px 19px)"></div></body>');
  await page.evaluate(({ panel, engine, art }) => {
    (0, eval)(engine + ';window.MikageShrineRuntime={engine:ShrineCard,version:"0.6.0"};window.fixtureState=ShrineInitial;');
    (0, eval)(art);
    window.MikageDeveloperSandbox = { active: true, getState: () => fixtureState, act: () => true };
    window.appendInexistentScriptButtons = () => {};
    window.getButtonEvent = name => name;
    window.eventOn = () => ({ stop() {} });
    window.tavern_events = {};
    (0, eval)(panel.replace('export {VERSION,SCRIPT_ID,start};', 'start();'));
    return MikageShrinePanels.open('map');
  }, { panel, engine, art });

  const frame = page.locator('iframe[data-mikage-panel-frame]');
  const child = page.frameLocator('iframe[data-mikage-panel-frame]');
  const close = child.getByRole('button', { name: '关闭御影手帖' });
  await close.waitFor();
  await page.waitForFunction(() => window.MikageShrinePanels && document.querySelector('iframe')?.contentWindow.ShrinePanel?.ready);
  assert.equal(await page.locator('[data-mikage-panel-close]').isVisible(), false);
  const chrome = await frame.evaluate(el => {
    const css = getComputedStyle(el);
    return { border: css.borderTopWidth, color: css.borderTopColor, outline: css.outlineStyle,
      radius: css.borderTopLeftRadius, shadow: css.boxShadow };
  });
  assert.equal(chrome.border, '2px');
  assert.equal(chrome.color, 'rgb(183, 152, 111)');
  assert.equal(chrome.outline, 'solid');
  assert.notEqual(chrome.shadow, 'none');
  const bounds = await frame.boundingBox();
  assert(bounds.x >= 5 && bounds.y >= 6 && bounds.x + bounds.width <= width - 5 &&
      bounds.y + bounds.height <= height - 6, JSON.stringify(bounds));
  const nav = child.getByRole('navigation', { name: '神社手帖' });
  const surface = () => nav.evaluate(el => getComputedStyle(el).backgroundImage);
  const background = await surface();
  assert.match(background, /linear-gradient/);

  for (const [kind, label] of [['map', '巡游'], ['board', '绘马'], ['wardrobe', '衣橱'], ['life', '生活']]) {
    const tab = nav.getByRole('button', { name: label, exact: true });
    await tab.click();
    await child.locator('#' + kind + '-dialog').waitFor();
    assert.equal(await tab.getAttribute('aria-current'), 'page');
    assert.equal(await surface(), background);
    assert.equal(await nav.locator('[aria-current=page]').count(), 1);
    assert.equal(await child.locator('button[data-close=button]').count(), 1);
    assert.equal(await child.locator('body').evaluate(el =>
      el.ownerDocument.documentElement.scrollWidth <= el.ownerDocument.defaultView.innerWidth), true, kind);
    const closeBounds = await close.boundingBox();
    assert(closeBounds.width >= 44 && closeBounds.height >= 44);
    const tabBounds = await tab.boundingBox();
    assert(tabBounds.x >= bounds.x && tabBounds.x + tabBounds.width <= bounds.x + bounds.width);
    if (kind === 'wardrobe') {
      assert.equal(await child.locator('.outfit-thumb').count(), 14);
      assert.equal(await child.locator('.panel-outfit-image').count(), 0);
    }
    if (process.env.JOURNAL_CAPTURE && width === 375) {
      await page.screenshot({ path: path.join(process.env.JOURNAL_CAPTURE, 'journal-' + kind + '.png') });
    }
  }

  await close.click();
  await frame.waitFor({ state: 'detached' });
  await page.evaluate(() => MikageShrinePanels.open('wardrobe'));
  await close.waitFor();
  await close.focus();
  await page.keyboard.press('Escape');
  await frame.waitFor({ state: 'detached' });
  assert.deepEqual(errors, []);
}

(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium',
    headless: true, args: ['--no-sandbox'] });
  try {
    for (const [width, height] of [[320, 430], [375, 812], [1280, 900]]) {
      const page = await browser.newPage({ viewport: { width, height }, reducedMotion: 'reduce' });
      await checkShell(page, width, height);
      await page.close();
      console.log('Journal shell passed at ' + width + '×' + height);
    }
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
