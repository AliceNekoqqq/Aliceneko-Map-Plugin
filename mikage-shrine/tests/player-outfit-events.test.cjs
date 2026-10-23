const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const {z}=require((process.env.MIKAGE_DEBUG_DEPS||'/tmp/mikage-debug/node_modules')+'/zod');
const root=path.resolve(__dirname,'..'),release=process.argv[2]||'1.49.23',legacy=process.argv.includes('--expect-legacy-failure');
const spec=JSON.parse(fs.readFileSync(root+'/releases/'+release+'/manifest.json'));
const source=fs.readFileSync(path.resolve(root,'..',spec.modules.find(x=>x.module_id==='mvu').path),'utf8');
const code=source.slice(source.indexOf('const ShrineFieldSpec ='),source.indexOf('// Install before importing the core:'));
const schema=source.slice(source.indexOf('  const Schema = ')+2,source.indexOf('\n  bootstrapCommitted=true;'));
const {C,initial}=vm.runInNewContext(code+'\n'+schema+'\nShrineCard.installZodSchema(Schema);({C:ShrineCard,initial:ShrineInitial})',{z,console});
const clone=x=>JSON.parse(JSON.stringify(x)),equal=(a,b)=>assert.deepEqual(clone(a),clone(b));
let handler;const warnings=[];
const start=source.indexOf("eventOn('mag_variable_update_ended',"),end=source.indexOf('\n\nlet migrationEpoch',start);
vm.runInNewContext(source.slice(start,end),{eventOn:(name,fn)=>handler=fn,owns:()=>true,ShrineCard:C,dispatchShrineMvuStatus(){},warnUpdate:e=>warnings.push(e.message)});
function candidate(s,type,outfit='shrine'){
 const n=clone(s);n.玩家.衣装=outfit;n.巴卫.心情='看过本轮选中的衣装';
 if(type)n.记录.事件.push({编号:'E'+(s.记录.事件.length+1),类型:type,摘要:'玩家明确选择并实际换上已拥有衣装',对象:'player',来源:'正文',方式:'',资源:'无',数量:0,耗力:0,天数:0});
 return n;
}
function handled(s,n){const old={stat_data:clone(s),schema:{},display_data:clone(s)},vars={stat_data:clone(n),schema:{},delta_data:{changed:true}};handler(vars,old);equal(old.stat_data,s);return vars;}
function refused(s,n,pattern){assert.throws(()=>C.validate(n,s),pattern);const v=handled(s,n);equal(v.stat_data,s);equal(v.delta_data,{});}
if(legacy){refused(initial,candidate(initial,'日常'),/玩家设定需明确选择事件/);assert.equal(handled(initial,candidate(initial,'设定')).stat_data.玩家.衣装,'shrine');console.log('PASS baseline: daily player outfit update rolls back, setting saves');process.exit(0);}
for(const type of ['日常','设定']){
 let s=clone(initial);
 for(const outfit of ['shrine','work','daily']){
  const before=JSON.stringify(s),n=candidate(s,type,outfit),valid=C.validate(n,s),actual=handled(s,n).stat_data;
  equal(actual,valid);assert.equal(actual.玩家.衣装,outfit);assert.equal(actual.巴卫.心情,n.巴卫.心情);
  equal(actual.神社,s.神社);equal(actual.生活,s.生活);equal(actual.关系,s.关系);equal(actual.衣橱,s.衣橱);equal(actual.环境,s.环境);
  assert.equal(actual.记录.事件.length,s.记录.事件.length+1);assert.equal(JSON.stringify(s),before);s=actual;
 }
}
const settings={称呼:'测试称呼',身份:'修缮合作者',发型:'short',发色:'black',肤色:'fair',瞳色:'blue',配饰:'ribbon',居住选择:'另行商定'};
for(const [key,value] of Object.entries(settings)){
 const n=candidate(initial,'日常');n.玩家[key]=value;refused(initial,n,/玩家设定需明确选择事件/);
 const yes=candidate(initial,'设定');yes.玩家[key]=value;assert.equal(handled(initial,yes).stat_data.玩家[key],value);
 const alone=clone(n);alone.玩家.衣装=initial.玩家.衣装;refused(initial,alone,/玩家设定需明确选择事件/);
}
const mode=candidate(initial,'日常');mode.事件调度.模式='关闭';refused(initial,mode,/玩家设定需明确选择事件/);
for(const type of ['关系','规划',null])refused(initial,candidate(initial,type),/玩家衣装更换需/);
refused(initial,candidate(initial,'日常','festival'),/尚未解锁/);
refused(initial,candidate(initial,'设定','festival'),/尚未解锁/);
refused(initial,candidate(initial,'日常','unknown-outfit'));
const duplicate=candidate(initial,'日常');duplicate.记录.事件.push(clone(duplicate.记录.事件[0]));refused(initial,duplicate);
equal(C.validate(clone(initial),initial).玩家,initial.玩家);
const sourceCard=JSON.parse(fs.readFileSync(root+'/releases/'+release+'/card-source.json'));
const rule=sourceCard.data.character_book.entries.find(e=>e.id===1).content;
assert(rule.includes('仅衣装变化可用设定或日常事件'));assert(!rule.includes('沿参道抵达山脚村'));assert(!rule.includes('妖怪横丁与河岸路线可用'));
assert(rule.includes('沿樱坂通学路抵达宇庭高校外'));assert(rule.includes('妖怪横丁与夜森神社开放'));
for(const m of spec.modules){const s=sourceCard.data.extensions.tavern_helper.scripts.find(s=>s.id===m.script_id);assert.equal(s.name.match(/\d+\.\d+\.\d+/)[0],m.version);}
console.log('PASS actual update handler: daily/setting outfit saves, other settings and mode remain guarded, no resource/time/affinity effect, locked/unknown/no-event/wrong-event/duplicate updates roll back atomically; names/examples align');
