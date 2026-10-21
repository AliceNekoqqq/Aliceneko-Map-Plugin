"""Deduplicate model-facing protocol without changing EJS, runtime modules or loading."""
import argparse,copy,hashlib,json,re
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'releases/1.49.10'
dump=lambda x:json.dumps(x,ensure_ascii=False,indent=2)+'\n'
sha=lambda s:hashlib.sha256(s.encode()).hexdigest()
def once(s,old,new):
    assert s.count(old)==1,(old[:70],s.count(old))
    return s.replace(old,new,1)
def build():
    plan=json.loads((OUT/'plan.json').read_text());edits=json.loads((OUT/'changes.json').read_text());base=ROOT/'releases'/plan['base']
    spec=json.loads((base/'manifest.json').read_text());original=(base/'card-source.json').read_text()
    assert sha(original)==edits['base_source_sha256']==spec['source_sha256']
    card=json.loads(original);before=copy.deepcopy(card)
    get=lambda c,id:next(e for e in c['data']['character_book']['entries'] if e['id']==id)
    for op in edits['operations']:
        entry=get(card,op['entry_id']);entry['content']=once(entry['content'],op['old'],op['new'])
    for e in card['data']['character_book']['entries']:
        old=get(before,e['id'])
        assert {k:v for k,v in e.items() if k!='content'}=={k:v for k,v in old.items() if k!='content'}
        for pattern in ([r'<%[\s\S]*?%>'] if e['id']==1 else [r'<%[\s\S]*?%>',r'</?[A-Za-z_][A-Za-z_0-9]*>']):
            assert re.findall(pattern,e['content'])==re.findall(pattern,old['content']),(e['id'],pattern)
    card['character_version']=card['data']['character_version']=plan['version'];book=card['data']['character_book']
    book['description']=once(book['description'],'v'+plan['base'],'v'+plan['version'])
    outputs={'card-source.json':dump(card)}
    spec.update(release=plan['version'],source_name=plan['version']+'/card-source.json',source_sha256=sha(outputs['card-source.json']))
    spec['ema_integration']['bound_worldbook']['version']=plan['version'];spec['reviewed_copy']['preserved_worldbook_version']=plan['version']
    spec['bound_worldbook'].update(source='mikage-shrine/releases/'+plan['version']+'/card-source.json',version=plan['version'],entry_sha256=sha(dump(book['entries'])))
    spec['checkpoint'].update(base=plan['base'],plan='mikage-shrine/releases/'+plan['version']+'/plan.json',gate='source_iteration',gameplay='prompt protocol deduplicated; gameplay and executable logic unchanged',packaging='not requested')
    spec['prompt_dedup']={'changes':'mikage-shrine/releases/'+plan['version']+'/changes.json','entries':sorted({op['entry_id'] for op in edits['operations']}),'runtime':'all five module paths/hashes unchanged','EJS_and_loading':'unchanged','examples':'eight original patch arrays plus festival invitation preserved; one shared envelope','memory':'shared record format; original per-category quotas preserved; no scene-loading change','real_host_and_model':'pending','packaging':'not requested'}
    outputs['manifest.json']=dump(spec);return outputs
if __name__=='__main__':
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('--dry-run',action='store_true');args=p.parse_args();outputs=build()
    if not args.dry_run:
        assert not any((OUT/k).exists() for k in outputs),'Fresh outputs required'
        for k,v in outputs.items():(OUT/k).write_text(v)
    print(dump({'dry_run':args.dry_run,'outputs':{k:{'bytes':len(v.encode()),'sha256':sha(v)} for k,v in outputs.items()}}))
