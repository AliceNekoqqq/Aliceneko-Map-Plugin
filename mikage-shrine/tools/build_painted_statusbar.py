#!/usr/bin/env python3
"""Painted art substrate with live scene/text/control slots, derived from immutable 1.41.0."""
from pathlib import Path
import argparse,json,re,hashlib
ROOT=Path(__file__).resolve().parents[1]
VERSION='1.42.0'
def once(s,a,b):
 if s.count(a)!=1:raise ValueError('Nonunique anchor '+a[:90])
 return s.replace(a,b,1)
def build(commit):
 if not re.fullmatch('[0-9a-f]{40}',commit):raise ValueError('Immutable asset commit required')
 base=ROOT/'releases/1.41.0';scene=(base/'scene.mjs').read_text();m=re.search(r'const StatusbarHTML=("(?:[^"\\]|\\.)*");',scene);html=json.loads(m[1]);url=f'https://cdn.jsdelivr.net/gh/AliceNekoqqq/Aliceneko-Map-Plugin@{commit}/mikage-shrine/assets/ui/veranda-v142-skin.webp'
 def art(y,h):return f'<svg class="skin-art" viewBox="0 {y} 1024 {h}" preserveAspectRatio="none" aria-hidden="true"><image href="{url}" width="1024" height="1536"/></svg>'
 html,n=re.subn(r'<style id="veranda-v141-style">.*?</style>','',html,count=1,flags=re.S);assert n==1
 html,n=re.subn(r'<svg class="eave-art".*?</svg>',lambda _:art(0,208),html,count=1,flags=re.S);assert n==1
 html=once(html,'<div class="scene" id="scene"','<div class="skin-map skin-segment">'+art(208,530)+'<div class="scene" id="scene"')
 html=once(html,'<section class="veranda-dialogue"','</div><section class="veranda-dialogue"')
 mood=re.search(r'<span id="mood"[^>]*>.*?</span>',html)[0];html=html.replace(mood,'',1);html=once(html,'<div class="scene-shade"',mood+'<div class="scene-shade"')
 html=once(html,'aria-label="巴卫与庭院小记">','aria-label="巴卫与庭院小记">'+art(738,94))
 html=once(html,'<nav class="scene-dock" aria-label="神社随身手帖">','<nav class="scene-dock" aria-label="神社随身手帖">'+art(830,396))
 html,n=re.subn(r'<span class="dock-art" aria-hidden="true">.*?</span>','',html,flags=re.S);assert n==6
 html=once(html,'<div class="growth">','<div class="skin-status skin-segment">'+art(1226,124)+'<div class="growth">')
 html=once(html,'<div class="scene-tools">','</div><div class="scene-tools">'+art(1350,120))
 html=once(html,'<p class="torii-watermark">','<p class="torii-watermark">'+art(1470,66))
 html=html.replace('</head>','<style id="painted-v142-style">'+(ROOT/'src/painted-statusbar.css').read_text()+'</style></head>',1)
 scene=scene[:m.start(1)]+json.dumps(html,ensure_ascii=False)+scene[m.end(1):];scene=once(scene,"const version = '1.41.0';","const version = '1.42.0';")
 card=json.loads((base/'card-source.json').read_text());card['character_version']=card['data']['character_version']=VERSION
 for script in card['data']['extensions']['tavern_helper']['scripts']:
  if script['id']=='f763b9d7-c17c-5f0f-b0bd-36d9f37a3383':script['name']='御影神社·绘饰檐下 '+VERSION+' CDN';script['info']='整幅绘制材质底板嵌入真实地图与可点击控件；对话空闲折叠，保留标签避让和底部时间预览。'
 spec=json.loads((base/'manifest.json').read_text());spec.update(release=VERSION,source_name='1.41.0/card-source.json',source_sha256=hashlib.sha256((base/'card-source.json').read_bytes()).hexdigest(),painted={'asset_commit':commit,'source':'src/painted-statusbar.css + tools/build_painted_statusbar.py','host_acceptance':'pending','state':'existing readers and handlers; no new formal writes','skin_windows':[[0,208],[208,530],[738,94],[830,396],[1226,124],[1350,120],[1470,66]]})
 for module in spec['modules']:
  if module['module_id']=='scene':module.update(version=VERSION,path='mikage-shrine/releases/'+VERSION+'/scene.mjs',sha256=hashlib.sha256(scene.encode()).hexdigest())
 return {'scene.mjs':scene,'statusbar.html':html,'card-source.json':json.dumps(card,ensure_ascii=False,indent=2)+'\n','manifest.json':json.dumps(spec,ensure_ascii=False,indent=2)+'\n'}
if __name__=='__main__':
 ap=argparse.ArgumentParser(description=__doc__);ap.add_argument('--asset-commit',required=True);ap.add_argument('--dry-run',action='store_true');a=ap.parse_args();out=build(a.asset_commit);print(json.dumps({'release':VERSION,'dry_run':a.dry_run,'outputs':{k:len(v.encode()) for k,v in out.items()}}))
 if not a.dry_run:
  d=ROOT/'releases'/VERSION;d.mkdir(exist_ok=True)
  for k,v in out.items():(d/k).write_text(v)
