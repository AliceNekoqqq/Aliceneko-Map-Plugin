#!/usr/bin/env python3
"""Derive 1.49.31 life/settings and archive presentation from verified 1.49.30."""
import argparse,hashlib,json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
R=ROOT/'mikage-shrine';BASE=R/'releases/1.49.30';OUT=R/'releases/1.49.31'
dump=lambda x:json.dumps(x,ensure_ascii=False,indent=2)+'\n'
sha=lambda x:hashlib.sha256(x.encode() if isinstance(x,str) else x).hexdigest()
def once(text,old,new):
    assert text.count(old)==1,f'Expected one anchor: {old[:100]}'
    return text.replace(old,new,1)
def build():
    manifest=json.loads((BASE/'manifest.json').read_text());source=(BASE/'card-source.json').read_text()
    assert sha(source)==manifest['source_sha256'],'Baseline source differs'
    for m in manifest['modules']:assert sha((ROOT/m['path']).read_bytes())==m['sha256'],m['path']
    module=next(m for m in manifest['modules'] if m['module_id']=='panels');code=(ROOT/module['path']).read_text()
    marker='const MikagePanelHTML=';start=code.index(marker)+len(marker);html,end=json.JSONDecoder().raw_decode(code[start:])
    html=once(html,'</head>','<style id="mikage-journal-controls">'+(R/'src/journal-controls.css').read_text()+'</style></head>')
    html=once(html,'if(outfitApplyPending||outfitId===outfitFor(wardrobeActor))return;', '''if(outfitApplyPending)return;
        if(outfitId===outfitFor(wardrobeActor)){
          wardrobePreviewId='';wardrobeChoice=outfitId;renderWardrobe();return;
        }''')
    html=once(html,'<span class="eyebrow">EMA · CONNECTION NOTES</span><h2 id="settings-title">请求设置</h2><p>为下一枚绘马，选一条来信的路。</p><span class="hero-chapter">通信手帖 · 仅此设备</span>','<h2 id="settings-title">心愿请求设置</h2>')
    html=once(html,'<header class="dialog-header hero-header"><div class="header-copy"><h2 id="settings-title">','<header class="dialog-header journal-settings-header"><div class="header-copy"><h2 id="settings-title">')
    code=code[:start]+json.dumps(html,ensure_ascii=False)+code[start+end:]
    code=once(code,"const version = '1.49.30';","const version = '1.49.31';")
    # The archive domain and API handlers stay with the original runtime; only presentation changes.
    core=(R/'src/task-archive-core.mjs').read_text()
    runtime=(R/'src/task-archive-runtime.mjs').read_text().split('\n',1)[1]
    archive=core+'\nconst ARCHIVE_STYLE='+json.dumps((R/'src/task-archive.css').read_text(),ensure_ascii=False)+';\n'+runtime
    card=json.loads(source)
    for m in manifest['modules']:
        if m['module_id'] not in ['panels','archive']:continue
        script=next(s for s in card['data']['extensions']['tavern_helper']['scripts'] if s['id']==m['script_id'])
        script['name']=script['name'].replace(m['version'],'1.49.31')
        script['info']+='\n1.49.31：生活与设置手帖统一、档案管理纸面编辑；修复衣柜退出锁定预览。'
        m.update(version='1.49.31',path='mikage-shrine/releases/1.49.31/'+m['module_id']+'.mjs',sha256=sha(code if m['module_id']=='panels' else archive))
    card['character_version']=card['data']['character_version']='1.49.31'
    book=card['data']['character_book'];book['description']=book['description'].replace('v1.49.30','v1.49.31')
    notes=card['data']['creator_notes'].replace('v1.49.30','v1.49.31')
    notes+='\n\n【生活与档案手帖 1.49.31】\n生活页沿用原场景与八个分区入口，栏目改为可横向滑动的页签，陈设与料理等内容使用统一纸面。心愿请求设置保留主API、独立方案与全部连接字段；保存不触发生成。任务档案管理统一为纸面编辑，归档方式显示当前设置；默认随正文归档，零额外请求。整理和测试连接仍是标明调用次数的显式操作。衣柜点回当前已穿衣装时退出锁定预览，不写入游戏数据。六个脚本继续固定Git加载。真实酒馆、手机与模型验收待完成。'
    card['data']['creator_notes']=notes
    manifest.update(release='1.49.31',source_name='1.49.31/card-source.json',source_sha256=sha(dump(card)))
    manifest['bound_worldbook'].update(source='mikage-shrine/releases/1.49.31/card-source.json',version='1.49.31',entry_sha256=sha(dump(book['entries'])))
    manifest['creator_notes'].update(source='mikage-shrine/releases/1.49.31/creator-notes.md',sha256=sha(notes))
    manifest['ema_integration']['bound_worldbook']['version']='1.49.31';manifest['reviewed_copy']['preserved_worldbook_version']='1.49.31'
    manifest['checkpoint'].update(base='1.49.30',plan='mikage-shrine/releases/1.49.31/plan.json',gameplay='unchanged; life/settings/archive visual alignment and wardrobe preview reset',real_host='pending')
    manifest['journal_controls']={'source_files':['mikage-shrine/src/journal-controls.css','mikage-shrine/src/task-archive.css','mikage-shrine/src/task-archive-runtime.mjs'],'model_calls_added':0,'game_state_writers_added':0,'real_host':'pending'}
    plan={'base':'1.49.30','target':'1.49.31','delivery':'full-card checkpoint; six immutable Git loaders','scope':['life and request-settings visual alignment','archive manager visual alignment','return from locked preview to worn outfit without writes'],'preserve':['all39 worldbook entries','five regexes','four non-panel/archive modules','archive domain and API contracts','economy and gameplay','all art'],'checks':['deterministic build','source preservation','actual modules browser at320/375/1100','worn-preview reset for both actors','life draft and explicit decor action','archive edit/settings save and chat scope','four actual-source GIFs','packed parity and Git objects'],'real_host':'pending'}
    return {'panels.mjs':code,'panels.html':html,'archive.mjs':archive,'card-source.json':dump(card),'manifest.json':dump(manifest),'creator-notes.md':notes,'plan.json':dump(plan)}
if __name__=='__main__':
    ap=argparse.ArgumentParser(description=__doc__);ap.add_argument('--check',action='store_true');ap.add_argument('--dry-run',action='store_true');args=ap.parse_args();out=build()
    if args.check:
        for name,text in out.items():assert (OUT/name).read_text()==text,name
    elif not args.dry_run:
        OUT.mkdir(parents=True,exist_ok=True)
        for name,text in out.items():(OUT/name).write_text(text)
    print(dump({'checked':args.check,'dry_run':args.dry_run,'files':{n:{'bytes':len(t.encode()),'sha256':sha(t)} for n,t in out.items()}}))
