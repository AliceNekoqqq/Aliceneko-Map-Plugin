#!/usr/bin/env python3
"""Derive the three journal panels from the verified 1.49.29 checkpoint."""
import argparse,hashlib,json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
R=ROOT/'mikage-shrine';BASE=R/'releases/1.49.29';OUT=R/'releases/1.49.30'
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
    core=(R/'src/panel-presentation-core.mjs').read_text().replace('export function ','function ')
    runtime=(R/'src/panel-presentation-runtime.mjs').read_text().split('\n',1)[1]
    css=(R/'src/panel-presentation.css').read_text()
    html=once(html,'</head>','<style id="mikage-panel-presentation">'+css+'</style></head>')
    html=once(html,'  const GAME_CONFIG =',core+'\n'+runtime+'\n  const GAME_CONFIG =')
    html=once(html,'<nav class="map-quick-nav"','<details class="panel-map-index"><summary>十地索引</summary><nav class="map-quick-nav"')
    html=once(html,'<div class="map-desk-status"','</details><div class="map-desk-status"')
    html=once(html,'<div class="board-toolbar">','<details class="panel-board-tools"><summary>心愿请求与类别</summary><div class="board-toolbar">')
    html=once(html,'<p id="ema-desk-status"','<div id="panel-ema-focus"></div></details><div id="panel-ema-status" role="group" aria-label="按绘马状态查看"><button type="button" data-panel-status="all" aria-pressed="true">全部</button><button type="button" data-panel-status="active" aria-pressed="false">进行</button><button type="button" data-panel-status="paused" aria-pressed="false">暂缓</button><button type="button" data-panel-status="completed" aria-pressed="false">已完成</button></div><div class="panel-board-caption"><span id="panel-ema-count"></span><button type="button" class="panel-paper-button" data-panel-archive="">任务档案</button></div><p id="ema-desk-status"')
    html=once(html,'<div class="ema-grid" id="ema-grid" aria-live="polite"></div>','<div class="panel-ema-layout"><div class="panel-ema-plaques"><div class="ema-grid" id="ema-grid" aria-live="polite"></div><p class="panel-empty" id="panel-ema-empty" hidden>这一类暂时没有绘马。</p></div><section class="panel-ema-sheet" id="panel-ema-sheet" aria-label="展开的心愿纸笺" hidden></section></div><section id="panel-archive-view" aria-label="任务档案阅读" hidden></section>')
    html=once(html,'  function renderBoard() {','  function renderBoard() {\n    window.MikagePanelPresentation?.beforeBoardRender();')
    html=once(html,'      grid.append(empty);\n      return;','      grid.append(empty);\n      window.MikagePanelPresentation?.board();\n      return;')
    html=once(html,'    });\n  }\n  function renderMainGate','    });\n    window.MikagePanelPresentation?.board();\n  }\n  function renderMainGate')
    html=once(html,'  function flipCard(card, flipped, focus=true) {','''  function flipCard(card, flipped, focus=true) {
    if(window.MikagePanelPresentation){
      emaFlippedIds.clear();if(flipped&&card.dataset.emaId)emaFlippedIds.add(card.dataset.emaId);
      window.MikagePanelPresentation.selectEma(card,flipped,focus);return;
    }''')
    html=once(html,"'翻看背面 ↓'","'展开心愿 ↓'")
    html=once(html,"'翻回正面 ↑'","'收起心愿 ↑'")
    html=once(html,'  function renderMap() {','  function renderMap() {\n    window.MikagePanelPresentation?.beforeMap();')
    html=once(html,"if(stageLabel)stageLabel.textContent='第'+stage+'阶段 · 已开放 '+openRegions.length+' / '+REGIONS.length+' 处';","if(stageLabel)stageLabel.textContent='第'+stage+'阶段 · 已开放 '+openRegions.length+' / '+REGIONS.length+' 处';\n    window.MikagePanelPresentation?.map();")
    html=once(html,"card.append(make('span', 'place-code', '目的地手帖')","card.append(make('span', 'place-code', String(mapState.当前地区||'R01')===id?'此刻所在':openRegions.includes(id)?'已开放 · 目的地':'尚未开放')")
    html=once(html,"paintCharacter(thumb, wardrobeActor, outfitId, false);","paintCharacter(thumb, wardrobeActor, outfitId, false);\n      window.MikagePanelPresentation?.outfitThumb(thumb,art,wardrobeActor,outfitId);")
    html=once(html,'window.MikageWardrobeDesk?.render({actor:wardrobeActor,outfit:preview,art});','window.MikageWardrobeDesk?.render({actor:wardrobeActor,outfit:preview,art});\n    window.MikagePanelPresentation?.wardrobe({actor:wardrobeActor,outfit:preview,art});')
    html=once(html,'  function dispose() {\n    window.MikageLifeDesk','  function dispose() {\n    window.MikagePanelPresentation?.dispose();\n    window.MikageLifeDesk')
    html=html.replace('\n \n','\n\n')
    code=code[:start]+json.dumps(html,ensure_ascii=False)+code[start+end:]
    code=once(code,"const version = '1.49.27';","const version = '1.49.30';")
    code=once(code,'function start() {','function start() {\n'+core)
    code=once(code,'getChatMessages(id,{include_swipes:false})','getChatMessages(id,{include_swipes:true})')
    code=once(code,"      if(!table?.stat_data&&message?.data?.stat_data)table=message.data;",'''      if(!message||Number(message.message_id)!==id)continue;
      const selectedSwipe=Number(message.swipe_id??0);
      if(!Number.isInteger(selectedSwipe)||selectedSwipe<0)continue;
      if(Array.isArray(message.swipes)&&typeof message.swipes[selectedSwipe]!=='string')continue;
      const selectedData=Array.isArray(message.swipes_data)?message.swipes_data[selectedSwipe]:message.data;
      if(!table?.stat_data&&selectedData?.stat_data)table=selectedData;''')
    code=once(code,'swipe:Number(message?.swipe_id??0),table','swipe:selectedSwipe,table')
    code=once(code,'  const bridge={getState,','''  function getTaskArchive(taskId=''){
    read();
    try{
      const ctx=host.SillyTavern?.getContext?.(),chat=ctx?.getCurrentChatId?.()||ctx?.chatId;
      const expected=chat?JSON.stringify([ctx.characterId??'',ctx.groupId??'',chat]):'';
      return panelArchiveView(host.MikageTaskArchives?.inspect?.(),expected,typeof taskId==='string'?taskId:'');
    }catch{return {status:'unavailable',records:[],truncated:false};}
  }
  const bridge={getTaskArchive,getState,''')
    card=json.loads(source);script=next(s for s in card['data']['extensions']['tavern_helper']['scripts'] if s['id']==module['script_id'])
    script['name']=script['name'].replace('1.49.27','1.49.30');script['info']+='\n1.49.30：地图图卷、绘马纸笺、衣柜展示统一；档案入口只读已有摘要。'
    card['character_version']=card['data']['character_version']='1.49.30';book=card['data']['character_book'];book['description']=book['description'].replace('v1.49.29','v1.49.30')
    notes=card['data']['creator_notes'].replace('v1.49.29','v1.49.30')
    notes+='\n\n【随身手帖视觉统一 1.49.30】\n地图保留原十地分区，目的地以明信片展示，“十地索引”可展开。绘马木牌与展开纸笺分离，状态筛选只改变阅读范围；心愿请求、设置和类别在折叠区。任务档案入口只读取当前聊天已有有效摘要，不自动整理或调用模型。衣柜大立绘、服装缩略图、当前穿着与锁定预览使用原有衣装目录和换装流程。原接取、暂停、出行等操作及其后续正文机制保持。\n三页继续由固定Git加载器载入；新增展示没有额外生成请求。真实酒馆、线上CDN与手机实机待验。'
    card['data']['creator_notes']=notes
    manifest.update(release='1.49.30',source_name='1.49.30/card-source.json',source_sha256=sha(dump(card)))
    module.update(version='1.49.30',path='mikage-shrine/releases/1.49.30/panels.mjs',sha256=sha(code))
    manifest['bound_worldbook'].update(source='mikage-shrine/releases/1.49.30/card-source.json',version='1.49.30',entry_sha256=sha(dump(book['entries'])))
    manifest['creator_notes'].update(source='mikage-shrine/releases/1.49.30/creator-notes.md',sha256=sha(notes))
    manifest['ema_integration']['bound_worldbook']['version']='1.49.30';manifest['reviewed_copy']['preserved_worldbook_version']='1.49.30'
    manifest['checkpoint'].update(base='1.49.29',plan='mikage-shrine/releases/1.49.30/plan.json',gameplay='unchanged; visual journal panels and read-only archive projection',real_host='pending')
    manifest['panel_presentation']={'source_files':['mikage-shrine/src/panel-presentation-core.mjs','mikage-shrine/src/panel-presentation-runtime.mjs','mikage-shrine/src/panel-presentation.css'],'model_calls_added':0,'state_writers_added':0,'archive':'read-only cached active records with exact current chat scope; never refreshes, summarizes or opens API-generating plugin paths','assets':'existing immutable asset catalog and painted panels','real_host':'pending'}
    plan={'base':'1.49.29','target':'1.49.30','delivery':'full-card visual checkpoint; six immutable Git loaders','design':['existing map geometry and destination postcard','one selected wish paper using original DOM action handlers','read-only status filters and archived summary reader','large original portraits with clothing shelf and original ownership rules'],'preserve':['39 worldbook entries and settings','all five regexes','five non-panel modules including1.49.29 scene','all economy and task rules','existing panel action handlers, API settings and generation fences','all assets'],'checks':['deterministic builder','archive scope and text projection','actual panel host and domain engine in browser at320/375/1100','read-only navigation, locked preview, actual owned outfit save and original task actions','packaged parity and Git module hashes'],'real_host':'pending'}
    return {'panels.mjs':code,'panels.html':html,'card-source.json':dump(card),'manifest.json':dump(manifest),'creator-notes.md':notes,'plan.json':dump(plan)}
if __name__=='__main__':
    ap=argparse.ArgumentParser(description=__doc__);ap.add_argument('--check',action='store_true');ap.add_argument('--dry-run',action='store_true');args=ap.parse_args();out=build()
    if args.check:
        for name,text in out.items():assert (OUT/name).read_text()==text,name
    elif not args.dry_run:
        OUT.mkdir(parents=True,exist_ok=True)
        for name,text in out.items():(OUT/name).write_text(text)
    print(dump({'checked':args.check,'dry_run':args.dry_run,'files':{n:{'bytes':len(t.encode()),'sha256':sha(t)} for n,t in out.items()}}))
