import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {sceneFixture} from './scene-layout-fixture.mjs';
const spec=JSON.parse((await readFile(new URL('../releases/1.49.36/statusbar.html',import.meta.url),'utf8')).match(/const SCENE_PORTRAIT_FRAMING=(.*);\n/)[1]);
const f=await sceneFixture({width:375,height:1100},'1.49.36');const {page,frame}=f;
const near=(a,b,msg)=>assert(Math.abs(a-b)<.002,msg+': '+a+' vs '+b);
const evidence={release:'1.49.36',widths:[320,375,760],adultCount:16,smallCount:1,cases:[],source:'actual scene host/srcdoc with synthetic floor data',realHost:false,paidModelCalls:0};
try{
 for(const width of evidence.widths){
  await page.setViewportSize({width,height:1100});
  let cardHeight;
  for(const [id,rec] of Object.entries(spec.outfits)){
   await page.evaluate(id=>{test.initial.巴卫.服装=id;for(const fn of test.listeners.variables||[])fn();},id);
   await frame.waitForFunction(({id,url})=>{const p=document.getElementById('scene-portrait'),im=document.getElementById('scene-portrait-image');return p.dataset.outfit===id&&p.dataset.loaded==='true'&&!p.hidden&&im.src===url&&im.complete;},{id,url:rec.source.url});
   await frame.locator('#scene-portrait-image').evaluate(n=>n.decode());
   const got=await frame.evaluate(rec=>{const box=document.getElementById('scene-portrait').getBoundingClientRect(),im=document.getElementById('scene-portrait-image').getBoundingClientRect(),s=im.width/rec.width;return{box:box.toJSON(),im:im.toJSON(),scale:s,eyeX:rec.eye?(im.x+rec.eye[0]*s-box.x)/box.width:null,eyeY:rec.eye?(im.y+rec.eye[1]*s-box.y)/box.height:null,chinSpan:rec.eye?(rec.chin-rec.eye[1])*s/box.height:null,visible:rec.bounds?{left:im.x+rec.bounds[0]*s-box.x,top:im.y+rec.bounds[1]*s-box.y,right:im.x+rec.bounds[2]*s-box.x,bottom:im.y+rec.bounds[3]*s-box.y}:null,cardHeight:document.getElementById('shrine-game').getBoundingClientRect().height};},rec);
   if(rec.mode==='adult'){near(got.eyeX,spec.target.adult.eyeX,id+' eyeX');near(got.eyeY,spec.target.adult.eyeY,id+' eyeY');near(got.chinSpan,spec.target.adult.chinSpan,id+' face scale');}
   else{assert(got.visible.left>=-1&&got.visible.top>=-1&&got.visible.right<=got.box.width+1&&got.visible.bottom<=got.box.height+1);assert(got.visible.bottom-got.visible.top<=got.box.height*.721);near(got.visible.bottom/got.box.height,spec.target.small.baseline,'child baseline');}
   const b=rec.visibleBounds,ss=got.scale,bb={left:got.im.x+b[0]*ss,top:got.im.y+b[1]*ss,right:got.im.x+b[2]*ss};
   assert(bb.left>=got.box.x-.2&&bb.right<=got.box.right+.2&&bb.top>=got.box.y-.2,id+' head and lateral silhouette must fit; only bottom may clip');
   if(cardHeight===undefined)cardHeight=got.cardHeight;assert(Math.abs(cardHeight-got.cardHeight)<1,'outfits must not move card/menu layout');
   evidence.cases.push({width,id,mode:rec.mode,eyeX:got.eyeX,eyeY:got.eyeY,chinSpan:got.chinSpan,smallBounds:got.visible});
   if(process.env.MIKAGE_SCREENSHOT_DIR){const dir=process.env.MIKAGE_SCREENSHOT_DIR+'/'+width;await mkdir(dir,{recursive:true});await frame.locator('#scene').screenshot({path:dir+'/'+id+'.png'});}
  }
 }
 // Passive hotspot labels must not cover the bust; explicit hover/focus still reveals them.
 await page.mouse.move(0,0);
 const spot=frame.locator('.region-hotspot.is-near').first();
 assert(await spot.count());
 assert.equal(await spot.locator('.spot-label').evaluate(n=>getComputedStyle(n).visibility),'hidden');
 await spot.hover();assert.equal(await spot.locator('.spot-label').evaluate(n=>getComputedStyle(n).visibility),'visible');
 await page.mouse.move(0,0);await spot.focus();assert.equal(await spot.locator('.spot-label').evaluate(n=>getComputedStyle(n).visibility),'visible');
 await spot.evaluate(n=>n.blur());
 // Unknown outfit data uses the default registered art, and image failure stays unobtrusive.
 await frame.evaluate(initial=>{MikagePresentation.render({...initial,巴卫:{...initial.巴卫,服装:'unknown'}});},f.initial);
 assert.equal(await frame.locator('#scene-portrait').getAttribute('data-outfit'),'usual');
 await frame.locator('#scene-portrait-image').evaluate(n=>n.dispatchEvent(new Event('error')));assert(await frame.locator('#scene-portrait').isHidden());
 await page.evaluate(()=>MikageStatusbars.dispose());assert.equal(await page.locator('[data-mikage-status-host]').count(),0);
 assert.equal(await page.evaluate(()=>test.calls),0);assert.deepEqual(f.errors,[]);assert.equal(f.missing.size,0,[...f.missing].join('\n'));
 if(process.env.MIKAGE_SCREENSHOT_DIR)await writeFile(process.env.MIKAGE_SCREENSHOT_DIR+'/browser-evidence.json',JSON.stringify({...evidence,errors:f.errors,missing:[...f.missing]},null,2));
 console.log('PASS17outfits x3widths:48adult fixed face registrations and full lateral/head containment,3small-body bounds; card/menu stable,default fallback,error and cleanup;0model calls.');
}finally{await f.close();}
