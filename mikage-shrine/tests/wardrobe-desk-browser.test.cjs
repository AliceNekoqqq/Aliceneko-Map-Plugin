const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require('/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const {fixture:base}=require('./map-desk-browser.test.cjs');
const html=fs.readFileSync(path.resolve(__dirname,'../releases/1.46.0/wardrobe-panel.html'),'utf8');
async function fixture(b,width,options={}){const result=await base(b,width,{...options,html});const {p}=result;
 await p.evaluate(()=>{
 uiState.玩家.衣装='daily';uiState.巴卫.服装='usual';
 uiState.衣橱.已解锁=[{角色:'tomoe',衣装:'school'},{角色:'tomoe',衣装:'school-human'}];
 const previous=ShrineUIBridge.act;ShrineUIBridge.act=async(type,payload)=>{
 if(!['setOutfit','nameOutfit'].includes(type))return previous(type,payload);
 calls.push({type,payload});if(window.robeWait)await robeWait;if(window.robeFail)throw Error('衣装未保存，请重试。');
 if(type==='setOutfit'){if(payload.actor==='tomoe')uiState.巴卫.服装=payload.outfit;else uiState.玩家.衣装=payload.outfit;}
 if(type==='nameOutfit'){uiState.衣装记忆||={};const key=payload.actor+':'+(payload.actor==='tomoe'&&payload.outfit==='school-human'?'school':payload.outfit);uiState.衣装记忆[key]={name:payload.name,moments:[]};}
 return{ok:true,snapshot:structuredClone(uiState)};
 };refresh(structuredClone(uiState));ShrinePanel.openWardrobe();
 });await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(200);return result;
}
async function run(){const b=await chromium.launch({executablePath:'/tmp/chromium-full',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});try{for(const width of [375,320,1000]){
 const {p,errors}=await fixture(b,width);const before=await p.evaluate(()=>JSON.stringify(uiState));
 assert(await p.locator('#wardrobe-options button').count()>5);
 await p.locator('[data-robe-toy=sachet]').click();assert(await p.evaluate(()=>MikageWardrobeDesk.inspect().particles)>0);
 await p.locator('[data-robe-toy=shine]').click();assert(await p.locator('.wardrobe-portrait').evaluate(e=>e.getAnimations().length)>0);
 await p.locator('.wardrobe-direction[data-direction=back]').click();assert.equal(await p.locator('[data-art=wardrobe-mini]').getAttribute('data-direction'),'back');
 await p.locator('[data-robe-toy=walk]').click();await p.waitForFunction(()=>MikageWardrobeDesk.inspect().walking);await p.waitForFunction(()=>['1','3'].includes(document.querySelector('[data-art=wardrobe-mini]').dataset.walkFrame));await p.locator('[data-robe-toy=walk]').click();
 assert.equal(await p.evaluate(()=>JSON.stringify(uiState)),before,'cosmetic controls never write game data');
 const locked=p.locator('.outfit-choice.is-locked').first();const lockedId=await locked.getAttribute('data-outfit-id');await locked.click();assert.equal(await p.locator('#wardrobe-look-state').textContent(),'仅供预览');assert.equal(await p.evaluate(()=>calls.filter(x=>x.type==='setOutfit').length),0);
 await p.evaluate(()=>refresh(structuredClone(uiState)));assert.equal(await p.locator('.outfit-choice.is-previewing').getAttribute('data-outfit-id'),lockedId);
 await p.locator('[data-wardrobe-actor=tomoe]').click();const choices=await p.locator('.outfit-choice:not(.is-locked):not(.is-worn)').all();assert(choices.length);
 const selected=choices[0],id=await selected.getAttribute('data-outfit-id');await p.evaluate(()=>{window.robeWait=new Promise(r=>window.releaseRobe=r)});await selected.click();
 assert.equal(await p.locator('#wardrobe-dialog').getAttribute('aria-busy'),'true');assert(await p.locator('#wardrobe-options button').first().isDisabled());
 await p.locator('#wardrobe-options button').first().evaluate(e=>e.click());assert.equal(await p.evaluate(()=>calls.filter(x=>x.type==='setOutfit').length),1);
 await p.evaluate(()=>releaseRobe());await p.waitForTimeout(100);assert.equal(await p.evaluate(()=>uiState.巴卫.服装),id);assert.equal(await p.locator('[data-art=portrait]').getAttribute('data-outfit'),id);
 await p.evaluate(()=>{robeWait=null;robeFail=true});const retry=p.locator('.outfit-choice:not(.is-locked):not(.is-worn)').first();await retry.click();await p.waitForTimeout(100);assert.equal(await p.locator('#robe-desk-status').getAttribute('data-state'),'error');assert.equal(await p.evaluate(()=>uiState.巴卫.服装),id);assert(await p.locator('#wardrobe-options button').first().isEnabled());await p.evaluate(()=>robeFail=false);
 await p.locator('[data-outfit-id=school]').click();await p.getByRole('button',{name:'切换人间伪装',exact:true}).click();assert.equal(await p.evaluate(()=>uiState.巴卫.服装),'school-human');assert.equal(await p.locator('[data-art=portrait]').getAttribute('data-outfit'),'school-human');
 const input=p.getByRole('textbox',{name:'衣装纪念名，最多24字'});await input.fill('<img src=x onerror=1>');await p.getByRole('button',{name:'保存纪念名',exact:true}).click();assert.equal(await p.locator('.wardrobe-memories img').count(),0);assert.equal(await p.locator('.outfit-memory-name').textContent(),'<img src=x onerror=1>');
 await p.screenshot({path:'/tmp/wardrobe-desk-'+width+'.png',fullPage:true});assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'no horizontal overflow');
 await p.emulateMedia({reducedMotion:'reduce'});await p.locator('[data-robe-toy=shine]').click();assert.equal(await p.evaluate(()=>MikageWardrobeDesk.inspect().particles),0);await p.locator('[data-robe-toy=walk]').click();assert.equal(await p.evaluate(()=>MikageWardrobeDesk.inspect().walking),false);
 await p.locator('[data-wardrobe-actor=player]').focus();await p.keyboard.press('Tab');assert.notEqual(await p.evaluate(()=>getComputedStyle(document.activeElement).outlineStyle),'none');
 await p.evaluate(()=>ShrinePanel.openBoard());assert.equal(await p.evaluate(()=>MikageWardrobeDesk.inspect().animations),0);assert.equal(await p.evaluate(()=>MikageWardrobeDesk.inspect().walking),false);await p.evaluate(()=>ShrinePanel.dispose());assert.equal(await p.evaluate(()=>!!window.MikageWardrobeDesk),false);assert.deepEqual(errors,[]);await p.close();
 console.log('PASS',width,'painted wardrobe, toys, directions/walk, lock-only preview, pending/dedup, retry, school variant, inert memory text, reduced motion, cleanup');
 }}finally{await b.close();}}
module.exports={fixture,run};if(require.main===module)run().catch(e=>{console.error(e);process.exitCode=1});
