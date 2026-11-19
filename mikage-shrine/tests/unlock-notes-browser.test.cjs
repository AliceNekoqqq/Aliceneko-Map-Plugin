const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

const project = path.resolve(__dirname, '..');
const moduleText = file => fs.readFileSync(path.join(project, 'releases', file), 'utf8');
const reader = moduleText('reading-1.1.5/reading.mjs');
const mvu = moduleText('1.49.39/modules/mvu.mjs');
const scene = moduleText('1.49.39/modules/scene.mjs');
const minigames = moduleText('1.49.48/modules/minigames.mjs');
const panels = moduleText('1.49.49/modules/panels.mjs');
const initial = JSON.parse(mvu.match(/^const ShrineInitial = (.*);$/m)[1]);
// Use the actual versioned rules without the external MVU and Zod bootstrap.
const engineScript = mvu.split('let startupPromise=null,bootstrapCommitted=false;')[0] +
  'window.MikageShrineRuntime={engine:ShrineCard,version:"0.6.0"}; } start();';

async function run() {
  const portable = process.env.CHROMIUM_PACKAGE && require(process.env.CHROMIUM_PACKAGE);
  const browser = await chromium.launch(portable
    ? {executablePath: await portable.executablePath(), args: portable.args}
    : {executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', args: ['--no-sandbox']});
  const page = await browser.newPage({viewport: {width: 390, height: 820}, hasTouch: true});
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.route('https://**/*', route => {
    if (route.request().url() === 'https://mikage.test/') return route.fulfill({
      body: '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width"><style>body{margin:0;background:#eee4db}#chat{max-width:660px;margin:auto;padding:12px}.mes{margin-bottom:16px}</style><div id="chat"></div>',
      contentType: 'text/html',
    });
    const filename = path.join(project, 'assets', 'reading-v2', path.basename(new URL(route.request().url()).pathname));
    return fs.existsSync(filename) ? route.fulfill({path:filename}) : route.abort();
  });
  try {
    await page.goto('https://mikage.test/');
    await page.evaluate(initial => {
      const bus = new Map();
      const rows = window.rows = [];
      const saved = window.saved = new Map();
      const events = window.tavern_events = Object.fromEntries(['CHAT_CHANGED','MESSAGE_RECEIVED','MESSAGE_UPDATED','MESSAGE_SWIPED','MESSAGE_DELETED'].map(name => [name,name]));
      window.emit = (event, ...args) => { for (const run of bus.get(event) || []) run(...args); };
      window.eventOn = (event, run) => {
        if (!bus.has(event)) bus.set(event,new Set());
        bus.get(event).add(run);
        return {stop:() => bus.get(event).delete(run)};
      };
      window.getLastMessageId = () => rows.at(-1)?.message_id ?? -1;
      window.getChatMessages = range => {
        const [start,end=start] = String(range).split('-').map(Number);
        return structuredClone(rows.filter(row => row.message_id >= start && row.message_id <= end));
      };
      window.Mvu = {events:{VARIABLE_UPDATE_ENDED:'save',VARIABLE_INITIALIZED:'init'},
        getMvuData:({message_id}) => structuredClone(saved.get(message_id))};
      window.getButtonEvent = name => name;
      window.appendInexistentScriptButtons = () => {};
      window.addTurn = (id, state, {role='assistant', text='巴卫把手中的旧绘马放回木匣。檐角的风铃响了一声。', marker=false}={}) => {
        rows.push({message_id:id, swipe_id:0, role, message:text+(marker?'\n<StatusPlaceHolderImpl/>':''), data:state?{stat_data:state}:{}});
        const message = document.createElement('article');
        message.className = 'mes';message.setAttribute('mesid',id);
        const body = document.createElement('div');body.className='mes_text';
        const prose = document.createElement('p');prose.textContent=text;
        body.append(prose);message.append(body);document.querySelector('#chat').append(message);
        emit(events.MESSAGE_RECEIVED,id);
      };
      window.addTurn(0, initial, {text:'御影神社开场'});
    }, initial);
    await page.addScriptTag({content:engineScript});
    await page.addScriptTag({content:`{${scene.replace(/^export .*$/m, '')}\nstart();}`});
    await page.addScriptTag({content:`{${panels.replace(/^export .*$/m, '')}\nstart();}`});
    await page.addScriptTag({content:`{${reader.replace(/^export /gm, '')}\nwindow.bootReader=start;start();}`});

    const note = id => page.locator(`.mes[mesid="${id}"] .mr-unlocks`);
    await page.evaluate(() => {
      const engine = MikageShrineRuntime.engine;
      const next = structuredClone(rows[0].data.stat_data);
      next.主线.已完成.push({编号:'M01'});
      engine.deriveProgress(next);
      window.stageTwo = next;
      addTurn(1, null, {role:'user', text:'一起看看屋外吧。'});
      addTurn(2, rows[0].data.stat_data, {marker:true});
    });
    const stageTurn = page.locator('.mes[mesid="2"]');
    await stageTurn.locator('.mr-bridge').waitFor();
    assert.equal(await note(0).count(),0,'Initial content is baseline');
    assert.equal(await note(2).count(),0,'The current row still has the old saved state');
    if (process.env.NOTE_PREVIEW_DIR) {
      await stageTurn.screenshot({path:path.join(process.env.NOTE_PREVIEW_DIR,'before.png'),animations:'disabled'});
    }
    await page.evaluate(() => { saved.set(2,{stat_data:stageTwo});emit('save'); });
    await note(2).waitFor();
    assert.deepEqual(await note(2).locator('[data-unlock-kind=region] button').allTextContents(),['妖怪横丁','夜森神社']);
    assert.deepEqual(await note(2).locator('[data-unlock-kind=feature] button').allTextContents(),['手作','料理','小菜圃','生活商店']);
    assert.deepEqual(await note(2).locator('[data-unlock-kind=recipe] button').allTextContents(),['木制御守','便当','茶点','番茄饭团便当']);
    assert.equal(await note(2).evaluate(el => el.previousElementSibling.className), 'mr-bridge');
    assert.equal(await note(2).evaluate(el => el.nextElementSibling.hasAttribute('data-mikage-status-host')),true);
    const panel = page.frameLocator('iframe[data-mikage-panel-frame]');
    const guide = pageName => panel.locator('#'+pageName+'-dialog .journal-guide');
    const jump = (id,name) => note(id).getByRole('button',{name:'查看'+name,exact:true}).click();
    const closePanel = () => panel.getByRole('button',{name:'关闭御影手帖'}).click();
    await jump(2,'夜森神社');
    const place = panel.locator('#place-card[data-journal-target]');
    await place.waitFor();
    assert.match(await place.innerText(),/夜森神社/);
    assert.equal(await guide('map').evaluate(el=>el.open),true);
    await guide('map').getByRole('button',{name:'收起说明'}).click();
    await closePanel();
    assert.equal(await page.evaluate(()=>document.activeElement?.dataset.unlockId),'R04');
    await jump(2,'妖怪横丁');
    await place.waitFor();
    assert.match(await place.innerText(),/妖怪横丁/);
    assert.equal(await guide('map').evaluate(el=>el.open),false);
    await guide('map').locator('summary').click();
    assert.equal(await guide('map').evaluate(el=>el.open),true);
    await closePanel();
    await jump(2,'小菜圃');
    await panel.locator('[data-life-tab=garden][aria-pressed=true]').waitFor();
    assert.match(await guide('life').innerText(),/选择|播种/);
    await closePanel();
    await jump(2,'便当');
    const recipe = panel.locator('[data-journal-target].life-card');
    await recipe.waitFor();
    assert.equal(await recipe.locator('[data-life-craft]').getAttribute('data-life-craft'),'bento');
    assert.equal(await panel.locator('[data-life-tab=craft]').evaluate(el=>{
      const button=el.getBoundingClientRect(), nav=el.parentElement.getBoundingClientRect();
      return button.left>=nav.left && button.right<=nav.right;
    }),true);
    if (process.env.NOTE_PREVIEW_DIR) {
      await page.screenshot({path:path.join(process.env.NOTE_PREVIEW_DIR,'guide.png'),animations:'disabled'});
    }
    await guide('life').getByRole('button',{name:'查看已定位条目'}).click();
    assert.equal(await recipe.evaluate(el=>el.ownerDocument.activeElement===el),true);
    if (process.env.NOTE_PREVIEW_DIR) {
      await page.screenshot({path:path.join(process.env.NOTE_PREVIEW_DIR,'recipe.png'),animations:'disabled'});
    }
    await closePanel();

    for (const width of [320,390,920]) {
      await page.setViewportSize({width,height:820});
      const fits = await note(2).evaluate(el => el.scrollWidth <= el.clientWidth &&
        [...el.querySelectorAll('button')].every(btn => btn.offsetHeight >= 44));
      assert(fits, `The note and buttons must fit ${width}px`);
    }
    await page.setViewportSize({width:390,height:820});
    if (process.env.NOTE_PREVIEW_DIR) {
      await stageTurn.screenshot({path:path.join(process.env.NOTE_PREVIEW_DIR,'paper.png'),animations:'disabled'});
    }

    await page.evaluate(() => {
      const engine = MikageShrineRuntime.engine;
      const atShop = structuredClone(stageTwo);
      atShop.地图.当前地区 = engine.config.wardrobeShop.region;
      atShop.环境.地点 = engine.config.wardrobeShop.location;
      atShop.神社.奉纳 = 30;
      addTurn(3, atShop, {role:'user',text:'看看这些衣服。'});
      const bought = engine.action(atShop,'buyOutfit',{sku:'player:sakura'});
      addTurn(4,bought,{text:'素世把包好的衣物递过来。'});
      addTurn(5,bought,{text:'准备回去了吗？巴卫在门边问。',marker:true});
      window.bought = bought;
    });
    await note(4).waitFor();
    assert.match(await note(4).innerText(), /樱染散策（玩家）/);
    assert.equal(await note(5).count(),0,'Repeating a saved snapshot does not grant any new item');
    await jump(4,'樱染散策（玩家）');
    const look = panel.locator('#wardrobe-look-name[data-journal-target]');
    await look.waitFor();
    assert.match(await look.innerText(),/樱染散策/);
    assert.equal(await page.evaluate(()=>bought.玩家.衣装),'daily');
    await closePanel();

    await page.evaluate(() => {
      saved.set(4,{stat_data:rows[3].data.stat_data});rows[4].swipe_id=1;emit('MESSAGE_SWIPED');
    });
    await note(4).waitFor({state:'detached'});
    await page.evaluate(() => {
      saved.delete(4);rows[4].swipe_id=0;rows.splice(5);document.querySelector('[mesid="5"]').remove();emit('MESSAGE_SWIPED');
    });
    await note(4).waitFor();
    await page.evaluate(() => {
      localStorage.setItem('mikage:reading:1',JSON.stringify({enabled:false,theme:'night'}));
      bootReader();
    });
    await page.locator('.mr-tools').first().waitFor({state:'detached'});
    await note(4).waitFor();
    assert.equal(await note(4).getAttribute('data-reading-theme'),'night');
    if (process.env.NOTE_PREVIEW_DIR) {
      await page.evaluate(() => {localStorage.setItem('mikage:reading:1',JSON.stringify({theme:'night'}));bootReader();});
      await page.locator('.mes[mesid="4"] .mr-tools').waitFor();
      await page.locator('.mes[mesid="4"]').screenshot({path:path.join(process.env.NOTE_PREVIEW_DIR,'night.png'),animations:'disabled'});
    }

    await page.evaluate(() => {
      const engine = MikageShrineRuntime.engine;
      const third = structuredClone(bought);
      third.主线.已完成.push({编号:'M02'});
      third.主线.已显现.push({编号:'M03'});
      engine.deriveProgress(third);
      third.绘马板.绘马.push({...structuredClone(rows[0].data.stat_data.绘马板.绘马[0]),编号:'M03',标题:'水镜与山风',性质:'主线',材料档:3});
      const fourth = structuredClone(third);
      fourth.主线.已完成.push({编号:'M03'});
      engine.deriveProgress(fourth);
      addTurn(5,third);
      addTurn(6,fourth);
      // A migrated wardrobe snapshot without the old ownership list is not an unlock baseline.
      const legacy = structuredClone(fourth);
      delete legacy.衣橱;
      addTurn(7,legacy);
      addTurn(8,fourth);
    });
    await note(6).waitFor();
    assert.match(await note(5).innerText(), /水镜与山风/);
    assert.match(await note(6).innerText(), /旧匣中的衣纹/);
    assert.equal(await note(8).count(),0);
    await jump(5,'水镜与山风');
    await panel.locator('#panel-ema-sheet .ema-back').waitFor();
    assert.equal(await panel.locator('[data-ema-id=M03]').evaluate(el=>el.classList.contains('is-flipped')),true);
    await closePanel();
    await jump(6,'旧匣中的衣纹');
    await panel.locator('#wardrobe-quest[data-journal-target]').waitFor();
    assert.match(await panel.locator('#wardrobe-quest').innerText(),/悬挂衣装支线/);
    await closePanel();
    await page.evaluate(() => {
      window.MikageDeveloperSandbox = {active:true,getState:()=>bought};dispatchEvent(new Event('mikage:dev-changed'));
    });
    await page.locator('.mr-unlocks').first().waitFor({state:'detached'});
    await page.evaluate(() => {
      delete window.MikageDeveloperSandbox;rows.length=0;saved.clear();document.querySelector('#chat').replaceChildren();emit('CHAT_CHANGED');
    });
    assert.equal(await page.locator('.mr-unlocks').count(),0);
    await page.addScriptTag({content:`{${minigames.replace(/^export .*$/m, '')}\nstart();}`});
    await page.evaluate(() => {
      localStorage.setItem('mikage.showa-memory-book.v1',JSON.stringify({schema:1,entries:{R02:{item:'拾页'},'R03-APPRAISAL':{item:'鉴物'}}}));
    });
    async function finishTea() {
      await page.evaluate(() => MikageMinigames.open({region:'R01',reducedMotion:true}));
      const button = name => page.getByRole('button',{name,exact:true});
      await button('开始这段散策').click();
      await button('把茶席摆好').click();
      for(let i=0;i<12;i++)await button('添一小簇').click();
      await button('离火，准备分茶').click();
      for(const cup of await page.locator('.tea-cup').all()) {
        await cup.click();
        for(let i=0;i<9;i++)await button('分一小口').click();
      }
      await button('收壶，取一枚叶签').click();
      await button('请巴卫示范方向').click();
      await button('落签，收好这一杯').click();
    }
    await finishTea();
    const memory = page.locator('.mkg-memory-unlock');
    await memory.waitFor();
    assert.match(await memory.innerText(),/傍晚的糖纸/);
    await memory.getByRole('button',{name:'阅读傍晚的糖纸'}).click();
    await page.getByRole('dialog',{name:'旧物回忆册'}).waitFor();
    assert.match(await page.locator('.mka-memory-episode:focus').innerText(),/傍晚的糖纸/);
    await page.evaluate(() => MikageMinigames.close());
    await finishTea();
    assert.equal(await memory.isVisible(),false,'Replaying a collected memory does not reopen its episode');
    assert.deepEqual(errors,[]);
    console.log('PASS real rules and browser: stage unlocks, purchases, main and wardrobe quests, memory threshold and replay, delayed saves, layout, themes, swipes, reload, old saves, sandbox and chat isolation');
  } finally { await browser.close(); }
}

run().catch(error => { console.error(error);process.exitCode=1; });
