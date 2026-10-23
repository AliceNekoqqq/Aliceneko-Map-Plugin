const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const {z}=require((process.env.MIKAGE_DEBUG_DEPS||'/tmp/mikage-debug/node_modules')+'/zod');
const root=path.resolve(__dirname,'..'),release=process.argv[2]||'1.49.18',legacy=process.argv.includes('--expect-legacy-failures');
const spec=JSON.parse(fs.readFileSync(root+'/releases/'+release+'/manifest.json'));
const source=fs.readFileSync(path.resolve(root,'..',spec.modules.find(x=>x.module_id==='mvu').path),'utf8');
const code=source.slice(source.indexOf('const ShrineFieldSpec ='),source.indexOf('// Install before importing the core:'));
const schema=source.slice(source.indexOf('  const Schema = ')+2,source.indexOf('\n  bootstrapCommitted=true;'));
const {C,initial}=vm.runInNewContext(code+'\n'+schema+'\nShrineCard.installZodSchema(Schema);({C:ShrineCard,initial:ShrineInitial})',{z,console});
const clone=x=>JSON.parse(JSON.stringify(x)),equal=(a,b)=>assert.deepEqual(clone(a),clone(b));
const event=(s,type)=>({编号:'E'+(s.记录.事件.length+1),类型:type,摘要:'核对线索时巴卫听完说明，交还工具并接受分工',对象:s.委托.编号,来源:'本轮正文中巴卫与玩家的实际协作',方式:'',资源:'无',数量:0,耗力:0,天数:0});
let handler;const warnings=[];
const start=source.indexOf("eventOn('mag_variable_update_ended',"),end=source.indexOf('\n\nlet migrationEpoch',start);
vm.runInNewContext(source.slice(start,end),{eventOn:(name,fn)=>handler=fn,owns:()=>true,ShrineCard:C,dispatchShrineMvuStatus(){},warnUpdate:e=>warnings.push(e.message)});
function handled(s,n){const previous={stat_data:clone(s),schema:{},display_data:clone(s)},vars={stat_data:clone(n),schema:{},delta_data:{changed:true}};handler(vars,previous);equal(previous.stat_data,s);return vars;}
function next(s,type,patch=()=>{}){const n=clone(s);n.记录.事件.push(event(s,type));patch(n);return n;}
function phase(s,type){return next(s,type,n=>{n.委托.阶段=type==='结案'?'收束':type;if(type==='结案'){n.委托.结果='当事人核验处理结果，并说明尚待观察之处';n.委托.结算档位='完整';}});}
function refused(s,n,pattern){assert.throws(()=>C.validate(n,s),pattern);const vars=handled(s,n);equal(vars.stat_data,s);equal(vars.delta_data,{});}
let s=C.action(clone(initial),'acceptEma',{id:initial.绘马板.绘马[0].编号});s.关系.亲近=50;s.关系.心动=50;
const fixtures=[];
for(const type of ['查访','商议','行动','结案']){const n=phase(s,type);fixtures.push({type,s:clone(s),n:clone(n)});s=C.validate(n,s);}
if(legacy){
 for(const f of fixtures){const n=clone(f.n);n.关系.亲近++;refused(f.s,n,/关系变化需本轮关系或日常事件/);}
 console.log('PASS legacy actual handler: investigation/discussion/action/closure plus affinity each roll back the full quest turn');process.exit(0);
}
for(const f of fixtures){
 const original=JSON.stringify(f.s),baseline=C.validate(f.n,f.s);equal(baseline.关系,f.s.关系);
 for(const delta of [-8,-1,1,8]){
  const n=clone(f.n);n.关系.亲近+=delta;n.关系.心动-=delta;
  n.记录.共同经历.push({编号:n.记录.事件.at(-1).编号,摘要:'【相处·能力】依据：两人实际核对线索后分工；目前：巴卫采纳这次说明；未决：继续观察。'});
  const valid=C.validate(n,f.s),vars=handled(f.s,n);equal(vars.stat_data,valid);
  equal(valid.委托,baseline.委托);assert.equal(valid.关系.亲近,50+delta);assert.equal(valid.关系.心动,50-delta);
  assert.equal(valid.记录.事件.length,f.s.记录.事件.length+1);assert.equal(valid.记录.共同经历.at(-1).编号,valid.记录.事件.at(-1).编号);
  equal(valid.神社,baseline.神社);equal(valid.记录.资源流水,baseline.记录.资源流水);equal(valid.记录.完成委托,baseline.记录.完成委托);
 }
 for(const key of ['约定','双方确认','神使契约']){const n=clone(f.n);n.关系[key]=key==='约定'?'未经对应关系事件的约定':true;refused(f.s,n,/关系确认与约定变更需本轮关系或日常事件/);}
 for(const key of ['亲近','心动'])for(const delta of [-9,9]){const n=clone(f.n);n.关系[key]+=delta;refused(f.s,n,/关系单次变化超8/);}
 for(const key of ['摘要','来源']){const n=clone(f.n);n.关系.亲近++;n.记录.事件.at(-1)[key]='  ';refused(f.s,n);}
 const noEvent=clone(f.n);noEvent.关系.亲近++;noEvent.记录.事件.pop();refused(f.s,noEvent);
 const extra=clone(f.n);extra.关系.亲近++;extra.记录.事件.push({...event(f.s,'关系'),编号:'E'+(f.s.记录.事件.length+2)});refused(f.s,extra,/第二事件仅可为结案后的解锁呈现/);
 const duplicate=clone(f.n);duplicate.关系.亲近++;duplicate.记录.事件.at(-1).编号=f.s.记录.事件[0].编号;refused(f.s,duplicate,/列表编号重复：记录.事件/);
 assert.equal(JSON.stringify(f.s),original);
}
const f=fixtures[0],badPhase=clone(f.n);badPhase.委托.阶段='行动';badPhase.关系.亲近++;refused(f.s,badPhase,/委托一轮只能前进或修正一阶段/);
for(const type of ['关系','日常']){
 const n=next(f.s,type,x=>{x.关系.亲近++;x.关系.约定='双方已实际谈妥的安排';x.关系.双方确认=true;x.关系.神使契约=true;});
 equal(handled(f.s,n).stat_data,C.validate(n,f.s));assert(C.validate(n,f.s).关系.双方确认);
}
for(const type of ['设定','休整','规划']){const n=next(f.s,type,x=>x.关系.亲近++);refused(f.s,n,/关系数值变化需/);}
for(const value of [-1,101]){const n=clone(f.n);n.关系.亲近=value;refused(f.s,n);}
const stable=clone(initial);equal(C.validate(clone(stable),stable).关系,stable.关系);
const memory=clone(f.n);memory.关系.亲近++;const id=memory.记录.事件.at(-1).编号;
memory.记录.共同经历.push({编号:id,摘要:'第一项事实'},{编号:id,摘要:'第二项事实'});refused(f.s,memory,/列表编号重复：记录.共同经历/);
function finish(s){for(const type of ['查访','商议','行动','结案'])s=C.validate(phase(s,type),s);return s;}
let main=clone(initial);
for(let i=0;i<2;i++){const row=main.绘马板.绘马.find(x=>x.性质==='普通'&&x.状态==='未接');main=finish(C.action(main,'acceptEma',{id:row.编号}));}
main=C.validate(next(main,'规划',n=>{n.神社.建设计划={设施:'鸟居',说明:'已实际确认的修缮方案',已确认:true};n.记录.事件.at(-1).对象='鸟居';}),main);
for(const [value,type]of [[2,'开工'],[3,'施工'],[4,'施工']])main=C.validate(next(main,type,n=>{n.神社.鸟居=value;n.记录.事件.at(-1).对象='鸟居';}),main);
main=C.validate(next(main,'主线显现',n=>n.记录.事件.at(-1).对象='M01'),main);main=C.action(main,'acceptEma',{id:'M01'});
for(const type of ['查访','商议','行动'])main=C.validate(phase(main,type),main);
const paired=phase(main,'结案');paired.记录.事件.push({...event(main,'解锁呈现'),编号:'E'+(main.记录.事件.length+2),对象:'U02',来源:'正文'});
const pairedBaseline=C.validate(paired,main);paired.关系.亲近=1;paired.关系.心动=1;
paired.记录.共同经历.push({编号:paired.记录.事件.at(-2).编号,摘要:'【相处·能力】依据：共同核对修缮结果；目前：巴卫采纳了实际分工；未决：无。'});
const presented=C.validate(paired,main);equal(handled(main,paired).stat_data,presented);equal(presented.衣橱,pairedBaseline.衣橱);
assert.equal(presented.进度.阶段,2);assert(presented.衣橱.已呈现.includes('U02'));equal(presented.神社,pairedBaseline.神社);
assert.equal(presented.关系.亲近,1);assert.equal(presented.记录.事件.length,main.记录.事件.length+2);
console.log('PASS actual handler + validator: four quest phases with numeric +/-8 and one shared memory; zero automatic gain; settlement parity; nonnumeric relation guards, source/summary, +/-9, range, duplicate, phase and event limits reject atomically; original relation/daily and no-op retained');
console.log('PASS M01 closure + unlock presentation + affinity + first-event-linked memory persist together; chapter/wardrobe/resources match no-affinity settlement');
