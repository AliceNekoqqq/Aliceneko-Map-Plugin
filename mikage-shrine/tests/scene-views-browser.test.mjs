import assert from 'node:assert/strict';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {sceneFixture} from './scene-layout-fixture.mjs';
const spec=JSON.parse(await readFile(new URL('../src/scene-portrait-framing.json',import.meta.url)));
const f=await sceneFixture({width:375,height:1100},'1.49.37');let {frame}=f;const {page}=f;
const emit=()=>page.evaluate(()=>{for(const fn of test.listeners.variables||[])fn();});
const portrait=async()=>{await frame.locator('#scene-portrait-view').click();await frame.waitForFunction(()=>document.getElementById('scene-portrait').dataset.loaded==='true');await frame.locator('#scene-portrait-image').evaluate(n=>n.decode());};
const walk=()=>frame.locator('#scene-walk-view').click();
const evidence={release:'1.49.37',viewports:[],outfits:[],regions:[],paidModelCalls:0,realHost:false};
try{
 const prose=await page.locator('#normal-prose').evaluate(n=>({html:n.outerHTML,ref:!!(window.keptProse=n)}));
 assert(await frame.locator('#scene').isVisible());assert(await frame.locator('#portrait-view').isHidden());assert.equal(await frame.locator('#scene-portrait-image').getAttribute('src'),null,'default map does not download large portrait');assert.equal(await frame.locator('#scene #scene-portrait').count(),0);
 for(const width of [320,375,760]){
  for(const height of [520,1100]){
   await page.setViewportSize({width,height});await walk();
   const before=await frame.locator('.scene-dock').boundingBox();await portrait();
   assert(await frame.locator('#scene').isHidden());assert(await frame.locator('#walk-zone').isHidden());assert(await frame.locator('#portrait-view').isVisible());
   const after=await frame.locator('.scene-dock').boundingBox();assert(Math.abs(before.y-after.y)<1,'shared nav stays at same height');
   const layout=await frame.evaluate(()=>({overflow:document.body.scrollWidth>innerWidth+1,buttons:[...document.querySelectorAll('.scene-view-switch button,#scene-return')].map(n=>n.getBoundingClientRect().height)}));assert(!layout.overflow);assert(layout.buttons.every(h=>h>=44));
   await frame.locator('#scene-return').click();assert(await frame.locator('#scene').isVisible());assert(await frame.locator('#portrait-view').isHidden());evidence.viewports.push({width,height});
  }
  await portrait();
  for(const [id,rec] of Object.entries(spec.outfits)){
   await page.evaluate(id=>{test.initial.巴卫.服装=id;for(const fn of test.listeners.variables||[])fn();},id);
   await frame.waitForFunction(({id,url})=>{const p=document.getElementById('scene-portrait'),im=document.getElementById('scene-portrait-image');return p.dataset.outfit===id&&!p.hidden&&p.dataset.loaded==='true'&&im.src===url&&im.complete;},{id,url:rec.source.url});await frame.locator('#scene-portrait-image').evaluate(n=>n.decode());
   const ok=await frame.evaluate(rec=>{const b=document.getElementById('scene-portrait').getBoundingClientRect(),im=document.getElementById('scene-portrait-image').getBoundingClientRect(),s=im.width/rec.width,bb=rec.visibleBounds;return im.x+bb[0]*s>=b.x-.3&&im.x+bb[2]*s<=b.right+.3&&im.y+bb[1]*s>=b.y-.3;},rec);assert(ok,id+' complete head and sides');evidence.outfits.push({width,id});
   if(process.env.MIKAGE_SCREENSHOT_DIR){const dir=process.env.MIKAGE_SCREENSHOT_DIR+'/'+width;await mkdir(dir,{recursive:true});await frame.locator('#portrait-view').screenshot({path:dir+'/'+id+'.png'});}
  }
 }
 await page.setViewportSize({width:375,height:1100});await walk();
 // Real original movement, using only clicks which hit the actual walk-zone.
 for(let i=1;i<=10;i++){
  const id='R'+String(i).padStart(2,'0');await page.evaluate(id=>test.initial.地图.当前地区=id,id);await emit();await frame.waitForFunction(id=>document.getElementById('region-art').dataset.region===id,id);
  const target=await frame.evaluate(()=>{const sc=document.getElementById('scene'),b=sc.getBoundingClientRect();for(const x of [75,30,60,20,85])for(const y of [85,76,92,65]){const px=b.x+b.width*x/100,py=b.y+b.height*y/100;if(document.elementFromPoint(px,py)?.id==='walk-zone')return{x:b.width*x/100,y:b.height*y/100};}return null;});assert(target,id+' unobscured walking ground');
  const before=await frame.locator('#player-actor').getAttribute('data-x');await frame.locator('#scene').click({position:target});
  await frame.waitForFunction(before=>Math.abs(Number(document.getElementById('player-actor').dataset.x)-Number(before))>.01,before);
  await frame.waitForFunction(()=>!document.getElementById('player-actor').classList.contains('walking'));
  const pos=await frame.locator('#player-actor').evaluate(n=>[n.dataset.x,n.dataset.y]);await portrait();await frame.locator('#scene-return').click();assert.deepEqual(await frame.locator('#player-actor').evaluate(n=>[n.dataset.x,n.dataset.y]),pos,'view switches preserve walk position');evidence.regions.push(id);
 }
 // Hidden map cannot capture focus/clicks, and state refresh keeps selected view.
 await portrait();await emit();assert(await frame.locator('#portrait-view').isVisible());await walk();await emit();assert(await frame.locator('#scene').isVisible());
 await frame.locator('#walk-zone').focus();const beforeY=await frame.locator('#player-actor').getAttribute('data-y');await frame.locator('#walk-zone').press('ArrowUp');await frame.waitForFunction(v=>document.getElementById('player-actor').dataset.y!==v,beforeY);
 await portrait();await page.evaluate(()=>test.initial.巴卫.位置='远处');await emit();assert(await frame.locator('#scene').isVisible());assert(await frame.locator('#scene-portrait-view').isDisabled());await page.evaluate(()=>test.initial.巴卫.位置='回廊');await emit();assert(await frame.locator('#scene').isVisible());await portrait();
 await frame.locator('#scene-portrait-image').evaluate(n=>n.dispatchEvent(new Event('error')));assert(await frame.locator('#scene').isVisible());assert(await frame.locator('#portrait-view').isHidden());
 assert.equal(await page.locator('#normal-prose').evaluate(n=>n.outerHTML),prose.html);assert(await page.locator('#normal-prose').evaluate(n=>n===keptProse));
 await page.evaluate(()=>{test.swipe=1;for(const fn of test.listeners.swiped||[])fn();});await page.waitForFunction(()=>document.querySelector('[data-mikage-status-host] iframe')?.contentWindow?.MikageStatusBridge?.swipeId===1);frame=await f.getFrame();assert(await frame.locator('#scene').isVisible());assert(await frame.locator('#portrait-view').isHidden());
 await page.evaluate(()=>MikageStatusbars.dispose());assert.equal(await page.locator('[data-mikage-status-host]').count(),0);assert.equal(await page.evaluate(()=>test.calls),0);assert.deepEqual(f.errors,[]);assert.equal(f.missing.size,0,[...f.missing].join('\n'));
 if(process.env.MIKAGE_SCREENSHOT_DIR)await writeFile(process.env.MIKAGE_SCREENSHOT_DIR+'/browser-evidence.json',JSON.stringify(evidence,null,2));
 console.log('PASS6viewport pairs,51outfit head/sides cases,10regions actual movement and position retained,keyboard walking,exclusive views,refresh/offsite/error/swipe/cleanup;0model calls.');
}finally{await f.close();}
