"""Apply reviewed prose spans while preserving the 1.49.6 executable contracts."""
import argparse,copy,hashlib,json,re
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'releases/1.49.7'
dump=lambda x:json.dumps(x,ensure_ascii=False,indent=2)+'\n'
sha=lambda s:hashlib.sha256(s.encode()).hexdigest()
def once(s,old,new):
    assert s.count(old)==1,(old[:80],s.count(old))
    return s.replace(old,new,1)
def build():
    plan=json.loads((OUT/'plan.json').read_text());edits=json.loads((OUT/'changes.json').read_text());base=ROOT/'releases'/plan['base']
    spec=json.loads((base/'manifest.json').read_text());original=(base/'card-source.json').read_text()
    assert sha(original)==edits['base_source_sha256']==spec['source_sha256']
    card=json.loads(original);before=copy.deepcopy(card)
    get=lambda c,id:next(e for e in c['data']['character_book']['entries'] if e['id']==id)
    for op in edits['operations']:
        target=get(card,op['entry_id']) if 'entry_id' in op else card['data']
        field='content' if 'entry_id' in op else op['field']
        target[field]=once(target[field],op['old'],op['new'])
    # The template source and technical tags/markers are not writing material.
    for e in card['data']['character_book']['entries']:
        old=get(before,e['id'])
        assert {k:v for k,v in e.items() if k!='content'}=={k:v for k,v in old.items() if k!='content'}
        for pattern in [r'<%[\s\S]*?%>',r'</?[A-Za-z_][A-Za-z_0-9]*>',r'【固定规则，不参与润色】[^\n]*']:
            assert re.findall(pattern,e['content'])==re.findall(pattern,old['content']),(e['id'],pattern)
    mod=next(m for m in spec['modules'] if m['module_id']=='panels');panel=(ROOT.parent/mod['path']).read_text();assert sha(panel)==mod['sha256']
    m=re.search(r'const MikageQuestPrompt=("(?:[^"\\]|\\.)*");',panel);assert m
    assert json.loads(m[1])==get(before,56)['content']
    panel=panel[:m.start(1)]+json.dumps(get(card,56)['content'],ensure_ascii=False)+panel[m.end(1):]
    panel=once(panel,"const version = '"+mod['version']+"';","const version = '"+plan['version']+"';")
    mod.update(version=plan['version'],path='mikage-shrine/releases/'+plan['version']+'/panels.mjs',sha256=sha(panel))
    card['character_version']=card['data']['character_version']=plan['version'];book=card['data']['character_book']
    book['description']=once(book['description'],'v'+plan['base'],'v'+plan['version'])
    outputs={'card-source.json':dump(card),'panels.mjs':panel}
    spec.update(release=plan['version'],source_name=plan['version']+'/card-source.json',source_sha256=sha(outputs['card-source.json']))
    spec['ema_integration']['bound_worldbook']['version']=plan['version'];spec['reviewed_copy']['preserved_worldbook_version']=plan['version']
    spec['bound_worldbook'].update(source='mikage-shrine/releases/'+plan['version']+'/card-source.json',version=plan['version'],entry_sha256=sha(dump(book['entries'])))
    spec['checkpoint'].update(base=plan['base'],plan='mikage-shrine/releases/'+plan['version']+'/plan.json',gate='source_iteration',gameplay='unchanged; model-facing prose and generator prompt refined',packaging='not requested')
    spec['prose_review']={'changes':'mikage-shrine/releases/'+plan['version']+'/changes.json','reviewed_entries':len(edits['reviewed_entries']),'changed_entries':[r['id'] for r in edits['reviewed_entries'] if r['changed']],'mes_example':'six revised examples','generator':'actual MikageQuestPrompt equals maintenance entry56','panel_html':'byte-identical','runtime_logic':'prompt literal and version only; all executable logic unchanged','real_host_and_model':'pending','packaging':'not requested'}
    outputs['manifest.json']=dump(spec)
    return outputs
if __name__=='__main__':
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('--dry-run',action='store_true');args=p.parse_args();outputs=build()
    if not args.dry_run:
        assert not any((OUT/k).exists() for k in outputs),'Fresh output files required'
        for k,v in outputs.items():(OUT/k).write_text(v)
    print(dump({'dry_run':args.dry_run,'outputs':{k:{'bytes':len(v.encode()),'sha256':sha(v)} for k,v in outputs.items()}}))
