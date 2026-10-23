const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const {z}=require((process.env.MIKAGE_DEBUG_DEPS||'/tmp/mikage-debug/node_modules')+'/zod');
const root=path.resolve(__dirname,'..'),release=process.argv[2]||'1.49.19',legacy=process.argv.includes('--expect-legacy-placeholders');
const clone=x=>JSON.parse(JSON.stringify(x)),equal=(a,b)=>assert.deepEqual(clone(a),clone(b));
function load(version){
 const spec=JSON.parse(fs.readFileSync(root+'/releases/'+version+'/manifest.json'));
 const source=fs.readFileSync(path.resolve(root,'..',spec.modules.find(x=>x.module_id==='mvu').path),'utf8');
 const code=source.slice(source.indexOf('const ShrineFieldSpec ='),source.indexOf('// Install before importing the core:'));
 const schema=source.slice(source.indexOf('  const Schema = ')+2,source.indexOf('\n  bootstrapCommitted=true;'));
 return {...vm.runInNewContext(code+'\n'+schema+'\nShrineCard.installZodSchema(Schema);({C:ShrineCard,initial:ShrineInitial,Schema})',{z,console}),spec,source};
}
const {C,initial,Schema,spec,source}=load(release),data=JSON.parse(fs.readFileSync(root+'/releases/1.49.19/main-stories.json')).stories;
function ready(level){const s=clone(initial);s.主线.已完成=C.config.stages.slice(0,level-1).map(x=>({编号:x.mainId}));
 for(let i=1;i<=2;i++)s.记录.完成委托.push({编号:'fixture-'+level+'-'+i,快照:{...clone(initial.委托),编号:'fixture-'+level+'-'+i,性质:'普通',材料档:level,阶段:'收束',结算档位:'完整'}});
 C.deriveProgress(s);assert.equal(s.进度.阶段完成数,2);assert(Schema.safeParse(s).success);return s;}
