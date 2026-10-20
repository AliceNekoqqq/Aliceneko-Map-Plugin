#!/usr/bin/env python3
"""Painted life home and decorating desk, preserving existing life domain actions."""
import argparse,hashlib,json,re
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
VERSION='1.47.0'
def once(s,a,b):
 if s.count(a)!=1:raise ValueError('Nonunique anchor '+a[:85])
 return s.replace(a,b,1)
def build(commit):
 if not re.fullmatch('[0-9a-f]{40}',commit):raise ValueError('Immutable asset commit required')
 base=ROOT/'releases/1.46.0';spec=json.loads((base/'manifest.json').read_text());panel=next(m for m in spec['modules'] if m['module_id']=='panels');module=(ROOT.parent/panel['path']).read_text();assert hashlib.sha256(module.encode()).hexdigest()==panel['sha256']
 match=re.search(r'const MikagePanelHTML=("(?:[^"\\]|\\.)*");',module);html=json.loads(match[1]);prefix=f'https://cdn.jsdelivr.net/gh/AliceNekoqqq/Aliceneko-Map-Plugin@{commit}/mikage-shrine/assets/ui/'
 html=once(html,'</head>','<style id="life-desk-v147">'+(ROOT/'src/life-desk.css').read_text().replace('__LIFE_ASSETS__',prefix)+'</style></head>')
 start=html.index('      <header class="dialog-header">',html.index('id="life-dialog"'));end=html.index('      <nav class="life-tabs"',start)
 html=html[:start]+'''      <header class="life-desk-header"><div><h2 id="life-title">神社生活</h2><p>把日子，慢慢安放在檐下。</p></div><button class="close-button" type="button" data-close="button" aria-label="收起神社生活">×</button></header>
'''+html[end:]
 html=once(html," const tabs=[['quiet','廊下小憩']"," const tabs=[['home','生活首页'],['quiet','廊下小憩']")
 html=once(html," let tab='decor',view=null"," let tab='home',view=null")
 start=html.index(' function renderDecor(){');end=html.index(' function fillSlots()',start)
 html=html[:start]+" function renderHome(){window.MikageLifeDesk?.home({view});}\n function renderDecor(){window.MikageLifeDesk?.decor({view,config:config(),perform});}\n"+html[end:]
 html=once(html,'({quiet:renderQuiet,strange:renderStrange,decor:renderDecor,craft:renderCraft,garden:renderGarden,shop:renderShop,album:renderAlbum,festival:renderFestival}[tab])();','({home:renderHome,quiet:renderQuiet,strange:renderStrange,decor:renderDecor,craft:renderCraft,garden:renderGarden,shop:renderShop,album:renderAlbum,festival:renderFestival}[tab])();\n   window.MikageLifeDesk?.afterRender({view,tab,selectTab:key=>{if(!tabs.some(([id])=>id===key))return;tab=key;render();}});')
 old=" async function perform(payload){if(working)return;working=true;$('#life-feedback').textContent='正在记录…';try{await bridge.act('life',payload);$('#life-feedback').textContent='已记录。画面与后续正文将使用这份新状态。';}catch(error){$('#life-feedback').textContent=error.message;}finally{working=false;await render();}}"
 new=""" async function perform(payload){if(working)return false;working=true;window.MikageLifeDesk?.busy(true);const feedback=$('#life-feedback');feedback.dataset.state='pending';feedback.textContent='正在记录…';let ok=false;try{const result=await bridge.act('life',payload);if(result?.ok===false||result?.accepted===false)throw Error(result.error||'操作没有提交，请重试。');feedback.dataset.state='success';feedback.textContent='已记录。画面与后续正文将使用这份新状态。';ok=true;}catch(error){feedback.dataset.state='error';feedback.textContent=error.message||'操作没有提交，请重试。';}finally{working=false;await render();window.MikageLifeDesk?.busy(false);}return ok;}"""
 html=once(html,old,new)
 html=once(html,'    window.MikageWardrobeDesk?.dispose();','    window.MikageLifeDesk?.dispose();\n    window.MikageWardrobeDesk?.dispose();')
 html=once(html,'</body>','<script>'+(ROOT/'src/life-desk.js').read_text().replace('</script','<\\/script')+'</script></body>')
 module=module[:match.start(1)]+json.dumps(html,ensure_ascii=False)+module[match.end(1):];module=once(module,"const version = '1.46.0';","const version = '1.47.0';")
 card=json.loads((base/'card-source.json').read_text());card['character_version']=card['data']['character_version']=VERSION
 for script in card['data']['extensions']['tavern_helper']['scripts']:
  if script['id']==panel['script_id']:script['name']='御影神社·檐下生活 '+VERSION+' CDN';script['info']='实绘生活首页、八入口、四区布置台与6件陈设；预览后确认、收起、点灯及失败重试。保留其余生活分页和衣柜/绘马/地图。'
 panel.update(version=VERSION,path='mikage-shrine/releases/'+VERSION+'/panels.mjs',sha256=hashlib.sha256(module.encode()).hexdigest())
 spec.update(release=VERSION,source_name='1.46.0/card-source.json',source_sha256=hashlib.sha256((base/'card-source.json').read_bytes()).hexdigest(),life_desk={'asset_commit':commit,'source':['src/life-desk.css','src/life-desk.js','tools/build_life_desk.py'],'scope':'life home and decoration page only; other life page logic preserved','state':'existing getLifeView and life action bridge; preview only until explicit commit','host_acceptance':'pending'})
 return {'panels.mjs':module,'life-panel.html':html,'card-source.json':json.dumps(card,ensure_ascii=False,indent=2)+'\n','manifest.json':json.dumps(spec,ensure_ascii=False,indent=2)+'\n'}
if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('--asset-commit',required=True);p.add_argument('--dry-run',action='store_true');a=p.parse_args();outputs=build(a.asset_commit)
 if not a.dry_run:
  d=ROOT/'releases'/VERSION;d.mkdir(exist_ok=True)
  for k,v in outputs.items():(d/k).write_text(v)
 print(json.dumps({'release':VERSION,'files':{k:len(v.encode()) for k,v in outputs.items()}}))
