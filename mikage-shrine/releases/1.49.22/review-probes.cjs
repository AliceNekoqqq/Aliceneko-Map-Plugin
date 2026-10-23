// Read-only reproduction of newly identified issues; no host or source writes.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const {z}=require((process.env.MIKAGE_DEBUG_DEPS||'/tmp/mikage-debug/node_modules')+'/zod');
const root=path.resolve(__dirname,'../..');
const spec=JSON.parse(fs.readFileSync(__dirname+'/manifest.json'));
const card=JSON.parse(fs.readFileSync(root+'/cards/巴卫_御影神社_v1.49.22_六项审查修复版.json'));
const source=fs.readFileSync(path.resolve(root,'..',spec.modules.find(x=>x.module_id==='mvu').path),'utf8');
const code=source.slice(source.indexOf('const ShrineFieldSpec ='),source.indexOf('// Install before importing the core:'));
const schema=source.slice(source.indexOf('  const Schema = ')+2,source.indexOf('\n  bootstrapCommitted=true;'));
const {C,initial}=vm.runInNewContext(code+'\n'+schema+'\nShrineCard.installZodSchema(Schema);({C:ShrineCard,initial:ShrineInitial})',{z,console});
const clone=x=>JSON.parse(JSON.stringify(x));
let handler;const warnings=[];
const start=source.indexOf("eventOn('mag_variable_update_ended',"),end=source.indexOf('\n\nlet migrationEpoch',start);
vm.runInNewContext(source.slice(start,end),{eventOn:(name,fn)=>handler=fn,owns:()=>true,ShrineCard:C,dispatchShrineMvuStatus(){},warnUpdate:e=>warnings.push(e.message)});
const rule=card.data.character_book.entries.find(e=>e.id===1).content;
assert(rule.includes('更衣需设定或日常事件'));
const outcomes={};
for(const type of ['日常','设定']){
 const n=clone(initial);n.玩家.衣装='shrine';n.巴卫.心情='已确认本轮穿着选择';
 n.记录.事件.push({编号:'E1',类型:type,摘要:'玩家明确选择并实际换上已拥有的巫女值勤服',对象:'player',来源:'正文',方式:'',资源:'无',数量:0,耗力:0,天数:0});
 const vars={stat_data:clone(n),schema:{},delta_data:{changed:true}},previous={stat_data:clone(initial),schema:{},display_data:clone(initial)};
 handler(vars,previous);
 assert.deepEqual(clone(previous.stat_data),clone(initial));
 if(type==='日常'){
  assert.deepEqual(clone(vars.stat_data),clone(initial));assert.deepEqual(clone(vars.delta_data),{});
  assert(warnings.includes('玩家设定需明确选择事件'));
  outcomes[type]={clothing:vars.stat_data.玩家.衣装,mood:vars.stat_data.巴卫.心情,result:'whole update rolled back',warning:warnings.at(-1)};
 }else{
  assert.equal(vars.stat_data.玩家.衣装,'shrine');assert.equal(vars.stat_data.巴卫.心情,n.巴卫.心情);
  outcomes[type]={clothing:vars.stat_data.玩家.衣装,result:'saved'};
 }
}
const regions=Object.fromEntries(C.config.regions.map(x=>[x.id,x.name]));
assert(rule.includes('沿参道抵达山脚村')&&regions.R02==='宇庭高校');
assert(rule.includes('妖怪横丁与河岸路线可用'));
const reward=C.config.wardrobeRewards.find(x=>x.id==='U02');
assert.equal(reward.regions.join(','),'R03,R04');assert(reward.condition.includes('夜森神社'));
const labelDrift=[];
for(const module of spec.modules){
 const script=card.data.extensions.tavern_helper.scripts.find(s=>s.id===module.script_id);
 const labelVersion=(script.name.match(/\d+\.\d+\.\d+/)||[])[0];
 if(labelVersion!==module.version)labelDrift.push({module:module.module_id,labelVersion,actualVersion:module.version});
}
assert.equal(labelDrift.length,4);
console.log(JSON.stringify({findings_reproduced:3,playerClothing:outcomes,geography:{R02:regions.R02,R04:regions.R04,U02:reward.condition},scriptLabelDrift:labelDrift},null,2));
