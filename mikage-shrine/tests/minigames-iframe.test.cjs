const {chromium}=require('playwright');
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),scratch=path.resolve(root,'..');
const fixed=fs.readFileSync(path.join(root,'runtime/minigames.mjs'),'utf8');
const version=fixed.match(/export const version = '([^']+)';/)[1];
const scene=fs.readFileSync(path.join(root,'runtime/scene-1.16.4.mjs'),'utf8');
const mvu=fs.readFileSync(path.join(root,'runtime/mvu-1.16.3.mjs'),'utf8');
const domain=mvu.slice(mvu.indexOf('/* The dictionary'),mvu.indexOf('// Install before importing'));
const url=source=>'data:text/javascript;base64,'+Buffer.from(source).toString('base64');
const oldPath=process.env.MIKAGE_LEGACY_MODULE||path.join(scratch,'minigames-original.mjs');
const old=fs.existsSync(oldPath)?fs.readFileSync(oldPath,'utf8'):null;
let loader=fs.readFileSync(path.join(root,'tools/loader-template.js'),'utf8');
for(const [marker,value]of Object.entries({__COMMIT__:'a917cec0052ae81d326cfe5f9d65cc05264c8ea1',__MODULE_PATH__:'mikage-shrine/runtime/minigames.mjs',__SCRIPT_ID__:'minigames',__VERSION__:version,__LABEL__:'御影神社·独立小游戏'}))loader=loader.replaceAll(marker,value);
const log=message=>console.log('PASS',message);
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/tmp/mikage-chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu']});
 for(const width of [390,1280]){
  const page=await browser.newPage({viewport:{width,height:1100},reducedMotion:'reduce'}),errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.route('https://**',route=>route.abort());
  await page.setContent('<!doctype html><div id="chat"><div class="mes" mesid="0" is_user="false"><div class="mes_text"><StatusPlaceHolderImpl/></div></div></div><textarea id="send_textarea"></textarea><iframe id="scene-script" style="display:none"></iframe><iframe id="game-script" style="display:none"></iframe>');
  await page.evaluate(domain=>{
   window.events=new Map();window.table=null;
   window.Mvu={events:{VARIABLE_INITIALIZED:'initialized',VARIABLE_UPDATE_ENDED:'ended'},getMvuData:()=>JSON.parse(JSON.stringify(table))};
   window.getLastMessageId=()=>0;window.getCurrentChatId=()=> 'qa';window.getChatMessages=()=>[{message_id:0,swipe_id:0,role:'assistant',message:'<StatusPlaceHolderImpl/>',data:table}];
   window.eventOn=(name,fn)=>{const list=events.get(name)||[];list.push(fn);events.set(name,list);return {stop(){}};};window.getButtonEvent=x=>x;
   window.tavern_events={CHAT_CHANGED:'chat',MESSAGE_SWIPED:'swipe',MESSAGE_RECEIVED:'received',MESSAGE_UPDATED:'updated',MESSAGE_DELETED:'deleted'};
   window.waitGlobalInitialized=async()=>{};window.appendInexistentScriptButtons=()=>{};window.toastr={warning(){},error(){},info(){}};
   window.getVariables=()=>({});window.getScriptId=()=> 'qa';
   (0,eval)(domain+"\nShrineBootstrapState='ready';window.MikageShrineRuntime={engine:ShrineCard,version:'0.6.0'};window.table={stat_data:ShrineInitial};");
  },domain);
  const sceneFrame=await page.locator('#scene-script').elementHandle().then(h=>h.contentFrame());
  const gameFrame=await page.locator('#game-script').elementHandle().then(h=>h.contentFrame());
  for(const frame of [sceneFrame,gameFrame])await frame.evaluate(()=>{
   for(const name of ['Mvu','getLastMessageId','getCurrentChatId','getChatMessages','eventOn','getButtonEvent','tavern_events','waitGlobalInitialized','appendInexistentScriptButtons','toastr','getVariables','getScriptId'])window[name]=parent[name];
  });
  // Reproduce the released bug in the same hidden-iframe context as Tavern Helper.
  if(old){
   await gameFrame.evaluate(async u=>{(await import(u)).start();},url(old));
   assert.equal(await page.evaluate(()=>typeof MikageMinigames),'undefined');
   assert.equal(await gameFrame.evaluate(()=>typeof MikageMinigames.open),'function');
   await gameFrame.evaluate(()=>MikageMinigames.dispose());log(width+'px old release reproduces iframe isolation bug');
  }
  await sceneFrame.evaluate(async u=>{(await import(u)).start();},url(scene));
  await page.waitForSelector('iframe[title="御影神社状态栏"]');
  const status=page.frames().find(f=>f.url()==='about:srcdoc');assert(status,'status iframe exists');
  await status.waitForFunction(()=>document.getElementById('shrine-game')?.dataset.ready==='true');
  // A missing plugin yields a usable instruction instead of an endless preparing message.
  await status.locator('#moment').click();
  await status.waitForFunction(()=>document.getElementById('speech').textContent.includes('请启用配套'),{},{timeout:20000});
  assert.equal(await page.locator('[data-mikage-minigame-host]').count(),0);
  await gameFrame.evaluate(script=>{(0,eval)(script);},loader);
  await page.waitForFunction(()=>window.MikageMinigamesLoader?.getStatus().status==='failed');
  await status.locator('#moment').click();
  await status.waitForFunction(()=>document.getElementById('speech').textContent.includes('资源加载失败'));
  let release;const gate=new Promise(resolve=>release=resolve);let requests=0;
  await page.route('**/mikage-shrine/runtime/minigames.mjs*',async route=>{requests++;await gate;await route.fulfill({body:fixed,contentType:'text/javascript',headers:{'access-control-allow-origin':'*'}});});
  await page.waitForFunction(()=>typeof MikageMinigamesLoader?.ensureReady==='function');
  await status.locator('#moment').click();
  await status.waitForFunction(()=>document.getElementById('speech').textContent.includes('载入后会自动打开'));
  release();
  await page.getByRole('heading',{name:'庭前拾叶',exact:true}).waitFor();
  assert.equal(requests,1);assert.equal(await page.locator('[data-mikage-minigame-host]').count(),1);
  assert.equal(await gameFrame.locator('[data-mikage-minigame-host]').count(),0,'popup belongs to main document');
  await page.getByRole('button',{name:'开始这段散策',exact:true}).click();
  assert.equal(await page.locator('.mka').count(),1);
  assert.equal(await page.locator('.mka').evaluate(el=>el.ownerDocument===window.document),true);
  await page.getByRole('button',{name:'请巴卫把竹篮放在左侧',exact:true}).click();
  for(let i=0;i<6;i++)await page.getByRole('button',{name:'顺风收拢下一片',exact:true}).click();
  await page.getByRole('button',{name:'一起安排庭院秋色',exact:true}).click();
  await page.getByRole('button',{name:'树下心形',exact:true}).click();
  await page.getByRole('button',{name:'就这样，和巴卫一起摆好',exact:true}).click();
  await status.waitForFunction(()=>!document.getElementById('roam-toast').hidden);
  await page.getByRole('button',{name:'关闭互动弹窗',exact:true}).click();
  assert.equal(await page.locator('[data-mikage-minigame-host]').count(),0);
  log(width+'px independent script + status iframes: delayed loader automatically opens, courtyard completes and saves callback');
  for(let i=1;i<=10;i++){
   const region='R'+String(i).padStart(2,'0');
   await page.evaluate(region=>MikageMinigames.open({region,reducedMotion:true}),region);
   await page.getByRole('button',{name:'开始这段散策',exact:true}).click();assert.equal(await page.locator('.mka').count(),1,region+' mounts');
   await page.getByRole('button',{name:'关闭互动弹窗',exact:true}).click();
  }
  await page.evaluate(()=>MikageMinigames.open({region:'R01',reducedMotion:true}));
  await gameFrame.evaluate(()=>dispatchEvent(new Event('pagehide')));
  assert.equal(await page.evaluate(()=>typeof window.MikageMinigames),'undefined');
  assert.equal(await page.evaluate(()=>typeof window.MikageMinigamesLoader),'undefined');
  assert.equal(await page.locator('[data-mikage-minigame-host]').count(),0);
  // If a pending request outlives a region change, its completion cannot open a stale scene.
  await page.evaluate(()=>{window.pendingReady=new Promise(resolve=>window.finishPending=resolve);window.MikageMinigamesLoader={ensureReady:()=>pendingReady};window.openedLate=0;});
  await status.locator('#moment').click();
  await status.waitForFunction(()=>document.getElementById('speech').textContent.includes('载入后会自动打开'));
  await page.evaluate(()=>{table.stat_data.地图.当前地区='R02';dispatchEvent(new Event('mikage:mvu-status'));});
  await status.waitForFunction(()=>document.getElementById('scene').dataset.region==='R02');
  await page.evaluate(()=>finishPending({open(){openedLate++;}}));
  await page.waitForTimeout(20);assert.equal(await page.evaluate(()=>openedLate),0);
  assert.deepEqual(errors,[]);log(width+'px ten regions mount, owner teardown closes popup, stale async launch is cancelled, zero page errors');
  await page.close();
 }
 await browser.close();
})().catch(error=>{console.error(error);process.exit(1);});
