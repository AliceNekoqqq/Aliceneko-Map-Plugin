"""Repair proven reward/closure/location contradictions in ordered local stages."""
import argparse,hashlib,json,re
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'releases/1.49.5'
dump=lambda x:json.dumps(x,ensure_ascii=False,indent=2)+'\n'
compact=lambda x:json.dumps(x,ensure_ascii=False,separators=(',',':'))
sha=lambda x:hashlib.sha256(x.encode()).hexdigest()
def once(s,old,new):
    assert s.count(old)==1,(old[:90],s.count(old))
    return s.replace(old,new,1)
def build(through=3):
    plan=json.loads((OUT/'plan.json').read_text());base=ROOT/'releases'/plan['base'];spec=json.loads((base/'manifest.json').read_text())
    mod=next(x for x in spec['modules'] if x['module_id']=='mvu');mvu=(ROOT.parent/mod['path']).read_text();assert sha(mvu)==mod['sha256']
    cfg=json.loads(re.search(r'^const ShrineConfig = (.*);$',mvu,re.M)[1]);card=json.loads((base/'card-source.json').read_text());assert sha(dump(card))==spec['source_sha256']
    entry=lambda id:next(e for e in card['data']['character_book']['entries'] if e['id']==id)
    t=entry(54)['content']
    # Stage 1: reconcile the existing presentation reader with the actual reward authority.
    main=[r for r in cfg['wardrobeRewards'] if not r.get('sideQuest')]
    matches=list(re.finditer(r'^var rewards = .*;$',t,re.M));assert len(matches)==1
    t=t[:matches[0].start()]+'var rewards = '+compact(main)+';'+t[matches[0].end():]
    t=once(t,"emaEscape(reward.narrativeSource || '')","(outfits.length ? emaEscape(reward.narrativeSource || '') : '上述地区随本章真实结案开放；生活衣装在月之森和裁舍另行购买。')")
    t=once(t,'本章修缮圆满告竣，街坊邻里与神怪生灵的谢礼已由巴卫细心收纳于社务所樟木柜中：','本章真实结案时，可交代以下地区往来与纪念收录：')
    t=once(t,'巴卫倚在门扉边，微挑眉梢示意你去瞧瞧新衣物与地图新路径，神色间难掩大功告成的快慰。','巴卫依当前场景说明新的往来与本章可选纪念。')
    delivery="<% if(emaChapterReward.outfits.length){ %>纪念衣装已妥存社务所，可在衣橱自行挑选；接受、穿戴与出行由玩家决定。<% }else{ %>本次呈现为地区开放说明，生活衣装沿月之森目录购买。<% } %>"
    t=once(t,'叙事应明确衣物已送到社务所妥存、可在衣橱挑选；不得替玩家接受、穿戴、出发、下水或做其他玩家行动。',delivery)
    t=t.replace('[通关后的静谧时光·待取阅的纪念衣装 ','[已结案章节·解锁待呈现 ')
    t=once(t,'祭典盛况虽已落幕，深厚的情谊已化作永久的念想：','已完成章节的往来与纪念仍可依实际结果交代：')
    t=once(t,'巴卫已将衣裳熨烫平整置于阁楼，待你随时披上新裳共赏晴雨。',"<% if(emaPendingReward.outfits.length){ %>纪念衣装已妥存社务所，供玩家自行挑选。<% } %>")
    old='衣物已送到社务所妥存，可在衣橱挑选；不代玩家接受或穿戴。';assert t.count(old)==2
    t=t.replace(old,"<% if(emaPendingReward.outfits.length){ %>纪念衣装已妥存社务所，可在衣橱自行挑选。<% }else{ %>本次呈现为地区开放说明，生活衣装沿月之森目录购买。<% } %>")
    entry(1)['content']=once(entry(1)['content'],'基础工作衣装始终可用；章节衣装按 wardrobeRewards 对应主线结案解锁；本版五套衣装与DK人间伪装由四条固定衣装支线结案解锁，M05仅在实际通关后解锁','基础工作衣装始终可用；主线与支线纪念装按 wardrobeRewards、wardrobeQuests 的实际结案来源收录；生活衣装按 wardrobeShop 购买事件收录，巴卫校服人间伪装与 school 共用购买；M05纪念装在实际通关后收录。')
    if through>=2:
        # Stage 2: keep the established chapter contract and read the actual facility value.
        t=once(t,'emaProgress.阶段设施 === 4','emaState.神社 && emaState.神社[emaProgress.阶段设施] === 4')
        t=once(t,'尚需添砖加瓦，切莫急躁，细品烟火日常。','的修缮进展以当前实际状态为准。')
        t=once(t,'主线推进深植于二人朝夕相伴的真切经历中。当全章修缮齐备、街区欢腾、宾客散场且二人于鸟居下互道辛苦之时，方为真正的圆满结案。','本章结案以实际完成的行动、当事回应与设施完工为依据。')
        t=once(t,'只有正文实际描写举办和收场并有状态依据，才可提出主线结案；',"<% if(emaId==='M05'){ %>正文已实际举办并收场祭典且同楼状态有依据时，<% }else{ %>本章设施完工、实际回应与本章目标均满足时，<% } %>才可提出主线结案；")
    entry(54)['content']=t
    if through>=3:
        # Stage 3: location is a positive exact match, separate from neighbouring/departed places.
        old="s.地图.当前地区===shopConfig.region&&String(s.环境.地点).includes(shopConfig.name)"
        new="s.地图.当前地区===shopConfig.region&&String(s.环境.地点).trim()===shopConfig.location"
        assert new in (ROOT/'src/wardrobe-shop-domain.js').read_text()
        mvu=once(mvu,old,new)
        entry(49)['content']=once(entry(49)['content'],'购买前由玩家明确选择商品，并在正文实际抵达店内、核对目录售价。','购买前由玩家明确选择商品，并在正文实际抵达店内、核对目录售价。店内地点字段采用「宇庭老街·月之森和裁舍」；门外、街边与离店后沿实际位置记录。')
    mvu=once(mvu,"const version = '"+mod['version']+"';","const version = '"+plan['version']+"';")
    mod.update(version=plan['version'],path='mikage-shrine/releases/'+plan['version']+'/mvu.mjs',sha256=sha(mvu))
    card['character_version']=card['data']['character_version']=plan['version'];book=card['data']['character_book'];book['description']=book['description'].replace('v'+plan['base'],'v'+plan['version'])
    spec.update(release=plan['version'],source_name=plan['version']+'/card-source.json',source_sha256=sha(dump(card)))
    spec['ema_integration']['bound_worldbook']['version']=plan['version'];spec['reviewed_copy']['preserved_worldbook_version']=plan['version']
    spec['bound_worldbook'].update(source='mikage-shrine/releases/1.49.5/card-source.json',version=plan['version'],entry_sha256=sha(dump(book['entries'])))
    spec['checkpoint'].update(base=plan['base'],plan='mikage-shrine/releases/1.49.5/plan.json',gate='source_iteration',gameplay='catalogue, prices, rewards, schema and initial unchanged',packaging='not requested')
    spec['objective_repairs']={'plan':'mikage-shrine/releases/1.49.5/plan.json','applied_stages':[s['id'] for s in plan['stages'][:through]],'gate':'source_iteration','packaging':'not requested','real_host':'pending'}
    return {'card-source.json':dump(card),'mvu.mjs':mvu,'manifest.json':dump(spec)}
if __name__=='__main__':
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('--dry-run',action='store_true');a=p.parse_args();outputs=build()
    assert not any((OUT/k).exists() for k in outputs),'Fresh output files required'
    if not a.dry_run:
        for k,v in outputs.items():(OUT/k).write_text(v)
    print(dump({'dry_run':a.dry_run,'outputs':{k:{'bytes':len(v.encode()),'sha256':sha(v)} for k,v in outputs.items()}}))
