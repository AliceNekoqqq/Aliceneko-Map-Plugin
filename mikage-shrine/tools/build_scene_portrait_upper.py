#!/usr/bin/env python3
"""Build1.49.36 upper-body containment; preserve original image bytes and scene controller."""
import argparse,hashlib,json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2];R=ROOT/'mikage-shrine';BASE=R/'releases/1.49.35';OUT=R/'releases/1.49.36'
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
    a=html.index('const SCENE_PORTRAIT_FRAMING=');b=html.index('/* 1.8 scene controller:',a)
    core=(R/'src/scene-presentation-core.mjs').read_text().replace('export function ','function ')
    runtime=(R/'src/scene-presentation-runtime.mjs').read_text().split('\n',1)[1]
    change(html[a:b],'const SCENE_PORTRAIT_FRAMING='+json.dumps(frames,ensure_ascii=False)+';\n'+core+'\n'+runtime+'\n')
    inverse=html
    for before,after in reversed(edits):assert inverse.count(after)==1;inverse=inverse.replace(after,before,1)
    assert inverse==original
    code=old[:i]+json.dumps(html,ensure_ascii=False)+old[i+n:]
    assert code.count("const version = '1.49.35';")==1;code=code.replace("const version = '1.49.35';","const version = '1.49.36';",1)
    assert code==old[:i].replace("const version = '1.49.35';","const version = '1.49.36';",1)+json.dumps(html,ensure_ascii=False)+old[i+n:]
    card=json.loads(source);script=next(s for s in card['data']['extensions']['tavern_helper']['scripts'] if s['id']==entry['script_id'])
    script['name']=script['name'].replace('1.49.35','1.49.36');script['info']+='\n1.49.36：扩展场景立绘区域，保留统一大半身脸部比例，完整呈现头发、肩膀和衣袖；允许下半身越过场景底边。'
    entry.update(version='1.49.36',path='mikage-shrine/releases/1.49.36/scene.mjs',sha256=sha(code))
    card['character_version']=card['data']['character_version']='1.49.36';book=card['data']['character_book'];book['description']=book['description'].replace('v1.49.35','v1.49.36')
    notes=card['data']['creator_notes'].replace('v1.49.35','v1.49.36')+'\n\n【上半身完整显示1.49.36】\n保留上版成人统一脸部大小与眼线，将窄裁切框扩展为场景右侧宽前景，固定横向锚点向左移。17张源图增加可见像素边界记录，验收头顶和左右轮廓完整，场景底边允许截下半身。幼狐按原体型完整显示。窗口尺寸变化时重新定位，保留同地点、衣装、缺图收起和原热点；图片、美术目录、其他界面与文字玩法保持。新增显示不调用剧情API。真实酒馆与手机验收仍待完成。'
    card['data']['creator_notes']=notes;m.update(release='1.49.36',source_name='1.49.36/card-source.json',source_sha256=sha(dump(card)))
    m['bound_worldbook'].update(source='mikage-shrine/releases/1.49.36/card-source.json',version='1.49.36',entry_sha256=sha(dump(book['entries'])))
    m['creator_notes'].update(source='mikage-shrine/releases/1.49.36/creator-notes.md',sha256=sha(notes));m['ema_integration']['bound_worldbook']['version']='1.49.36';m['reviewed_copy']['preserved_worldbook_version']='1.49.36'
    m['checkpoint'].update(base='1.49.35',plan='mikage-shrine/releases/1.49.36/plan.json',gameplay='unchanged; scene portrait registration only',real_host='pending')
    m['scene_portrait_framing']={'source':'mikage-shrine/src/scene-portrait-framing.json','sha256':sha(dump(frames)),'visible_bounds_alpha_threshold':16,'adult_count':16,'small_count':1,'new_image_bytes':0,'images':'existing immutable URLs; on demand','model_calls_added':0,'real_host':'pending'}
    plan={'base':'1.49.35','target':'1.49.36','delivery':'full-card checkpoint; fixed Git loaders','cause':'face registration alone retained narrow26%holder, clipping upper-body sides','scope':['wide scene image style and hall label moved left to avoid face overlap','source-verified framing metadata','pure placement plus resize/load lifecycle','scene version/card metadata'],'preserve':['17original image bytes/URLs','scene DOM and location/outfit truth','normal prose and original1.8controls','five other modules','39worldbook entries/5regexes/6script IDs/gameplay'],'checks':['asset bytes/dimensions','guarded build and inverse scope','adult face registration plus full lateral silhouette/top containment and child exception','17outfits at3widths','same-scene outfit GIFs','layout/lifecycle and package'],'routing':{'mode':'manual','standing':'ST-A0 reused','guides':['ST-C2','ST-D7'],'media_contract':'17static images; no new audio/Live2D/provider','deterministic_router_run':False},'real_host':'pending','driver_accepted':False,'author_accepted':False}
    return {'scene.mjs':code,'statusbar.html':html,'card-source.json':dump(card),'manifest.json':dump(m),'creator-notes.md':notes,'plan.json':dump(plan),'media-manifest.json':dump({'schemaVersion':1,'cardId':'mikage-shrine','assets':media})}
if __name__=='__main__':
    ap=argparse.ArgumentParser(description=__doc__);ap.add_argument('--dry-run',action='store_true');ap.add_argument('--check',action='store_true');a=ap.parse_args();out=build()
    if a.check:
        for n,t in out.items():assert (OUT/n).read_text()==t,n
    elif not a.dry_run:
        OUT.mkdir(parents=True,exist_ok=True)
        for n,t in out.items():(OUT/n).write_text(t)
    print(dump({'dry_run':a.dry_run,'check':a.check,'files':{n:{'bytes':len(t.encode()),'sha256':sha(t)} for n,t in out.items()}}))