function event(s,type,id){return {编号:'E'+(s.记录.事件.length+1),类型:type,摘要:'本轮实际悬起或查访特殊绘马',对象:id,来源:'正文',方式:'',资源:'无',数量:0,耗力:0,天数:0};}
function reveal(s){const n=clone(s);n.记录.事件.push(event(s,'主线显现',s.主线.当前章));return {n,result:C.validate(n,s)};}
let handler;const warnings=[];
const start=source.indexOf("eventOn('mag_variable_update_ended',"),end=source.indexOf('\n\nlet migrationEpoch',start);
vm.runInNewContext(source.slice(start,end),{eventOn:(name,fn)=>handler=fn,owns:()=>true,ShrineCard:C,dispatchShrineMvuStatus(){},warnUpdate:e=>warnings.push(e.message)});
function handled(s,n){const previous={stat_data:clone(s),schema:{},display_data:clone(s)},vars={stat_data:clone(n),schema:{},delta_data:{changed:true}};handler(vars,previous);equal(previous.stat_data,s);return vars;}
if(legacy){for(let level=1;level<=5;level++){const s=ready(level),{n,result}=reveal(s),row=result.绘马板.绘马.at(-1);assert.equal(row.心愿,'一枚带有岔路纹样的绘马，等待你与巴卫一起查看。');assert.equal(row.祈愿人,'神社的特别来信');assert(Object.values(row.幕后).every(v=>v===''));equal(handled(s,n).stat_data,result);}console.log('PASS legacy actual handler: all five special ema share placeholder wish/person and six empty backstage fields');process.exit(0);}
const panelSource=fs.readFileSync(path.resolve(root,'..',spec.modules.find(x=>x.module_id==='panels').path),'utf8');
const a=panelSource.indexOf('  function visible(s){'),b=panelSource.indexOf('\n  function appearance(',a);
const memorySource=panelSource.slice(panelSource.indexOf('function outfitMemory(state)'),panelSource.indexOf('function nameOutfitState('));
const visible=vm.runInNewContext(memorySource+'\n'+panelSource.slice(a,b)+'\nvisible',{clone,engine:()=>C});
const book=JSON.parse(fs.readFileSync(root+'/releases/'+release+'/card-source.json')).data.character_book.entries;
for(const field of ['委托','绘马板'])assert(book.find(e=>e.id===4).content.includes('format_message_variable::stat_data.'+field),'existing state projection must retain story carrier');
const template=book.find(e=>e.id===54).content,ejs=require('/tmp/mikage-debug/node_modules/ejs');
const render=s=>ejs.render(template,{runType:'generate',lastMessageId:0,getvar:()=>clone(s)});
for(let level=1;level<=5;level++){
 const s=ready(level),before=JSON.stringify(s),{n,result}=reveal(s),row=result.绘马板.绘马.at(-1),story=data[level-1];
 equal(handled(s,n).stat_data,result);assert.equal(JSON.stringify(s),before);assert(Schema.safeParse(result).success);
 for(const key of Object.keys(story))if(key!=='补充说明')equal(row[key],story[key]);
 assert.equal(row.标题,C.config.mainTitles[level-1]);assert(row.补充说明.includes(story.补充说明));assert(row.补充说明.includes(C.config.stages[level-1].facility+'修缮至4'));
 assert.equal(row.材料档,level);assert.equal(row.性质,'主线');assert.equal(row.状态,'未接');assert(C.config.regions.find(r=>r.id===row.地区).stage<=level);
 assert(Object.values(row.幕后).every(x=>typeof x==='string'&&x.trim().length&&x.length<=300));assert.notEqual(row.幕后.路径一,row.幕后.路径二);
 assert(Object.values(row.奖励).every(v=>v===0));assert.equal(result.委托.编号,'');equal(result.神社,s.神社);equal(result.关系,s.关系);equal(result.地图,s.地图);equal(result.生活,s.生活);
 const ui=visible(result),publicRow=ui.绘马板.绘马.at(-1);assert(!Object.hasOwn(publicRow,'幕后'));assert.equal(publicRow.心愿,story.心愿);assert(!Object.hasOwn(ui.委托,'幕后'));equal(result,C.validate(clone(result),result));
 const repeated=clone(result);repeated.记录.事件.push(event(result,'主线显现',row.编号));assert.throws(()=>C.validate(repeated,result),/已出现/);equal(handled(result,repeated).stat_data,result);
 let active=C.action(result,'acceptEma',{id:row.编号});equal(active.委托.幕后,row.幕后);assert.equal(active.委托.诉求,story.心愿);assert.equal(active.委托.阶段,'受理');
 const frozen=JSON.stringify(active),out=render(active);assert(out.includes('[当前主线：'+row.编号));assert.equal(JSON.stringify(active),frozen);
 for(const other of data.filter(x=>x.编号!==row.编号))assert(!out.includes(other.心愿),'EJS must not inject other chapter seeds');
 active=C.action(active,'pauseEma',{id:row.编号});assert.equal(active.委托.编号,'');equal(active.记录.暂停委托.at(-1).快照.幕后,story.幕后);
 active=C.action(active,'resumeEma',{id:row.编号});equal(active.委托.幕后,story.幕后);assert.equal(active.委托.诉求,story.心愿);
 row.幕后.矛盾='one candidate mutated outside runtime';equal(reveal(ready(level)).result.绘马板.绘马.at(-1).幕后,story.幕后);
}
const old=load('1.49.18');
for(let level=1;level<=5;level++){
 const s=ready(level),n=clone(s);n.记录.事件.push(event(s,'主线显现',s.主线.当前章));let prior=old.C.validate(n,s);
 for(const state of [prior,old.C.action(prior,'acceptEma',{id:s.主线.当前章}),old.C.action(old.C.action(prior,'acceptEma',{id:s.主线.当前章}),'pauseEma',{id:s.主线.当前章})]){
  const frozen=JSON.stringify(state);equal(C.validate(clone(state),state),old.C.validate(clone(state),state));assert.equal(JSON.stringify(state),frozen);
 }
 const active=old.C.action(prior,'acceptEma',{id:s.主线.当前章}),paused=old.C.action(active,'pauseEma',{id:s.主线.当前章});
 equal(C.action(paused,'resumeEma',{id:s.主线.当前章}),old.C.action(paused,'resumeEma',{id:s.主线.当前章}));
}
let archived=ready(1);archived.神社.鸟居=4;const revealOld=clone(archived);revealOld.记录.事件.push(event(archived,'主线显现','M01'));
archived=old.C.action(old.C.validate(revealOld,archived),'acceptEma',{id:'M01'});
for(const type of ['查访','商议','行动','结案']){const n=clone(archived);n.委托.阶段=type==='结案'?'收束':type;if(type==='结案'){n.委托.结果='旧版已实际完成的主线回应';n.委托.结算档位='完整';}n.记录.事件.push(event(archived,type,'M01'));archived=old.C.validate(n,archived);}
const kept=C.validate(clone(archived),archived);equal(kept.记录.完成委托,archived.记录.完成委托);assert.equal(kept.记录.完成委托.at(-1).快照.诉求,'一枚带有岔路纹样的绘马，等待你与巴卫一起查看。');
const early=clone(initial);assert.throws(()=>reveal(early),/门槛/);
assert.equal(data.length,5);assert.equal(new Set(data.map(s=>s.心愿)).size,5);
console.log('PASS five real reveal handlers, story/schema/type/region/budget/unchanged mechanics, no auto-accept or mutation, repeat/early reveal rejection, hidden UI projection, active EJS read-only routing, pause/resume, clone isolation and old candidate/active/paused save parity');
