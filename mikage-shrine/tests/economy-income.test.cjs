process.env.MIKAGE_ECONOMY_RELEASE ||= '1.49.3';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {C,initial,state,clone}=require('./economy.test.cjs');
function step(s,type,patch=()=>{},extra={}){const n=clone(s);patch(n);n.记录.事件.push({编号:'E'+(s.记录.事件.length+1),类型:type,摘要:'实际经济回归事实',对象:'',来源:'实际参拜者',方式:'当面收到的零散香油钱',资源:'无',数量:0,耗力:0,天数:0,...extra});return C.validate(n,s);}
const donate=(s,q)=>step(s,'奉纳',()=>{},{资源:'奉纳',数量:q});
const tomorrow=s=>step(s,'日常',n=>n.环境.天数++);
function travel(s,id){return step(C.action(s,'travel',{regionId:id}),'抵达',()=>{},{对象:id});}
const products=C.life.config.buyback.products;
for(const row of products){
 const s=state(2,0);s.生活.库存[row.item]=row.units;const before=JSON.stringify(s),n=C.action(s,'life',{kind:'sell',item:row.item,quantity:1,price:999,units:0});
 assert.equal(n.生活.库存[row.item],0);assert.equal(n.神社.奉纳,row.price);assert.equal(n.记录.资源流水.length,1);assert.equal(n.记录.资源流水[0].变动,row.price);assert.equal(n.记录.资源流水[0].来源,'妖怪横丁收购');assert.equal(JSON.stringify(s),before);const restored=clone(n);C.deriveProgress(restored);assert.equal(C.life.view(restored).buyback.used,row.price);
}
for(const row of C.life.config.shop){const s=state();s.生活.库存[row.item]=99;assert.throws(()=>C.action(s,'life',{kind:'sell',item:row.item,quantity:1}),/目录/);}
for(const quantity of [0,-1,0.5,21])assert.throws(()=>C.action(state(),'life',{kind:'sell',item:'herb',quantity}));
const poor=state();poor.生活.库存.herb=1;assert.throws(()=>C.action(poor,'life',{kind:'sell',item:'herb',quantity:1}),/库存/);
const remote=state();remote.地图.当前地区='R01';remote.生活.库存.herb=2;assert.throws(()=>C.action(remote,'life',{kind:'sell',item:'herb',quantity:1}),/横丁/);
const early=state(1);early.生活.库存.herb=2;assert.throws(()=>C.action(early,'life',{kind:'sell',item:'herb',quantity:1}),/第二章/);
let capped=state(2,0);capped.生活.库存.wood_charm=6;capped.生活.库存.herb=2;capped=C.action(capped,'life',{kind:'sell',item:'wood_charm',quantity:1});assert.equal(C.life.view(capped).buyback.remaining,0);assert.throws(()=>C.action(capped,'life',{kind:'sell',item:'wood_charm',quantity:1}),/额度/);assert.throws(()=>C.action(capped,'life',{kind:'sell',item:'herb',quantity:1}),/额度/);
const settled=JSON.stringify(capped);for(let i=0;i<10;i++)C.life.view(capped);assert.equal(JSON.stringify(capped),settled);const nextday=tomorrow(capped);assert.equal(nextday.神社.奉纳,4);assert.equal(C.life.view(nextday).buyback.remaining,4);assert.equal(C.action(nextday,'life',{kind:'sell',item:'wood_charm',quantity:1}).神社.奉纳,8);
let d=state(2,0);d=donate(d,3);assert.equal(d.神社.奉纳,3);assert.throws(()=>donate(d,1),/额度/);assert.throws(()=>donate(state(),4),/单次上限/);assert.throws(()=>donate(state(),0));const dated=donate(tomorrow(d),3);assert.equal(dated.神社.奉纳,6);assert.equal(dated.记录.资源流水.length,2);
d.生活.库存.wood_charm=3;d=C.action(d,'life',{kind:'sell',item:'wood_charm',quantity:1});assert.equal(d.神社.奉纳,7,'separate donation and buyback budgets');
const raw=clone(d);raw.记录.事件.push({编号:'E'+(d.记录.事件.length+1),类型:'生活操作',摘要:'测试代操作',对象:'herb',来源:'妖怪横丁收购',方式:JSON.stringify({kind:'sell',item:'herb',quantity:1}),资源:'无',数量:0,耗力:0,天数:0});assert.throws(()=>C.validate(raw,d),/界面/);
// Donation quota excludes ordinary fixed rewards.
let rewarded=donate(state(2,0),3);rewarded=C.action(rewarded,'refreshBoard',{generated:{绘马:[{标题:'收入审查',祈愿人:'实际来客',来客类型:'人类',类型:C.config.stages[1].types[0],地区:'R01',心愿:'商议并实际帮助当事人',补充说明:'测试夹具',幕后:Object.fromEntries(Object.keys(initial.委托.幕后).map(k=>[k,'实际线索与商议']))}]}});rewarded=C.action(rewarded,'acceptEma',{id:rewarded.绘马板.绘马.find(r=>r.标题==='收入审查').编号});
for(const [phase,type]of [['查访','查访'],['商议','商议'],['行动','行动'],['收束','结案']])rewarded=step(rewarded,type,n=>{n.委托.阶段=phase;if(phase==='收束'){n.委托.结果='当事人确认处理结束';n.委托.结算档位='完整';}},{对象:rewarded.委托.编号});assert.equal(rewarded.神社.奉纳,4);
// Real two-plot farming: seed debit, elapsed story days, harvest, travel and sale.
let farm=state(2,0);farm.地图.当前地区='R01';farm.环境.地点='御影神社·庭院';for(const plot of ['plot_1','plot_2'])farm=C.action(farm,'life',{kind:'plant',plot,crop:'herb'});assert.equal(farm.生活.库存.herb_seed,0);assert.throws(()=>C.action(farm,'life',{kind:'harvest',plot:'plot_1'}),/成熟/);farm=tomorrow(tomorrow(farm));for(const plot of ['plot_1','plot_2'])farm=C.action(farm,'life',{kind:'harvest',plot});assert.equal(farm.生活.库存.herb,4);assert.equal(farm.神社.奉纳,0);farm=travel(farm,'R03');farm=C.action(farm,'life',{kind:'sell',item:'herb',quantity:2});assert.equal(farm.神社.奉纳,2);assert.equal(farm.生活.库存.herb,0);
// Buying supplies -> crafting -> one capped sale yields one donation net.
let craft=state(2,10);craft.生活.库存.wood_scrap=craft.生活.库存.cloth=0;for(const item of ['wood_scrap','cloth'])craft=C.action(craft,'life',{kind:'buy',item,quantity:1});craft=travel(craft,'R01');for(let i=0;i<3;i++)craft=C.action(craft,'life',{kind:'craft',recipe:'wood_charm'});craft=travel(craft,'R03');craft=C.action(craft,'life',{kind:'sell',item:'wood_charm',quantity:1});assert.equal(craft.神社.奉纳,11);assert.equal(craft.记录.资源流水.reduce((n,x)=>n+x.变动,0),1);assert.throws(()=>C.action(craft,'life',{kind:'sell',item:'wood_charm',quantity:1}));
const cook=state();cook.地图.当前地区='R01';cook.生活.库存.tomato=1;const meal=C.action(cook,'life',{kind:'craft',recipe:'tomato_bento'});assert.equal(meal.生活.库存.rice,cook.生活.库存.rice-1);assert.equal(meal.生活.库存.tomato,0);assert.equal(meal.生活.库存.bento,cook.生活.库存.bento+2);assert.equal(meal.神社.奉纳,cook.神社.奉纳);
const prior=JSON.parse(fs.readFileSync(path.join(__dirname,'../releases/1.49.2/life-config.json')));assert.deepEqual(clone(C.life.config.recipes.slice(0,-1)),prior.recipes);assert.deepEqual(clone(C.life.config.shop),prior.shop);
const book=JSON.parse(fs.readFileSync(path.join(__dirname,'../releases',process.env.MIKAGE_ECONOMY_RELEASE,'card-source.json'))),reader=book.data.character_book.entries.find(e=>e.id===54).content;
const output=require('/tmp/mikage-debug/node_modules/ejs').render(reader,{runType:'generate',getvar:()=>d,lastMessageId:0});assert(output.includes('已收3，可入账余量0，单次上限3'));
console.log('PASS buyback catalogue, inventory/price/ledger persistence, shared day cap/reload/date reset, actual crop and craft cycles, direct-resale rejection, donation single/day caps and ordinary reward exclusion, tomato recipe');
module.exports={C,state,clone,tomorrow};
