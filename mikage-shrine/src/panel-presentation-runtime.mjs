import { panelEmaMatches } from './panel-presentation-core.mjs';
(() => {
 'use strict';
 if(window.MikagePanelPresentation)return;
 const $=id=>document.getElementById(id),reduced=matchMedia('(prefers-reduced-motion: reduce)'),stops=[],animations=new Set();
 let selectedId='',selected=null,initialChosen=false,statusFilter='all',disposed=false,archiveSerial=0,archiveOpener=null,mapFocus='',probe=null,portraitKey='';
 const make=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;};
 function on(el,type,fn,options){el.addEventListener(type,fn,options);stops.push(()=>el.removeEventListener(type,fn,options));}
 function animate(el){if(disposed||reduced.matches||!el?.animate||!el.getClientRects().length)return;const a=el.animate([{opacity:.45},{opacity:1}],{duration:220,easing:'ease-out'});animations.add(a);a.onfinish=a.oncancel=()=>animations.delete(a);}
 function restore(){
  if(selected){const {card,back}=selected;card.querySelector('.ema-inner')?.append(back);card.classList.remove('is-flipped');
   card.querySelector('.ema-front')?.setAttribute('aria-hidden','false');
   const control=card.querySelector('.ema-front .flip-button');if(control){control.tabIndex=0;control.setAttribute('aria-expanded','false');}
   back.setAttribute('aria-hidden','true');for(const b of back.querySelectorAll('button'))b.tabIndex=-1;}
  selected=null;$('panel-ema-sheet').hidden=true;
 }
 function selectEma(card,flipped,focus=true){
  if(disposed||!card)return;
  const id=card.dataset.emaId,back=card.querySelector('.ema-back')||(selected?.card===card?selected.back:null);
  if(!flipped){restore();selectedId='';return;}
  if(!back)return;restore();selectedId=id;selected={card,back};initialChosen=true;
  card.classList.add('is-flipped');card.querySelector('.ema-front')?.setAttribute('aria-hidden','false');
  const front=card.querySelector('.ema-front .flip-button');if(front){front.tabIndex=0;front.setAttribute('aria-expanded','true');front.setAttribute('aria-controls','panel-ema-sheet');}
  back.setAttribute('aria-hidden','false');for(const b of back.querySelectorAll('button'))b.tabIndex=0;
  const sheet=$('panel-ema-sheet');sheet.replaceChildren(back);sheet.hidden=false;animate(sheet);
  if(card.dataset.status==='已完成'&&!back.querySelector('[data-panel-archive]')){
   const b=make('button','查看本项任务档案','panel-paper-button');b.type='button';b.dataset.panelArchive=id;back.querySelector('.ema-paper')?.append(b);
  }
  if(focus){back.querySelector('.flip-button')?.focus({preventScroll:true});sheet.scrollIntoView({block:'nearest',behavior:'auto'});}
 }
 function filterBoard(){
  const cards=[...$('ema-grid').querySelectorAll('.ema-card')];
  for(const c of cards)c.hidden=!panelEmaMatches(c.dataset.status,statusFilter);
  const visible=cards.filter(c=>!c.hidden),empty=$('panel-ema-empty');empty.hidden=!cards.length||!!visible.length;
  if(selected?.card.hidden)restore();
  if(selectedId){const next=visible.find(c=>c.dataset.emaId===selectedId);if(next&&!selected)selectEma(next,true,false);}
  if(!initialChosen&&visible.length)selectEma(visible[0],true,false);
  for(const b of $('panel-ema-status').querySelectorAll('button'))b.setAttribute('aria-pressed',String(b.dataset.panelStatus===statusFilter));
  $('panel-ema-count').textContent=visible.length+' / '+cards.length+' 枚';
 }
 function board(){
  if(disposed)return;
  const filter=$('ema-filter'),focus=$('panel-ema-focus');if(filter&&filter.parentNode!==focus)focus.append(filter);
  for(const c of $('ema-grid').querySelectorAll('.ema-card')){const b=c.querySelector('.ema-front .flip-button');if(b){b.setAttribute('aria-expanded',String(c.dataset.emaId===selectedId));b.setAttribute('aria-controls','panel-ema-sheet');}}
  filterBoard();
 }
 function outfitThumb(el,art,actor,outfit){
  el.classList.add('panel-outfit-thumb');
  let url;try{url=art?.portrait?.(actor,outfit);}catch{return;}
  if(typeof url!=='string'||!url.startsWith('https://'))return;
  const img=make('img');img.alt='';img.loading='lazy';img.decoding='async';img.className='panel-outfit-image';
  img.addEventListener('load',()=>el.classList.add('panel-thumb-ready'),{once:true});img.addEventListener('error',()=>img.remove(),{once:true});img.src=url;el.append(img);
 }
 function wardrobe({actor,outfit,art}){
  if(disposed)return;
  const preview=document.querySelector('.wardrobe-preview'),note=document.querySelector('.wardrobe-look-note');
  if(note&&note.parentNode!==preview)preview.append(note);
  let extras=$('panel-robe-extras');
  if(!extras){extras=make('details',undefined,'panel-robe-extras');extras.id='panel-robe-extras';extras.append(make('summary','庭院形象与衣装纪念'));const body=make('div',undefined,'panel-robe-extra-content');extras.append(body);preview.append(extras);}
  const extraBody=extras.querySelector('.panel-robe-extra-content');
  for(const node of [document.querySelector('.wardrobe-mini-wrap'),document.querySelector('.wardrobe-directions'),$('wardrobe-memories')])if(node&&node.parentNode!==extraBody)extraBody.append(node);
  const wrap=document.querySelector('.wardrobe-portrait-wrap');
  let failure=$('panel-portrait-note');if(!failure){failure=make('p','立绘暂未载入，衣装信息仍可查看。','panel-art-note');failure.id='panel-portrait-note';failure.hidden=true;wrap.append(failure);}
  const key=actor+':'+outfit;if(key===portraitKey)return;portraitKey=key;
  if(probe){probe.onload=probe.onerror=null;}probe=null;failure.hidden=true;
  let url;try{url=art?.portrait?.(actor,outfit);}catch{}
  if(!url){failure.hidden=false;return;}
  const image=new Image();probe=image;
  image.onload=()=>{if(!disposed&&portraitKey===key)failure.hidden=true;};
  image.onerror=()=>{if(!disposed&&portraitKey===key)failure.hidden=false;};image.src=url;
 }
 async function archive(taskId,opener){
  const own=++archiveSerial,box=$('panel-archive-view');archiveOpener=opener;box.hidden=false;box.replaceChildren(make('p','正在读取任务档案…'));
  const head=make('header'),title=make('h3',taskId?'本项任务档案':'任务档案'),close=make('button','收起档案','panel-paper-button');close.type='button';close.dataset.panelArchiveClose='true';head.append(title,close);box.replaceChildren(head);const body=make('div');body.append(make('p','正在读取任务档案…'));box.append(body);
  close.focus({preventScroll:true});box.scrollIntoView({block:'nearest',behavior:'auto'});
  try{
   const view=await window.ShrineUIBridge?.getTaskArchive?.(taskId);
   if(disposed||own!==archiveSerial)return;body.replaceChildren();
   if(view?.status!=='ready'){body.append(make('p','当前聊天的任务档案尚未就绪。'));return;}
   if(!view.records?.length){body.append(make('p',taskId?'本项尚无有效摘要；结案回复生成档案后可在这里查看。':'当前聊天尚无有效任务档案。'));return;}
   if(view.truncated)body.append(make('p','展示最近100份档案。'));
   for(const r of view.records){
    const article=make('article');article.append(make('h4',r.taskId+(r.wish?' · '+r.wish:'')));
    for(const [label,value]of [['最终选择',r.choice],['实际结果',r.result],['持续影响',(r.effects||[]).join('\n')],['未决事项',(r.unresolved||[]).join('\n')]])if(value){article.append(make('strong',label),make('p',value));}body.append(article);
   }
  }catch{if(!disposed&&own===archiveSerial)body.replaceChildren(make('p','档案暂时无法读取，请回到当前聊天重试。'));}
 }
 function closeArchive(){archiveSerial++;$('panel-archive-view').hidden=true;$('panel-archive-view').replaceChildren();if(archiveOpener?.isConnected)archiveOpener.focus({preventScroll:true});archiveOpener=null;}
 on($('panel-ema-status'),'click',e=>{const b=e.target.closest('[data-panel-status]');if(!b)return;statusFilter=b.dataset.panelStatus;filterBoard();});
 on($('board-dialog'),'click',e=>{const b=e.target.closest('[data-panel-archive],[data-panel-archive-close]');if(!b)return;if(b.hasAttribute('data-panel-archive-close'))closeArchive();else archive(b.dataset.panelArchive,b);});
 on(document,'keydown',e=>{if(e.key==='Escape'&&!$('panel-archive-view').hidden){e.preventDefault();e.stopImmediatePropagation();closeArchive();}},true);
 on(document,'visibilitychange',()=>{if(document.hidden)for(const a of [...animations])a.cancel();});
 function dispose(){if(disposed)return;disposed=true;archiveSerial++;restore();for(const a of [...animations])a.cancel();animations.clear();stops.forEach(fn=>fn());if(probe)probe.onload=probe.onerror=null;probe=null;}
 on(window,'pagehide',dispose);
 window.MikagePanelPresentation={board,selectEma,beforeBoardRender:restore,outfitThumb,wardrobe,
  beforeMap(){mapFocus=document.activeElement?.dataset?.regionId||'';},
  map(){if(mapFocus){[...$('map-quick-nav').querySelectorAll('[data-region-id]')].find(n=>n.dataset.regionId===mapFocus)?.focus({preventScroll:true});mapFocus='';}},
  dispose,inspect:()=>({selectedId,statusFilter,disposed,animations:animations.size})};
})();
