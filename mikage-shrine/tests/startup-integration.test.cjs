const fs=require('node:fs'),assert=require('node:assert/strict');
const path=require('node:path');
const deps=process.env.MIKAGE_DEBUG_DEPS||'/tmp/mikage-debug/node_modules';
const {JSDOM,VirtualConsole}=require(path.join(deps,'jsdom'));
const z=require(path.join(deps,'zod'));
const project=path.resolve(__dirname,'..');
const release=process.argv[2]||'1.29.2';
const manifest=JSON.parse(fs.readFileSync(path.join(project,'releases',release,'manifest.json')));
const expectFailure=process.argv.includes('--expect-opening-failure');
const clone=v=>JSON.parse(JSON.stringify(v));
const src=id=>fs.readFileSync(path.resolve(project,'..',manifest.modules.find(m=>m.module_id===id).path),'utf8');
const initial=JSON.parse(src('mvu').match(/const ShrineInitial = (.*);/)[1]);initial.神社.木材=13;
let rows=[{message_id:0,swipe_id:0,role:'assistant',message:'<MikageOpeningScreen/>',data:{stat_data:clone(initial)}}];
const bus=new Map(),logs=[],frames=[];let writes=0;
const vc=new VirtualConsole();vc.on('jsdomError',e=>logs.push(['jsdom',e.message]));
const top=new JSDOM('<div id="chat"><div class="mes" mesid="0"><div class="mes_text"></div></div></div><textarea id="send_textarea"></textarea>',{url:'https://fixture.invalid/',runScripts:'outside-only',pretendToBeVisual:true,virtualConsole:vc});
const host=top.window;
const events=Object.fromEntries(['CHAT_CHANGED','MESSAGE_SWIPED','MESSAGE_RECEIVED','MESSAGE_UPDATED','MESSAGE_DELETED'].map(x=>[x,x]));
function on(e,fn){if(!bus.has(e))bus.set(e,new Set());bus.get(e).add(fn);return{stop(){bus.get(e).delete(fn);}};}
function emit(e,...args){for(const fn of [...bus.get(e)||[]])fn(...args);}
function getRows(range){let a,b;if(typeof range==='number')a=b=range;else[a,b]=String(range).split('-').map(Number);return clone(rows.filter(r=>r.message_id>=a&&r.message_id<=(b??a)));}
const Mvu={events:{VARIABLE_UPDATE_ENDED:'mag_variable_update_ended',VARIABLE_INITIALIZED:'mag_variable_initialized'},getMvuData:({message_id})=>clone(rows.find(r=>r.message_id===message_id)?.data||{}),async replaceMvuData(data,{message_id}){rows.find(r=>r.message_id===message_id).data=clone(data);writes++;}};
Object.assign(host,{Mvu,getLastMessageId:()=>rows.at(-1)?.message_id??-1});
const shared={z,Mvu,tavern_events:events,eventOn:on,getButtonEvent:n=>'button:'+n,appendInexistentScriptButtons(){},getLastMessageId:host.getLastMessageId,getCurrentChatId:()=> 'fixture',getChatMessages:getRows,waitGlobalInitialized:async()=>{},substitudeMacros:s=>s.replaceAll('{{user}}','测试玩家'),mockImport:async()=>({}),console:{log(){},error(...a){logs.push(['error',...a.map(String)]);},warn(...a){logs.push(['warn',...a.map(String)]);}},toastr:{warning(m){logs.push(['toast',m]);},error(m){logs.push(['toast-error',m]);},info(){}},async setChatMessages(updates){for(const u of updates){Object.assign(rows.find(r=>r.message_id===u.message_id),u);host.document.querySelector(`.mes[mesid="${u.message_id}"] .mes_text`).textContent=u.message;}emit(events.MESSAGE_UPDATED);emit(events.MESSAGE_RECEIVED);}};
function run(id){const d=new JSDOM('',{url:'https://fixture.invalid/'+id,runScripts:'outside-only',pretendToBeVisual:true,virtualConsole:vc});Object.defineProperty(d.window,'parent',{value:host});Object.assign(d.window,shared);frames.push(d);d.window.eval(src(id).replace(/export \{VERSION,SCRIPT_ID,start\};?/,'').replaceAll('import(','mockImport(')+'\nstart();');return d;}
function mountChild(frame, globals={}) {
 const d=new JSDOM(frame.srcdoc||frame.contentDocument.documentElement.outerHTML,{url:'https://fixture.invalid/child',runScripts:'outside-only',pretendToBeVisual:true,virtualConsole:vc});
 Object.defineProperty(d.window.document,'fonts',{value:{add(){}}});d.window.FontFace=class{load(){return Promise.resolve(this);}};
 Object.defineProperty(d.window,'parent',{value:host});Object.assign(d.window,{matchMedia:()=>({matches:true,addEventListener(){},removeEventListener(){}}),...globals});frames.push(d);
 for(const script of d.window.document.querySelectorAll('script'))if(!script.src&&script.textContent.trim())d.window.eval(script.textContent);
 return d.window;
}
const tick=()=>new Promise(r=>setTimeout(r,25));
(async()=>{
 try{
  run('scene');run('panels');run('minigames');run('mvu');await tick();await tick();
  console.log('diagnosis',host.MikageMvuDiagnostics?.inspect(0));
  console.log('interfaces',!!host.MikageOpeningScreen,!!host.MikageStatusbars,!!host.MikageShrinePanels,!!host.MikageMinigames);
  assert.equal(host.MikageMvuDiagnostics.inspect(0).code,'ready');assert.equal(rows[0].data.stat_data.神社.木材,13);
  if(expectFailure){assert(logs.some(x=>x.join(' ').includes('publish is not defined')));assert.equal(host.document.querySelectorAll('iframe[title="游戏标题页"]').length,0);console.log('PASS original 1.29.1 opening failure reproduced');return;}
  let frame=host.document.querySelector('iframe[title="游戏标题页"]');assert(frame,'Opening frame must mount');
  frame.dispatchEvent(new host.Event('load'));
  const opening=mountChild(frame,{OpeningBridge:frame.contentWindow.OpeningBridge,OpeningArt:host.MikageCharacterArt});
  assert(opening.OpeningScreen,'Opening child JS should initialize');
  await host.MikageOpeningScreen.bridge.start('opening-1');await tick();
  assert(rows[0].message.includes('MikageOpeningStarted:opening-1'));assert(!rows[0].message.includes('{{user}}'));
  assert.equal(host.document.querySelectorAll('iframe[title="游戏标题页"]').length,0);
  assert.equal(host.document.querySelectorAll('iframe[title="御影神社状态栏"]').length,1,'Statusbar should mount after starting');
  const statusFrame=host.document.querySelector('iframe[title="御影神社状态栏"]');statusFrame.dispatchEvent(new host.Event('load'));
  const status=mountChild(statusFrame,{MikageStatusBridge:statusFrame.contentWindow.MikageStatusBridge,MikageCharacterArt:host.MikageCharacterArt,ShrineCharacterArt:host.MikageCharacterArt});
  assert(status.MikageStatusScene,'Status child JS should initialize');
  host.MikageStatusbars.rescan();host.MikageStatusbars.rescan();assert.equal(host.document.querySelectorAll('iframe[title="御影神社状态栏"]').length,1);
  for(const kind of ['board','map','wardrobe','life']){await host.MikageShrinePanels.open(kind);assert.equal(host.document.querySelectorAll('[data-mikage-panel-frame]').length,1);
   const panelFrame=host.document.querySelector('[data-mikage-panel-frame]');panelFrame.dispatchEvent(new host.Event('load'));
   const panel=mountChild(panelFrame,{ShrineUIBridge:host.MikageShrinePanels.bridge,ShrineGameConfig:host.MikageShrinePanels.config,ShrineLifeConfig:host.MikageShrinePanels.lifeConfig,MikageCharacterArt:host.MikageCharacterArt,ShrineCharacterArt:host.MikageCharacterArt});
   await tick();assert.equal(panel.ShrinePanel?.ready,true,'Panel child JS should initialize');
   const method={board:'openBoard',map:'openMap',wardrobe:'openWardrobe',life:'openLife'}[kind];panel.ShrinePanel[method]();
   panel.ShrinePanel.dispose();host.MikageShrinePanels.close();assert.equal(host.document.querySelectorAll('[data-mikage-panel-frame]').length,0);}
  for(const branch of ['opening-2','opening-3']){
   rows=[{message_id:0,swipe_id:0,role:'assistant',message:'<MikageOpeningScreen/>',data:{stat_data:clone(initial)}}];
   host.document.querySelector('#chat').innerHTML='<div class="mes" mesid="0"><div class="mes_text"></div></div>';
   emit(events.CHAT_CHANGED);await tick();
   assert.equal(host.document.querySelectorAll('iframe[title="游戏标题页"]').length,1);
   await host.MikageOpeningScreen.bridge.start(branch);await tick();
   assert(rows[0].message.includes('MikageOpeningStarted:'+branch));
   assert.equal(host.document.querySelectorAll('iframe[title="御影神社状态栏"]').length,1);
  }
  host.MikageOpeningScreen.show(true);assert.equal(host.document.querySelectorAll('iframe[title="游戏标题页重播"]').length,1);
  rows=[];host.document.querySelector('#chat').replaceChildren();emit(events.CHAT_CHANGED);await tick();
  assert.equal(host.document.querySelectorAll('#chat iframe').length,0);assert.equal(host.document.querySelectorAll('iframe[title="游戏标题页重播"]').length,0);
  assert(!logs.some(x=>['error','warn','toast-error','jsdom'].includes(x[0])),JSON.stringify(logs));
  console.log('PASS all 3 opening branches, replay cleanup, chat switching, child inline JS; actual module start, ready schema, opening selection, status mount/dedup, 4 panel shells, saved wood=13; writes',writes);
 await tick();
 }finally{console.log('LOGS',JSON.stringify(logs));for(const d of frames)d.window.close();top.window.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
