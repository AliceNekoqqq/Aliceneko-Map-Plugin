"""Integrate the two verified review component checkpoints into a new card source."""
import argparse,json,hashlib,re
from pathlib import Path
r=Path(__file__).resolve().parents[1];out=r/'releases/1.49.26'
dump=lambda x:json.dumps(x,ensure_ascii=False,indent=2)+'\n'
sha=lambda x:hashlib.sha256(x.encode()).hexdigest()
s=(r/'releases/1.49.23/card-source.json').read_text();m=json.loads((r/'releases/1.49.23/manifest.json').read_text());assert sha(s)==m['source_sha256']
c=json.loads(s);book=c['data']['character_book'];entries=dump(book['entries'])
updates={'panels':('1.49.25','releases/1.49.25/panels.mjs','38631587aac1ea5f6b6875ee488d30d21132b9a2271111a860e4fe95af53f480'),'tomoe':('0.1.1','releases/1.49.24/tomoe.mjs','49137f4c57aa38eba2f2d9c955b1d49e93a6c9ad5016a9fb7e8a6d72111ca34b')}
for mod in m['modules']:
 if mod['module_id'] in updates:
  version,p,h=updates[mod['module_id']];assert sha((r/p).read_text())==h
  mod.update(version=version,path='mikage-shrine/'+p,sha256=h)
  script=next(x for x in c['data']['extensions']['tavern_helper']['scripts'] if x['id']==mod['script_id'])
  script['name']=re.sub(r'\d+\.\d+\.\d+',version,script['name'],count=1)
c['character_version']=c['data']['character_version']='1.49.26'
c['data']['creator_notes']=c['data']['creator_notes'].replace('v1.49.23','v1.49.26')
book['description']=book['description'].replace('v1.49.23','v1.49.26')
assert dump(book['entries'])==entries
outputs={'card-source.json':dump(c),'creator-notes.md':c['data']['creator_notes']}
m.update(release='1.49.26',source_name='1.49.26/card-source.json',source_sha256=sha(outputs['card-source.json']))
m['ema_integration']['bound_worldbook']['version']='1.49.26';m['reviewed_copy']['preserved_worldbook_version']='1.49.26'
m['bound_worldbook'].update(source='mikage-shrine/releases/1.49.26/card-source.json',version='1.49.26',entry_sha256=sha(entries))
m['creator_notes'].update(source='mikage-shrine/releases/1.49.26/creator-notes.md',sha256=sha(outputs['creator-notes.md']))
m['checkpoint'].update(base='1.49.23',plan='mikage-shrine/releases/1.49.26/plan.json',gate='checkpoint_package',gameplay='R23-01 portrait CORS and R23-02 stale generation fence',packaging='user requested integration',real_host='pending')
m['component_integration']={'resolved':['R23-01','R23-02'],'pending':['R23-03','R23-04'],'conditional':'V23-01'}
outputs['manifest.json']=dump(m)
p=argparse.ArgumentParser();p.add_argument('--dry-run',action='store_true');a=p.parse_args();assert all(not (out/n).exists() for n in outputs)
if not a.dry_run:
 for n,t in outputs.items():(out/n).write_text(t)
print(dump({'dry_run':a.dry_run,'outputs':{n:sha(t) for n,t in outputs.items()}}))
