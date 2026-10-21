#!/usr/bin/env python3
"""1.43 cosmetic board layers and feedback over immutable 1.42.0."""
import argparse,json,re,hashlib
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
VERSION='1.43.0'
def once(s,a,b):
 if s.count(a)!=1:raise ValueError('Nonunique anchor: '+a[:90])
 return s.replace(a,b,1)
def build(commit):
 if not re.fullmatch('[0-9a-f]{40}',commit):raise ValueError('Immutable asset commit required')
 base=ROOT/'releases/1.42.0';scene=(base/'scene.mjs').read_text();m=re.search(r'const StatusbarHTML=("(?:[^"\\]|\\.)*");',scene);html=json.loads(m[1])
 prefix=f'https://cdn.jsdelivr.net/gh/AliceNekoqqq/Aliceneko-Map-Plugin@{commit}/mikage-shrine/assets/ui/'
 skin=prefix+'veranda-v143-empty.webp';atlas=prefix+'veranda-v143-objects.webp'
 html,n=re.subn(r'https://cdn\.jsdelivr\.net/gh/AliceNekoqqq/Aliceneko-Map-Plugin@[0-9a-f]{40}/mikage-shrine/assets/ui/veranda-v142-skin\.webp',lambda _:skin,html);assert n==7
 # The regenerated empty plate has haze in its map hole. Keep the proven alpha-zero
 # 1.42 map frame rather than putting any regenerated pixels over the live scene.
 old_frame='https://cdn.jsdelivr.net/gh/AliceNekoqqq/Aliceneko-Map-Plugin@e748f48300630ba8eb4223f51bae2dd311fd539a/mikage-shrine/assets/ui/veranda-v142-skin.webp'
 html,n=re.subn(r'(<div class="skin-map skin-segment"><svg class="skin-art".*?</svg>)',lambda match:match[1].replace(skin,old_frame),html,count=1,flags=re.S);assert n==1
 boxes={'bell':[152,38,155,400],'map':[447,90,419,332],'ema':[917,99,404,290],'wardrobe':[1338,117,410,284],'life':[29,532,376,275],'journal':[479,484,387,346],'buildings':[901,471,414,358],'fox':[1402,528,285,258]}
 def sprite(kind):
  x,y,w,h=boxes[kind];key='board-sprite-'+kind
  return f'<span class="board-sprite" data-board-sprite="{kind}" aria-hidden="true"><svg viewBox="{x} {y} {w} {h}" preserveAspectRatio="xMidYMid meet"><defs><clipPath id="{key}"><rect x="{x}" y="{y}" width="{w}" height="{h}"/></clipPath></defs><image href="{atlas}" width="1774" height="887" clip-path="url(#{key})"/></svg></span>'
 for id,kind in {'map':'map','ema':'ema','wardrobe':'wardrobe','life':'life','journal-button':'journal','buildings':'buildings'}.items():
  html,n=re.subn(r'(<button class="dock-button" id="'+id+r'"[^>]*>)',lambda match:match[1]+sprite(kind),html,count=1);assert n==1
 toys='<button type="button" class="board-toy" id="board-bell" data-board-toy="bell" aria-label="轻摇狐铃">'+sprite('bell')+'</button><button type="button" class="board-toy" id="board-cherry" data-board-toy="cherry" aria-label="轻触樱枝，落下花瓣"></button>'
 html,n=re.subn(r'(<header class="game-hud">.*?)(</header>)',lambda match:match[1]+toys+match[2],html,count=1,flags=re.S);assert n==1
 html=once(html,'</p></main>','<button type="button" class="board-toy" id="board-fox" data-board-toy="fox" aria-label="轻点折纸狐，让它跳一跳">'+sprite('fox')+'</button></p><div id="board-fx" aria-hidden="true"></div><div id="board-feedback" role="status" aria-live="polite" hidden></div></main>')
 # Each lower tool face moves as a real illustrated layer, not only its caption.
 html=once(html,'<div class="scene-tools"><svg class="skin-art" viewBox="0 1350 1024 120"','<div class="scene-tools"><svg class="skin-art" viewBox="0 1204 1024 22"')
 faces={'moment':[30,1361,229,86],'paths':[277,1361,209,86],'wander':[500,1361,208,86],'lantern':[725,1361,258,86]}
 templates=[]
 for id,(x,y,w,h) in faces.items():
  key='board-face-'+id;face=f'<i class="board-tool-face" data-for="{id}" aria-hidden="true"><svg viewBox="{x} {y} {w} {h}" preserveAspectRatio="none"><image href="{skin}" width="1024" height="1536"/></svg></i>';templates.append(face)
  html,n=re.subn(r'(<button id="'+id+r'"[^>]*>)',lambda match:match[1]+face,html,count=1);assert n==1
 html=once(html,'<div id="board-fx"','<template id="board-face-templates">'+''.join(templates)+'</template><div id="board-fx"')
 html=html.replace('</head>','<style id="board-v143-style">'+(ROOT/'src/board-interaction.css').read_text()+'</style></head>',1)
 html=once(html,'function dispose(){if(disposed)return;disposed=true;','function dispose(){if(disposed)return;window.MikageBoardToy?.dispose();disposed=true;')
 html=html.replace('</body>','<script>'+ (ROOT/'src/board-interaction.js').read_text().replace('</script','<\\/script')+'</script></body>',1)
 scene=scene[:m.start(1)]+json.dumps(html,ensure_ascii=False)+scene[m.end(1):];scene=once(scene,"const version = '1.42.0';","const version = '1.43.0';")
 card=json.loads((base/'card-source.json').read_text());card['character_version']=card['data']['character_version']=VERSION
 for script in card['data']['extensions']['tavern_helper']['scripts']:
  if script['id']=='f763b9d7-c17c-5f0f-b0bd-36d9f37a3383':script['name']='御影神社·会回应的神社棋盘 '+VERSION+' CDN';script['info']='十个入口完整按压与状态反馈；分层实物动作、狐铃、樱枝、折纸狐；不推进剧情或消耗资源。'
 spec=json.loads((base/'manifest.json').read_text());spec.update(release=VERSION,source_name='1.42.0/card-source.json',source_sha256=hashlib.sha256((base/'card-source.json').read_bytes()).hexdigest(),interactive_board={'asset_commit':commit,'source':['src/board-interaction.js','src/board-interaction.css','tools/build_interactive_board.py'],'state':'cosmetic only, no formal writes','navigation_delay_ms':180,'reduced_motion':'130ms opacity feedback; no particles/delay','host_acceptance':'pending'})
 for module in spec['modules']:
  if module['module_id']=='scene':module.update(version=VERSION,path='mikage-shrine/releases/'+VERSION+'/scene.mjs',sha256=hashlib.sha256(scene.encode()).hexdigest())
 return {'scene.mjs':scene,'statusbar.html':html,'card-source.json':json.dumps(card,ensure_ascii=False,indent=2)+'\n','manifest.json':json.dumps(spec,ensure_ascii=False,indent=2)+'\n'}
if __name__=='__main__':
 ap=argparse.ArgumentParser(description=__doc__);ap.add_argument('--asset-commit',required=True);ap.add_argument('--dry-run',action='store_true');a=ap.parse_args();outputs=build(a.asset_commit);print(json.dumps({'release':VERSION,'dry_run':a.dry_run,'outputs':{k:len(v.encode()) for k,v in outputs.items()}}))
 if not a.dry_run:
  d=ROOT/'releases'/VERSION;d.mkdir(exist_ok=True)
  for k,v in outputs.items():(d/k).write_text(v)
