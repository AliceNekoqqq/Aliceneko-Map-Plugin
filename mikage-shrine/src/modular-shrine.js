/* R01 display adapter. No game writes; all authoritative data arrives through the existing scene render. */
(()=>{
 'use strict';
 const model=(()=>{__MODEL__;return{project,mount,sprites,slots,changes};})();
 const atlas='__ATLAS_URL__';
 const layer=document.getElementById('modular-shrine'),canvas=document.getElementById('modular-ground'),status=document.getElementById('modular-status');
 let latest=null,period='day',region='R01',controller=null,loading=false,disposed=false,epoch=0,lastStages=null,lastSignature='',chosenURL='';
 function clear(){layer.querySelectorAll('.modular-part').forEach(e=>e.remove());lastSignature='';lastStages=null;canvas.width=768;}
 function resetScope(){latest=null;clear();status.hidden=true;layer.dataset.state='empty';}
 function displayState(){return{...latest,环境:{...latest.环境,时段:({day:'白昼',dusk:'傍晚',night:'夜晚'})[period]||'白昼'}};}
 function preload(url){return new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(url);im.onerror=reject;im.src=url;});}
 async function ensure(){
  if(disposed||controller||loading||!latest)return;
  const own=epoch;loading=true;layer.dataset.state='loading';status.hidden=false;status.textContent='神社景物正在载入…';
  try{
   const candidates=[atlas,atlas.replace('cdn.jsdelivr.net','testingcf.jsdelivr.net'),atlas.replace('https://cdn.jsdelivr.net/gh/','https://raw.githubusercontent.com/').replace('@','/')];
   let found='';for(const url of candidates){try{found=await preload(url);break;}catch{}}
   if(disposed||own!==epoch)return;if(!found)throw Error('神社部件暂未载入，点击重试');chosenURL=found;
   // A neutral valid snapshot is used only when the frame lost its floor while loading.
   const c=await model.mount(canvas,{getState:()=>latest?displayState():{神社:{鸟居:0,参道:0,社务所:0,拜殿:0,庭院:0}},atlasURL:found,drawModules:false,drawDecorations:false});
   if(disposed||own!==epoch){c.dispose();return;}controller=c;loading=false;lastSignature='';draw();
  }catch(error){if(disposed||own!==epoch)return;loading=false;layer.dataset.state='error';status.hidden=false;status.textContent=error.message||'神社部件暂未载入，点击重试';}
 }
 function draw(){
  layer.hidden=region!=='R01';if(region!=='R01')status.hidden=true;if(disposed||region!=='R01')return;
  if(!latest){clear();layer.dataset.state='empty';status.hidden=false;status.textContent='等候本楼神社记录';return;}
  let view;try{view=model.project(latest);}catch{clear();layer.dataset.state='error';status.hidden=false;status.textContent='本楼建设记录暂时无法显示，请重读记录';return;}
  if(!controller){ensure();return;}
  const signature=JSON.stringify([view.stages,period]);if(signature===lastSignature)return;
  controller.render(displayState());layer.dataset.period=period;layer.dataset.state='ready';status.hidden=true;
  const changed=lastStages?Object.keys(view.stages).filter(n=>lastStages[n]!==4&&view.stages[n]===4):[];
  layer.querySelectorAll('.modular-part').forEach(e=>e.remove());
  for(const m of view.modules){
   const e=document.createElement('span');e.className='modular-part'+(changed.includes(m.owner)?' modular-new':'');e.dataset.module=m.id;e.dataset.facility=m.owner;e.dataset.sprite=m.sprite;e.setAttribute('aria-hidden','true');
   e.style.left=(m.x/768*100)+'%';e.style.top=(m.y/512*100)+'%';e.style.width=(m.w/768*100)+'%';e.style.height=(m.h/512*100)+'%';e.style.zIndex=String(Math.round(m.y/512*1000));
   const [x,y,w,h]=model.sprites[m.sprite],svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox',[x,y,w,h].join(' '));svg.setAttribute('preserveAspectRatio','none');const image=document.createElementNS('http://www.w3.org/2000/svg','image');image.setAttribute('href',chosenURL);image.setAttribute('width','1536');image.setAttribute('height','1024');svg.append(image);e.append(svg);layer.append(e);
  }
  lastSignature=signature;lastStages={...view.stages};
 }
 function render(state,nextRegion,nextPeriod){latest=state?.神社?state:null;region=nextRegion;period=nextPeriod||period;draw();}
 function dispose(){disposed=true;epoch++;controller?.dispose();controller=null;status.removeEventListener('click',retry);clear();}
 function retry(){if(layer.dataset.state==='error'){lastSignature='';ensure();}}
 status.addEventListener('click',retry);
 window.MikageModularShrine={render,resetScope,dispose,slots:model.slots,inspect:()=>({state:layer.dataset.state,period,region,stages:lastStages&&{...lastStages},modules:[...layer.querySelectorAll('[data-module]')].map(e=>e.dataset.module)})};
})();
