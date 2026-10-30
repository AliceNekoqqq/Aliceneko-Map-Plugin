/* Full built panel module, actual domain engine/schema and shared art. Synthetic host only. */
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
const require=createRequire(import.meta.url),deps=process.env.MIKAGE_DEBUG_DEPS;
const {chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright');
const {build}=require(deps+'/esbuild');
const root=new URL('../',import.meta.url),release=new URL('releases/1.49.31/',root);
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
 await context.route('http://mikage.test/**',route=>route.fulfill({contentType:'text/html',body:'<!doctype html><html><body></body></html>'}));await page.goto('http://mikage.test/');
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
 let frame;
 for(const width of [320,375,1100]){
  await page.setViewportSize({width,height:900});
  for(const kind of ['life','settings']){
   await page.evaluate(kind=>MikageShrinePanels.open(kind==='settings'?'board':kind),kind);frame=await getFrame();
   if(kind==='settings'){if(await frame.locator('.panel-board-tools').getAttribute('open')===null)await frame.locator('.panel-board-tools>summary').click();await frame.locator('[data-open=settings]').click();}
   await frame.waitForFunction(kind=>document.body.dataset.view===kind,kind);await frame.evaluate(async()=>document.fonts.ready);
   if(kind==='life'){
    await frame.waitForSelector('.life-home-entry');assert.equal(await frame.locator('.life-home-entry').count(),8);
    for(const tab of ['home','decor','quiet','craft','garden','shop','album','strange','festival']){
     await frame.locator('[data-life-tab="'+tab+'"]').click();await frame.waitForFunction(tab=>document.querySelector('[data-life-tab="'+tab+'"]').getAttribute('aria-pressed')==='true',tab);
     const dim=await frame.evaluate(()=>({width:innerWidth,body:document.body.scrollWidth,root:document.documentElement.scrollWidth}));assert(dim.body<=dim.width+1&&dim.root<=dim.width+1,kind+' '+tab+' '+width+' '+JSON.stringify(dim));
    }
    await frame.locator('[data-life-tab=home]').click();
   }else{
    await frame.locator('[name=ema-api-mode][value=independent]').check();assert(await frame.locator('#ema-api-url').isVisible());
    const dim=await frame.evaluate(()=>({width:innerWidth,body:document.body.scrollWidth,root:document.documentElement.scrollWidth}));assert(dim.body<=dim.width+1&&dim.root<=dim.width+1,kind+' '+width+' '+JSON.stringify(dim));
   }
   if(screenshots){await mkdir(screenshots,{recursive:true});await page.locator('iframe[data-mikage-panel-frame]').screenshot({path:screenshots+'/'+kind+'-'+width+'.png'});}
  }
 }
 // Both actors: returning from a locked preview to the worn outfit must not commit a swap.
 await page.setViewportSize({width:375,height:900});await page.evaluate(()=>MikageShrinePanels.open('wardrobe'));frame=await getFrame();
 for(const actor of ['player','tomoe']){
  await frame.locator('[data-wardrobe-actor="'+actor+'"]').click();
  const worn=actor==='player'?'daily':'usual';await frame.locator('.outfit-choice.is-locked').first().click();assert((await frame.locator('#wardrobe-look-state').textContent()).includes('预览'));
  await frame.locator('[data-outfit-id="'+worn+'"]').click();assert.equal(await frame.locator('#wardrobe-look-state').textContent(),'当前穿着');assert.equal(await page.evaluate(()=>test.writes.length),0);
 }
 await page.evaluate(()=>MikageShrinePanels.open('life'));frame=await getFrame();await frame.locator('[data-life-tab=quiet]').click();await frame.getByRole('button',{name:'带入聊天草稿',exact:true}).first().click();assert((await page.locator('#send_textarea').inputValue()).length>0);assert.equal(await page.evaluate(()=>test.writes.length),0);
 await frame.locator('[data-life-tab=decor]').click();await frame.locator('[data-decoration=D-START-LANTERN]').click();await frame.getByRole('button',{name:'点亮',exact:true}).click();await page.waitForFunction(()=>test.writes.length===1);assert.equal(await page.evaluate(()=>test.rows.at(-1).states[0].生活.布置.find(x=>x.id==='D-START-LANTERN').state.lit),true);
 await page.evaluate(()=>MikageShrinePanels.open('board'));frame=await getFrame();if(await frame.locator('.panel-board-tools').getAttribute('open')===null)await frame.locator('.panel-board-tools>summary').click();await frame.locator('[data-open=settings]').click();await frame.locator('[name=ema-api-mode][value=main]').check();await frame.locator('#ema-save-settings').click();assert((await frame.locator('#ema-settings-feedback').textContent()).includes('保存'));
 assert.equal(await page.evaluate(()=>test.modelCalls),0);assert.equal(await page.evaluate(()=>test.triggers),0);
 await page.emulateMedia({reducedMotion:'reduce'});await page.evaluate(()=>MikageShrinePanels.open('life'));frame=await getFrame();await frame.locator('[data-life-tab=home]').click();await frame.locator('.life-home-blossom').click();assert.equal(await frame.evaluate(()=>MikageLifeDesk.inspect().particles),0);
 await page.evaluate(()=>MikageShrinePanels.dispose());assert.deepEqual(errors,[]);assert.equal(missing.size,0,[...missing].join('\n'));
 if(screenshots)await writeFile(screenshots+'/journal-browser-evidence.json',JSON.stringify({viewports:[320,375,1100],lifeTabs:9,wornPreviewReset:['player','tomoe'],modelCalls:0,explicitLifeWrites:1,source:'actual1.49.31 panels; actual domain/schema/art; synthetic host',errors,missing:[...missing]},null,2));
 console.log('PASS journal controls: all9 life tabs x3widths, independent settings, both worn preview resets without writes, quiet draft, actual domain lantern save, settings save, no generation, reduced motion and cleanup');
}finally{await browser.close();}
