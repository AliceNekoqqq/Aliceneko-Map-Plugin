/* R08: a temporary Tomoe scene. No animal-care, affinity or resource state is written. */
const MikageFoxModel=(()=>{
 const moods={wary:{name:'耳尖绷紧，往檐影里缩',cue:'耳朵仍朝着雷声，尾巴贴在身侧。他需要一块安静的地方。',ending:'rest'},curious:{name:'躲在柱后，悄悄看你',cue:'鼻尖探出一点，又缩回去。他在看你会不会追过来。',ending:'near'},restless:{name:'总往台阶那边看',cue:'耳朵转向廊外，前爪朝着台阶。他想保留离开的路。',ending:'leave'}};
 const nets=[[0,2,1],[1,0,2],[2,1,0]],clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 function create(){return {phase:'ready',mood:'wary',wave:0,cursor:0,misses:0,mat:{x:30,y:72},shade:'none',routeOpen:true,sheltered:false,distance:'far',calm:0,waits:0,observations:0,food:false,spoken:false,resolved:false,ending:'early',paused:false,finished:false,message:'雷声还没散。银白的小狐伏在柱边，尾巴扫过石地。那双眼睛抬起来，巴卫的声音却仍旧很冷：“别盯着我看。”'};}
 const active=(s,phase)=>s.phase===phase&&!s.paused;
 function choose(s,mood){if(s.phase!=='ready'||!Object.hasOwn(moods,mood))return false;s.mood=mood;return true;}
 function start(s){if(s.phase!=='ready')return false;s.phase='net';s.message='雷网挂住了退路。沿线头标出的次序解开三处结，先别碰到柱边的小狐。';return true;}
 function trace(s,index){if(!active(s,'net')||!Number.isInteger(index)||index<0||index>2)return false;if(nets[s.wave][s.cursor]!==index){s.cursor=0;s.misses++;s.message='线头滑回去了。从标着一的结重新来，这一张网还可以慢慢解。';return true;}s.cursor++;s.message='这处线结松了，接着沿亮点往下解。';if(s.cursor===3){s.wave++;s.cursor=0;s.message='一张雷网散开了，剩下的线仍挂在廊柱间。';if(s.wave===nets.length){s.phase='shelter';s.message='退路清出来了。先在檐下找一块干处，再把挡风物摆到外侧。';}}return true;}
 function retrace(s){if(!active(s,'net'))return false;s.cursor=0;s.message='只把这一张网的线头重摆，已经解开的网不再挂回去。';return true;}
 function place(s,x,y){if(!active(s,'shelter')||!Number.isFinite(x)||!Number.isFinite(y))return false;s.mat={x:clamp(x,8,92),y:clamp(y,8,92)};return true;}
 function shade(s,id){if(!active(s,'shelter')||!['none','bamboo','cloth'].includes(id))return false;s.shade=id;return true;}
 function route(s,open){if(!active(s,'shelter')||typeof open!=='boolean')return false;s.routeOpen=open;return true;}
 function ready(s){return s.mat.x>=55&&s.mat.x<=78&&s.mat.y>=40&&s.mat.y<=65&&s.shade!=='none'&&s.routeOpen;}
 function settle(s){if(!active(s,'shelter'))return false;if(!ready(s)){s.message=!s.routeOpen?'先把通向台阶的路让出来。他要走时，不用经过你身边。':s.shade==='none'?'垫子旁还透着风。先在外侧放好竹屏或挡风布。':'这处不是檐下干地。把垫子挪进右侧亮着的干地，再看一眼。';return false;}s.sheltered=true;s.phase='company';s.message=moods[s.mood].cue;return true;}
 function observe(s){if(!active(s,'company'))return false;s.observations++;s.message=moods[s.mood].cue+(s.calm?'你停在远处，没有伸手。':'先看他的动作，再决定自己站在哪。');return true;}
 function space(s,id){if(!active(s,'company')||!['far','near'].includes(id))return false;s.distance=id;s.calm=0;s.message=id==='near'?'他往柱后退了半步，耳朵转开：“就站那儿。”你随时可以退远些。':'你退到檐边，把中间的空地让出来。他抬了抬眼，没再往后退。';return true;}
 function offer(s,value){if(!active(s,'company')||typeof value!=='boolean')return false;s.food=value;s.message=value?'笹饼放在远处的小碟里。你没有往他嘴边递，也没催他吃。':'你把小碟收回身边，仍给他留着那块空地。';return true;}
 function speak(s){if(!active(s,'company'))return false;s.spoken=true;s.message='你说：“我就在檐边。要走就走，我不拦你。”小狐朝你看了一眼，尾尖缓缓落回地面。';return true;}
 function wait(s){if(!active(s,'company'))return false;s.waits++;if(s.distance==='near'){s.calm=0;s.message='他仍盯着你与台阶之间的空隙。先退远一点，比继续等更有用。';return true;}s.calm++;if(s.calm<2){s.message='你没有再挪近。小狐抬起头，耳朵朝你转了转；再留一点空隙。';return true;}s.resolved=true;s.ending=moods[s.mood].ending;s.phase='closing';s.message={rest:'小狐把尾巴拢到鼻尖，在避风处蜷下来。你仍坐在檐边，没有把他抱起来。',near:'他自己从柱后走出来，在离你一步的地方停下。你收着手，等他决定下一步。',leave:'小狐沿着留出的路走向廊内，回头看了你一眼。你没有跟上去堵住他。'}[s.ending];return true;}
 function pause(s,value){if(!['net','shelter','company'].includes(s.phase))return false;s.paused=Boolean(value);return true;}
 function stop(s){if(!['net','shelter','company'].includes(s.phase))return false;s.phase='closing';s.paused=false;s.ending='early';s.message='先把手边的东西收稳，给柱边留出空隙。这一程做到哪里，就写到哪里。';return true;}
 function finish(s,delivery){if(s.phase!=='closing'||s.finished||!['self','tracks'].includes(delivery))return null;s.finished=true;s.phase='done';const complete=s.resolved&&s.wave===3&&s.sheltered;return {region:'R08',title:'檐下守护幼狐',stamp:'檐下守护笺',complete,cleared:s.wave,total:3,sheltered:s.sheltered,ending:s.ending,mood:s.mood,waits:s.waits,misses:s.misses,foodPlaced:s.food,delivery,rank:complete?'把选择留给他':'先守到这里',detail:'在鸣神殿解开'+s.wave+' / 3张雷网'+(s.sheltered?'，檐下干地与挡风物已布好，台阶退路留着。':'，避风处尚未布好。')+{rest:'巴卫自己蜷在避风处休息。',near:'巴卫自己走近，在一步外停下。',leave:'巴卫沿留出的路自行回廊。',early:'提前收步，尚未等到他的回应。'}[s.ending]+(s.food?'笹饼只放在远处，未记录进食。':'没有投喂。')+(delivery==='tracks'?'照着石地上的爪迹留了一笔。':'自己摹下檐边的尾影。')+'没有触碰耳朵或强抱；只是本地纪念，不代表妖力恢复，不改主线、资源或好感。'};}
 function pose(s){return s.ending==='rest'?2:s.ending==='leave'?3:s.ending==='near'?1:0;}
 return {moods,nets,create,choose,start,trace,retrace,place,shade,route,ready,settle,observe,space,offer,speak,wait,pause,stop,finish,pose};
})();
