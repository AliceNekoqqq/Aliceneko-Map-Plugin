const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require('/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=path.resolve(__dirname,'..'),html=fs.readFileSync(root+'/releases/1.48.0/statusbar.html','utf8'),scene=fs.readFileSync(root+'/releases/1.48.0/scene.mjs','utf8');
const artStart=scene.indexOf('((host)=>{'),artEnd=scene.indexOf("})(typeof window==='undefined'?globalThis:window.parent);",artStart)+"})(typeof window==='undefined'?globalThis:window.parent);".length,art=scene.slice(artStart,artEnd);
const mvu=fs.readFileSync(root+'/releases/1.30.1/mvu.mjs','utf8'),initial=JSON.parse(mvu.match(/const ShrineInitial = (.*);/)[1]);
const start=mvu.indexOf('const ShrineLifeRuntime = '),end=mvu.indexOf('\n})();',start)+6;
const life='const ShrineConfig = '+mvu.match(/const ShrineConfig = (.*);/)[1]+';\n'+mvu.slice(start,end)+';window.MikageShrineRuntime={engine:{life:ShrineLifeRuntime}};';
async function fixture(browser,width,options={}){
 const p=await browser.newPage({viewport:{width,height:1050},deviceScaleFactor:1,recordVideo:options.video?{dir:options.video,size:{width,height:1050}}:undefined});const errors=[],requests=[];p.on('pageerror',e=>errors.push(e.message));
 await p.route('**/*',async r=>{const u=new URL(r.request().url());if(u.hostname==='fixture.invalid')return r.fulfill({contentType:'text/html',body:html});requests.push(r.request().url());const rel=u.pathname.split('/mikage-shrine/')[1],f=rel?path.resolve(root,rel):'';if(options.blockAtlas?.()&&/shrine-modular-v1.webp/.test(f))return r.abort();if(f.startsWith(root+'/')&&fs.existsSync(f))return r.fulfill({body:fs.readFileSync(f),headers:{'access-control-allow-origin':'*'},contentType:f.endsWith('.ttf')?'font/ttf':f.endsWith('.woff2')?'font/woff2':'image/webp'});return r.abort()});
 await p.addInitScript({content:art+'\n'+life});await p.addInitScript(initial=>{window.uiState=structuredClone(initial);window.opened=[];window.unsubscribed=0;window.MikageStatusBridge={messageId:1,chatEpoch:0,swipeId:0,getState:async()=>structuredClone(uiState),subscribe(fn){window.update=fn;fn(structuredClone(uiState));return()=>unsubscribed++},open:kind=>opened.push(kind),getRoamMemories:()=>[],resize(){}}},initial);
 await p.goto('https://fixture.invalid/');return{p,errors,requests};
}
module.exports={fixture};
