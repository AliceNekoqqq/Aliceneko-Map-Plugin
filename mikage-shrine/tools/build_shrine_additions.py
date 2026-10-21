#!/usr/bin/env python3
"""Keep existing R01 backgrounds/navigation and add independent completion attachments."""
import argparse,json,re,hashlib
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];VERSION='1.48.0'
def once(s,a,b):
 if s.count(a)!=1:raise ValueError('Nonunique anchor: '+a[:100])
 return s.replace(a,b,1)
def build(commit):
 if not re.fullmatch('[0-9a-f]{40}',commit):raise ValueError('Immutable asset commit required')
 base=ROOT/'releases/1.47.0';spec=json.loads((base/'manifest.json').read_text());entry=next(m for m in spec['modules'] if m['module_id']=='scene');source=(ROOT.parent/entry['path']).read_text();m=re.search(r'const StatusbarHTML=("(?:[^"\\]|\\.)*");',source);html=json.loads(m[1])
 atlas=f'https://cdn.jsdelivr.net/gh/AliceNekoqqq/Aliceneko-Map-Plugin@{commit}/mikage-shrine/assets/ui/shrine-additions-v148.webp'
 js=(ROOT/'src/shrine-additions.js').read_text().replace('__ATLAS_URL__',atlas);css=(ROOT/'src/shrine-additions.css').read_text()
 pixel_atlas=f'https://cdn.jsdelivr.net/gh/AliceNekoqqq/Aliceneko-Map-Plugin@{commit}/mikage-shrine/assets/ui/shrine-modular-v1.webp'
 decor='https://cdn.jsdelivr.net/gh/AliceNekoqqq/Aliceneko-Map-Plugin@600cd34997a01b0b2dd708be79705252c56ee119/mikage-shrine/assets/ui/life-v147-objects.webp'
 model=(ROOT/'experiments/modular-shrine/scene.mjs').read_text().replace('export ','')
 pixel_js=(ROOT/'src/modular-shrine.js').read_text().replace('__MODEL__',model).replace('__ATLAS_URL__',pixel_atlas)
 pixel_css=(ROOT/'src/modular-shrine.css').read_text().replace('__DECOR_URL__',decor)
 js=pixel_js+'\n'+js;css=pixel_css+'\n'+css+'\n.scene-mode-bar{display:flex;align-items:center;justify-content:space-between;padding:3px 12px;background:#f4e5cb;color:#715539;border-top:1px solid #c9ab7c;font-size:11px}.scene-mode{min-height:44px;min-width:88px;padding:4px 10px;border:1px solid #c7ab78;border-radius:4px;background:#fff4e3;color:#66503b;font-size:11px}'
 html=once(html,'</head>','<style id="shrine-additions-style">'+css+'</style></head>')
 html=once(html,' <span id="mood"',' <div id="modular-shrine" hidden><canvas id="modular-ground" width="768" height="512" aria-hidden="true"></canvas></div><button type="button" id="modular-status" hidden aria-live="polite"></button><div id="shrine-additions" aria-hidden="true"></div><button type="button" id="additions-status" hidden aria-live="polite"></button>\n <span id="mood"')
 html=once(html,'</div>\n</div><section class="veranda-dialogue"','</div>\n</div><div class="scene-mode-bar"><span>神社画风</span><button type="button" id="scene-mode" class="scene-mode" aria-pressed="false">画风·原画</button></div><section class="veranda-dialogue"')
 html=once(html,'<script>/* Decoration sprites','<script>'+js.replace('</script','<\\/script')+'</script><script>/* Decoration sprites')
 html=once(html,"  const key=regionId+':'+period;", "  window.MikageShrineAdditions?.render(snapshot,regionId==='R01'&&visualMode==='original'?'R01':'off',period);\n  window.MikageModularShrine?.render(snapshot,regionId==='R01'&&visualMode==='pixel'?'R01':'off',period);\n  if(regionId==='R01'&&visualMode==='pixel'){backdropRequest++;backdropKey=null;scene.dataset.period=period;return;}\n  const key=regionId+':'+period;")
 html=once(html,"if(memoryScope!==scope){memoryScope=scope;", "if(memoryScope!==scope){window.MikageShrineAdditions?.resetScope();window.MikageModularShrine?.resetScope();memoryScope=scope;")
 html=once(html,'function dispose(){if(disposed)return;window.MikageBoardToy?.dispose();','function dispose(){if(disposed)return;window.MikageModularShrine?.dispose();window.MikageShrineAdditions?.dispose();window.MikageBoardToy?.dispose();')
 html=once(html,'row.append(title,blocks,status);list.append(row);','row.append(title,blocks,status);list.append(row);if(level===4){const effect=document.createElement("p");effect.className="facility-effect";effect.textContent=window.MikageShrineAdditions?.effects[name]||"";list.append(effect);}')
 html=once(html,'</head>','<style>.facility-effect{margin:0 0 8px;padding:0 5px;color:#887457;font-size:11px;line-height:1.5}</style></head>')
 # The switch owns only the view. Each map retains its own immutable navigation object/cache.
 html=html.replace(" const reduced=matchMedia", """ const ORIGINAL_R01=REGIONS.R01;
 const PIXEL_R01={name:'御影神社·本殿',walkable:[[[31,98],[38,98],[38,85],[42,78],[46,73],[49,67],[54,58],[59,48],[52,46],[47,54],[43,62],[40,68],[36,74],[31,82]],[[26,90],[94,90],[94,98],[26,98]],[[55,71],[94,71],[94,92],[55,92]],[[44,76],[94,76],[94,90],[44,90]]],spawn:{player:[33,94],tomoe:[37,93]},patrol:[[34,92],[36,85],[44,78],[47,68],[55,50],[65,79],[83,82]],points:[{id:'ema',x:56,y:39,approach:[55,48]},{id:'bell',x:77,y:52,approach:[79,73]},{id:'sweep',x:74,y:72,approach:[73,79]}]};
 let visualMode='original';
 const reduced=matchMedia""",1)
 html=once(html,"function switchRegion(next){next=REGIONS[next]?next:'R01';", "function switchRegion(next){next=REGIONS[next]?next:'R01';scene.dataset.visualMode=visualMode;REGIONS.R01=visualMode==='pixel'?PIXEL_R01:ORIGINAL_R01;$('scene-mode').parentElement.hidden=next!=='R01';$('scene-mode').hidden=next!=='R01';$('scene-mode').textContent=''+(visualMode==='pixel'?'像素 ⇄ 原画':'原画 ⇄ 像素');$('scene-mode').setAttribute('aria-pressed',String(visualMode==='pixel'));$('scene-mode').setAttribute('aria-label','场景画风：'+(visualMode==='pixel'?'像素，切换为原画':'原画，切换为像素'));")
 html=once(html," on($('paths'),'click'", " on($('scene-mode'),'click',()=>{if(regionId!=='R01')return;visualMode=visualMode==='pixel'?'original':'pixel';delete scene.dataset.region;switchRegion('R01');window.MikageLifeScene?.render(document,snapshot);updateLight();});\n on($('paths'),'click'")
 html=once(html,'window.MikageStatusScene={connect,dispose};',"window.MikageStatusScene={connect,dispose,inspect:()=>({region:regionId,visualMode})};")
 html=once(html,"const at=anchors[d.slot]||[slot.x,slot.y];", "const pixel=doc.getElementById('scene')?.dataset.visualMode==='pixel',world=pixel?window.MikageModularShrine?.slots[d.zone]?.[d.slot]:null;const at=world?[world[0]/768*100,world[1]/512*100]:anchors[d.slot]||[slot.x,slot.y];b.dataset.decoration=d.id;")
 html=once(html,"sprite.setAttribute('aria-hidden','true');", "sprite.setAttribute('aria-hidden','true');const cells={wind_chime:[0,0],zabuton:[1,0],lantern:[2,0],herb_planter:[0,1],flower_vase:[1,1],morning_glory:[2,1]};if(pixel&&cells[d.item]){sprite.classList.add('modular-decor');sprite.style.backgroundPosition=(cells[d.item][0]*50)+'% '+(cells[d.item][1]*100)+'%';}")
 html=once(html,"const offset=point.id==='bell'?[-10,0]:[0,-5];", "const offset=point.id==='bell'?(visualMode==='pixel'&&regionId==='R01'?[-12,-4]:[-10,0]):[0,-5];")
 output=source[:m.start(1)]+json.dumps(html,ensure_ascii=False)+source[m.end(1):];output=once(output,"const version = '1.43.0';","const version = '1.48.0';")
 card=json.loads((base/'card-source.json').read_text());card['character_version']=card['data']['character_version']=VERSION
 for script in card['data']['extensions']['tavern_helper']['scripts']:
  if script['id']=='f763b9d7-c17c-5f0f-b0bd-36d9f37a3383':script.update(name='御影神社·双画风建设 '+VERSION+' CDN',info='默认原画，像素场景可切换；两种画风共享原五项建设状态。原画保留底图并增加附属设施，像素模式使用独立模块和安全导航。')
 spec.update(release=VERSION,source_name='1.47.0/card-source.json',source_sha256=hashlib.sha256((base/'card-source.json').read_bytes()).hexdigest(),shrine_additions={'asset_commit':commit,'source':['src/shrine-additions.js','src/shrine-additions.css','tools/build_shrine_additions.py'],'state':'existing five facility repair states; complete at 4; no writes/migration','backgrounds':'unchanged original 3 periods','navigation':'original unchanged; pixel R01 separate safe navigation; view only switch','host_acceptance':'pending'})
 spec['dual_scene']={'default':'original','switch':'one per-frame view button beneath scene; no game writes','regions':['R01'],'mode_change':'reset actors to selected map spawn','pixel_sources':['src/modular-shrine.js','src/modular-shrine.css','experiments/modular-shrine/scene.mjs'],'original_sources':['src/shrine-additions.js','src/shrine-additions.css'],'tests':['tests/dual-shrine-browser.test.cjs','tests/shrine-scene-fixture.cjs'],'host_acceptance':'pending'}
 for module in spec['modules']:
  if module['module_id']=='scene':module.update(version=VERSION,path='mikage-shrine/releases/'+VERSION+'/scene.mjs',sha256=hashlib.sha256(output.encode()).hexdigest())
 return{'scene.mjs':output,'statusbar.html':html,'card-source.json':json.dumps(card,ensure_ascii=False,indent=2)+'\n','manifest.json':json.dumps(spec,ensure_ascii=False,indent=2)+'\n'}
if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('--asset-commit',required=True);p.add_argument('--dry-run',action='store_true');a=p.parse_args();o=build(a.asset_commit);print(json.dumps({'release':VERSION,'dry_run':a.dry_run,'outputs':{k:len(v.encode()) for k,v in o.items()}}))
 if not a.dry_run:
  out=ROOT/'releases'/VERSION;out.mkdir(exist_ok=True)
  for k,v in o.items():(out/k).write_text(v)
