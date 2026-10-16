(function(){
 'use strict';
 let timer=0,panel=null;
 const plaque=document.getElementById('scene-plaque');
 const api=()=>window.parent.MikageDeveloperSandbox;
 function close(){panel?.remove();panel=null;resize();}
 function resize(){requestAnimationFrame(()=>window.MikageStatusBridge?.resize?.(document.getElementById('shrine-game').getBoundingClientRect().height+2));}
 function button(label,fn){const b=document.createElement('button');b.type='button';b.textContent=label;b.addEventListener('click',fn);return b;}
 function show(){close();panel=document.createElement('section');panel.className='dev-sheet';panel.setAttribute('aria-label','本地测试');const title=document.createElement('strong');title.textContent='本地测试';const feedback=document.createElement('p');feedback.setAttribute('role','status');panel.append(title,button('收起',close));
  const service=api();
  if(service?.active){const note=document.createElement('p');note.textContent='测试副本 · 所有地区与衣装已开放';panel.append(note);const select=document.createElement('select');select.setAttribute('aria-label','测试地区');for(const [id,r]of Object.entries(window.MikageNavigation.regions)){const o=document.createElement('option');o.value=id;o.textContent=r.name;select.append(o);}select.value=service.getState().地图.当前地区;panel.append(select,button('前往',()=>{service.travel(select.value);feedback.textContent='已切换测试地点。';}),button('退出测试',()=>{service.exit();close();}));}
  else{const input=document.createElement('input');input.type='password';input.autocomplete='off';input.placeholder='测试口令';input.setAttribute('aria-label','测试口令');const unlock=async()=>{try{if(!api())throw Error('请等待脚本加载。');await api().enter(input.value);show();}catch(e){feedback.textContent=e.message;}};panel.append(input,button('开启',unlock));input.addEventListener('keydown',e=>{if(e.key==='Enter')unlock();});requestAnimationFrame(()=>input.focus({preventScroll:true}));}
  panel.append(feedback);document.getElementById('scene-dock-anchor').after(panel);resize();
 }
 function cancel(){clearTimeout(timer);timer=0;}
 plaque.style.pointerEvents='auto';plaque.style.userSelect='none';plaque.style.touchAction='none';
 plaque.addEventListener('pointerdown',e=>{if(e.button!==0)return;cancel();timer=setTimeout(()=>{timer=0;show();},1800);});
 for(const name of ['pointerup','pointercancel','pointerleave'])plaque.addEventListener(name,cancel);
 plaque.addEventListener('contextmenu',e=>e.preventDefault());
 window.addEventListener('pagehide',()=>{cancel();close();},{once:true});
})();
