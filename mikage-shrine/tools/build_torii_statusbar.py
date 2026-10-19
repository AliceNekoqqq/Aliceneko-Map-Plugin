#!/usr/bin/env python3
"""Presentation-only successor to delivered 1.39.0. Does not consume paused debug staging."""
from pathlib import Path
import argparse,json,re,hashlib
ROOT=Path(__file__).resolve().parents[1]
VERSION='1.40.1'
def build(asset_commit):
 if not re.fullmatch('[0-9a-f]{40}',asset_commit):raise ValueError('Immutable asset commit required')
 base=ROOT/'releases/1.39.0';scene=(base/'scene.mjs').read_text()
 m=re.search(r'const StatusbarHTML=("(?:[^"\\]|\\.)*");',scene);html=json.loads(m[1])
 css=(ROOT/'src/torii-statusbar.css').read_text()
 url=f'https://cdn.jsdelivr.net/gh/AliceNekoqqq/Aliceneko-Map-Plugin@{asset_commit}/mikage-shrine/assets/ui/'
 css=':root{--torii-reference:url("'+url+'torii-v140-reference.webp")}\n'+css
 header='<div class="torii-portal"><img class="torii-frame" src="'+url+'torii-v140-frame.webp" alt="" aria-hidden="true"><header class="game-hud"><b class="torii-title">御影神社</b><span class="torii-meta" id="clock">—</span><strong class="torii-phase" id="phase">正在连接神社记录</strong></header>'
 html,n=re.subn(r'<header class="game-hud">.*?</header>',lambda _:header,html,count=1);assert n==1
 # Move existing controls, retaining each ID and its exact event ownership.
 mood=re.search(r'<span id="mood">.*?</span>',html)[0];html=html.replace(mood,'',1);mood=mood.replace('id="mood"','id="mood" class="torii-mood"')
 html=html.replace('<nav class="scene-dock"',mood+'</div><nav class="scene-dock"',1)
 windows={'map':'0 100 565 440','ema':'560 80 465 455','wardrobe':'1030 130 500 390','life':'0 570 515 400','journal-button':'525 570 515 370','buildings':'1050 555 485 420'}
 def art(match):
  tag=match[1];id=re.search(r'id="([^"]+)"',tag)[1]
  return tag+'<span class="dock-art" aria-hidden="true"><svg viewBox="'+windows[id]+'" preserveAspectRatio="xMidYMid meet"><image href="'+url+'torii-v141-objects.webp" width="1536" height="1024"/></svg></span>'+match[2]
 html=re.sub(r'(<button class="dock-button"[^>]*>)(<svg.*?</svg>)',art,html)
 html=html.replace('</main>','<p class="torii-watermark">唯一来源：Discord ·类脑社区·♡红豆粉♡</p></main>',1)
 html=html.replace('</head>','<style id="torii-v140-style">'+css+'</style></head>',1)
 scene=scene[:m.start(1)]+json.dumps(html,ensure_ascii=False)+scene[m.end(1):]
 scene=scene.replace("const version = '1.39.0';","const version = '"+VERSION+"';",1)
 card=json.loads((base/'card-source.json').read_text());card['character_version']=card['data']['character_version']=VERSION
 for script in card['data']['extensions']['tavern_helper']['scripts']:
  if script['id']=='f763b9d7-c17c-5f0f-b0bd-36d9f37a3383':script['name']='御影神社·暮樱结缘之庭 '+VERSION+' CDN';script['info']='鸟居建筑框架与廊下实物导航；地图、换装、生活和记录桥接保持原有契约。'
 spec=json.loads((base/'manifest.json').read_text());spec.update(release=VERSION,source_name='1.39.0/card-source.json',source_sha256=hashlib.sha256((base/'card-source.json').read_bytes()).hexdigest(),torii={'asset_commit':asset_commit,'source':'src/torii-statusbar.css + tools/build_torii_statusbar.py','scope':'presentation only; paused 1.39.1 debugging is excluded','host_acceptance':'pending'})
 for module in spec['modules']:
  if module['module_id']=='scene':module.update(version=VERSION,path='mikage-shrine/releases/'+VERSION+'/scene.mjs',sha256=hashlib.sha256(scene.encode()).hexdigest())
 return {'scene.mjs':scene,'statusbar.html':html,'card-source.json':json.dumps(card,ensure_ascii=False,indent=2)+'\n','manifest.json':json.dumps(spec,ensure_ascii=False,indent=2)+'\n'}
if __name__=='__main__':
 ap=argparse.ArgumentParser(description=__doc__);ap.add_argument('--asset-commit',required=True);ap.add_argument('--dry-run',action='store_true');a=ap.parse_args();outputs=build(a.asset_commit)
 print(json.dumps({'release':VERSION,'dry_run':a.dry_run,'outputs':{k:len(v.encode()) for k,v in outputs.items()}}))
 if not a.dry_run:
  dest=ROOT/'releases'/VERSION;dest.mkdir(exist_ok=True)
  for k,v in outputs.items():(dest/k).write_text(v)
