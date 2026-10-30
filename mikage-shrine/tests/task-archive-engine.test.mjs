import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';import {createRequire}from'node:module';
import {collectTasks,reconcileArchives}from'../src/task-archive-core.mjs';
const require=createRequire(import.meta.url),{z}=require((process.env.MIKAGE_DEBUG_DEPS||'/tmp/mikage-debug/node_modules')+'/zod');
const source=fs.readFileSync(new URL('../releases/1.49.27/mvu.mjs',import.meta.url),'utf8'),code=source.slice(source.indexOf('const ShrineFieldSpec ='),source.indexOf('// Install before importing the core:')),schema=source.slice(source.indexOf('  const Schema = ')+2,source.indexOf('\n  bootstrapCommitted=true;'));
const {C,initial}=vm.runInNewContext(code+'\n'+schema+'\nShrineCard.installZodSchema(Schema);({C:ShrineCard,initial:ShrineInitial})',{z,console});
const clone=x=>JSON.parse(JSON.stringify(x));let s=clone(initial),rows=[];
for(let i=1;i<=2;i++)s.记录.完成委托.push({编号:'fixture'+i,快照:{...clone(initial.委托),编号:'fixture'+i,性质:'普通',材料档:1,阶段:'收束',结算档位:'完整'}});s.神社.鸟居=4;C.deriveProgress(s);
function capture(text){rows.push({id:rows.length,swipe:0,role:'assistant',text,state:clone(s)});}
function step(type,object,change=()=>{}){const n=clone(s);change(n);n.记录.事件.push({编号:C.nextEventId(s),类型:type,摘要:'实际发生的'+type,对象:object,来源:'正文',方式:'',资源:'无',数量:0,耗力:0,天数:0});s=C.validate(n,s);capture(type);}
step('主线显现','M01');s=C.action(s,'acceptEma',{id:'M01'});capture('实际接取M01');
for(const stage of ['查访','商议','行动'])step(stage,'M01',n=>n.委托.阶段=stage);
const eventId=C.nextEventId(s);step('结案','M01',n=>{n.委托.阶段='收束';n.委托.结算档位='完整';n.委托.结果='保留旧路牌作窝，实际补设指示，收到早川回应';});
const data={task_id:'M01',event_id:eventId,choice:'保留旧路牌作窝',result:'另设指示，早川确认了方向',effects:['小狸留在旧窝'],unresolved:['雨天路况待实际回访'],people:['早川','小狸'],places:['御影神社'],known_by:['巴卫','早川','小狸']};
rows.at(-1).text+='<MikageTaskArchive>'+JSON.stringify(data)+'</MikageTaskArchive>';
const before=JSON.stringify(rows),result=reconcileArchives(collectTasks(rows));assert.equal(result.active.length,1);assert.equal(result.active[0].eventId,eventId);assert.equal(JSON.stringify(rows),before);assert.equal(s.主线.已完成.at(-1).编号,'M01');
const wrong=clone(rows);wrong.at(-1).state=clone(rows.at(-2).state);assert.equal(reconcileArchives(collectTasks(wrong)).active.length,0,'正文宣称结案而领域状态拒绝时不归档');
const edit=clone(rows);edit[3].text='实际改为迁窝';assert.equal(reconcileArchives(collectTasks(edit),result.records).active.length,0);
console.log('PASS actual Shrine domain engine -> task archive integration: main reveal, UI acceptance, three phases, legal settlement, preserved gameplay state, rejected closure and changed-source invalidation');
