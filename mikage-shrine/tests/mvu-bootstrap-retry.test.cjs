const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {JSDOM}=require('/tmp/mikage-debug/node_modules/jsdom'),z=require('/tmp/mikage-debug/node_modules/zod');
const root=path.resolve(__dirname,'../..'),release=process.argv[2]||'1.30.1',expectOld=process.argv.includes('--expect-old');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'mikage-shrine/releases',release,'manifest.json'))),entry=manifest.modules.find(m=>m.module_id==='mvu');
const src=fs.readFileSync(path.join(root,entry.path),'utf8');const initial=JSON.parse(src.match(/const ShrineInitial = (.*);/)[1]);
const template=fs.readFileSync(path.join(root,'mikage-shrine/tools/loader-template.js'),'utf8');
const tick=()=>new Promise(r=>setTimeout(r,10)),clone=v=>JSON.parse(JSON.stringify(v));
async function scenario(failPhase){
 const parent=new JSDOM('',{url:'https://fixture.invalid/'}),child=new JSDOM('',{url:'https://fixture.invalid/helper',runScripts:'outside-only'}),w=child.window;Object.defineProperty(w,'parent',{value:parent.window});
 const bus=new Map();let offline=true,dependencies=0,imports=0,writes=0,data={stat_data:clone(initial)};data.stat_data.神社.木材=13;
 const before=clone(data.stat_data),Mvu={getMvuData:()=>clone(data),async replaceMvuData(next){data=clone(next);writes++;}};
 Object.assign(parent.window,{Mvu,getLastMessageId:()=>0});
 Object.assign(w,{Mvu,eventOn(name,fn){if(!bus.has(name))bus.set(name,new Set());bus.get(name).add(fn);return{stop(){bus.get(name).delete(fn);}};},getButtonEvent:n=>n,tavern_events:{CHAT_CHANGED:'chat',MESSAGE_SWIPED:'swipe',MESSAGE_RECEIVED:'received',MESSAGE_UPDATED:'updated'},getLastMessageId:()=>0,getCurrentChatId:()=> 'fixture',getChatMessages:()=>[{message_id:0,swipe_id:0,role:'assistant',message:'fixture'}],waitGlobalInitialized:async()=>{},console:{log(){},warn(){},error(){}},dependencyImport:async url=>{dependencies++;const isZod=url.includes('zod@');if(offline&&isZod===(failPhase==='zod'))throw Error('temporary dependency outage');return isZod?z:{};}});
 w.eval(src.replace(/export \{VERSION,SCRIPT_ID,start\};?/,'').replaceAll('import(','dependencyImport(')+';window.moduleForTest={VERSION,SCRIPT_ID,start};');
 w.moduleImport=async()=>{imports++;return w.moduleForTest;};
 let loader=template;for(const [k,v]of Object.entries({__COMMIT__:'0'.repeat(40),__SCRIPT_ID__:'mvu',__MODULE_PATH__:entry.path,__VERSION__:entry.version,__LABEL__:'MVU'}))loader=loader.replaceAll(k,v);
 w.eval(loader.replaceAll('import(url)','moduleImport(url)'));await tick();const state=w.__MIKAGE_REMOTE_LOADERS__.mvu;if(state.promise)await state.promise;await tick();
 assert.equal(parent.window.MikageMvuDiagnostics.inspect().code,'bootstrap-error');assert.equal(writes,0);assert.deepEqual(data.stat_data,before);
 if(expectOld){assert.equal(state.status,'running');offline=false;const n=dependencies;await state.retry();assert.equal(dependencies,n);console.log('PASS old '+failPhase+' dependency failure is falsely running; retry does not run');}
 else{
  assert.equal(state.status,'failed');offline=false;const p=state.retry(),same=state.retry();await Promise.all([p,same]);await tick();
  assert.equal(state.status,'running');assert.equal(parent.window.MikageMvuDiagnostics.inspect(0).code,'ready');assert.deepEqual(data.stat_data,before);assert.equal(imports,1,'retry must reuse same module closure');
  assert.equal(bus.get('mag_variable_initialized').size,1);assert.equal(bus.get('mag_variable_update_started').size,1);assert.equal(bus.get('mag_variable_update_ended').size,1);assert.equal(bus.get('chat').size,1);assert.equal(bus.get('swipe').size,1);
  const total=[...bus.values()].reduce((n,s)=>n+s.size,0),savedWrites=writes,savedDependencies=dependencies;
  await state.retry();w.eval(loader.replaceAll('import(url)','moduleImport(url)'));await tick();assert.equal(dependencies,savedDependencies);assert.equal(writes,savedWrites);assert.equal([...bus.values()].reduce((n,s)=>n+s.size,0),total);
  console.log('PASS '+failPhase+' outage/recovery: safe retry, concurrent retry dedup, one module, single listeners, wood=13 retained, no repeated writes');
 }
 w.close();parent.window.close();
}
(async()=>{await scenario('mvu');await scenario('zod');})().catch(e=>{console.error(e);process.exitCode=1});
