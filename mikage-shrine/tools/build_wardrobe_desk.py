#!/usr/bin/env python3
"""1.46.0 painted dressing room; preserve the 1.45 ema/map and formal state."""
import argparse,hashlib,json,re
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
VERSION='1.46.0'
def once(s,a,b):
 if s.count(a)!=1:raise ValueError('Nonunique anchor '+a[:90])
 return s.replace(a,b,1)
def build(commit):
 if not re.fullmatch('[0-9a-f]{40}',commit):raise ValueError('Immutable asset commit required')
 base=ROOT/'releases/1.45.0';spec=json.loads((base/'manifest.json').read_text());panel=next(m for m in spec['modules'] if m['module_id']=='panels');module=(ROOT.parent/panel['path']).read_text();assert hashlib.sha256(module.encode()).hexdigest()==panel['sha256']
 match=re.search(r'const MikagePanelHTML=("(?:[^"\\]|\\.)*");',module);html=json.loads(match[1]);prefix=f'https://cdn.jsdelivr.net/gh/AliceNekoqqq/Aliceneko-Map-Plugin@{commit}/mikage-shrine/assets/ui/'
 html=once(html,'</head>','<style id="wardrobe-desk-v146">'+(ROOT/'src/wardrobe-desk.css').read_text().replace('__ROBE_ASSETS__',prefix)+'</style></head>')
 start=html.index('      <header class="dialog-header hero-header">',html.index('id="wardrobe-dialog"'));end=html.index('      <div class="wardrobe-tabs"',start)
 html=html[:start]+'''      <header class="robe-header"><div><h2 id="wardrobe-title">御影更衣间</h2><p>挑一袭衣，共赴今日。</p></div><button class="close-button" type="button" data-close="button" aria-label="收起衣柜">×</button></header>
      <p id="robe-desk-status" role="status" aria-live="polite"></p>
'''+html[end:]
 html=once(html,'<small>衣影留照</small></div>','<small>衣影留照</small><div class="robe-fx" aria-hidden="true"></div><button type="button" class="robe-sachet" data-robe-toy="sachet" aria-label="轻晃香囊"><span>轻晃香囊</span></button><div class="robe-stage-tools"><button type="button" data-robe-toy="shine">展衣照影</button><button type="button" data-robe-toy="walk" aria-pressed="false">走两步</button></div></div>')
 html=once(html,"      const item = make('span', 'wardrobe-direction'); item.dataset.direction = direction;","      const item = make('button', 'wardrobe-direction'); item.type='button';item.dataset.direction = direction;item.setAttribute('aria-label','庭院形象朝向：'+label);item.setAttribute('aria-pressed',String(direction==='front'));")
 html=once(html,'    renderWardrobeDirections(art, wardrobeActor, preview);\n    renderCharacterMinis();','    renderWardrobeDirections(art, wardrobeActor, preview);\n    renderCharacterMinis();\n    window.MikageWardrobeDesk?.render({actor:wardrobeActor,outfit:preview,art});')
 html=once(html,"    options.replaceChildren();\n    list.forEach", "    const robeScroll=options.scrollTop;\n    const robeFocus=document.activeElement?.closest('[data-outfit-id]')?.dataset.outfitId;\n    options.replaceChildren();\n    list.forEach")
 html=once(html,"    if (!list.length) options.append(make('span', 'wardrobe-current', '服装图册尚未加载。'));", "    options.scrollTop=robeScroll;\n    if(robeFocus){const control=[...options.querySelectorAll('[data-outfit-id]')].find(b=>b.dataset.outfitId===robeFocus);control?.focus({preventScroll:true});}\n    if (!list.length) options.append(make('span', 'wardrobe-current', '服装图册尚未加载。'));")
 html=once(html,"    const emaAction=['acceptEma'", "    const robeAction=['setOutfit','nameOutfit'].includes(type);\n    if(robeAction)window.MikageWardrobeDesk?.operation('pending',type==='setOutfit'?'正在更换衣装…':'正在保存纪念名…');\n    const emaAction=['acceptEma'")
 html=once(html,'      emaSucceeded=true;\n      return true;',"      emaSucceeded=true;\n      if(robeAction)window.MikageWardrobeDesk?.operation('success',success);\n      return true;")
 html=once(html,"      emaFailure=error?.message||'操作未提交，请重试。';","      emaFailure=error?.message||'操作未提交，请重试。';\n      if(robeAction)window.MikageWardrobeDesk?.operation('error',emaFailure);")
 html=once(html,'    window.MikageEmaDesk?.dispose();','    window.MikageWardrobeDesk?.dispose();\n    window.MikageEmaDesk?.dispose();')
 html=once(html,'</body>','<script>'+(ROOT/'src/wardrobe-desk.js').read_text().replace('</script','<\\/script')+'</script></body>')
 module=module[:match.start(1)]+json.dumps(html,ensure_ascii=False)+module[match.end(1):];module=once(module,"const version = '1.45.0';","const version = '1.46.0';")
 card=json.loads((base/'card-source.json').read_text());card['character_version']=card['data']['character_version']=VERSION
 for script in card['data']['extensions']['tavern_helper']['scripts']:
  if script['id']==panel['script_id']:script['name']='御影神社·更衣间 '+VERSION+' CDN';script['info']='实绘更衣间、衣签反馈、展衣照影、香囊、四向与行走预览；保留原换装/解锁/校服伪装与地图绘马。'
 panel.update(version=VERSION,path='mikage-shrine/releases/'+VERSION+'/panels.mjs',sha256=hashlib.sha256(module.encode()).hexdigest())
 spec.update(release=VERSION,source_name='1.45.0/card-source.json',source_sha256=hashlib.sha256((base/'card-source.json').read_bytes()).hexdigest(),wardrobe_desk={'asset_commit':commit,'source':['src/wardrobe-desk.css','src/wardrobe-desk.js','tools/build_wardrobe_desk.py'],'state':'existing outfit bridge; view-only toys/directions/walk; no new formal writes','host_acceptance':'pending'})
 return {'panels.mjs':module,'wardrobe-panel.html':html,'card-source.json':json.dumps(card,ensure_ascii=False,indent=2)+'\n','manifest.json':json.dumps(spec,ensure_ascii=False,indent=2)+'\n'}
if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('--asset-commit',required=True);p.add_argument('--dry-run',action='store_true');a=p.parse_args();outputs=build(a.asset_commit)
 if not a.dry_run:
  d=ROOT/'releases'/VERSION;d.mkdir(exist_ok=True)
  for k,v in outputs.items():(d/k).write_text(v)
 print(json.dumps({'release':VERSION,'files':{k:len(v.encode()) for k,v in outputs.items()}}))
