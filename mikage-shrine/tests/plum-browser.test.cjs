const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require(process.env.MIKAGE_PLAYWRIGHT||'/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=path.resolve(__dirname,'..'),qa=process.env.MIKAGE_PLUM_QA||'/workspace/scratch/b637e759bbc4/qa-plum';
const scene=fs.readFileSync(path.join(root,'releases/1.33.0/scene.mjs'),'utf8'),start=scene.indexOf('((host)=>{',scene.indexOf('/* One immutable asset catalog')),end=scene.indexOf('/* Tavern Helper adapter',start);
const game=fs.readFileSync(path.join(root,'releases/1.33.0/minigames.mjs'),'utf8').replace(/export \{VERSION,SCRIPT_ID,start\};?/,'');
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
   window.completed=[];window.objectURLs=new Set();const create=URL.createObjectURL.bind(URL),revoke=URL.revokeObjectURL.bind(URL);URL.createObjectURL=b=>{const u=create(b);objectURLs.add(u);return u;};URL.revokeObjectURL=u=>{objectURLs.delete(u);revoke(u);};if(!blockedStorage)localStorage.setItem('mikage.showa-memory-book.v1',JSON.stringify({schema:1,entries:{'R04':{id:'R04',item:'原纸舟回忆',plays:2}}}));window.MikageShrinePanels={getAppearance:()=>({player:'school',tomoe:'school-human'}),subscribeAppearance(){return()=>{};}};
   window.frameIds=new Set();const raf=window.requestAnimationFrame.bind(window),caf=window.cancelAnimationFrame.bind(window);window.requestAnimationFrame=fn=>{const id=raf(t=>{window.frameIds.delete(id);fn(t);});window.frameIds.add(id);return id;};window.cancelAnimationFrame=id=>{window.frameIds.delete(id);caf(id);};
  },{blockedStorage});
  await page.addScriptTag({content:scene.slice(start,end)});await page.addScriptTag({content:game+'\nstart();'});
  await page.evaluate(()=>{document.getElementById('opener').focus();MikageMinigames.open({region:'R04',period:innerWidth===375?'day':innerWidth===1280?'dusk':'night',reducedMotion:true,onComplete:r=>completed.push(r)});});
  const shadow=page.locator('[data-mikage-minigame-host]');await shadow.getByRole('button',{name:/开始/}).click();const plum=shadow.locator('.mkplum');await plum.waitFor();
  await plum.getByRole('button',{name:'开始接花',exact:true}).click();await page.waitForTimeout(100);await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));});assert.equal(await plum.getAttribute('data-paused'),'true');await page.waitForTimeout(70);assert.equal(await page.evaluate(()=>frameIds.size),0);await page.evaluate(()=>delete document.hidden);
  await plum.getByRole('button',{name:'再做一坛',exact:true}).click();const recipe=width===1280?'sweet':width===320?'fresh':'clear',target=recipe==='sweet'?{white:2,pink:3,dew:1}:recipe==='fresh'?{white:2,pink:1,dew:3}:{white:3,pink:1,dew:2};
  await plum.locator('[data-recipe="'+recipe+'"]').click();await plum.getByRole('button',{name:'一步步接',exact:true}).click();
  await page.evaluate(async()=>{await MikageCharacterArt.preloadWalk();await document.fonts.ready;});assert(await page.evaluate(()=>document.fonts.check('14px "Mikage Plum"')));
  const setCup=async x=>plum.getByRole('slider',{name:'接花盏的位置',exact:true}).evaluate((el,value)=>{el.value=String(value);el.dispatchEvent(new Event('input',{bubbles:true}));},x);
  await plum.focus();await page.keyboard.press('ArrowLeft');assert.equal(await plum.getByRole('slider',{name:'接花盏的位置',exact:true}).inputValue(),'40');
  const bounds=await plum.locator('.mkp-stage').boundingBox();await plum.locator('.mkp-stage').dispatchEvent('pointerdown',{pointerId:9,button:0,clientX:bounds.x+bounds.width*.7,clientY:bounds.y+100});await plum.locator('.mkp-stage').dispatchEvent('pointerup',{pointerId:9});assert.equal(await plum.getByRole('slider',{name:'接花盏的位置',exact:true}).inputValue(),'70');
  for(let i=0;i<18;i++){
   if(await plum.getAttribute('data-phase')==='rest')await plum.getByRole('button',{name:'往廊内挪一点',exact:true}).click();
   if(i===1)await plum.getByRole('button',{name:'巴卫协助 2/2',exact:true}).click();
   for(let j=0;j<3;j++)await plum.getByRole('button',{name:'落下一步',exact:true}).click();
   const row=await plum.evaluate(el=>({kind:el.querySelector('.mkp-token').dataset.kind,x:parseFloat(el.querySelector('.mkp-marker').style.left)}));await setCup(row.kind==='twig'?(row.x<50?90:10):row.x);
   if(i===4)await plum.locator('.mkp-stage').screenshot({path:path.join(qa,width+'-play.png')});
   await plum.getByRole('button',{name:'落下一步',exact:true}).click();
  }
  assert.equal(await plum.getAttribute('data-phase'),'mix');await plum.getByRole('button',{name:'调好了，准备封坛',exact:true}).click();assert.equal(await plum.getAttribute('data-phase'),'mix');
  for(const [id,n]of Object.entries(target)){const label={white:'白梅',pink:'绯梅',dew:'晨露'}[id];for(let i=0;i<n;i++)await plum.getByRole('button',{name:'加入'+label,exact:true}).click();}
  await plum.getByRole('button',{name:'调好了，准备封坛',exact:true}).click();assert.equal(await plum.getAttribute('data-phase'),'seal');
  await plum.getByRole('button',{name:'托瑞希留坛，收好寄存笺',exact:true}).click();assert.equal(await plum.getAttribute('data-phase'),'seal');
  await plum.getByRole('slider',{name:'纸封方向',exact:true}).focus();await page.keyboard.press('ArrowRight');assert((await plum.locator('.mkp-seal-hint').textContent()).includes('当前 5°'));
  await plum.getByRole('button',{name:'请瑞希示范对齐',exact:true}).click();await plum.getByRole('button',{name:'竹叶护封',exact:true}).click();await plum.screenshot({path:path.join(qa,width+'-seal.png')});
  await plum.getByRole('button',{name:'托瑞希留坛，收好寄存笺',exact:true}).click();assert.equal(await plum.getAttribute('data-phase'),'done');
  const result=await page.evaluate(()=>({completed,book:MikageMinigames.getMemoryBook()}));assert.equal(result.completed.length,1);assert.deepEqual(result.completed[0].picked,{white:4,pink:4,dew:4});assert.equal(result.completed[0].helps,1);assert.equal(result.completed[0].twigs,0);assert.equal(result.book.entries['R04-PLUM'].plays,1);assert(result.book.entries['R04-PLUM'].detail.includes('尚未酿成'));if(!blockedStorage)assert.equal(result.book.entries.R04.plays,2);
  assert.equal((await plum.textContent()).includes('浏览器未允许本地保存'),blockedStorage);
  const wardrobe=await plum.locator('.mkp-figures>span').evaluateAll(nodes=>nodes.map(el=>el.style.backgroundImage));assert(wardrobe[0].includes('school-human'));assert(wardrobe[1].includes('player-school'));assert(await plum.locator('.mkp-figures>span').evaluateAll(nodes=>nodes.every(el=>el.clientWidth===72&&el.clientHeight===72)),'Both wardrobe figures must have visible 72px frames');
  const background=await plum.locator('.mkp-scene').getAttribute('src');assert(background.includes(width===375?'plum-v133-table.webp':width===1280?'r04-dusk.webp':'r04-night.webp'));
  const overflow=await plum.evaluate(el=>({width:el.getBoundingClientRect().width,scroll:el.scrollWidth,body:document.documentElement.scrollWidth,viewport:innerWidth}));assert(overflow.scroll<=overflow.width+2);assert(overflow.body<=overflow.viewport+2);await plum.screenshot({path:path.join(qa,width+'-done.png')});
  await plum.getByRole('button',{name:'再做一坛',exact:true}).click();await plum.getByRole('button',{name:'一步步接',exact:true}).click();await plum.getByRole('button',{name:'先收好这些',exact:true}).click();await plum.getByRole('button',{name:'向瑞希补齐备料',exact:true}).click();
  for(const [label,n]of [['白梅',3],['绯梅',1],['晨露',2]])for(let i=0;i<n;i++)await plum.getByRole('button',{name:'加入'+label,exact:true}).click();
  await plum.getByRole('button',{name:'调好了，准备封坛',exact:true}).click();await plum.getByRole('button',{name:'请瑞希示范对齐',exact:true}).click();await plum.getByRole('button',{name:'留坛，只带走配方',exact:true}).click();
  assert.deepEqual(await page.evaluate(()=>completed[1].picked),{white:0,pink:0,dew:0});assert.deepEqual(await page.evaluate(()=>completed[1].borrowed),{white:3,pink:1,dew:2});
  await plum.getByRole('button',{name:'再做一坛',exact:true}).click();await plum.getByRole('button',{name:'一步步接',exact:true}).click();await plum.getByRole('button',{name:'先收好这些',exact:true}).click();await plum.getByRole('button',{name:'只留香笺，不封坛',exact:true}).click();assert.equal(await page.evaluate(()=>completed[2].cardOnly),true);assert.equal(await page.evaluate(()=>MikageMinigames.getMemoryBook().entries['R04-PLUM'].plays),3);
  await plum.getByRole('button',{name:'导出香方',exact:true}).click();assert.equal(await page.evaluate(()=>objectURLs.size),1);await plum.getByRole('button',{name:'回到地图',exact:true}).click();await page.waitForTimeout(80);
  assert.equal(await page.locator('[data-mikage-minigame-host]').count(),0);assert.equal(await page.evaluate(()=>frameIds.size),0);assert.equal(await page.evaluate(()=>objectURLs.size),0);assert.equal(await page.evaluate(()=>document.body.style.overflow),'');assert.equal(await page.evaluate(()=>document.activeElement.id),'opener');
  await page.evaluate(()=>MikageMinigames.open({region:'R04',period:'night'}));const again=page.locator('[data-mikage-minigame-host]');await again.getByRole('button',{name:/开始/}).click();await again.getByRole('button',{name:'开始接花',exact:true}).click();await page.waitForTimeout(90);assert((await page.evaluate(()=>frameIds.size))>0);await again.getByRole('button',{name:'关闭互动弹窗',exact:true}).click();await page.waitForTimeout(60);assert.equal(await page.evaluate(()=>frameIds.size),0);assert.equal(await page.locator('[data-mikage-minigame-host]').count(),0);
  assert.deepEqual(errors,[]);assert.deepEqual(missing,[]);console.log('PASS '+width+'x'+height+': R04 full collecting/mixing/sealing, wind/assist, native keyboard/pointer, zero-catch supplement/card-only, old memory/current wardrobe/periods, pause/export cleanup, no overflow/errors/missing assets'+(blockedStorage?', volatile storage fallback':''));
  await page.close();
 }}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
