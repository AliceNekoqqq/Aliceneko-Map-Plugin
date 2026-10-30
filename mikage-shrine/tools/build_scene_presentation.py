#!/usr/bin/env python3
"""Build the visual-only 1.49.29 checkpoint from verified 1.49.28 sources."""
import argparse, hashlib, json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
R=ROOT/'mikage-shrine'
BASE=R/'releases/1.49.28'
OUT=R/'releases/1.49.29'
dump=lambda x:json.dumps(x,ensure_ascii=False,indent=2)+'\n'
sha=lambda x:hashlib.sha256(x.encode() if isinstance(x,str) else x).hexdigest()

def once(text, old, new):
    assert text.count(old)==1, f'Expected exactly one patch anchor: {old[:100]}'
    return text.replace(old,new,1)

def build():
    manifest=json.loads((BASE/'manifest.json').read_text())
    source=(BASE/'card-source.json').read_text()
    assert sha(source)==manifest['source_sha256'], 'Baseline source changed'
    for m in manifest['modules']:
        assert sha((ROOT/m['path']).read_bytes())==m['sha256'],m['path']
    scene=next(m for m in manifest['modules'] if m['module_id']=='scene')
    code=(ROOT/scene['path']).read_text()
    marker='const StatusbarHTML='
    start=code.index(marker)+len(marker)
    html,end=json.JSONDecoder().raw_decode(code[start:])
    html=html.replace('\n \n','\n\n')
    css=(R/'src/scene-presentation.css').read_text()
    core=(R/'src/scene-presentation-core.mjs').read_text().replace('export function ','function ')
    runtime=(R/'src/scene-presentation-runtime.mjs').read_text().split('\n',1)[1]
    html=once(html,'</head>','<style id="mikage-presentation-style">'+css+'</style></head>')
    dialogue='''<section class="vn-dialogue" id="vn-dialogue" data-portrait="false" aria-label="本楼正文阅读">
<div class="vn-portrait" id="vn-portrait" hidden><img id="vn-portrait-image" alt="巴卫立绘" decoding="async"></div>
<div class="vn-heading"><h2 class="vn-speaker" id="vn-speaker">本轮正文</h2><span class="vn-context" id="vn-context"></span></div>
<p class="vn-preview" id="vn-preview">正在读取本楼正文…</p><div class="vn-actions"><button type="button" class="vn-toggle" id="vn-toggle" aria-controls="vn-full" aria-expanded="false" disabled>展开正文</button></div>
<div class="vn-full" id="vn-full" hidden role="region" aria-label="本楼完整正文" tabindex="0"></div></section>'''
    html=once(html,'<nav class="scene-dock"',dialogue+'<nav class="scene-dock"')
    html=once(html,'<div id="scene-dock-anchor"></div>','<p class="vn-task"><strong>当前委托</strong><span id="vn-task-text">记录待就绪</span></p><div id="scene-dock-anchor"></div>')
    html=once(html,'<section class="game-ledger"','<details id="vn-records" class="vn-records"><summary>神社记录与场景工具</summary><section class="game-ledger"')
    # Wrap only the original ledger, leave its following sheets and watermark intact.
    p=html.index('<section class="game-ledger"');close=html.index('</section>',p)
    html=html[:close]+html[close:].replace('</section>','</section></details>',1)
    html=once(html,'<div class="scene-background life-region-art"','<div id="vn-transition" class="vn-transition" hidden aria-hidden="true"><strong id="vn-location"></strong><span id="vn-location-meta"></span></div><div class="scene-background life-region-art"')
    html=once(html,'/* 1.8 scene controller:',core+'\n'+runtime+'\n/* 1.8 scene controller:')
    html=once(html,'bridge=next;window.MikageStatusBridge=next;','bridge=next;window.MikageStatusBridge=next;window.MikagePresentation?.connect(next);')
    html=once(html,'renderBuildings();updateLight();scheduleWander();reportHeight();}','renderBuildings();updateLight();scheduleWander();window.MikagePresentation?.render(snapshot);reportHeight();}')
    html=once(html,'function dispose(){if(disposed)return;window.MikageModularShrine','function dispose(){if(disposed)return;window.MikagePresentation?.dispose();window.MikageModularShrine')
    code=code[:start]+json.dumps(html,ensure_ascii=False)+code[start+end:]
    code=once(code,"const version = '1.49.15';","const version = '1.49.29';")
    code=once(code,'  function rowAt(id){','''  function selectedRow(row){
    const id=Number(row?.message_id);
    if(!Number.isInteger(id)||id<0||!roleIsAssistant(row))return null;
    const swipe=Number(row.swipe_id??0);
    if(!Number.isInteger(swipe)||swipe<0)return null;
    if(Array.isArray(row.swipes)&&typeof row.swipes[swipe]!=='string')return null;
    const selected={...row,message:Array.isArray(row.swipes)?row.swipes[swipe]:row.message,data:Array.isArray(row.swipes_data)?row.swipes_data[swipe]:row.data};
    return {id,swipe,row:selected};
  }
  function rowAt(id){''')
    code=once(code,'getChatMessages(id,{include_swipes:false})','getChatMessages(id,{include_swipes:true})')
    code=once(code,'return {id,swipe:Number(row.swipe_id??0),row};','return selectedRow(row);')
    code=once(code,'getChatMessages(`${from}-${last}`,{include_swipes:false})','getChatMessages(`${from}-${last}`,{include_swipes:true})')
    code=once(code,'for(const row of rows){const id=Number(row?.message_id);','for(const raw of rows){const selected=selectedRow(raw);if(!selected)continue;const {id,swipe,row}=selected;')
    code=once(code,'const meta={id,swipe:Number(row.swipe_id??0)};','const meta={id,swipe};')
    code=once(code,'Math.min(1600,Math.ceil(n))','Math.min(2400,Math.ceil(n))')
    code=once(code,'async getState(){if(!live())return null;return exactData(scene);},','''async getState(){if(!live())return null;return exactData(scene);},
      async getNarrative(){
        if(!live())return {status:'stale',text:''};
        const current=rowAt(scene.id);
        if(!current||current.swipe!==scene.swipe)return {status:'stale',text:''};
        return typeof current.row.message==='string'?{status:'ready',text:current.row.message}:{status:'unavailable',text:''};
      },''')
    card=json.loads(source)
    script=next(s for s in card['data']['extensions']['tavern_helper']['scripts'] if s['id']==scene['script_id'])
    script['name']=script['name'].replace('1.49.15','1.49.29')
    script['info']+='\n1.49.29：主场景、正文阅读框、同地点巴卫立绘、地点轻转场；仅展示，不调用模型。'
    card['character_version']=card['data']['character_version']='1.49.29'
    book=card['data']['character_book'];book['description']=book['description'].replace('v1.49.28','v1.49.29')
    notes=card['data']['creator_notes'].replace('v1.49.28','v1.49.29')
    notes+='\n\n【视觉演出 1.49.29】\n主场景采用原有美术，纸面阅读框读取本楼当前消息页正文，展开可查看过滤控制标记后的全文。巴卫与玩家位置相符时显示现有立绘，只有明确署名的台词才标成“巴卫”；其余保留“本轮正文”。六个原入口收成一排，神社数值与原有工具折叠在“神社记录与场景工具”。同一场景页面的剧情地点变化时轻转场，系统减少动态效果时关闭。所有操作只改变显示，不增加生成调用；原任务档案与独立API设置沿用。\n卡内仍只有固定Git提交加载器；新增界面代码在Git场景模块中。浏览器模拟宿主检查可验证布局和消息页隔离，真实酒馆及手机仍待实机验收。'
    card['data']['creator_notes']=notes
    manifest.update(release='1.49.29',source_name='1.49.29/card-source.json',source_sha256=sha(dump(card)))
    scene.update(version='1.49.29',path='mikage-shrine/releases/1.49.29/scene.mjs',sha256=sha(code))
    manifest['bound_worldbook'].update(source='mikage-shrine/releases/1.49.29/card-source.json',version='1.49.29',entry_sha256=sha(dump(book['entries'])))
    manifest['creator_notes'].update(source='mikage-shrine/releases/1.49.29/creator-notes.md',sha256=sha(notes))
    manifest['ema_integration']['bound_worldbook']['version']='1.49.29'
    manifest['reviewed_copy']['preserved_worldbook_version']='1.49.29'
    manifest['checkpoint'].update(base='1.49.28',plan='mikage-shrine/releases/1.49.29/plan.json',gameplay='unchanged; read-only scene presentation',real_host='pending')
    manifest['scene_presentation']={'model_calls':0,'surface':'existing per-message iframe','state':'exact message floor and selected swipe MVU stat_data','prose':'same floor and selected swipe message; textContent only','assets':'existing immutable asset catalog; no generated mockup used as runtime art','source_files':['mikage-shrine/src/scene-presentation-core.mjs','mikage-shrine/src/scene-presentation-runtime.mjs','mikage-shrine/src/scene-presentation.css'],'real_host':'pending'}
    plan={'base':'1.49.28','target':'1.49.29','delivery':'full-card checkpoint with Git loaders only','adopted_design':['existing shrine stage dominant','paper dialogue plus existing portrait when co-located','six existing navigation entries in one row','existing ledger/tools collapsed','read-only location transition; reduced-motion opt-out'],'preserve':['all 39 worldbook entry bodies and settings','MVU and initialization','task archive default and optional API','five other runtime modules','all five regexes','existing gameplay and assets'],'checks':['prose and same-floor/swipe projection','actual maintained HTML browser integration at 320/375/760px','lifecycle, resource failure and reduced motion','packed source parity and all module hashes'],'real_host':'pending'}
    return {'scene.mjs':code,'statusbar.html':html,'card-source.json':dump(card),'manifest.json':dump(manifest),'creator-notes.md':notes,'plan.json':dump(plan)}

if __name__=='__main__':
    ap=argparse.ArgumentParser(description=__doc__);ap.add_argument('--check',action='store_true');args=ap.parse_args()
    outputs=build()
    if args.check:
        for name,text in outputs.items():assert (OUT/name).read_text()==text,name
    else:
        OUT.mkdir(parents=True,exist_ok=True)
        for name,text in outputs.items():(OUT/name).write_text(text)
    print(dump({'checked':args.check,'files':{n:{'bytes':len(t.encode()),'sha256':sha(t)} for n,t in outputs.items()}}))
