const fs=require('node:fs'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const {chromium}=require(process.env.PLAYWRIGHT_PATH||'/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{const b=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||chromium.executablePath(),headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});try{for(const width of[320,375,980]){
 const p=await b.newPage({viewport:{width,height:1000}}),errors=[],requests=[];p.on('pageerror',e=>errors.push(e.message));p.on('request',r=>{if(/^https?:/.test(r.url()))requests.push(r.url())});
 await p.goto(pathToFileURL(process.argv[2]).href);await p.evaluate(()=>preview.ready);await p.evaluate(()=>document.fonts.ready);
 const original=await p.evaluate(()=>preview.read());const before=await p.evaluate(()=>preview.inspect());assert.equal(before.decorations.length,3);
 for(const name of['鸟居','参道','社务所','拜殿','庭院']){
  const a=await p.evaluate(()=>preview.inspect());await p.locator('[data-facility="'+name+'"]').click();const c=await p.evaluate(()=>preview.inspect());
  assert.equal(c.stages[name],4);assert.deepEqual(c.modules.filter(x=>x.owner!==name),a.modules.filter(x=>x.owner!==name));assert.deepEqual(c.decorations,a.decorations);
 }
 assert.deepEqual((await p.evaluate(()=>preview.read())).生活,original.生活);assert.equal((await p.evaluate(()=>preview.read())).神社.木材,original.神社.木材);
 const finished=await p.evaluate(()=>preview.read());await p.click('#period');assert.equal((await p.evaluate(()=>preview.inspect())).period,'傍晚');
 await p.click('#reset');assert.deepEqual(await p.evaluate(()=>preview.read()),original);
 await p.locator('summary').click();for(const n of[2,3]){await p.locator('[data-stage="鸟居"]').selectOption(String(n));assert.equal((await p.evaluate(()=>preview.inspect())).modules.find(x=>x.id==='gate').sprite,'gate');}
 const imported=structuredClone(finished);imported.生活.布置[2].state.lit=true;
 await p.locator('#import').setInputFiles({name:'old-state.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify({stat_data:imported}))});await p.waitForFunction(()=>document.querySelector('#feedback').textContent.includes('已读取旧状态'));
 assert.deepEqual(await p.evaluate(()=>preview.read()),imported);assert.equal((await p.evaluate(()=>preview.inspect())).decorations.find(d=>d.item==='lantern').lit,true);
 await p.locator('#import').setInputFiles({name:'bad.json',mimeType:'application/json',buffer:Buffer.from('{"神社":{"鸟居":5}}')});await p.waitForFunction(()=>document.querySelector('#feedback').textContent.includes('0～4'));assert.deepEqual(await p.evaluate(()=>preview.read()),imported);
 await p.click('#empty');assert.equal((await p.evaluate(()=>preview.inspect())).modules.length,0);await p.locator('[data-facility="鸟居"]').click();assert.equal((await p.evaluate(()=>preview.inspect())).modules.length,1);
 assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 await p.locator('#reset').focus();await p.keyboard.press('Tab');assert.notEqual(await p.evaluate(()=>getComputedStyle(document.activeElement).outlineStyle),'none');
 await p.emulateMedia({reducedMotion:'reduce'});await p.click('#reset');assert.equal(await p.locator('.board').evaluate(e=>getComputedStyle(e).animationName),'none');
 // Exercise the actual renderer subscription and cleanup; do not inspect only the demo UI.
 const life=await p.evaluate(async()=>{let cb,removed=0;const canvas=document.createElement('canvas');const source=document.querySelector('script').textContent;const urls=Array.from(source.matchAll(/data:image\/webp;base64,[A-Za-z0-9+/=]+/g),x=>x[0]);const c=await mount(canvas,{getState:()=>preview.read(),subscribe:f=>{cb=f;return()=>removed++},atlasURL:urls[0],decorURL:urls[1]});const old=c.inspect().stages.鸟居;const state=preview.read();state.神社.鸟居=4;cb(state);const active=c.inspect().stages.鸟居;c.dispose();state.神社.鸟居=0;cb(state);return{old,active,after:c.inspect().stages.鸟居,removed}});
 assert.deepEqual(life,{old:1,active:4,after:4,removed:1});assert.deepEqual(errors,[]);assert.deepEqual(requests,[]);
 await p.screenshot({path:'/tmp/modular-'+width+'.png',fullPage:true});await p.close();console.log('PASS '+width+'px: actual canvas, independent completion, life props, JSON import/rejection, unchanged resources, empty assembly, time, offline/font, overflow/focus/reduced-motion, subscription cleanup');
 }}finally{await b.close()}})().catch(e=>{console.error(e);process.exitCode=1});
