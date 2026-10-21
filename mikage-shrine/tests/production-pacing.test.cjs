process.env.MIKAGE_ECONOMY_RELEASE ||= '1.49.6';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {C,initial,state,clone}=require('./economy.test.cjs');
const root=path.resolve(__dirname,'..'),dir=root+'/releases/'+process.env.MIKAGE_ECONOMY_RELEASE;
function step(s,type,patch=()=>{},extra={}){const n=clone(s);patch(n);n.记录.事件.push({编号:'E'+(s.记录.事件.length+1),类型:type,摘要:'实际发生并经当事人核实',对象:s.委托.编号,来源:'正文',方式:'',资源:'无',数量:0,耗力:0,天数:0,...extra});return C.validate(n,s);}
const advanceDay=(s,days=1)=>step(s,'日常',n=>n.环境.天数+=days);
const travel=(s,regionId)=>step(C.action(s,'travel',{regionId}),'抵达',()=>{},{对象:regionId});
function finish(s,present){
 for(const [phase,type]of [['查访','查访'],['商议','商议'],['行动','行动'],['收束','结案']]){
  const n=clone(s);n.委托.阶段=phase;if(type==='结案'){n.委托.结果='实际回应已核实，双方确认处理结束';n.委托.结算档位='完整';}
  n.记录.事件.push({编号:'E'+(s.记录.事件.length+1),类型:type,摘要:'当事人实际回应',对象:s.委托.编号,来源:'正文',方式:'',资源:'无',数量:0,耗力:0,天数:0});
  if(type==='结案'&&present)n.记录.事件.push({编号:'E'+(s.记录.事件.length+2),类型:'解锁呈现',摘要:'说明本章开放地区及后续可选往来',对象:present,来源:'正文',方式:'',资源:'无',数量:0,耗力:0,天数:0});
  s=C.validate(n,s);
 }return s;
}
function acceptOrdinary(s){
 let row=s.绘马板.绘马.find(x=>x.性质==='普通'&&x.状态==='未接');
 if(!row){s=C.action(s,'refreshBoard',{generated:{绘马:[{标题:'山下来访',祈愿人:'街坊',来客类型:'人类',类型:C.config.stages[s.进度.阶段-1].types[0],地区:'R01',心愿:'核实并处理当面表达的托付',补充说明:'回归夹具',幕后:Object.fromEntries(Object.keys(initial.委托.幕后).map(k=>[k,'现场可查的事实']))}]}});row=s.绘马板.绘马.find(x=>x.性质==='普通'&&x.状态==='未接');}
 return C.action(s,'acceptEma',{id:row.编号});
}
let quest=clone(initial);
for(let i=0;i<2;i++){
 quest=acceptOrdinary(quest);const id=quest.委托.编号,before=clone(quest),count=quest.记录.事件.length;quest=finish(quest);
 assert.equal(quest.记录.事件.length-count,4);assert.deepEqual(clone(quest.委托),clone(initial.委托));
 const archive=quest.记录.完成委托.find(x=>x.编号===id);assert.equal(archive.快照.阶段,'收束');assert.equal(archive.快照.结果,'实际回应已核实，双方确认处理结束');
 assert.equal(quest.神社.奉纳,before.神社.奉纳+1);assert.equal(quest.环境.天数,before.环境.天数);assert.equal(quest.记录.暂停委托.length,before.记录.暂停委托.length);
 assert.throws(()=>step(quest,'结案'),/当前委托/);assert.equal(quest.记录.完成委托.filter(x=>x.编号===id).length,1);
}
quest=step(quest,'规划',n=>n.神社.建设计划={设施:'鸟居',说明:'实际确认的修葺方案',已确认:true},{对象:'鸟居'});
for(const [value,type]of [[2,'开工'],[3,'施工'],[4,'施工']])quest=step(quest,type,n=>n.神社.鸟居=value,{对象:'鸟居'});
quest=step(quest,'主线显现',()=>{},{对象:'M01'});quest=C.action(quest,'acceptEma',{id:'M01'});quest=finish(quest,'U02');
assert.equal(quest.进度.阶段,2);assert.deepEqual(clone(quest.委托),clone(initial.委托));assert(quest.衣橱.已呈现.includes('U02'));assert(!quest.衣橱.待呈现.includes('U02'));assert(!quest.衣橱.已解锁.some(x=>x.编号==='player:sakura'));
quest=acceptOrdinary(quest);const pausedId=quest.委托.编号;quest=C.action(quest,'pauseEma',{id:pausedId});
quest=step(quest,'受理',n=>n.委托={...clone(initial.委托),编号:'FREE-CLOSE',祈愿人:'来访者',诉求:'当面商量一件小事',阶段:'受理'});
const cash=quest.神社.奉纳,ordinary=quest.进度.累计完成数;quest=finish(quest);assert.equal(quest.神社.奉纳,cash);assert.equal(quest.进度.累计完成数,ordinary);assert.equal(quest.记录.暂停委托.length,1);quest=C.action(quest,'resumeEma',{id:pausedId});assert.equal(quest.委托.编号,pausedId);
assert.throws(()=>step(quest,'结案',n=>{n.委托.阶段='收束';n.委托.结果='跳过了调查';n.委托.结算档位='完整';}),/当前委托/);
console.log('PASS quest: four advances, same-round archive/reward/release/presentation, no autoaccept/day jump, replay/skip guards, free closure and paused quest restoration');

