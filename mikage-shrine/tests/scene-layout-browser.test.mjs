import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {sceneFixture} from './scene-layout-fixture.mjs';
const f=await sceneFixture();const {page,errors,missing}=f;let frame=f.frame;
const evidence={viewports:[],regions:[],paidModelCalls:0,realHost:false,source:'actual scene host/srcdoc, helper iframe and synthetic message/MVU data'};
const emit=()=>page.evaluate(()=>{for(const fn of test.listeners.variables||[])fn();});
try{
 const original=await page.locator('#normal-prose').evaluate(n=>({html:n.outerHTML,ref:!!(window.originalProseNode=n)}));
 assert.equal(await frame.locator('#vn-dialogue,#vn-preview,#vn-full,#vn-toggle').count(),0);
 assert.equal(await frame.evaluate(()=>typeof MikageStatusBridge.getNarrative),'undefined');
 assert(!(await frame.locator('body').textContent()).includes(f.prose));
 for(const width of [320,375,760])for(const height of [520,1100]){
  await page.setViewportSize({width,height});
  await frame.waitForFunction(()=>document.getElementById('scene-portrait').dataset.loaded==='true'&&document.getElementById('scene-portrait-image').naturalWidth>0);
  await frame.locator('#scene-portrait-image').evaluate(n=>n.decode());
  const layout=await frame.evaluate(()=>({width:innerWidth,body:document.body.scrollWidth,root:document.getElementById('shrine-game').getBoundingClientRect().height,scene:document.getElementById('scene').getBoundingClientRect().toJSON(),portrait:document.getElementById('scene-portrait').getBoundingClientRect().toJSON(),pointer:getComputedStyle(document.getElementById('scene-portrait')).pointerEvents,buttons:[...document.querySelectorAll('.dock-button')].map(n=>n.getBoundingClientRect().width)}));
  assert(layout.body<=layout.width+1);assert.equal(layout.pointer,'none');assert(layout.buttons.every(w=>w>=44));
  assert(layout.portrait.left>=layout.scene.left&&layout.portrait.right<=layout.scene.right+1);
  assert(layout.portrait.top>=layout.scene.top&&layout.portrait.bottom<=layout.scene.bottom+1);
  const order=await page.evaluate(()=>{const a=document.getElementById('normal-prose'),b=document.querySelector('[data-mikage-status-host]');return{same:a===originalProseNode,html:a.outerHTML,before:!!(a.compareDocumentPosition(b)&Node.DOCUMENT_POSITION_FOLLOWING)};});
  assert(order.same&&order.before);assert.equal(order.html,original.html);
  evidence.viewports.push({width,height,cardHeight:layout.root});
  if(process.env.MIKAGE_SCREENSHOT_DIR&&height===1100){await mkdir(process.env.MIKAGE_SCREENSHOT_DIR,{recursive:true});await page.screenshot({path:process.env.MIKAGE_SCREENSHOT_DIR+'/whole-message-'+width+'.png',fullPage:true});}
 }
 await page.setViewportSize({width:375,height:1100});
 for(let i=1;i<=10;i++){
  const id='R'+String(i).padStart(2,'0');
  await page.evaluate(id=>{test.initial.地图.当前地区=id;test.initial.地图.开放地区=Array.from({length:10},(_,i)=>({编号:'R'+String(i+1).padStart(2,'0'),名称:'示例地区'}));},id);await emit();
  await frame.waitForFunction(id=>document.getElementById('region-art').dataset.region===id,id);
  await frame.evaluate(()=>MikagePresentation.render(parent.test.initial));
  const hits=await frame.evaluate(()=>{
   const p=document.getElementById('scene-portrait');const nodes=[...document.querySelectorAll('#region-hotspots button,#tomoe-actor')].filter(n=>n.getClientRects().length&&!n.hidden);
   const hit=()=>nodes.map(n=>{const r=n.getBoundingClientRect(),el=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return el?.closest('button')?.outerHTML.slice(0,130)||el?.tagName;});
   const visible=hit();p.hidden=true;const without=hit();p.hidden=false;return{visible,without,count:nodes.length};
  });assert.deepEqual(hits.visible,hits.without,'portrait may not change hotspot hit targets '+id);assert(hits.count>0);evidence.regions.push({id,targets:hits.count});
 }
 // Return to original state; verify outfit/position truth comes from this floor.
 await page.evaluate(initial=>{test.initial=structuredClone(initial);test.initial.巴卫.服装='school';},f.initial);await emit();
 await frame.waitForFunction(()=>document.getElementById('scene-portrait').dataset.loaded==='true');
 assert.equal(await frame.locator('#scene-portrait-image').getAttribute('src'),await frame.evaluate(()=>MikageCharacterArt.portrait('tomoe','school')));
 await page.evaluate(()=>test.initial.巴卫.位置='远处');await emit();await frame.waitForFunction(()=>document.getElementById('scene-portrait').hidden);
 await page.evaluate(()=>test.initial.巴卫.位置='回廊');await emit();await frame.waitForFunction(()=>!document.getElementById('scene-portrait').hidden);
 await frame.locator('#map').click();await page.waitForFunction(()=>test.opens.includes('map'));
 await frame.locator('#scene-portrait-image').evaluate(n=>n.dispatchEvent(new Event('error')));assert(await frame.locator('#scene-portrait').isHidden());
 await page.evaluate(()=>{test.swipe=1;for(const fn of test.listeners.swiped||[])fn();});
 await page.waitForFunction(()=>document.querySelector('[data-mikage-status-host] iframe')?.contentWindow?.MikageStatusBridge?.swipeId===1);
 frame=await f.getFrame();await frame.waitForFunction(()=>document.getElementById('clock').textContent.includes('黄昏'));
 assert.equal(await frame.evaluate(()=>MikageStatusBridge.messageId),1);
 await page.emulateMedia({reducedMotion:'reduce'});await frame.evaluate(()=>MikagePresentation.render({环境:{地点:'远方',时段:'夜晚'},地图:{当前地区:'R03'}}));assert(await frame.locator('#vn-transition').isHidden());assert(await frame.locator('#scene-portrait').isHidden());
 await page.evaluate(()=>MikageStatusbars.dispose());assert.equal(await page.locator('[data-mikage-status-host]').count(),0);
 assert.equal(await page.evaluate(()=>test.calls),0);assert.deepEqual(errors,[]);assert.equal(missing.size,0,[...missing].join('\n'));
 if(process.env.MIKAGE_SCREENSHOT_DIR)await writeFile(process.env.MIKAGE_SCREENSHOT_DIR+'/browser-evidence.json',JSON.stringify({...evidence,errors,missing:[...missing]},null,2));
 console.log('PASS whole-message/foreground scene: prose DOM preserved once, no narrative getter,6viewport pairs,10regions hit targets unchanged,44px nav,current outfit/co-location,image error,scope/swipe,reduced motion,cleanup and0model calls.');
}finally{await f.close();}
