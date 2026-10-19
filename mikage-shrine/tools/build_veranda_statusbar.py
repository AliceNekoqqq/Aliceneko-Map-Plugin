#!/usr/bin/env python3
"""Build approved veranda composition over immutable 1.40.1; retain formal state."""
import argparse,json,re,hashlib
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
VERSION='1.41.0'
def once(s,a,b):
 if s.count(a)!=1:raise ValueError('Nonunique anchor '+a[:80])
 return s.replace(a,b,1)
def build(commit):
 if not re.fullmatch('[0-9a-f]{40}',commit):raise ValueError('Immutable asset commit required')
 base=ROOT/'releases/1.40.1';scene=(base/'scene.mjs').read_text();m=re.search(r'const StatusbarHTML=("(?:[^"\\]|\\.)*");',scene);html=json.loads(m[1])
 html,n=re.subn(r'<style id="torii-v140-style">.*?</style>','',html,count=1,flags=re.S);assert n==1
 # SVG meet-letterboxing must not reveal neighboring objects outside each source window.
 def clip_object(match):
  x,y,w,h=match[2].split();key='veranda-object-'+x+'-'+y
  return match[1]+'<defs><clipPath id="'+key+'"><rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'"/></clipPath></defs>'+match[3].replace('<image ','<image clip-path="url(#'+key+')" ',1)
 html,n=re.subn(r'(<svg viewBox="([\d .]+)" preserveAspectRatio="xMidYMid meet">)(<image[^>]+/>)',clip_object,html);assert n==6
 img=re.search(r'<img class="torii-frame"[^>]*>',html)[0];html=html.replace(img,'',1)
 url=f'https://cdn.jsdelivr.net/gh/AliceNekoqqq/Aliceneko-Map-Plugin@{commit}/mikage-shrine/assets/ui/veranda-v141-eave.webp'
 html=once(html,'<header class="game-hud">','<header class="game-hud"><svg class="eave-art" viewBox="0 70 2048 450" preserveAspectRatio="none" aria-hidden="true"><image href="'+url+'" width="2048" height="684"/></svg>')
 speech=re.search(r'<div class="speech"[^>]*>.*?</div>',html,re.S)[0];html=html.replace(speech,'',1)
 mood=re.search(r'<span id="mood"[^>]*>.*?</span>',html,re.S)[0];html=html.replace(mood,'',1)
 html=once(html,'</div><nav class="scene-dock"','<section class="veranda-dialogue" aria-label="巴卫与庭院小记">'+mood+speech+'</section></div><nav class="scene-dock"')
 # Labels choose safe direction from actual rendered hotspot position.
 anchor="b.style.left=bx+'%';b.style.top=by+'%';"
 html=once(html,anchor,anchor+"b.dataset.labelSide=by<28?'below':'above';b.classList.toggle('spot-edge-right',bx>65);b.classList.toggle('spot-edge-left',bx<30);")
 html=html.replace('</head>','<style id="veranda-v141-style">'+(ROOT/'src/veranda-statusbar.css').read_text()+'</style></head>',1)
 scene=scene[:m.start(1)]+json.dumps(html,ensure_ascii=False)+scene[m.end(1):]
 scene=once(scene,"const version = '1.40.1';","const version = '1.41.0';")
 card=json.loads((base/'card-source.json').read_text());card['character_version']=card['data']['character_version']=VERSION
 for script in card['data']['extensions']['tavern_helper']['scripts']:
  if script['id']=='f763b9d7-c17c-5f0f-b0bd-36d9f37a3383':script['name']='御影神社·檐下结缘 '+VERSION+' CDN';script['info']='纸木一体状态栏；宽地图、独立对话栏、边缘标签避让与底部时段预览。'
 spec=json.loads((base/'manifest.json').read_text());spec.update(release=VERSION,source_name='1.40.1/card-source.json',source_sha256=hashlib.sha256((base/'card-source.json').read_bytes()).hexdigest(),veranda={'asset_commit':commit,'source':'src/veranda-statusbar.css + tools/build_veranda_statusbar.py','host_acceptance':'pending','state':'existing MVU fields; presentation only; no new writes'})
 for module in spec['modules']:
  if module['module_id']=='scene':module.update(version=VERSION,path='mikage-shrine/releases/'+VERSION+'/scene.mjs',sha256=hashlib.sha256(scene.encode()).hexdigest())
 return {'scene.mjs':scene,'statusbar.html':html,'card-source.json':json.dumps(card,ensure_ascii=False,indent=2)+'\n','manifest.json':json.dumps(spec,ensure_ascii=False,indent=2)+'\n'}
if __name__=='__main__':
 ap=argparse.ArgumentParser(description=__doc__);ap.add_argument('--asset-commit',required=True);ap.add_argument('--dry-run',action='store_true');a=ap.parse_args();outputs=build(a.asset_commit);print(json.dumps({'release':VERSION,'dry_run':a.dry_run,'outputs':{k:len(v.encode()) for k,v in outputs.items()}}))
 if not a.dry_run:
  d=ROOT/'releases'/VERSION;d.mkdir(exist_ok=True)
  for k,v in outputs.items():(d/k).write_text(v)
