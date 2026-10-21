const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const {z}=require('/tmp/mikage-debug/node_modules/zod');
const root=path.resolve(__dirname,'..'),dir=path.join(root,'releases/1.49.2'),source=fs.readFileSync(dir+'/mvu.mjs','utf8');
const clone=x=>JSON.parse(JSON.stringify(x)),extract=text=>text.slice(text.indexOf('  const Schema = ')+2,text.indexOf('\n  bootstrapCommitted=true;'));
const code=source.slice(source.indexOf('const ShrineFieldSpec ='),source.indexOf('// Install before importing the core:'));
const {C,initial,T}=vm.runInNewContext(code+'\n'+extract(source)+'\nShrineCard.installZodSchema(Schema);({C:ShrineCard,initial:ShrineInitial,T:ShrineTemplates})',{z,console});
function state(level=2,money=100){const s=clone(initial);s.主线.已完成=C.config.stages.slice(0,level-1).map(x=>({编号:x.mainId}));C.deriveProgress(s);s.神社.奉纳=money;s.地图.当前地区='R03';s.环境.地点='妖怪横丁';return s;}
for(const row of C.life.config.shop){
 const s=state(),before=JSON.stringify(s),n=C.action(s,'life',{kind:'buy',item:row.item,quantity:2,price:0,units:999});
 assert.equal(n.神社.奉纳,100-row.price*2);assert.equal(n.生活.库存[row.item]-s.生活.库存[row.item],row.units*2);
 assert.equal(n.记录.资源流水.length,1);const entry=n.记录.资源流水[0];assert.equal(entry.变动,-row.price*2);assert.equal(entry.事件编号,n.记录.事件.at(-1).编号);assert.equal(entry.天数,n.环境.天数);
 assert.equal(n.生活.购入[row.item],2);assert.equal(C.life.view(n).shop.find(x=>x.item===row.item).available,row.available-2);
 assert.equal(JSON.stringify(s),before);assert.equal(clone(n).记录.资源流水[0].变动,-row.price*2);
}
for(const [s,payload]of [[state(2,0),{kind:'buy',item:'rice',quantity:1}],[state(),{kind:'buy',item:'rice',quantity:13}],[state(),{kind:'buy',item:'rice',quantity:-1}],[state(),{kind:'buy',item:'rice',quantity:1.5}],[state(),{kind:'buy',item:'unknown',quantity:1}]]){const before=JSON.stringify(s);assert.throws(()=>C.action(s,'life',payload));assert.equal(JSON.stringify(s),before);}
const reserve=state(3,3);assert.throws(()=>C.action(reserve,'life',{kind:'buy',item:'tea_leaf',quantity:1}),/预算/);
const outside=state();outside.地图.当前地区='R01';assert.throws(()=>C.action(outside,'life',{kind:'buy',item:'rice',quantity:1}),/横丁/);
let stock=state();stock=C.action(stock,'life',{kind:'buy',item:'herb_seed',quantity:5});assert.equal(stock.生活.库存.herb_seed,initial.生活.库存.herb_seed+10);assert.throws(()=>C.action(stock,'life',{kind:'buy',item:'herb_seed',quantity:1}),/库存/);
function step(s,type,patch=()=>{},extra={}){const n=clone(s);patch(n);n.记录.事件.push({编号:'E'+(s.记录.事件.length+1),类型:type,摘要:'经济回归：'+type,对象:s.委托.编号,来源:'测试实际事实',方式:'当事人确认的实际过程',资源:'无',数量:0,耗力:0,天数:0,...extra});return C.validate(n,s);}
stock=step(stock,'日常',n=>n.环境.天数++);assert.equal(C.life.view(stock).shop.find(x=>x.item==='herb_seed').available,5);stock=C.action(stock,'life',{kind:'buy',item:'herb_seed',quantity:1});assert.equal(stock.生活.购入.herb_seed,1);assert.equal(stock.记录.资源流水.length,2);
const home=state();home.地图.当前地区='R01';const craft=C.action(home,'life',{kind:'craft',recipe:'bento'});assert.equal(craft.神社.奉纳,home.神社.奉纳);assert.equal(craft.记录.资源流水.length,0);
const forged=clone(home);forged.生活=clone(craft.生活);forged.记录.事件=clone(craft.记录.事件);forged.神社.奉纳++;forged.生活.场景摘要=home.生活.场景摘要;assert.throws(()=>C.validate(forged,home,{action:'life'}),/奉纳扣账/);
function finish(s,grade){for(const [phase,type]of [['查访','查访'],['商议','商议'],['行动','行动'],['收束','结案']])s=step(s,type,n=>{n.委托.阶段=phase;if(phase==='收束'){n.委托.结果='当事人确认本次处理结束';n.委托.结算档位=grade;}});return s;}
function clear(s){s=step(s,'休整',n=>n.委托.阶段='休整');return step(s,'休整',n=>n.委托=clone(initial.委托));}
let serial=0;
function ordinary(s,grade){if(!s.绘马板.绘马.some(r=>r.性质==='普通'&&r.状态==='未接'))s=C.action(s,'refreshBoard',{generated:{绘马:[{标题:'经济心愿'+(++serial),祈愿人:'来客'+serial,来客类型:'人类',类型:C.config.stages[s.进度.阶段-1].types[0],地区:'R01',心愿:'核实意愿并实际帮助'+serial,补充说明:'测试夹具',幕后:Object.fromEntries(Object.keys(T['绘马板.绘马'].幕后).map(k=>[k,'查访和商议的实际事实']))}]}});return clear(finish(C.action(s,'acceptEma',{id:s.绘马板.绘马.find(r=>r.性质==='普通'&&r.状态==='未接').编号}),grade));}
for(const grade of ['完整','基础']){let s=clone(initial);for(const cfg of C.config.stages){for(let i=0;i<2;i++)s=ordinary(s,grade);s=step(s,'规划',n=>n.神社.建设计划={设施:cfg.facility,说明:'当事人确认的修缮方案',已确认:true},{对象:cfg.facility});for(const [value,type]of [[2,'开工'],[3,'施工'],[4,'施工']])s=step(s,type,n=>n.神社[cfg.facility]=value,{对象:cfg.facility});s=step(s,'主线显现',()=>{},{对象:cfg.mainId});s=C.action(s,'acceptEma',{id:cfg.mainId});if(cfg.level===5){s=C.action(s,'life',{kind:'festivalPlan',theme:'夏夜灯会',booths:[]});for(const kind of ['festivalStart','festivalEnd'])s=step(s,'生活互动',()=>{},{对象:'festival',方式:JSON.stringify({kind})});}s=clear(finish(s,'完整'));}assert(s.主线.通关);assert.equal(s.神社.奉纳,grade==='完整'?8:4);assert.equal(s.记录.资源流水.filter(x=>x.资源==='奉纳').reduce((sum,x)=>sum+x.变动,0),s.神社.奉纳);}
const card=JSON.parse(fs.readFileSync(dir+'/card-source.json')),base=JSON.parse(fs.readFileSync(root+'/releases/1.49.1/card-source.json')),get=(c,id)=>c.data.character_book.entries.find(e=>e.id===id);
for(const stage of C.config.stages)assert(get(card,1).content.includes(stage.facility+'='+Object.entries(stage.cost).map(([k,v])=>k+v).join('')));
assert.deepEqual(card.data.character_book.entries.filter(e=>JSON.stringify(e)!==JSON.stringify(get(base,e.id))).map(e=>e.id),[11,1]);
assert.deepEqual(card.data.extensions,base.data.extensions);assert.equal(extract(source),extract(fs.readFileSync(root+'/releases/1.49.1/mvu.mjs','utf8')));
console.log('PASS 10 shop products, fixed per-package prices/units, one debit/one ledger, quantity and stock limits, next-day restock, reserve, errors atomic, no-op money guard, five chapters complete/basic=8/4; cost authority and unchanged schema/extensions');
module.exports={C,initial,state,clone};
