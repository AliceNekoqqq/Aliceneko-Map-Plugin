/* R04 fictional ritual: local collecting, blending and sealing. No formal game writes. */
const MikagePlumModel=(()=>{
 const kinds={white:'白梅',pink:'绯梅',dew:'晨露',twig:'枯枝'};
 const recipes={clear:{name:'月白清香',target:{white:3,pink:1,dew:2},angle:120,note:'白梅为主，留一点绯梅的甜香。'},sweet:{name:'绯梅柔香',target:{white:2,pink:3,dew:1},angle:240,note:'绯梅多一份，香气偏柔和。'},fresh:{name:'露冷疏香',target:{white:2,pink:1,dew:3},angle:300,note:'多留一份晨露，花香淡一些。'}};
 const rows=[['white',20,0],['pink',80,-30],['twig',50,0],['dew',50,30],['white',80,-30],['twig',20,30],['pink',20,30],['dew',80,0],['twig',50,-30],['white',50,-30],['pink',80,0],['twig',20,0],['dew',20,30],['white',80,0],['twig',80,-30],['pink',50,30],['dew',50,-30],['twig',50,0]];
 const clamp=(n,a,b)=>Math.max(a,Math.min(b,n)),blank=()=>({white:0,pink:0,dew:0});
 function create(){return {phase:'ready',recipe:'clear',mode:'auto',slow:false,paused:false,x:50,index:0,progress:0,sheltered:false,guard:-1,helps:0,picked:blank(),borrowed:blank(),blend:blank(),missed:0,twigs:0,angle:0,wrap:'paper',finished:false,message:'瑞希把花篮放在桌边。巴卫抬头看了看梅枝：“先看风。”',last:''};}
 function choose(s,id){if(s.phase!=='ready'||!Object.hasOwn(recipes,id))return false;s.recipe=id;return true;}
 function start(s,mode){if(s.phase!=='ready')return false;s.mode=mode==='step'?'step':'auto';s.phase='catch';s.message='青瓷盏放稳了。拖动盏身，或用下方按钮左右移动。';return true;}
 function row(s){const r=rows[s.index];if(!r)return null;return {kind:r[0],x:r[1],wind:r[2]*(s.sheltered?.5:1)};}
 function target(s,final=false){const r=row(s);if(!r)return 50;const factor=final?1:clamp((s.progress-.35)/.3,0,1);return clamp(r.x+(s.guard===s.index?0:r.wind)*factor,15,85);}
 function move(s,x){if(s.phase!=='catch'||s.paused||!Number.isFinite(x))return false;s.x=clamp(x,10,90);return true;}
 function guard(s){const r=row(s);if(s.phase!=='catch'||s.paused||s.helps>=2||s.guard===s.index||!r||(!r.wind&&r.kind!=='twig'))return false;s.guard=s.index;s.helps++;s.message=r.kind==='twig'?'巴卫用折扇挑开了那根枯枝。“继续接花。”':'“盏拿稳。”巴卫站到迎风处，这一阵风缓了下来。';return true;}
 function advance(s,amount){
  if(s.phase!=='catch'||s.paused||!Number.isFinite(amount)||amount<=0)return false;s.progress=Math.min(1,s.progress+Math.min(amount,.25));if(s.progress<1-1e-9)return true;
  const r=row(s),hit=Math.abs(s.x-target(s,true))<=13;s.last='';
  if(r.kind==='twig'){if(hit&&s.guard!==s.index){s.twigs++;s.last='twig';s.message='枯枝搭在盏沿。你把它拈走，瑞希换来一只干净的盏，先前收好的花仍留在篮中。';}else{s.last='avoided';s.message=s.guard===s.index?'枯枝被折扇挑到一旁，盏里仍很干净。':'枯枝从盏边落下，没有混进收好的花里。';}}
  else if(hit){s.picked[r.kind]++;s.last='caught';s.message=kinds[r.kind]+'落进盏中。瑞希递来小碟，把这一份单独收好。';}
  else{s.missed++;s.last='miss';s.message=kinds[r.kind]+'飘到盏外。巴卫看了一眼下一枝花：“还有，别追那一片。”';}
  s.index++;s.progress=0;s.guard=-1;if(s.index>=rows.length){s.phase='mix';s.message='先把收好的花分开。花料不足，可以向瑞希借花篮里备好的份量。';}else if(s.index%6===0){s.phase='rest';s.message='廊下的风停了一会儿。瑞希护住花篮，问你要不要往里挪一点。';}return true;
 }
 function tick(s,dt){if(s.mode==='step')return false;return advance(s,clamp(Number(dt)||0,0,.1)*(s.slow?.17:.30));}
 function next(s,sheltered){if(s.phase!=='rest')return false;s.sheltered=Boolean(sheltered);s.phase='catch';s.paused=false;s.message=s.sheltered?'你把盏移近廊内，风会轻一些。':'梅树下还有几簇新开的花。巴卫站在侧边，等你接下一片。';return true;}
 function stopCollect(s){if(!['catch','rest'].includes(s.phase))return false;s.phase='mix';s.paused=false;s.progress=0;s.guard=-1;s.message='先收好已接到的。缺的份量可以向瑞希借，也可以改留一张香笺。';return true;}
 const stock=(s,id)=>s.picked[id]+s.borrowed[id];
 function supplement(s){if(s.phase!=='mix')return false;const t=recipes[s.recipe].target;for(const id of Object.keys(t))s.borrowed[id]+=Math.max(0,t[id]-stock(s,id));s.message='瑞希把花篮和露器推过来：“缺多少取多少，记在配方边上就是。”';return true;}
 function add(s,id,delta){if(s.phase!=='mix'||!Object.hasOwn(s.blend,id)||![1,-1].includes(delta))return false;const total=Object.values(s.blend).reduce((a,b)=>a+b,0),n=s.blend[id]+delta;if(n<0||n>stock(s,id)||(delta>0&&total>=6))return false;s.blend[id]=n;s.message='已调入 '+Object.values(s.blend).reduce((a,b)=>a+b,0)+' / 6 份。可以照着香方，也可以保留自己的配比。';return true;}
 function seal(s){if(s.phase!=='mix')return false;if(Object.values(s.blend).reduce((a,b)=>a+b,0)!==6){s.message='这一小坛需要六份花露。先配齐，再封口。';return false;}s.phase='seal';s.message='瑞希将调好的花露移入小坛。对齐纸封的记号，再系上绳结。';return true;}
 function turn(s,angle){if(s.phase!=='seal'||!Number.isFinite(angle))return false;s.angle=((angle%360)+360)%360;return true;}
 function wrap(s,id){if(s.phase!=='seal'||!['paper','bamboo'].includes(id))return false;s.wrap=id;return true;}
 function finish(s,delivery,cardOnly=false){
  if(s.finished||!['store','recipe'].includes(delivery)||(!cardOnly&&s.phase!=='seal')||(cardOnly&&s.phase!=='mix'))return null;
  const r=recipes[s.recipe],distance=Math.abs(((s.angle-r.angle+540)%360)-180);
  if(!cardOnly&&distance>15){s.message='纸封记号还没对齐。把金色小点转向缺口，前后十五度内都能合好。';return null;}
  s.phase='done';s.finished=true;s.paused=false;const borrowed=Object.values(s.borrowed).reduce((a,b)=>a+b,0),fit=Object.keys(r.target).reduce((n,id)=>n+Math.abs(s.blend[id]-r.target[id]),0);
  return {region:'R04',title:'神梅树下·落梅封香',stamp:'落梅香方',rank:cardOnly?'把花香留在纸上':fit===0?'照着香方，封好这一坛':'这一坛，留你的配比',recipe:s.recipe,recipeName:r.name,picked:{...s.picked},borrowed:{...s.borrowed},blend:{...s.blend},helps:s.helps,twigs:s.twigs,missed:s.missed,cardOnly,delivery,wrap:s.wrap,
   detail:'在夜森神社接到白梅'+s.picked.white+'份、绯梅'+s.picked.pink+'份、晨露'+s.picked.dew+'份'+(borrowed?'，向瑞希借补'+borrowed+'份备料':'，没有借补备料')+'。'+(cardOnly?'只把「'+r.name+'」的香方写在纸上，没有调制或封坛。':'以白梅'+s.blend.white+'份、绯梅'+s.blend.pink+'份、晨露'+s.blend.dew+'份调配，'+(s.wrap==='bamboo'?'用竹叶护封':'用素纸护封')+'，对齐封口后托瑞希留坛待酿。'+(delivery==='recipe'?'自己只带走配方副笺。':'收好寄存小笺。')+'尚未酿成，没有饮用或新增正式背包物品。')+(s.helps?'巴卫帮忙挡风或挑枝'+s.helps+'次。':'巴卫站在梅树旁等候。')};
 }
 return {kinds,recipes,total:rows.length,create,choose,start,row,target,move,guard,advance,tick,next,stopCollect,stock,supplement,add,seal,turn,wrap,finish};
})();
