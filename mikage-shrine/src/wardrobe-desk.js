/* Transient dressing-room gestures, no MVU/host writes. */
(()=>{'use strict';const root=document.getElementById('wardrobe-dialog');if(!root)return;window.MikageWardrobeDesk?.dispose();
 const media=matchMedia('(prefers-reduced-motion: reduce)'),animations=new Set(),particles=new Set(),off=[];let disposed=false,lastKey='',view=null,direction='front',walkTimer=null,step=0,walkEpoch=0;
 const $=s=>root.querySelector(s),shown=()=>!disposed&&!root.hidden;
 function on(el,type,fn){el.addEventListener(type,fn);off.push(()=>el.removeEventListener(type,fn));}
 function status(text,state=''){const e=$('#robe-desk-status');if(!disposed&&e){e.textContent=text;e.dataset.state=state;}}
 function play(el,frames,ms=500){if(!shown()||!el?.animate)return;for(const a of [...animations])if(a.effect?.target===el)a.cancel();const a=el.animate(media.matches?[{opacity:.7},{opacity:1}]:frames,{duration:media.matches?120:ms,easing:'cubic-bezier(.2,.8,.25,1)'});animations.add(a);a.onfinish=a.oncancel=()=>animations.delete(a);return a;}
 function paint(frame=0){if(!view?.art?.paint)return;try{view.art.paint($('[data-art=wardrobe-mini]'),view.actor,view.outfit,direction,frame);}catch{status('庭院形象暂不可用。','error');}}
 function stopWalk(){walkEpoch++;clearInterval(walkTimer);walkTimer=null;step=0;paint();const b=$('[data-robe-toy=walk]');if(b){b.textContent='走两步';b.disabled=false;b.removeAttribute('aria-busy');b.setAttribute('aria-pressed','false');}}
 function sparkle(){if(!shown()||media.matches)return;const layer=$('.robe-fx');for(let i=0;i<12&&particles.size<20;i++){const el=document.createElement('i');el.className='robe-spark';el.style.left=(24+Math.random()*52)+'%';el.style.top=(25+Math.random()*60)+'%';layer.append(el);particles.add(el);const a=el.animate([{opacity:0,transform:'translateY(10px) scale(.4)'},{opacity:1,offset:.25},{opacity:0,transform:'translateY(-40px) scale(1)'}],{duration:950+Math.random()*500});animations.add(a);a.onfinish=a.oncancel=()=>{particles.delete(el);animations.delete(a);el.remove();};}}
 function reveal(){play($('.wardrobe-portrait'),[{opacity:.25,transform:'translateY(7px)'},{opacity:1,transform:'translateY(0)'}],500);sparkle();}
 function render(next){if(disposed)return;const key=next.actor+':'+next.outfit;const changed=lastKey&&lastKey!==key;if(changed)stopWalk();view=next;lastKey=key;for(const b of root.querySelectorAll('.wardrobe-direction'))b.setAttribute('aria-pressed',String(b.dataset.direction===direction));paint();if(changed){reveal();const selected=$('.outfit-choice[aria-pressed=true]');play(selected,[{transform:'rotate(-2deg)'},{transform:'rotate(1deg)',offset:.5},{transform:'rotate(0)'}],480);}}
 function operation(state,text){if(disposed)return;root.setAttribute('aria-busy',String(state==='pending'));status(text,state);if(state==='success')reveal();}
 async function click(e){if(!shown())return;const b=e.target.closest('button');if(!b||!root.contains(b)||b.disabled)return;
  play(b,[{transform:'translateY(0)'},{transform:'translateY(3px)',offset:.3},{transform:'translateY(0)'}],310);
  if(b.classList.contains('wardrobe-direction')){stopWalk();direction=b.dataset.direction;paint();for(const x of root.querySelectorAll('.wardrobe-direction'))x.setAttribute('aria-pressed',String(x===b));status('庭院形象 · '+b.textContent.trim());return;}
  const toy=b.dataset.robeToy;if(toy==='sachet'){play(b,[{transform:'rotate(0)'},{transform:'rotate(9deg)',offset:.25},{transform:'rotate(-6deg)',offset:.55},{transform:'rotate(0)'}],800);sparkle();status('衣间散开一缕淡香。');}
  if(toy==='shine'){reveal();status('衣影展开了。');}
  if(toy==='walk'){if(walkTimer){stopWalk();return;}if(media.matches){status('已启用减少动态效果，显示静态庭院形象。');return;}const epoch=++walkEpoch;b.disabled=true;b.setAttribute('aria-busy','true');status('正在准备行走预览…');try{await view?.art?.preloadWalk?.();}catch{if(epoch===walkEpoch)status('行走图暂未加载，请再试一次。','error');return;}finally{b.disabled=false;b.removeAttribute('aria-busy');}if(epoch!==walkEpoch||!shown()||media.matches)return;let count=0;walkTimer=setInterval(()=>{if(!shown()||!view||++count>=8){stopWalk();return;}paint([1,0,3,0][step++%4]);},180);b.textContent='停下脚步';b.setAttribute('aria-pressed','true');status('看看这套衣装走动的样子。');}
  if(b.dataset.wardrobeActor)status(b.dataset.wardrobeActor==='tomoe'?'打开巴卫的衣橱。':'打开你的衣橱。');
  if(b.dataset.outfitId&&b.classList.contains('is-locked'))status('仅供预览 · 解锁条件见衣签下方。');
 }
 function reset(){stopWalk();for(const a of [...animations])a.cancel();animations.clear();for(const p of particles)p.remove();particles.clear();}
 function dispose(){if(disposed)return;reset();disposed=true;observer.disconnect();off.forEach(f=>f());if(window.MikageWardrobeDesk===api)delete window.MikageWardrobeDesk;}
 const observer=new MutationObserver(()=>{if(root.hidden)reset();});observer.observe(root,{attributes:true,attributeFilter:['hidden']});on(root,'click',click);on(document,'visibilitychange',()=>{if(document.hidden)reset();});on(window,'pagehide',dispose);on(media,'change',reset);
 const api={render,operation,dispose,inspect:()=>({animations:animations.size,particles:particles.size,walking:!!walkTimer,direction,reduced:media.matches})};window.MikageWardrobeDesk=api;
})();
