"""Apply the author's approved 77 text edits to the exact active 1.48.1 modules.

All transformations carry reversible source offsets. Historical modules and
paused development sources are never overwritten. --dry-run writes nothing.
"""
from pathlib import Path
import argparse,copy,hashlib,json,re
from fontTools.ttLib import TTFont
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'releases/1.48.2'
BASE=ROOT/'releases/1.48.1'
VERSION='1.48.2'
sha=lambda b:hashlib.sha256(b).hexdigest()
dump=lambda x:json.dumps(x,ensure_ascii=False,indent=2)+'\n'


def ranges(values):
    result=[]
    for n in sorted(set(values)):
        if result and n==result[-1][1]+1:result[-1][1]=n
        else:result.append([n,n])
    return ','.join('U+%X'%a+('-%X'%b if a!=b else '') for a,b in result)


def build(asset_commit):
    assert re.fullmatch('[0-9a-f]{40}',asset_commit)
    spec=json.loads((BASE/'manifest.json').read_text())
    edits=json.loads((OUT/'copy-edits.json').read_text())
    assert len(edits)==77 and len({e['id'] for e in edits})==77
    font_meta=json.loads((ROOT/'assets/ui/copy-reviewed-v1482-font.json').read_text())
    font=ROOT.parent/font_meta['file'];assert sha(font.read_bytes())==font_meta['sha256']
    cmap=TTFont(font).getBestCmap()
    assert not {ord(c) for e in edits for c in e['new'] if ord(c)>=0x3400}-set(cmap)
    url='https://cdn.jsdelivr.net/gh/AliceNekoqqq/Aliceneko-Map-Plugin@'+asset_commit+'/'+font_meta['file']
    new_range=ranges(ord(c) for e in edits for c in e['new'] if ord(c)>=0x3400)
    css='\n/* Approved-copy glyph coverage; existing font families and layout retained. */\n'+''.join('@font-face{font-family:"'+name+'";src:url("'+url+'");unicode-range:'+new_range+';font-display:swap;font-weight:100 900}' for name in ['Mikage Serif','Mikage Shrine Serif','Mikage Map Desk','Mikage Canon'])+'\n'
    modules={m['module_id']:m for m in spec['modules']}
    bodies={};operations={};counts={e['id']:0 for e in edits};outputs={}
    for name in ['minigames','panels','scene']:
        module=modules[name];text=(ROOT.parent/module['path']).read_text();assert sha(text.encode())==module['sha256']
        original=text;ops=[]
        def replace(old,new,kind,edit_id=''):
            nonlocal text
            assert text.count(old)==1,(name,kind,edit_id,text.count(old))
            start=text.index(old);text=text[:start]+new+text[start+len(old):]
            ops.append({'kind':kind,'id':edit_id,'start':start,'old':old,'new':new})
        for edit in edits:
            assert sha(edit['old'].encode())==edit['old_sha256']
            assert not re.search('[\x27"`\\\\\r\n]',edit['old']+edit['new']),'Quoted text needs a serialized-literal adapter'
            if edit['old'] in text:
                replace(edit['old'],edit['new'],'approved-copy',edit['id']);counts[edit['id']]+=1
        if name=='minigames':
            for symbol in ['GAME','SCHOOL','MARKET','PLUM','DRESS','WIND','STEALTH','FOX']:
                old=re.search(r'^const '+symbol+r'_FONT_URL\s*=.*;$',text,re.M)[0]
                replace(old,'const '+symbol+'_FONT_URL='+json.dumps(url)+';','font-url')
            old=re.search(r'^const GAME_FONT_RANGE = .*;$',text,re.M)[0]
            replace(old,'const GAME_FONT_RANGE = '+json.dumps(ranges(cmap))+';','font-range')
        else:
            label='MikagePanelHTML' if name=='panels' else 'StatusbarHTML'
            match=re.search(r'^const '+label+r'\s*=\s*("(?:[^"\\]|\\.)*");$',text,re.M)
            assert match,label
            html=json.loads(match[1]);assert html.count('</style>')>=1
            html=html.replace('</style>',css+'</style>',1)
            replace(match[0],'const '+label+'='+json.dumps(html,ensure_ascii=False)+';','font-face')
            outputs['life-panel.html' if name=='panels' else 'statusbar.html']=html
        if name=='scene':
            match=re.search(r'^  const catalog=(.*);$',text,re.M);catalog=json.loads(match[1])
            key='assets/ui/copy-reviewed-v1482.ttf'
            catalog['assets'][key]=url;catalog['fontFallbacks'].append({'file':key,'unicodeRange':new_range})
            replace(match[0],'  const catalog='+json.dumps(catalog,ensure_ascii=False,separators=(',',':'))+';','font-catalog')
        old="const version = '"+module['version']+"';"
        replace(old,"const version = '1.48.2';",'release-version')
        outputs[name+'.mjs']=text;bodies[name]=text;operations[name]=ops
        module.update(version=VERSION,path='mikage-shrine/releases/'+VERSION+'/'+name+'.mjs',sha256=sha(text.encode()))
        # Full reverse reconstruction proves there are no other code edits.
        check=text
        for op in reversed(ops):
            assert check[op['start']:op['start']+len(op['new'])]==op['new']
            check=check[:op['start']]+op['old']+check[op['start']+len(op['new']):]
        assert check==original
    assert all(n==1 for n in counts.values()),counts
    card=json.loads((BASE/'card-source.json').read_text());card['character_version']=card['data']['character_version']=VERSION
    outputs['card-source.json']=dump(card)
    spec.update(release=VERSION,source_name='1.48.2/card-source.json',source_sha256=sha(outputs['card-source.json'].encode()),host_acceptance='pending',
                worldbook_policy='Exact 1.48.1 worldbook reused, including external Ema narrative; no rule, schema, initial-state or wardrobe changes',
                reviewed_copy={'approved_edits':len(edits),'unique_occurrences':sum(counts.values()),'asset_commit':asset_commit,'font':font_meta,'preserved_worldbook_version':'1.48.1','input_sha256':json.loads((OUT/'input-check.json').read_text())['input_sha256']})
    outputs['manifest.json']=dump(spec);outputs['transformations.json']=dump(operations)
    return outputs


if __name__=='__main__':
    ap=argparse.ArgumentParser(description=__doc__);ap.add_argument('--asset-commit',required=True);ap.add_argument('--dry-run',action='store_true');args=ap.parse_args()
    outputs=build(args.asset_commit)
    if not args.dry_run:
        assert not any((OUT/name).exists() for name in outputs),'Refusing to overwrite an output'
        for name,text in outputs.items():(OUT/name).write_text(text)
    print(dump({'dry_run':args.dry_run,'files':{k:{'bytes':len(v.encode()),'sha256':sha(v.encode())} for k,v in outputs.items()}}))
