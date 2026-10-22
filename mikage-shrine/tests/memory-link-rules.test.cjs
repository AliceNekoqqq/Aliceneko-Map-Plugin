const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),dir=root+'/releases/1.49.11',read=p=>fs.readFileSync(p,'utf8'),json=p=>JSON.parse(read(p)),clone=x=>JSON.parse(JSON.stringify(x)),sha=s=>crypto.createHash('sha256').update(s).digest('hex');
const base=json(root+'/releases/1.49.10/card-source.json'),card=json(dir+'/card-source.json'),before=json(root+'/releases/1.49.10/manifest.json'),spec=json(dir+'/manifest.json'),edits=json(dir+'/changes.json');
const get=(c,id)=>c.data.character_book.entries.find(e=>e.id===id),replay=clone(base);
assert.equal(sha(read(root+'/releases/1.49.10/card-source.json')),edits.base_source_sha256);
assert.equal(edits.operations.length,1);assert.equal(edits.operations[0].entry_id,49);
for(const op of edits.operations){const e=get(replay,op.entry_id);assert.equal(e.content.split(op.old).length-1,1);e.content=e.content.replace(op.old,op.new);}
replay.character_version=replay.data.character_version='1.49.11';replay.data.character_book.description=replay.data.character_book.description.replace('v1.49.10','v1.49.11');assert.deepEqual(replay,card);
assert.deepEqual(spec.modules,before.modules);for(const m of spec.modules)assert.equal(sha(fs.readFileSync(path.resolve(root,'..',m.path))),m.sha256);
assert.equal(sha(read(dir+'/card-source.json')),spec.source_sha256);assert.equal(sha(JSON.stringify(card.data.character_book.entries,null,2)+'\n'),spec.bound_worldbook.entry_sha256);
assert.deepEqual(card.data.character_book.entries.filter(e=>e.content!==get(base,e.id).content).map(e=>e.id),[49]);
assert.deepEqual({...get(card,49),content:''},{...get(base,49),content:''});
assert.deepEqual(get(card,49).content.match(/<\/?[A-Za-z_][A-Za-z_0-9]*>/g),get(base,49).content.match(/<\/?[A-Za-z_][A-Za-z_0-9]*>/g));
assert(get(card,1).content.includes('每个事件最多一条摘要'));assert(get(card,49).content.includes('沿共同经历通则选取最相关的类别与摘要格式'));
const active=card.data.character_book.entries.filter(e=>e.enabled).map(e=>e.content).join('\n');assert(!active.includes('分别引用同一主要事件'));
console.log('PASS one-sentence replay; all other card fields, loading settings and five module hashes preserved');
// Existing suite also checks the 31 outfit mappings, 77 approved prose edits and 11 EJS templates.
process.env.MIKAGE_SHOP_RELEASE='1.49.11';const {C,initial}=require('./moonforest-shop.test.cjs');
const source=read(path.resolve(root,'..',spec.modules.find(m=>m.module_id==='mvu').path));
const start=source.indexOf("eventOn('mag_variable_update_ended',"),end=source.indexOf('\n\nlet migrationEpoch',start);assert(start>=0&&end>start);
let handler;const warnings=[];
vm.runInNewContext(source.slice(start,end),{eventOn:(name,fn)=>handler=fn,owns:()=>true,ShrineCard:C,dispatchShrineMvuStatus:()=>{},warnUpdate:error=>warnings.push(error.message)});
const previous=clone(initial),frozen=JSON.stringify(previous),beforeVars={stat_data:clone(previous),schema:{},display_data:clone(previous)};
function candidate(memories){const n=clone(previous);n.关系.亲近=1;n.记录.事件.push({编号:'E1',类型:'日常',摘要:'两人协作收好修缮工具',对象:'',来源:'正文',方式:'',资源:'无',数量:0,耗力:0,天数:0});n.记录.共同经历.push(...memories);return {stat_data:n,schema:{},delta_data:{changed:true}};}
const selected={编号:'E1',摘要:'【衣装记忆·tomoe·usual】在回廊收好工具时，巴卫挽起了常服袖口。'};
const duplicate=candidate([{编号:'E1',摘要:'【相处·能力】两人协作收好工具。'},selected]);
handler(duplicate,beforeVars);assert(warnings.at(-1).includes('列表编号重复：记录.共同经历'));assert.deepEqual(clone(duplicate.stat_data),previous);assert.deepEqual(clone(duplicate.delta_data),{});
const valid=candidate([selected]);handler(valid,beforeVars);assert.equal(warnings.length,1);assert.equal(valid.stat_data.关系.亲近,1);assert.equal(valid.stat_data.记录.共同经历.length,1);assert.equal(valid.stat_data.记录.事件.length,1);assert.equal(valid.stat_data.记录.共同经历[0].编号,'E1');
assert.equal(JSON.stringify(previous),frozen);assert.deepEqual(beforeVars.stat_data,previous);
console.log('PASS actual update-ended handler: duplicate event summaries roll back the complete transaction; selected summary and affinity update persist together; prior snapshot untouched');
