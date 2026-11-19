const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '../..');
const modulePath = process.env.TEA_MODULE || path.join(root, 'mikage-shrine/releases/1.49.46/modules/minigames.mjs');
const moduleSource = fs.readFileSync(modulePath, 'utf8');
const moduleURL = 'data:text/javascript;base64,' + Buffer.from(moduleSource).toString('base64');
const teaArt = {
  '00382e244e7314e66d3a0ceeb98f84d38be5c525.webp': 'cb19e0b8443741faf291f12606230c33911c838f',
  'a4b990b33b0da1b85594062a3c68819f26a54cd3.webp': 'd4f5e387a904985b099340fe7246964c697c18e2',
  'b04a353869c880140d8dfbbdd763a2946bdabeb6.webp': 'd4f5e387a904985b099340fe7246964c697c18e2',
  '3a491e341ecebd7fc6564a34d5b52cd917833d70.webp': 'd4f5e387a904985b099340fe7246964c697c18e2',
};

async function fixture(browser) {
  const assets = new Map();
  for (const [name, commit] of Object.entries(teaArt)) {
    if (process.env.TEA_ASSETS) {
      assets.set(name, fs.readFileSync(path.join(process.env.TEA_ASSETS, name)));
    } else {
      const url = 'https://raw.githubusercontent.com/AliceNekoqqq/Aliceneko-Map-Plugin/' + commit + '/assets/' + name;
      const response = await fetch(url);
      assert(response.ok, 'Tea artwork missing: ' + name);
      assets.set(name, Buffer.from(await response.arrayBuffer()));
    }
  }
  return async function open(width, reducedMotion) {
    const page = await browser.newPage({ viewport: { width, height: 850 }, hasTouch: width === 360, reducedMotion });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.route('https://**/*', route => {
      const url = route.request().url();
      if (url === 'https://mikage.test/') return route.fulfill({ body: '<!doctype html><iframe id="helper" hidden></iframe>', contentType: 'text/html' });
      const body = assets.get(path.basename(new URL(url).pathname));
      return body ? route.fulfill({ body, contentType: 'image/webp' }) : route.abort();
    });
    await page.goto('https://mikage.test/');
    const helper = await page.locator('#helper').elementHandle().then(handle => handle.contentFrame());
    await helper.evaluate(async url => (await import(url)).start(), moduleURL);
    await page.evaluate(reduced => MikageMinigames.open({ region: 'R01', reducedMotion: reduced }), reducedMotion === 'reduce');
    await page.getByRole('button', { name: '开始这段散策', exact: true }).click();
    await page.getByRole('button', { name: '把茶席摆好' }).click();
    for (let n = 0; n < 12; n++) await page.getByRole('button', { name: '添一小簇' }).click();
    await page.getByRole('button', { name: '离火，准备分茶' }).click();
    const stage = page.locator('.tea-stage');
    await stage.evaluate(el => Promise.all(Array.from(el.querySelectorAll('.tea-pot img,.tea-cup img')).map(img => img.decode())));
    return { page, stage, errors };
  };
}

async function checkAlignment(stage, index) {
  const distances = await stage.evaluate((el, index) => {
    const pot = el.querySelector('.tea-pot');
    const marker = el.ownerDocument.createElement('i');
    const [x, y] = getComputedStyle(pot).transformOrigin.split(' ');
    marker.style.cssText = `position:absolute;left:${x};top:${y};width:0;height:0;`;
    pot.append(marker);
    const tip = marker.getBoundingClientRect();
    marker.remove();
    const line = el.querySelector('.tea-flow-ribbon');
    const matrix = line.getScreenCTM();
    const start = line.getPointAtLength(0).matrixTransform(matrix);
    const end = line.getPointAtLength(line.getTotalLength()).matrixTransform(matrix);
    const cup = el.querySelectorAll('.tea-cup img')[index].getBoundingClientRect();
    return {
      spout: Math.hypot(tip.x - start.x, tip.y - start.y),
      cup: Math.hypot(cup.x + cup.width * .50 - end.x, cup.y + cup.height * .29 - end.y),
      verticalDrop: end.y - start.y,
    };
  }, index);
  assert(distances.spout < 1.5, JSON.stringify(distances));
  assert(distances.cup < 1.5, JSON.stringify(distances));
  assert(distances.verticalDrop >= 15, JSON.stringify(distances));
}

