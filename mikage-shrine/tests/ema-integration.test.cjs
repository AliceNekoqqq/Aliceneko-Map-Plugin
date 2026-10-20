const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),dir=path.join(root,'releases/1.48.1');
const {z}=require((process.env.MIKAGE_DEBUG_DEPS||'/tmp/mikage-debug/node_modules')+'/zod');
const source=fs.readFileSync(dir+'/mvu.mjs','utf8'),base=fs.readFileSync(root+'/releases/1.30.1/mvu.mjs','utf8');
const clone=x=>JSON.parse(JSON.stringify(x));
function engine(text){
 const code=text.slice(text.indexOf('const ShrineFieldSpec ='),text.indexOf('// Install before importing the core:'));
 const schema=text.slice(text.indexOf('  const Schema = ')+2,text.indexOf('\n  bootstrapCommitted=true;'));
 return vm.runInNewContext(code+'\n'+schema+'\nShrineCard.installZodSchema(Schema);({ShrineCard,ShrineConfig,ShrineInitial,ShrineTemplates,ShrineFieldSpec,Schema})',{z,console});
}
const E=engine(source),old=engine(base),{ShrineCard:C,ShrineConfig:cfg,ShrineInitial:init,ShrineTemplates:templates}=E;
const entry=(card,id)=>card.data.character_book.entries.find(e=>e.id===id);
const card=JSON.parse(fs.readFileSync(dir+'/card-source.json')),prior=JSON.parse(fs.readFileSync(root+'/releases/1.48.0/card-source.json'));
assert.deepEqual(clone(init),clone(old.ShrineInitial),'initial data preserved');
assert.deepEqual(clone(templates),clone(old.ShrineTemplates),'templates preserved');
C.checkFields(clone(init));
const oldAccepted=old.ShrineCard.action(clone(init),'acceptEma',{id:'EMA-1'});
const oldPaused=old.ShrineCard.action(oldAccepted,'pauseEma',{id:'EMA-1'});
for(const save of [init,oldAccepted,oldPaused])assert.equal(C.normalizeLegacyState(clone(save)).changed,false,'old saves require no migration');
assert.equal(C.action(clone(oldPaused),'resumeEma',{id:'EMA-1'}).委托.类型,oldAccepted.委托.类型);
const synthetic=(type,n)=>({标题:'测试心愿'+n,祈愿人:'测试来客'+n,来客类型:'人类',类型:type,地区:'R01',心愿:'查明旧物来历，并听取当事人的意见。'+n,补充说明:'自动检查夹具',幕后:Object.fromEntries(Object.keys(templates['绘马板.绘马'].幕后).map(k=>[k,'测试内容'+k]))});
function stageState(level){const s=clone(init);s.绘马板.绘马=[];s.主线.已完成=cfg.stages.slice(0,level-1).map(c=>({编号:c.mainId}));C.deriveProgress(s);C.checkFields(s);return s;}
function advance(s,phase,type){const next=clone(s);next.委托.阶段=phase;if(phase==='收束'){next.委托.结果='当事人确认这次调查已结束。';next.委托.结算档位='完整';}next.记录.事件.push({编号:'E'+(s.记录.事件.length+1),类型:type,摘要:'自动测试阶段事实',对象:s.委托.编号,来源:'',方式:'',资源:'无',数量:0,耗力:0,天数:0});return C.validate(next,s);}
let n=0;
for(const stage of cfg.stages)for(const type of stage.types){
 const start=stageState(stage.level),before=JSON.stringify(start),item=synthetic(type,++n);
 let s=C.action(start,'refreshBoard',{generated:{绘马:[item]}});assert.equal(s.委托.编号,'');assert.deepEqual(clone(s.神社),clone(start.神社));
 const row=s.绘马板.绘马.find(r=>r.标题===item.标题),id=row.编号;
 s=C.action(s,'acceptEma',{id});assert.equal(s.委托.类型,type);assert.equal(s.委托.阶段,'受理');assert.throws(()=>C.action(s,'acceptEma',{id}));
 s=C.action(s,'pauseEma',{id});assert.equal(s.记录.暂停委托[0].快照.类型,type);assert.equal(s.委托.类型,'无');
 s=C.action(s,'resumeEma',{id});assert.equal(s.委托.类型,type);assert.equal(s.记录.暂停委托.length,0);
 for(const [phase,event] of [['查访','查访'],['商议','商议'],['行动','行动'],['收束','结案']])s=advance(s,phase,event);
 assert.equal(s.记录.完成委托[0].快照.类型,type);assert.equal(s.绘马板.绘马.find(r=>r.编号===id).状态,'已完成');
 for(const [resource,amount] of Object.entries(stage.reward))assert.equal(s.神社[resource]-start.神社[resource],amount,'reward once, '+type+' '+resource);
 C.checkFields(s);C.normalizeLegacyState(s);const settled=clone(s);s=advance(s,'休整','休整');assert.deepEqual(clone(s.神社),clone(settled.神社));
 assert.equal(JSON.stringify(start),before,'previous state immutable');
 assert.throws(()=>C.normalizeCandidates({绘马:[{...item,类型:'不存在的类型'}]},start));
 assert.throws(()=>C.normalizeCandidates({绘马:[{...item,奖励:{木材:999}}]},start));
}
// Actual old schema is a negative fixture: board generation accepts the new type,
// but legacy active/archive enums must fail. This detects the original regression.
const accepted=C.action(C.action(stageState(1),'refreshBoard',{generated:{绘马:[synthetic(cfg.stages[0].types[0],999)]}}),'acceptEma',{id:'EMA-3'});
assert.equal(old.Schema.safeParse(accepted).success,false);
assert.throws(()=>old.ShrineCard.checkFields(accepted));
assert.deepEqual(entry(card,5),entry(prior,5),'player boundary entry preserved');
assert.equal(entry(card,34).content,fs.readFileSync(dir+'/incoming/ema-rules.md','utf8'),'incoming narrative verbatim');
const panels=fs.readFileSync(dir+'/panels.mjs','utf8'),oldPanels=fs.readFileSync(root+'/releases/1.47.0/panels.mjs','utf8');
const prompt=JSON.parse(panels.match(/^const MikageQuestPrompt=(.*);$/m)[1]);
assert.equal(prompt,fs.readFileSync(dir+'/incoming/active-prompt.md','utf8'));assert.equal(entry(card,56).content,prompt);
assert.equal(panels.match(/^const MikagePanelHTML=(.*);$/m)[1],oldPanels.match(/^const MikagePanelHTML=(.*);$/m)[1],'entire UI byte-identical');
for(const e of prior.data.character_book.entries)if(![1,34,55,56].includes(e.id))assert.deepEqual(entry(card,e.id),e,'unrelated worldbook '+e.id);
for(const id of [1,55])for(const row of E.ShrineFieldSpec.filter(x=>x.path.endsWith('.类型')&&x.enum?.includes('红线结缘'))){
 const line=entry(card,id).content.split('\n').find(l=>l.startsWith(row.path+' |'));
 if(id===1&&row.path!=='委托.类型')continue;assert(line?.includes('红线结缘'),row.path+' dictionary');
}
assert.deepEqual(card.data.extensions.regex_scripts,prior.data.extensions.regex_scripts);
assert.deepEqual(card.data.extensions.tavern_helper.variables,prior.data.extensions.tavern_helper.variables);
for(const kind of ['scene','minigames','tomoe']){const a=JSON.parse(fs.readFileSync(dir+'/manifest.json')).modules.find(x=>x.module_id===kind),b=JSON.parse(fs.readFileSync(root+'/releases/1.48.0/manifest.json')).modules.find(x=>x.module_id===kind);assert.deepEqual(a,b);}
console.log('PASS '+n+' chapter/type full lifecycles with actual Zod 4 schema: generate/accept/pause/resume/settle, fixed rewards, legacy saves, negative fixtures, exact incoming copy, stable worldbook IDs, UI/scene/wardrobe/regex/initial parity');
