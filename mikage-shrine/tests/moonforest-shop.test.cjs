const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const {z}=require('/tmp/mikage-debug/node_modules/zod');
const root=path.resolve(__dirname,'..'),dir=path.join(root,'releases',process.env.MIKAGE_SHOP_RELEASE||'1.49.0');
const source=fs.readFileSync(path.resolve(root,'..',JSON.parse(fs.readFileSync(dir+'/manifest.json')).modules.find(m=>m.module_id==='mvu').path),'utf8'),clone=x=>JSON.parse(JSON.stringify(x));
const code=source.slice(source.indexOf('const ShrineFieldSpec ='),source.indexOf('// Install before importing the core:'));
const schema=source.slice(source.indexOf('  const Schema = ')+2,source.indexOf('\n  bootstrapCommitted=true;'));
const {C,initial,Schema}=vm.runInNewContext(code+'\n'+schema+'\nShrineCard.installZodSchema(Schema);({C:ShrineCard,initial:ShrineInitial,Schema})',{z,console});
function state(stage=1,balance=30){const s=clone(initial);s.主线.已完成=C.config.stages.slice(0,stage-1).map(x=>({编号:x.mainId}));C.deriveProgress(s);s.神社.奉纳=balance;s.地图.当前地区='R02';s.环境.地点='宇庭老街·月之森和裁舍';return s;}
function event(s,sku){return {编号:'E'+(s.记录.事件.length+1),类型:'衣装购买',摘要:'玩家确认选购，素世包装衣物。',对象:sku,来源:'月之森和裁舍',方式:JSON.stringify({sku}),资源:'无',数量:0,耗力:0,天数:0};}
function narrative(s,sku){const n=clone(s);n.记录.事件.push(event(s,sku));return C.validate(n,s);}
const products=C.config.wardrobeShop.products;assert.equal(products.length,16);
for(const p of products){
 const s=state(),before=JSON.stringify(s),viaUI=C.action(s,'buyOutfit',{sku:p.sku,price:0}),viaText=narrative(s,p.sku);
 assert.deepEqual(clone(viaUI.神社),clone(viaText.神社));assert.deepEqual(clone(viaUI.衣橱),clone(viaText.衣橱));
 assert.equal(viaUI.神社.奉纳,s.神社.奉纳-p.price);assert.equal(viaUI.记录.资源流水.at(-1).变动,-p.price);
 for(const o of p.outfits)assert(viaUI.衣橱.已解锁.some(x=>x.编号===o.actor+':'+o.id&&x.角色===o.actor&&x.衣装===o.id));
 assert.equal(viaUI.玩家.衣装,s.玩家.衣装);assert.equal(viaUI.巴卫.服装,s.巴卫.服装);assert.equal(viaUI.环境.天数,s.环境.天数);
 assert.equal(JSON.stringify(s),before);assert.throws(()=>C.action(viaUI,'buyOutfit',{sku:p.sku}),/已收录/);
 const restored=clone(viaUI);C.deriveProgress(restored);assert.deepEqual(clone(restored.衣橱),clone(viaUI.衣橱));C.checkFields(restored);assert(Schema.safeParse(restored).success);
 const o=p.outfits[0],worn=C.action(viaUI,'setOutfit',{actor:o.actor,outfit:o.id});assert.equal(o.actor==='player'?worn.玩家.衣装:worn.巴卫.服装,o.id);
}
let s=state();assert.equal(C.shopView(s).atShop,true);assert.throws(()=>C.action(state(1,0),'buyOutfit',{sku:products[0].sku}),/奉纳不足/);
const outside=state();outside.环境.地点='宇庭高校门外';assert.throws(()=>narrative(outside,products[0].sku),/抵达/);
const teleport=clone(outside);teleport.环境.地点='宇庭老街·月之森和裁舍';teleport.记录.事件.push(event(outside,products[0].sku));assert.throws(()=>C.validate(teleport,outside),/抵达/);
const reserve=state(3,3);assert.equal(C.shopView(reserve).spendable,1);assert.throws(()=>narrative(reserve,'player:sakura'),/预留/);
assert.throws(()=>narrative(s,'player:yukata'),/编号/);
for(const mutator of [n=>n.神社.奉纳--,n=>n.衣橱.已解锁.push('sakura'),n=>n.衣橱.已解锁.push({编号:'player:sakura',角色:'player',衣装:'sakura'}),n=>n.玩家.衣装='sakura']){const n=clone(s);mutator(n);n.记录.事件.push(event(s,'player:sakura'));assert.throws(()=>C.validate(n,s));}
for(const mutator of [e=>e.方式=JSON.stringify({sku:e.对象,price:0}),e=>e.来源='任意店铺',e=>e.编号='E999',e=>e.资源='奉纳',e=>e.数量=3]){const n=clone(s),e=event(s,'player:sakura');mutator(e);n.记录.事件.push(e);assert.throws(()=>C.validate(n,s));}
let school=C.action(s,'buyOutfit',{sku:'tomoe:school'});assert(!school.衣橱.已解锁.some(o=>o.角色==='player'&&o.衣装==='school'));school=C.action(school,'setOutfit',{actor:'tomoe',outfit:'school-human'});assert.equal(school.巴卫.服装,'school-human');
for(const q of C.config.wardrobeQuests){
 let t=state(5);for(const f of ['鸟居','参道','社务所','拜殿','庭院'])t.神社[f]=4;C.deriveProgress(t);
 // Completed chapter fixtures carry their normal presentation history.
 t.衣橱.待呈现=[];t.衣橱.已呈现=C.config.wardrobeRewards.filter(r=>!r.sideQuest&&t.主线.已完成.some(x=>x.编号===r.mainId)).map(x=>x.id);
 if(q.mainId==='M05'){t.主线.已完成.push({编号:'M05'});C.deriveProgress(t);t.衣橱.已呈现.push('UCLEAR');}
 t=C.action(t,'addWardrobeQuest',{id:q.id});t=C.action(t,'acceptEma',{id:q.id});
 for(const [stage,type] of [['查访','查访'],['商议','商议'],['行动','行动'],['收束','结案']]){const n=clone(t);n.委托.阶段=stage;if(type==='结案'){n.委托.结果='当事人确认完成登记与交付';n.委托.结算档位='完整';}n.记录.事件.push({...event(t,q.id),类型:type,对象:q.id,来源:'正文',方式:''});t=C.validate(n,t);}
 for(const o of q.outfits)assert(t.衣橱.已解锁.some(x=>x.角色===o.actor&&x.衣装===o.id));
}
const original=JSON.parse(fs.readFileSync(root+'/releases/1.48.4/manifest.json'));const actual=JSON.parse(fs.readFileSync(dir+'/manifest.json'));
for(const id of ['minigames','tomoe'])assert.deepEqual(actual.modules.find(m=>m.module_id===id),original.modules.find(m=>m.module_id===id));
const sourceModule=(spec,id)=>fs.readFileSync(path.join(root,'..',spec.modules.find(m=>m.module_id===id).path),'utf8');
const artBlock=t=>t.slice(t.indexOf('((host)=>{'),t.indexOf('const StatusbarHTML='));
assert.equal(artBlock(sourceModule(actual,'scene')),artBlock(sourceModule(original,'scene')),'full art renderer/catalog preserved');
const card=JSON.parse(fs.readFileSync(dir+'/card-source.json')),prior=JSON.parse(fs.readFileSync(root+'/releases/1.48.4/card-source.json'));const get=(c,id)=>c.data.character_book.entries.find(e=>e.id===id);
assert.deepEqual(card.data.extensions.regex_scripts,prior.data.extensions.regex_scripts);assert.deepEqual(get(card,77),get(prior,77));
assert.equal(get(card,83).enabled,true);assert.equal(get(card,58).enabled,false);assert.equal(C.config.wardrobeQuests.find(q=>q.id==='WQ09').region,'R08');
assert.equal(C.config.wardrobeQuests.find(q=>q.id==='WQ07').outfits.some(o=>o.id==='chibi'),false);
assert(C.config.wardrobeRewards.filter(r=>['U02','U03','U04'].includes(r.id)).every(r=>!r.outfits.length));
// Exercise the actual local-only full-unlock builder without handling its password.
const sceneSource=sourceModule(actual,'scene'),buildStart=sceneSource.indexOf(' function build(){'),buildEnd=sceneSource.indexOf('\n function travel(',buildStart);
const dev=vm.runInNewContext(sceneSource.slice(buildStart,buildEnd)+'\nbuild()', {engine:()=>C,initial,copy:clone});
assert(Schema.safeParse(dev).success);const baselineIds=['player:daily','player:shrine','player:work','tomoe:usual','tomoe:work'];
const all=new Set([...baselineIds,...dev.衣橱.已解锁.map(o=>o.编号)]);assert.equal(all.size,31,'full test wardrobe keeps all existing IDs');
for(const edit of JSON.parse(fs.readFileSync(root+'/releases/1.48.2/copy-edits.json')))assert(['minigames','panels','scene'].some(id=>sourceModule(actual,id).includes(edit.new)),edit.id+' approved prose retained');
const ejs=require('/tmp/mikage-debug/node_modules/ejs');const dynamic=card.data.character_book.entries.filter(e=>e.enabled&&e.content.includes('<%'));
assert.equal(dynamic.length,11);
for(const e of dynamic)for(const value of [state(),{}])for(const runType of ['generate','display'])ejs.render(e.content,{runType,getvar:()=>value,lastMessageId:0});
for(const id of [83,84]){const e=get(card,id);assert(!/原作|二创|改编|彩蛋NPC/.test(e.content),'source notes stay outside model entries');assert.equal(e.constant,false);assert.equal(e.extensions.scan_depth,2);assert.equal(e.extensions.exclude_recursion,true);assert.equal(e.extensions.prevent_recursion,true);}
for(const id of [1,49,55,57,58,83,84])assert(!/裁衣铺|UW-SCHOOL|UW-CITY|UW-WINTER|UW-CULTURE/.test(get(card,id).content),'retired wardrobe sources removed from '+id);
console.log('PASS 16 products, UI/model same settlement, price/ownership/ledger/persistence/wear/variants; invalid/tampered/duplicate/remote/unfunded purchases rejected; reserve; 5 story outfit quests; art and regex parity');
console.log('PASS all 31 developer wardrobe IDs, 77 approved prose edits, 11 EJS templates with present/missing state and display mode; shop entry activation settings');
module.exports={C,initial,Schema,state,narrative};
