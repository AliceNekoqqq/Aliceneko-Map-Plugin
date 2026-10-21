#!/usr/bin/env python3
"""Map-only painted desk, based on the shipped panel rather than obsolete panels.html."""
import argparse, hashlib, json, re
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
VERSION='1.44.0'
def once(s,a,b):
 if s.count(a)!=1: raise ValueError('Nonunique anchor '+a[:90])
 return s.replace(a,b,1)
def build(commit):
 if not re.fullmatch('[0-9a-f]{40}',commit): raise ValueError('Immutable asset commit required')
 base=ROOT/'releases/1.43.0';spec=json.loads((base/'manifest.json').read_text())
 panel_spec=next(x for x in spec['modules'] if x['module_id']=='panels');module=(ROOT.parent/panel_spec['path']).read_text()
 assert hashlib.sha256(module.encode()).hexdigest()==panel_spec['sha256']
 match=re.search(r'const MikagePanelHTML=("(?:[^"\\]|\\.)*");',module);html=json.loads(match[1])
 prefix=f'https://cdn.jsdelivr.net/gh/AliceNekoqqq/Aliceneko-Map-Plugin@{commit}/mikage-shrine/assets/ui/'
 css=(ROOT/'src/map-desk.css').read_text().replace('__MAP_ASSETS__',prefix)
 html=once(html,'</head>','<style id="map-desk-v144">'+css+'</style></head>')
 start=html.index('      <header class="dialog-header hero-header">',html.index('id="map-dialog"'));end=html.index('        <div class="map-canvas"',start)
 header='''      <header class="map-desk-header"><h2 id="map-title" class="sr-only">神域图卷</h2><button class="close-button" type="button" data-close="button" aria-label="收起神域图卷">×</button></header>
      <div class="map-layout"><div class="map-column"><section class="map-atlas" aria-label="摊开的神域手卷"><header class="atlas-heading"><strong aria-hidden="true">神域图卷</strong></header>
      <button type="button" class="map-toy map-desk-compass" data-map-toy="compass" aria-label="拨动罗盘"><svg viewBox="954 54 155 155" aria-hidden="true"><defs><clipPath id="map-compass-circle"><circle cx="1031.5" cy="131.5" r="77"/></clipPath></defs><image href="'''+prefix+'''map-desk-v144.webp" width="1122" height="1402" clip-path="url(#map-compass-circle)"/></svg></button>
      <button type="button" class="map-toy map-desk-cherry" data-map-toy="cherry" aria-label="轻触樱枝，落下花瓣"></button>
'''
 html=html[:start]+header+html[end:]
 nav='<nav class="map-quick-nav" id="map-quick-nav" aria-label="十地快速选择"></nav>'
 html=once(html,nav,'')
 a=html.index('<div class="map-legend">',html.index('id="map-dialog"'));b=html.index('        <aside class="place-card"',a)
 html=html[:a]+'''<div class="map-desk-ticket"><span class="map-stage-label" id="map-stage-label">神社的庇佑</span><div class="map-legend"><span><i class="legend-current"></i>此刻所在</span><span><i class="legend-open"></i>已开放</span><span><i class="legend-locked"></i>未开放</span></div></div><div id="map-remote" hidden></div><div class="map-desk-fx" aria-hidden="true"></div></section>'''+nav+'''<p class="map-select-note">点选图上地区或下方地名，展开目的地。</p><div class="map-desk-status" role="status" aria-live="polite" id="map-desk-status">十地风景，随手翻阅。</div></div>
'''+html[b:]
 html=once(html,'id="map-desk-status">十地风景，随手翻阅。</div>','id="map-desk-status"></div>')
 html=once(html,'“前往”只提交移动意图；抵达地点由剧情与 MVU 状态确认。','选好目的地后可提出前往意图；实际抵达会在后续对话中确认。')
 # Formal travel still uses the exact existing bridge. One in-flight request across all regions.
 html=once(html,'  function selectRegion(id) {','  let mapTravelPending=false;\n  function selectRegion(id) {')
 html=once(html,"    selectedRegionId = id;","    selectedRegionId = id;\n    if(window.MikageMapDesk) window.MikageMapDesk.selected(id,region.name);")
 html=once(html,"    travel.disabled = !canTravel;","    travel.classList.add('map-travel');\n    travel.disabled = !canTravel || mapTravelPending;\n    travel.setAttribute('aria-busy',String(mapTravelPending));")
 old="      travel.addEventListener('click', () => invokeAction('travel', { regionId: region.id }, '已加入前往计划；地点将在后续对话中更新。'));"
 new="""      travel.addEventListener('click', async () => {
        if(mapTravelPending)return;
        mapTravelPending=true;travel.setAttribute('aria-busy','true');
        window.MikageMapDesk?.travel('pending',region.name);
        try { const ok=await invokeAction('travel', { regionId: region.id }, '已加入前往计划；地点将在后续对话中更新。',travel);
          window.MikageMapDesk?.travel(ok?'sent':'error',region.name);
        } finally { mapTravelPending=false;
          const current=$('#place-card .map-travel');
          if(current){const state=currentState().地图||{};const open=(state.开放地区||[]).map(x=>String(x&&(x.编号||x.id)||''));current.disabled=!open.includes(selectedRegionId)||String(state.当前地区||'R01')===selectedRegionId;current.setAttribute('aria-busy','false');}
        }
      });"""
 html=once(html,old,new)
 html=once(html,"make('span', 'place-code', region.id + ' / MIKAGE ROUTE')","make('span', 'place-code', '目的地手帖')")
 html=once(html,"      const quick=$('#map-quick-nav');", "      const quick=$('#map-quick-nav');") if "      const quick=$('#map-quick-nav');" in html else html
 # Expose actual lock/current status on the accessible quick-selector too.
 html=once(html,"b.dataset.regionId=region.id;b.setAttribute('aria-pressed'", "b.dataset.regionId=region.id;b.dataset.locked=String(!openRegions.includes(region.id));if(location===region.id)b.setAttribute('aria-current','location');b.setAttribute('aria-pressed'")
 html=once(html,"    window.MikageEmaSettings?.dispose();","    window.MikageMapDesk?.dispose();\n    window.MikageEmaSettings?.dispose();")
 html=once(html,'</body>','<script>'+(ROOT/'src/map-desk.js').read_text().replace('</script','<\\/script')+'</script></body>')
 module=module[:match.start(1)]+json.dumps(html,ensure_ascii=False)+module[match.end(1):]
 module=once(module,"const version = '1.27.0';","const version = '1.44.0';")
 card=json.loads((base/'card-source.json').read_text());card['character_version']=card['data']['character_version']=VERSION
 for script in card['data']['extensions']['tavern_helper']['scripts']:
  if script['id']==panel_spec['script_id']:script['name']='御影神社·神域图卷 '+VERSION+' CDN';script['info']='实绘旅行手卷；十地区点选、纸签反馈、风景明信片、罗盘与落樱互动。'
 panel_spec.update(version=VERSION,path='mikage-shrine/releases/'+VERSION+'/panels.mjs',sha256=hashlib.sha256(module.encode()).hexdigest())
 spec.update(release=VERSION,source_name='1.43.0/card-source.json',source_sha256=hashlib.sha256((base/'card-source.json').read_bytes()).hexdigest(),map_desk={'asset_commit':commit,'maintained_sources':['src/map-desk.css','src/map-desk.js','tools/build_map_desk.py'],'base_panel':'releases/1.29.1/panels.mjs','scope':'map only; all ten canonical regions; existing travel bridge with single-flight guard','host_acceptance':'pending'})
 return {'panels.mjs':module,'map-panel.html':html,'card-source.json':json.dumps(card,ensure_ascii=False,indent=2)+'\n','manifest.json':json.dumps(spec,ensure_ascii=False,indent=2)+'\n'}
if __name__=='__main__':
 p=argparse.ArgumentParser(description=__doc__);p.add_argument('--asset-commit',required=True);p.add_argument('--dry-run',action='store_true');a=p.parse_args();outputs=build(a.asset_commit)
 if not a.dry_run:
  dest=ROOT/'releases'/VERSION;dest.mkdir(exist_ok=True)
  for k,v in outputs.items():(dest/k).write_text(v)
 print(json.dumps({'release':VERSION,'outputs':{k:len(v.encode()) for k,v in outputs.items()}},ensure_ascii=False))
