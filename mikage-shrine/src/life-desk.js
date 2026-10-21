/* A view of the existing life domain. Only explicit action buttons call perform. */
(()=>{'use strict';const root=document.getElementById('life-dialog');if(!root)return;window.MikageLifeDesk?.dispose();
 const media=matchMedia('(prefers-reduced-motion: reduce)'),animations=new Set(),particles=new Set(),stops=[];
 const labels={north_eave:'北侧檐下',south_eave:'南侧檐下',floor_left:'回廊左侧',floor_right:'回廊右侧',garden_edge:'庭院边',stone_path:'石径旁',gate_eave:'鸟居檐下',gate_stand:'门前灯架',seat_left:'茶桌左侧',seat_right:'茶桌右侧'};
 const entries=[['decor','布置','看看檐下与庭院','veranda'],['quiet','廊下小憩','坐下来歇一会儿','veranda'],['craft','手作与料理','备一份日常心意','tea_table'],['garden','小菜圃','看看花木的长势','courtyard'],['shop','商店','查阅生活用品','gate'],['album','出行手帐','翻看已记下的风景','tea_table'],['strange','街区异样','看看路上遇见的小事','courtyard'],['festival','祭典','翻阅筹备与祭典记录','gate']];
 let disposed=false,pending=false,zoneId='veranda',itemId='',slotId='',decorId='',lastTab='',selectTab=null,current=null;
 const $=s=>root.querySelector(s),make=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e;};
 const name=(v,id)=>v.items?.find(x=>x.id===id)?.name||id;
 function on(el,type,fn){el.addEventListener(type,fn);stops.push(()=>el.removeEventListener(type,fn));}
 function message(text){const e=$('#life-feedback');if(e){e.textContent=text;e.dataset.state='';}}
 function animate(el,frames,ms=450){if(disposed||root.hidden||!el?.animate)return;const a=el.animate(media.matches?[{opacity:.65},{opacity:1}]:frames,{duration:media.matches?120:ms,easing:'cubic-bezier(.2,.8,.25,1)'});animations.add(a);a.onfinish=a.oncancel=()=>animations.delete(a);}
 function clearMotion(){for(const a of [...animations])a.cancel();animations.clear();for(const e of particles)e.remove();particles.clear();}
 function reset(){clearMotion();}
 function prop(id,v){const e=make('span','life-prop prop-'+id);e.setAttribute('aria-hidden','true');if(!['wind_chime','zabuton','lantern','herb_planter','flower_vase','morning_glory'].includes(id)){e.classList.add('prop-fallback');e.textContent=name(v,id).slice(0,1);}return e;}
 function btn(text,fn,cls='life-button'){const b=make('button',cls,text);b.type='button';b.addEventListener('click',fn);return b;}
 function commitButton(text,fn,disabled=false){const b=btn(text,()=>{if(!pending)fn();},'life-decor-confirm');b.dataset.lifeDeskCommit='true';b.dataset.disabled=String(disabled);b.disabled=pending||disabled;return b;}
 function busy(value){pending=value;root.setAttribute('aria-busy',String(value));for(const b of root.querySelectorAll('[data-life-desk-commit]'))b.disabled=value||b.dataset.disabled==='true';}
 function scene(v,zone,editable,select){const e=make('div','life-desk-scene');e.dataset.zone=zone.id;e.setAttribute('role','group');e.setAttribute('aria-label',zone.name+'布置场景');
  for(const slot of zone.slots||[]){const d=(v.decorations||[]).find(d=>d.zone===zone.id&&d.slot===slot.id);
   if(d){const b=btn('',()=>select(d,null),'life-desk-object');b.style.left=slot.x+'%';b.style.top=slot.y+'%';b.dataset.decoration=d.id;b.dataset.lit=String(!!d.state?.lit);b.setAttribute('aria-pressed',String(editable&&d.id===decorId));b.setAttribute('aria-label',name(v,d.item)+' · '+(labels[slot.id]||slot.id));b.append(prop(d.item,v),make('small','',name(v,d.item)+(d.item==='lantern'?(d.state?.lit?' · 亮':' · 熄'):'')));e.append(b);
   }else if(editable){const definition=current.config.items?.find(x=>x.id===itemId),available=!!definition&&(definition.slots||[]).includes(slot.type);const b=btn(labels[slot.id]||slot.id,()=>select(null,slot),'life-desk-slot');b.style.left=slot.x+'%';b.style.top=slot.y+'%';b.dataset.slot=slot.id;b.disabled=!available;b.setAttribute('aria-label',(labels[slot.id]||slot.id)+(available?'，可摆放':'，请先选合适的物件'));b.setAttribute('aria-pressed',String(slot.id===slotId));e.append(b);
    if(slot.id===slotId&&available){const ghost=make('div','life-desk-ghost');ghost.style.left=slot.x+'%';ghost.style.top=slot.y+'%';ghost.append(prop(itemId,v),make('small','','待摆放'));ghost.setAttribute('aria-hidden','true');e.append(ghost);}
   }
  }e.append(make('div','life-desk-fx'));return e;
 }
 function petals(scene){if(media.matches||disposed||root.hidden)return;const layer=scene.querySelector('.life-desk-fx');for(let i=0;i<8&&particles.size<20;i++){const e=make('i','life-desk-petal');e.style.left=(55+Math.random()*35)+'%';e.style.top=(8+Math.random()*20)+'%';layer.append(e);particles.add(e);const a=e.animate([{opacity:0,transform:'translate(0,0) rotate(0)'},{opacity:1,offset:.2},{opacity:0,transform:'translate(-35px,90px) rotate(150deg)'}],{duration:1200+Math.random()*400});animations.add(a);a.onfinish=a.oncancel=()=>{e.remove();particles.delete(e);animations.delete(a);};}}
 function home({view:v}){const content=$('#life-content'),zone=v.zones?.find(x=>x.id==='veranda')||v.zones?.[0];if(!zone){content.append(make('p','life-note','神社布置记录暂不可用。'));return;}
  const stage=scene(v,zone,false,(d)=>{decorId=d.id;zoneId=d.zone;selectTab?.('decor');});
  const blossom=btn('落樱',()=>{petals(stage);message('樱花从檐边轻轻落下。');},'life-home-blossom');blossom.setAttribute('aria-label','轻触樱枝，落下花瓣');stage.append(blossom);content.append(stage,make('p','life-home-caption','神社已摆 '+(v.decorations||[]).length+' 件陈设 · 点画面里的物件可查看布置'));
  const grid=make('div','life-home-entries');for(const [key,title,detail] of entries){const b=btn('',()=>selectTab?.(key),'life-home-entry');b.dataset.lifeEntry=key;b.append(make('span','life-home-thumb'),make('strong','',title),make('small','',detail));grid.append(b);}content.append(grid);
 }
 function decor(args){current=args;const {view:v,config,perform}=args,content=$('#life-content'),zones=v.zones||[];let zone=zones.find(x=>x.id===zoneId)||zones[0];if(!zone){content.append(make('p','life-note','还没有可布置的区域。'));return;}zoneId=zone.id;
  const owned=(v.items||[]).filter(x=>x.kind==='decoration'&&x.count>0);if(!owned.some(x=>x.id===itemId))itemId=owned[0]?.id||'';
  let selected=(v.decorations||[]).find(x=>x.id===decorId);if(selected&&selected.zone!==zone.id){decorId='';selected=null;}if(!selected)decorId='';
  const definition=config.items?.find(x=>x.id===itemId);const validSlots=(zone.slots||[]).filter(s=>(definition?.slots||[]).includes(s.type)&&!v.decorations.some(d=>d.zone===zone.id&&d.slot===s.id));if(!validSlots.some(x=>x.id===slotId))slotId=validSlots[0]?.id||'';
  const nav=make('nav','life-decor-zones');nav.setAttribute('aria-label','选择布置区域');for(const z of zones){const b=btn(z.name,()=>{zoneId=z.id;slotId='';decorId='';redraw();},'');b.dataset.lifeZone=z.id;b.setAttribute('aria-pressed',String(z.id===zoneId));nav.append(b);}content.append(nav);
  const layout=make('div','life-decor-layout'),left=make('div'),right=make('div');
  const stage=scene(v,zone,true,(d,slot)=>{if(d){decorId=d.id;slotId='';}else{decorId='';slotId=slot.id;}redraw();});left.append(stage,make('p','life-decor-hint','点陈设查看；选库存物件后，点空位预览。确认摆放前不会改变场景。'));
  const palette=make('section','life-decor-palette');palette.append(make('h3','','待摆放的物件'));const inventory=make('div','life-decor-inventory');
  for(const item of owned){const b=btn('',()=>{itemId=item.id;decorId='';slotId='';redraw();},'life-decor-item');b.dataset.lifeItem=item.id;b.setAttribute('aria-pressed',String(item.id===itemId));b.append(prop(item.id,v),make('span','',item.name),make('small','','库存 '+item.count));inventory.append(b);}palette.append(inventory);
  if(!owned.length)palette.append(make('p','','库存里暂时没有可摆放的物件。点场景里的陈设，可以先收起再换个位置。'));
  const chosen=validSlots.find(s=>s.id===slotId);const canPlace=!!itemId&&!!chosen&&!selected;
  const summary=make('p','',selected?'正在查看已摆放的陈设。':canPlace?name(v,itemId)+' → '+zone.name+' · '+(labels[slotId]||slotId):'这个区域暂无适合所选物件的空位。');summary.id='life-decor-preview-note';palette.append(summary);
  palette.append(commitButton('确认摆放',()=>perform({kind:'place',item:itemId,zone:zone.id,slot:slotId}),!canPlace));right.append(palette);
  const inspector=make('section','life-decor-inspector');inspector.setAttribute('aria-live','polite');
  if(selected){inspector.append(make('h3','',name(v,selected.item)),make('p','',zone.name+' · '+(labels[selected.slot]||selected.slot)),make('p','',selected.source||'神社已有用品'));const actions=make('div','life-decor-actions');
   if(selected.item==='lantern')actions.append(commitButton(selected.state?.lit?'熄灯':'点亮',()=>perform({kind:'light',decoration:selected.id,lit:!selected.state?.lit})));
   actions.append(commitButton('收起到库存',async()=>{itemId=selected.item;await perform({kind:'store',decoration:selected.id});}));inspector.append(actions);
  }else{inspector.append(make('h3','','布置小记'),make('p','',canPlace?'半透明物件是待摆放的预览，尚未进入正式记录。':'已摆的陈设仍保留在原处。'),make('p','','已摆放 '+(v.decorations||[]).filter(d=>d.zone===zone.id).length+' 件 · '+(zone.slots||[]).length+' 个位置'));}
  right.append(inspector);layout.append(left,right);content.append(layout);busy(pending);
 }
 function redraw(){if(disposed||!current)return;const scroll=window.scrollY,active=document.activeElement;const key=active?.dataset.lifeItem||active?.dataset.lifeZone||active?.dataset.decoration||active?.dataset.slot;const attr=active?.dataset.lifeItem?'lifeItem':active?.dataset.lifeZone?'lifeZone':active?.dataset.decoration?'decoration':'slot';clearMotion();$('#life-content').replaceChildren();decor(current);if(key){const b=[...root.querySelectorAll('button')].find(b=>b.dataset[attr]===key);b?.focus({preventScroll:true});animate(b,[{opacity:.5},{opacity:1}],320);}window.scrollTo({top:scroll});}
 function afterRender({tab,view:v,selectTab:choose}){selectTab=choose;if(tab!==lastTab){clearMotion();lastTab=tab;animate($('#life-content'),[{opacity:.45,transform:'translateY(5px)'},{opacity:1,transform:'translateY(0)'}],350);}busy(pending);if(tab==='home'&&!v?.zones?.length)message('生活记录尚未加载。');}
 function dispose(){if(disposed)return;disposed=true;reset();observer.disconnect();stops.forEach(f=>f());if(window.MikageLifeDesk===api)delete window.MikageLifeDesk;}
 const observer=new MutationObserver(()=>{if(root.hidden)reset();});observer.observe(root,{attributes:true,attributeFilter:['hidden']});on(root,'click',e=>{const b=e.target.closest('button');if(!b||b.disabled)return;if(b.classList.contains('life-desk-object')||b.classList.contains('life-desk-slot'))return;animate(b,[{opacity:.7},{opacity:1}],220);});on(media,'change',reset);on(document,'visibilitychange',()=>{if(document.hidden)reset();});on(window,'pagehide',dispose);
 const api={home,decor,afterRender,busy,dispose,inspect:()=>({pending,animations:animations.size,particles:particles.size,zone:zoneId,item:itemId,slot:slotId})};window.MikageLifeDesk=api;
})();
