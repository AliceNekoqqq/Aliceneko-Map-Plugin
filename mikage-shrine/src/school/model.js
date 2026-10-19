/* Local R02 state only. No host, model, relationship or MVU writes. */
const MikageSchoolModel=(()=>{
 const sections=['校门散页','樱坂起风','坡下相逢'];
 const rows=[
  {paper:1,id:'A1'}, {blocked:[0],kind:'feather'}, {paper:0,id:'A2'}, {blocked:[1,2],kind:'crowd'},
  {paper:2,id:'B1',drift:-1}, {blocked:[0,1],kind:'feather'}, {paper:0,id:'B2',drift:1}, {blocked:[2],kind:'crowd'},
  {blocked:[0,2],kind:'feather'}, {paper:1,id:'C1'}, {blocked:[1],kind:'crowd'}, {paper:2,id:'C2'}
 ];
 const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
 function create(){return {phase:'ready',mode:'walk',slow:false,paused:false,lane:1,index:0,progress:0,route:'sakura',notes:[],bumps:0,avoided:0,helps:0,guard:-1,order:[],hint:false,delivery:'',message:'先看看风向。纸页落在哪一侧，就往哪一侧走。',last:'',finished:false};}
 function encounter(s){const row=rows[s.index];if(!row)return null;const shift=s.route==='shade'?1:0,lane=x=>(x+shift)%3;return {...row,blocked:(row.blocked||[]).map(lane),paper:row.paper===undefined?null:lane(row.paper),driftTo:row.drift===undefined?null:lane(clamp(row.paper+row.drift,0,2))};}
 function target(s){const row=encounter(s);return row&&row.driftTo!==null&&s.progress>=.52?row.driftTo:row?.paper;}
 function start(s,mode){if(s.phase!=='ready')return false;s.mode=mode==='step'?'step':'walk';s.phase='walk';return true;}
 function move(s,delta){if(s.phase!=='walk'||s.paused||![-1,1].includes(delta))return false;const lane=clamp(s.lane+delta,0,2);if(lane===s.lane)return false;s.lane=lane;return true;}
 function guard(s){if(s.phase!=='walk'||s.paused||s.helps>=2||s.guard===s.index||!encounter(s)?.blocked.length)return false;s.guard=s.index;s.helps++;s.message=encounter(s).kind==='crowd'?'巴卫向过路的人示意，请他们留出一条空隙。':'巴卫抬起折扇，替这一段路挡住迎面的黑羽。';return true;}
 function advance(s,amount){
  if(s.phase!=='walk'||s.paused||!Number.isFinite(amount)||amount<=0)return false;
  s.progress=Math.min(1,s.progress+Math.min(amount,.3));if(s.progress<1-1e-9)return true;s.progress=1;
  const row=encounter(s),paper=target(s);s.last='';
  if(row.blocked.includes(s.lane)){
   if(s.guard===s.index){s.avoided++;s.last='guard';s.message='折扇一收，眼前的路便空出来了。“现在走。”';}
   else{s.bumps++;s.last='bump';s.message=row.kind==='crowd'?'你停了半步，等路过的人散开。巴卫站在外侧，没催你。':'黑羽擦过袖边，落进路旁。巴卫挑了挑眉：“下回先看风。”';}
  }else if(row.blocked.length){s.avoided++;s.last='clear';s.message='你们从空着的一侧走过，身后只留下一点脚步声。';}
  if(paper!==null){if(s.lane===paper){s.notes.push(row.id);s.last='paper';s.message='纸页在手里轻响了一声。巴卫用扇尖压住另一角，等你收好。';}else{s.last='miss';s.message='这一页顺着风飘到路边。没接住也没关系，先看前面的路。';}}
  s.index++;s.progress=0;s.guard=-1;
  if(s.index===4||s.index===8){s.phase='rest';s.message=s.index===4?'校门的铃声已经远了。樱坂上起了风，纸页会在半途换一侧。':'坡下有人正低头找东西。再往前走一小段，就能把散页交还。';}
  if(s.index===rows.length){s.phase='arrange';s.message='到坡下了。按页眉时刻把三张便签排好，再决定怎样交还。';}
  return true;
 }
 function tick(s,dt){if(s.mode==='step')return false;return advance(s,clamp(Number(dt)||0,0,.1)*(s.slow?.15:.26));}
 function continueRoute(s,route){if(s.phase!=='rest')return false;s.route=route==='shade'?'shade':'sakura';s.phase='walk';s.paused=false;s.message=s.route==='shade'?'你们靠着树荫走。巴卫抬眼看了看下一阵风。':'花瓣顺着坡道打着转，前面的石板路还空着。';return true;}
 function choosePage(s,id){if(s.phase!=='arrange'||!['A','B','C'].includes(id))return false;const i=s.order.indexOf(id);if(i>=0)s.order.splice(i,1);else if(s.order.length<3)s.order.push(id);return true;}
 function finish(s,delivery){
  if(s.phase!=='arrange'||s.finished)return null;
  if(s.order.join('')!=='ABC'){s.message='页眉写着16:10、16:20、16:30。再按先后排一次就好。';return null;}
  if(!['self','tomoe'].includes(delivery))return null;
  s.delivery=delivery;s.finished=true;s.phase='done';s.paused=false;s.message='纸页排好了。巴卫收起折扇，等你往前走。';
  return {region:'R02',title:'樱坂拾页记',stamp:'樱坂散页夹',notes:s.notes.length,bumps:s.bumps,helps:s.helps,route:s.route,mode:s.mode,
   rank:s.notes.length>=5&&s.bumps<=1?'风里的默契':s.notes.length>=3?'收好这一段路':'慢慢走也很好',
   detail:'在宇庭高校外的樱坂走过三段路，拾回'+s.notes.length+'张散页，停步避让'+s.bumps+'次'+(s.helps?'，请巴卫挡风或让路'+s.helps+'次':'')+'。把失主出示的三张便签按页眉时刻排好后，'+(s.notes.length?(delivery==='tomoe'?'请巴卫将已拾回的纸页递还给坡下寻找它们的人。':'将已拾回的纸页交还给坡下寻找它们的人。'):'向坡下寻找纸页的人说明了沿途见到的飘落位置。')+'没有拾到的纸页未记为已收回。'};
 }
 return {create,encounter,target,start,move,guard,advance,tick,continueRoute,choosePage,finish,sections,total:rows.length};
})();
