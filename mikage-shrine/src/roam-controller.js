/* 1.8 scene controller: ground-aware walking, arrival-triggered interactions,
 * and an ephemeral travel notebook. Canonical RP state stays with the MVU. */
(() => {
 'use strict';
 const $=id=>document.getElementById(id),root=$('shrine-game'),scene=$('scene');
 const nav=window.MikageNavigation,icon=window.MikageIcon,REGIONS=nav.regions;
 const MOMENTS={
  R01:['sweep','扫一庭秋叶','sweep','把落叶轻轻拢到一处。'],
  R02:['cat','坂道遇见猫','cat','先蹲下来，等它愿意靠近。'],
  R03:['dango','三色团子签','dango','给一串团子搭配喜欢的颜色。'],
  R04:['boat','一只小纸舟','boat','折好纸舟，送它顺流过桥。'],
  R05:['ticket','等车的票根','ticket','给旅程盖上自己的小印章。'],
  R06:['postcard','海风明信片','postcard','把电车、灯塔和海风寄在一张卡上。'],
  R07:['leaves','林间叶拓','leaves','在落叶里找三种不同的纹路。'],
  R08:['firefly','萤火小合奏','firefly','沿着微光，回应芦苇里的小灯。'],
  R09:['drum','练一段太鼓','drum','看一看拍子，再轻轻敲响。'],
  R10:['lantern','灯火慢慢亮','lantern','选一盏喜欢的灯色，点亮这条街。']
 };
 const SIDES={
  R01:[['ema','拜殿 · 绘马','ema','board'],['bell','檐下风铃','bell','listen']],
  R02:[['mail','门前邮筒','mail','listen']],R03:[['craft','手作与生活','life','life']],
  R04:[['wind','坐听河风','wind','listen']],R05:[['board','车站布告','ticket','listen']],
  R06:[['sea','看一会儿海','sea','listen']],R07:[['sign','林间路标','route','listen']],
  R08:[['water','栈道听水','sea','listen']],R09:[['prep','祭礼筹备','life','life']],
  R10:[['gate','灯下鸟居','ema','listen']]
 };
 const LINES={
  R01:['风铃轻响了一下。巴卫把扫帚往你这边挪了挪。','檐下的光落在木纹上，正好够两个人坐。'],
  R02:['邮筒边压着一张邻里的便笺。远处有人收起了晾晒的被单。','巴卫放慢脚步，等那只猫从石墙边经过。'],
  R03:['店门口的暖香顺着风飘过来。巴卫看了一眼你停下来的脚步。','纸袋沙沙作响，店家把刚摆好的点心往前推了推。'],
  R04:['河风从栏杆间穿过，树影在砖路上轻轻摇晃。','巴卫靠在长椅旁，听远处一声自行车铃。'],
  R05:['下一班车还没到。你们可以把这几分钟慢慢花掉。','检票口里传来清脆的一声响，巴卫替你挡住了一阵风。'],
  R06:['海就在轨道另一边。留在站台里，也能看见很远的蓝。','巴卫站在靠海的一侧，袖口被海风轻轻吹起。'],
  R07:['路标上有一点薄苔。顺着木栏往前，叶子的颜色又换了一层。','脚下的落叶轻轻响。巴卫停下来等你看完那片叶脉。'],
  R08:['脚步留在木栈道上。水鸟掠过芦苇，留下一圈很轻的波纹。','巴卫示意你看水边。那一点萤光又在原处亮了起来。'],
  R09:['会所里有新裁的纸条和木头的气味，桌边还留着一张空凳。','巴卫轻轻扶稳鼓架，等你试下一拍。'],
  R10:['灯火把石路照得温温的，走慢一点也没有关系。','巴卫回头看你。鸟居下的风，带来很淡的烤点心香。']
 };
 const cleanups=[],actors={};
 for(const who of ['player','tomoe'])actors[who]={x:0,y:0,tx:0,ty:0,route:[],direction:'front',outfit:who==='player'?'daily':'usual',walkFrame:0,walkElapsed:0,el:$(who+'-actor'),sprite:$(who==='player'?'player-mini':'tomoe-mini')};
 let bridge=null,unsubscribe=null,snapshot=null,disposed=false,connection=0,revision=0,raf=0,lastTick=0,wanderTimer=0,readTimer=0,speechTimer=0,resizeObserver=null,intersection=null,visible=true,wandering=true,lit=false,previewPeriod=null,backdropKey=null,backdropRequest=0,patrol=0,regionId='R01',followTimer=0,pending=null,activity=null,activityRegion=null,notebook=[],memoryScope=null,activeSpot=null,lastFocused=null,listenIndex=0;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const art=()=>window.MikageCharacterArt||window.parent.MikageCharacterArt;
 const field=(v,fallback='—')=>v===undefined||v===null||v===''?fallback:String(v);
 function on(target,name,fn,options){if(!target)return;target.addEventListener(name,fn,options);cleanups.push(()=>target.removeEventListener(name,fn,options));}
 function reportHeight(){if(!disposed)bridge?.resize?.(Math.ceil(root.getBoundingClientRect().height)+2);}
 function say(text){$('speech').textContent=text;$('speech').hidden=false;clearTimeout(speechTimer);speechTimer=setTimeout(()=>{$('speech').hidden=true;},5200);}
 function paint(who){const a=actors[who],api=art();if(!api){a.sprite.classList.add('art-missing');return;}try{api.paint(a.sprite,who,a.outfit,a.direction,a.walkFrame);}catch{a.sprite.classList.add('art-missing');}}
 function loadArt(){const api=art();if(!api)return;api.preloadWalk?.().catch(()=>{});api.installFont?.(document).then(reportHeight).catch(()=>{});paint('player');paint('tomoe');}
 function position(a){a.el.style.left=a.x+'%';a.el.style.top=a.y+'%';a.el.style.zIndex=String(Math.round(a.y*10));a.el.style.width=(7+Math.max(0,a.y-45)*.065)+'%';a.el.dataset.x=a.x.toFixed(2);a.el.dataset.y=a.y.toFixed(2);if(a===actors.player)updateNear();}
 function active(){return !disposed&&visible&&!document.hidden;}
 function cfg(){return REGIONS[regionId];}
 function updateNear(){for(const b of $('region-hotspots').children){const approach=cfg().points.find(p=>p.id===b.dataset.hotspot)?.approach;if(approach)b.classList.toggle('is-near',Math.hypot((actors.player.x-approach[0])*1.5,actors.player.y-approach[1])<12);}}
 function groundOverlay(){const group=$('walk-areas');group.replaceChildren();for(const poly of cfg().walkable){const el=document.createElementNS('http://www.w3.org/2000/svg','polygon');el.setAttribute('points',poly.map(p=>p.join(',')).join(' '));el.classList.add('walk-mask');group.append(el);}}
 function drawRoute(points){$('walk-line').setAttribute('d',points.length>1?'M'+points.map(p=>p.join(',')).join(' L'):'');}
 function settle(who){const a=actors[who];a.walkFrame=0;a.walkElapsed=0;a.el.classList.remove('walking');position(a);paint(who);if(who==='player'){a.direction='front';$('destination').hidden=true;drawRoute([]);const next=pending;pending=null;if(next&&next.region===regionId&&active())next.run();}else scheduleWander(4800);}
 function stop(who){const a=actors[who];a.route=[];a.tx=a.x;a.ty=a.y;settle(who);}
 function tick(time){raf=0;if(!active()){lastTick=0;return;}const elapsed=lastTick?Math.max(0,(time-lastTick)/1000):0,dt=Math.min(.05,elapsed);lastTick=time;let moving=false;
  for(const [who,a] of Object.entries(actors)){if(!a.route.length)continue;const target=a.route[0],dx=target[0]-a.x,dy=target[1]-a.y,dist=Math.hypot(dx*1.5,dy),step=Math.min(dist,dt*(who==='player'?23:16));moving=true;if(dist<.03||step>=dist){a.x=target[0];a.y=target[1];a.route.shift();position(a);if(!a.route.length)settle(who);continue;}a.x+=dx/dist*step;a.y+=dy/dist*step;const direction=Math.abs(dx*1.5)>Math.abs(dy)?(dx>0?'right':'left'):(dy>0?'front':'back');a.el.classList.add('walking');a.direction=direction;a.walkElapsed+=dt;if(a.walkElapsed>=.15){a.walkElapsed%=.15;a.walkFrame=(a.walkFrame+1)%4;}position(a);paint(who);}
  if(moving)raf=requestAnimationFrame(tick);else lastTick=0;
 }
 function animate(){if(active()&&!raf)raf=requestAnimationFrame(tick);}
 function walk(who,x,y){const a=actors[who],points=nav.route(regionId,[a.x,a.y],[x,y]),last=points.at(-1)||[a.x,a.y];a.route=points.slice(1);a.tx=last[0];a.ty=last[1];if(who==='player'){drawRoute(points);$('destination').style.left=last[0]+'%';$('destination').style.top=last[1]+'%';$('destination').hidden=false;}if(!a.route.length)settle(who);else animate();return last;}
 function walkTogether(x,y){walk('player',x,y);clearTimeout(followTimer);clearTimeout(wanderTimer);wanderTimer=0;if(wandering)followTimer=setTimeout(()=>{if(!active()||activity)return;const side=x>50?-4:4;walk('tomoe',x+side,y+1);},300);}
 function scheduleWander(delay=5600){if(wanderTimer||!wandering||!active()||reduced.matches||activity||pending)return;wanderTimer=setTimeout(()=>{wanderTimer=0;if(!active()||activity||pending||!wandering)return;const [x,y]=cfg().patrol[patrol++%cfg().patrol.length];walk('tomoe',x,y);},delay);}
 function selectSpot(b){for(const el of $('region-hotspots').children)el.classList.toggle('is-selected',el===b);activeSpot=b;}
 function reach(point,run,b){if(!snapshot?.进度){say('这页记录还没有准备好，请稍等或重读记录。');return;}closeActivity(false);pending=null;clearTimeout(wanderTimer);wanderTimer=0;selectSpot(b);pending={region:regionId,run};walkTogether(...point.approach);}
 function makeSpot(point,label,type,action){const b=document.createElement('button');b.type='button';b.className='region-hotspot'+(point.x<15?' spot-edge-left':point.x>85?' spot-edge-right':'');b.dataset.hotspot=point.id;const offset=point.id==='bell'?[-10,0]:[0,-5];const bx=Math.max(7,Math.min(93,point.x+offset[0])),by=Math.max(9,Math.min(89,point.y+offset[1]));b.style.left=bx+'%';b.style.top=by+'%';const line=document.createElementNS('http://www.w3.org/2000/svg','line');line.setAttribute('x1',bx);line.setAttribute('y1',by);line.setAttribute('x2',point.x);line.setAttribute('y2',point.y);$('hotspot-leaders')?.append(line);b.innerHTML='<span class="spot-icon">'+icon(type)+'</span><span class="spot-label"></span>';b.querySelector('.spot-label').textContent=label;b.setAttribute('aria-label',label+'，走近互动');b.title=label;b.addEventListener('click',()=>reach(point,action,b));return b;}
 function renderHotspots(){const host=$('region-hotspots');host.replaceChildren();const leaders=document.createElementNS('http://www.w3.org/2000/svg','svg');leaders.id='hotspot-leaders';leaders.setAttribute('viewBox','0 0 100 100');leaders.setAttribute('preserveAspectRatio','none');leaders.setAttribute('aria-hidden','true');host.append(leaders);const [id,title,type]=MOMENTS[regionId],p=cfg().points.find(p=>p.id===id);if(p)host.append(makeSpot(p,title,type,()=>startActivity()));for(const [key,label,kind,action]of SIDES[regionId]){const point=cfg().points.find(p=>p.id===key);if(!point)continue;host.append(makeSpot(point,label,kind,()=>action==='listen'?say(LINES[regionId][listenIndex++%2]):open(action)));}for(const b of host.children)b.classList.toggle('is-complete',b.dataset.hotspot===id&&notebook.some(n=>n.region===regionId));updateNear();}
 function switchRegion(next){next=REGIONS[next]?next:'R01';if(regionId===next&&scene.dataset.region)return;pending=null;closeActivity(false);closeProp();regionId=next;const c=cfg();scene.dataset.region=next;scene.setAttribute('aria-label',c.name+'，可沿地面散步');$('region-art').dataset.region=next;$('region-art').setAttribute('aria-label',c.name+'风景');$('scene-plaque').textContent=c.name;$('offsite').hidden=true;patrol=0;listenIndex=0;clearTimeout(wanderTimer);wanderTimer=0;clearTimeout(followTimer);for(const who of ['player','tomoe']){const [x,y]=nav.project(next,...c.spawn[who]);Object.assign(actors[who],{x,y,tx:x,ty:y,route:[]});position(actors[who]);paint(who);}drawRoute([]);$('destination').hidden=true;$('speech').hidden=true;scene.classList.toggle('moment-complete',notebook.some(n=>n.region===next));groundOverlay();renderHotspots();$('moment').innerHTML=icon(MOMENTS[next][2])+'<span>此地散策</span>';$('moment').setAttribute('aria-label',MOMENTS[next][1]);scheduleWander(2200);}
 function closeActivity(restore=true){const current=activity;activity=null;activityRegion=null;current?.close?.({notify:false});if(restore&&lastFocused?.isConnected)lastFocused.focus({preventScroll:true});if(restore)scheduleWander();}
 function startActivity(){if(disposed||!active())return;closeActivity(false);pending=null;clearTimeout(wanderTimer);wanderTimer=0;stop('tomoe');lastFocused=activeSpot||document.activeElement;activityRegion=regionId;const ownRegion=regionId;const games=window.parent?.MikageMinigames;if(typeof games?.open!=='function'){activityRegion=null;say('独立散策舞台正在准备，请稍后再试。');return;}activity=games.open({region:ownRegion,reducedMotion:reduced.matches,period:window.MikageDaylight?.resolve(snapshot?.环境?.时段)||'day',onClose:()=>{if(activityRegion!==ownRegion)return;activity=null;activityRegion=null;if(lastFocused?.isConnected)lastFocused.focus({preventScroll:true});scheduleWander();},onComplete:result=>{if(disposed||regionId!==ownRegion||activityRegion!==ownRegion)return;notebook=notebook.filter(x=>x.region!==ownRegion);notebook.push({...result,day:snapshot?.环境?.天数||1});notebook=notebook.slice(-10);bridge?.saveRoamMemories?.(notebook);scene.classList.add('moment-complete');renderHotspots();renderNotebook();$('roam-toast').hidden=false;$('roam-toast-text').textContent='这一幕收进散策手帖了。'+result.detail;say(result.detail);}});if(!activity){activityRegion=null;say('独立散策舞台没有打开，请稍后再试。');}}
 function renderNotebook(){const grid=$('memory-grid');grid.replaceChildren();$('journal-count').textContent=notebook.length?notebook.length+' 枚小记':'还未落笔';if(!notebook.length){const p=document.createElement('p');p.className='memory-empty';p.textContent='走近一处微光，留下一枚小记。';grid.append(p);return;}for(const note of notebook){const card=document.createElement('article');card.className='memory-card';card.innerHTML=icon(MOMENTS[note.region]?.[2]||'flower');const title=document.createElement('strong');title.textContent=note.title;const detail=document.createElement('p');detail.textContent=note.detail;const where=document.createElement('p');where.textContent='第 '+note.day+' 日 · '+REGIONS[note.region].name;const draft=document.createElement('button');draft.type='button';draft.textContent='带入接下来的对话';draft.addEventListener('click',async()=>{const text='（刚才散策时，我在'+REGIONS[note.region].name+'体验了「'+note.title+'」：'+note.detail+'）';try{if(typeof bridge?.draft!=='function')throw Error('请把这段小记复制到对话里。');await bridge.draft(text);say('小记已放进输入框，可以修改后发送。');}catch(e){say(e.message||'暂时无法填入，请稍后再试。');}});card.append(title,detail,where,draft);grid.append(card);}}
 function toggleNotebook(force){const show=typeof force==='boolean'?force:$('roam-journal').hidden;$('roam-journal').hidden=!show;$('journal-button').setAttribute('aria-expanded',String(show));if(show)renderNotebook();reportHeight();}
 function updateLight(){
  const natural=window.MikageDaylight.resolve(snapshot?.环境?.时段),period=previewPeriod||natural;
  scene.dataset.light=period==='night'?'night':/雨/.test(String(snapshot?.环境?.天气||''))?'rain':'warm';
  lit=period==='night';scene.classList.toggle('lit',lit);
  const label={day:'白天',dusk:'黄昏',night:'夜晚'},button=$('lantern');
  button.setAttribute('aria-pressed',String(!!previewPeriod));button.querySelector('span').textContent=previewPeriod?label[period]:'自动';
  button.setAttribute('aria-label',previewPeriod?'正在预览'+label[period]+'，点击切换景色':'景色随剧情时段变化，点击预览白天');
  button.title=previewPeriod?'仅预览景色，不改变剧情时间':'随剧情：'+label[period];
  $('weather').classList.toggle('rain',/雨/.test(String(snapshot?.环境?.天气||'')));
  const key=regionId+':'+period;if(key===backdropKey)return;backdropKey=key;
  const request=++backdropRequest,element=$('region-art'),target=regionId,source=window.MikageDaylight.url(target,period);
  element.dataset.loading='true';
  if(element.dataset.artRegion!==target){element.style.backgroundImage='';element.style.backgroundSize='';delete scene.dataset.period;}
  if(!source){delete element.dataset.loading;return;}
  const candidates=[source,source.replace('cdn.jsdelivr.net','testingcf.jsdelivr.net'),source.replace('https://cdn.jsdelivr.net/gh/','https://raw.githubusercontent.com/').replace('@','/')];let attempt=0;
  function load(){const image=new Image();image.onload=()=>{if(disposed||request!==backdropRequest)return;element.style.backgroundImage='url('+JSON.stringify(image.src)+')';element.style.backgroundSize='100% 100%';element.style.backgroundPosition='center';element.dataset.artRegion=target;element.dataset.period=period;scene.dataset.period=period;delete element.dataset.loading;};image.onerror=()=>{if(disposed||request!==backdropRequest)return;if(++attempt<candidates.length)load();else{delete element.dataset.loading;backdropKey=null;button.title='景色资源暂未载入，点击可重试';}};image.src=candidates[attempt];}load();
 }
 function renderBuildings(){const list=$('facility-list');list.replaceChildren();const names=['鸟居','参道','拜殿','社务所','庭院'],labels=['尚未修复','待整修','备料中','施工中','已完工'];for(const name of names){const level=snapshot?.神社?.[name];const row=document.createElement('div');row.className='facility-line';const title=document.createElement('span');title.textContent=name;const blocks=document.createElement('span');blocks.className='facility-blocks';for(let i=1;i<=4;i++){const b=document.createElement('i');if(Number.isInteger(level)&&i<=level)b.className='on';blocks.append(b);}const status=document.createElement('small');status.textContent=Number.isInteger(level)?labels[level]||'—':'未读取';row.append(title,blocks,status);list.append(row);const overlay=scene.querySelector('[data-facility="'+name+'"]');if(overlay){overlay.hidden=!Number.isInteger(level)||level<2||level===4;overlay.dataset.level=String(level);}}
  const mats=$('materials');mats.replaceChildren();for(const name of ['木材','石材','奉纳','良木','陶瓦','朱砂','灵绢','灵木','月石']){const chip=document.createElement('span');chip.textContent=name+' '+field(snapshot?.神社?.[name]);mats.append(chip);}}
 function render(value){snapshot=value&&typeof value==='object'?value:null;const p=snapshot?.进度;const ready=!!p;root.dataset.testing=String(!!window.parent.MikageDeveloperSandbox?.active);if(ready)delete root.dataset.diagnostic;
  $('phase').textContent=ready?(p.已通关?'通关 · 自由游玩':'第'+field(p.阶段)+'章 · '+field(p.阶段名称)):'本楼神社记录尚未就绪';$('clock').textContent=ready?['第'+field(snapshot.环境?.天数)+'日',field(snapshot.环境?.时段),field(snapshot.环境?.天气)].join(' · '):'记录未读取';$('fame').textContent=field(p?.知名度);$('prosperity').textContent=field(p?.繁荣度);$('quest-count').textContent='本章绘马 '+field(p?.阶段完成数)+' / '+field(p?.阶段目标);$('stage-name').textContent=ready?'修缮 · '+field(p.阶段设施):'等待本楼初始化后自动重读';const target=p?.阶段目标,n=p?.阶段完成数;const ratio=Number.isFinite(n)&&Number.isFinite(target)&&target>0?Math.min(100,Math.max(0,n/target*100)):null;$('progress-label').textContent=ratio===null?'—':Math.round(ratio)+'%';$('progress-fill').style.width=(ratio||0)+'%';if(ratio===null)$('progress-meter').removeAttribute('aria-valuenow');else $('progress-meter').setAttribute('aria-valuenow',String(Math.round(ratio)));$('mood').textContent='巴卫 · '+field(snapshot?.巴卫?.心情);$('retry').hidden=ready;root.dataset.ready=String(ready);$('note').textContent=ready?'轻点地面散步，走近微光互动。点脚步图标可查看小路。':'这一楼还没有可读取的记录；初始化后会自动重读，也可点“重读记录”。';const available=snapshot?.绘马板?.绘马;$('ema-notice').hidden=!Array.isArray(available)||!available.some(x=>x.性质==='主线'&&x.状态==='未接');const api=art();for(const actor of ['player','tomoe']){const id=actor==='player'?snapshot?.玩家?.衣装:snapshot?.巴卫?.服装;if(id&&api?.outfits(actor).some(x=>x.id===id))actors[actor].outfit=id;paint(actor);}switchRegion(String(snapshot?.地图?.当前地区||'R01'));if(snapshot?.巴卫?.位置)$('tomoe-actor').setAttribute('aria-label','巴卫 · '+snapshot.巴卫.位置+' · 点击走近');window.MikageLifeScene?.render(document,snapshot);renderBuildings();updateLight();scheduleWander();reportHeight();}
 function diagnose(){if(snapshot?.进度||!bridge?.getDiagnostics)return;try{const info=bridge.getDiagnostics();if(info?.message){$('clock').textContent='记录待就绪';$('note').textContent=info.message;root.dataset.diagnostic=info.code||'unavailable';}}catch{}}
 async function read(){const own=connection,stamp=revision;if(!bridge?.getState)return;try{const value=await bridge.getState();if(!disposed&&connection===own&&revision===stamp){render(value);diagnose();}}catch(error){if(connection===own&&!disposed){render(null);$('note').textContent=error?.message||'本楼记录暂时无法读取，请稍后重试。';}}}
 function connect(next){if(disposed)return;if(bridge===next&&snapshot?.进度){read();return;}connection++;unsubscribe?.();unsubscribe=null;clearTimeout(readTimer);bridge=next;window.MikageStatusBridge=next;const scope=[next?.chatEpoch,next?.messageId,next?.swipeId].join(':');if(memoryScope!==scope){memoryScope=scope;notebook=next?.getRoamMemories?.()||[];closeActivity(false);toggleNotebook(false);$('roam-toast').hidden=true;}render(null);if(typeof bridge?.subscribe==='function')unsubscribe=bridge.subscribe(value=>{revision++;if(!disposed){render(value);diagnose();}});read();reportHeight();}
 async function open(kind){if(!snapshot?.进度){say('这页记录还没有准备好，请稍等或重读记录。');return;}try{if(bridge?.open)await bridge.open(kind);else if(window.parent?.MikageShrinePanels?.open)await window.parent.MikageShrinePanels.open(kind);else throw Error('神社面板尚未就绪。');}catch(error){say(error.message||'暂时无法打开，请稍后再试。');}}

 function closeProp(){const sheet=$('prop-sheet');if(sheet){sheet.hidden=true;sheet.replaceChildren();}reportHeight();}
 function showProp(detail){if(regionId!=='R01'||!detail)return;closeActivity(false);const sheet=$('prop-sheet');sheet.replaceChildren();sheet.hidden=false;const title=document.createElement('strong');title.textContent=detail.name;const text=document.createElement('p');const descriptions={wind_chime:'风铃轻轻摇动，檐下多了一声清响。',lantern:'纸灯笼的光落在身边，照出温暖的纸纹。',zabuton:'坐垫软软地陷下去一点，正好可以歇一会儿。',morning_glory:'牵牛花沿着细枝舒展，叶片被风轻轻掀起。',bento:'便当整整齐齐地摆着，还留着熟悉的香气。',tea_set:'茶杯映着檐下的光，坐一会儿也很好。',flower_tea:'花草的淡香随着杯口的暖意散开。'};text.textContent=descriptions[detail.item]||'停下来看看，日常的小物也有自己的样子。';const controls=document.createElement('div');const manage=document.createElement('button');manage.type='button';manage.textContent='管理布置';manage.addEventListener('click',()=>{closeProp();open('life');});const close=document.createElement('button');close.type='button';close.textContent='收起';close.addEventListener('click',closeProp);controls.append(manage,close);sheet.append(title,text,controls);reportHeight();}
 on(document,'mikage:decoration-interact',event=>showProp(event.detail));
 function pause(){if(raf)cancelAnimationFrame(raf);raf=0;lastTick=0;clearTimeout(wanderTimer);wanderTimer=0;clearTimeout(followTimer);for(const [who,a]of Object.entries(actors)){a.walkFrame=0;a.walkElapsed=0;a.el.classList.remove('walking');paint(who);}}
 function resume(){if(active()){animate();scheduleWander();}}
 function dispose(){if(disposed)return;disposed=true;pending=null;connection++;closeActivity(false);pause();clearTimeout(speechTimer);clearTimeout(readTimer);unsubscribe?.();resizeObserver?.disconnect();intersection?.disconnect();cleanups.forEach(fn=>fn());notebook=[];}
 on($('walk-zone'),'pointerdown',event=>{if(event.isPrimary!==false&&event.button===0){event.preventDefault();event.currentTarget.blur();}});
 on($('walk-zone'),'click',event=>{if(activity)return;const box=scene.getBoundingClientRect();if(!box.width||!box.height)return;pending=null;selectSpot(null);const x=(event.clientX-box.left)/box.width*100,y=(event.clientY-box.top)/box.height*100;walkTogether(x,y);});
 on($('walk-zone'),'keydown',event=>{const delta={ArrowLeft:[-4,0],ArrowRight:[4,0],ArrowUp:[0,-4],ArrowDown:[0,4]}[event.key];if(delta){event.preventDefault();pending=null;walkTogether(actors.player.tx+delta[0],actors.player.ty+delta[1]);}});
 root.querySelectorAll('[data-open]').forEach(button=>on(button,'click',()=>open(button.dataset.open)));
 on($('tomoe-actor'),'click',()=>{pending=null;const target=nav.project(regionId,actors.tomoe.x-4,actors.tomoe.y+1);pending={region:regionId,run:()=>say(LINES[regionId][listenIndex++%2])};walk('player',...target);});
 on($('wander'),'click',()=>{wandering=!wandering;$('wander').setAttribute('aria-pressed',String(wandering));$('wander').setAttribute('aria-label',wandering?'巴卫自主漫步：开':'巴卫自主漫步：停');clearTimeout(wanderTimer);wanderTimer=0;if(!wandering)stop('tomoe');else scheduleWander(600);});
 on($('lantern'),'click',()=>{previewPeriod=({auto:'day',day:'dusk',dusk:'night',night:null})[previewPeriod||'auto'];updateLight();});
 on($('paths'),'click',()=>{const show=scene.classList.toggle('show-paths');$('paths').setAttribute('aria-pressed',String(show));});
 on($('moment'),'click',()=>{const p=cfg().points.find(p=>p.id===MOMENTS[regionId][0]);if(p)reach(p,()=>startActivity(),$('region-hotspots').querySelector('[data-hotspot="'+p.id+'"]'));});
 on($('journal-button'),'click',()=>toggleNotebook());on($('close-journal'),'click',()=>toggleNotebook(false));
 on($('buildings'),'click',()=>{$('buildings-sheet').hidden=!$('buildings-sheet').hidden;$('buildings').setAttribute('aria-expanded',String(!$('buildings-sheet').hidden));reportHeight();});
 on($('close-buildings'),'click',()=>{$('buildings-sheet').hidden=true;$('buildings').setAttribute('aria-expanded','false');$('buildings').focus();reportHeight();});
 on($('retry'),'click',read);on(document,'keydown',event=>{if(event.key==='Escape'){if(activity)closeActivity();else toggleNotebook(false);}});
 on(document,'visibilitychange',()=>document.hidden?pause():resume());on(window,'pagehide',dispose);on(window,'resize',reportHeight);on(window,'mikage:art-ready',loadArt);if(window.parent!==window)on(window.parent,'mikage:art-ready',loadArt);on(reduced,'change',()=>{pause();resume();});
 if(typeof ResizeObserver==='function'){resizeObserver=new ResizeObserver(reportHeight);resizeObserver.observe(root);}if(typeof IntersectionObserver==='function'){intersection=new IntersectionObserver(entries=>{visible=entries.some(e=>e.isIntersecting);visible?resume():pause();});intersection.observe(root);}
 window.MikageStatusScene={connect,dispose};loadArt();switchRegion('R01');render(null);if(window.MikageStatusBridge)connect(window.MikageStatusBridge);resume();
})();
