#!/usr/bin/env python3
"""Derive 1.49.28 from the verified 1.49.27 release; earlier releases stay intact."""
import argparse, copy, hashlib, json, uuid
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
R=ROOT/'mikage-shrine'
BASE=R/'releases/1.49.27'
OUT=R/'releases/1.49.28'
dump=lambda x:json.dumps(x,ensure_ascii=False,indent=2)+'\n'
sha=lambda x:hashlib.sha256(x.encode() if isinstance(x,str) else x).hexdigest()

def build():
    manifest=json.loads((BASE/'manifest.json').read_text())
    source=(BASE/'card-source.json').read_text()
    assert sha(source)==manifest['source_sha256'],'Baseline card hash changed'
    for module in manifest['modules']:
        assert sha((ROOT/module['path']).read_bytes())==module['sha256'],module['path']
    card=json.loads(source)
    core=(R/'src/task-archive-core.mjs').read_text()
    runtime=(R/'src/task-archive-runtime.mjs').read_text()
    lines=runtime.splitlines(keepends=True)
    assert lines[0].startswith('import ') and "'./task-archive-core.mjs'" in lines[0]
    module=core+'\n'+''.join(lines[1:])
    script_id=str(uuid.uuid5(uuid.NAMESPACE_URL,'mikage.task-archive.v1'))
    scripts=card['data']['extensions']['tavern_helper']['scripts']
    script=copy.deepcopy(scripts[0]);script.update(id=script_id,name='御影神社·任务档案 1.49.28 CDN',content='',info='默认随正文归档，零额外调用；任务档案按钮可编辑、批量补档及设置独立API。')
    script['button']={'enabled':True,'buttons':[{'name':'任务档案','visible':True},{'name':'重新加载资源','visible':True}]}
    script['data']={};scripts.append(script)
    regs=card['data']['extensions']['regex_scripts']
    for kind in ['display','history']:
        reg=copy.deepcopy(regs[0]);reg.update(id=str(uuid.uuid5(uuid.NAMESPACE_URL,'mikage.task-archive.regex.'+kind)),scriptName='御影神社｜任务档案'+('隐藏' if kind=='display' else '历史过滤'),findRegex=r'/<MikageTaskArchive>[\s\S]*?(?:<\/MikageTaskArchive>|$)/g',markdownOnly=kind=='display',promptOnly=kind=='history',runOnEdit=True)
        regs.append(reg)
    card['character_version']=card['data']['character_version']='1.49.28'
    book=card['data']['character_book'];book['description']=book['description'].replace('v1.49.27','v1.49.28')
    notes=card['data']['creator_notes'].replace('v1.49.27','v1.49.28').replace('三条角色正则和五个酒馆助手脚本','五条角色正则和六个酒馆助手脚本').replace('五个脚本分别负责状态与结算、面板、开场与场景、独立小游戏、巴卫互动','六个脚本分别负责状态与结算、面板、开场与场景、独立小游戏、巴卫互动和任务档案')
    notes+='\n\n【任务档案】\n默认在正文结案回复中附带摘要，不新增模型请求。右下角或脚本按钮“任务档案”可查看、修改、批量补档，或填写独立API地址、Key和模型。查看、刷新与保存设置均不请求模型；整理选中任务或测试连接会调用一次。独立模式可自行开启结案自动整理，失败后保留记录等待手动重试。Key只存在本机浏览器设置。\n任务档案与原文引用保存在聊天变量，专用世界书保存档案副本，由插件按当前聊天、分支及相关人物地点取回。档案书默认不绑定到全局或角色，也不自动激活全部历史。修改原文、重生成或回档会使不匹配档案退出提示，重新整理后生效。已有聊天可从仍有记录的任务归档，缺少起止依据的历史任务会提示。\n新增模块按酒馆助手4.8.19声明快照开发并设接口检查；真实酒馆版本、手机和最终模型归档表现尚待验收。'
    card['data']['creator_notes']=notes
    manifest.update(release='1.49.28',source_name='1.49.28/card-source.json',source_sha256=sha(dump(card)))
    manifest['modules'].append({'script_id':script_id,'module_id':'archive','version':'1.49.28','path':'mikage-shrine/releases/1.49.28/archive.mjs','sha256':sha(module)})
    manifest['bound_worldbook'].update(source='mikage-shrine/releases/1.49.28/card-source.json',version='1.49.28',entry_sha256=sha(dump(book['entries'])))
    manifest['creator_notes'].update(source='mikage-shrine/releases/1.49.28/creator-notes.md',sha256=sha(notes))
    manifest['ema_integration']['bound_worldbook']['version']='1.49.28'
    manifest['reviewed_copy']['preserved_worldbook_version']='1.49.28'
    manifest['checkpoint'].update(base='1.49.27',plan='mikage-shrine/releases/1.49.28/plan.json',gameplay='task semantic archives; existing deterministic gameplay untouched',real_host='pending')
    manifest['task_archive']={'mode':'inline','extra_calls_default':0,'settings':'browser local only; key excluded from chat/worldbook/card','records':'chat variables namespace mikage_task_archives_v1','worldbook':'dedicated unbound mirror; entries disabled; branch-filtered managed injection','source_files':['mikage-shrine/src/task-archive-core.mjs','mikage-shrine/src/task-archive-runtime.mjs'],'api_snapshot':'Tavern Helper 4.8.19 @ 36d8889a99f1cf09d3d1f8aabd0eba33975dc64d','host_acceptance':'pending'}
    deps=manifest['runtime_dependencies']
    deps['capabilities']=[x.replace('five-remote-script-loaders','six-remote-script-loaders') for x in deps['capabilities']]+['branch-filtered-task-recall']
    deps['embedded_required']['helper_ids'].append(script_id)
    deps['embedded_required']['regex_ids'] += [r['id'] for r in regs[-2:]]
    deps['host_required'].append('Tavern Helper selected-swipe message, chat-variable, managed injection and worldbook entry APIs (4.8.19 declaration snapshot; runtime preflight)')
    deps['remote_runtime']=[x.replace('five manifest modules','six manifest modules') for x in deps['remote_runtime']]
    plan={'base':'1.49.27','target':'1.49.28','delivery':'full-card checkpoint','scope':['new task archive module','two archive-only filtering regexes','script and version metadata'],'preserve':['39 worldbook entries','MVU schema and initialization','five existing modules','economy and chapter rules','images and wardrobe'],'checks':['core fixtures','actual existing engine regression','browser simulated-host integration','packed source parity'],'real_host':'pending'}
    return {'archive.mjs':module,'card-source.json':dump(card),'creator-notes.md':notes,'manifest.json':dump(manifest),'plan.json':dump(plan)}

if __name__=='__main__':
    ap=argparse.ArgumentParser(description=__doc__);ap.add_argument('--dry-run',action='store_true');args=ap.parse_args()
    outputs=build()
    for name,text in outputs.items():
        path=OUT/name
        if path.exists() and path.read_text()!=text:raise ValueError('Output differs; inspect before replacing: '+name)
    if not args.dry_run:
        OUT.mkdir(parents=True,exist_ok=True)
        for name,text in outputs.items():(OUT/name).write_text(text)
    print(dump({'dry_run':args.dry_run,'files':{name:{'bytes':len(t.encode()),'sha256':sha(t)} for name,t in outputs.items()}}))
