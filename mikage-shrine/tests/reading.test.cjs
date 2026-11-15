/** DOM lifecycle and data-isolation regression for the actual built module. */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const deps=process.env.MIKAGE_DEBUG_DEPS||'/tmp/mikage-debug/node_modules';
const {JSDOM}=require(path.join(deps,'jsdom'));
const src=fs.readFileSync(path.resolve(__dirname,'../releases/reading-1.0.0/reading.mjs'),'utf8').replace(/^export /gm,'');
const ID='942e5145-090d-52b2-8e13-455609375d17';
const tick=()=>new Promise(r=>setTimeout(r,15));
function fixture(){
 const dom=new JSDOM('<div id="chat"></div><textarea id="send_textarea">existing draft</textarea>',{url:'https://fixture.invalid/',runScripts:'outside-only',pretendToBeVisual:true});
 const w=dom.window,rows=[],bus=new Map();let writes=0;const scripts=[{id:ID,enabled:true}];
 w.SillyTavern={getContext:()=>({characterId:0,characters:[{data:{extensions:{tavern_helper:{scripts}}}}]})};
 w.getChatMessages=id=>rows.filter(r=>r.message_id===id);w.setChatMessages=()=>{writes++;};w.replaceVariables=()=>{writes++;};
 w.eventOn=(key,fn)=>{if(!bus.has(key))bus.set(key,new Set());bus.get(key).add(fn);return{stop:()=>bus.get(key).delete(fn)}};
 w.tavern_events=Object.fromEntries(['CHAT_CHANGED','MESSAGE_RECEIVED','MESSAGE_UPDATED','MESSAGE_SWIPED','MESSAGE_DELETED'].map(x=>[x,x]));w.getButtonEvent=n=>'button:'+n;
 const emit=key=>{for(const fn of [...bus.get(key)||[]])fn();};
 function add(id,text,role='assistant'){
  const row={message_id:id,swipe_id:0,role,message:text,data:{stat_data:{环境:{所在位置:'御影神社'},巴卫:{服装:'usual'}}}};rows.push(row);
  const el=w.document.createElement('div');el.className='mes';el.setAttribute('mesid',id);const body=w.document.createElement('div');body.className='mes_text';const p=w.document.createElement('p');p.textContent=text;body.append(p);el.append(body);w.document.querySelector('#chat').append(el);return{row,el,body,p};
 }
 w.eval(src+'\nwindow.runReading=start;');return{w,rows,bus,emit,add,scripts,writes:()=>writes};
}
(async()=>{
 const f=fixture(),{w,add,emit}=f;
 const opening=add(0,'<MikageOpeningScreen/>\n<StatusPlaceHolderImpl/>');
 const user=add(1,'玩家说的话','user');const turn=add(2,'正文中的 <script>alert(1)</script> 保持为文字');
 const original=turn.p;const dataBefore=JSON.stringify(turn.row.data);let api=w.runReading();await tick();
 assert(!opening.body.hasAttribute('data-mikage-reading'));assert(!user.body.hasAttribute('data-mikage-reading'));
 assert(turn.body.hasAttribute('data-mikage-reading'));assert.equal(turn.body.querySelector('p'),original);assert.equal(turn.body.querySelectorAll('script').length,0);
 assert.equal(turn.body.querySelectorAll('.mr-tools').length,1);
 for(let i=0;i<6;i++)emit('MESSAGE_UPDATED');await tick();assert.equal(turn.body.querySelectorAll('.mr-tools').length,1);assert(!user.body.hasAttribute('data-mikage-reading'));
 // Streamed text modifies the same node; presentation never rewrites it.
 turn.p.textContent='一段很长的中文。'.repeat(300);emit('MESSAGE_UPDATED');await tick();assert.equal(turn.p,original);assert.equal(turn.p.textContent.length,2400);
 // A native edit removes the owned UI; rerender must bind exactly once.
 const edit=w.document.createElement('textarea');edit.className='edit_textarea';turn.el.append(edit);emit('MESSAGE_UPDATED');await tick();assert(!turn.body.hasAttribute('data-mikage-reading'));edit.remove();
 turn.body.replaceChildren(original);emit('MESSAGE_UPDATED');await tick();assert.equal(turn.body.querySelectorAll('.mr-tools').length,1);
 turn.row.swipe_id=1;emit('MESSAGE_SWIPED');await tick();assert.equal(turn.body.querySelectorAll('.mr-tools').length,1);
 const anchor=w.document.createElement('span');anchor.setAttribute('data-mikage-status-host','true');const frame=w.document.createElement('iframe');frame.title='御影神社状态栏';anchor.append(frame);turn.body.append(anchor);await tick();
 assert.equal(turn.body.querySelectorAll('.mr-bridge').length,1);assert.equal(frame.parentNode,anchor);assert.equal(anchor.previousElementSibling.className,'mr-bridge');assert(!user.body.hasAttribute('data-mikage-reading'));
 frame.dispatchEvent(new w.Event('load'));await tick();assert.equal(frame.contentDocument.documentElement.getAttribute('data-mikage-reading-theme'),'paper');
 api.showSettings();assert.equal(w.document.querySelectorAll('[role=dialog]').length,1);
 w.document.querySelector('[data-setting=theme][data-value=night]').click();await tick();assert.equal(turn.body.getAttribute('data-reading-theme'),'night');assert.equal(frame.contentDocument.documentElement.getAttribute('data-mikage-reading-theme'),'night');
 w.document.querySelector('[data-setting=size][data-value="20"]').click();await tick();assert.equal(api.getSettings().size,20);
 w.document.querySelector('.mr-settings-backdrop').dispatchEvent(new w.KeyboardEvent('keydown',{key:'Escape',bubbles:true}));assert.equal(w.document.querySelectorAll('[role=dialog]').length,0);
 // Fresh opening completion mounts one hero from an actual marker, never a fake title.
 opening.row.message='开场正文\n<!--MikageOpeningStarted:opening-1-->';opening.p.textContent='开场正文';emit('MESSAGE_UPDATED');await tick();assert.equal(opening.body.querySelectorAll('.mr-hero').length,1);assert.equal(opening.body.querySelector('.mr-hero-title').textContent,'修缮现场初遇');
 assert.equal(f.writes(),0);assert.equal(JSON.stringify(turn.row.data),dataBefore);assert.equal(w.document.querySelector('#send_textarea').value,'existing draft');
 // Idempotent script reload cleans listeners and old theme sheets.
 api=w.runReading();await tick();assert.equal(turn.body.querySelectorAll('.mr-tools').length,1);assert.equal(w.document.querySelectorAll('style[data-mikage-reading-style=host]').length,1);assert.equal(f.bus.get('button:正文阅读设置').size,1);
 // Switching away from this card restores native content and frame styling.
 f.scripts.length=0;emit('CHAT_CHANGED');await tick();assert(!turn.body.hasAttribute('data-mikage-reading'));assert(!frame.contentDocument.documentElement.hasAttribute('data-mikage-reading-theme'));
 api.dispose();assert.equal(w.document.querySelectorAll('[data-mr-owned]').length,0);assert.equal(w.document.querySelectorAll('style[data-mikage-reading-style]').length,0);assert.equal(turn.body.firstChild,original);assert.equal(f.bus.get('button:正文阅读设置').size,0);
 w.close();console.log('PASS reader: original nodes/data/draft preserved; opening; stream; edit; swipe; iframe theme; settings; reload; scope; dispose');
})().catch(error=>{console.error(error);process.exitCode=1});
