#!/usr/bin/env python3
"""One-time migration from the pinned 1.9 runtime to wardrobe side quests."""
import json, re
from pathlib import Path
ROOT=Path(__file__).resolve().parent.parent
def literal(s): return json.dumps(s,ensure_ascii=False,separators=(',',':'))
def readconst(s,name):
    m=re.search(r'const '+name+r'\s*=\s*',s);v,n=json.JSONDecoder().raw_decode(s[m.end():]);return v,m.end(),m.end()+n
def putconst(s,name,value):
    _,a,b=readconst(s,name);return s[:a]+literal(value)+s[b:]
def replace(s,a,b):
    if a not in s: raise ValueError('Missing anchor: '+a[:100])
    return s.replace(a,b)
def main():
    p=ROOT/'runtime/mvu.mjs';s=p.read_text();assert 'wardrobeQuestItem' not in s
    config,_,_=readconst(s,'ShrineConfig');spec,_,_=readconst(s,'ShrineFieldSpec')
    quests=json.loads((ROOT/'src/wardrobe-quests.json').read_text());config['wardrobeQuests']=quests
    for q in quests: config['wardrobeRewards'].append(dict(id=q['rewardId'],mainId=q['id'],stage=3 if q['mainId']=='M02' else 4,regions=[],sideQuest=q['id'],condition=q['condition'],narrativeSource=q['delivery'],outfits=q['outfits']))
    for row in spec:
        additions={'玩家.衣装':['school'],'巴卫.服装':['school','school-human','yako','city','winter'],'衣橱.已解锁.*.衣装':['school','school-human','yako','city','winter'],'衣橱.待呈现.*':[q['rewardId'] for q in quests],'衣橱.已呈现.*':[q['rewardId'] for q in quests]}.get(row['path'],[])
        if additions:row['enum']=sorted(set(row['enum']+additions))
    # Keep every Zod enum that mirrors an expanded field in sync, including
    # archived/paused snapshots, without widening any unrelated enumeration.
    s=putconst(s,'ShrineConfig',config)
    original_spec,_,_=readconst(s,'ShrineFieldSpec')
    for before,after in zip(original_spec,spec):
        if before.get('enum')!=after.get('enum'):
            old=json.dumps(before['enum'],ensure_ascii=False);new=json.dumps(after['enum'],ensure_ascii=False)
            s=s.replace('z.enum('+old+')','z.enum('+new+')')
    s=putconst(s,'ShrineFieldSpec',spec)
    s=replace(s,"  const rewardForMain=id=>rewards.find(r=>r.mainId===id);", "  const rewardForMain=id=>rewards.find(r=>r.mainId===id);\n"+(ROOT/'src/wardrobe-quest-engine.js').read_text())
    s=replace(s,'const completed=new Set(s.主线.已完成.map(x=>x.编号)),expected=[];','const completed=completedRewardIds(s),expected=[];')
    s=replace(s,"x.性质==='主线'||x.材料档===level", "x.性质==='主线'||!!wardrobeQuest(x.编号)||x.材料档===level")
    s=replace(s,'const ids=s.主线.已完成.map(x=>x.编号);','const ids=s.主线.已完成.map(x=>x.编号),allCompleted=completedRewardIds(s);')
    s=s.replace('ids.includes(rewards.find(r=>r.id===id)?.mainId)','allCompleted.has(rewards.find(r=>r.id===id)?.mainId)')
    s=replace(s,"assert(intent.action==='refreshBoard','只有玩家点补充绘马才能生成');\n        const items=normalizeCandidates(intent.generated,p);", "assert(['refreshBoard','addWardrobeQuest'].includes(intent.action),'只有玩家从界面才能悬挂绘马');\n        const items=intent.action==='addWardrobeQuest'?[wardrobeQuestItem(p,intent.questId)]:normalizeCandidates(intent.generated,p);\n        if(intent.action==='addWardrobeQuest')s.绘马板.绘马=s.绘马板.绘马.filter(x=>x.编号!==intent.questId);")
    s=replace(s,"          s.记录.完成委托.push({编号:b.编号,快照:clone(b)});", "          s.记录.完成委托.push({编号:b.编号,快照:clone(b)});\n          const sideReward=rewards.find(r=>r.sideQuest===b.编号);\n          if(sideReward&&b.性质==='普通'&&!s.衣橱.已呈现.includes(sideReward.id)&&!s.衣橱.待呈现.includes(sideReward.id))s.衣橱.待呈现.push(sideReward.id);")
    s=replace(s,'const completedNow=s.主线.已完成.slice(p.主线.已完成.length).map(x=>x.编号);', 'const completedNow=[...s.主线.已完成.slice(p.主线.已完成.length),...s.记录.完成委托.slice(p.记录.完成委托.length)].map(x=>x.编号);')
    s=replace(s,'const mainAdded=s.主线.已完成.slice(p.主线.已完成.length).map(x=>x.编号);','const mainAdded=[...s.主线.已完成.slice(p.主线.已完成.length),...s.记录.完成委托.slice(p.记录.完成委托.length).filter(x=>wardrobeQuest(x.编号)&&x.快照.性质===\'普通\')].map(x=>x.编号);')
    s=replace(s,"if(name==='refreshBoard'){e.类型='绘马刷新';e.摘要='玩家补充普通绘马';}","if(name==='refreshBoard'){e.类型='绘马刷新';e.摘要='玩家补充普通绘马';}\n    else if(name==='addWardrobeQuest'){wardrobeQuestItem(s,payload.id);e.类型='绘马刷新';e.摘要='玩家悬挂衣装支线：'+wardrobeQuest(payload.id).title;e.对象=payload.id;}")
    s=replace(s,'{action:name,generated:payload.generated}', '{action:name,generated:payload.generated,questId:payload.id}')
    s=replace(s,'config:ShrineConfig,life};','config:ShrineConfig,wardrobeQuestView,life};')
    s=s.replace("export const version = '1.9.0';", "export const version = '1.10.0';")
    p.write_text(s)
    p=ROOT/'src/panels-host.mjs';s=p.read_text()
    s=replace(s,'const v=clone(s);delete v.记录;',"const v=clone(s);v.衣装支线=(engine().config.wardrobeQuests||[]).map(q=>engine().wardrobeQuestView(s,q.id));delete v.记录;")
    s=replace(s,"if(name==='setOutfit'){\n        await saveOutfitInPlace", "if(name==='setOutfit'||name==='addWardrobeQuest'){\n        await saveOutfitInPlace")
    s=s.replace("export const version = '1.9.0';", "export const version = '1.10.0';");p.write_text(s)
    p=ROOT/'src/panels-base.html';s=p.read_text()
    s=replace(s,"const list = Array.isArray(outfits) ? outfits : [];", "const list = Array.isArray(outfits) ? outfits.filter(item=>!item.variantOf) : [];")
    s=replace(s,"if (!list.some(item => item && String(item.id) === wardrobeChoice)) wardrobeChoice = current;", "const displayCurrent=current==='school-human'?'school':current;\n    if (!list.some(item => item && String(item.id) === wardrobeChoice)) wardrobeChoice = displayCurrent;")
    s=replace(s,"const worn = outfitId === current && !locked;", "const worn = outfitId === displayCurrent && !locked;")
    s=replace(s,"else if (type === 'setOutfit') result = await bridge.act('setOutfit', payload);", "else if (type === 'setOutfit') result = await bridge.act('setOutfit', payload);\n      else if (type === 'addWardrobeQuest') result = await bridge.act('addWardrobeQuest', payload);")
    anchor="    renderWardrobeDirections(art, wardrobeActor, preview);"
    extra="""
    let questBox=$('#wardrobe-quest');
    if(!questBox){questBox=make('div','wardrobe-quest');questBox.id='wardrobe-quest';$('#wardrobe-look-source')?.after(questBox);}
    questBox.replaceChildren();
    const selectedReward=rewardFor(wardrobeActor,preview),questId=selectedReward?.reward?.sideQuest;
    if(questId&&!lookOwned){
      const quest=(currentState().衣装支线||[]).find(q=>q.id===questId);
      if(quest){
        const control=make('button','secondary-button',quest.done?'衣装已收录':quest.status==='暂停'?'去绘马板继续支线':quest.status!=='未悬挂'?'去绘马板查看支线':quest.ready?'悬挂衣装支线':'尚未达到开放条件');
        control.type='button';control.disabled=(!quest.ready&&quest.status==='未悬挂')||quest.done||!!outfitApplyPending;
        control.addEventListener('click',async()=>{
          if(quest.status!=='未悬挂'){openDialog('board');return;}
          const ok=await invokeAction('addWardrobeQuest',{id:questId},'支线已悬挂，请在绘马板选择接取。',control);
          if(ok)openDialog('board');
        });questBox.append(control);
      }
    }
    if(wardrobeActor==='tomoe'&&['school','school-human'].includes(preview)&&isOwned('tomoe','school')){
      const human=current==='school-human',toggle=make('button','secondary-button',human?'显露狐耳':'切换人间伪装');toggle.type='button';toggle.disabled=!!outfitApplyPending;
      toggle.addEventListener('click',async()=>{const outfit=human?'school':'school-human';outfitApplyPending={actor:'tomoe',outfit};renderWardrobe();await invokeAction('setOutfit',{actor:'tomoe',outfit},'校服外观已保存。');outfitApplyPending=null;wardrobeChoice='school';renderWardrobe();});questBox.append(toggle);
    }
"""
    s=replace(s,anchor,extra+anchor)
    s=replace(s,'const preview = wardrobePreviewId || wardrobeChoice || current;',"const preview = wardrobePreviewId || (wardrobeChoice==='school'&&current==='school-human'?'school-human':wardrobeChoice) || current;")
    s=s.replace("list.find(item => item && String(item.id) === current)?.name", "list.find(item => item && String(item.id) === displayCurrent)?.name")
    s=s.replace("list.find(item=>item&&String(item.id)===preview)","outfits.find(item=>item&&String(item.id)===preview)")
    s=s.replace('</head>','<style>.wardrobe-quest{margin:12px 0;display:flex;flex-wrap:wrap;gap:8px}.wardrobe-quest button{font:inherit;font-size:11px;min-height:42px}</style></head>')
    p.write_text(s)
    p=ROOT/'src/scene-host.mjs';s=p.read_text();s=s.replace("export const version = '1.9.0';", "export const version = '1.10.0';");s=s.replace('map(({id,name})=>({id,name}))','map(({id,name,variantOf})=>({id,name,variantOf}))');p.write_text(s)
    # Sandbox gets complete, synthetic side-quest history; live saves are untouched.
    p=ROOT/'src/dev-sandbox.js';s=p.read_text();s=replace(s,'e.deriveProgress(s);e.checkFields(s);',"for(const q of e.config.wardrobeQuests||[]){const snapshot={...copy(initial.委托),编号:q.id,绘马编号:q.id,祈愿人:q.person,诉求:q.wish,类型:q.type,地区:q.region,性质:'普通',材料档:4,阶段:'收束',结算档位:'完整',结果:'独立测试副本：支线已完成'};s.记录.完成委托.push({编号:q.id,快照:snapshot});}e.deriveProgress(s);e.checkFields(s);");p.write_text(s)
    (ROOT/'src/wardrobe-config.json').write_text(json.dumps(config,ensure_ascii=False,indent=2)+'\n')
    print('Upgraded wardrobe engine, panel controls and snapshot validation to 1.10.0')
if __name__=='__main__':main()
