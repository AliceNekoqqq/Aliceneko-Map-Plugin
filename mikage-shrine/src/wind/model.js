/* R06 local flight rehearsal. All checkpoints and assists are UI-local. */
const MikageWindModel=(()=>{
 const sections=['杉影借风','山脊回流','长门归羽'];
 const styles={steady:{name:'缓翼稳行',wind:.8,speed:.22},swift:{name:'乘风轻行',wind:1.1,speed:.28}};
 const rows=[{center:55,wind:-9},{center:30,wind:10},{center:70,wind:-12},{center:45,wind:13},{center:25,wind:-14},{center:65,wind:11}];
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 function create(){return {phase:'ready',style:'steady',mode:'auto',slow:false,paused:false,held:false,y:50,vy:0,index:0,progress:0,passed:[],retries:0,helps:0,guard:-1,sheltered:false,finished:false,mark:'leaf',message:'杉枝在风里作响。巴卫把纸鹤放到你手边：“先让它站稳，再往前送。”',last:''};}
 function choose(s,id){if(s.phase!=='ready'||!Object.hasOwn(styles,id))return false;s.style=id;return true;}
 function row(s){const r=rows[s.index];if(!r)return null;return {...r,half:12,wind:s.guard===s.index?0:r.wind*styles[s.style].wind*(s.sheltered?.55:1)};}
 function start(s,mode){if(s.phase!=='ready')return false;s.mode=mode==='step'?'step':'auto';s.phase='fly';s.message='按住托起，松手会下落。看纸鹤前方那道亮着的空隙。';return true;}
 function move(s,y){if(s.phase!=='fly'||s.paused||!Number.isFinite(y))return false;s.y=clamp(y,8,92);s.vy=0;return true;}
 function hold(s,value){if(s.phase!=='fly'||s.paused)return false;s.held=Boolean(value);return true;}
 function guard(s){if(s.phase!=='fly'||s.paused||s.helps>=2||s.guard===s.index)return false;s.guard=s.index;s.helps++;s.vy*=.3;s.message='巴卫抬起折扇挡住这一阵风：“空隙还在，慢慢过去。”';return true;}
 function integrate(s,dt){const r=row(s);s.vy+=(12-(s.held?32:0)+r.wind)*dt;s.vy*=Math.exp(-2*dt);s.y=clamp(s.y+s.vy*dt,8,92);if(s.y===8&&s.vy<0||s.y===92&&s.vy>0)s.vy=0;}
 function resolve(s){if(s.progress<1-1e-9)return;const r=row(s);s.progress=1;
  if(Math.abs(s.y-r.center)>r.half){s.phase='recover';s.held=false;s.retries++;s.last='miss';s.message='纸鹤偏出了风门。巴卫用扇尖接住它，送回这一段的歇脚处。先前通过的风门还记着。';return;}
  s.passed.push(s.index);s.index++;s.progress=0;s.guard=-1;s.vy=0;s.last='pass';s.message='纸翼擦着空隙掠过。巴卫收起折扇，朝前面的山路点了点下巴。';
  if(s.index===rows.length){s.phase='return';s.held=false;s.message='纸鹤越过长门，落回廊下。风还在山脊上走，你可以把这一程记在纸羽上。';}
  else if(s.index%2===0){s.phase='rest';s.held=false;s.message='这一段走完了。先把纸翼的折痕抚平，再决定从哪一侧借风。';}
 }
 function tick(s,dt){if(s.phase!=='fly'||s.paused||s.mode==='step')return false;const time=clamp(Number(dt)||0,0,.1)*(s.slow?.55:1);if(time<=0)return false;integrate(s,time);s.progress=Math.min(1,s.progress+time*styles[s.style].speed);resolve(s);return true;}
 function step(s){if(s.phase!=='fly'||s.paused)return false;integrate(s,.12);s.progress=Math.min(1,s.progress+.25);resolve(s);return true;}
 function retry(s){if(s.phase!=='recover')return false;s.phase='fly';s.progress=0;s.y=50;s.vy=0;s.held=false;s.paused=false;s.message='仍从这道风门重来。可以先调到亮着的高度，再往前送。';return true;}
 function next(s,sheltered){if(s.phase!=='rest')return false;s.sheltered=Boolean(sheltered);s.phase='fly';s.held=false;s.paused=false;s.message=s.sheltered?'沿杉影近廊走，下一段的风会轻一些。':'沿山脊外侧借风，纸翼抖开了些。巴卫站在侧边等你。';return true;}
 function stop(s){if(!['fly','rest','recover'].includes(s.phase))return false;s.phase='return';s.held=false;s.paused=false;s.vy=0;s.message='先把纸鹤收回来。通过几道风门，就记几道；剩下的改日再走。';return true;}
 function mark(s,id){if(s.phase!=='return'||!['leaf','feather','plain'].includes(id))return false;s.mark=id;return true;}
 function finish(s,delivery){if(s.phase!=='return'||s.finished||!['self','tomoe'].includes(delivery))return null;s.finished=true;s.phase='done';s.held=false;s.paused=false;const complete=s.passed.length===rows.length;
  return {region:'R06',title:'鞍马山纸鹤御风',stamp:'山风纸羽',complete,passed:s.passed.length,total:rows.length,style:s.style,helps:s.helps,retries:s.retries,mark:s.mark,delivery,
   rank:complete?'纸鹤越过六道风门':'走到这里，也留一页',detail:'在鞍马山以「'+styles[s.style].name+'」送出纸鹤，通过'+s.passed.length+' / '+rows.length+'道风门'+(s.retries?'，从当前风门重试'+s.retries+'次':'')+(s.helps?'，请巴卫挡风'+s.helps+'次':'')+'。'+(complete?'纸鹤越过长门后收回。':'提前收鹤，其余风门未记为已通过。')+'在纸羽手记留了'+{leaf:'杉叶纹',feather:'山羽纹',plain:'素面'}[s.mark]+'，'+(delivery==='tomoe'?'请巴卫替你夹进手帖。':'自己夹进手帖。')+'只是本地纪念，没有获得正式飞羽或改动主线与资源。'};
 }
 return {sections,styles,total:rows.length,create,choose,row,start,move,hold,guard,tick,step,retry,next,stop,mark,finish};
})();
