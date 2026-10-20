/* Local view effects only. Formal movement remains owned by ShrineUIBridge. */
(()=>{'use strict';
 const root=document.getElementById('map-dialog');if(!root)return;
 window.MikageMapDesk?.dispose();
 const media=window.matchMedia('(prefers-reduced-motion: reduce)'),animations=new Set(),particles=new Set(),stops=[];
 let disposed=false,selected='',selections=0,compassTaps=0,selectionName='',pendingPlan=false;
 const $=s=>root.querySelector(s),visible=()=>!disposed&&!root.hidden;
 function on(el,name,fn,options){el.addEventListener(name,fn,options);stops.push(()=>el.removeEventListener(name,fn,options));}
 function animate(el,frames,ms=430){if(!el||!visible()||typeof el.animate!=='function')return;
  for(const a of [...animations])if(a.effect?.target===el){a.cancel();animations.delete(a);}
  const a=el.animate(media.matches?[{opacity:.65},{opacity:1}]:frames,{duration:media.matches?120:ms,easing:'cubic-bezier(.18,.75,.22,1)'});
  animations.add(a);const finish=()=>{animations.delete(a);};a.onfinish=finish;a.oncancel=finish;return a;
 }
 function status(text){if(!disposed)$('#map-desk-status').textContent=text;}
 function burst(source,kind='petal',count=7){if(!visible()||media.matches)return;const layer=$('.map-desk-fx');if(!layer)return;
  const a=source.getBoundingClientRect(),b=layer.getBoundingClientRect();
  for(let i=0;i<count&&particles.size<24;i++){const p=document.createElement('i');p.className='map-fx '+kind;p.setAttribute('aria-hidden','true');p.style.left=a.x+a.width/2-b.x+'px';p.style.top=a.y+a.height/2-b.y+'px';layer.append(p);particles.add(p);
   const fx=p.animate([{transform:'translate(0,0) rotate(0)',opacity:0},{opacity:1,offset:.15},{transform:'translate('+((Math.random()-.35)*110)+'px,'+(25+Math.random()*80)+'px) rotate('+(70+Math.random()*220)+'deg)',opacity:0}],{duration:900+Math.random()*450,easing:'ease-out'});
   animations.add(fx);const remove=()=>{animations.delete(fx);particles.delete(p);p.remove();};fx.onfinish=remove;fx.oncancel=remove;
  }
 }
 function selectedRegion(id,name){if(disposed)return;selectionName=name;
  if(selected===id)return;selected=id;selections++;
  if(!visible())return;
  // Called before the original render replaces postcard children; animate the stable container.
  animate($('#place-card'),[{transform:'translateY(9px) rotate(1deg)',opacity:.6},{transform:'translateY(0) rotate(0)',opacity:1}],480);
 }
 function click(event){const b=event.target.closest('button');if(!b||!root.contains(b)||b.disabled)return;
  const id=b.dataset.regionId;if(id){const name=(b.querySelector('strong')?.textContent||b.textContent).trim();
   if(b.classList.contains('district-button'))animate(b.querySelector('.district-label'),[{transform:'translate(-50%,-50%) translateY(0)'},{transform:'translate(-50%,-50%) translateY(-5px)',offset:.35},{transform:'translate(-50%,-50%) translateY(0)'}]);
   else animate(b,[{transform:'translateY(0)'},{transform:'translateY(2px) rotate(-2deg)',offset:.25},{transform:'translateY(-4px) rotate(1deg)',offset:.65},{transform:b.getAttribute('aria-pressed')==='true'?'translateY(-3px)':'translateY(0)'}]);
   status('正在查看 · '+name);return;
  }
  const toy=b.dataset.mapToy;if(toy==='compass'){compassTaps++;animate(b.querySelector('svg'),[{transform:'rotate(0)'},{transform:'rotate(155deg)',offset:.4},{transform:'rotate(-20deg)',offset:.77},{transform:'rotate(0)'}],1050);burst(b,'gold',5);status('罗盘转了一圈，又指回山门。');if(compassTaps%3===0)hop();}
  else if(toy==='cherry'){burst(b);status('几片樱花，落在了图卷旁。');}
  else if(toy==='fox'){hop();status('折纸狐替你看好了路。');}
  else if(b.classList.contains('map-travel'))animate(b,[{transform:'translateY(0)'},{transform:'translateY(3px)',offset:.3},{transform:'translateY(0)'}],330);
 }
 function hop(){const fox=$('.map-desk-fox');animate(fox,[{transform:'translateY(0) rotate(0)'},{transform:'translateY(-17px) rotate(-12deg)',offset:.35},{transform:'translateY(0) rotate(7deg)',offset:.67},{transform:'translateY(-5px) rotate(-3deg)',offset:.82},{transform:'translateY(0) rotate(0)'}],650);}
 function travel(state,name){if(disposed)return;pendingPlan=state==='pending';
  if(state==='pending'){status('正在提交前往意图 · '+name);const b=$('.map-travel');if(b)b.textContent='正在提交…';}
  else if(state==='sent'){status('前往意图已提交 · '+name+'；等待后续对话确认抵达。');animate($('#place-card'),[{transform:'translateY(0)'},{transform:'translateY(3px)',offset:.3},{transform:'translateY(0)'}],360);}
  else status('前往意图未提交，请查看提示后重试。');
 }
 function reset(){for(const a of [...animations])a.cancel();animations.clear();for(const p of particles)p.remove();particles.clear();}
 function dispose(){if(disposed)return;disposed=true;reset();observer.disconnect();stops.forEach(f=>f());if(window.MikageMapDesk===api)delete window.MikageMapDesk;}
 // The persistent postcard element gets rebuilt by the data renderer. The fox remains a layer.
 const template=document.createElement('template');template.innerHTML='<button type="button" class="map-desk-fox" data-map-toy="fox" aria-label="轻点折纸狐，让它跳一跳"><svg viewBox="1402 528 285 258" aria-hidden="true"><defs><clipPath id="map-fox-clip"><rect x="1402" y="528" width="285" height="258"/></clipPath></defs><image href="https://cdn.jsdelivr.net/gh/AliceNekoqqq/Aliceneko-Map-Plugin@da40f818eb375224e93fbc6ff07ea18ed11c61c6/mikage-shrine/assets/ui/veranda-v143-objects.webp" width="1774" height="887" clip-path="url(#map-fox-clip)"/></svg></button>';
 function restoreFox(){if(!disposed&&!$('#place-card .map-desk-fox'))$('#place-card').append(template.content.cloneNode(true));}
 const observer=new MutationObserver(records=>{if(root.hidden){reset();return;}if(records.some(r=>r.type==='childList'))restoreFox();});observer.observe(root,{attributes:true,attributeFilter:['hidden'],subtree:true,childList:true});
 on(root,'click',click,true);on(document,'visibilitychange',()=>{if(document.hidden)reset();});on(media,'change',reset);on(window,'pagehide',dispose,{once:true});
 const api={selected:selectedRegion,travel,dispose,inspect:()=>({selected,selectionName,selections,pendingPlan,animations:animations.size,particles:particles.size,reduced:media.matches})};window.MikageMapDesk=api;restoreFox();
})();
