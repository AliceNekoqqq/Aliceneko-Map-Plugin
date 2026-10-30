#!/usr/bin/env python3
"""Apply a visual-only Hanagami skin to verified 1.49.31 modules."""
import argparse,hashlib,json,re
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2];R=ROOT/'mikage-shrine';BASE=R/'releases/1.49.31';OUT=R/'releases/1.49.32'
dump=lambda x:json.dumps(x,ensure_ascii=False,indent=2)+'\n'
sha=lambda x:hashlib.sha256(x.encode() if isinstance(x,str) else x).hexdigest()
def once(text,old,new):
    assert text.count(old)==1,f'Expected one anchor: {old[:100]}'
    return text.replace(old,new,1)
def build():
    manifest=json.loads((BASE/'manifest.json').read_text());source=(BASE/'card-source.json').read_text();assert sha(source)==manifest['source_sha256']
    for m in manifest['modules']:assert sha((ROOT/m['path']).read_bytes())==m['sha256'],m['path']
    art=json.loads((R/'src/hanagami-art.json').read_text());assert re.fullmatch('[0-9a-f]{40}',art['commit'])
    for a in art['assets']:assert sha((ROOT/a['path']).read_bytes())==a['sha256'],a['path']
    urls={a['id']:'https://cdn.jsdelivr.net/gh/'+manifest['repository']+'@'+art['commit']+'/'+a['path'] for a in art['assets']}
    def resolve(css):
        for key,url in urls.items():css=css.replace('__HANAGAMI_'+key.upper()+'__',url)
        assert '__HANAGAMI_' not in css
        return css
    outputs={};card=json.loads(source)
    for m in manifest['modules']:
        kind=m['module_id']
        if kind not in ['panels','scene','archive']:continue
        code=(ROOT/m['path']).read_text()
        if kind in ['panels','scene']:
            marker='const '+('MikagePanelHTML' if kind=='panels' else 'StatusbarHTML')+'=';start=code.index(marker)+len(marker);html,end=json.JSONDecoder().raw_decode(code[start:])
            css=resolve((R/'src'/('hanagami-theme.css' if kind=='panels' else 'hanagami-scene.css')).read_text())
            html=once(html,'</head>','<style id="mikage-hanagami-'+kind+'">'+css+'</style></head>')
            code=code[:start]+json.dumps(html,ensure_ascii=False)+code[start+end:]
            code=once(code,"const version = '"+m['version']+"';","const version = '1.49.32';")
            outputs['panels.html' if kind=='panels' else 'statusbar.html']=html
        else:
            marker='const ARCHIVE_STYLE=';start=code.index(marker)+len(marker);css,end=json.JSONDecoder().raw_decode(code[start:])
            css+='\n'+resolve((R/'src/hanagami-archive.css').read_text())
            code=code[:start]+json.dumps(css,ensure_ascii=False)+code[start+end:]
            code=once(code,"export const VERSION='1.49.31';","export const VERSION='1.49.32';")
        script=next(s for s in card['data']['extensions']['tavern_helper']['scripts'] if s['id']==m['script_id'])
        script['name']=script['name'].replace(m['version'],'1.49.32');script['info']+='\n1.49.32：花笺手帖美术与轻动效；原交互和数据处理保持。'
        m.update(version='1.49.32',path='mikage-shrine/releases/1.49.32/'+kind+'.mjs',sha256=sha(code));outputs[kind+'.mjs']=code
    card['character_version']=card['data']['character_version']='1.49.32';book=card['data']['character_book'];book['description']=book['description'].replace('v1.49.31','v1.49.32')
    notes=card['data']['creator_notes'].replace('v1.49.31','v1.49.32')+'\n\n【花笺手帖 1.49.32】\n正文演出、地图、绘马、衣柜、生活、心愿请求设置与任务档案统一花笺视觉：使用实际和纸素材与八枚生活插画、封签与纸面状态、轻量展开和按压反馈。显示名称、奖励、归档内容和可用操作均取原有数据。素材通过固定Git提交加载，图片不可用时仍可操作文字入口；浏览、切换和新动效不增加模型调用。系统减少动态效果时关闭新增动画。六个脚本仍为固定Git加载器，真实酒馆与手机验收待完成。'
    card['data']['creator_notes']=notes
    manifest.update(release='1.49.32',source_name='1.49.32/card-source.json',source_sha256=sha(dump(card)))
    manifest['bound_worldbook'].update(source='mikage-shrine/releases/1.49.32/card-source.json',version='1.49.32',entry_sha256=sha(dump(book['entries'])))
    manifest['creator_notes'].update(source='mikage-shrine/releases/1.49.32/creator-notes.md',sha256=sha(notes))
    manifest['ema_integration']['bound_worldbook']['version']='1.49.32';manifest['reviewed_copy']['preserved_worldbook_version']='1.49.32'
    manifest['checkpoint'].update(base='1.49.31',plan='mikage-shrine/releases/1.49.32/plan.json',gameplay='unchanged; visual-only Hanagami skin',real_host='pending')
    manifest['hanagami']={'surfaces':['scene','map','ema','wardrobe','life','request-settings','archive'],'source_files':['mikage-shrine/src/hanagami-theme.css','mikage-shrine/src/hanagami-archive.css','mikage-shrine/src/hanagami-scene.css'],'art':art,'model_calls_added':0,'data_writers_added':0,'motion':'finite CSS; prefers-reduced-motion disables; existing native scene/panel animations retained','asset_fallback':'solid paper color and real text/controls retained','real_host':'pending'}
    manifest['runtime_dependencies'].setdefault('optional',[]).append('Hanagami1.49.32 decorative paper/life atlas at immutable '+art['commit']+'; text/actions remain available without images')
    plan={'base':'1.49.31','target':'1.49.32','delivery':'full-card visual checkpoint; six immutable Git loaders','design':'original shrine art and portraits; generated washi texture and8object thumbnails; plum/gold slips, paper readers, finite motion','scope':['CSS inside panels/scene/archive only','three module versions and notes metadata','two pinned decorative assets'],'preserve':['all runtime JavaScript after stylesheet/version normalization','39worldbook entries','5regexes','3other modules','all gameplay, API settings, persistence and text'],'checks':['guarded deterministic build','full-module inverse preservation','actual-source narrow/desktop/short-screen and missing-art browser checks','existing panel/archive/scene actions and lifecycle regressions','7actual-source GIFs','six-loader card parity and Git objects'],'real_host':'pending'}
    outputs.update({'card-source.json':dump(card),'manifest.json':dump(manifest),'creator-notes.md':notes,'plan.json':dump(plan)});return outputs
if __name__=='__main__':
    ap=argparse.ArgumentParser(description=__doc__);ap.add_argument('--dry-run',action='store_true');ap.add_argument('--check',action='store_true');args=ap.parse_args();outputs=build()
    if args.check:
        for name,text in outputs.items():assert (OUT/name).read_text()==text,name
    elif not args.dry_run:
        OUT.mkdir(parents=True,exist_ok=True)
        for name,text in outputs.items():(OUT/name).write_text(text)
    print(dump({'check':args.check,'dry_run':args.dry_run,'files':{n:{'bytes':len(t.encode()),'sha256':sha(t)} for n,t in outputs.items()}}))
