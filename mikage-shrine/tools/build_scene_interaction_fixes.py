#!/usr/bin/env python3
"""Build1.49.38 focused fixes for view lifecycle, portrait recovery and labels."""
import argparse,hashlib,json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2];R=ROOT/'mikage-shrine';BASE=R/'releases/1.49.37';OUT=R/'releases/1.49.38'
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
    change('>庭院漫步</button>','>场景漫步</button>')
    change('>返回庭院</button>','>返回场景</button>')
    change('id="scene-portrait-view" aria-pressed=', 'id="scene-portrait-view" aria-describedby="scene-view-status" aria-pressed=')
    change('</button></div><div class="skin-map skin-segment">','</button></div><div id="scene-view-notice" class="scene-view-notice" hidden><p id="scene-view-status" role="status" aria-live="polite"></p><button type="button" id="scene-portrait-retry" aria-controls="portrait-view" hidden>重试加载</button></div><div class="skin-map skin-segment">')
    maintained=(R/'src/statusbar.html').read_text()
    for signature in [' function active(){',' function walkTogether(',' function pause(']:
        old_lines=[l for l in html.splitlines() if l.startswith(signature)];new_lines=[l for l in maintained.splitlines() if l.startswith(signature)]
        assert len(old_lines)==len(new_lines)==1,signature
        change(old_lines[0],new_lines[0])
    lifecycle=[l for l in maintained.splitlines() if "on(root,'mikage:scene-view'" in l];assert len(lifecycle)==1
    change(" on($('walk-zone'),'pointerdown'",lifecycle[0]+"\n on($('walk-zone'),'pointerdown'")
    a=html.index('const SCENE_PORTRAIT_FRAMING=');b=html.index('/* 1.8 scene controller:',a)
    core=(R/'src/scene-presentation-core.mjs').read_text().replace('export function ','function ')
    runtime=(R/'src/scene-presentation-runtime.mjs').read_text().split('\n',1)[1]
    change(html[a:b],'const SCENE_PORTRAIT_FRAMING='+json.dumps(frames,ensure_ascii=False)+';\n'+core+'\n'+runtime+'\n')
    inverse=html
    for before,after in reversed(edits):assert inverse.count(after)==1;inverse=inverse.replace(after,before,1)
    assert inverse==original
    code=old[:i]+json.dumps(html,ensure_ascii=False)+old[i+n:]
    assert code.count("const version = '1.49.37';")==1;code=code.replace("const version = '1.49.37';","const version = '1.49.38';",1)
    assert code==old[:i].replace("const version = '1.49.37';","const version = '1.49.38';",1)+json.dumps(html,ensure_ascii=False)+old[i+n:]
    card=json.loads(source);script=next(s for s in card['data']['extensions']['tavern_helper']['scripts'] if s['id']==entry['script_id'])
    script['name']=script['name'].replace('1.49.37','1.49.38');script['info']+='\n1.49.38：立绘页暂停地图移动和抵达互动，返回场景后恢复；图片失败支持直接重试，异地显示原因；跨地区使用场景标签。'
    entry.update(version='1.49.38',path='mikage-shrine/releases/1.49.38/scene.mjs',sha256=sha(code))
    card['character_version']=card['data']['character_version']='1.49.38';book=card['data']['character_book'];book['description']=book['description'].replace('v1.49.37','v1.49.38')
    notes=card['data']['creator_notes'].replace('v1.49.37','v1.49.38')+'\n\n【双视图交互修复1.49.38】\n查看立绘时暂停地图移动与抵达互动；返回场景后沿原路线恢复，待抵达互动只执行一次。图片失败回场景，显示失败原因并可直接重试加载；巴卫异地时显示具体原因。场景按钮统一使用跨地区名称。沿用17套原图及构图、正文位置、故事规则和Git加载，不新增模型调用。真实酒馆与Android验收仍待完成。'
    card['data']['creator_notes']=notes;m.update(release='1.49.38',source_name='1.49.38/card-source.json',source_sha256=sha(dump(card)))
    m['bound_worldbook'].update(source='mikage-shrine/releases/1.49.38/card-source.json',version='1.49.38',entry_sha256=sha(dump(book['entries'])))
    m['creator_notes'].update(source='mikage-shrine/releases/1.49.38/creator-notes.md',sha256=sha(notes));m['ema_integration']['bound_worldbook']['version']='1.49.38';m['reviewed_copy']['preserved_worldbook_version']='1.49.38'
    m['checkpoint'].update(base='1.49.37',plan='mikage-shrine/releases/1.49.38/plan.json',gameplay='unchanged; pause/resume view lifecycle and portrait recovery',real_host='pending')
    m['scene_portrait_framing']={'source':'mikage-shrine/src/scene-portrait-framing.json','sha256':sha(dump(frames)),'visible_bounds_alpha_threshold':16,'adult_count':16,'small_count':1,'new_image_bytes':0,'images':'existing immutable URLs; on demand','model_calls_added':0,'real_host':'pending'}
    plan={'base':'1.49.37','target':'1.49.38','delivery':'full-card checkpoint; fixed Git loaders','authorized':'continue audited F01-F04 fixes','scope':['view lifecycle pauses walking and arrival callbacks','image recovery and visible availability states','cross-region labels'],'preserve':['walk routing and game state ownership','17outfits and framing','normal prose','five other modules','39worldbook entries/5regexes/6script IDs'],'checks':['audited37 baseline','guarded build and inverse scope','paused coordinates/routes/arrival-once','direct image retry with no model call','offsite/status/focus/cross-region labels','view/asset/card regression and actual-source GIFs'],'routing':{'mode':'manual','skill':'code-quality-workflow','standing':'A0','guides':['ST-C2','ST-D7'],'router_run':False},'paid_model_calls_added':0,'real_host':'pending','driver_accepted':False,'author_accepted':False}
    return {'scene.mjs':code,'statusbar.html':html,'card-source.json':dump(card),'manifest.json':dump(m),'creator-notes.md':notes,'plan.json':dump(plan),'media-manifest.json':dump({'schemaVersion':1,'cardId':'mikage-shrine','assets':media})}
if __name__=='__main__':
    ap=argparse.ArgumentParser(description=__doc__);ap.add_argument('--dry-run',action='store_true');ap.add_argument('--check',action='store_true');a=ap.parse_args();out=build()
    if a.check:
        for n,t in out.items():assert (OUT/n).read_text()==t,n
    elif not a.dry_run:
        OUT.mkdir(parents=True,exist_ok=True)
        for n,t in out.items():(OUT/n).write_text(t)
    print(dump({'dry_run':a.dry_run,'check':a.check,'files':{n:{'bytes':len(t.encode()),'sha256':sha(t)} for n,t in out.items()}}))
