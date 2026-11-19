#!/usr/bin/env python3
"""Build the independent, self-contained reading module; preserve all other card scripts."""
import argparse, hashlib, json, re
from pathlib import Path

ROOT=Path(__file__).resolve().parents[2]
SCRIPT_ID='942e5145-090d-52b2-8e13-455609375d17'
VERSION='1.1.4'
CARD_VERSION='1.49.47'
MODULE_PATH=f'mikage-shrine/releases/reading-{VERSION}/reading.mjs'

def digest(body):return hashlib.sha256(body).hexdigest()

def build_module():
    src=ROOT/'mikage-shrine/src'
    text=(src/'reading.mjs').read_text()
    for key,name in [('__HOST_CSS__','reading.css'),('__FRAME_CSS__','reading-frames.css')]:
        needle="'"+key+"'"
        if text.count(needle)!=1:raise ValueError('Template drift: '+key)
        text=text.replace(needle,json.dumps((src/name).read_text(),ensure_ascii=False),1)
    if text.count("'__TIME_SCENES__'")!=1:raise ValueError('Template drift: time scenes')
    text=text.replace("'__TIME_SCENES__'",json.dumps(json.loads((src/'time-scenes.json').read_text())['R01'],ensure_ascii=False))
    if text.count('// __UNLOCK_NOTES__')!=1:raise ValueError('Template drift: unlock notes')
    text=text.replace('// __UNLOCK_NOTES__',(src/'unlock-notes.js').read_text().rstrip())
    return text.encode()

def component(commit,module):
    if not re.fullmatch('[0-9a-f]{40}',commit):raise ValueError('Immutable commit required')
    text=(ROOT/'mikage-shrine/tools/loader-template.js').read_text()
    for key,value in {'__COMMIT__':commit,'__SCRIPT_ID__':'reading','__MODULE_PATH__':MODULE_PATH,'__VERSION__':VERSION,'__SHA256__':digest(module),'__LABEL__':'御影神社·正文美化'}.items():text=text.replace(key,value)
    return {'type':'script','enabled':True,'name':f'御影神社·正文美化 {VERSION} CDN','id':SCRIPT_ID,'content':text,
            'info':'和纸正文、夜读与字号设置，开场题图和状态栏共用主题；仅改变显示，不改原文、变量与世界书。独立组件已在角色卡中启用时，无需重复导入。',
            'button':{'enabled':True,'buttons':[{'name':'正文阅读设置','visible':True},{'name':'重新加载资源','visible':True}]},
            'data':{},'export_with':{'data':False,'button':True}}

def main():
    ap=argparse.ArgumentParser(description=__doc__)
    ap.add_argument('--commit');ap.add_argument('--card',type=Path);ap.add_argument('--out',type=Path,required=True);ap.add_argument('--dry-run',action='store_true')
    args=ap.parse_args();body=build_module()
    files={'reading.mjs':body,'manifest.json':(json.dumps({'version':VERSION,'script_id':SCRIPT_ID,'module_id':'reading','sha256':digest(body),'bytes':len(body),'source':['src/reading.mjs','src/reading.css','src/reading-frames.css','src/time-scenes.json','src/unlock-notes.js'],'runtime':'Tavern Helper character script; unlock notes read the Mikage MVU runtime','stateWrites':False},ensure_ascii=False,indent=2)+'\n').encode()}
    if args.commit:
        script=component(args.commit,body);files['mikage-reading.json']=(json.dumps(script,ensure_ascii=False,indent=2)+'\n').encode()
        if args.card:
            card=json.loads(args.card.read_text());scripts=card['data']['extensions']['tavern_helper']['scripts']
            matches=[i for i,s in enumerate(scripts) if s.get('id')==SCRIPT_ID]
            if len(matches)>1:raise ValueError('Duplicate reading components')
            if matches:
                scripts[matches[0]].update({k:script[k] for k in ('name','content')})
            else:scripts.append(script)
            card['character_version']=CARD_VERSION;card['data']['character_version']=CARD_VERSION
            packed=(json.dumps(card,ensure_ascii=False,indent=2)+'\n').encode()
            if b';base64,' in packed.lower() or len(packed)>512*1024:
                raise ValueError('Lightweight card budget exceeded or Base64 embedded')
            if any(len(s.get('content','').encode())>16*1024 for s in scripts):
                raise ValueError('Expected small remote loaders in lightweight card')
            files['card.json']=packed
    if args.out.exists():raise ValueError('Use a fresh output directory')
    if not args.dry_run:
        args.out.mkdir(parents=True)
        for name,content in files.items():(args.out/name).write_bytes(content)
    print(json.dumps({'dry_run':args.dry_run,'files':{k:len(v)for k,v in files.items()},'module_sha256':digest(body)},ensure_ascii=False))

if __name__=='__main__':main()
