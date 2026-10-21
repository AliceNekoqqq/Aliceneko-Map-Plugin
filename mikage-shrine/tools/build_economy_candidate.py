"""Prepare a new font-complete checkpoint from the economic maintenance source."""
import argparse,copy,hashlib,json,re
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'releases/1.49.4'
dump=lambda x:json.dumps(x,ensure_ascii=False,indent=2)+'\n'
sha=lambda x:hashlib.sha256(x.encode()).hexdigest()
def build(asset_commit):
    assert re.fullmatch('[0-9a-f]{40}',asset_commit)
    plan=json.loads((OUT/'plan.json').read_text());base=ROOT/'releases'/plan['base'];spec=json.loads((base/'manifest.json').read_text())
    font=json.loads((ROOT/'assets/ui/economy-kozuchi-v1494-font.json').read_text());assert hashlib.sha256((ROOT.parent/font['file']).read_bytes()).hexdigest()==font['sha256']
    card=json.loads((base/'card-source.json').read_text());assert sha(dump(card))==spec['source_sha256']
    card['character_version']=card['data']['character_version']=plan['version'];book=card['data']['character_book'];book['description']=book['description'].replace('v'+plan['base'],'v'+plan['version'])
    outputs={'card-source.json':dump(card),'life-config.json':(base/'life-config.json').read_text()}
    url='https://cdn.jsdelivr.net/gh/'+spec['repository']+'@'+asset_commit+'/'+font['file']
    css='\n<style data-font-supplement="economy-kozuchi-v1494">'+''.join('@font-face{font-family:"'+family+'";src:url("'+url+'");font-style:normal;font-weight:100 900;font-display:swap;unicode-range:'+font['unicode_range']+'}' for family in ['Mikage Serif','Mikage Shrine Serif'])+'</style>\n'
    for module in spec['modules']:
        if module['module_id'] not in ['mvu','panels']:continue
        text=(ROOT.parent/module['path']).read_text();assert sha(text)==module['sha256']
        before="const version = '"+module['version']+"';";assert text.count(before)==1;text=text.replace(before,"const version = '"+plan['version']+"';",1)
        if module['module_id']=='panels':
            match=re.search(r'const MikagePanelHTML=("(?:[^"\\]|\\.)*");',text);html=json.loads(match[1]);assert html.count('</head>')==1
            html=html.replace('</head>',css+'</head>',1);outputs['wardrobe-panel.html']=html
            text=text[:match.start(1)]+json.dumps(html,ensure_ascii=False)+text[match.end(1):]
        outputs[module['module_id']+'.mjs']=text;module.update(version=plan['version'],path='mikage-shrine/releases/'+plan['version']+'/'+module['module_id']+'.mjs',sha256=sha(text))
    spec.update(release=plan['version'],source_name=plan['version']+'/card-source.json',source_sha256=sha(outputs['card-source.json']))
    spec['ema_integration']['bound_worldbook']['version']=plan['version'];spec['reviewed_copy']['preserved_worldbook_version']=plan['version']
    spec['checkpoint']={'base':plan['base'],'plan':'mikage-shrine/releases/1.49.4/plan.json','gate':'candidate','font_asset_commit':asset_commit,'font':font,'gameplay':'unchanged from 1.49.3','real_host':'pending'}
    spec['bound_worldbook']={'logical_id':'mikage-shrine:character_book','attachment':'/data/character_book','source':'mikage-shrine/releases/1.49.4/card-source.json','version':plan['version'],'name':book['name'],'entry_ids':[e['id'] for e in book['entries']],'entry_sha256':sha(dump(book['entries'])),'standalone_companion':False}
    spec['runtime_dependencies']={'primary_card_type':'MVU Zod hybrid','capabilities':['embedded-worldbook','EJS','JSONPatch-events','embedded-regex','five-remote-script-loaders','iframe-panels','external-media'],'host_required':['SillyTavern','Tavern Helper script/browser APIs','Prompt Template EJS execution'],'embedded_required':{'regex_ids':[r['id'] for r in card['data']['extensions']['regex_scripts']],'helper_ids':[s['id'] for s in card['data']['extensions']['tavern_helper']['scripts']],'initial_data':'/data/extensions/tavern_helper/variables','worldbook':'/data/character_book'},'remote_runtime':['five manifest modules','schema and validator in mvu module','MagVarUpdate@54be11b09f21b1c4266e2d54b6f1ba9a3598db05/artifact/bundle.js','zod@4.1.12/+esm fallback if compatible host z is absent','pinned images and fonts'],'regional_selection':{'policy':'sequential URL fallback inside each loader, one successful start','module_hosts':['cdn.jsdelivr.net','testingcf.jsdelivr.net','raw.githubusercontent.com'],'mvu_hosts':['testingcf.jsdelivr.net','fastly.jsdelivr.net'],'zod_hosts':['testingcf.jsdelivr.net','cdn.jsdelivr.net'],'separate_region_script_pair':False},'development_only':['local zod/ejs fixtures','simulated host','browser screenshots','independent full-unlock test copy']}
    outputs['manifest.json']=dump(spec);return outputs
if __name__=='__main__':
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('--asset-commit',required=True);p.add_argument('--dry-run',action='store_true');a=p.parse_args();outputs=build(a.asset_commit)
    assert not any((OUT/k).exists() for k in outputs),'Fresh output files required'
    if not a.dry_run:
        for k,v in outputs.items():(OUT/k).write_text(v)
    print(dump({'dry_run':a.dry_run,'outputs':{k:{'bytes':len(v.encode()),'sha256':sha(v)} for k,v in outputs.items()}}))
