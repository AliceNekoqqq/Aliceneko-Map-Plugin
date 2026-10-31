import assert from 'node:assert/strict';
import {writeFile,mkdir} from 'node:fs/promises';
import {sceneFixture} from './scene-layout-fixture.mjs';
const release=process.env.MIKAGE_FIX_RELEASE||'1.49.38';
const f=await sceneFixture({width:375,height:1100},release);const {page,frame}=f;
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const actors=()=>frame.evaluate(()=>Object.fromEntries(['player','tomoe'].map(k=>{const n=document.getElementById(k+'-actor');return[k,[n.dataset.x,n.dataset.y]];})));
const show=async()=>{await frame.locator('#scene-portrait-view').click();await frame.waitForFunction(()=>document.getElementById('scene-portrait').dataset.loaded==='true');};
const emit=()=>page.evaluate(()=>{for(const fn of test.listeners.variables||[])fn();});
const evidence={release,source:'actual scene host/srcdoc and original walking engine; synthetic floor data',checks:[],paidModelCalls:0,realHost:false};
try{
 const b=await frame.locator('#scene').boundingBox();await frame.locator('#scene').click({position:{x:b.width*.8,y:b.height*.92}});await frame.waitForFunction(()=>document.getElementById('player-actor').classList.contains('walking'));
 await show();const paused=await actors();await wait(1300);assert.deepEqual(await actors(),paused,'both actors must stay paused in portrait view');await emit();await wait(300);assert.deepEqual(await actors(),paused,'refresh must not resume hidden map');
 await page.emulateMedia({reducedMotion:'reduce'});await wait(100);assert.deepEqual(await actors(),paused,'media change must not resume hidden map');await page.emulateMedia({reducedMotion:'no-preference'});
 await frame.locator('#scene-return').click();await frame.waitForFunction(pos=>document.getElementById('player-actor').dataset.x!==pos[0],paused.player);await frame.waitForFunction(()=>!document.getElementById('player-actor').classList.contains('walking'));
 evidence.checks.push({id:'pause-resume-both-actors',paused,after:await actors()});
 const ema=frame.locator('.region-hotspot').filter({has:frame.locator('.spot-label',{hasText:'绘马'})});await ema.click();await show();const pendingPos=await actors();await wait(3000);assert.deepEqual(await actors(),pendingPos);assert.deepEqual(await page.evaluate(()=>test.opens),[],'arrival action must stay pending while portrait is visible');
 await frame.locator('#scene-return').click();await page.waitForFunction(()=>test.opens.includes('board'));assert.equal(await page.evaluate(()=>test.opens.filter(x=>x==='board').length),1);await show();await frame.locator('#scene-return').click();await wait(100);assert.equal(await page.evaluate(()=>test.opens.filter(x=>x==='board').length),1,'arrival executes only once');evidence.checks.push({id:'arrival-once-after-resume'});
 if(!process.env.MIKAGE_FIX_LIFECYCLE_ONLY){
  // A failed image can be retried directly; unrelated state refresh never spends a retry.
  const school=await page.evaluate(()=>MikageCharacterArt.portrait('tomoe','school'));let requests=0;
  page.on('request',r=>{if(r.url()===school)requests++;});const abort=route=>route.abort('failed');await f.context.route(school,abort);
  await page.evaluate(()=>test.initial.巴卫.服装='school');await emit();await frame.locator('#scene-portrait-view').click();await frame.waitForFunction(()=>document.getElementById('scene-view-status').textContent.includes('加载失败'));
  assert(await frame.locator('#scene-portrait-view').isEnabled());assert(await frame.locator('#scene-portrait-retry').isVisible());assert(await frame.locator('#scene').isVisible());assert.equal(requests,1);
  await emit();await wait(150);assert.equal(requests,1,'no automatic retry on state refresh');assert((await frame.locator('#scene-view-status').textContent()).includes('加载失败'));
  await frame.locator('#scene-portrait-retry').click();await frame.waitForFunction(()=>!document.getElementById('scene-view-notice').hidden);assert.equal(requests,2);
  await f.context.unroute(school,abort);await frame.locator('#scene-portrait-retry').focus();await frame.locator('#scene-portrait-retry').press('Enter');await frame.waitForFunction(()=>document.getElementById('scene-portrait').dataset.loaded==='true');assert.equal(requests,3);assert(await frame.locator('#portrait-view').isVisible());assert(await frame.locator('#scene-view-notice').isHidden());assert.equal(await frame.evaluate(()=>document.activeElement.id),'scene-portrait-view');evidence.checks.push({id:'direct-image-retry',requests,automaticRetries:0});
  await frame.locator('#scene-return').focus();await page.evaluate(()=>test.initial.巴卫.位置='远处');await emit();await frame.waitForFunction(()=>document.getElementById('scene-portrait-view').disabled);assert(await frame.locator('#scene').isVisible());assert(await frame.locator('#scene-portrait-view').isDisabled());assert((await frame.locator('#scene-view-status').textContent()).includes('不在此处'));assert(await frame.locator('#scene-portrait-retry').isHidden());assert.equal(await frame.evaluate(()=>document.activeElement.id),'scene-walk-view');
  await page.evaluate(()=>test.initial.巴卫.位置='回廊');await emit();await frame.waitForFunction(()=>!document.getElementById('scene-portrait-view').disabled);assert(await frame.locator('#scene-view-notice').isHidden());assert(await frame.locator('#scene').isVisible());evidence.checks.push({id:'visible-offsite-state-and-focus'});
  // An old image may finish after returning to the map and changing outfit dimensions.
  const wedding=await page.evaluate(()=>MikageCharacterArt.portrait('tomoe','wedding'));let releaseImage;const gate=new Promise(r=>releaseImage=r);
  const hold=async route=>{await gate;await route.fallback();};await f.context.route(wedding,hold);
  await page.evaluate(()=>test.initial.巴卫.服装='wedding');await emit();await frame.locator('#scene-portrait-view').click();await frame.waitForFunction(()=>document.getElementById('portrait-view').getAttribute('aria-busy')==='true');
  await frame.locator('#scene-return').click();await page.evaluate(()=>test.initial.巴卫.服装='aoba');await emit();await frame.waitForFunction(()=>document.getElementById('scene-portrait').dataset.outfit==='aoba');releaseImage();await frame.waitForFunction(()=>document.getElementById('scene-portrait-image').complete);assert(await frame.locator('#scene').isVisible());assert(await frame.locator('#scene-view-notice').isHidden());await show();assert.equal(await frame.locator('#scene-portrait-image').evaluate(n=>n.naturalWidth),576);await f.context.unroute(wedding,hold);evidence.checks.push({id:'late-load-validates-requested-not-current-outfit'});
  for(const [id,name] of [['R02','宇庭高校'],['R09','出云大社']]){await frame.locator('#scene-return').click();await page.evaluate(({id,name})=>{test.initial.地图.当前地区=id;test.initial.环境.地点=name;test.initial.巴卫.位置=name;},{id,name});await emit();await frame.waitForFunction(id=>document.getElementById('region-art').dataset.region===id,id);assert.equal(await frame.locator('#scene-walk-view').textContent(),'场景漫步');assert.equal(await frame.locator('#scene-plaque').textContent(),name);await show();assert.equal(await frame.locator('#scene-return').textContent(),'返回场景');assert(await frame.locator('#scene-return').isVisible());}evidence.checks.push({id:'cross-region-labels',regions:['R02','R09']});
  for(const width of [320,375,760]){await page.setViewportSize({width,height:960});await frame.locator('#scene-portrait-image').evaluate(n=>n.dispatchEvent(new Event('error')));const layout=await frame.evaluate(()=>({overflow:document.body.scrollWidth>innerWidth+1,height:document.getElementById('scene-portrait-retry').getBoundingClientRect().height}));assert(!layout.overflow&&layout.height>=44);await frame.locator('#scene-portrait-retry').click();await frame.waitForFunction(()=>document.getElementById('scene-portrait').dataset.loaded==='true');}evidence.checks.push({id:'retry-layout-three-widths',widths:[320,375,760]});

 }
 assert.equal(await page.evaluate(()=>test.calls),0);assert.deepEqual(f.errors,[]);assert.equal(f.missing.size,0,[...f.missing].join('\n'));
 await page.evaluate(()=>MikageStatusbars.dispose());assert.equal(await page.locator('[data-mikage-status-host]').count(),0);
 if(process.env.MIKAGE_SCREENSHOT_DIR){await mkdir(process.env.MIKAGE_SCREENSHOT_DIR,{recursive:true});await writeFile(process.env.MIKAGE_SCREENSHOT_DIR+'/interaction-evidence.json',JSON.stringify(evidence,null,2));}
 console.log('PASS scene interaction '+JSON.stringify(evidence));
}finally{await f.close();}
