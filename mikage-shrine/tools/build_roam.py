#!/usr/bin/env python3
"""Build the 1.8 scene from reviewable HTML/CSS/JS; no network or upload."""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / 'src'

def literal(text):
    return json.dumps(text, ensure_ascii=False).replace('</', '<\\/')

def replace_literal(text, name, value):
    pattern = r'(const ' + re.escape(name) + r'=)("(?:[^"\\]|\\.)*")'
    result, count = re.subn(pattern, lambda m: m[1] + literal(value), text, count=1)
    if count != 1:
        raise ValueError('Missing unique HTML document: '+name)
    return result

def build():
    html = (SRC / 'statusbar-base.html').read_text()
    # Replace the old rectangular walker, retain the art and snapshot bridges.
    html = re.sub(r'<script>/\* Scene presentation only:.*?</script>', '', html, flags=re.S)
    dock = '''<nav class="scene-dock" aria-label="神社随身手帖">
      <button class="dock-button" id="map" data-open="map" aria-label="打开大地图">@map@<span>地图</span></button>
      <button class="dock-button" id="ema" data-open="board" aria-label="打开绘马板">@ema@<span>绘马</span><i class="notice" id="ema-notice" hidden></i></button>
      <button class="dock-button" id="wardrobe" data-open="wardrobe" aria-label="打开衣柜">@wardrobe@<span>衣柜</span></button>
      <button class="dock-button" id="life" data-open="life" aria-label="打开布置与生活">@life@<span>生活</span></button>
      <button class="dock-button" id="journal-button" aria-expanded="false" aria-label="打开散策手帖">@journal@<span>小记</span></button>
      <button class="dock-button" id="buildings" aria-expanded="false" aria-label="打开修缮手帖">@repair@<span>修缮</span></button>
    </nav><div id="scene-dock-anchor"></div><section id="prop-sheet" class="prop-sheet" hidden></section><div id="roam-toast" class="roam-toast" role="status" hidden>@flower@<span id="roam-toast-text"></span></div>
    <section id="roam-activity" class="roam-activity" hidden aria-label="此地散策"></section>
    <section id="roam-journal" class="roam-journal" hidden aria-label="散策手帖"><header><h3>散策小记 <small id="journal-count"></small></h3><button id="close-journal" aria-label="收起散策手帖">@close@</button></header><p>把喜欢的一幕留在这里，也可以带入接下来的对话。</p><div class="memory-grid" id="memory-grid"></div></section>'''
    html = re.sub(r' <button class="world-object.*?</button>\n', '', html)
    html = re.sub(r' <button class="pond".*?</button>', '', html)
    # The notice now belongs to the reachable dock entry; no duplicate IDs.
    html = html.replace('<section class="game-ledger"', dock + '\n<section class="game-ledger"', 1)
    tools = '''<div class="scene-tools"><button id="moment" aria-label="此地散策"></button><button id="paths" aria-pressed="false" aria-label="显示可走的小路">@route@<span>小路</span></button><button id="wander" aria-pressed="true" aria-label="巴卫自主漫步：开">@wander@<span>漫步</span></button><button id="lantern" aria-pressed="false" aria-label="景色随剧情时段变化，点击预览白天">@moon@<span>自动</span></button><button id="retry" aria-label="重读本楼记录" hidden>@retry@<span>重读</span></button><span id="mood">巴卫 · —</span></div>'''
    html = re.sub(r'<div class="scene-tools">.*?</div>', lambda _: tools, html, count=1)
    html = html.replace('<div class="weather"', '<svg class="path-ink" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><g id="walk-areas" class="walk-areas"></g><path id="walk-line" class="walk-line"/></svg><div class="weather"', 1)
    # Stored decoration slots are display coordinates, not movement coordinates.
    html = html.replace("b.style.left=slot.x+'%';b.style.top=slot.y+'%';", "const anchors={north_eave:[84,22],south_eave:[91,34],floor_left:[84,81],floor_right:[93,67],garden_edge:[22,70],stone_path:[48,78],gate_eave:[29,39],gate_stand:[20,65],seat_left:[78,88],seat_right:[86,88]};const at=anchors[d.slot]||[slot.x,slot.y];b.style.left=at[0]+'%';b.style.top=at[1]+'%';")
    css = '\n'.join((SRC / name).read_text() for name in ['roam.css', 'activities.css'])
    daylight = 'window.MikageTimeSceneCatalog='+literal(json.loads((SRC / 'time-scenes.json').read_text()))+';\n'+(SRC / 'time-of-day.js').read_text()
    js = daylight+'\n'+'\n'.join((SRC / name).read_text() for name in ['icons.js','navigation.js','activities.js','roam-controller.js','dev-ui.js'])
    html = html.replace('</head>', '<style>\n'+css+'\n</style></head>')
    html = html.replace('</body>', '<script>\n'+js.replace('</script', '<\\/script')+'\n</script></body>')
    # Resolve the exact same shared SVGs into the static dock, without a runtime
    # innerHTML renderer that could rebuild controls and lose focus/listeners.
    icon_source = (SRC / 'icons.js').read_text()
    icons = dict(re.findall(r"^    (\w+): '([^']*)',", icon_source, flags=re.M))
    for name, path in icons.items():
        svg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+path+'</svg>'
        html = html.replace('@'+name+'@', svg)
    (SRC / 'statusbar.html').write_text(html)
    scene = (SRC / 'scene-host.mjs').read_text()
    scene = replace_literal(scene, 'StatusbarHTML', html)
    scene = replace_literal(scene, 'OpeningHTML', (SRC / 'opening.html').read_text())
    mvu = (ROOT / 'runtime/mvu.mjs').read_text()
    offset = mvu.index('const ShrineInitial = ') + len('const ShrineInitial = ')
    initial, _ = json.JSONDecoder().raw_decode(mvu[offset:])
    sandbox = (SRC / 'dev-sandbox.js').read_text().replace('__MIKAGE_INITIAL__', json.dumps(initial, ensure_ascii=False))
    scene = scene.replace('export function start() {', 'export function start() {\n'+sandbox, 1)
    (ROOT / 'runtime/scene.mjs').write_text(scene)
    panel = (SRC / 'panels-base.html').read_text()
    preview = {
      'R01':['sweep','庭前拾叶','把落叶拢进竹篮，留一点沙沙的秋色。'],
      'R02':['cat','坂道寻猫','蹲下来慢慢等，让猫决定靠近的距离。'],
      'R03':['dango','三色小签','选三颗喜欢的颜色，搭一串今天的心情。'],
      'R04':['boat','清溪纸舟','折一只小船，看水流带它绕过石头。'],
      'R05':['ticket','候车票根','挑方向与小印章，留一张纪念旅票。'],
      'R06':['postcard','海风邮便','留在临海站台上，把海景拼进明信片。'],
      'R07':['leaves','林间叶拓','找三种叶片，用喜欢的颜色拓下叶脉。'],
      'R08':['firefly','微光同行','走在木栈道上，回应芦苇间的小小萤光。'],
      'R09':['drum','太鼓三拍','先看图样，再敲鼓心或鼓沿，也能自由合奏。'],
      'R10':['lantern','灯下归途','选暖金、樱粉或青灯，配出自己的灯火。'],
    }
    snippet = '''
    const experiences = %s;
    const entry=experiences[id];
    if(entry){const box=make('section','place-experience');const mark=make('span','experience-mark');mark.innerHTML=window.MikageIcon(entry[0]);const body=make('div','experience-copy');body.append(make('small','','此地散策'),make('strong','',entry[1]),make('p','',entry[2]));box.append(mark,body);card.append(box,make('p','experience-guide',isCurrent?'回到场景，走近发光的小图标就能体验。':'抵达后，场景里会出现这段小小的体验。'));}
    ''' % json.dumps(preview, ensure_ascii=False)
    panel = panel.replace('    card.append(travel);', '    card.append(travel);\n'+snippet, 1)
    panel_css = '''.life-region-art{aspect-ratio:3/2!important}.place-experience{display:flex;gap:13px;border-top:1px solid #c9bea0;border-bottom:1px solid #d8ccb0;padding:14px 2px;margin:17px 0 5px}.experience-mark{width:42px;height:42px;border-radius:50%%;display:grid;place-items:center;background:#e2e8d5;color:#718567;flex:none}.experience-mark svg{width:23px;height:23px}.experience-copy{min-width:0}.experience-copy small{display:block;font-size:9px;letter-spacing:2px;color:#9a8c6d}.experience-copy strong{display:block;font-size:15px;letter-spacing:2px;color:#5c6b4e;margin-top:5px;font-weight:500}.experience-copy p{margin:5px 0 0;font-size:11px;line-height:1.8}.place-card .experience-guide{font-size:10px;color:#978b72}'''.replace('50%%','50%')
    panel = panel.replace('</head>', '<style>'+panel_css+'</style></head>')
    panel = panel.replace('<script>', '<script>'+daylight+'\n'+icon_source+'</script><script>', 1)
    (SRC / 'panels.html').write_text(panel)
    panel_module = replace_literal((SRC / 'panels-host.mjs').read_text(), 'MikagePanelHTML', panel)
    (ROOT / 'runtime/panels.mjs').write_text(panel_module)
    return html

if __name__ == '__main__':
    result = build()
    print(json.dumps({'version':'1.10.0','statusbarBytes':len(result.encode()),'source':'src/statusbar.html'}))
