/* R05 local dress rehearsal. No inventory, romance, quest or MVU writes. */
const MikageDressModel=(()=>{
 const outfits={jade:{name:'水纹青衣',note:'浅青水纹，配月白腰带。'},rose:{name:'绯梅小袖',note:'淡绯梅枝，配深红腰带。'},ivory:{name:'月白莲衣',note:'月白莲纹，配浅紫腰带。'}};
 const pins={leaf:'点翠叶簪',flower:'绯梅花簪',pearl:'月白珠簪',none:'不戴发簪'};
 const plans={water:{name:'浮桥边走走',outfit:'jade',pin:'leaf',strength:50,line:'“想在水边走一会儿。衣袖别太碍事，青色看着也清爽。”'},flowers:{name:'沿花径散步',outfit:'rose',pin:'flower',strength:60,line:'“花径那头有一树梅花。想挑件暖色的，簪子也别太沉。”'},moon:{name:'廊下等灯亮',outfit:'ivory',pin:'pearl',strength:40,line:'“就在廊下坐坐。衣色浅些，灯亮了应当好看。”'}};
 const targets=[40,130,250],initial=[310,20,160],delta=(a,b)=>Math.abs(((a-b+540)%360)-180);
 function create(){return {phase:'ready',plan:'water',outfit:'jade',pin:'none',pinX:61,pinY:11,angles:initial.slice(),locked:[false,false,false],strength:0,consent:false,stable:false,helps:0,opinions:0,finished:false,message:'沼皇女把衣料放在镜前：“帮吾看看，哪一套合适？”',ending:''};}
 function plan(s,id){if(s.phase!=='ready'||!Object.hasOwn(plans,id))return false;s.plan=id;s.message=plans[id].line;return true;}
 function start(s){if(s.phase!=='ready')return false;s.phase='dress';s.message=plans[s.plan].line;return true;}
 function wear(s,id){if(s.phase!=='dress'||!Object.hasOwn(outfits,id))return false;s.outfit=id;s.message='你把'+outfits[id].name+'摆到镜前。沼皇女转过袖角，仔细看了一会儿。';return true;}
 function pin(s,id){if(s.phase!=='dress'||!Object.hasOwn(pins,id))return false;s.pin=id;s.message=id==='none'?'沼皇女卸下发簪，抚平发丝：“这样也轻快。”':'簪子放上去了。可左右或上下挪一点，再看镜中的位置。';return true;}
 function place(s,x,y){if(s.phase!=='dress'||s.pin==='none'||!Number.isFinite(x)||!Number.isFinite(y))return false;s.pinX=Math.max(36,Math.min(66,x));s.pinY=Math.max(6,Math.min(14,y));return true;}
 function opinion(s){if(s.phase!=='dress')return false;s.opinions++;const p=plans[s.plan];s.message=s.outfit===p.outfit?'沼皇女摸了摸袖边：“正是吾方才想的颜色。”巴卫瞥了眼簪盒：“轻些就好，别把整盒都戴上。”':'沼皇女把袖角展开：“这套也有这套的好。”巴卫将镜子扶正：“她喜欢就穿。你们还要挑多久？”';return true;}
 function confirm(s){if(s.phase!=='dress')return false;s.consent=true;s.phase='leaf';s.message='沼皇女点头：“就用这一套。化形的事，也劳烦了。”巴卫取出三枚绿叶，放在阵纹边上。';return true;}
 function turn(s,index,angle){if(s.phase!=='leaf'||!Number.isInteger(index)||index<0||index>2||s.locked[index]||!Number.isFinite(angle))return false;s.angles[index]=((angle%360)+360)%360;return true;}
 function lock(s,index){if(s.phase!=='leaf'||!Number.isInteger(index)||index<0||index>2)return false;if(s.locked[index]){s.locked[index]=false;s.message='这一片已取下，可以重新转向。';return true;}if(delta(s.angles[index],targets[index])>12){s.message='叶尖与浅色缺口还没对齐。再转一点，前后十二度内都能落稳。';return false;}s.locked[index]=true;s.message='第'+(index+1)+'枚绿叶落在阵纹上。巴卫收住指尖的狐火，等你摆下一片。';return true;}
 function power(s,value){if(s.phase!=='leaf'||!Number.isFinite(value))return false;s.strength=Math.max(0,Math.min(100,value));return true;}
 function help(s){if(s.phase!=='leaf')return false;const i=s.locked.findIndex(v=>!v);if(i<0){s.message='“三片都稳了。看中间那道窄线，灵力停在那里。”';return false;}s.angles[i]=targets[i];s.locked[i]=true;s.helps++;s.message='巴卫用扇尖示意第'+(i+1)+'枚叶子的方向：“顺着缺口，别压住叶柄。”';return true;}
 function stabilize(s){if(s.phase!=='leaf'||!s.consent)return false;if(!s.locked.every(Boolean)){s.message='先把三枚绿叶都放稳。';return false;}if(Math.abs(s.strength-plans[s.plan].strength)>10){s.message='灵力还没落在安稳的那一段。按刻度轻轻收放，不用越多越好。';return false;}s.stable=true;s.phase='review';s.message='绿叶沿阵纹舒展开。沼皇女看过镜子，自己整了整衣袖：“嗯，吾准备好了。”';return true;}
 function revise(s){if(!['leaf','review'].includes(s.phase))return false;s.phase='dress';s.consent=false;s.stable=false;s.angles=initial.slice();s.locked=[false,false,false];s.strength=0;s.message='先收起绿叶，回镜前改一改。试搭确认后，再重新稳住化形。';return true;}
 function finish(s,ending,cancel=false){if(s.finished||!['bridge','list'].includes(ending)||(!cancel&&(s.phase!=='review'||!s.stable))||(cancel&&!['dress','leaf','review'].includes(s.phase)))return null;const prepared=!cancel&&s.stable;s.finished=true;s.phase='done';s.ending=ending;
  return {region:'R05',title:'沼皇女梳妆赴约',stamp:'浮桥梳妆笺',rank:prepared?'镜前收好，往浮桥去':'今日先留一张搭配笺',prepared,plan:s.plan,outfit:s.outfit,pin:s.pin,pinX:s.pinX,pinY:s.pinY,helps:s.helps,ending,
   detail:'在多满沼陪沼皇女准备「'+plans[s.plan].name+'」，试搭'+outfits[s.outfit].name+'，'+(s.pin==='none'?'不戴发簪':pins[s.pin]+'放在镜中横向'+Math.round(s.pinX)+'%、纵向'+Math.round(s.pinY)+'%处')+'。'+(prepared?'她确认试搭后，三枚绿叶对齐，灵力停在'+s.strength+'，化形准备稳定。'+(ending==='bridge'?'应她的意思送至浮桥入口，之后的赴约由她自己决定。':'替她写下准备清单，留在廊下等候。'):'这次只记录试搭，没有记作化形完成或出门。')+(s.helps?'请巴卫示范了'+s.helps+'枚叶子。':'')+'没有记入约会结果，也没有改动玩家衣柜或正式资源。'};
 }
 return {outfits,pins,plans,targets,create,plan,start,wear,pin,place,opinion,confirm,turn,lock,power,help,stabilize,revise,finish};
})();
