const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require(process.env.MIKAGE_PLAYWRIGHT||'/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=path.resolve(__dirname,'..'),qa=process.env.MIKAGE_SCHOOL_QA||'/workspace/scratch/b637e759bbc4/qa-school';
const scene=fs.readFileSync(path.join(root,'releases/1.31.0/scene.mjs'),'utf8'),start=scene.indexOf('((host)=>{',scene.indexOf('/* One immutable asset catalog')),end=scene.indexOf('/* Tavern Helper adapter',start);
const game=fs.readFileSync(path.join(root,'releases/1.31.0/minigames.mjs'),'utf8').replace(/export \{VERSION,SCRIPT_ID,start\};?/,'');
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
   window.completed=[];window.MikageShrinePanels={getAppearance:()=>({player:'school',tomoe:'school-human'}),subscribeAppearance(){return()=>{};}};
   window.frameIds=new Set();const raf=window.requestAnimationFrame.bind(window),caf=window.cancelAnimationFrame.bind(window);window.requestAnimationFrame=fn=>{const id=raf(t=>{window.frameIds.delete(id);fn(t);});window.frameIds.add(id);return id;};window.cancelAnimationFrame=id=>{window.frameIds.delete(id);caf(id);};
  },{blockedStorage});
  await page.addScriptTag({content:scene.slice(start,end)});await page.addScriptTag({content:game+'\nstart();'});
  await page.evaluate(()=>{document.getElementById('opener').focus();MikageMinigames.open({region:'R02',period:'dusk',reducedMotion:true,onComplete:r=>completed.push(r)});});
  const shadow=page.locator('[data-mikage-minigame-host]');assert.equal(await shadow.locator('.mkg-cat').count(),0);await shadow.getByRole('button',{name:/开始/}).click();const school=shadow.locator('.mkschool');await school.waitFor();
  await school.getByRole('button',{name:'慢慢走过去',exact:true}).click();await page.waitForTimeout(150);await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));});assert.equal(await school.getAttribute('data-paused'),'true');await page.waitForTimeout(100);assert.equal(await page.evaluate(()=>frameIds.size),0);await page.evaluate(()=>delete document.hidden);
  await school.getByRole('button',{name:'继续走',exact:true}).click();await school.getByRole('button',{name:'重新走一次',exact:true}).click();await school.getByRole('button',{name:'一步步走',exact:true}).click();
  await school.focus();await page.keyboard.press('ArrowLeft');assert.equal(await school.locator('.mks-actor:not(.is-companion)').evaluate(el=>parseFloat(el.style.left)),22);await page.keyboard.press('ArrowRight');
  await school.locator('.mks-stage').dispatchEvent('pointerdown',{pointerId:4,clientX:80,clientY:100});await school.locator('.mks-stage').dispatchEvent('pointerup',{pointerId:4,clientX:160,clientY:100});assert.equal(await school.locator('.mks-actor:not(.is-companion)').evaluate(el=>parseFloat(el.style.left)),78);await page.keyboard.press('ArrowLeft');
  try{await page.evaluate(()=>MikageCharacterArt.preloadWalk());}catch(e){console.error({missing,network});throw e;}await page.waitForTimeout(100);
  for(let index=0;index<12;index++){
   if(await school.getAttribute('data-phase')==='rest')await school.getByRole('button',{name:'沿樱花一侧',exact:true}).click();
   for(let i=0;i<3;i++)await school.getByRole('button',{name:'走一步',exact:true}).click();
   const target=await school.evaluate(el=>{const paper=el.querySelector('.mks-paper');if(paper)return Math.round((parseFloat(paper.style.left)-22)/28);const occupied=[...el.querySelectorAll('.mks-token')].map(x=>Math.round((parseFloat(x.style.left)-22)/28));return [0,1,2].find(x=>!occupied.includes(x));});
   let current=await school.locator('.mks-actor:not(.is-companion)').evaluate(el=>Math.round((parseFloat(el.style.left)-22)/28));
   while(current!==target){await school.getByRole('button',{name:current<target?'向右走':'向左走',exact:true}).click();current+=current<target?1:-1;}
   if(index===4)await school.screenshot({path:path.join(qa,width+'-play.png')});
   await school.getByRole('button',{name:'走一步',exact:true}).click();
  }
  assert.equal(await school.getAttribute('data-phase'),'arrange');
  await school.getByRole('button',{name:'我来交还',exact:true}).click();assert.equal(await school.getAttribute('data-phase'),'arrange','Wrong order may not submit');
  for(const id of ['A','B','C'])await school.locator('[data-page="'+id+'"]').click();
  await school.getByRole('button',{name:'请巴卫递过去',exact:true}).click();assert.equal(await school.getAttribute('data-phase'),'done');
  const result=await page.evaluate(()=>({completed,book:MikageMinigames.getMemoryBook()}));assert.equal(result.completed.length,1);assert.equal(result.completed[0].notes,6);assert.equal(result.completed[0].bumps,0);assert.equal(result.book.entries.R02.plays,1);assert(result.book.entries.R02.detail.includes('6张散页'));
  assert.equal((await school.textContent()).includes('浏览器暂未允许本地保存'),blockedStorage);
  const portraitURLs=await school.locator('.mks-actor>span').evaluateAll(nodes=>nodes.map(el=>el.style.backgroundImage));assert(portraitURLs[0].includes('school-human'));assert(portraitURLs[1].includes('player-school'));
  const overflow=await school.evaluate(el=>({width:el.getBoundingClientRect().width,scroll:el.scrollWidth,body:document.documentElement.scrollWidth,viewport:innerWidth}));assert(overflow.scroll<=overflow.width+2);assert(overflow.body<=overflow.viewport+2);
  assert(await page.evaluate(()=>document.fonts.check('14px "Mikage School"')));await school.screenshot({path:path.join(qa,width+'-done.png')});await school.getByRole('button',{name:'回到地图',exact:true}).click();await page.waitForTimeout(80);
  assert.equal(await page.locator('[data-mikage-minigame-host]').count(),0);assert.equal(await page.evaluate(()=>frameIds.size),0);assert.equal(await page.evaluate(()=>document.body.style.overflow),'');assert.equal(await page.evaluate(()=>document.activeElement.id),'opener');
  assert.deepEqual(errors,[]);assert.deepEqual(missing,[]);console.log('PASS '+width+'x'+height+': R02 full route, six notes, sorting, wardrobe art, cleanup/focus, no overflow/errors/missing assets'+(blockedStorage?', volatile storage fallback':''));
  await page.close();
 }}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
