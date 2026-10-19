const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require(process.env.MIKAGE_PLAYWRIGHT||'/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=path.resolve(__dirname,'..'),qa=process.env.MIKAGE_MARKET_QA||'/workspace/scratch/b637e759bbc4/qa-market';
const scene=fs.readFileSync(path.join(root,'releases/1.32.0/scene.mjs'),'utf8'),start=scene.indexOf('((host)=>{',scene.indexOf('/* One immutable asset catalog')),end=scene.indexOf('/* Tavern Helper adapter',start);
const game=fs.readFileSync(path.join(root,'releases/1.32.0/minigames.mjs'),'utf8').replace(/export \{VERSION,SCRIPT_ID,start\};?/,'');
fs.mkdirSync(qa,{recursive:true});
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/tmp/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu']});
 try{for(const [width,height,blockedStorage]of [[375,812,false],[1280,900,false],[320,568,true]]){
  const page=await browser.newPage({viewport:{width,height},reducedMotion:'reduce'}),errors=[],missing=[],network=[];
  page.on('requestfailed',r=>network.push(r.url()+' '+r.failure()?.errorText));
  page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/*',async route=>{
   const url=new URL(route.request().url()),rel=url.pathname.split('/mikage-shrine/')[1];
   if(url.hostname==='fixture.invalid'){await route.fulfill({body:'<!doctype html><html><body></body></html>',contentType:'text/html'});return;}
   if(!rel){await route.abort();return;}const file=path.resolve(root,rel);
   if(!file.startsWith(root+path.sep)||!fs.existsSync(file)){missing.push(rel);await route.abort();return;}
   const ext=path.extname(file),type=ext==='.png'?'image/png':ext==='.webp'?'image/webp':ext==='.ttf'?'font/ttf':'application/octet-stream';await route.fulfill({body:fs.readFileSync(file),contentType:type,headers:{'access-control-allow-origin':'*'}});
  });
  await page.goto('https://fixture.invalid/');await page.setContent('<!doctype html><html lang="zh"><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0;background:#eee8dc;font-family:serif}button{font:inherit}</style></head><body><button id="opener">散策</button></body></html>');
  await page.evaluate(({blockedStorage})=>{
   if(blockedStorage)Object.defineProperty(window,'localStorage',{configurable:true,get(){throw Error('disabled');}});
   window.completed=[];window.objectURLs=new Set();const create=URL.createObjectURL.bind(URL),revoke=URL.revokeObjectURL.bind(URL);URL.createObjectURL=b=>{const u=create(b);objectURLs.add(u);return u;};URL.revokeObjectURL=u=>{objectURLs.delete(u);revoke(u);};if(!blockedStorage)localStorage.setItem('mikage.showa-memory-book.v1',JSON.stringify({schema:1,entries:{'R03-DANGO':{id:'R03-DANGO',item:'原团子纸签',plays:2}}}));window.MikageShrinePanels={getAppearance:()=>({player:'school',tomoe:'school-human'}),subscribeAppearance(){return()=>{};}};
   window.frameIds=new Set();const raf=window.requestAnimationFrame.bind(window),caf=window.cancelAnimationFrame.bind(window);window.requestAnimationFrame=fn=>{const id=raf(t=>{window.frameIds.delete(id);fn(t);});window.frameIds.add(id);return id;};window.cancelAnimationFrame=id=>{window.frameIds.delete(id);caf(id);};
  },{blockedStorage});
  await page.addScriptTag({content:scene.slice(start,end)});await page.addScriptTag({content:game+'\nstart();'});
  await page.evaluate(()=>{document.getElementById('opener').focus();MikageMinigames.open({region:'R03',period:'dusk',reducedMotion:true,onComplete:r=>completed.push(r)});});
  const shadow=page.locator('[data-mikage-minigame-host]');await shadow.getByRole('button',{name:/开始/}).click();const market=shadow.locator('.mkmarket');await market.waitFor();
  await market.getByRole('button',{name:'借面具遮住气息',exact:true}).click();
  await page.evaluate(async()=>{await MikageCharacterArt.preloadWalk();await document.fonts.ready;});assert(await page.evaluate(()=>document.fonts.check('14px "Mikage Market"')));
  await market.locator('[data-inspect="front"]').focus();await page.keyboard.press('Enter');assert.equal(await market.locator('[data-evidence="front"]').count(),1);
  for(const [i,id,verdict]of [[0,'bell','fake'],[1,'mirror','genuine'],[2,'fan','uncertain']]){
   assert.equal(await market.getAttribute('data-lot'),id);
   await market.locator('[data-verdict="'+verdict+'"]').click();assert.equal(await market.getAttribute('data-phase'),'inspect');
   for(const clue of ['front','base','ledger','light'])await market.locator('[data-inspect="'+clue+'"]').click();
   await market.getByRole('button',{name:'请巴卫看一眼',exact:true}).click();
   for(const clue of ['front',id==='bell'?'light':'ledger'])await market.locator('[data-evidence="'+clue+'"]').check();
   if(i===0){
    await market.screenshot({path:path.join(qa,width+'-play.png')});
    const first=await market.locator('.mkm-clue').first().screenshot();assert(first.length>200);
   }
   const bad=verdict==='fake'?'genuine':'fake';await market.locator('[data-verdict="'+bad+'"]').click();assert.equal(await market.getAttribute('data-phase'),'inspect');
   await market.locator('[data-verdict="'+verdict+'"]').click();assert.equal(await market.getAttribute('data-phase'),'reveal');
   await market.getByRole('button',{name:i===2?'收好鉴物记录':'去下一摊',exact:true}).click();
  }
  await market.getByRole('combobox',{name:'纸上纹样'}).selectOption('mirror');await market.getByRole('button',{name:'留张酒签，收好手记',exact:true}).click();assert.equal(await market.getAttribute('data-phase'),'done');
  const result=await page.evaluate(()=>({completed,book:MikageMinigames.getMemoryBook()}));assert.equal(result.completed.length,1);assert.equal(result.completed[0].confirmed,3);assert.equal(result.book.entries['R03-APPRAISAL'].plays,1);assert(result.book.entries['R03-APPRAISAL'].detail.includes('没有带走摊货'));if(!blockedStorage)assert.equal(result.book.entries['R03-DANGO'].plays,2);
  assert.equal((await market.textContent()).includes('浏览器未允许本地保存'),blockedStorage);
  const wardrobe=await market.locator('.mkm-figures>span').evaluateAll(nodes=>nodes.map(el=>el.style.backgroundImage));assert(wardrobe[0].includes('school-human'));assert(wardrobe[1].includes('player-school'));
  const overflow=await market.evaluate(el=>({width:el.getBoundingClientRect().width,scroll:el.scrollWidth,body:document.documentElement.scrollWidth,viewport:innerWidth}));assert(overflow.scroll<=overflow.width+2);assert(overflow.body<=overflow.viewport+2);
  await market.screenshot({path:path.join(qa,width+'-done.png')});
  await market.getByRole('button',{name:'再逛一圈',exact:true}).click();await market.getByRole('button',{name:'沿摊外侧进去',exact:true}).click();assert.equal(await market.getAttribute('data-lot'),'mirror');
  for(let i=0;i<3;i++){await market.getByRole('button',{name:'先不定论，记为待考',exact:true}).click();await market.getByRole('button',{name:i===2?'收好鉴物记录':'去下一摊',exact:true}).click();}
  await market.getByRole('button',{name:'直接回去',exact:true}).click();assert.equal(await market.getAttribute('data-phase'),'done');assert.equal(await page.evaluate(()=>completed[1].confirmed),0);assert.equal(await page.evaluate(()=>MikageMinigames.getMemoryBook().entries['R03-APPRAISAL'].plays),2);
  await market.getByRole('button',{name:'导出手记',exact:true}).click();assert.equal(await page.evaluate(()=>window.objectURLs.size),1);
  await market.getByRole('button',{name:'回到地图',exact:true}).click();await page.waitForTimeout(80);
  assert.equal(await page.locator('[data-mikage-minigame-host]').count(),0);assert.equal(await page.evaluate(()=>frameIds.size),0);assert.equal(await page.evaluate(()=>objectURLs.size),0);assert.equal(await page.evaluate(()=>document.body.style.overflow),'');assert.equal(await page.evaluate(()=>document.activeElement.id),'opener');
  assert.deepEqual(errors,[]);assert.deepEqual(missing,[]);console.log('PASS '+width+'x'+height+': R03 all three lots, evidence, wrong/correct/defer, replay, old memory, wardrobe, export cleanup/focus, no overflow/errors/missing assets'+(blockedStorage?', volatile storage fallback':''));
  await page.close();
 }}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
