/* Full built panel module, actual domain engine/schema and shared art. Synthetic host only. */
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
const require=createRequire(import.meta.url),deps=process.env.MIKAGE_DEBUG_DEPS;
const {chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright');
const {build}=require(deps+'/esbuild');
const root=new URL('../',import.meta.url),release=new URL('releases/'+(process.env.MIKAGE_PANEL_RELEASE||'1.49.30')+'/',root);
const panel=await readFile(new URL('panels.mjs',release),'utf8');
const mvu=await readFile(new URL('releases/1.49.27/mvu.mjs',root),'utf8');
const domain=mvu.slice(mvu.indexOf('const ShrineFieldSpec ='),mvu.indexOf('// Install before importing the core:'));
const schema=mvu.slice(mvu.indexOf('  const Schema = ')+2,mvu.indexOf('\n  bootstrapCommitted=true;'));
const engine=await build({stdin:{contents:'import {z} from '+JSON.stringify(deps+'/zod/index.js')+';\n'+domain+'\n'+schema+'\nShrineCard.installZodSchema(Schema);window.MikageShrineRuntime={version:"0.6.0",engine:ShrineCard};window.fixtureInitial=ShrineInitial;',resolveDir:deps},bundle:true,format:'iife',platform:'browser',write:false});
const scene=await readFile(new URL('releases/1.49.29/scene.mjs',root),'utf8');
const art=scene.slice(scene.indexOf('/* One immutable asset catalog,'),scene.indexOf('const OpeningHTML='));
const browser=await chromium.launch({headless:true,executablePath:process.env.MIKAGE_CHROMIUM_EXECUTABLE,args:['--no-sandbox'],env:{...process.env,LD_LIBRARY_PATH:process.env.MIKAGE_CHROMIUM_DIR||''}});
const context=await browser.newContext({viewport:{width:375,height:900}}),page=await context.newPage(),errors=[],missing=new Set();
page.on('pageerror',e=>errors.push(e.message));const screenshots=process.env.MIKAGE_SCREENSHOT_DIR,cache=process.env.MIKAGE_ASSET_CACHE;
await context.route('https://**/*',async route=>{const url=route.request().url(),key=createHash('sha256').update(url).digest('hex');try{const body=await readFile(cache+'/'+key);await route.fulfill({body,contentType:url.endsWith('.ttf')?'font/ttf':url.endsWith('.woff2')?'font/woff2':'image/webp',headers:{'access-control-allow-origin':'*'}});}catch{missing.add(url);await route.abort();}});
try{
 await page.setContent('<html><body><button id="opener">打开手帖</button><textarea id="send_textarea"></textarea></body></html>');
 await page.addScriptTag({content:engine.outputFiles[0].text});await page.addScriptTag({content:art});
 await page.evaluate(()=>{
  window.test={rows:[{id:0,role:'assistant',swipe:0,texts:['当前正文','重生成页正文'],states:[structuredClone(fixtureInitial),structuredClone(fixtureInitial)]}],listeners:{},writes:[],triggers:0,modelCalls:0,ctx:{characterId:1,groupId:'',chatId:'A'},noMvu:false};
  window.SillyTavern={getContext:()=>test.ctx};
  window.getLastMessageId=()=>test.rows.at(-1).id;
  window.getChatMessages=(range,opts)=>{const ids=String(range).split('-').map(Number),selected=ids.length>1?test.rows.filter(r=>r.id>=ids[0]&&r.id<=ids[1]):test.rows.filter(r=>r.id===ids[0]);return selected.map(r=>opts?.include_swipes?{message_id:r.id,role:r.role,swipe_id:r.swipe,swipes:r.texts,swipes_data:r.states.map(s=>({stat_data:structuredClone(s)}))}:{message_id:r.id,role:r.role,message:r.texts[r.swipe],data:{stat_data:structuredClone(r.states[r.swipe])}});};
  window.Mvu={events:{VARIABLE_UPDATE_ENDED:'mvu'},getMvuData:({message_id})=>{if(test.noMvu)return null;const r=test.rows.find(r=>r.id===message_id);return r?{stat_data:structuredClone(r.states[r.swipe])}:null;},replaceMvuData:async(data,{message_id})=>{const r=test.rows.find(r=>r.id===message_id);r.states[r.swipe]=structuredClone(data.stat_data);test.writes.push({type:'replace',id:message_id,swipe:r.swipe});}};
  window.eventOn=(name,fn)=>{(test.listeners[name]??=[]).push(fn);return{stop(){test.listeners[name]=test.listeners[name].filter(x=>x!==fn);}};};
  window.tavern_events={CHAT_CHANGED:'chat',MESSAGE_SWIPED:'swipe',MESSAGE_RECEIVED:'received',MESSAGE_DELETED:'deleted'};
  window.getButtonEvent=name=>'button:'+name;window.appendInexistentScriptButtons=()=>{};window.waitGlobalInitialized=async()=>{};
  window.createChatMessages=async rows=>{for(const r of rows){test.rows.push({id:test.rows.length,role:r.role,swipe:0,texts:[r.message],states:[structuredClone(r.data.stat_data)]});test.writes.push({type:'message',role:r.role,text:r.message});}};
  window.triggerSlash=async()=>{test.triggers++;};window.generateRaw=async()=>{test.modelCalls++;throw Error('Live model prohibited in this fixture');};
  window.getModelList=async()=>[];window.toastr={warning(){},error(){}};
  test.archive={scope:JSON.stringify([1,'','A']),view:{tasks:[{id:'EMA-C',wish:'已完成的示例委托'}]},status:{active:[{taskId:'EMA-C',eventId:'E9',data:{choice:'保留旧窝',result:'<img src=x onerror=alert(1)>另立路牌',effects:['旧窝保留'],unresolved:['待回访']}}]}};
  window.MikageTaskArchives={inspect:()=>test.archive,refresh(){throw Error('Archive view must never refresh or summarize');},open(){throw Error('Archive view must not open auto-summary path');}};
 });
 const helper=panel.replace(/export \{VERSION,SCRIPT_ID,start\};\s*$/,'')+'\nstart();';
 await page.evaluate(helper=>{
  const f=document.createElement('iframe');f.id='helper';f.style.display='none';const names=['Mvu','getLastMessageId','getChatMessages','eventOn','tavern_events','getButtonEvent','appendInexistentScriptButtons','waitGlobalInitialized','createChatMessages','triggerSlash','generateRaw','getModelList','toastr'];
  for(const name of names)f[name]=null;
  document.body.append(f);for(const name of names)f.contentWindow[name]=window[name];f.contentWindow.eval(helper);
 },helper);
 const getFrame=async()=>await(await page.$('iframe[data-mikage-panel-frame]')).contentFrame();
 await page.evaluate(()=>MikageShrinePanels.open('map'));let frame=await getFrame();
 await frame.waitForFunction(()=>ShrinePanel?.ready&&document.querySelectorAll('#map-quick-nav button').length===10);
 await frame.evaluate(async()=>{await ShrineCharacterArt.installFont(document);await document.fonts.ready;});
 assert.equal(await page.evaluate(()=>test.writes.length),0);
 for(const width of [320,375,1100]){
  await page.setViewportSize({width,height:900});
  for(const kind of ['map','board','wardrobe']){
   await page.evaluate(kind=>MikageShrinePanels.open(kind),kind);frame=await getFrame();
   await frame.waitForFunction(kind=>document.body.dataset.view===kind,kind);
   await frame.evaluate(async()=>document.fonts.ready);
   await frame.evaluate(async()=>{const imgs=[...document.querySelectorAll('img.panel-outfit-image')].filter(n=>{const r=n.getBoundingClientRect();return r.bottom>0&&r.top<innerHeight&&r.right>0&&r.left<innerWidth;});for(const img of imgs)img.loading='eager';await Promise.all(imgs.map(img=>img.decode().catch(()=>{})));});
   await frame.evaluate(()=>{for(const a of document.getAnimations()){const t=a.effect?.getComputedTiming();if(t&&t.iterations!==Infinity&&a.playState!=='finished')try{a.finish();}catch{}}});
   const dim=await frame.evaluate(()=>({width:innerWidth,body:document.body.scrollWidth,root:document.documentElement.scrollWidth}));
   assert(dim.body<=dim.width+1&&dim.root<=dim.width+1,kind+' '+width+' '+JSON.stringify(dim));
   if(screenshots){await mkdir(screenshots,{recursive:true});await page.locator('iframe[data-mikage-panel-frame]').screenshot({path:screenshots+'/'+kind+'-'+width+'.png'});}
   if(screenshots&&kind==='wardrobe'&&width===1100)await writeFile(screenshots+'/font-evidence.json',JSON.stringify(await frame.evaluate(()=>({family:getComputedStyle(document.querySelector('.outfit-name')).fontFamily,fonts:[...document.fonts].map(f=>({family:f.family,status:f.status,range:f.unicodeRange}))})),null,2));
  }
 }
 await page.setViewportSize({width:375,height:900});
 await page.evaluate(()=>MikageShrinePanels.open('map'));frame=await getFrame();
 await frame.locator('.panel-map-index>summary').click();await frame.locator('#map-quick-nav [data-region-id="R02"]').click();
 assert((await frame.locator('#place-card h3').textContent()).length>0);assert.equal(await page.evaluate(()=>test.writes.length),0);assert.equal(await page.evaluate(()=>test.modelCalls),0);
 await frame.locator('#map-quick-nav [data-region-id="R10"]').click();assert.equal(await frame.locator('.map-travel').isDisabled(),true);
 // Fixture-only display matrix. Restore canonical engine initial state before exercising real writes.
 await page.evaluate(()=>{const s=test.rows[0].states[0],base=structuredClone(s.绘马板.绘马[0]);for(const [id,status]of [['EMA-A','进行'],['EMA-P','暂停'],['EMA-C','已完成']])s.绘马板.绘马.push({...structuredClone(base),编号:id,标题:'示例'+status,状态:status});MikageShrinePanels.refresh();});
 await page.evaluate(()=>MikageShrinePanels.open('board'));frame=await getFrame();await frame.waitForFunction(()=>document.querySelectorAll('.ema-card').length===5);
 await frame.locator('[data-panel-status="paused"]').click();assert.equal(await frame.locator('.ema-card:visible').count(),1);assert((await frame.locator('.ema-card:visible .ema-status').textContent()).includes('暂停'));
 await frame.locator('[data-panel-status="completed"]').click();await frame.locator('.ema-card:visible .ema-front .flip-button').click();
 assert.equal(await frame.locator('#panel-ema-sheet .ema-back').count(),1);
 await frame.getByRole('button',{name:'查看本项任务档案',exact:true}).click();await frame.waitForFunction(()=>document.querySelector('#panel-archive-view')?.textContent.includes('另立路牌'));
 assert.equal(await frame.locator('#panel-archive-view img').count(),0);assert((await frame.locator('#panel-archive-view').textContent()).includes('<img'));
 assert.equal(await page.evaluate(()=>test.writes.length),0);assert.equal(await page.evaluate(()=>test.modelCalls),0);
 await frame.getByRole('button',{name:'收起档案',exact:true}).click();
 await page.evaluate(()=>{test.archive.scope='OTHER';});await frame.getByRole('button',{name:'查看本项任务档案',exact:true}).click();await frame.waitForFunction(()=>document.querySelector('#panel-archive-view').textContent.includes('尚未就绪'));assert(!(await frame.locator('#panel-archive-view').textContent()).includes('保留旧窝'));
 await frame.press('body','Escape');assert.equal(await frame.locator('#panel-archive-view').isVisible(),false);
 // Long paper stays readable and the single selected detail preserves original handlers after refresh.
 await frame.locator('[data-panel-status="all"]').click();await frame.locator('[data-ema-id="EMA-1"] .ema-front .flip-button').click();
 await page.evaluate(()=>{test.rows[0].states[0].绘马板.绘马[0].补充说明='长文本'.repeat(100);MikageShrinePanels.refresh();});
 await frame.waitForFunction(()=>document.querySelector('#panel-ema-sheet .ema-detail').textContent.length>300);assert.equal(await frame.locator('#panel-ema-sheet .ema-back').count(),1);
 await page.evaluate(()=>{test.rows[0].states[0]=structuredClone(fixtureInitial);test.archive.scope=JSON.stringify([1,'','A']);MikageShrinePanels.refresh();});
 await page.evaluate(()=>MikageShrinePanels.open('wardrobe'));frame=await getFrame();await frame.waitForFunction(()=>document.querySelector('[data-outfit-id="daily"]'));
 const locked=frame.locator('.outfit-choice.is-locked').first();await locked.click();assert((await frame.locator('#wardrobe-look-state').textContent()).includes('预览'));assert.equal(await page.evaluate(()=>test.writes.length),0);
 await frame.locator('[data-outfit-id="work"]').click();await page.waitForFunction(()=>test.writes.some(x=>x.type==='replace'));assert.equal(await page.evaluate(()=>test.rows[0].states[0].玩家.衣装),'work');assert.equal(await page.evaluate(()=>test.triggers),0);assert.equal(await page.evaluate(()=>test.modelCalls),0);
 // Exact selected-swipe read even when MVU index is unavailable.
 await page.evaluate(()=>{test.rows[0].swipe=1;test.rows[0].states[1].环境.时段='傍晚';test.noMvu=true;for(const fn of [...(test.listeners.swipe||[])])fn();});
 await page.evaluate(()=>MikageShrinePanels.open('board'));frame=await getFrame();assert.equal(await frame.evaluate(async()=>(await ShrineUIBridge.getState()).环境.时段),'傍晚');
 await page.evaluate(()=>{test.noMvu=false;test.rows[0].swipe=0;for(const fn of [...(test.listeners.swipe||[])])fn();});
 // Real unchanged accept handler commits once and asks the normal trigger once; no live generation.
 await page.evaluate(()=>MikageShrinePanels.open('board'));frame=await getFrame();await frame.locator('[data-ema-id="EMA-1"] .ema-front .flip-button').click();await frame.getByRole('button',{name:'接取心愿',exact:true}).click();
 await page.waitForFunction(()=>test.triggers===1);assert.equal(await page.evaluate(()=>test.writes.filter(x=>x.type==='message').length),1);
 assert.equal(await page.evaluate(()=>test.modelCalls),0);
 await page.evaluate(()=>MikageShrinePanels.open('board'));frame=await getFrame();await frame.locator('[data-ema-id="EMA-1"] .ema-front .flip-button').click();await frame.getByRole('button',{name:'暂停心愿',exact:true}).click();
 await frame.waitForFunction(()=>document.querySelector('[data-ema-id="EMA-1"]').dataset.status==='暂停');
 await frame.getByRole('button',{name:'继续心愿',exact:true}).click();await page.waitForFunction(()=>test.triggers===2);
 assert.equal(await page.evaluate(()=>test.modelCalls),0);
 await page.evaluate(()=>MikageShrinePanels.open('map'));frame=await getFrame();await page.evaluate(()=>{test.ctx.chatId='B';for(const fn of [...(test.listeners.chat||[])])fn();});assert.equal(await page.locator('iframe[data-mikage-panel-frame]').count(),0);
 await page.evaluate(()=>MikageShrinePanels.dispose());assert.equal(await page.evaluate(()=>Object.values(test.listeners).flat().length),0);
 assert.deepEqual(errors,[]);
 if(screenshots)await writeFile(screenshots+'/browser-evidence.json',JSON.stringify({viewports:[320,375,1100],source:'full actual panel module + actual domain/schema + actual shared art in helper/host-created iframe topology',missingAssets:[...missing],pageErrors:errors,paidModelCalls:0,realHost:false},null,2));
 console.log('PASS actual panels/domain: three narrow/desktop pages,10region map, local selection, locked destination, status filters, single wish paper, archive scope/XSS/read-only, long prose, locked preview, actual outfit save, selected swipe fallback, original accept/trigger, chat cleanup; model calls0. Missing assets '+missing.size);
}finally{await browser.close();}
