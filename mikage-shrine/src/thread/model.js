/* Local paper ritual; geometry and records never change formal story variables. */
const MikageThreadModel=(()=>{
 const wishes={reunion:'愿久别的人能再见',journey:'愿远行的人平安',friendship:'愿同行的人互相照应'};
 const plans=[[0,2,1,3],[0,2,4,1,3],[0,3,1,4,2,5]];
 const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
 function targets(n){return Array.from({length:n},(_,i)=>{const a=-Math.PI/2+i*Math.PI*2/n;return {x:50+35*Math.cos(a),y:50+35*Math.sin(a)};});}
 function board(round){const t=targets(plans[round].length);return plans[round].map(i=>({...t[i]}));}
 function create(){return {phase:'ready',wish:'reunion',round:0,nodes:board(0),selected:0,cleared:0,moves:0,assisted:0,weave:0,tied:false,tension:50,reply:'quiet',paused:false,finished:false,message:'红线在纸台上缠成一团。巴卫拢起袖口：“先找线头，别硬扯。”'};}
 const active=(s,p)=>s.phase===p&&!s.paused;
 function choose(s,id){if(s.phase!=='ready'||!Object.hasOwn(wishes,id))return false;s.wish=id;return true;}
 function start(s){if(s.phase!=='ready')return false;s.phase='untangle';s.message='移动带数字的线结，让线段互不交叉。线结也要彼此留些距离。';return true;}
 const cross=(a,b,c)=>(b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x);
 const on=(a,b,c)=>Math.abs(cross(a,b,c))<1e-6&&c.x>=Math.min(a.x,b.x)-1e-6&&c.x<=Math.max(a.x,b.x)+1e-6&&c.y>=Math.min(a.y,b.y)-1e-6&&c.y<=Math.max(a.y,b.y)+1e-6;
 function intersects(a,b,c,d){const x=cross(a,b,c),y=cross(a,b,d),z=cross(c,d,a),w=cross(c,d,b);return (x*y<0&&z*w<0)||on(a,b,c)||on(a,b,d)||on(c,d,a)||on(c,d,b);}
 function issues(s){const points=s.nodes,n=points.length,edges=points.map((_,i)=>[i,(i+1)%n]),bad=new Set();let crossings=0,crowded=0,flat=0;
  for(let i=0;i<n;i++){const a=points[(i+n-1)%n],b=points[i],c=points[(i+1)%n];if(Math.abs(cross(a,b,c))<6)flat++;for(let j=i+1;j<n;j++)if(Math.hypot(points[i].x-points[j].x,points[i].y-points[j].y)<14)crowded++;}
  for(let i=0;i<n;i++)for(let j=i+1;j<n;j++){const [a,b]=edges[i],[c,d]=edges[j];if(a===c||a===d||b===c||b===d)continue;if(intersects(points[a],points[b],points[c],points[d])){crossings++;bad.add(i);bad.add(j);}}
  return {crossings,crowded,flat,bad:[...bad],clear:crossings===0&&crowded===0&&flat===0};
 }
 function select(s,i){if(!active(s,'untangle')||!Number.isInteger(i)||i<0||i>=s.nodes.length)return false;s.selected=i;return true;}
 function move(s,i,x,y){if(!active(s,'untangle')||!Number.isInteger(i)||!s.nodes[i]||!Number.isFinite(x)||!Number.isFinite(y))return false;s.nodes[i]={x:clamp(x,10,90),y:clamp(y,12,88)};s.selected=i;s.moves++;return true;}
 function reset(s){if(!active(s,'untangle'))return false;s.nodes=board(s.round);s.selected=0;s.message='只重摆这一组，前面理好的红线还留着。';return true;}
 function assist(s){if(!active(s,'untangle'))return false;const t=targets(s.nodes.length),i=s.nodes.findIndex((p,i)=>Math.hypot(p.x-t[i].x,p.y-t[i].y)>.1);if(i<0)return false;move(s,i,t[i].x,t[i].y);s.assisted++;s.message='巴卫替你扶住一端：“这里先松开。剩下的，你看着来。”';return true;}
 function next(s){if(!active(s,'untangle'))return false;const q=issues(s);if(!q.clear){s.message=q.crossings?'红线还有'+q.crossings+'处交叉，先把带标记的线分开。':q.crowded?'线结挤得太近了，再留一点空隙。':'线绳折叠在一起了，把相邻线结稍稍展开。';return false;}s.cleared++;if(s.cleared===3){s.phase='weave';s.message='线理顺了。照纸样穿过上层、下层，再回到上层。';}else{s.round++;s.nodes=board(s.round);s.selected=0;s.message='这一组已经理好。换下一束红线，不必赶。';}return true;}
 function pass(s,layer){if(!active(s,'weave')||!['over','under'].includes(layer)||s.weave>=3)return false;if(layer!==['over','under','over'][s.weave]){s.message='这一穿绕反了。退回这一穿，前面的不用拆。';return false;}s.weave++;s.message=s.weave===3?'两边都穿好了。慢慢收紧，留住绳结的形状。':'线从这一层穿过了，接着看下一穿。';return true;}
 function tension(s,v){if(!active(s,'weave')||!Number.isFinite(v))return false;s.tension=clamp(v,0,100);return true;}
 function tie(s){if(!active(s,'weave')||s.weave!==3)return false;if(s.tension<35||s.tension>65){s.message=s.tension<35?'线圈还散着，稍微收紧一点。':'勒得太紧了，松开一点，让线圈留出弧度。';return false;}s.tied=true;s.phase='closing';s.message='巴卫捏住绳结两侧，看你把最后一圈收好。“嗯，这回不会散了。”';return true;}
 function reply(s,id){if(!active(s,'closing')||!['quiet','ask','tease'].includes(id))return false;s.reply=id;s.message={quiet:'你把绳结托在掌心。他看了一会儿，替你拨开垂下来的线尾。',ask:'你问他想把这枚结放在哪里。巴卫看向你：“你收着。我又不是找不到你。”',tease:'你问他刚才是不是一直在看。他把折扇一合：“不看着，等你把自己也系进去？”'}[id];return true;}
 function pause(s,v){if(!['untangle','weave','closing'].includes(s.phase))return false;s.paused=!!v;return true;}
 function stop(s){if(!['untangle','weave'].includes(s.phase))return false;s.phase='closing';s.paused=false;s.message='先把散线卷好。这次理到哪里，就记到哪里。';return true;}
 function finish(s,delivery){if(!active(s,'closing')||s.finished||!['keep','box'].includes(delivery))return null;s.finished=true;s.phase='done';const complete=s.tied;return {region:'R09',title:'出云红线结缘',complete,cleared:s.cleared,weave:s.weave,wish:s.wish,assisted:s.assisted,reply:s.reply,delivery,rank:complete?'线结落在掌心':'把散线收好',detail:wishes[s.wish]+'。理顺'+s.cleared+' / 3组红线，穿绳'+s.weave+' / 3次。'+(complete?'收好一枚红线结。':'本次尚未收成线结。')+(delivery==='keep'?'将这一页留在自己手边。':'将这一页放入祈愿匣旁。')+(s.assisted?'巴卫帮忙扶过线。':'自己慢慢理线。')};}
 return {wishes,plans,targets,create,choose,start,issues,select,move,reset,assist,next,pass,tension,tie,reply,pause,stop,finish,intersects};
})();
