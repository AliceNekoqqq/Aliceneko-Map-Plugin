const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require('/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const {C,state,clone}=require('./economy.test.cjs');
const root=path.resolve(__dirname,'..'),html=fs.readFileSync(root+'/releases/1.49.2/wardrobe-panel.html','utf8');
const scene=fs.readFileSync(root+'/releases/1.49.0/scene.mjs','utf8'),a=scene.indexOf('((host)=>{'),tail="})(typeof window==='undefined'?globalThis:window.parent);",b=scene.indexOf(tail,a)+tail.length;
async function run(){const browser=await chromium.launch({executablePath:'/tmp/chromium-full',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});try{for(const width of [320,375,1000]){
 let current=state(2,20),calls=0,fail=false,delay=null;const p=await browser.newPage({viewport:{width,height:812}}),errors=[];
 p.on('pageerror',e=>errors.push(e.message));
 await p.exposeFunction('readEconomyState',()=>clone({...current,衣装商店:C.shopView(current)}));
 await p.exposeFunction('readLifeView',()=>clone({...C.life.view(current),quietChoices:[],quietMemories:[],strangeJournal:{active:null,available:[],completed:[]},festivalJournal:{notes:[],contacts:[]}}));
 await p.exposeFunction('settleLife',async(type,payload)=>{if(type!=='life')return{ok:true};calls++;if(delay)await new Promise(resolve=>delay.resolve=resolve);if(fail)return{ok:false,error:'测试：采购尚未成交'};current=C.action(current,type,payload);return{ok:true};});
 await p.route('**/*',r=>{const u=new URL(r.request().url());if(u.hostname==='fixture.invalid')return r.fulfill({contentType:'text/html',body:html});const rel=u.pathname.split('/mikage-shrine/')[1],file=rel?path.resolve(root,rel):'';if(file.startsWith(root+'/')&&fs.existsSync(file))return r.fulfill({body:fs.readFileSync(file),headers:{'access-control-allow-origin':'*'},contentType:file.endsWith('.ttf')?'font/ttf':'image/webp'});return r.abort();});
 await p.addInitScript({content:scene.slice(a,b)});
 await p.addInitScript(config=>{window.ShrineGameConfig=config.main;window.ShrineLifeConfig=config.life;window.ShrineUIBridge={getState:()=>readEconomyState(),getLifeView:()=>readLifeView(),act:(type,payload)=>settleLife(type,payload),subscribe(fn){window.refreshEconomy=fn;return()=>{}},getAppearance:()=>({}),subscribeAppearance:()=>()=>{},getEmaSettings:async()=>({version:1,mode:null,profiles:[],activeProfileId:''})};window.MikageShrinePanels={bridge:ShrineUIBridge,config:config.main};},{main:clone(C.config),life:clone(C.life.config)});
 await p.goto('https://fixture.invalid/');await p.waitForFunction(()=>window.ShrinePanel?.ready);await p.evaluate(()=>ShrinePanel.openLife());await p.locator('[data-life-tab=shop]').click();
 const tea=p.locator('[data-life-buy=tea_leaf]');assert.equal(await tea.textContent(),'购买一包');assert((await tea.locator('..').textContent()).includes('每包 3 份'));assert((await p.locator('[data-life-buy=herb_seed]').locator('..').textContent()).includes('每包 2 份'));assert.equal(await p.locator('[data-life-buy=flower_vase]').textContent(),'购买一件');
 delay={resolve:null};await tea.click();await p.waitForFunction(()=>document.querySelector('#life-feedback').dataset.state==='pending');await tea.evaluate(e=>e.click());assert.equal(calls,1);assert.equal(current.神社.奉纳,20);delay.resolve();delay=null;
 await p.waitForFunction(()=>document.querySelector('#life-feedback').dataset.state==='success');assert.equal(current.神社.奉纳,18);assert.equal(current.生活.库存.tea_leaf,4);assert.equal(current.记录.资源流水.length,1);assert((await p.locator('[data-life-buy=tea_leaf]').locator('..').textContent()).includes('今日余量 7 包'));
 fail=true;await p.locator('[data-life-buy=rice]').click();await p.waitForFunction(()=>document.querySelector('#life-feedback').dataset.state==='error');assert.equal(current.神社.奉纳,18);assert.equal(current.记录.资源流水.length,1);
 fail=false;await p.locator('[data-life-buy=rice]').click();await p.waitForFunction(()=>document.querySelector('#life-feedback').dataset.state==='success');assert.equal(current.生活.库存.rice,5);assert.equal(current.神社.奉纳,17);assert.equal(current.记录.资源流水.length,2);
 await p.screenshot({path:'/tmp/economy-shop-'+width+'.png',fullPage:true});assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 current=state(3,3);await p.evaluate(()=>ShrineLifeUI.render());await p.waitForFunction(()=>document.querySelector('[data-life-buy=tea_leaf]').disabled);assert.equal(current.神社.奉纳,3);
 current.地图.当前地区='R01';await p.evaluate(()=>ShrineLifeUI.render());await p.waitForFunction(()=>document.querySelector('[data-life-buy=rice]').disabled);assert.deepEqual(errors,[]);await p.evaluate(()=>ShrinePanel.dispose());await p.close();console.log('PASS economy browser '+width+': package sizes/prices/daily stock, actual clicks and ledger, singleflight, rejection/retry, reserve and offsite guards, no overflow');
 }}finally{await browser.close();}}
run().catch(e=>{console.error(e);process.exitCode=1});
