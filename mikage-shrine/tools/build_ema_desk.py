#!/usr/bin/env python3
"""1.45.0: paint and animate the existing ema panel, preserving the 1.44 map."""
import argparse,hashlib,json,re
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
VERSION='1.45.0'
def once(s,a,b):
 if s.count(a)!=1:raise ValueError('Nonunique anchor '+a[:90])
 return s.replace(a,b,1)
def build(commit):
 if not re.fullmatch('[0-9a-f]{40}',commit):raise ValueError('Immutable asset commit required')
 base=ROOT/'releases/1.44.0';spec=json.loads((base/'manifest.json').read_text());panel=next(m for m in spec['modules'] if m['module_id']=='panels');module=(ROOT.parent/panel['path']).read_text();assert hashlib.sha256(module.encode()).hexdigest()==panel['sha256']
 match=re.search(r'const MikagePanelHTML=("(?:[^"\\]|\\.)*");',module);html=json.loads(match[1]);prefix=f'https://cdn.jsdelivr.net/gh/AliceNekoqqq/Aliceneko-Map-Plugin@{commit}/mikage-shrine/assets/ui/'
 html=once(html,'</head>','<style id="ema-desk-v145">'+(ROOT/'src/ema-desk.css').read_text().replace('__EMA_ASSETS__',prefix)+'</style></head>')
 start=html.index('      <header class="dialog-header hero-header">',html.index('id="board-dialog"'));end=html.index('      <div class="board-toolbar">',start)
 header='''      <header class="ema-desk-header"><h2 id="board-title">绘马结缘所</h2><button class="close-button" type="button" data-close="button" aria-label="收起绘马板">×</button><button type="button" class="ema-toy ema-toy-bell" data-ema-toy="bell" aria-label="轻摇狐铃"><span aria-hidden="true"></span></button><button type="button" class="ema-toy ema-toy-cherry" data-ema-toy="cherry" aria-label="轻触樱枝，落下花瓣"></button><div class="ema-fx-layer" aria-hidden="true"></div></header>
'''
 bell='<svg viewBox="152 38 155 400" aria-hidden="true"><defs><clipPath id="ema-live-bell"><rect x="152" y="38" width="155" height="400"/></clipPath></defs><image href="https://cdn.jsdelivr.net/gh/AliceNekoqqq/Aliceneko-Map-Plugin@da40f818eb375224e93fbc6ff07ea18ed11c61c6/mikage-shrine/assets/ui/veranda-v143-objects.webp" width="1774" height="887" clip-path="url(#ema-live-bell)"/></svg>'
 header=header.replace('<span aria-hidden="true"></span>',bell)
 html=html[:start]+header+html[end:]
 html=once(html,'<p class="main-gate-note" id="main-gate-note"','<p id="ema-desk-status" role="status" aria-live="polite"></p><p class="main-gate-note" id="main-gate-note"')
 html=once(html,'  function renderBoard() {','  const emaFlippedIds=new Set(),emaPending=new Map();\n  function renderBoard() {')
 html=once(html,'    const items = boardItems();','    const items = boardItems();\n    const emaIds=new Set(items.map((e,i)=>String(e.编号||\'EMA-\'+(i+1))));for(const id of emaFlippedIds)if(!emaIds.has(id))emaFlippedIds.delete(id);')
 html=once(html,"      card.dataset.emaId = id;\n      grid.append(card);","      card.dataset.emaId = id;\n      grid.append(card);\n      if(emaFlippedIds.has(id))flipCard(card,true,false);\n      if(emaPending.has(id))for(const control of $$('.ema-actions button',card)){control.disabled=true;control.setAttribute('aria-busy','true');}")
 html=once(html,'  function flipCard(card, flipped) {','  function flipCard(card, flipped, focus=true) {\n    if(card.dataset.emaId){if(flipped)emaFlippedIds.add(card.dataset.emaId);else emaFlippedIds.delete(card.dataset.emaId);}\n    if(focus)window.MikageEmaDesk?.flip(card,flipped);')
 html=once(html,"    if (nextFocus) nextFocus.focus({ preventScroll: true });","    if (focus && nextFocus) nextFocus.focus({ preventScroll: true });")
 # All formal actions continue through the existing host bridge. View-only motion never commits.
 anchor="      return showToast('界面桥接尚未连接。');\n    }\n    try {"
 html=once(html,anchor,"""      return showToast('界面桥接尚未连接。');
    }
    const emaAction=['acceptEma','dismissEma','pauseEma','resumeEma','refresh'].includes(type);
    const emaKey=type==='refresh'?'$refresh':String(payload?.id||'');
    if(emaAction&&emaPending.has(emaKey))return false;
    let emaSucceeded=false,emaFailure='';
    if(emaAction){emaPending.set(emaKey,type);window.MikageEmaDesk?.operation('pending',emaKey,type);}
    try {"""
 )
 html=once(html,"      showToast(success);\n      return true;","      showToast(success);\n      emaSucceeded=true;\n      return true;")
 html=once(html,"      if (type === 'setOutfit') outfitApplyPending = null;\n      if (control) control.disabled = false;","      emaFailure=error?.message||'操作未提交，请重试。';\n      if (type === 'setOutfit') outfitApplyPending = null;\n      if (control) control.disabled = false;")
 html=once(html,"    } finally {\n      if(type==='refresh')", "    } finally {\n      if(emaAction){emaPending.delete(emaKey);if(activeDialog==='board')renderBoard();window.MikageEmaDesk?.operation(emaSucceeded?'success':'error',emaKey,type,emaFailure);}\n      if(type==='refresh')")
 html=once(html,"    window.MikageMapDesk?.dispose();","    window.MikageEmaDesk?.dispose();\n    window.MikageMapDesk?.dispose();")
 html=once(html,'</body>','<script>'+(ROOT/'src/ema-desk.js').read_text().replace('</script','<\\/script')+'</script></body>')
 module=module[:match.start(1)]+json.dumps(html,ensure_ascii=False)+module[match.end(1):];module=once(module,"const version = '1.44.0';","const version = '1.45.0';")
 card=json.loads((base/'card-source.json').read_text());card['character_version']=card['data']['character_version']=VERSION
 for script in card['data']['extensions']['tavern_helper']['scripts']:
  if script['id']==panel['script_id']:script['name']='御影神社·绘马结缘所 '+VERSION+' CDN';script['info']='实绘绘马木牌；拨动翻面、主线紫绳金狐、心愿操作反馈与刷新保留阅读状态；包含1.44地图。'
 panel.update(version=VERSION,path='mikage-shrine/releases/'+VERSION+'/panels.mjs',sha256=hashlib.sha256(module.encode()).hexdigest())
 spec.update(release=VERSION,source_name='1.44.0/card-source.json',source_sha256=hashlib.sha256((base/'card-source.json').read_bytes()).hexdigest(),ema_desk={'asset_commit':commit,'source':['src/ema-desk.css','src/ema-desk.js','tools/build_ema_desk.py'],'state':'existing ema bridge; local flipped ids; no toy writes','font':'Noto Serif SC @fontsource 5.3.1 SIL OFL 1.1, common simplified Chinese woff2','host_acceptance':'pending'})
 return {'panels.mjs':module,'ema-panel.html':html,'card-source.json':json.dumps(card,ensure_ascii=False,indent=2)+'\n','manifest.json':json.dumps(spec,ensure_ascii=False,indent=2)+'\n'}
if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('--asset-commit',required=True);p.add_argument('--dry-run',action='store_true');a=p.parse_args();outputs=build(a.asset_commit)
 if not a.dry_run:
  d=ROOT/'releases'/VERSION;d.mkdir(exist_ok=True)
  for k,v in outputs.items():(d/k).write_text(v)
 print(json.dumps({'release':VERSION,'files':{k:len(v.encode()) for k,v in outputs.items()}},ensure_ascii=False))
