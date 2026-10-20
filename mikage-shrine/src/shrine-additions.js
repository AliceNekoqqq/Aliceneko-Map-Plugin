/* Read-only additions on the existing illustration. No background or navigation changes. */
(()=>{
 'use strict';
 const atlas='__ATLAS_URL__',host=document.getElementById('shrine-additions'),notice=document.getElementById('additions-status');
 const rects={rope:[0,0,550,500],lantern:[550,0,480,500],cabinet:[1030,0,506,500],banner:[0,500,505,524],planter:[505,500,520,524]};
 const modules=[
  {id:'gate-rope',owner:'鸟居',sprite:'rope',x:29,y:54,w:13,h:17,rotate:3},
  {id:'path-lamp-left',owner:'参道',sprite:'lantern',x:17,y:88,w:5,h:11},
  {id:'path-lamp-right',owner:'参道',sprite:'lantern',x:74,y:70,w:5,h:11},
  {id:'office-cabinet',owner:'社务所',sprite:'cabinet',x:95,y:71,w:10,h:25},
  {id:'hall-banner',owner:'拜殿',sprite:'banner',x:52,y:55,w:5,h:20},
  {id:'garden-planter',owner:'庭院',sprite:'planter',x:11,y:90,w:20,h:15}
 ];
 const effects={鸟居:'鸟居挂上了注连绳。',参道:'参道旁添上了两盏石灯。',社务所:'社务所添上了御守陈列架。',拜殿:'拜殿前立起了奉纳幡。',庭院:'庭院添上了一坛鸢尾与小花。'};
 let latest=null,region='R01',period='day',disposed=false,loading=false,loaded='',previous=null,signature='',generation=0;
 function clear(){host.replaceChildren();previous=null;signature='';}
 function resetScope(){latest=null;clear();notice.hidden=true;}
 function preload(url){return new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(url);im.onerror=reject;im.src=url})}
 async function ensure(){if(loading||loaded||disposed)return;loading=true;const own=generation;
  try{const candidates=[atlas,atlas.replace('cdn.jsdelivr.net','testingcf.jsdelivr.net'),atlas.replace('https://cdn.jsdelivr.net/gh/','https://raw.githubusercontent.com/').replace('@','/')];let found='';for(const url of candidates){try{found=await preload(url);break}catch{}}if(disposed||own!==generation)return;loading=false;if(!found)throw Error();loaded=found;signature='';draw();}
  catch{if(disposed||own!==generation)return;loading=false;host.dataset.state='error';notice.textContent='新增景物暂未载入，点击重试';notice.hidden=region!=='R01'||!latest;}
 }
 function draw(){host.hidden=region!=='R01';if(disposed)return;if(region!=='R01'){notice.hidden=true;return;}
  if(!latest){clear();notice.hidden=true;host.dataset.state='empty';return;}
  const stages={};for(const name of Object.keys(effects)){const v=latest.神社?.[name];stages[name]=Number.isInteger(v)&&v>=0&&v<=4?v:null;}
  const selected=modules.filter(m=>stages[m.owner]===4);host.dataset.period=period;
  if(!selected.length){clear();previous={...stages};host.dataset.state='ready';notice.hidden=true;return;}
  if(!loaded){ensure();return;}
  const key=JSON.stringify(stages);if(key===signature)return;
  const fresh=previous?Object.keys(stages).filter(n=>previous[n]!==4&&stages[n]===4):[];host.replaceChildren();
  for(const m of selected){const e=document.createElement('span');e.className='shrine-addition'+(fresh.includes(m.owner)?' addition-new':'');e.dataset.addition=m.id;e.dataset.facility=m.owner;e.style.left=m.x+'%';e.style.top=m.y+'%';e.style.width=m.w+'%';e.style.height=m.h+'%';e.style.zIndex=String(Math.round(m.y*10));if(m.rotate)e.style.rotate=m.rotate+'deg';e.setAttribute('aria-hidden','true');
   const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox',rects[m.sprite].join(' '));svg.setAttribute('preserveAspectRatio','none');const im=document.createElementNS('http://www.w3.org/2000/svg','image');im.setAttribute('href',loaded);im.setAttribute('width','1536');im.setAttribute('height','1024');svg.append(im);e.append(svg);host.append(e);}
  signature=key;previous={...stages};host.dataset.state='ready';notice.hidden=true;
 }
 function render(state,nextRegion,nextPeriod){latest=state?.神社?state:null;region=nextRegion;period=nextPeriod||period;draw();}
 function retry(){if(host.dataset.state==='error')ensure();}
 function dispose(){disposed=true;generation++;notice.removeEventListener('click',retry);clear();notice.hidden=true;}
 notice.addEventListener('click',retry);
 window.MikageShrineAdditions={render,resetScope,dispose,effects,inspect:()=>({state:host.dataset.state,period,region,modules:[...host.children].map(e=>e.dataset.addition)})};
})();
