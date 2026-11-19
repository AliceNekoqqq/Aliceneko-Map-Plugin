/** DOM lifecycle and data-isolation regression for the actual built module. */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const deps=process.env.MIKAGE_DEBUG_DEPS||'/tmp/mikage-debug/node_modules';
const {JSDOM}=require(path.join(deps,'jsdom'));
const src=fs.readFileSync(path.resolve(__dirname,'../releases/reading-1.1.5/reading.mjs'),'utf8').replace(/^export /gm,'');
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
 w.localStorage.setItem('mikage:reading:1',JSON.stringify({size:16,motion:false}));
 const original=turn.p;const dataBefore=JSON.stringify(turn.row.data);let api=w.runReading();await tick();
 assert(!opening.body.hasAttribute('data-mikage-reading'));assert(!user.body.hasAttribute('data-mikage-reading'));
 assert(turn.body.hasAttribute('data-mikage-reading'));assert.equal(turn.body.querySelector('p'),original);assert.equal(turn.body.querySelectorAll('script').length,0);
 assert.equal(api.getSettings().size,16,'Existing size preference survives upgrade');assert.equal(turn.body.getAttribute('data-reading-motion'),'false');
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
 assert.equal(w.getComputedStyle(turn.body.querySelector('.mr-bridge span')).backgroundColor,'rgba(0, 0, 0, 0)');
 const viewport=new w.EventTarget();Object.assign(viewport,{width:355,height:520,offsetTop:24,offsetLeft:0});
 Object.defineProperty(w,'visualViewport',{value:viewport,configurable:true});w.document.body.style.transform='translateZ(0)';
 api.showSettings();assert.equal(w.document.querySelectorAll('[role=dialog]').length,1);
 const backdrop=w.document.querySelector('.mr-settings-backdrop'),settingsPanel=backdrop.querySelector('[role=dialog]');
 assert.equal(backdrop.parentNode,w.document.documentElement,'Portal escapes transformed body');
 assert.equal(backdrop.style.top,'24px');assert.equal(backdrop.style.height,'520px');assert.equal(settingsPanel.style.maxHeight,'496px');
 assert.equal(w.getComputedStyle(settingsPanel.querySelector('header')).position,'sticky');
 viewport.height=320;viewport.offsetTop=120;viewport.dispatchEvent(new w.Event('resize'));
 assert.equal(backdrop.style.top,'120px');assert.equal(backdrop.style.height,'320px');assert.equal(settingsPanel.style.maxHeight,'296px');
 w.document.querySelector('[data-setting=theme][data-value=night]').click();await tick();assert.equal(turn.body.getAttribute('data-reading-theme'),'night');assert.equal(frame.contentDocument.documentElement.getAttribute('data-mikage-reading-theme'),'night');
 assert.equal(w.document.querySelector('.mr-settings').getAttribute('data-reading-theme'),'night','Open settings change theme with the reading surface');
 assert.equal(w.getComputedStyle(turn.body.querySelector('.mr-bridge span')).backgroundColor,'rgba(0, 0, 0, 0)');
 w.document.querySelector('[data-setting=size][data-value="20"]').click();await tick();assert.equal(api.getSettings().size,20);
 w.document.querySelector('.mr-settings-backdrop').dispatchEvent(new w.KeyboardEvent('keydown',{key:'Escape',bubbles:true}));assert.equal(w.document.querySelectorAll('[role=dialog]').length,0);
 viewport.height=220;viewport.dispatchEvent(new w.Event('resize'));assert.equal(backdrop.style.height,'320px','Closed popup removed viewport listeners');
 // Fresh opening completion mounts one hero from an actual marker, never a fake title.
 opening.row.message='开场正文\n<!--MikageOpeningStarted:opening-1-->';opening.p.textContent='开场正文';emit('MESSAGE_UPDATED');await tick();assert.equal(opening.body.querySelectorAll('.mr-hero').length,1);assert.equal(opening.body.querySelector('.mr-hero-title').textContent,'修缮现场初遇');

 // Scene image comes from story time, while night theme stays an independent preference.
 assert.equal(opening.body.querySelectorAll('.mr-lantern').length,0,'Do not duplicate the lantern already in the illustration');
 opening.row.data.stat_data.环境.时段='夜晚';emit('MESSAGE_UPDATED');await tick();
 assert(opening.body.querySelector('.mr-hero').style.getPropertyValue('--mr-hero-image').includes('r01-night.webp'));
 opening.row.data.stat_data.环境.时段='午后';emit('MESSAGE_UPDATED');await tick();
 assert(opening.body.querySelector('.mr-hero').style.getPropertyValue('--mr-hero-image').includes('veranda-header-v2.png'));
 assert.equal(opening.body.getAttribute('data-reading-theme'),'night');
 opening.row.data.stat_data.环境.所在位置='神社回廊';emit('MESSAGE_UPDATED');await tick();
 assert(opening.body.querySelector('.mr-context').textContent.includes('神社回廊'));
 // A missing wardrobe record clears the old portrait instead of showing stale clothes.
 w.MikageCharacterArt={fingerprint:'fixture',rendererRevision:'fixture',portrait:()=> 'https://fixture.invalid/portrait.png',portraitPlacement:()=>({width:100,height:150,left:0,top:0,visibleTop:0})};emit('MESSAGE_UPDATED');await tick();
 assert.equal(opening.body.querySelectorAll('.mr-hero-art').length,1);
 delete opening.row.data.stat_data.巴卫.服装;emit('MESSAGE_UPDATED');await tick();
 assert.equal(opening.body.querySelectorAll('.mr-hero-art').length,0);
 assert.equal(f.writes(),0);assert.equal(JSON.stringify(turn.row.data),dataBefore);assert.equal(w.document.querySelector('#send_textarea').value,'existing draft');
 // Idempotent script reload cleans listeners and old theme sheets.
 api=w.runReading();await tick();assert.equal(turn.body.querySelectorAll('.mr-tools').length,1);assert.equal(w.document.querySelectorAll('style[data-mikage-reading-style=host]').length,1);assert.equal(f.bus.get('button:正文阅读设置').size,1);
 // Switching away from this card restores native content and frame styling.
 f.scripts.length=0;emit('CHAT_CHANGED');await tick();assert(!turn.body.hasAttribute('data-mikage-reading'));assert(!frame.contentDocument.documentElement.hasAttribute('data-mikage-reading-theme'));
 api.dispose();assert.equal(w.document.querySelectorAll('[data-mr-owned]').length,0);assert.equal(w.document.querySelectorAll('style[data-mikage-reading-style]').length,0);assert.equal(turn.body.firstChild,original);assert.equal(f.bus.get('button:正文阅读设置').size,0);
 w.close();
 for(const [marker,expected]of [[{role:'assistant'},true],[{is_user:false},true],[{mes_type:'assistant'},true],[{is_user:true},false]]){
  const g=fixture(),item=g.add(0,'正文<!--MikageOpeningStarted:opening-1-->');delete item.row.role;Object.assign(item.row,marker);
  const data=JSON.stringify(item.row.data),reader=g.w.runReading();await tick();
  assert.equal(item.body.hasAttribute('data-mikage-reading'),expected,JSON.stringify(marker));
  assert.equal(item.body.querySelectorAll('.mr-hero').length,expected?1:0);assert.equal(JSON.stringify(item.row.data),data);assert.equal(g.writes(),0);
  reader.dispose();g.w.close();
 }
 console.log('PASS reader: native content and state preserved; lifecycle; all 3 assistant markers; user excluded');
})().catch(error=>{console.error(error);process.exitCode=1});
