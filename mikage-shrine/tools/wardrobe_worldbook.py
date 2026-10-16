"""Keep wardrobe lore, enums and EJS guidance aligned with runtime configuration."""
import copy,json,re
from pathlib import Path
ROOT=Path(__file__).resolve().parent.parent
def update(card):
    config=json.loads((ROOT/'src/wardrobe-config.json').read_text())
    quests=config['wardrobeQuests'];body=(ROOT/'runtime/mvu.mjs').read_text();m=re.search(r'const ShrineFieldSpec\s*=\s*',body);spec,_=json.JSONDecoder().raw_decode(body[m.end():]);by_path={r['path']:r for r in spec}
    entries=card['data']['character_book']['entries']
    for entry in entries:
        text=entry['content']
        text=text.replace('其余衣装由对应主线结案解锁','其余衣装由对应主线或固定衣装支线结案解锁')
        text=text.replace('当前像素素材只支持衣装四选一','当前像素素材支持衣柜图册已列出的衣装')
        text=text.replace('十套新增衣装按 game-config.wardrobeRewards 对应章节结案解锁','章节衣装按 wardrobeRewards 对应主线结案解锁；本版五套衣装与DK人间伪装由四条固定衣装支线结案解锁')
        text=text.replace('主线结案自动加入待呈现','主线或固定衣装支线结案自动加入待呈现')
        text=text.replace('有对应主线历史的奖励','有对应主线或衣装支线结案历史的奖励')
        lines=[]
        for line in text.splitlines():
            match=re.match(r'([^ |]+) \| string \[.*?\] \|',line)
            if match and match[1] in by_path and by_path[match[1]].get('enum'):
                line=re.sub(r'\| string \[.*?\] \|','| string '+repr(by_path[match[1]]['enum'])+' |',line,count=1)
            lines.append(line)
        entry['content']='\n'.join(lines)
        if entry['id']==49:
            entry['content']+='\n\n【1.10衣装支线补充】以上章节规则适用于U02～UCLEAR。UW-SCHOOL、UW-YAKO、UW-CITY、UW-WINTER来自固定衣装支线WQ01～WQ04，属于普通绘马；由衣柜主动悬挂、绘马板主动接取，可暂停和恢复。完成对应支线即派生衣装与待呈现，不推进主线章节，也不要求重新结案旧章节。其普通绘马材料回礼与本阶段其他普通绘马相同，并计入接取时材料档的普通绘马完成数。同轮写清赠衣后，以连续编号追加解锁呈现事件；已完成但待呈现的支线可在空闲轮以单独解锁呈现事件补记。不得直接写衣橱，不自动换衣。'
    template=copy.deepcopy(next(e for e in entries if e['id']==54))
    template.update(id=max(e['id'] for e in entries)+1,name='[mvu_plot]衣装支线与校服：配置候选',comment='[mvu_plot]衣装支线与校服：配置候选',keys=[],constant=True)
    template['extensions']['display_index']=template['id'];template['insertion_order']=max(e['insertion_order'] for e in entries)+1
    template['content']='''<% if (typeof runType === 'string' && runType === 'generate') { %>
<%
var wardrobeSceneState=getvar('stat_data',{scope:'message',withMsg:{role:'any'},defaults:{},clone:true});
if(typeof lastMessageId==='number'){for(var wardrobeFloor=lastMessageId;wardrobeFloor>=Math.max(0,lastMessageId-63);wardrobeFloor--){var wardrobeSnap=getvar('stat_data',{scope:'message',withMsg:{id:wardrobeFloor},defaults:{},clone:true});if(wardrobeSnap&&wardrobeSnap.进度&&wardrobeSnap.绘马板){wardrobeSceneState=wardrobeSnap;break;}}}
var wardrobeQuestCatalog=__QUESTS__;
var wardrobeActive=wardrobeSceneState.委托||{},wardrobeOwned=wardrobeSceneState.衣橱||{},wardrobeEventCount=(wardrobeSceneState.记录?.事件||[]).length;
var wardrobeActiveQuest=wardrobeQuestCatalog.find(function(q){return q.id===wardrobeActive.编号&&wardrobeActive.性质==='普通';});
var wardrobePendingQuest=wardrobeQuestCatalog.find(function(q){return (wardrobeOwned.待呈现||[]).indexOf(q.rewardId)>=0;});
%>
<% if(wardrobeActiveQuest&&!['收束','休整'].includes(wardrobeActive.阶段)){ %>
[正在进行的固定衣装支线：<%- wardrobeActiveQuest.id %>「<%- wardrobeActiveQuest.title %>」]
遵守当前受理/查访/商议/行动阶段，一轮至多向前一格，不替玩家行动。来客心愿：<%- wardrobeActiveQuest.wish %>
两种可行路径：<%- wardrobeActiveQuest.paths.join('；') %>
真正收束条件：<%- wardrobeActiveQuest.finish %>
只有本轮正文实际完成帮助、实际结案时，才能更新阶段为收束、记录结果、结算档位完整或基础并追加结案事件；同时在正文交代：<%- wardrobeActiveQuest.delivery %>
结案事件后紧接唯一解锁呈现事件：对象<%- wardrobeActiveQuest.rewardId %>、来源正文、资源无、数量0、耗力0；编号与本轮结案连续。不得直接写衣橱、不得宣告新主线章节完成、不得自动换装。拒绝、暂停、仅讨论方案不能结案领奖。
<% }else if(wardrobePendingQuest&&(!wardrobeActive.编号||wardrobeActiveQuest)){ %>
[尚未交代的支线衣装回礼：<%- wardrobePendingQuest.rewardId %>]
本轮空闲时实际呈现：<%- wardrobePendingQuest.delivery %>
正文呈现后追加唯一解锁呈现事件，对象<%- wardrobePendingQuest.rewardId %>、来源正文、资源无、数量0、耗力0；事件编号E<%- wardrobeEventCount+1 %>，摘要写出实际赠衣事实。若本轮有另一项主要结算则延后，不插入多余事件。
<% } %>
<% } %>

【外观与身份】JK「樱坂晴日」、DK「樱坂薄暮」是本卡原创校园配套设计。校服获赠不设定玩家年龄、学校、学籍或关系。DK可在衣柜切换显露狐耳/人间伪装；school-human同时隐藏狐耳和狐尾。人间场景使用玩家实际选定的外观，不自动改写衣装字段。「野狐旧影」的长发与和装只改变外观，不恢复遗忘、不更改人格、不穿越时间线。新增衣装均为二创，不冒称原作逐帧复刻。发色、发型等自定义字段仍按已有素材能力处理，不宣称校服图像支持任意实时重绘。
'''.replace('__QUESTS__',json.dumps(quests,ensure_ascii=False,separators=(',',':')))
    entries.append(template)
    return card
