const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require('/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const {C,state}=require('./moonforest-shop.test.cjs');
const root=path.resolve(__dirname,'..'),html=fs.readFileSync(root+'/releases/1.49.0/wardrobe-panel.html','utf8');
const scene=fs.readFileSync(root+'/releases/1.49.0/scene.mjs','utf8');
const a=scene.indexOf('((host)=>{'),b=scene.indexOf("})(typeof window==='undefined'?globalThis:window.parent);",a)+"})(typeof window==='undefined'?globalThis:window.parent);".length;
const clone=x=>JSON.parse(JSON.stringify(x));
async function run(){const browser=await chromium.launch({executablePath:'/tmp/chromium-full',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});try{
 for(const width of [320,375,1000]){
  let current=state(),calls=[],fail=false,release=null;const p=await browser.newPage({viewport:{width,height:812}}),errors=[];
  const visible=()=>({...clone(current),衣装商店:clone(C.shopView(current)),衣装记忆:{},衣装支线:C.config.wardrobeQuests.map(q=>clone(C.wardrobeQuestView(current,q.id)))});
  await p.exposeFunction('readShopState',()=>visible());
  await p.exposeFunction('performShopAction',async(type,payload)=>{calls.push({type,payload});if(release)await new Promise(r=>release.resolve=r);if(fail)return{ok:false,error:'模拟购买被拒绝'};if(type!=='shopDraft')current=C.action(current,type,payload);return {ok:true,snapshot:visible()};});
  p.on('pageerror',e=>errors.push(e.message));
  await p.route('**/*',r=>{const u=new URL(r.request().url());if(u.hostname==='fixture.invalid')return r.fulfill({contentType:'text/html',body:html});const relative=u.pathname.split('/mikage-shrine/')[1];const file=relative?path.resolve(root,relative):'';if(file.startsWith(root+'/')&&fs.existsSync(file))return r.fulfill({body:fs.readFileSync(file),headers:{'access-control-allow-origin':'*'},contentType:file.endsWith('.ttf')?'font/ttf':file.endsWith('.woff2')?'font/woff2':'image/webp'});return r.abort();});
  await p.addInitScript({content:scene.slice(a,b)});
  await p.addInitScript(config=>{window.ShrineGameConfig=config;window.ShrineUIBridge={getState:()=>window.readShopState(),act:(type,payload)=>window.performShopAction(type,payload),subscribe(fn){window.refreshShop=fn;return()=>{}},getAppearance:()=>({}),subscribeAppearance:()=>()=>{},getEmaSettings:async()=>({version:1,mode:null,profiles:[],activeProfileId:''})};window.MikageShrinePanels={bridge:ShrineUIBridge,config};},clone(C.config));
  await p.goto('https://fixture.invalid/');await p.waitForFunction(()=>window.ShrinePanel?.ready);await p.evaluate(()=>ShrinePanel.openWardrobe());
  await p.locator('[data-outfit-id=sakura]').click();assert((await p.locator('#wardrobe-look-source').textContent()).includes('月之森'));
  const buy=p.locator('[data-shop-sku="player:sakura"]');await buy.click();assert.equal(calls.length,0,'opening confirmation is read-only');
  await p.getByRole('button',{name:'再看看',exact:true}).click();assert.equal(current.神社.奉纳,30);
  await buy.click();release={resolve:null};await p.getByRole('button',{name:'买下并打包',exact:true}).click();await p.waitForFunction(()=>document.querySelector('#wardrobe-dialog').getAttribute('aria-busy')==='true');
  await p.locator('[data-shop-sku="player:sakura"]').evaluate(e=>e.click());assert.equal(calls.filter(x=>x.type==='buyOutfit').length,1);
  release.resolve();release=null;await p.waitForFunction(()=>document.querySelector('[data-outfit-id=sakura]').classList.contains('is-locked')===false);
  assert.equal(current.神社.奉纳,28);assert.equal(current.玩家.衣装,'daily');assert.equal(current.记录.资源流水.length,1);
  await p.locator('[data-outfit-id=sakura]').click();await p.waitForFunction(()=>document.querySelector('[data-art=portrait]').dataset.outfit==='sakura');assert.equal(current.玩家.衣装,'sakura');
  await p.locator('[data-wardrobe-actor=tomoe]').click();await p.locator('[data-outfit-id=school]').click();fail=true;await p.locator('[data-shop-sku="tomoe:school"]').click();await p.getByRole('button',{name:'买下并打包',exact:true}).click();await p.waitForFunction(()=>document.querySelector('#robe-desk-status').dataset.state==='error');assert.equal(current.神社.奉纳,28);
  fail=false;await p.locator('[data-shop-sku="tomoe:school"]').click();await p.getByRole('button',{name:'买下并打包',exact:true}).click();await p.waitForFunction(()=>document.querySelector('[data-outfit-id=school]').classList.contains('is-locked')===false);assert.equal(current.神社.奉纳,25);assert.equal(current.巴卫.服装,'usual');
  await p.locator('[data-outfit-id=school]').click();await p.waitForFunction(()=>document.querySelector('[data-art=portrait]').dataset.outfit==='school');await p.getByRole('button',{name:'切换人间伪装',exact:true}).click();await p.waitForFunction(()=>document.querySelector('[data-art=portrait]').dataset.outfit==='school-human');assert.equal(current.巴卫.服装,'school-human');
  current.环境.地点='宇庭高校门外';await p.evaluate(async()=>refreshShop(await readShopState()));await p.locator('[data-outfit-id=winter]').click();await p.locator('[data-shop-sku="tomoe:winter"]').click();assert.equal(calls.at(-1).type,'shopDraft');assert.equal(current.神社.奉纳,25);
  await p.screenshot({path:'/tmp/moonforest-shop-'+width+'.png',fullPage:true});assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  assert.deepEqual(errors,[]);await p.evaluate(()=>ShrinePanel.dispose());await p.close();console.log('PASS browser '+width+': real HTML, confirmation/cancel, duplicate clicks, purchase without wear, retry, variant, out-of-store draft, no overflow');
 }
}finally{await browser.close();}}
run().catch(e=>{console.error(e);process.exitCode=1});
