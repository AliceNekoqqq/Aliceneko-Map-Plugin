/* Transient tactile responses. All persistent effects belong to the existing panel bridge. */
(()=>{'use strict';const root=document.getElementById('board-dialog');if(!root)return;window.MikageEmaDesk?.dispose();
 const reduced=matchMedia('(prefers-reduced-motion: reduce)'),animations=new Set(),particles=new Set(),stops=[];let disposed=false,rings=0;
 const $=s=>root.querySelector(s),shown=()=>!disposed&&!root.hidden;
 function on(el,name,fn,opt){el.addEventListener(name,fn,opt);stops.push(()=>el.removeEventListener(name,fn,opt));}
 function play(el,frames,ms=430){if(!shown()||!el?.animate)return;for(const a of [...animations])if(a.effect?.target===el){a.cancel();animations.delete(a);}
  const a=el.animate(reduced.matches?[{opacity:.65},{opacity:1}]:frames,{duration:reduced.matches?120:ms,easing:'cubic-bezier(.2,.75,.25,1)'});animations.add(a);a.onfinish=a.oncancel=()=>animations.delete(a);return a;}
 function status(text,state=''){if(disposed)return;const el=$('#ema-desk-status');el.textContent=text;el.dataset.state=state;}
 function petals(source,n=7){if(!shown()||reduced.matches)return;const layer=$('.ema-fx-layer'),s=source.getBoundingClientRect(),r=layer.getBoundingClientRect();for(let i=0;i<n&&particles.size<24;i++){const p=document.createElement('i');p.className='ema-petal';p.style.left=s.x+s.width/2-r.x+'px';p.style.top=s.y+s.height/2-r.y+'px';layer.append(p);particles.add(p);const a=p.animate([{opacity:0,transform:'translate(0,0) rotate(0)'},{opacity:1,offset:.15},{opacity:0,transform:'translate('+((Math.random()-.4)*140)+'px,'+(40+Math.random()*75)+'px) rotate('+(90+Math.random()*160)+'deg)'}],{duration:1100+Math.random()*350,easing:'ease-out'});animations.add(a);const done=()=>{animations.delete(a);particles.delete(p);p.remove();};a.onfinish=a.oncancel=done;}}
 function sway(card){play(card,[{transform:'rotate(0)'},{transform:'rotate(-2.5deg)',offset:.2},{transform:'rotate(1.8deg)',offset:.5},{transform:'rotate(-.8deg)',offset:.75},{transform:'rotate(0)'}],680);}
 function flip(card,back){play(card.querySelector('.ema-inner'),[{transform:'rotateY('+(back?-78:78)+'deg)',opacity:.45},{transform:'rotateY(0)',opacity:1}],450);}
 function operation(state,id,type,error=''){if(disposed)return;const verbs={acceptEma:'接取心愿',dismissEma:'暂不接取',pauseEma:'暂停心愿',resumeEma:'继续心愿',refresh:'迎来新心愿'};const verb=verbs[type]||'提交';if(type==='refresh')root.classList.toggle('ema-refresh-busy',state==='pending');
  if(state==='pending')status('正在'+(type==='refresh'?'迎来新心愿':verb)+'…','pending');
  else if(state==='error')status(error||'操作未提交，请稍后重试。','error');
  else{status(type==='refresh'?'绘马板已更新。':'已提交'+verb+'，请以绘马当前状态和后续对话为准。','success');const card=[...root.querySelectorAll('.ema-card')].find(c=>c.dataset.emaId===id);if(card)sway(card);}
 }
 function click(event){if(!shown())return;const b=event.target.closest('button');if(b&&root.contains(b)){if(b.disabled)return;const toy=b.dataset.emaToy;
   if(toy==='bell'){rings++;play(b,[{transform:'rotate(0)'},{transform:'rotate(16deg)',offset:.2},{transform:'rotate(-11deg)',offset:.5},{transform:'rotate(5deg)',offset:.75},{transform:'rotate(0)'}],1000);status('狐铃轻晃了一下。');if(rings%3===0){for(const card of root.querySelectorAll('.ema-card'))sway(card);status('铃声传过檐下，绘马也跟着轻轻晃动。');}}
   else if(toy==='cherry'){petals(b);status('花瓣从檐边落下。');}
   else if(!b.classList.contains('flip-button'))play(b,[{transform:'translateY(0)'},{transform:'translateY(3px)',offset:.35},{transform:'translateY(0)'}],300);
   if(b.dataset.emaFilter){const value=b.dataset.emaFilter;for(const card of root.querySelectorAll('.ema-card'))if(value==='all'||(value==='main')===card.classList.contains('is-special'))sway(card);status(value==='all'?'查看全部绘马。':value==='main'?'主线绘马已突出显示，其他绘马仍可翻看。':'普通心愿已突出显示，主线绘马仍可翻看。');}
   return;
  }
  const front=event.target.closest('.ema-front');if(front&&!window.getSelection()?.toString()){sway(front.closest('.ema-card'));front.querySelector('.flip-button')?.click();}
 }
 function reset(){for(const a of [...animations])a.cancel();animations.clear();for(const p of particles)p.remove();particles.clear();}
 function dispose(){if(disposed)return;disposed=true;reset();observer.disconnect();stops.forEach(f=>f());if(window.MikageEmaDesk===api)delete window.MikageEmaDesk;}
 const observer=new MutationObserver(()=>{if(root.hidden)reset();});observer.observe(root,{attributes:true,attributeFilter:['hidden']});on(root,'click',click,true);on(document,'visibilitychange',()=>{if(document.hidden)reset();});on(reduced,'change',reset);on(window,'pagehide',dispose,{once:true});
 const api={flip,operation,dispose,inspect:()=>({animations:animations.size,particles:particles.size,rings,reduced:reduced.matches})};window.MikageEmaDesk=api;
})();
