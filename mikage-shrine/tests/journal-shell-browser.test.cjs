const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '../..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const base = 'mikage-shrine/releases/1.49.39';
const panel = read('mikage-shrine/releases/1.49.50/modules/panels.mjs');
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
    const urlPath = new URL(route.request().url()).pathname;
    const name = path.basename(urlPath);
    const relative = urlPath.match(/\/mikage-shrine\/assets\/([a-z0-9_/.\-]+)$/i)?.[1];
    const candidates = [relative && path.join(root, 'mikage-shrine/assets', relative), assetPaths.get('assets/' + name)];
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
  assert.match(background, /journal-paper-cover\.webp/);
  assert.equal(await nav.locator('.paper-nav-icon svg').count(),4);
  const volume = child.locator('.journal-volume');
  const paper = await volume.evaluate(el=>getComputedStyle(el).backgroundImage);
  assert.match(paper,/journal-paper-cover\.webp/);
  assert.equal(await volume.evaluate(el=>getComputedStyle(el,'::after').pointerEvents),'none');
  await volume.evaluate(el=>{el.dataset.fixtureVolume='original';});

  for (const [kind, label] of [['map', '巡游'], ['board', '绘马'], ['wardrobe', '衣橱'], ['life', '生活']]) {
    const tab = nav.getByRole('button', { name: label, exact: true });
    await tab.click();
    await child.locator('#' + kind + '-dialog').waitFor();
    const chapter = child.locator('#' + kind + '-dialog > .journal-chapter');
    await chapter.getByRole('heading',{level:2}).waitFor();
    assert.equal(await chapter.evaluate(el=>el.closest('.journal-volume')?.dataset.fixtureVolume),'original');
    assert.equal(await volume.evaluate(el=>getComputedStyle(el).backgroundImage),paper);
    const help = chapter.locator('xpath=following-sibling::*[1][contains(@class,"journal-guide")]');
    await help.locator('summary').waitFor();
    if (width===375 && process.env.JOURNAL_CAPTURE) {
      await help.evaluate(el=>{el.open=false;});
    }
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
    if(kind==='map')assert.equal(await child.locator('#journal-map-location').textContent(),'御影神社');
    if(kind==='life')await child.locator('#life-content').locator(':scope > *').first().waitFor();
    if (process.env.JOURNAL_CAPTURE && width === 375) {
      await page.screenshot({ path: path.join(process.env.JOURNAL_CAPTURE, 'journal-' + kind + '.png') });
    }
  }
  const light = await volume.evaluate(el=>getComputedStyle(el).getPropertyValue('--volume-sheet').trim());
  await volume.evaluate(el=>{el.ownerDocument.documentElement.dataset.mikageReadingTheme='night';});
  const dark = await volume.evaluate(el=>getComputedStyle(el).getPropertyValue('--volume-sheet').trim());
  assert.notEqual(light,dark);
  assert.equal(await child.locator('#life-tabs').evaluate(el=>getComputedStyle(el).backgroundColor),'rgb(61, 48, 51)');
  if(process.env.JOURNAL_CAPTURE && width===375)await page.screenshot({path:path.join(process.env.JOURNAL_CAPTURE,'journal-night.png')});

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
  const portable = process.env.CHROMIUM_PACKAGE && require(process.env.CHROMIUM_PACKAGE);
  const browser = await chromium.launch(portable
    ? {executablePath: await portable.executablePath(), args: portable.args}
    : {executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', args: ['--no-sandbox']});
  try {
    const page = await browser.newPage({reducedMotion:'reduce'});
    for (const [width, height] of [[320, 430], [375, 812], [1280, 900]]) {
      await page.goto('about:blank');
      await page.setViewportSize({width,height});
      await checkShell(page, width, height);
      await page.unrouteAll({behavior:'wait'});
      console.log('Journal shell passed at ' + width + '×' + height);
    }
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
