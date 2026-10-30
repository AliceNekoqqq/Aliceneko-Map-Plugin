#!/usr/bin/env python3
"""Build one archive keyboard fix from maintained source; preserve 1.49.32."""
import argparse,hashlib,json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2];R=ROOT/'mikage-shrine'
BASE=R/'releases/1.49.32';OUT=R/'releases/1.49.33'
dump=lambda x:json.dumps(x,ensure_ascii=False,indent=2)+'\n'
sha=lambda x:hashlib.sha256(x.encode() if isinstance(x,str) else x).hexdigest()
def handler(code):
    return code[code.index('  function onKey(e)'):code.index('  const launcher=button(')]
def build():
    manifest=json.loads((BASE/'manifest.json').read_text());source=(BASE/'card-source.json').read_text()
    assert sha(source)==manifest['source_sha256']
    for m in manifest['modules']:assert sha((ROOT/m['path']).read_bytes())==m['sha256'],m['path']
    entry=next(m for m in manifest['modules'] if m['module_id']=='archive')
    old=(ROOT/entry['path']).read_text();runtime=(R/'src/task-archive-runtime.mjs').read_text().split('\n',1)[1]
    art=json.loads((R/'src/hanagami-art.json').read_text());skin=(R/'src/hanagami-archive.css').read_text()
    for a in art['assets']:
        assert sha((ROOT/a['path']).read_bytes())==a['sha256']
        url='https://cdn.jsdelivr.net/gh/'+manifest['repository']+'@'+art['commit']+'/'+a['path']
        skin=skin.replace('__HANAGAMI_'+a['id'].upper()+'__',url)
    assert '__HANAGAMI_' not in skin
    css=(R/'src/task-archive.css').read_text()+'\n'+skin
    code=(R/'src/task-archive-core.mjs').read_text()+'\nconst ARCHIVE_STYLE='+json.dumps(css,ensure_ascii=False)+';\n'+runtime
    before,after=handler(old),handler(code)
    assert '[tabindex="-1"]' in before and 'n.tabIndex<0' in after
    inverse=code.replace(after,before,1).replace("VERSION='1.49.33'","VERSION='1.49.32'",1)
    assert inverse==old,'Only the keyboard handler and archive version may change'
    card=json.loads(source);script=next(s for s in card['data']['extensions']['tavern_helper']['scripts'] if s['id']==entry['script_id'])
    script['name']=script['name'].replace('1.49.32','1.49.33')
    script['info']+='\n1.49.33：档案弹窗首尾键盘焦点双向循环，Esc返回入口；无新增模型调用。'
    entry.update(version='1.49.33',path='mikage-shrine/releases/1.49.33/archive.mjs',sha256=sha(code))
    card['character_version']=card['data']['character_version']='1.49.33'
    book=card['data']['character_book'];book['description']=book['description'].replace('v1.49.32','v1.49.33')
    notes=card['data']['creator_notes'].replace('v1.49.32','v1.49.33')+'\n\n【档案键盘收尾 1.49.33】\n任务档案弹窗内的Tab和Shift+Tab在可操作控件之间循环，Esc关闭后返回原入口。修复首个关闭按钮反向切换时焦点跳出弹窗的问题。花笺视觉、文字玩法、任务归档及独立API设置保持；无新增模型请求。真实酒馆与手机验收仍待完成。'
    card['data']['creator_notes']=notes
    manifest.update(release='1.49.33',source_name='1.49.33/card-source.json',source_sha256=sha(dump(card)))
    manifest['bound_worldbook'].update(source='mikage-shrine/releases/1.49.33/card-source.json',version='1.49.33',entry_sha256=sha(dump(book['entries'])))
    manifest['creator_notes'].update(source='mikage-shrine/releases/1.49.33/creator-notes.md',sha256=sha(notes))
    manifest['ema_integration']['bound_worldbook']['version']='1.49.33';manifest['reviewed_copy']['preserved_worldbook_version']='1.49.33'
    manifest['checkpoint'].update(base='1.49.32',plan='mikage-shrine/releases/1.49.33/plan.json',gameplay='unchanged; archive keyboard focus containment only',real_host='pending')
    plan={'base':'1.49.32','target':'1.49.33','delivery':'full-card checkpoint continuation; immutable Git loaders',
      'visible_problem':'Shift+Tab from the first Close button leaves the archive modal',
      'gate':'Local Fix Only; one keyboard handler under25 runtime lines; no refactor',
      'exit':'actual built archive passes bidirectional keyboard boundaries and Esc/opener return with no new data/model effects',
      'preserve':['five other modules','complete archive outside handler/version','39worldbook entries','5regexes','6script IDs/buttons','art and styles','prose/gameplay/archive/API/persistence'],
      'checks':['old-source Chromium reproduction','full-module inverse equality','deterministic build','keyboard browser fixture','archive browser regression','actual-source GIF','packed parity'],
      'routing':{'mode':'manual','snapshot':'2026-09-13','guides':['ST-A0'],'prior_reused':['ST-A2','ST-C2','ST-D1','ST-D4','ST-D7'],'deterministic_router_run':False},
      'real_host':'pending','author_accepted':False}
    return {'archive.mjs':code,'card-source.json':dump(card),'manifest.json':dump(manifest),'creator-notes.md':notes,'plan.json':dump(plan)}
if __name__=='__main__':
    ap=argparse.ArgumentParser(description=__doc__);ap.add_argument('--dry-run',action='store_true');ap.add_argument('--check',action='store_true');args=ap.parse_args();outputs=build()
    if args.check:
        for name,text in outputs.items():assert (OUT/name).read_text()==text,name
    elif not args.dry_run:
        OUT.mkdir(parents=True,exist_ok=True)
        for name,text in outputs.items():
            target=OUT/name
            if target.exists():assert target.read_text()==text,'Refusing to overwrite divergent '+name
            else:target.write_text(text)
    print(dump({'dry_run':args.dry_run,'check':args.check,'files':{n:{'bytes':len(t.encode()),'sha256':sha(t)} for n,t in outputs.items()}}))
