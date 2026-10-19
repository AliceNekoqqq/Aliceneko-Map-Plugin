const MikageSchoolFonts=new WeakMap();
function installMikageSchoolFont(host,doc){
 if(MikageSchoolFonts.has(doc))return MikageSchoolFonts.get(doc);
 if(host.FontFace&&doc.fonts){try{const font=new host.FontFace('Mikage School','url("'+SCHOOL_FONT_URL+'")');doc.fonts.add(font);const ready=font.load().catch(()=>{});MikageSchoolFonts.set(doc,ready);return ready;}catch{}}
 return Promise.resolve();
}
function mountMikageSchool(host,container,options={}){
 const doc=container.ownerDocument,M=MikageSchoolModel,stops=[],downloads=new Set();
 let s=M.create(),disposed=false,raf=0,lastTime=0,screenKey='',gateKey=-1,tokens=[],recorded=false,outcome=null,storageNote='';
 let look={player:'daily',tomoe:'usual'},direction='front',directionUntil=0,swipe=null;
 const make=(tag,cls,text)=>{const el=doc.createElement(tag);if(cls)el.className=cls;if(text!==undefined)el.textContent=text;return el;};
 const on=(target,event,fn,opts)=>{target.addEventListener(event,fn,opts);stops.push(()=>target.removeEventListener(event,fn,opts));};
 const root=make('section','mkschool');root.dataset.region='R02';root.setAttribute('aria-label','樱坂拾页记');
 const head=make('header','mks-head'),heading=make('div');heading.append(make('span','mks-kicker','宇庭高校 · 樱坂'),make('h3','','放学路上的散页'));head.append(heading,make('span','mks-seal','风中拾页'));
 const checkpoints=make('div','mks-checkpoints');M.sections.forEach((name,i)=>checkpoints.append(make('span','mks-checkpoint',String(i+1).padStart(2,'0')+' '+name)));
 const stage=make('div','mks-stage'),image=make('img','mks-backdrop');image.alt='樱花树下的宇庭高校外道路';
 const source=options.art?.R02,url=typeof source==='string'?source:source?.[options.period||'day'];
 if(typeof url==='string'&&/^https:\/\/(cdn\.jsdelivr\.net|raw\.githubusercontent\.com)\//.test(url)){image.src=url;stage.append(image);}
 const lanes=make('div','mks-lanes');for(let i=0;i<3;i++)lanes.append(make('div','mks-lane'));stage.append(lanes);
 const hud=make('div','mks-stagehud'),sectionBadge=make('span','mks-badge'),notesBadge=make('span','mks-badge');hud.append(sectionBadge,notesBadge);
 const forecast=make('div','mks-next'),shift=make('div','mks-shift'),tokenLayer=make('div','mks-actors'),actors=make('div','mks-actors');
 const player=make('div','mks-actor'),tomoe=make('div','mks-actor is-companion'),playerSprite=make('span'),tomoeSprite=make('span');player.append(playerSprite);tomoe.append(tomoeSprite);actors.append(tomoe,player);
 const curtain=make('div','mks-curtain');stage.append(hud,forecast,shift,tokenLayer,actors,curtain);
 const talk=make('div','mks-talk'),talkText=make('p');talkText.setAttribute('role','status');talkText.setAttribute('aria-live','polite');talkText.setAttribute('aria-atomic','true');talk.append(make('span','mks-talk-label','途中'),talkText);
 const controls=make('div','mks-controls'),tools=make('div','mks-tools'),hint=make('p','mks-hint','点左右换道，也可在道路上横滑；键盘 ← / → 换道，空格走一步。纸页与障碍到达身前才判定。');
 function button(label,fn,parent=tools,cls=''){const b=make('button',cls,label);b.type='button';b.onclick=()=>{if(!disposed)fn();};parent.append(b);return b;}
 const left=button('向左走',()=>move(-1),controls),step=button('走一步',()=>{M.advance(s,.25);view();},controls),right=button('向右走',()=>move(1),controls);
 const assist=button('请巴卫挡一下',()=>{M.guard(s);view();}),pause=button('暂停',()=>{if(s.phase!=='walk')return;s.paused=!s.paused;view();}),slow=button('放慢节奏',()=>{s.slow=!s.slow;view();}),mode=button('切为逐步',()=>{s.mode=s.mode==='step'?'walk':'step';stop();view();});
 const footer=make('div','mks-tools');button('重新走一次',reset,footer);button('导出手记',exportBook,footer);button('回到地图',()=>options.onClose?.(),footer);
 const book=make('details','mks-book'),bookTitle=make('summary','','旧物回忆册'),bookBody=make('div');book.append(bookTitle,bookBody);on(book,'toggle',()=>{if(book.open)readBook();});
 root.append(head,checkpoints,stage,talk,controls,tools,hint,footer,book);container.append(root);
 function readBook(){bookBody.replaceChildren();const entries=Object.values(options.getMemoryBook?.().entries||{});if(!entries.length){bookBody.append(make('p','','还没有收录小物。走完这段路，收一枚散页夹。'));return;}entries.forEach(entry=>bookBody.append(make('p','',String(entry.item||entry.id)+' · '+String(entry.detail||entry.line||''))));}
 function exportBook(){
  const blob=new host.Blob([JSON.stringify({schema:1,exportedAt:new Date().toISOString(),entries:options.getMemoryBook?.().entries||{}},null,2)],{type:'application/json'}),url=host.URL.createObjectURL(blob);downloads.add(url);
  const a=make('a');a.href=url;a.download='御影神社_旧物回忆册.json';doc.body.append(a);a.click();a.remove();
 }
 function stop(){if(raf)host.cancelAnimationFrame(raf);raf=0;lastTime=0;}
 function animate(time){raf=0;if(disposed||s.phase!=='walk'||s.paused||s.mode==='step')return;const dt=lastTime?Math.min(.1,(time-lastTime)/1000):0;lastTime=time;M.tick(s,dt);view(false);if(!raf&&s.phase==='walk'&&!s.paused&&s.mode!=='step')raf=host.requestAnimationFrame(animate);}
 function move(delta){if(M.move(s,delta)){direction=delta>0?'right':'left';directionUntil=host.performance.now()+260;}view();}
 function reset(){stop();s=M.create();screenKey='';gateKey=-1;recorded=false;outcome=null;storageNote='';direction='front';view();}
 function start(mode){if(M.start(s,mode)){root.focus?.({preventScroll:true});view();}}
 function paintSprite(el,actor,outfit,frame){
  const art=host.MikageCharacterArt;
  try{if(typeof art?.paint!=='function')throw Error('not ready');art.paint(el,actor,outfit,host.performance.now()<directionUntil?direction:'front',frame);el.classList.remove('mks-fallback');el.textContent='';}
  catch{el.style.backgroundImage='';el.style.clipPath='';el.classList.add('mks-fallback');el.textContent=actor==='player'?'你':'巴卫';}
 }
 function receiveLook(value){if(disposed||!value)return;look={player:String(value.player||'daily'),tomoe:String(value.tomoe||'usual')};view();}
 try{const api=host.MikageShrinePanels;const value=api?.getAppearance?.();if(value?.then)value.then(receiveLook,()=>{});else if(value)look={player:value.player||'daily',tomoe:value.tomoe||'usual'};if(typeof api?.subscribeAppearance==='function')stops.push(api.subscribeAppearance(receiveLook));}catch{}
 function renderTokens(){
  if(gateKey!==s.index){gateKey=s.index;tokens=[];tokenLayer.replaceChildren();const row=M.encounter(s);
   if(row){for(const lane of row.blocked){const el=make('div','mks-token '+(row.kind==='crowd'?'mks-crowd':'mks-feather'));tokenLayer.append(el);tokens.push({el,lane});}
    if(row.paper!==null){const el=make('div','mks-token mks-paper'+(row.driftTo!==null?' is-drifting':''),{A:'一',B:'二',C:'三'}[row.id[0]]);tokenLayer.append(el);tokens.push({el,paper:true});}
   }
  }
  for(const token of tokens){const lane=token.paper?M.target(s):token.lane;token.el.style.left=(22+lane*28)+'%';token.el.style.top=(27+s.progress*48)+'%';token.el.style.setProperty('--scale',String(.55+s.progress*.6));}
 }
 function card(title,text){const node=make('div','mks-card');node.append(make('h4','',title));if(text)node.append(make('p','',text));curtain.append(node);return node;}
 function renderScreen(){
  const key=s.phase+':'+s.paused+':'+s.order.join('')+':'+s.hint+':'+storageNote;if(key===screenKey)return;screenKey=key;curtain.replaceChildren();curtain.hidden=s.phase==='walk'&&!s.paused;
  if(s.phase==='ready'){
   const c=card('风把笔记吹散了','路过校门时，几张纸顺着樱坂飘了下来。你可以试着拾回它们；巴卫在旁边看了看风，收起手里的折扇。');
   c.append(make('div','mks-letter','换道拾页 · 避开黑羽与人群 · 坡下整理便签'));
   const opts=make('div','mks-options');button('慢慢走过去',()=>start('walk'),opts,'mks-primary');button('一步步走',()=>start('step'),opts);c.append(opts,make('small','','没有倒计时，也没有生命值。停步、漏页都可以走到终点。沿用当前衣装，不预设学籍或恋爱关系。'));
  }else if(s.phase==='walk'&&s.paused){const c=card('在树下等一等','当前路段已暂停。离开页面或切到后台也会停在这里。');button('继续走',()=>{s.paused=false;view();},c,'mks-primary');}
  else if(s.phase==='rest'){
   const c=card(s.index===4?'转过校门的拐角':'坡下，已经望得见人影',s.message);const opts=make('div','mks-options');
   button('沿樱花一侧',()=>{M.continueRoute(s,'sakura');view();},opts,'mks-primary');button('靠树荫走',()=>{M.continueRoute(s,'shade');view();},opts);c.append(opts,make('small','','不同一侧会改变下一段纸页与障碍的位置。先看提示，再继续。'));
  }else if(s.phase==='arrange'){
   const c=card('把这几页排好','寻找散页的人拿出三张写着时刻的便签。照着页眉，按先后顺序点选；再点一次可以撤下。');
   const choices=make('div','mks-order');for(const [id,time,name]of [['C','16:30','坡下'],['A','16:10','校门'],['B','16:20','樱坂']]){const b=button('',()=>{M.choosePage(s,id);view();},choices);b.dataset.page=id;b.setAttribute('aria-label',time+' '+name);b.setAttribute('aria-pressed',String(s.order.includes(id)));b.append(make('b','',s.order.includes(id)?String(s.order.indexOf(id)+1):'·'),make('span','',time),make('small','',name));}
   c.append(choices,make('div','mks-order-preview',s.order.map(id=>({A:'校门',B:'樱坂',C:'坡下'})[id]).join(' → ')||'还没有排好。'));const opts=make('div','mks-options');
   button('我来交还',()=>finish('self'),opts,'mks-primary');button('请巴卫递过去',()=>finish('tomoe'),opts);c.append(opts);
   button('问问巴卫',()=>{s.hint=true;s.message='“先看页眉上的时刻。”巴卫用扇尖点了点最早的那张，没有替你把纸抽走。';view();},c);if(s.hint)c.append(make('small','','16:10 → 16:20 → 16:30'));
  }else if(s.phase==='done'&&outcome){
   const c=card(outcome.rank,'坡上的风还在吹，你们已经走到了樱树尽头。');const n=make('p','mks-result-score',String(outcome.notes));n.append(make('span','',' / 6 张散页'));c.append(n,make('p','',outcome.detail),make('small','',storageNote||'散页夹已收进旧物回忆册。'));button('再走另一边',reset,c,'mks-primary');
  }
 }
 function finish(delivery){
  const result=M.finish(s,delivery);if(!result){view();return;}outcome=result;stop();
  if(!recorded){recorded=true;try{const saved=options.onComplete?.({...result,activityVersion:'school-1.31.0'});if(saved===false)storageNote='浏览器暂未允许本地保存；可用“导出手记”备份。';}catch{storageNote='手记回传未确认；请导出备份后再关闭。';}}
  if(book.open)readBook();view();
 }
 function view(schedule=true){
  if(disposed)return;root.dataset.phase=s.phase;root.dataset.paused=String(s.paused);root.dataset.last=s.last;
  const section=Math.min(2,Math.floor(s.index/4));[...checkpoints.children].forEach((el,i)=>el.className='mks-checkpoint'+(i===section?' is-current':i<section?' is-done':''));
  sectionBadge.textContent=s.index>=M.total?'三段路已走完':M.sections[section]+' · '+Math.min(4,s.index%4+1)+'/4';notesBadge.textContent='散页 '+s.notes.length+'/6';
  const row=M.encounter(s);forecast.textContent=s.phase==='walk'?(row?.paper!==null?'下一页 · '+['左侧','正前方','右侧'][M.target(s)]:(row?.kind==='crowd'?'前方有人经过，找空的一侧。':'黑羽正落下来，看准空隙。')):'';
  shift.hidden=!(s.phase==='walk'&&row?.driftTo!==null);shift.textContent='阵风会把纸页吹向'+['左侧','中间','右侧'][row?.driftTo??1];
  renderTokens();tokenLayer.hidden=!['walk','ready'].includes(s.phase);talkText.textContent=s.message;
  [...lanes.children].forEach((el,i)=>el.classList.toggle('is-current',i===s.lane));player.style.left=(22+s.lane*28)+'%';tomoe.style.left=(22+s.lane*28+(s.lane===0?15:-15))+'%';
  tomoe.classList.toggle('is-guard',s.guard===s.index);const frame=s.phase==='walk'&&!s.paused?Math.floor((s.index+s.progress)*8)%4:0;paintSprite(playerSprite,'player',look.player,frame);paintSprite(tomoeSprite,'tomoe',look.tomoe,frame);
  const walking=s.phase==='walk'&&!s.paused;left.disabled=!walking||s.lane===0;right.disabled=!walking||s.lane===2;step.disabled=!walking;assist.disabled=!walking||s.helps>=2||s.guard===s.index||!row?.blocked.length;assist.textContent='巴卫协助 '+(2-s.helps)+'/2';
  pause.disabled=s.phase!=='walk';pause.textContent=s.paused?'继续':'暂停';slow.setAttribute('aria-pressed',String(s.slow));slow.textContent=s.slow?'慢速已开':'放慢节奏';mode.textContent=s.mode==='step'?'切为自动':'切为逐步';
  renderScreen();if(schedule){if(s.phase!=='walk'||s.paused||s.mode==='step')stop();else if(!raf)raf=host.requestAnimationFrame(animate);}
 }
 on(root,'keydown',event=>{if(event.defaultPrevented||event.altKey||event.ctrlKey||event.metaKey)return;if(event.target.matches?.('input,textarea,select'))return;if(event.key==='ArrowLeft'){event.preventDefault();move(-1);}else if(event.key==='ArrowRight'){event.preventDefault();move(1);}else if(event.code==='Space'&&!event.target.closest('button,summary')){event.preventDefault();M.advance(s,.25);view();}});
 on(stage,'pointerdown',e=>{if(e.target.closest('button'))return;swipe={id:e.pointerId,x:e.clientX,y:e.clientY};});on(stage,'pointerup',e=>{if(!swipe||swipe.id!==e.pointerId)return;const dx=e.clientX-swipe.x,dy=e.clientY-swipe.y;swipe=null;if(Math.abs(dx)>25&&Math.abs(dx)>Math.abs(dy))move(dx>0?1:-1);});on(stage,'pointercancel',()=>{swipe=null;});
 const suspend=()=>{if(s.phase==='walk'&&!s.paused){s.paused=true;stop();view();}};on(doc,'visibilitychange',()=>{if(doc.hidden)suspend();});on(host,'blur',suspend);on(host,'pagehide',dispose);on(host,'mikage:art-ready',()=>view());
 function dispose(){if(disposed)return;disposed=true;stop();stops.splice(0).forEach(fn=>{try{fn();}catch{}});downloads.forEach(url=>host.URL.revokeObjectURL(url));downloads.clear();root.remove();}
 root.tabIndex=0;view();
 void installMikageSchoolFont(host,doc);
 Promise.resolve(host.MikageCharacterArt?.preloadWalk?.()).then(()=>view()).catch(()=>{});return {dispose,getState:()=>JSON.parse(JSON.stringify(s))};
}
