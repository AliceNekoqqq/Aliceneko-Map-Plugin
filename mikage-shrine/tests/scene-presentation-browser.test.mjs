/* Exact built host + exact built srcdoc, synthetic host APIs. No model/API calls. */
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright');
const r=new URL('../releases/1.49.29/',import.meta.url);
const code=await readFile(new URL('scene.mjs',r),'utf8');
const html=await readFile(new URL('statusbar.html',r),'utf8');
const card=JSON.parse(await readFile(new URL('card-source.json',r),'utf8'));
const initial=JSON.parse(card.data.character_book.entries.find(e=>e.comment.includes('[InitVar]')).content);
const art=code.slice(code.indexOf('/* One immutable asset catalog,'),code.indexOf('const OpeningHTML='));
const host=code.slice(code.indexOf('const MikageStatusbarHost='),code.lastIndexOf('\n}\n\nexport'));
const browser=await chromium.launch({headless:true,executablePath:process.env.MIKAGE_CHROMIUM_EXECUTABLE,args:['--no-sandbox']});
const context=await browser.newContext({viewport:{width:760,height:1100}});
const page=await context.newPage(),errors=[],missing=new Set();page.on('pageerror',e=>errors.push(e.message));
const cache=process.env.MIKAGE_ASSET_CACHE;
await page.route('https://**/*',async route=>{
 const url=route.request().url();const key=createHash('sha256').update(url).digest('hex');
 try{assert(cache);const body=await readFile(cache+'/'+key);await route.fulfill({body,contentType:url.endsWith('.ttf')?'font/ttf':url.endsWith('.png')?'image/png':'image/webp',headers:{'access-control-allow-origin':'*'}});}
 catch{missing.add(url);await route.abort();}
});
const shot=process.env.MIKAGE_SCREENSHOT_DIR;
try{
 await page.setContent('<html><head><meta charset="utf-8"></head><body style="margin:0;background:#f5eee4"><div id="chat"><div class="mes" mesid="1"><div class="mes_text">&lt;StatusPlaceHolderImpl/&gt;</div></div></div></body></html>');
 await page.evaluate(initial=>{
  window.test={initial,swipe:0,texts:['巴卫：“有话就说，杵在那儿做什么。”\n檐下的风铃响了一声。<UpdateVariable>不应显示的内部更新</UpdateVariable><StatusPlaceHolderImpl/>','你说：“我今天想在神社休息。”\n巴卫合上折扇。<StatusPlaceHolderImpl/>'],listeners:{},opens:[],calls:0};
  window.getLastMessageId=()=>1;
  window.getChatMessages=(range,opts)=>opts?.include_swipes?[{message_id:1,role:'assistant',swipe_id:test.swipe,swipes:test.texts,swipes_data:[{stat_data:test.initial},{stat_data:{...test.initial,环境:{...test.initial.环境,时段:'黄昏'}}}]}]:[{message_id:1,role:'assistant',message:test.texts[test.swipe],data:{stat_data:test.initial}}];
  window.eventOn=(name,fn)=>{(test.listeners[name]??=[]).push(fn);return{stop(){test.listeners[name]=test.listeners[name].filter(x=>x!==fn);}};};
  window.tavern_events={MESSAGE_RECEIVED:'received',MESSAGE_UPDATED:'updated',MESSAGE_DELETED:'deleted',MESSAGE_SWIPED:'swiped',CHAT_CHANGED:'chat'};
  window.Mvu={getMvuData:()=>({stat_data:{...test.initial,环境:{...test.initial.环境,时段:test.swipe?'黄昏':'白昼'}}}),events:{VARIABLE_UPDATE_ENDED:'variables',VARIABLE_INITIALIZED:'initialized'}};
  window.MikageShrinePanels={open:async which=>test.opens.push(which)};
 },initial);
 await page.addScriptTag({content:art});
 const helper='const StatusbarHTML='+JSON.stringify(html)+';'+host;
 await page.evaluate(helper=>{
  const f=document.createElement('iframe');f.id='helper';f.style.display='none';f.setAttribute('sandbox','allow-scripts allow-same-origin');
  const shims='const getChatMessages=(...a)=>parent.getChatMessages(...a),getLastMessageId=()=>parent.getLastMessageId(),eventOn=(...a)=>parent.eventOn(...a),tavern_events=parent.tavern_events,Mvu=parent.Mvu;';
  f.srcdoc='<script>'+shims+helper.replaceAll('</script','<\\/script')+'</script>';document.body.append(f);
 },helper);
 await page.waitForFunction(()=>document.querySelector('[data-mikage-status-host] iframe')?.contentWindow?.MikagePresentation);
 let frame=page.frames().find(f=>f!==page.mainFrame()&&f.name()!=='helper'&&f.url()==='about:srcdoc'&&f.parentFrame()===page.mainFrame());
 // Find by actual DOM rather than iframe creation order.
 frame=await (await page.$('[data-mikage-status-host] iframe')).contentFrame();
 await frame.waitForFunction(()=>document.getElementById('vn-speaker').textContent==='巴卫');
 assert.equal(await frame.locator('#vn-preview').textContent(),'“有话就说，杵在那儿做什么。”');
 assert.equal(await frame.locator('#vn-dialogue').getAttribute('data-portrait'),'true');
 await frame.locator('#vn-toggle').click();assert.equal(await frame.locator('#vn-toggle').getAttribute('aria-expanded'),'true');
 assert(!(await frame.locator('#vn-full').textContent()).includes('内部更新'));
 await frame.locator('#vn-toggle').click();
 await frame.locator('#vn-records').evaluate(n=>{n.open=true;});
 await frame.waitForFunction(()=>document.getElementById('shrine-game').getBoundingClientRect().height<=window.frameElement.clientHeight);
 await frame.locator('#vn-records').evaluate(n=>{n.open=false;});
 for(const width of [320,375,760]){
  await page.setViewportSize({width,height:1100});
  await frame.waitForFunction(()=>document.getElementById('scene').dataset.period);
  await frame.evaluate(async()=>{await window.MikageCharacterArt.installFont(document);await document.fonts.ready;});
  await frame.locator('#vn-portrait-image').evaluate(img=>img.complete?null:new Promise(resolve=>{img.addEventListener('load',resolve,{once:true});img.addEventListener('error',resolve,{once:true});}));
  const layout=await frame.evaluate(()=>({body:document.body.scrollWidth,width:innerWidth,portrait:document.getElementById('vn-portrait').hidden,nav:[...document.querySelectorAll('.dock-button')].map(n=>({width:n.getBoundingClientRect().width,top:n.getBoundingClientRect().top})),height:document.getElementById('shrine-game').getBoundingClientRect().height}));
  assert(layout.body<=layout.width+1,JSON.stringify(layout));assert(layout.nav.every(n=>n.width>=44),JSON.stringify(layout));assert.equal(new Set(layout.nav.map(n=>Math.round(n.top))).size,1);
  if(shot){await mkdir(shot,{recursive:true});await page.locator('[data-mikage-status-host]').screenshot({path:shot+'/scene-'+width+'.png'});}
 }
 await frame.locator('#map').click();await page.waitForFunction(()=>test.opens.includes('map'));
 await frame.locator('#vn-portrait-image').evaluate(img=>img.dispatchEvent(new Event('error')));
 assert.equal(await frame.locator('#vn-dialogue').getAttribute('data-portrait'),'false');
 assert((await frame.locator('#vn-preview').textContent()).includes('有话就说'));
 // Same-floor edit refresh; data arrival, location transition, long prose and no view reset.
 await frame.locator('#vn-toggle').click();
 await page.evaluate(()=>{test.texts[0]='正文'.repeat(3000)+'<MikageTaskArchive>内部档案</MikageTaskArchive><StatusPlaceHolderImpl/>';test.initial.环境.地点='御影神社·庭院';for(const fn of test.listeners.variables||[])fn();});
 await frame.waitForFunction(()=>document.getElementById('vn-full').textContent.length===6000);
 assert.equal(await frame.evaluate(()=>MikagePresentation.inspect().transition),true);
 if(shot){
  await frame.evaluate(()=>document.getElementById('vn-transition').getAnimations().forEach(a=>{a.pause();a.currentTime=600;}));
  await page.screenshot({path:shot+'/location-transition.png',clip:await frame.locator('#scene').boundingBox()});
 }
 assert.equal(await frame.locator('#vn-full').isVisible(),true);
 assert.equal(await frame.locator('#vn-dialogue').getAttribute('data-portrait'),'false');
 assert.equal(await frame.locator('#vn-speaker').textContent(),'本轮正文');
 assert.equal(await frame.locator('#vn-full script').count(),0);
 // Switch to page 1: a real selected-swipe API response has no .message field.
 await page.evaluate(()=>{test.swipe=1;for(const fn of [...(test.listeners.swiped||[])])fn();});
 await page.waitForFunction(()=>document.querySelector('[data-mikage-status-host] iframe')?.contentWindow?.MikageStatusBridge?.swipeId===1);
 frame=await (await page.$('[data-mikage-status-host] iframe')).contentFrame();
 await frame.waitForFunction(()=>document.getElementById('vn-preview').textContent.includes('我今天想在神社休息'));
 assert.equal(await frame.locator('#vn-full').isVisible(),false);
 assert.equal(await frame.locator('#vn-speaker').textContent(),'本轮正文');
 assert((await frame.locator('#clock').textContent()).includes('黄昏'));
 assert.equal(await frame.evaluate(()=>MikageStatusBridge.messageId),1);
 // Missing narrative API, stale response, no cross-scope content and no lingering transitions.
 await page.emulateMedia({reducedMotion:'reduce'});
 await frame.evaluate(()=>{window.testOldBridge=window.MikageStatusBridge;window.MikagePresentation.connect({messageId:99,swipeId:0,chatEpoch:2,resize(){},getNarrative:async()=>({status:'stale',text:'OLD SECRET'})});window.MikagePresentation.render({环境:{地点:'远处'},地图:{当前地区:'R03'}});});
 await frame.waitForFunction(()=>document.getElementById('vn-preview').textContent.includes('过期'));
 assert(!(await frame.locator('#vn-full').textContent()).includes('OLD SECRET'));
 assert.equal(await frame.locator('#vn-transition').isVisible(),false);
 // An old asynchronous read is fenced when the scope changes.
 await frame.evaluate(()=>{
  MikagePresentation.connect({messageId:7,chatEpoch:3,getNarrative:()=>new Promise(resolve=>{window.lateNarrative=resolve;})});
  MikagePresentation.render(null);
  MikagePresentation.connect({messageId:8,chatEpoch:3,getNarrative:async()=>({status:'ready',text:'新页正文'})});
  MikagePresentation.render(null);
  window.lateNarrative({status:'ready',text:'迟到的旧页正文'});
 });
 await frame.waitForFunction(()=>document.getElementById('vn-preview').textContent==='新页正文');
 assert.equal(await frame.locator('#vn-full').textContent(),'新页正文');
 await frame.evaluate(()=>MikagePresentation.dispose());assert.equal(await frame.evaluate(()=>MikagePresentation.inspect().disposed),true);
 await page.evaluate(()=>MikageStatusbars.dispose());assert.equal(await page.locator('[data-mikage-status-host]').count(),0);
 assert.deepEqual(errors,[]);
 if(shot)await writeFile(shot+'/browser-evidence.json',JSON.stringify({viewports:[320,375,760],source:'actual built scene host and srcdoc, same-origin helper iframe and host-created child iframe',missingAssets:[...missing],errors,realHost:false},null,2));
 console.log('PASS actual built host/srcdoc: 320/375/760 reflow, six 44px targets, exact floor/swipe, prose edit, long text, co-location, control filtering, original navigation, stale scope, reduced motion and disposal; no real API calls. Missing assets: '+missing.size);
}finally{await browser.close();}
