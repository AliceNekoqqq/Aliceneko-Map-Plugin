/* Small deterministic canvas display; no imports, sound, timers or screen flashes. */
function createMikageFestivalSky(host,canvas,reduced=false){
 let groups=[],disposed=false;const ctx=canvas.getContext('2d');
 const fox=[[-.85,.25],[-.78,-.85],[-.36,-.48],[0,-.56],[.36,-.48],[.78,-.85],[.85,.25],[.48,.7],[0,.94],[-.48,.7]];
 function points(shape){if(shape==='fox'){const p=[];for(let i=0;i<fox.length;i++){const a=fox[i],b=fox[(i+1)%fox.length];for(let k=0;k<6;k++)p.push([a[0]+(b[0]-a[0])*k/6,a[1]+(b[1]-a[1])*k/6]);}return p;}return Array.from({length:72},(_,i)=>{const a=i*Math.PI*2/72,r=shape==='sakura'?.7+.25*Math.cos(5*a):i%2?.65:1;return [Math.cos(a)*r,Math.sin(a)*r];});}
 function emit(event){if(disposed||!event)return;groups.push({...event,age:reduced?.95:0,points:points(event.shape)});if(groups.length>4)groups.shift();draw();}
 function tick(dt){if(disposed||reduced)return;for(const g of groups)g.age+=Math.max(0,Math.min(.1,dt||0));groups=groups.filter(g=>g.age<2.4);}
 function draw(){if(disposed||!ctx)return;const rect=canvas.getBoundingClientRect(),w=rect.width,h=rect.height;if(!w||!h)return;const dpr=Math.min(host.devicePixelRatio||1,2);if(canvas.width!==Math.round(w*dpr)||canvas.height!==Math.round(h*dpr)){canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);}ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);
  for(let i=0;i<25;i++){const x=((i*83+31)%997)/997*w,y=((i*47+17)%277)/997*h;ctx.fillStyle=i%3?'#e9f0ff55':'#e9f0ff88';ctx.beginPath();ctx.arc(x,y,i%4===0?1.1:.6,0,Math.PI*2);ctx.fill();}
  for(const g of groups){const cx=g.x/100*w,cy=g.y/100*h,base=h*.83;if(g.age<.36){const t=g.age/.36,y=base+(cy-base)*(1-(1-t)**2);ctx.beginPath();ctx.moveTo(cx,y+24);ctx.lineTo(cx,y);ctx.strokeStyle=g.color;ctx.lineWidth=2;ctx.stroke();continue;}
   const t=g.age-.36,size=Math.min(w*.22,h*.20),reach=1-Math.exp(-t*3.4),alpha=Math.max(0,1-t/2.04);ctx.globalAlpha=alpha;
   for(let i=0;i<g.points.length;i++){const p=g.points[i],fall=t*t*9,x=cx+p[0]*size*reach,y=cy+p[1]*size*reach+fall;ctx.strokeStyle=g.color;ctx.lineWidth=1.3;ctx.beginPath();ctx.moveTo(x-p[0]*Math.max(1,9-t*3),y-p[1]*Math.max(1,9-t*3)-1);ctx.lineTo(x,y);ctx.stroke();ctx.fillStyle=i%4===0?'#fff5d6':g.color;ctx.beginPath();ctx.arc(x,y,i%3?1.45:2.1,0,Math.PI*2);ctx.fill();}
   if(g.shape==='fox'){ctx.fillStyle='#fff0c5';for(const side of [-1,1]){ctx.beginPath();ctx.arc(cx+side*size*.28*reach,cy+size*.1*reach+t*t*9,2.1,0,Math.PI*2);ctx.fill();}}
   ctx.globalAlpha=1;
  }
 }
 return {emit,tick,draw,active:()=>!reduced&&groups.length>0,dispose(){disposed=true;groups=[];if(ctx)ctx.clearRect(0,0,canvas.width,canvas.height);}};
}
