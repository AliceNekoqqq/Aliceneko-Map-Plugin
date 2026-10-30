"""Guarded 1.49.27 source derivation for R23-03 and R23-04."""
import argparse,json,hashlib,re
from pathlib import Path
r=Path(__file__).resolve().parents[1];out=r/'releases/1.49.27'
dump=lambda x:json.dumps(x,ensure_ascii=False,indent=2)+'\n'
sha=lambda s:hashlib.sha256(s.encode()).hexdigest()
ops=[]
def edit(s,old,new,target):
 assert s.count(old)==1,(target,old)
 ops.append({'target':target,'old':old,'new':new});return s.replace(old,new,1)
m=json.loads((r/'releases/1.49.26/manifest.json').read_text());src=(r/'releases/1.49.26/card-source.json').read_text();assert sha(src)==m['source_sha256'];c=json.loads(src)
mods={x['module_id']:x for x in m['modules']};texts={}
for id in ['mvu','panels']:
 x=mods[id];s=(r.parent/x['path']).read_text();assert sha(s)==x['sha256'];texts[id]=s
helper="  function nextEventId(state,offset=0){\n    let max=0n;\n    for(const row of state.记录.事件){const match=/^E(\\d+)$/.exec(row.编号);if(match){const n=BigInt(match[1]);if(n>max)max=n;}}\n    return 'E'+(max+1n+BigInt(offset));\n  }\n"
s=texts['mvu'];s=edit(s,'  function validate(candidate,previous,intent={}){',helper+'  function validate(candidate,previous,intent={}){','mvu')
s=edit(s,"assert(event.编号==='E'+(p.记录.事件.length+1),'衣装购买事件编号须连续');","assert(event.编号===nextEventId(p),'衣装购买事件编号须连续');",'mvu')
s=edit(s,"if(newEvents.length===2)for(let i=0;i<2;i++)assert(newEvents[i].编号==='E'+(p.记录.事件.length+i+1),'结案与解锁呈现事件编号必须连续');","for(let i=0;i<newEvents.length;i++)assert(newEvents[i].编号===nextEventId(p,i),'新事件编号须接续已有最大序号');",'mvu')
s=edit(s,"const s=clone(previous),n=s.记录.事件.length+1;\n    const e={编号:'E'+n,","const s=clone(previous),eventId=nextEventId(s);\n    const e={编号:eventId,",'mvu')
s=edit(s,"ShrineLifeRuntime.runAction(s,payload,'E'+n)","ShrineLifeRuntime.runAction(s,payload,eventId)",'mvu')
s=edit(s,'return {validate,checkFields,schema,','return {nextEventId,validate,checkFields,schema,','mvu')
texts['mvu']=edit(s,"const version = '1.49.23';","const version = '1.49.27';",'mvu')
s=texts['panels'];s=edit(s,"event='E'+(next.记录.事件.length+1)","event=api.nextEventId(previous)",'panels');texts['panels']=edit(s,"const version = '1.49.25';","const version = '1.49.27';",'panels')
book=c['data']['character_book'];entries={e['id']:e for e in book['entries']}
def entry(id,old,new):entries[id]['content']=edit(entries[id]['content'],old,new,'entry'+str(id))
entry(1,'编号按记录.事件长度连续生成E1、E2……。','编号取记录.事件中已有E数字编号的最大序号加一；空记录从E1开始，双事件顺序加一。当前编号采用动态提示；历史编号及其关联引用保持原样。')
entry(54,'事件编号用当前事件数量+1','事件编号采用下方本轮事件编号提示的首号')
entry(54,'编号依当前回顾.事件数量连续使用E数量+1和E数量+2','编号采用下方本轮事件编号提示的首号与次号')
# Identical phrases occur in two separate pending-reward branches.
s=entries[54]['content'];old='编号为E(回顾.事件数量+1)';assert s.count(old)==2
for _ in range(2):
 idx=s.index(old);s=s[:idx]+s[idx:].replace(old,'编号采用下方本轮事件编号提示的首号',1)
entries[54]['content']=s
entry(54,'var donationDay=emaState.环境?.天数;',"var emaMaxEvent=0n;(emaState.记录?.事件||[]).forEach(function(row){var match=/^E(\\d+)$/.exec(row.编号);if(match&&BigInt(match[1])>emaMaxEvent)emaMaxEvent=BigInt(match[1]);}); var donationDay=emaState.环境?.天数;")
entry(54,'【当日额外奉纳】','【本轮事件编号】首号E<%-String(emaMaxEvent+1n)%>；仅结案附带解锁呈现时使用次号E<%-String(emaMaxEvent+2n)%>。\n【当日额外奉纳】')
entry(77,'银白长发采用本套衣装描述','发型采用当前衣装的外观描述')
for id,text in texts.items():
 x=mods[id];x.update(version='1.49.27',path='mikage-shrine/releases/1.49.27/'+id+'.mjs',sha256=sha(text))
 for script in c['data']['extensions']['tavern_helper']['scripts']:
  if script['id']==x['script_id']:script['name']=re.sub(r'\d+\.\d+\.\d+','1.49.27',script['name'],count=1)
c['character_version']=c['data']['character_version']='1.49.27';c['data']['creator_notes']=c['data']['creator_notes'].replace('v1.49.26','v1.49.27');book['description']=book['description'].replace('v1.49.26','v1.49.27')
outputs={'card-source.json':dump(c),'creator-notes.md':c['data']['creator_notes'],**{k+'.mjs':v for k,v in texts.items()}}
m.update(release='1.49.27',source_name='1.49.27/card-source.json',source_sha256=sha(outputs['card-source.json']))
m['ema_integration']['bound_worldbook']['version']='1.49.27';m['reviewed_copy']['preserved_worldbook_version']='1.49.27';m['bound_worldbook'].update(source='mikage-shrine/releases/1.49.27/card-source.json',version='1.49.27',entry_sha256=sha(dump(book['entries'])));m['creator_notes'].update(source='mikage-shrine/releases/1.49.27/creator-notes.md',sha256=sha(outputs['creator-notes.md']));m['checkpoint'].update(base='1.49.26',plan='mikage-shrine/releases/1.49.27/plan.json',gameplay='event numbering and hair consistency',real_host='pending');m['component_integration'].update(resolved=['R23-01','R23-02','R23-03','R23-04'],pending=[])
outputs['manifest.json']=dump(m);outputs['changes.json']=dump(ops)
p=argparse.ArgumentParser();p.add_argument('--dry-run',action='store_true');a=p.parse_args();assert all(not(out/n).exists() for n in outputs)
if not a.dry_run:
 for n,t in outputs.items():(out/n).write_text(t)
print(dump({'dry_run':a.dry_run,'outputs':{n:sha(t) for n,t in outputs.items()}}))
