const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const deps=process.env.MIKAGE_DEBUG_DEPS||'/tmp/mikage-debug/node_modules',{z}=require(deps+'/zod'),ejs=require(deps+'/ejs');
const r=path.resolve(__dirname,'..'),spec=JSON.parse(fs.readFileSync(r+'/releases/1.49.27/manifest.json')),source=fs.readFileSync(r+'/releases/1.49.27/mvu.mjs','utf8');
const code=source.slice(source.indexOf('const ShrineFieldSpec ='),source.indexOf('// Install before importing the core:')),schema=source.slice(source.indexOf('  const Schema = ')+2,source.indexOf('\n  bootstrapCommitted=true;'));
const {C,initial}=vm.runInNewContext(code+'\n'+schema+'\nShrineCard.installZodSchema(Schema);({C:ShrineCard,initial:ShrineInitial})',{z,console}),clone=x=>JSON.parse(JSON.stringify(x)),equal=(a,b)=>assert.deepEqual(clone(a),clone(b));
let handler;vm.runInNewContext(source.slice(source.indexOf("eventOn('mag_variable_update_ended',"),source.indexOf('\n\nlet migrationEpoch')),{eventOn:(n,f)=>handler=f,owns:()=>true,ShrineCard:C,dispatchShrineMvuStatus(){},warnUpdate(){}});
const ev=(id,type='日常',object='')=>({编号:id,类型:type,摘要:'本轮已发生的事实',对象:object,来源:'正文',方式:'',资源:'无',数量:0,耗力:0,天数:0});
function step(s,type,object='',patch=()=>{},double=false){const n=clone(s);patch(n);n.记录.事件.push(ev(C.nextEventId(s),type,object));if(double)n.记录.事件.push(ev(C.nextEventId(s,1),'解锁呈现','U02'));return C.validate(n,s);}
for(const id of ['E0','E2','E100','custom']){const n=clone(initial);n.记录.事件.push(ev(id));const vars={stat_data:n,delta_data:{x:1}};handler(vars,{stat_data:clone(initial)});equal(vars.stat_data,initial);equal(vars.delta_data,{});}
const panels=fs.readFileSync(r+'/releases/1.49.27/panels.mjs','utf8');const naming=vm.runInNewContext(panels.slice(panels.indexOf('function nameOutfitState('),panels.indexOf('  function visible(s){'))+'\nnameOutfitState',{outfitMemory:()=>({})});
const entries=JSON.parse(fs.readFileSync(r+'/releases/1.49.27/card-source.json')).data.character_book.entries;
const render=(id,s)=>ejs.render(entries.find(e=>e.id===id).content,{runType:'generate',getvar:()=>clone(s),lastMessageId:0});
for(const ids of [[],['E2'],['E9','E2'],['E1','E3'],['note','E0007'],['E9007199254740993']]){
 const s=clone(initial);s.记录.事件=ids.map(x=>ev(x));if(ids.length)s.记录.共同经历.push({编号:ids[0],摘要:'原有事实引用'});
 let max=0n;for(const id of ids){const m=/^E(\d+)$/.exec(id);if(m&&BigInt(m[1])>max)max=BigInt(m[1]);}const expected='E'+(max+1n);assert.equal(C.nextEventId(s),expected);
 for(const [name,payload]of [['setOutfit',{actor:'player',outfit:'work'}],['travel',{regionId:'R02'}],['life',{kind:'light',decoration:'D-START-LANTERN',lit:true}]]){const n=C.action(s,name,payload);assert.equal(n.记录.事件.at(-1).编号,expected);equal(n.记录.事件.slice(0,ids.length),s.记录.事件);equal(n.记录.共同经历,s.记录.共同经历);equal(n.记录.资源流水,s.记录.资源流水);}
 const named=naming(s,{actor:'player',outfit:'work',name:'旧衣新记'},C);assert.equal(named.记录.共同经历.at(-1).编号,expected);
 let shop=clone(s);shop.神社.奉纳=30;shop.地图.当前地区='R02';shop.环境.地点='宇庭老街·月之森和裁舍';shop=C.action(shop,'buyOutfit',{sku:'tomoe:school'});assert.equal(shop.记录.事件.at(-1).编号,expected);assert(shop.衣橱.已解锁.some(x=>x.衣装==='school-human'));
 const human=C.action(shop,'setOutfit',{actor:'tomoe',outfit:'school-human'});const look=render(77,human);assert(look.includes('当前发型：银白短发。'));assert(!look.includes('银白长发采用'));const wedding=clone(human);wedding.巴卫.服装='wedding';assert(render(77,wedding).includes('当前发型：银白长发。')); 
 assert(render(54,s).includes('首号'+expected));assert(render(54,s).includes('次号E'+(max+2n)));
}
// Reach a real M01 settlement from a historical gap, preserving old IDs and references.
let s=clone(initial);s.记录.事件=[ev('E9')];s.记录.共同经历=[{编号:'E9',摘要:'旧编号保持'}];
for(let i=1;i<=2;i++)s.记录.完成委托.push({编号:'fixture'+i,快照:{...clone(initial.委托),编号:'fixture'+i,性质:'普通',材料档:1,阶段:'收束',结算档位:'完整'}});s.神社.鸟居=4;C.deriveProgress(s);
s=step(s,'主线显现','M01');s=C.action(s,'acceptEma',{id:'M01'});for(const type of ['查访','商议','行动'])s=step(s,type,'M01',n=>n.委托.阶段=type);
const before=clone(s),n=step(s,'结案','M01',n=>{n.委托.阶段='收束';n.委托.结果='已实际完成并得到回应';n.委托.结算档位='完整';},true);
assert.equal(n.主线.已完成.at(-1).编号,'M01');assert(n.衣橱.已呈现.includes('U02'));equal(n.记录.事件.slice(0,before.记录.事件.length),before.记录.事件);equal(n.记录.共同经历,before.记录.共同经历);
const bad=clone(before);bad.委托.阶段='收束';bad.委托.结果='已完成';bad.委托.结算档位='完整';bad.记录.事件.push(ev(C.nextEventId(before),'结案','M01'),ev(C.nextEventId(before,2),'解锁呈现','U02'));assert.throws(()=>C.validate(bad,before),/最大序号/);
// Wedding's own long-hair description is preserved by exact entry inverse.
const prior=JSON.parse(fs.readFileSync(r+'/releases/1.49.26/card-source.json')).data.character_book.entries.find(e=>e.id===77).content;assert.equal(entries.find(e=>e.id===77).content.replace('发型采用当前衣装的外观描述','银白长发采用本套衣装描述'),prior);
console.log('PASS actual handler numbering rejection; six old-history shapes, >safe integer, UI light/travel/outfit/name/purchase, read-only EJS next IDs, gap-history double settlement and references preserved, short/long hair source parity');
