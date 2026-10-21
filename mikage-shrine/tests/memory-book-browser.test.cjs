const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require(process.env.MIKAGE_PLAYWRIGHT||'/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=path.resolve(__dirname,'..'),out=process.env.MIKAGE_MEMORY_QA||'/tmp/mikage-memory-1.48.3';fs.mkdirSync(out,{recursive:true});
const game=fs.readFileSync(path.join(root,'releases/1.48.3/minigames.mjs'),'utf8').replace(/export \{VERSION,SCRIPT_ID,start\};?/,'');
const ids=JSON.parse(game.match(/const ACTIVE_MEMORY_IDS=(.*);/)[1]);
const key='mikage.showa-memory-book.v1';
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/tmp/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu']});
 try{for(const [width,height,blocked]of [[320,568,false],[375,812,true],[1280,900,false]]){
  const page=await browser.newPage({viewport:{width,height},reducedMotion:'reduce',acceptDownloads:true}),errors=[],missing=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/*',async route=>{const url=new URL(route.request().url()),rel=url.pathname.split('/mikage-shrine/')[1];if(url.hostname==='fixture.invalid'){await route.fulfill({body:'<!doctype html><body><button id="opener">散策</button>',contentType:'text/html'});return;}if(!rel){await route.abort();return;}const f=path.resolve(root,rel);if(!f.startsWith(root+path.sep)||!fs.existsSync(f)){missing.push(rel);await route.abort();return;}await route.fulfill({body:fs.readFileSync(f),contentType:f.endsWith('.ttf')?'font/ttf':f.endsWith('.webp')?'image/webp':'application/octet-stream',headers:{'access-control-allow-origin':'*'}});});
  await page.goto('https://fixture.invalid/');
  await page.evaluate(blocked=>{if(blocked)Object.defineProperty(window,'localStorage',{configurable:true,get(){throw Error('disabled');}});window.completed=[];window.clipboardText='';Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async text=>{window.clipboardText=text;}}});},blocked);
  await page.addScriptTag({content:game+'\nstart();'});
  // The common rich book is reachable from every NEW game route.
  for(let n=1;n<=10;n++){
   await page.evaluate(n=>{document.querySelector('#opener').focus();MikageMinigames.open({region:'R'+String(n).padStart(2,'0'),reducedMotion:true,onComplete:r=>completed.push(r)});},n);
   const host=page.locator('[data-mikage-minigame-host]'),entry=host.getByRole('button',{name:'旧物回忆册',exact:true});
   await entry.click();const book=host.getByRole('dialog',{name:'旧物回忆册',exact:true});await book.waitFor();await page.evaluate(()=>document.fonts.ready);assert(await page.evaluate(()=>[...document.fonts].some(f=>f.family.includes('Mikage Memory Serif')&&f.status==='loaded')),'memory font must really load outside shadow CSS');assert.equal(await book.locator('.mka-memory-card').count(),10);assert.equal(await book.locator('.mka-memory-episode.is-unlocked').count(),0);
   await page.keyboard.press('Escape');assert.equal(await book.count(),0);assert(await entry.evaluate(b=>b.getRootNode().activeElement===b));
   await host.getByRole('button',{name:'关闭互动弹窗',exact:true}).click();assert.equal(await page.locator('[data-mikage-minigame-host]').count(),0);
  }
  await page.evaluate(()=>MikageMinigames.open({region:'R02',reducedMotion:true,onComplete:r=>completed.push(r)}));
  const host=page.locator('[data-mikage-minigame-host]'),entry=host.getByRole('button',{name:'旧物回忆册',exact:true});await entry.click();
  const book=()=>host.getByRole('dialog',{name:'旧物回忆册',exact:true});
  const entries=Object.fromEntries(ids.map((id,i)=>[id,{id,detail:'真实测试记录'+i,plays:1,firstSeen:'2026-10-21T00:00:00Z'}]));entries['R06']={id:'R06',detail:'旧版海边电车记录，保留原事实',plays:3};
  const upload=async payload=>{await book().locator('input[type="file"]').setInputFiles({name:'memory.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(payload))});};
  await upload({schema:2,entries});await book().locator('.mka-memory-status').filter({hasText:'没有识别'}).waitFor();assert.equal(Object.keys(await page.evaluate(()=>MikageMinigames.getMemoryBook().entries)).length,0);
  await upload({schema:1,entries:{unknown:{id:'unknown',detail:'不得进入收藏'},[ids[0]]:{id:ids[0],detail:'<img src=x onerror=alert(1)>'}}});
  assert.equal(await book().locator('.mka-memory-card.is-collected').count(),1);assert.equal(await book().locator('img').count(),0);assert.equal(await page.evaluate(()=>MikageMinigames.getMemoryBook().entries.unknown),undefined);
  await upload({schema:1,entries});assert.equal(await book().locator('.mka-memory-card').count(),11);assert.equal(await book().locator('[data-legacy="true"]').count(),1);assert.equal(await book().locator('.mka-memory-episode.is-unlocked').count(),3);assert((await book().locator('.mka-memory-intro').textContent()).includes('10/10'));
  assert.equal(await page.evaluate(()=>MikageMinigames.getMemoryBook().entries.R06.detail),'旧版海边电车记录，保留原事实');
  await book().getByRole('button',{name:'复制已收录摘要',exact:true}).click();const copied=await page.evaluate(()=>clipboardText);assert(copied.includes('10/10'));assert(copied.includes('旧版海边电车记录'));
  const downloadPromise=page.waitForEvent('download');await book().getByRole('button',{name:'导出备份',exact:true}).click();const download=await downloadPromise,payload=JSON.parse(fs.readFileSync(await download.path(),'utf8'));assert.equal(Object.keys(payload.entries).length,11);assert.equal(payload.entries.R06.plays,3);
  // Denied clipboard keeps selectable text instead of discarding the fallback.
  await page.evaluate(()=>{Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async()=>{throw Error('denied');}}});document.execCommand=()=>false;});
  await book().getByRole('button',{name:'复制已收录摘要',exact:true}).click();assert((await book().locator('textarea').inputValue()).includes('真实测试记录9'));
  await book().locator('textarea').evaluate(el=>el.remove());
  // Nested dialog traps focus, scrolls inside the viewport, and restores focus.
  await book().getByRole('button',{name:'合上回忆册',exact:true}).focus();await page.keyboard.press('Shift+Tab');assert(await book().getByRole('button',{name:'导入备份',exact:true}).evaluate(el=>el.getRootNode().activeElement===el));
  const box=await book().evaluate(el=>({w:el.getBoundingClientRect().width,x:el.getBoundingClientRect().x,y:el.getBoundingClientRect().y,h:el.getBoundingClientRect().height,scroll:el.scrollWidth,viewport:innerWidth,viewheight:innerHeight}));assert(box.x>=0&&box.y>=0);assert(box.x+box.w<=box.viewport+2);assert(box.y+box.h<=box.viewheight+2);assert(box.scroll<=box.w+2);
  await host.screenshot({path:path.join(out,width+'-memory.png')});await page.keyboard.press('Escape');assert(await entry.evaluate(el=>el.getRootNode().activeElement===el));
  await host.getByRole('button',{name:'开始这段散策',exact:true}).click();const school=host.locator('.mkschool');await school.getByRole('button',{name:'慢慢走过去',exact:true}).click();await page.waitForTimeout(30);assert(await entry.isDisabled(),'running game cannot continue behind the book');
  await school.getByRole('button',{name:'暂停',exact:true}).click();await page.waitForTimeout(30);assert(!(await entry.isDisabled()));await entry.click();await page.keyboard.press('Escape');assert.equal(await school.getAttribute('data-paused'),'true','closing the book must not resume without player intent');
  await host.getByRole('button',{name:'关闭互动弹窗',exact:true}).click();assert.equal(await page.evaluate(()=>document.body.style.overflow),'');assert.equal(await page.evaluate(()=>completed.length),0,'reading and imports never complete a game');
  await page.evaluate(()=>{MikageMinigames.dispose();start();MikageMinigames.open({region:'R01',reducedMotion:true});});await page.locator('[data-mikage-minigame-host]').getByRole('button',{name:'旧物回忆册',exact:true}).click();
  const restored=await page.evaluate(()=>MikageMinigames.getMemoryBook().entries);assert.equal(Object.keys(restored).length,blocked?0:11,'persistent vs volatile storage behavior remains explicit');
  assert.deepEqual(errors,[]);assert.deepEqual(missing,[]);console.log('PASS '+width+'x'+height+': all 10 entries, import/export/clipboard, old records, reachable episodes, focus/scroll, pause and cleanup'+(blocked?', blocked storage':''));await page.close();
 }}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
