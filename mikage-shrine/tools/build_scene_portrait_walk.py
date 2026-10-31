#!/usr/bin/env python3
"""Build1.49.37 separate map and portrait views; preserve scene controller."""
import argparse,hashlib,json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2];R=ROOT/'mikage-shrine';BASE=R/'releases/1.49.36';OUT=R/'releases/1.49.37'
dump=lambda x:json.dumps(x,ensure_ascii=False,indent=2)+'\n'
sha=lambda x:hashlib.sha256(x.encode() if isinstance(x,str) else x).hexdigest()
def build():
    m=json.loads((BASE/'manifest.json').read_text());source=(BASE/'card-source.json').read_text();assert sha(source)==m['source_sha256']
    for e in m['modules']:assert sha((ROOT/e['path']).read_bytes())==e['sha256']
    entry=next(e for e in m['modules'] if e['module_id']=='scene');old=(ROOT/entry['path']).read_text()
    a=old.index('const catalog=')+len('const catalog=');catalog,_=json.JSONDecoder().raw_decode(old[a:]);frames=json.loads((R/'src/scene-portrait-framing.json').read_text())
    outfits=catalog['actors']['tomoe']['outfits'];assert set(frames['outfits'])=={o['id'] for o in outfits}
    media=[]
    for o in outfits:
        f=frames['outfits'][o['id']];src=f['source'];assert src['url']==catalog['assets'][o['portrait']]
        assert f['width']==o['portraitMetrics']['width'] and f['height']==o['portraitMetrics']['height']
        assert len(src['sha256'])==64 and src['bytes']>0 and src['url'].startswith('https://')
        if f['mode']=='adult':assert 0<=f['eye'][0]<f['width'] and 0<=f['eye'][1]<f['chin']<f['height']
        else:assert f['mode']=='small' and 0<=f['bounds'][1]<f['bounds'][3]<=f['height']
        media.append({'id':'tomoe-'+o['id'],'kind':'image','source':{'type':'remote','url':src['url']},'bytes':src['bytes'],'sha256':src['sha256'],'preload':'on-demand','lifetime':'message','fallbackAssetId':None})
    marker='const StatusbarHTML=';i=old.index(marker)+len(marker);html,n=json.JSONDecoder().raw_decode(old[i:]);original=html;edits=[]
    def change(before,after):
        nonlocal html
        assert html.count(before)==1,before[:80];html=html.replace(before,after,1);edits.append((before,after))
    a=html.index('<style id="mikage-presentation-style">');b=html.index('</style>',a)+8
    change(html[a:b],'<style id="mikage-presentation-style">'+(R/'src/scene-presentation.css').read_text()+'</style>')
    change('<div class="skin-map skin-segment">','<div class="scene-view-switch" role="group" aria-label="场景视图"><button type="button" id="scene-walk-view" aria-pressed="true" aria-controls="scene">庭院漫步</button><button type="button" id="scene-portrait-view" aria-pressed="false" aria-controls="portrait-view" disabled>巴卫立绘</button></div><div class="skin-map skin-segment">')
    change('<div class="scene" id="scene" data-light="warm" aria-label="像素神社庭院">\n <div class="scene-portrait" id="scene-portrait" hidden aria-hidden="true"><img id="scene-portrait-image" alt="" decoding="async"></div>','<div class="scene" id="scene" data-light="warm" aria-label="像素神社庭院">\n ')
    change('</div>\n</div><div class="scene-mode-bar">','</div>\n<section id="portrait-view" class="portrait-view" aria-label="巴卫立绘" hidden><div class="scene-portrait" id="scene-portrait" hidden aria-hidden="true"><img id="scene-portrait-image" alt="" decoding="async"></div><div class="portrait-caption"><strong>巴卫</strong><span id="portrait-outfit-name"></span></div></section>\n</div><div class="scene-mode-bar">')
    change('<div class="scene-mode-bar"><span>神社画风</span><button type="button" id="scene-mode" class="scene-mode" aria-pressed="false">画风·原画</button></div>','<div class="scene-mode-bar"><div class="scene-art-controls"><span>神社画风</span><button type="button" id="scene-mode" class="scene-mode" aria-pressed="false">画风·原画</button></div><div id="scene-return-controls" hidden><span>人物展示</span><button type="button" class="scene-mode" id="scene-return" aria-controls="scene">返回庭院</button></div><span id="scene-walk-hint" hidden>点击地面让小人走过去</span></div>')
    a=html.index('const SCENE_PORTRAIT_FRAMING=');b=html.index('/* 1.8 scene controller:',a)
    core=(R/'src/scene-presentation-core.mjs').read_text().replace('export function ','function ')
    runtime=(R/'src/scene-presentation-runtime.mjs').read_text().split('\n',1)[1]
    change(html[a:b],'const SCENE_PORTRAIT_FRAMING='+json.dumps(frames,ensure_ascii=False)+';\n'+core+'\n'+runtime+'\n')
    inverse=html
    for before,after in reversed(edits):assert inverse.count(after)==1;inverse=inverse.replace(after,before,1)
    assert inverse==original
    code=old[:i]+json.dumps(html,ensure_ascii=False)+old[i+n:]
    assert code.count("const version = '1.49.36';")==1;code=code.replace("const version = '1.49.36';","const version = '1.49.37';",1)
    assert code==old[:i].replace("const version = '1.49.36';","const version = '1.49.37';",1)+json.dumps(html,ensure_ascii=False)+old[i+n:]
    card=json.loads(source);script=next(s for s in card['data']['extensions']['tavern_helper']['scripts'] if s['id']==entry['script_id'])
    script['name']=script['name'].replace('1.49.36','1.49.37');script['info']+='\n1.49.37：庭院漫步与巴卫立绘分为独立视图，默认完整地图；切换查看立绘，再回原处走路。'
    entry.update(version='1.49.37',path='mikage-shrine/releases/1.49.37/scene.mjs',sha256=sha(code))
    card['character_version']=card['data']['character_version']='1.49.37';book=card['data']['character_book'];book['description']=book['description'].replace('v1.49.36','v1.49.37')
    notes=card['data']['creator_notes'].replace('v1.49.36','v1.49.37')+'\n\n【庭院与立绘分视图1.49.37】\n默认庭院漫步显示完整地图、小人、热点与步行路径。顶部切换巴卫立绘后，同一区域显示纸面人物展示，地图及其走路控件同时收起；回到庭院继续原处走路。立绘保留17套原衣装，统一比例且头顶和两侧完整。状态刷新与换装保留当前视图；巴卫离开同地点时回到庭院。视图选择仅在当前界面内存中保持。正文仍在上方，原地图控制器、故事存档与玩法保持，无新增模型请求。真实酒馆和Android验收仍待完成。'
    card['data']['creator_notes']=notes;m.update(release='1.49.37',source_name='1.49.37/card-source.json',source_sha256=sha(dump(card)))
    m['bound_worldbook'].update(source='mikage-shrine/releases/1.49.37/card-source.json',version='1.49.37',entry_sha256=sha(dump(book['entries'])))
    m['creator_notes'].update(source='mikage-shrine/releases/1.49.37/creator-notes.md',sha256=sha(notes));m['ema_integration']['bound_worldbook']['version']='1.49.37';m['reviewed_copy']['preserved_worldbook_version']='1.49.37'
    m['checkpoint'].update(base='1.49.36',plan='mikage-shrine/releases/1.49.37/plan.json',gameplay='unchanged; mutually exclusive map and portrait views',real_host='pending')
    m['scene_portrait_framing']={'source':'mikage-shrine/src/scene-portrait-framing.json','sha256':sha(dump(frames)),'visible_bounds_alpha_threshold':16,'adult_count':16,'small_count':1,'new_image_bytes':0,'images':'existing immutable URLs; on demand','model_calls_added':0,'real_host':'pending'}
    plan={'base':'1.49.36','target':'1.49.37','delivery':'full-card checkpoint; fixed Git loaders','cause':'foreground character obscures map/player visibility even with pointer pass-through','design':'default unobscured walk map; exclusive same-area paper portrait showcase; shared nav/task below','scope':['two44px view buttons','portrait moved outside walking scene','dedicated paper view with17original outfits','lazy portrait load and ephemeral view state'],'preserve':['complete original scene controller and walk engine','17outfit assets','normal prose','five other modules','39worldbook entries/5regexes/6script IDs/gameplay'],'checks':['guarded build/inverse scope','default map and real movement in ten regions','view exclusivity and walk position retained','17outfits at3widths','refresh/outfit/offsite/failure/swipe/cleanup','actual-source GIFs and final Git package'],'paid_model_calls_added':0,'real_host':'pending','driver_accepted':False,'author_accepted':False}
    return {'scene.mjs':code,'statusbar.html':html,'card-source.json':dump(card),'manifest.json':dump(m),'creator-notes.md':notes,'plan.json':dump(plan),'media-manifest.json':dump({'schemaVersion':1,'cardId':'mikage-shrine','assets':media})}
if __name__=='__main__':
    ap=argparse.ArgumentParser(description=__doc__);ap.add_argument('--dry-run',action='store_true');ap.add_argument('--check',action='store_true');a=ap.parse_args();out=build()
    if a.check:
        for n,t in out.items():assert (OUT/n).read_text()==t,n
    elif not a.dry_run:
        OUT.mkdir(parents=True,exist_ok=True)
        for n,t in out.items():(OUT/n).write_text(t)
    print(dump({'dry_run':a.dry_run,'check':a.check,'files':{n:{'bytes':len(t.encode()),'sha256':sha(t)} for n,t in out.items()}}))
