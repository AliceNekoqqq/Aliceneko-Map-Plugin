/* Session-only festival. Timing never writes story, inventory or relationship state. */
const MikageFestivalModel=(()=>{
 const colors={gold:{name:'暖金',hex:'#ffcb7b'},pink:{name:'樱粉',hex:'#f5a7c2'},blue:{name:'月白',hex:'#b2d9ff'}};
 const patterns={fox:'狐形',sakura:'樱花',ring:'重环'};
 const cues=[{x:24,y:23,shape:'ring'},{x:69,y:32,shape:'sakura'},{x:47,y:18,shape:'fox'},{x:75,y:21,shape:'ring'},{x:26,y:34,shape:'fox'},{x:53,y:25,shape:'sakura'},{x:25,y:20,shape:'sakura'},{x:73,y:31,shape:'ring'},{x:50,y:19,shape:'fox'}];
 const clamp=(x,a,b)=>Math.max(a,Math.min(b,x)),active=(s,p)=>s.phase===p&&!s.paused;
 function create(){return {phase:'ready',night:false,color:'gold',mode:'auto',slow:false,lamps:Array.from({length:8},()=>({charge:0,color:null})),selected:0,held:null,cue:0,time:0,hits:0,misses:0,loops:0,combo:0,best:0,assists:0,paused:false,finished:false,completed:false,shape:'fox',reply:'quiet',showCount:0,serial:0,event:null,message:'参道尽头留着几盏新灯。巴卫抬起手，指尖的狐火安静地亮着：“想点哪一盏？”'};}
 function color(s,id){if(!['ready','lanterns','encore'].includes(s.phase)||s.paused||!Object.hasOwn(colors,id))return false;s.color=id;return true;}
 function start(s){if(s.phase!=='ready')return false;s.phase='lanterns';s.message='按住一盏小灯，让狐火慢慢暖透灯芯。也能选好灯，再用下方按钮添火。';return true;}
 function select(s,i){if(!active(s,'lanterns')||!Number.isInteger(i)||i<0||i>=8)return false;s.selected=i;return true;}
 function hold(s,i){if(!select(s,i))return false;s.held=s.lamps[i].color?null:i;return true;}
 function release(s){s.held=null;}
 function charge(s,i,amount){if(!active(s,'lanterns')||!Number.isInteger(i)||!s.lamps[i]||!Number.isFinite(amount)||amount<=0)return false;const l=s.lamps[i];if(l.color)return false;l.charge=clamp(l.charge+amount,0,1);if(l.charge>=1){l.color=s.color;s.message='第'+(i+1)+'盏亮起来了。巴卫收住火尾，等你选下一盏。';if(s.held===i)s.held=null;}return true;}
 function light(s){return charge(s,s.selected,.34);}
 function lit(s){return s.lamps.filter(l=>l.color).length;}
 function begin(s,mode){if(!active(s,'lanterns')||!['auto','step'].includes(mode))return false;if(lit(s)!==8){s.message='手边还有'+(8-lit(s))+'盏没有亮，先把这段灯路点好。';return false;}s.held=null;s.mode=mode;s.phase='fireworks';s.night=true;s.time=0;s.message='入夜了。看着升空的光点，等外圈收进亮环，再接这一拍。';return true;}
 function emit(s,shape,x,y){s.event={serial:++s.serial,shape,color:s.color,x,y};}
 function hit(s){if(!active(s,'fireworks'))return false;if(s.time<.72||s.time>1.16){s.misses++;s.combo=0;s.message=s.time<.72?'还早一点，等光圈靠近中间的亮环。':'晚了一点。光点会再来，留意下一圈。';return false;}const cue=cues[s.cue];emit(s,cue.shape,cue.x,cue.y);s.hits++;s.combo++;s.best=Math.max(s.best,s.combo);s.cue++;s.time=0;if(s.hits===9){s.phase='encore';s.completed=true;s.message='最后一束狐形花火散开。巴卫没有催你走，只把袖口从灯架上拢了回来。';}else{s.message=s.hits%3===0?'这一段接好了，下一段换个方向升空。':'花火散开了，下一点光已经升起。';}return true;}
 function assist(s){if(!active(s,'fireworks'))return false;s.time=.94;s.assists++;s.message='巴卫轻轻点了下折扇：“就是现在。”';return true;}
 function mode(s,id){if(!active(s,'fireworks')||!['auto','step'].includes(id))return false;s.mode=id;return true;}
 function slow(s){if(!active(s,'fireworks'))return false;s.slow=!s.slow;return true;}
 function tick(s,seconds){if(s.paused||!Number.isFinite(seconds)||seconds<=0)return false;const dt=clamp(seconds,0,.1);if(s.phase==='lanterns'&&s.held!==null)return charge(s,s.held,dt/0.65);if(s.phase==='fireworks'){s.time+=dt*(s.slow?.55:1);if(s.time>1.8){s.time=0;s.loops++;s.combo=0;s.message='光点又升起来了。不必追赶，等它靠近亮环。';}return true;}return false;}
 function step(s){if(!active(s,'fireworks')||s.mode!=='step')return false;tick(s,.1);tick(s,.1);return true;}
 function shape(s,id){if(!active(s,'encore')||!Object.hasOwn(patterns,id))return false;s.shape=id;return true;}
 function launch(s,x=50,y=25){if(!active(s,'encore')||!Number.isFinite(x)||!Number.isFinite(y))return false;emit(s,s.shape,clamp(x,24,76),clamp(y,20,40));s.showCount++;s.message='你选的'+patterns[s.shape]+'花火在夜空里慢慢展开。';return true;}
 function reply(s,id){if(!active(s,'encore')||!['quiet','beside','ask'].includes(id))return false;s.reply=id;s.message={quiet:'你仰头看着余光散尽。巴卫也没说话，折扇停在手边。',beside:'你问他能不能再陪你看一会儿。他朝旁边让出一点位置：“站这里，灯架挡不住。”',ask:'你问他最喜欢哪一束。他看了你一眼：“最后那一束。你总算没只顾着点灯。”'}[id];return true;}
 function pause(s,v){if(!['lanterns','fireworks','encore'].includes(s.phase))return false;s.paused=!!v;s.held=null;return true;}
 function stop(s){if(!['lanterns','fireworks','encore'].includes(s.phase))return false;s.phase='closing';s.paused=false;s.held=null;s.message=s.completed?'把这一晚喜欢的那一幕留在手帖里。':'先收住狐火。这晚点过几盏、接过几束，就如实留在手帖里。';return true;}
 function finish(s,delivery){if(!active(s,'closing')||s.finished||!['self','tomoe'].includes(delivery))return null;s.finished=true;s.phase='done';return {region:'R10',title:'万灯花火祭',complete:s.completed,lit:lit(s),hits:s.hits,total:9,best:s.best,misses:s.misses,assists:s.assists,mode:s.mode,reply:s.reply,showCount:s.showCount,delivery,lamps:s.lamps.map(l=>l.color),rank:s.completed?'花火落进这一页':'灯路先留到这里',detail:'点亮手边'+lit(s)+' / 8盏小灯，接好'+s.hits+' / 9拍花火。'+(s.completed?'看完了三段花火。':'其余花火留待下次。')+(s.showCount?'又选放了'+s.showCount+'束花火。':'')+(delivery==='tomoe'?'巴卫把这一页夹进手帖，压平了纸角。':'把这一晚的灯色收进手帖。')};}
 return {colors,patterns,cues,create,color,start,select,hold,release,charge,light,lit,begin,hit,assist,mode,slow,tick,step,shape,launch,reply,pause,stop,finish};
})();
