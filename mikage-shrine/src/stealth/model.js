/* R07 local turn-based route. Formal game state is never read or written here. */
const MikageStealthModel=(()=>{
 const dirs={up:[0,-1],right:[1,0],down:[0,1],left:[-1,0],wait:[0,0]},names={up:'上',right:'右',down:'下',left:'左',wait:'等一拍'},marks=['潮','贝','月','星','鳞','珊','雾','波'];
 const levels=[
  {name:'珊瑚回廊',walls:[[0,2],[4,2],[2,0]],cover:[[1,3],[3,3],[0,1],[4,1]],clue:[3,1],hint:'外环 · 月',target:2,patrol:[[2,1,'down'],[3,1,'down'],[3,2,'left'],[2,2,'left'],[1,2,'up'],[1,1,'up']]},
  {name:'琉璃水牢',walls:[[0,2],[4,2],[2,3]],cover:[[1,3],[3,3],[2,0],[2,2]],clue:[0,0],hint:'中环 · 珊',target:5,patrol:[[1,2,'right'],[2,2,'up'],[3,2,'right'],[3,1,'down'],[2,1,'left'],[1,1,'down']]},
  {name:'藏潮内阁',walls:[[0,2],[4,2],[2,4],[1,0]],cover:[[0,1],[4,1],[1,3],[3,3]],clue:[2,2],hint:'内环 · 波',target:7,patrol:[[1,1,'right'],[2,1,'down'],[3,1,'down'],[3,0,'left'],[2,0,'down'],[1,0,'left']]}
 ];
 const same=(a,b)=>a[0]===b[0]&&a[1]===b[1],contains=(xs,p)=>xs.some(a=>same(a,p));
 function create(){return {phase:'ready',stage:0,x:0,y:4,turn:0,alert:0,clue:false,clues:[],moves:0,retries:0,helps:0,veil:0,paused:false,rings:[0,0,0],locked:[false,false,false],opened:false,finished:false,message:'水光在廊柱上晃。巴卫拢起袖口，朝珊瑚后的空隙抬了抬下巴：“先看清它往哪走。”'};}
 const level=s=>levels[Math.min(2,s.stage)];
 function guard(s,next=false){const p=level(s).patrol;return p[(s.turn+(next?1:0))%p.length];}
 function sight(s,next=false){const g=guard(s,next),d=dirs[g[2]],cells=[];for(let n=1;n<=3;n++){const p=[g[0]+d[0]*n,g[1]+d[1]*n];if(p.some(v=>v<0||v>4)||contains(level(s).walls,p)||contains(level(s).cover,p))break;cells.push(p);}return cells;}
 function exposed(s,p,next=false){return same(guard(s,next),p)||(!contains(level(s).cover,p)&&contains(sight(s,next),p));}
 function start(s){if(s.phase!=='ready')return false;s.phase='walk';s.message='先找纹片，再到右上角的廊门。你动一步，巡灯才走一步；珊瑚格能挡视线，不能与巡灯挤在同一格。';return true;}
 function valid(s,a){if(s.phase!=='walk'||s.paused||!Object.hasOwn(dirs,a))return false;const d=dirs[a],p=[s.x+d[0],s.y+d[1]];return p.every(v=>v>=0&&v<5)&&!contains(level(s).walls,p);}
 function act(s,a){if(!valid(s,a))return false;const d=dirs[a],p=[s.x+d[0],s.y+d[1]],collision=same(guard(s),p)||same(guard(s,true),p),seen=exposed(s,p)||exposed(s,p,true);s.x=p[0];s.y=p[1];s.turn++;s.moves++;
  s.alert=collision?2:seen&&s.veil===0?s.alert+1:Math.max(0,s.alert-1);if(s.veil>0)s.veil--;
  if(s.alert>=2){s.phase='caught';s.message='巡灯照到了脚边。巴卫把你带回这一段的廊口；前面找到的纹片还在，当前这一段重新走。';s.retries++;return true;}
  if(same(p,level(s).clue)&&!s.clue){s.clue=true;s.message='找到了纹片：「'+level(s).hint+'」。先带它走到右上角廊门。';}
  else s.message=s.alert?'巡灯擦过衣角，再停留会被发现。找珊瑚遮挡，或离开当前和下一步的照亮格。':contains(level(s).cover,p)?'珊瑚把灯光隔开了。巴卫停在你侧后，等下一阵水声。':'脚步落稳，巡灯也往前挪了一处。';
  if(s.x===4&&s.y===0){if(!s.clue){s.message='这一段的纹片还没找到，先别往内阁走。';return true;}if(!s.clues.includes(s.stage))s.clues.push(s.stage);s.phase=s.stage===2?'seal':'rest';s.veil=0;s.message=s.stage===2?'宝匣就在眼前。把三枚纹片记下的图样转到缺口，再试着开匣。':'这一段走出来了。把纹片压在手帖里，歇一会儿再走。';}return true;
 }
 function resetStage(s){s.x=0;s.y=4;s.turn=0;s.alert=0;s.clue=false;s.veil=0;s.paused=false;}
 function retry(s){if(s.phase!=='caught')return false;resetStage(s);s.phase='walk';s.message='回到当前廊口。已走完的路和纹片不丢，这一次先看下一步巡灯落点。';return true;}
 function next(s){if(s.phase!=='rest')return false;s.stage++;resetStage(s);s.phase='walk';s.message='换了一处回廊，巡灯的走法也不同。先看光，再走。';return true;}
 function assist(s){if(s.phase!=='walk'||s.paused||s.helps>=2||s.veil>0)return false;s.helps++;s.veil=2;s.message='巴卫展袖遮住灯光：“两步。看准了再走。”遮光能避开视线，仍不能撞上巡灯。';return true;}
 function pause(s,value){if(s.phase!=='walk')return false;s.paused=Boolean(value);return true;}
 function ring(s,i,value){if(s.phase!=='seal'||!Number.isInteger(i)||i<0||i>2||s.locked[i]||!Number.isInteger(value)||value<0||value>7)return false;s.rings[i]=value;return true;}
 function lock(s,i){if(s.phase!=='seal'||!Number.isInteger(i)||i<0||i>2)return false;s.locked[i]=!s.locked[i];return true;}
 function open(s){if(s.phase!=='seal')return false;if(!s.locked.every(Boolean)||!s.rings.every((v,i)=>v===levels[i].target)){s.message='匣扣没有松。把外、中、内三环分别对上纹片里的图样，再扣稳三环。';return false;}s.opened=true;s.phase='return';s.message='匣盖轻轻一松，内衬上浮着水纹。巴卫看了一眼：“看过便记下，别碰不该带走的东西。”';return true;}
 function stop(s){if(!['walk','caught','rest','seal'].includes(s.phase))return false;s.phase='return';s.paused=false;s.veil=0;s.message='沿来路收步。走到哪，就把手记写到哪；还没打开的宝匣留待下次。';return true;}
 function finish(s,delivery){if(s.phase!=='return'||s.finished||!['self','tomoe'].includes(delivery))return null;s.finished=true;s.phase='done';return {region:'R07',title:'龙宫潜行寻宝',stamp:'藏潮寻宝手记',complete:s.opened,opened:s.opened,passed:s.clues.length,total:3,moves:s.moves,retries:s.retries,helps:s.helps,delivery,rank:s.opened?'循水光，寻到藏潮匣':'这一程先记到这里',detail:'沿龙宫回廊走完'+s.clues.length+' / 3段，'+(s.opened?'三环对齐，已查看宝匣。':'宝匣尚未打开。')+(s.clue&&!s.clues.includes(s.stage)?'当前纹片尚未带出，未计入完成。':'')+'共行'+s.moves+'步'+(s.retries?'，当前廊口重试'+s.retries+'次':'')+(s.helps?'，请巴卫掩护'+s.helps+'次':'')+'。'+(delivery==='tomoe'?'请巴卫把这一程的纹样摹在手记里。':'自己摹下这一程的纹样。')+'只是本地寻宝纪念，没有取得正式龙眼、宝珠或改动主线与资源。'};}
 function suggest(s){if(s.phase!=='walk'||s.paused)return null;const q=[{s:JSON.parse(JSON.stringify(s)),first:null}],seen=new Set();for(let n=0;n<q.length&&n<5000;n++){const node=q[n],a=node.s,key=[a.x,a.y,a.turn%level(a).patrol.length,a.alert,+a.clue,a.veil].join(':');if(seen.has(key))continue;seen.add(key);for(const action of ['up','right','down','left','wait']){const b=JSON.parse(JSON.stringify(a));if(!act(b,action)||b.phase==='caught')continue;const first=node.first||action;if(b.phase==='rest'||b.phase==='seal')return first;q.push({s:b,first});}}return null;}
 return {dirs,names,marks,levels,create,level,guard,sight,exposed,start,valid,act,retry,next,assist,pause,ring,lock,open,stop,finish,suggest};
})();
