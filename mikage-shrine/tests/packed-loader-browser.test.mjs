/* Exact packaged classic loaders in Chromium helper iframes. The unchanged
 * remote modules provide real ESM exports; start() is replaced by a diagnostic
 * adapter. This proves loader behavior, not real SillyTavern startup or CDN. */
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import path from 'node:path';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright');
const root=path.resolve(import.meta.dirname,'../..');
const cardPath=process.argv[2];
assert(cardPath,'Pass the final packaged card path');
const cardBytes=await readFile(cardPath);
const card=JSON.parse(cardBytes);
const release=card.data.character_version;
const manifest=JSON.parse(await readFile(path.join(root,'mikage-shrine/releases',release,'manifest.json')));
const sha=b=>createHash('sha256').update(b).digest('hex');
const browser=await chromium.launch({headless:true,executablePath:process.env.MIKAGE_CHROMIUM_EXECUTABLE,args:['--no-sandbox']});
const rows=[];
const cases=['primary','second','third','mismatch','retry','blocked','retryable','timeout'];
try{
 for(const entry of manifest.modules){
  const script=card.data.extensions.tavern_helper.scripts.find(s=>s.id===entry.script_id);
  assert(script?.content,entry.module_id);
  const real=await readFile(path.join(root,entry.path));
  assert.equal(sha(real),entry.sha256);
  const sourceCommit=script.content.match(/commit: '([0-9a-f]{40})'/)?.[1];
  assert(sourceCommit,'loader must pin an immutable commit');
  for(const scenario of cases){
   const context=await browser.newContext();
   const page=await context.newPage();
   const requests=[],probes=[],errors=[],unexpected=[];
   let recovered=false;
   page.on('pageerror',e=>errors.push(e.message));
   await context.route('https://**/*',async route=>{
    const u=new URL(route.request().url());
    const hosts=['cdn.jsdelivr.net','testingcf.jsdelivr.net','raw.githubusercontent.com'];
    const i=hosts.indexOf(u.hostname);
    if(i<0||!u.pathname.endsWith('/'+entry.path)||!u.pathname.includes(sourceCommit)){
     unexpected.push(u.href);await route.abort();return;
    }
    if(u.searchParams.has('mikage_export_probe')){
     probes.push(u.href);
     await route.fulfill({body:real,contentType:'text/javascript',headers:{'access-control-allow-origin':'*'}});return;
    }
    requests.push({host:u.hostname,retry:u.searchParams.get('mikage_retry')});
    const fail=scenario==='second'&&i===0||scenario==='third'&&i<2||scenario==='retry'&&!recovered;
    if(fail){await route.fulfill({status:503,body:'diagnostic network failure',headers:{'access-control-allow-origin':'*'}});return;}
    if(scenario==='timeout'&&i===0)await new Promise(r=>setTimeout(r,260));
    const actual=new URL(u);actual.searchParams.set('mikage_export_probe','1');
    const mismatch=scenario==='mismatch'&&i===0;
    const wrapper=`import * as real from ${JSON.stringify(actual.href)};
if(typeof real.start!=='function')throw new Error('actual module has no start export');
export const VERSION=${mismatch?"'diagnostic-invalid'":'real.VERSION'};
export const SCRIPT_ID=real.SCRIPT_ID;
export async function start(){
 const t=globalThis.loaderDiagnostic;t.starts++;t.startedHosts.push(${JSON.stringify(u.hostname)});
 if(t.mode==='blocked')throw new Error('diagnostic partial start');
 if(t.mode==='retryable'&&t.starts===1){const e=new Error('diagnostic retryable start');e.mikageRetryableStart=true;throw e;}
 if(real.SCRIPT_ID==='minigames')parent.MikageMinigames={version:real.VERSION,open(){}};
}`;
    await route.fulfill({body:wrapper,contentType:'text/javascript',headers:{'access-control-allow-origin':'*'}});
   });
   try{
    await page.setContent('<iframe id="helper" sandbox="allow-scripts allow-same-origin" srcdoc="<!doctype html><body></body>"></iframe>');
    const frame=await (await page.$('#helper')).contentFrame();
    await frame.evaluate(mode=>{
     globalThis.loaderDiagnostic={mode,starts:0,startedHosts:[],handlers:{},subscriptions:0};
     globalThis.eventOn=(event,fn)=>{loaderDiagnostic.subscriptions++;loaderDiagnostic.handlers[event]=fn;return{stop(){delete loaderDiagnostic.handlers[event];}};};
     globalThis.getButtonEvent=n=>n;
     if(mode==='timeout'){
      const original=setTimeout.bind(globalThis);
      globalThis.setTimeout=(fn,ms,...args)=>original(fn,ms===15000?80:ms,...args);
     }
    },scenario);
    await frame.evaluate(source=>{(0,eval)(source);(0,eval)(source);},script.content);
    const expected=scenario==='retry'||scenario==='retryable'?'failed':scenario==='blocked'?'blocked':'running';
    await frame.waitForFunction(({id,status})=>globalThis.__MIKAGE_REMOTE_LOADERS__?.[id]?.status===status,{id:entry.module_id,status:expected});
    if(scenario==='retry'){
     assert.equal(await frame.getByRole('status').count(),1);
     assert.equal(requests.length,3);assert(requests.every(r=>r.retry===null));
     recovered=true;
     await frame.getByRole('button',{name:'重新加载',exact:true}).click();
     await frame.waitForFunction(id=>__MIKAGE_REMOTE_LOADERS__[id].status==='running',entry.module_id);
     assert.equal(requests.length,4);assert.equal(requests[3].retry,'2');
     assert.equal(await frame.getByRole('status').count(),0);
    }
    if(scenario==='retryable'){
     await frame.evaluate(()=>loaderDiagnostic.handlers['重新加载资源']());
     await frame.waitForFunction(id=>__MIKAGE_REMOTE_LOADERS__[id].status==='running',entry.module_id);
     assert.equal(requests.length,1,'retryable start reuses the imported module');
    }
    if(scenario==='blocked'){
     assert.equal(await frame.getByRole('status').count(),1);
     assert.equal(await frame.getByRole('button').count(),0);
     await frame.evaluate(id=>__MIKAGE_REMOTE_RETRY__[id](),entry.module_id);
     await frame.evaluate(source=>(0,eval)(source),script.content);
     assert.equal(requests.length,1,'partial startup must never import fallback');
    }else{
     await frame.evaluate(source=>(0,eval)(source),script.content);
     if(entry.module_id==='minigames'){
      assert.equal(await page.evaluate(async()=>{const a=await MikageMinigamesLoader.ensureReady();return a.version;}),entry.version);
     }
    }
    if(scenario==='timeout'){
     // Wait for the intentionally late import to settle and prove it never starts.
     await frame.waitForFunction(()=>loaderDiagnostic.startedHosts.length===1);
     await new Promise(r=>setTimeout(r,320));
    }
    const state=await frame.evaluate(id=>({status:__MIKAGE_REMOTE_LOADERS__[id].status,attempt:__MIKAGE_REMOTE_LOADERS__[id].attempt,starts:loaderDiagnostic.starts,hosts:loaderDiagnostic.startedHosts,subscriptions:loaderDiagnostic.subscriptions}),entry.module_id);
    assert.equal(state.status,scenario==='blocked'?'blocked':'running');
    assert.equal(state.attempt,scenario==='retry'||scenario==='retryable'?2:1);
    assert.equal(state.starts,scenario==='retryable'?2:1);
    assert.equal(state.subscriptions,1,'duplicate bootstraps must not duplicate retry listeners');
    assert.equal(requests.length,scenario==='third'?3:scenario==='second'||scenario==='mismatch'||scenario==='timeout'?2:scenario==='retry'?4:1);
    const ordered=['cdn.jsdelivr.net','testingcf.jsdelivr.net','raw.githubusercontent.com'];
    assert.deepEqual(requests.map(r=>r.host),scenario==='retry'?[...ordered,ordered[0]]:ordered.slice(0,requests.length));
    const startedHost=scenario==='third'?ordered[2]:['second','mismatch','timeout'].includes(scenario)?ordered[1]:ordered[0];
    assert.deepEqual(state.hosts,scenario==='retryable'?[startedHost,startedHost]:[startedHost]);
    assert.deepEqual(errors,[]);assert.deepEqual(unexpected,[]);
    assert(probes.length>=1,'actual module bytes must execute as ESM');
    if(entry.module_id==='minigames'){
     await frame.evaluate(()=>dispatchEvent(new Event('pagehide')));
     assert.equal(await page.evaluate(()=>typeof MikageMinigamesLoader),'undefined');
    }
    rows.push({module:entry.module_id,scenario,...state,requests,realExportProbes:probes.length,errors});
   }finally{await context.close();}
  }
 }
 const receipt={date:'2026-10-31',release,card_sha256:sha(cardBytes),browser:browser.version(),cases:rows.length,rows,
  source:'Exact final-card loaders, separate Chromium helper iframes; real immutable module bytes and exports; diagnostic start adapter; network fault injection',
  timeout:'Only the diagnostic realm maps production 15000ms timer to 80ms; late response waits260ms',
  real_module_start:false,real_sillytavern:false,online_cdn:false,paid_model_calls:0};
 if(process.env.MIKAGE_LOADER_EVIDENCE){await mkdir(path.dirname(process.env.MIKAGE_LOADER_EVIDENCE),{recursive:true});await writeFile(process.env.MIKAGE_LOADER_EVIDENCE,JSON.stringify(receipt,null,2)+'\n');}
 console.log(`PASS ${rows.length} packaged-loader Chromium cases: six real export probes, ordered CDN fallbacks, mismatch, retry cache bust, duplicate bootstrap, blocked/retryable start, timeout/late import and minigames parent cleanup. No real startup, CDN or SillyTavern acceptance claimed.`);
}finally{await browser.close();}
