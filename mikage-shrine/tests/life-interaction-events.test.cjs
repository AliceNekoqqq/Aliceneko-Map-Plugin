const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const {z}=require((process.env.MIKAGE_DEBUG_DEPS||'/tmp/mikage-debug/node_modules')+'/zod');
const root=path.resolve(__dirname,'..'),release=process.argv[2]||'1.49.17',legacy=process.argv.includes('--expect-legacy-failures');
const spec=JSON.parse(fs.readFileSync(root+'/releases/'+release+'/manifest.json'));
const source=fs.readFileSync(path.resolve(root,'..',spec.modules.find(x=>x.module_id==='mvu').path),'utf8');
const code=source.slice(source.indexOf('const ShrineFieldSpec ='),source.indexOf('// Install before importing the core:'));
const schema=source.slice(source.indexOf('  const Schema = ')+2,source.indexOf('\n  bootstrapCommitted=true;'));
const {C,initial,life}=vm.runInNewContext(code+'\n'+schema+'\nShrineCard.installZodSchema(Schema);({C:ShrineCard,initial:ShrineInitial,life:ShrineLifeRuntime})',{z,console});
const clone=x=>JSON.parse(JSON.stringify(x));
const equal=(a,b,message)=>assert.deepEqual(clone(a),clone(b),message);
const event=(s,payload)=>({编号:'E'+(s.记录.事件.length+1),类型:'生活互动',摘要:'正文实际完成物件操作或活动',对象:payload.decoration||payload.serving||'festival',来源:'正文',方式:JSON.stringify(payload),资源:'无',数量:0,耗力:0,天数:0});
const candidate=(s,payload,patch=()=>{})=>{const n=clone(s);n.记录.事件.push(event(s,payload));patch(n);return n;};
function stage(level=1){const s=clone(initial);s.主线.已完成=C.config.stages.slice(0,level-1).map(x=>({编号:x.mainId}));C.deriveProgress(s);return s;}
function foodState(carried=false){let s=stage(carried?3:1);s.生活.库存.bento=1;return C.action(s,'life',{kind:carried?'pack':'serve',item:'bento'});}
let handler;const warnings=[];
const a=source.indexOf("eventOn('mag_variable_update_ended',"),b=source.indexOf('\n\nlet migrationEpoch',a);
vm.runInNewContext(source.slice(a,b),{eventOn:(name,fn)=>handler=fn,owns:()=>true,ShrineCard:C,dispatchShrineMvuStatus(){},warnUpdate:e=>warnings.push(e.message)});
function handled(s,n){const before={stat_data:clone(s),schema:{},display_data:clone(s)},vars={stat_data:clone(n),schema:{},delta_data:{changed:true}};handler(vars,before);equal(before.stat_data,s);return vars;}
const home=stage(),lamp=home.生活.布置.find(d=>d.item==='lantern'),cushion=home.生活.布置.find(d=>d.item==='zabuton');
const table=foodState(),carried=foodState(true);
const cases=[['lantern',home,{kind:'lantern',decoration:lamp.id,lit:true}],['store',home,{kind:'store',decoration:cushion.id}],['table meal',table,{kind:'meal',serving:table.生活.桌面[0].id}],['carried meal',carried,{kind:'meal',serving:carried.生活.随行[0].id}]];
if(legacy){
 for(const [name,s,payload]of cases){const n=candidate(s,payload);assert.throws(()=>C.validate(n,s),/生活互动变化超出允许范围/);equal(clone(handled(s,n).stat_data),s,name);}
 console.log('PASS legacy: event-only lantern/store/table/carried meals each reject and roll back the actual handler');
 process.exit(0);
}
for(const [name,s,payload]of cases){
 const frozen=JSON.stringify(s),n=candidate(s,payload),expected=life.runInteraction(s,JSON.stringify(payload),n.记录.事件.at(-1));
 const result=C.validate(n,s),viaHandler=clone(handled(s,n).stat_data);
 equal(clone(result),viaHandler,name);assert.equal(JSON.stringify(s),frozen);
 const normalized=clone(result.生活);normalized.场景摘要=expected.场景摘要;equal(normalized,clone(expected),name);
 assert.equal(result.记录.事件.length,s.记录.事件.length+1);equal(clone(result.记录.资源流水),s.记录.资源流水);equal(clone(result.神社),s.神社);
 const exact=candidate(s,payload);exact.生活=clone(expected);equal(clone(C.validate(exact,s)),clone(result),'compatible exact bounded result');
 assert.throws(()=>C.validate(candidate(result,payload),result),'duplicate interaction must reject');
 const forged=candidate(s,payload);forged.生活.库存.rice++;assert.throws(()=>C.validate(forged,s),/生活互动变化超出允许范围/);
 equal(clone(handled(s,forged).stat_data),s,'extra state mutation rolls back');
}
const lit=C.validate(candidate(home,cases[0][2]),home);
const off=C.validate(candidate(lit,{kind:'lantern',decoration:lamp.id,lit:false}),lit);assert.equal(off.生活.布置.find(d=>d.id===lamp.id).state.lit,false);
function refused(s,payload,patch=()=>{}){const n=candidate(s,payload,patch);assert.throws(()=>C.validate(n,s));equal(clone(handled(s,n).stat_data),s);}
refused(home,{kind:'lantern',decoration:'missing',lit:true});
refused(home,{kind:'store',decoration:'missing'});
refused(table,{kind:'meal',serving:'missing'});
refused(home,{kind:'unknown'});
refused(home,cases[0][2],n=>n.记录.事件.at(-1).对象='wrong-target');
refused(home,cases[0][2],n=>n.记录.事件.at(-1).来源='');
refused(home,cases[0][2],n=>n.记录.事件.at(-1).摘要='');
refused(home,cases[0][2],n=>n.记录.事件.at(-1).方式='{');
refused(home,cases[0][2],n=>n.生活.场景摘要='模型改写摘要');
const outside=stage();outside.地图.当前地区='R02';outside.环境.地点='宇庭高校';
refused(outside,{kind:'lantern',decoration:lamp.id,lit:true});refused(outside,{kind:'store',decoration:cushion.id});
const remoteTable=clone(table);remoteTable.地图.当前地区='R02';remoteTable.环境.地点='宇庭高校';refused(remoteTable,{kind:'meal',serving:remoteTable.生活.桌面[0].id});
const remoteCarried=clone(carried);remoteCarried.地图.当前地区='R02';remoteCarried.环境.地点='宇庭高校';
assert.equal(C.validate(candidate(remoteCarried,{kind:'meal',serving:remoteCarried.生活.随行[0].id}),remoteCarried).生活.随行.length,0);
const tomorrow=clone(home);tomorrow.生活.购入.rice=1;
const nextDay=candidate(tomorrow,cases[0][2],n=>n.环境.天数++),newDay=C.validate(nextDay,tomorrow);
assert.equal(newDay.生活.补货日,newDay.环境.天数);assert(Object.values(newDay.生活.购入).every(x=>x===0));assert.equal(newDay.生活.布置.find(d=>d.id===lamp.id).state.lit,true);
let festival=C.action(stage(5),'life',{kind:'festivalPlan',theme:'夏夜灯会',booths:[]});
refused(home,{kind:'festivalStart'});refused(festival,{kind:'festivalEnd'});
const start=candidate(festival,{kind:'festivalStart'},n=>n.环境.天数++);festival=C.validate(start,festival);assert(festival.生活.祭典.已举办);assert.equal(festival.生活.祭典.开始日,festival.环境.天数);assert.equal(festival.生活.补货日,festival.环境.天数);
refused(festival,{kind:'festivalStart'});festival=C.validate(candidate(festival,{kind:'festivalEnd'}),festival);assert(festival.生活.祭典.已结束);refused(festival,{kind:'festivalEnd'});
const uiOn=C.action(home,'life',{kind:'light',decoration:lamp.id,lit:true});assert(uiOn.生活.布置.find(d=>d.id===lamp.id).state.lit);
const uiStore=C.action(home,'life',{kind:'store',decoration:cushion.id});assert(!uiStore.生活.布置.some(d=>d.id===cushion.id));
equal(clone(C.validate(clone(home),home).记录),home.记录);
console.log('PASS actual handler and pure validator: event-only lantern on/off, store, table/carried meals, bounded exact-result compatibility, duplicate/tamper/location/ID/source/JSON rejection, next-day restock and festival dates, original UI actions and no-op');
