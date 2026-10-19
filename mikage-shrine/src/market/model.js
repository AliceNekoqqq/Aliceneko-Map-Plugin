/* Fictional R03 appraisal puzzles. All state is local; never writes host resources. */
const MikageMarketModel=(()=>{
 const verdicts={genuine:'旧物可信',fake:'障眼仿品',uncertain:'暂不定论'};
 const lots=[
  {id:'bell',name:'绯结铜铃',seller:'“神前供过三百年，系上就能避灾。”',truth:'fake',decisive:'light',
   clues:[{id:'front',label:'看铃身',text:'绿锈分布得很匀，连绳结底下也是同一种颜色。'}, {id:'base',label:'看铃底',text:'铃底有一圈合模缝；暗处摸不清的纹路，放到灯下便露出来了。'}, {id:'ledger',label:'问来历',text:'摊主拿出一张崭新纸签，只写着“三百年”，没有旧主或修补记录。'}, {id:'light',label:'借狐火照看',text:'青蓝光掠过，绿锈化成薄薄一层蜡。所谓神纹只是画在蜡面的金粉。'}],
   hint:'“别被那根红绳带走眼睛。铃身和铃底，放到同一盏灯下看。”',explain:'蜡与金粉受光后显出覆盖层，和摊主声称的神纹不符；这只铃应按障眼仿品记录。'},
  {id:'mirror',name:'月纹手镜',seller:'“旧镜一面，镜柄修过。缺口没补，我没瞒你。”',truth:'genuine',decisive:'ledger',
   clues:[{id:'front',label:'看镜面',text:'镜面有细划痕，边缘月纹缺了一角；磨损并不沿着花纹整齐排列。'}, {id:'base',label:'翻看镜背',text:'镜柄有一道旧修补，侧面刻着半轮月和三点小记号。'}, {id:'ledger',label:'对照旧账',text:'摊主翻出旧账：“月纹缺右角，柄修一次，半月三点。”三处特征与实物逐一对得上。'}, {id:'light',label:'借狐火照看',text:'光落下又散开，镜缘的缺口仍在；没有出现遮盖旧修补的幻影。'}],
   hint:'“不冒妖气，未必就真。对照那本账，看看它写的是不是眼前这一面。”',explain:'旧账与缺角、修柄、记号相互对应，支持摊主关于旧镜的说法；这里只判旧物可信，不认定它有神力。'},
  {id:'fan',name:'枫影折扇',seller:'“某位山神留下的。寄卖的人没留姓名。”',truth:'uncertain',decisive:'ledger',
   clues:[{id:'front',label:'看扇面',text:'纸边已经磨软，枫叶颜料却比折痕鲜亮，可能后来描补过。'}, {id:'base',label:'看扇骨',text:'竹骨有旧磨痕，末端换过两根；单看材料，分不出是哪位旧主。'}, {id:'ledger',label:'查寄卖签',text:'寄卖签只记了入摊日期，没有旧主姓名、来源或可核对的特征。山神旧藏的说法没有凭据。'}, {id:'light',label:'借狐火照看',text:'纸里有一道很淡的妖气，既可能是旧主留下，也可能只是经过妖怪之手。'}],
   hint:'“有妖气就算山神的东西？那这条街上，岂不是遍地神具。”',explain:'旧材料与淡妖气都不能证明山神旧藏；来源空缺，先记待考比硬猜真伪更合适。'}
 ];
 const find=id=>lots.find(l=>l.id===id);
 function create(seed=0){const n=((Number(seed)||0)%3+3)%3;return {phase:'ready',order:lots.map((_,i)=>lots[(i+n)%3].id),index:0,seen:[],evidence:[],view:'front',light:false,results:[],attempts:0,assists:0,hinted:false,message:'先看东西，再听摊主的话。',keepsake:'',wine:'',finished:false};}
 const current=s=>find(s.order[s.index]);
 function start(s,veil){if(s.phase!=='ready'||!['mask','follow'].includes(veil))return false;s.veil=veil;s.phase='inspect';s.message=veil==='mask'?'面具挡住了街口的风。巴卫把第一件摊货推到灯下。':'你们沿着摊位外侧走，巴卫收住狐火，停在第一盏灯前。';return true;}
 function inspect(s,id){if(s.phase!=='inspect'||!current(s).clues.some(c=>c.id===id))return false;if(!s.seen.includes(id))s.seen.push(id);s.view=id;s.light=id==='light';s.message=current(s).clues.find(c=>c.id===id).text;return true;}
 function select(s,id){if(s.phase!=='inspect'||!s.seen.includes(id))return false;const i=s.evidence.indexOf(id);if(i<0)s.evidence.push(id);else s.evidence.splice(i,1);return true;}
 function hint(s){if(s.phase!=='inspect')return false;if(!s.hinted){s.hinted=true;s.assists++;}s.message=current(s).hint;return true;}
 function judge(s,verdict){
  if(s.phase!=='inspect'||!Object.hasOwn(verdicts,verdict))return false;
  if(s.seen.length<2||s.evidence.length<2){s.message='先查看至少两处，再从已见线索里勾选两条依据。';return false;}
  const lot=current(s),correct=verdict===lot.truth,grounded=s.evidence.includes(lot.decisive);
  if(!correct||!grounded){s.attempts++;s.message=!grounded?'这两条还不足以支持结论。'+(lot.id==='bell'?'借狐火照看那层绿锈。':'再查一查来历，把能核对或缺失的记录也算进去。'):'这个结论与证据有冲突。'+lot.explain;return false;}
  s.results.push({id:lot.id,name:lot.name,verdict,evidence:s.evidence.slice(),status:'confirmed'});s.phase='reveal';s.message=lot.explain;return true;
 }
 function defer(s){if(s.phase!=='inspect')return false;s.results.push({id:current(s).id,name:current(s).name,verdict:'uncertain',evidence:s.evidence.slice(),status:'deferred'});s.phase='reveal';s.message='先不替摊主的说法担保。这一件记为待考，可以下次再看。';return true;}
 function next(s){if(s.phase!=='reveal')return false;s.index++;s.seen=[];s.evidence=[];s.view='front';s.light=false;s.hinted=false;s.message='新摊货已经放稳。先翻看，再作判断。';s.phase=s.index>=3?'receipt':'inspect';return true;}
 function finish(s,keepsake,wine){if(s.phase!=='receipt'||s.finished||!['bell','mirror','fan','none'].includes(keepsake)||!['label','leave'].includes(wine))return null;s.finished=true;s.phase='done';s.keepsake=keepsake;s.wine=wine;
  const confirmed=s.results.filter(r=>r.status==='confirmed').length;
  return {region:'R03',title:'妖怪横丁暗市鉴宝',stamp:'暗市鉴物笺',confirmed,results:s.results.map(r=>({...r,evidence:r.evidence.slice()})),assists:s.assists,attempts:s.attempts,keepsake,wine,
   rank:confirmed===3?'灯下看清了三件事':confirmed?'看准的记下，存疑的留着':'今夜先留一页待考',
   detail:'在妖怪横丁查看三件摊货：'+s.results.map(r=>r.name+'（'+(r.status==='deferred'?'未定，留待复查':verdicts[r.verdict])+'）').join('、')+'。'+(keepsake==='none'?'只收下鉴物记录。':'在纸上临摹了'+find(keepsake).name+'的纹样，没有带走摊货。')+(wine==='label'?'在笹平老酒铺留了一张酒签拓记，没有饮酒或购酒。':'从暗市直接返程。')+(s.assists?'请巴卫指点了'+s.assists+'件。':'独自判断，巴卫在一旁等候。')};
 }
 return {lots,verdicts,create,current,start,inspect,select,hint,judge,defer,next,finish};
})();