async function play(open, width, reducedMotion) {
  const { page, stage, errors } = await open(width, reducedMotion);
  const button = page.getByRole('button', { name: '按住倾壶分茶' });
  const stream = page.locator('.tea-flow');
  async function visible() {
    await stream.evaluate(el => new Promise((resolve, reject) => {
      const limit = performance.now() + 1500;
      function check() {
        if (Number(getComputedStyle(el).opacity) > .99) resolve();
        else if (performance.now() > limit) reject(Error('Tea stream did not appear'));
        else requestAnimationFrame(check);
      }
      check();
    }));
  }

  await button.hover();
  await page.mouse.down();
  await visible();
  await checkAlignment(stage, 0);
  if (process.env.TEA_CAPTURE && width === 360) {
    await page.screenshot({ path: path.join(process.env.TEA_CAPTURE, 'tea-first.png') });
  }
  await page.waitForFunction(() => {
    const popup = document.querySelector('[data-mikage-minigame-host]').shadowRoot;
    return popup.querySelector('.tea-cup.one .tea-cup-label').textContent !== '第一盏 0%';
  });
  await page.mouse.up();
  assert.equal(await stream.evaluate(el => getComputedStyle(el).opacity), '0');
  const first = await stage.locator('.tea-cup.one .tea-cup-label').textContent();
  assert.notEqual(first, '第一盏 0%');

  await page.getByRole('button', { name: '给第二只茶盏分茶' }).click();
  await button.focus();
  await page.keyboard.down('Space');
  await visible();
  await checkAlignment(stage, 1);
  if (process.env.TEA_CAPTURE && width === 360) {
    await page.screenshot({ path: path.join(process.env.TEA_CAPTURE, 'tea-second.png') });
  }
  await page.keyboard.up('Space');
  assert.equal(await stream.evaluate(el => getComputedStyle(el).opacity), '0');
  assert.equal(await stage.locator('.tea-cup.one .tea-cup-label').textContent(), first);

  const second = await stage.locator('.tea-cup.two .tea-cup-label').textContent();
  await page.getByRole('button', { name: '分一小口' }).click();
  await visible();
  await checkAlignment(stage, 1);
  assert.notEqual(await stage.locator('.tea-cup.two .tea-cup-label').textContent(), second);
  await page.getByRole('button', { name: '给第一只茶盏分茶' }).click();
  assert.equal(await stream.evaluate(el => getComputedStyle(el).opacity), '0');
  if (width === 360) {
    await button.scrollIntoViewIfNeeded();
    const hit = await button.boundingBox();
    const cdp = await page.context().newCDPSession(page);
    await cdp.send('Input.dispatchTouchEvent', {
      type: 'touchStart', touchPoints: [{ x: hit.x + hit.width / 2, y: hit.y + hit.height / 2 }],
    });
    await visible();
    await checkAlignment(stage, 0);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchCancel', touchPoints: [] });
    assert.equal(await button.getAttribute('aria-pressed'), 'false');
    assert.equal(await stream.evaluate(el => getComputedStyle(el).opacity), '0');
  }
  assert.deepEqual(errors, []);
  await page.close();
}

(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium',
    headless: true, args: ['--no-sandbox'] });
  try {
    const open = await fixture(browser);
    await play(open, 360, 'no-preference');
    await play(open, 900, 'reduce');
    console.log('Tea pour alignment passed on mobile and desktop, including reduced motion and one-sip pouring.');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