const nets={};
for(const crop of C.life.config.crops){
 let farm=state(2,10);for(const item of [crop.seed,...Object.keys(crop.yield)])farm.生活.库存[item]=0;
 farm=C.action(farm,'life',{kind:'buy',item:crop.seed,quantity:1});farm=travel(farm,'R01');
 for(const plot of ['plot_1','plot_2'])farm=C.action(farm,'life',{kind:'plant',plot,crop:crop.id});
 const planted=JSON.stringify(farm);assert.throws(()=>C.action(farm,'life',{kind:'harvest',plots:['plot_1','plot_2']}),/成熟/);assert.equal(JSON.stringify(farm),planted);
 farm=advanceDay(farm,crop.days);const before=clone(farm),events=farm.记录.事件.length;farm=C.action(farm,'life',{kind:'harvest',plots:['plot_1','plot_2']});
 assert.equal(farm.记录.事件.length,events+1);assert.equal(farm.环境.天数,before.环境.天数);assert(farm.生活.菜圃.every(x=>!x.crop));
 farm=travel(farm,'R03');const product=C.life.config.buyback.products.find(x=>x.item===crop.id),count=farm.生活.库存[crop.id];farm=C.action(farm,'life',{kind:'sell',item:crop.id,quantity:count/product.units});
 nets[crop.id]=farm.神社.奉纳-10;assert.equal(nets[crop.id],crop.id==='tomato'?3:2);assert.equal(farm.记录.资源流水.reduce((n,x)=>n+x.变动,0),nets[crop.id]);assert.equal(farm.生活.库存[crop.id],0);
 const saved=JSON.stringify(farm),used=C.life.view(farm).buyback.used;for(let i=0;i<5;i++)C.life.view(farm);assert.equal(JSON.stringify(farm),saved);farm=advanceDay(farm);assert.equal(C.life.view(farm).buyback.remaining,5);assert.equal(farm.神社.奉纳,10+nets[crop.id]);assert(used<=5);
}
let craft=state(2,10);craft.生活.库存.wood_scrap=craft.生活.库存.cloth=0;
for(const item of ['wood_scrap','cloth'])craft=C.action(craft,'life',{kind:'buy',item,quantity:1});craft=travel(craft,'R01');
const preCraft=clone(craft);craft=C.action(craft,'life',{kind:'craft',recipe:'wood_charm',quantity:3});assert.equal(craft.生活.库存.wood_charm,3);assert.equal(craft.记录.事件.length,preCraft.记录.事件.length+1);assert.equal(craft.记录.资源流水.length,2);
craft=travel(craft,'R03');craft=C.action(craft,'life',{kind:'sell',item:'wood_charm',quantity:1});nets.wood_charm=craft.神社.奉纳-10;assert.equal(nets.wood_charm,2);assert.equal(C.life.view(craft).buyback.remaining,0);
craft.生活.库存.herb=2;const capped=JSON.stringify(craft);assert.throws(()=>C.action(craft,'life',{kind:'sell',item:'herb',quantity:1}),/额度/);assert.equal(JSON.stringify(craft),capped);
let home=state();home.地图.当前地区='R01';home.生活.库存.wood_scrap=home.生活.库存.cloth=30;
for(const quantity of [0,-1,1.5,21,null,'2']){const before=JSON.stringify(home);assert.throws(()=>C.action(home,'life',{kind:'craft',recipe:'wood_charm',quantity}));assert.equal(JSON.stringify(home),before);}
assert.equal(C.action(home,'life',{kind:'craft',recipe:'wood_charm',quantity:20}).生活.库存.wood_charm,20);
home.生活.库存.cloth=1;const short=JSON.stringify(home);assert.throws(()=>C.action(home,'life',{kind:'craft',recipe:'wood_charm',quantity:2}),/不足/);assert.equal(JSON.stringify(home),short);
home.生活.菜圃[0]={...home.生活.菜圃[0],crop:'herb',plantedDay:1};home.生活.菜圃[1]={...home.生活.菜圃[1],crop:'tomato',plantedDay:1};home.环境.天数=3;
for(const plots of [[],['plot_1','plot_1'],['plot_1','missing'],['plot_1','plot_2'],'plot_1']){const before=JSON.stringify(home);assert.throws(()=>C.action(home,'life',{kind:'harvest',plots}));assert.equal(JSON.stringify(home),before);}
const partial=C.action(home,'life',{kind:'harvest',plots:['plot_1']});assert.equal(partial.生活.菜圃[1].crop,'tomato');assert.equal(partial.生活.库存.herb,3);
for(const s of [state(1),state(2)]){assert.throws(()=>C.action(s,'life',{kind:'craft',recipe:'wood_charm',quantity:1}));assert.throws(()=>C.action(s,'life',{kind:'harvest',plots:['plot_1']}));}
const kitchen=state();kitchen.地图.当前地区='R01';kitchen.生活.库存.rice=2;kitchen.生活.库存.tomato=2;
const meals=C.action(kitchen,'life',{kind:'craft',recipe:'tomato_bento',quantity:2});assert.equal(meals.生活.库存.bento,4);assert.equal(meals.生活.库存.rice,0);assert.equal(meals.生活.库存.tomato,0);assert.equal(meals.神社.奉纳,kitchen.神社.奉纳);
assert.throws(()=>C.action(kitchen,'life',{kind:'craft',recipe:'flower_tea',quantity:1}),/尚未开放/);
let donation=state(2,0);donation=step(donation,'奉纳',()=>{},{资源:'奉纳',数量:3,方式:'参拜者当面投入香油钱'});assert.throws(()=>step(donation,'奉纳',()=>{},{资源:'奉纳',数量:1,方式:'参拜者当面投入香油钱'}),/额度/);donation.生活.库存.wood_charm=3;donation=C.action(donation,'life',{kind:'sell',item:'wood_charm',quantity:1});assert.equal(donation.神社.奉纳,8);assert.equal(donation.记录.资源流水.length,2);
console.log('PASS production: sustainable net '+JSON.stringify(nets)+'; daily gross cap5; crop days, quantity1..20, mixed maturity, duplicate IDs, input atomicity, stage/location and reload/date guards');

