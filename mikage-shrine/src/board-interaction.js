/* Cosmetic board layer. Owns no MVU/game writer and never sends messages. */
(() => {
 'use strict';
 const root=document.getElementById('shrine-game');if(!root)return;
 if(window.MikageBoardToy?.root===root)return;window.MikageBoardToy?.dispose();
 const reduced=matchMedia('(prefers-reduced-motion: reduce)'),timers=new Set(),animations=new Map(),particles=new Set(),pending=new Map(),replays=new WeakSet(),stops=[];
 let disposed=false,toastTimer=0,rings=[],counter=0;
 const $=id=>document.getElementById(id);
 function later(fn,delay){const id=setTimeout(()=>{timers.delete(id);if(!disposed)fn();},delay);timers.add(id);return id;}
 function clear(id){clearTimeout(id);timers.delete(id);}
 function on(el,type,fn,opts){el.addEventListener(type,fn,opts);stops.push(()=>el.removeEventListener(type,fn,opts));}
 function animate(el,frames,ms=460){if(!el||disposed)return;animations.get(el)?.cancel();if(typeof el.animate!=='function'){el.dataset.boardFlash='true';later(()=>delete el.dataset.boardFlash,180);return;}
  const animation=el.animate(reduced.matches?[{opacity:.72},{opacity:1}]:frames,{duration:reduced.matches?130:ms,easing:'cubic-bezier(.2,.8,.3,1)'});animations.set(el,animation);
  const done=()=>{if(animations.get(el)===animation)animations.delete(el);};animation.onfinish=done;animation.oncancel=done;
 }
 function point(el){const r=el.getBoundingClientRect(),b=root.getBoundingClientRect();return{x:r.x+r.width/2-b.x,y:r.y+r.height/2-b.y};}
 function removeParticle(el){animations.get(el)?.cancel();animations.delete(el);particles.delete(el);el.remove();}
 function burst(el,kind,count=5){if(!el||reduced.matches||disposed)return;const origin=point(el),layer=$('board-fx');if(!layer)return;
  for(let i=0;i<count;i++){while(particles.size>=28)removeParticle(particles.values().next().value);const p=document.createElement('i');p.className='board-particle board-'+kind;p.setAttribute('aria-hidden','true');p.style.left=origin.x+'px';p.style.top=origin.y+'px';layer.append(p);particles.add(p);
   const side=(i-(count-1)/2),dx=side*(kind==='steam'?6:13),dy=kind==='petal'?40+Math.abs(side)*12:-24-Math.abs(side)*10;
   if(typeof p.animate==='function'){const a=p.animate([{opacity:0,transform:'translate(-50%,-50%) scale(.5)'},{opacity:.9,offset:.2},{opacity:0,transform:`translate(calc(-50% + ${dx}px),calc(-50% + ${dy}px)) rotate(${side*45}deg) scale(${kind==='steam'?1.8:.7})`}],{duration:kind==='steam'?1000:780+i*45,easing:'ease-out'});animations.set(p,a);a.onfinish=()=>removeParticle(p);a.oncancel=()=>{animations.delete(p);particles.delete(p);p.remove();};}
   else later(()=>removeParticle(p),650);
  }
 }
 function pulse(button){animate(button,[{transform:'translateY(0) scale(1)',filter:'brightness(1)'},{transform:'translateY(2px) scale(.97)',filter:'brightness(1.13)',offset:.3},{transform:'translateY(0) scale(1)',filter:'brightness(1)'}],260);}
 function hopFox(){const fox=root.querySelector('[data-board-sprite="fox"]');animate(fox,[{transform:'translate(0,0) rotate(0deg)'},{transform:'translate(-9px,-12px) rotate(-9deg)',offset:.3},{transform:'translate(-16px,0) rotate(0deg)',offset:.55},{transform:'translate(-7px,-5px) rotate(7deg)',offset:.8},{transform:'translate(0,0) rotate(0deg)'}],820);burst(fox,'gold',4);}
 function play(kind){const el=root.querySelector('[data-board-sprite="'+kind+'"]');
  const frames={
   bell:[{transform:'rotate(0deg)'},{transform:'rotate(23deg)',offset:.15},{transform:'rotate(-17deg)',offset:.35},{transform:'rotate(10deg)',offset:.55},{transform:'rotate(-5deg)',offset:.75},{transform:'rotate(0deg)'}],
   map:[{transform:'rotate(0) scaleX(1)'},{transform:'rotate(-4deg) scaleX(1.06)',offset:.35},{transform:'rotate(2deg) scaleX(.98)',offset:.7},{transform:'rotate(0) scaleX(1)'}],
   ema:[{transform:'rotate(0)'},{transform:'rotate(10deg)',offset:.2},{transform:'rotate(-7deg)',offset:.5},{transform:'rotate(3deg)',offset:.8},{transform:'rotate(0)'}],
   wardrobe:[{transform:'translateY(0) rotate(0)'},{transform:'translateY(-5px) rotate(-3deg)',offset:.3},{transform:'translateY(1px) rotate(2deg)',offset:.7},{transform:'translateY(0) rotate(0)'}],
   life:[{transform:'rotate(0)'},{transform:'rotate(-5deg)',offset:.25},{transform:'rotate(4deg)',offset:.55},{transform:'rotate(0)'}],
   journal:[{transform:'rotate(0) scaleY(1)'},{transform:'rotate(-4deg) scaleY(.94)',offset:.3},{transform:'rotate(3deg) scaleY(1.03)',offset:.7},{transform:'rotate(0) scaleY(1)'}],
   buildings:[{transform:'rotate(0)'},{transform:'rotate(-17deg)',offset:.2},{transform:'translateY(3px) rotate(7deg)',offset:.4},{transform:'rotate(-8deg)',offset:.6},{transform:'rotate(0)'}]
  };
  if(kind==='fox'){hopFox();return;}if(kind==='cherry'){burst($('board-cherry'),'petal',8);return;}
  animate(el,frames[kind]||frames.map,kind==='bell'?1100:650);
  burst(el,kind==='life'?'steam':kind==='ema'?'flame':kind==='wardrobe'?'petal':'gold',kind==='life'?4:5);
  if(kind==='bell'){const now=performance.now();rings=rings.filter(t=>now-t<4000);rings.push(now);if(rings.length>=3){rings=[];hopFox();}}
  if(kind==='journal')hopFox();
 }
 function feedback(text){const toast=$('board-feedback');if(!toast)return;clear(toastTimer);toast.textContent=text;toast.hidden=false;toastTimer=later(()=>{toast.hidden=true;},1500);}
 function toolState(){for(const id of ['paths','wander','lantern']){$(id)?.classList.toggle('board-on',$(id).getAttribute('aria-pressed')==='true');}}
 function restoreToolFaces(){for(const id of ['moment','paths','wander','lantern']){const b=$(id);if(!b.querySelector('.board-tool-face')){const face=$('board-face-templates')?.content.querySelector('[data-for="'+id+'"]');if(face)b.prepend(face.cloneNode(true));}}}
 function scope(){const b=window.MikageStatusBridge;return{bridge:b,key:[b?.messageId,b?.swipeId,b?.chatEpoch].join(':')};}
 const kinds={map:'map',ema:'ema',wardrobe:'wardrobe',life:'life','journal-button':'journal',buildings:'buildings'};
 function click(event){const button=event.target.closest('button');if(!button||!root.contains(button))return;
  if(replays.has(event)){replays.delete(event);return;}
  const kind=button.dataset.boardToy||kinds[button.id];if(kind)play(kind);
  if(button.matches('.dock-button,.scene-tools>button'))pulse(button);
  if(button.matches('.scene-tools>button')){burst(button,'gold',4);queueMicrotask(()=>{if(disposed)return;toolState();const text=button.id==='paths'?($('paths').getAttribute('aria-pressed')==='true'?'小路已显示':'小路已收起'):button.id==='wander'?($('wander').getAttribute('aria-pressed')==='true'?'巴卫自主漫步：开':'巴卫自主漫步：停'):button.id==='lantern'?'景色：'+$('lantern').querySelector('span').textContent:button.id==='moment'?(root.dataset.ready==='true'?'正在走近散策地点':'神社记录尚未就绪'):null;if(text)feedback(text);});}
  // The original route is replayed once after a brief visible press, never replaced.
  if(button.matches('.dock-button[data-open]')&&!reduced.matches){event.preventDefault();event.stopImmediatePropagation();if(pending.has(button))return;const original=scope();const timer=later(()=>{pending.delete(button);const next=scope();if(!button.isConnected||next.bridge!==original.bridge||next.key!==original.key)return;const replay=new MouseEvent('click',{bubbles:true,cancelable:true,view:window});replays.add(replay);button.dispatchEvent(replay);},180);pending.set(button,timer);}
  counter++;
 }
 function resetTransient(){for(const id of timers)clearTimeout(id);timers.clear();pending.clear();for(const a of animations.values())a.cancel();animations.clear();for(const p of [...particles])removeParticle(p);rings=[];const toast=$('board-feedback');if(toast)toast.hidden=true;}
 function dispose(){if(disposed)return;disposed=true;resetTransient();observer.disconnect();stops.forEach(fn=>fn());if(window.MikageBoardToy===api)delete window.MikageBoardToy;}
 on(root,'click',click,true);
 on(root,'pointerdown',event=>{root.dataset.boardInput='pointer';const b=event.target.closest('button');if(b?.matches('.dock-button,.scene-tools>button,.board-toy'))animate(b,[{transform:'scale(1)'},{transform:'scale(.97) translateY(1px)'}],140);},true);
 on(root,'keydown',event=>{if(['Tab','Enter',' ','ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key))root.dataset.boardInput='keyboard';},true);
 on(document,'visibilitychange',()=>{if(document.hidden)resetTransient();});on(window,'pagehide',dispose,{once:true});
 const observer=new MutationObserver(()=>{restoreToolFaces();toolState();});observer.observe(root.querySelector('.scene-tools'),{subtree:true,childList:true,attributes:true,attributeFilter:['aria-pressed']});
 on(reduced,'change',()=>{resetTransient();});restoreToolFaces();toolState();
 const api={root,dispose,inspect:()=>({effects:counter,particles:particles.size,animations:animations.size,pending:pending.size,reduced:reduced.matches})};window.MikageBoardToy=api;
})();
