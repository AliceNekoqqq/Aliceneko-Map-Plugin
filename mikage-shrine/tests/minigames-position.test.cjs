const {chromium}=require('playwright');
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const source=fs.readFileSync(path.resolve(__dirname,'../runtime/minigames.mjs'),'utf8');
const url='data:text/javascript;base64,'+Buffer.from(source).toString('base64');

(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/tmp/mikage-chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu']});
 const scenarios=[
  {viewport:{width:390,height:520}},
  {viewport:{width:390,height:844}},
  {viewport:{width:1280,height:800}},
  {viewport:{width:390,height:844},fallback:true},
 ];
 for(const {viewport,fallback=false} of scenarios){
  const page=await browser.newPage({viewport,reducedMotion:'reduce'}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.route('https://**',route=>route.abort());
  await page.setContent('<!doctype html><style>html,body{transform:translateY(-420px)}body{height:1800px;margin:0;overflow:auto}#chat{height:1600px;overflow:hidden;transform:translateY(-120px)}</style><div id="chat">long chat surface</div><iframe id="helper" style="display:none"></iframe>');
  if(fallback)await page.evaluate(()=>{document.documentElement.style.transform='none';Object.defineProperty(HTMLElement.prototype,'showPopover',{value:undefined,configurable:true});Object.defineProperty(HTMLElement.prototype,'hidePopover',{value:undefined,configurable:true});});
  const frame=await page.locator('#helper').elementHandle().then(h=>h.contentFrame());
  await frame.evaluate(async u=>(await import(u)).start(),url);
  await page.evaluate(()=>MikageMinigames.open({region:'R02',reducedMotion:true}));
  const bounds=await page.locator('[data-mikage-minigame-host]').evaluate(host=>{
   const overlay=host.shadowRoot.querySelector('.mkg-overlay');
   const dialog=host.shadowRoot.querySelector('.mkg-dialog');
   return {open:host.matches(':popover-open'),viewport:{width:innerWidth,height:innerHeight},host:host.getBoundingClientRect().toJSON(),overlay:overlay.getBoundingClientRect().toJSON(),dialog:dialog.getBoundingClientRect().toJSON()};
  });
  assert.equal(bounds.open,!fallback,JSON.stringify(bounds));
  assert.equal(bounds.host.top,0,JSON.stringify(bounds));
  assert.equal(bounds.host.left,0,JSON.stringify(bounds));
  assert.equal(bounds.host.width,viewport.width,JSON.stringify(bounds));
  assert.equal(bounds.host.height,viewport.height,JSON.stringify(bounds));
  assert.equal(bounds.overlay.top,0,JSON.stringify(bounds));
  assert.equal(bounds.overlay.height,viewport.height,JSON.stringify(bounds));
  assert.ok(bounds.dialog.top>=0&&bounds.dialog.bottom<=viewport.height,JSON.stringify(bounds));
  assert.ok(Math.abs((bounds.dialog.top+bounds.dialog.bottom)/2-viewport.height/2)<=2,JSON.stringify(bounds));
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('[data-mikage-minigame-host]').count(),0,'Escape closes top-layer popup');
  assert.deepEqual(errors,[]);
  console.log(`PASS ${viewport.width}x${viewport.height}: centered over translated chat/document${fallback?' (compatibility fallback)':''}`);
  await page.close();
 }
 await browser.close();
})().catch(error=>{console.error(error);process.exit(1);});
