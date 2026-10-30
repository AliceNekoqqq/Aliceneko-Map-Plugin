#!/usr/bin/env python3
"""1.49.34: remove duplicate prose, put the existing portrait into the scene."""
import argparse,hashlib,json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2];R=ROOT/'mikage-shrine'
BASE=R/'releases/1.49.33';OUT=R/'releases/1.49.34'
dump=lambda x:json.dumps(x,ensure_ascii=False,indent=2)+'\n'
sha=lambda x:hashlib.sha256(x.encode() if isinstance(x,str) else x).hexdigest()
def build():
    m=json.loads((BASE/'manifest.json').read_text());source=(BASE/'card-source.json').read_text();assert sha(source)==m['source_sha256']
    for e in m['modules']:assert sha((ROOT/e['path']).read_bytes())==e['sha256'],e['path']
    scene=next(e for e in m['modules'] if e['module_id']=='scene');old=(ROOT/scene['path']).read_text()
    marker='const StatusbarHTML=';i=old.index(marker)+len(marker);html,n=json.JSONDecoder().raw_decode(old[i:]);original=html;edits=[]
    def change(before,after):
        nonlocal html
        assert html.count(before)==1,before[:100];html=html.replace(before,after,1);edits.append((before,after))
    def style(id,css):
        a=html.index('<style id="'+id+'">');b=html.index('</style>',a)+8;change(html[a:b],'<style id="'+id+'">'+css+'</style>')
    style('mikage-presentation-style',(R/'src/scene-presentation.css').read_text())
    art=json.loads((R/'src/hanagami-art.json').read_text());skin=(R/'src/hanagami-scene.css').read_text()
    for a in art['assets']:
        assert sha((ROOT/a['path']).read_bytes())==a['sha256']
        skin=skin.replace('__HANAGAMI_'+a['id'].upper()+'__','https://cdn.jsdelivr.net/gh/'+m['repository']+'@'+art['commit']+'/'+a['path'])
    assert '__HANAGAMI_' not in skin;style('mikage-hanagami-scene',skin)
    a=html.index('/* Read-only projection. Message prose and MVU facts remain separate authorities. */');b=html.index('/* 1.8 scene controller:',a)
    core=(R/'src/scene-presentation-core.mjs').read_text().replace('export function ','function ')
    runtime=(R/'src/scene-presentation-runtime.mjs').read_text().split('\n',1)[1]
    change(html[a:b],core+'\n'+runtime+'\n')
    a=html.index('<section class="vn-dialogue"');b=html.index('<nav class="scene-dock"',a)+len('<nav class="scene-dock"')
    change(html[a:b],'<nav class="scene-dock"')
    anchor='<div class="scene" id="scene" data-light="warm" aria-label="像素神社庭院">'
    portrait='<div class="scene-portrait" id="scene-portrait" hidden aria-hidden="true"><img id="scene-portrait-image" alt="" decoding="async"></div>'
    change(anchor,anchor+'\n '+portrait)
    inverse=html
    for before,after in reversed(edits):assert inverse.count(after)==1;inverse=inverse.replace(after,before,1)
    assert inverse==original,'Only the declared presentation surfaces may change'
    for token in ['vn-dialogue','vn-preview','vn-full','vn-toggle','getNarrative']:assert token not in html,token
    code=old[:i]+json.dumps(html,ensure_ascii=False)+old[i+n:]
    getter='''      async getNarrative(){
        if(!live())return {status:'stale',text:''};
        const current=rowAt(scene.id);
        if(!current||current.swipe!==scene.swipe)return {status:'stale',text:''};
        return typeof current.row.message==='string'?{status:'ready',text:current.row.message}:{status:'unavailable',text:''};
      },
'''
    assert code.count(getter)==1;code=code.replace(getter,'',1)
    assert code.count("const version = '1.49.32';")==1;code=code.replace("const version = '1.49.32';","const version = '1.49.34';",1)
    # Compare the complete outer host, apart from the retired prose getter/version.
    prefix=old[:i].replace("const version = '1.49.32';","const version = '1.49.34';",1)
    suffix=old[i+n:].replace(getter,'',1)
    assert code==prefix+json.dumps(html,ensure_ascii=False)+suffix
    card=json.loads(source);script=next(s for s in card['data']['extensions']['tavern_helper']['scripts'] if s['id']==scene['script_id'])
    script['name']=script['name'].replace('1.49.32','1.49.34');script['info']+='\n1.49.34：正文仅在酒馆原位置阅读，立绘并入场景；菜单与当前委托紧接场景。'
    scene.update(version='1.49.34',path='mikage-shrine/releases/1.49.34/scene.mjs',sha256=sha(code))
    card['character_version']=card['data']['character_version']='1.49.34';book=card['data']['character_book'];book['description']=book['description'].replace('v1.49.33','v1.49.34')
    notes=card['data']['creator_notes'].replace('v1.49.33','v1.49.34')+'\n\n【场景布局 1.49.34】\n正常正文在酒馆原消息位置阅读；状态栏移除重复正文摘录、全文与展开按钮，原立绘并入场景右侧前景，沿同地点与当前衣装显示。立绘不接收点击，原小人与地点热点保留；菜单、委托和折叠工具保持。未新增模型调用或游戏写入，六个脚本继续固定Git加载。真实酒馆与手机验收仍待完成。'
    card['data']['creator_notes']=notes
    m.update(release='1.49.34',source_name='1.49.34/card-source.json',source_sha256=sha(dump(card)))
    m['bound_worldbook'].update(source='mikage-shrine/releases/1.49.34/card-source.json',version='1.49.34',entry_sha256=sha(dump(book['entries'])))
    m['creator_notes'].update(source='mikage-shrine/releases/1.49.34/creator-notes.md',sha256=sha(notes))
    m['ema_integration']['bound_worldbook']['version']='1.49.34';m['reviewed_copy']['preserved_worldbook_version']='1.49.34'
    m['checkpoint'].update(base='1.49.33',plan='mikage-shrine/releases/1.49.34/plan.json',gameplay='unchanged; remove duplicate prose and move portrait into scene',real_host='pending')
    m['scene_presentation'].update(prose='original chat message only; no duplicate prose UI or narrative getter',portrait='existing current outfit in scene foreground; same-location state only',model_calls=0,source_files=['mikage-shrine/src/scene-presentation-core.mjs','mikage-shrine/src/scene-presentation-runtime.mjs','mikage-shrine/src/scene-presentation.css','mikage-shrine/src/hanagami-scene.css'])
    plan={'base':'1.49.33','target':'1.49.34','delivery':'full-card checkpoint continuation; immutable Git loaders','user_choice':'立绘并入场景（推荐）; normal prose stays in original chat position','design':'drawn before implementation; foreground portrait and direct menu/task succession','scope':['scene presentation HTML/CSS/core/runtime','remove unused outer narrative getter','scene version and card metadata'],'preserve':['all original prose DOM and message data','scene original 1.8 controller and hotspots','five other modules including archive1.49.33','39worldbook entries/5regexes/6script IDs','all gameplay/API/persistence/art URLs'],'checks':['deterministic build and inverse scope checks','state-only projection','whole-message browser preview','320/375/760 widths and short screen','portrait/outfit/co-location/failure','hotspot hit testing/navigation/scope/lifecycle','actual-source GIF','package and Git object parity'],'routing':{'mode':'manual','standing':'ST-A0 reused','guides':['ST-C2','ST-D7'],'prior_reused':['ST-A2','ST-D1','ST-D4'],'deterministic_router_run':False},'real_host':'pending','driver_accepted':False,'author_accepted':False}
    return {'scene.mjs':code,'statusbar.html':html,'card-source.json':dump(card),'manifest.json':dump(m),'creator-notes.md':notes,'plan.json':dump(plan)}
if __name__=='__main__':
    ap=argparse.ArgumentParser(description=__doc__);ap.add_argument('--dry-run',action='store_true');ap.add_argument('--check',action='store_true');a=ap.parse_args();outputs=build()
    if a.check:
        for n,t in outputs.items():assert (OUT/n).read_text()==t,n
    elif not a.dry_run:
        OUT.mkdir(parents=True,exist_ok=True)
        for n,t in outputs.items():(OUT/n).write_text(t)
    print(dump({'dry_run':a.dry_run,'check':a.check,'files':{n:{'bytes':len(t.encode()),'sha256':sha(t)} for n,t in outputs.items()}}))