const current=fs.readFileSync(dir+'/mvu.mjs','utf8'),prior=fs.readFileSync(root+'/releases/1.49.5/mvu.mjs','utf8');
for(const name of ['ShrineFieldSpec','ShrineInitial','ShrineTemplates','ShrineConfig'])assert.equal(current.match(new RegExp('^const '+name+' = (.*);$','m'))[1],prior.match(new RegExp('^const '+name+' = (.*);$','m'))[1]);
const schema=s=>s.slice(s.indexOf('  const Schema = '),s.indexOf('\n  bootstrapCommitted=true;'));assert.equal(schema(current),schema(prior));
const oldLife=JSON.parse(prior.match(/^  const config = (.*);$/m)[1]),newLife=clone(C.life.config);newLife.crops.find(x=>x.id==='herb').yield.herb=2;newLife.buyback=oldLife.buyback;assert.deepEqual(newLife,oldLife);
const card=JSON.parse(fs.readFileSync(dir+'/card-source.json')),base=JSON.parse(fs.readFileSync(root+'/releases/1.49.5/card-source.json'));const changed=card.data.character_book.entries.filter((e,i)=>JSON.stringify(e)!==JSON.stringify(base.data.character_book.entries[i])).map(x=>x.id);assert.deepEqual(changed,[11,1]);
const restored=clone(card);restored.character_version=base.character_version;restored.data.character_version=base.data.character_version;restored.data.character_book.description=base.data.character_book.description;for(const id of changed)restored.data.character_book.entries.find(x=>x.id===id).content=base.data.character_book.entries.find(x=>x.id===id).content;assert.deepEqual(restored,base);
console.log('PASS protected: exact schema/initial/main config/field spec/templates, recipes/shop/crop days, and every card field except two rule entries plus version');
module.exports={C,initial,state,clone,advanceDay,travel,nets,step};
