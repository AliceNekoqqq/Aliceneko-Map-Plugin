"""Derive the authorized production/pacing iteration from the pinned 1.49.5 source."""
import argparse, copy, hashlib, json, re
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'releases/1.49.6'
dump=lambda x:json.dumps(x,ensure_ascii=False,indent=2)+'\n'
compact=lambda x:json.dumps(x,ensure_ascii=False,separators=(',',':'))
sha=lambda x:hashlib.sha256(x.encode()).hexdigest()
def once(s,old,new):
    assert s.count(old)==1,(old[:90],s.count(old))
    return s.replace(old,new,1)
def build():
    plan=json.loads((OUT/'plan.json').read_text());base=ROOT/'releases'/plan['base']
    spec=json.loads((base/'manifest.json').read_text());mods={m['module_id']:m for m in spec['modules']}
    def load(id):
        text=(ROOT.parent/mods[id]['path']).read_text();assert sha(text)==mods[id]['sha256'];return text
    mvu=load('mvu');panel=load('panels')
    # Finish existing settlement first, including archive/reward presentation, then release.
    marker='    deriveProgress(s);assert(equal(s.衣橱.待呈现,expectedWardrobe.待呈现)'
    release="    if(e?.类型==='结案'&&s.记录.完成委托.slice(p.记录.完成委托.length).some(x=>x.编号===p.委托.编号))s.委托=clone(ShrineInitial.委托);\n"
    mvu=once(mvu,marker,release+marker)
    mvu=once(mvu,'    const a=p.委托,b=s.委托;',"    if(e?.类型==='结案')assert(p.委托.编号&&p.委托.阶段==='行动'&&s.委托.编号===p.委托.编号&&s.委托.阶段==='收束'&&e.对象===p.委托.编号,'结案须对应当前委托从行动到收束的实际回应');\n    const a=p.委托,b=s.委托;")
    life=json.loads(re.search(r'^  const config = (.*);$',mvu,re.M)[1]);old=copy.deepcopy(life)
    next(x for x in life['crops'] if x['id']=='herb')['yield']['herb']=plan['economy']['herb_yield_per_plot']
    life['buyback']=plan['economy']['buyback']
    mvu=once(mvu,'  const config = '+compact(old)+';','  const config = '+compact(life)+';')
    mvu=once(mvu,'  function runAction(state, payload, eventId) {',(ROOT/'src/production-batch-actions.js').read_text()+'\n  function runAction(state, payload, eventId) {')
    # Replace only the two original action branches, leaving plant and every other action intact.
    for kind,following,call in [('craft','plant','craftBatch'),('harvest','place','harvestBatch')]:
        start=mvu.index("    if (kind === '"+kind+"') {")
        end=mvu.index("    if (kind === '"+following+"') {",start)
        original=mvu[start:end]
        assert original.rstrip().endswith('}')
        mvu=mvu[:start]+"    if (kind === '"+kind+"') return "+call+"(state, payload);\n"+mvu[end:]
    match=re.search(r'const MikagePanelHTML=("(?:[^"\\]|\\.)*");',panel);html=json.loads(match[1])
    html=once(html,' function renderCraft(){',(ROOT/'src/production-batch-ui.js').read_text()+'\n function renderCraft(){')
    oldline="  const grid=make('div','life-grid');for(const r of view.recipes){const output=Object.keys(r.output||{})[0],{e,body}=card(r.name,'需要：'+inventoryText(r.inputs)+' · 制成：'+inventoryText(r.output),output);const locked=Number(r.stage)>Number(view.unlocked.stage);body.append(button(locked?'第'+r.stage+'章开放':'制作','lifeCraft',r.id,locked||!r.canMake));grid.append(e);}$('#life-content').append(grid);"
    html=once(html,oldline,"  const grid=make('div','life-grid');for(const r of view.recipes)grid.append(craftCard(r));$('#life-content').append(grid);")
    a=html.index('   for(const row of trade.products){');b=html.index("   $('#life-content').append(trades);",a)
    html=html[:a]+'   for(const row of trade.products)trades.append(sellCard(row,trade));\n'+html[b:]
    marker='  for(const plot of view.plots){'
    html=once(html,marker,"  const ready=view.plots.filter(x=>x.ready);$('#life-content').append(button('收取成熟菜圃（'+ready.length+'块）','lifeHarvestAll','ready',!ready.length));\n"+marker)
    html=once(html,'[data-life-harvest],[data-life-photo]','[data-life-harvest],[data-life-harvest-all],[data-life-photo]')
    html=once(html,"else if(d.lifeCraft)p={kind:'craft',recipe:d.lifeCraft};","else if(d.lifeCraft)p={kind:'craft',recipe:d.lifeCraft,quantity:Number($('#life-craft-quantity-'+d.lifeCraft).value)};")
    html=once(html,"else if(d.lifeSell)p={kind:'sell',item:d.lifeSell,quantity:1};","else if(d.lifeSell)p={kind:'sell',item:d.lifeSell,quantity:Number($('#life-sell-quantity-'+d.lifeSell).value)};")
    html=once(html,"else if(d.lifeHarvest)p={kind:'harvest',plot:d.lifeHarvest};","else if(d.lifeHarvest)p={kind:'harvest',plot:d.lifeHarvest};else if(d.lifeHarvestAll)p={kind:'harvest',plots:view.plots.filter(x=>x.ready).map(x=>x.id)};")
    panel=panel[:match.start(1)]+json.dumps(html,ensure_ascii=False)+panel[match.end(1):]
    card=json.loads((base/'card-source.json').read_text());assert sha(dump(card))==spec['source_sha256']
    entry=lambda id:next(e for e in card['data']['character_book']['entries'] if e['id']==id)
    t=entry(1)['content']
    t=once(t,'流程为受理→查访→商议→行动→收束→休整','流程为受理→查访→商议→行动→收束；结案当轮由脚本归档并释放活动槽')
    t=once(t,'    休整清槽:\n      type: 事件\n      values: 休整\n      check:\n      - 普通委托结案后下一步进入休整，再由后续休整事件清空活动槽\n      - 不自动重置、删档或覆盖暂停任务。','    结案归档:\n      type: 领域结算\n      check:\n      - 模型写实际结果、结算档位及结案事件，活动委托阶段写收束\n      - 脚本当轮完成回礼、完整快照归档和活动槽释放；暂停档及历史保留\n      - 下一份绘马沿玩家主动接取；休息、闲聊与出行按玩家选择展开。')
    entry(1)['content']=t
    entry(11)['content']=once(entry(11)['content'],'每剧情日收购总额至多4奉纳','每剧情日收购总额至多5奉纳')
    entry(11)['content']+='\n<production_batches>\n手作按玩家选择的批数一次结算全部材料与产物；菜圃按玩家选定的成熟地块一次收取。成熟仍依据实际剧情日。两块香草畦成熟共收6份香草；番茄与鲜花沿原生长期和产量。收购以界面当前目录、库存和当日剩余额度核验；每次确认记一项生活事件及实际收支流水。\n</production_batches>'
    card['character_version']=card['data']['character_version']=plan['version']
    book=card['data']['character_book'];book['description']=book['description'].replace('v'+plan['base'],'v'+plan['version'])
    outputs={'card-source.json':dump(card),'life-config.json':dump(life),'wardrobe-panel.html':html}
    for id,text in [('mvu',mvu),('panels',panel)]:
        text=once(text,"const version = '"+mods[id]['version']+"';","const version = '"+plan['version']+"';")
        outputs[id+'.mjs']=text;mods[id].update(version=plan['version'],path='mikage-shrine/releases/'+plan['version']+'/'+id+'.mjs',sha256=sha(text))
    spec.update(release=plan['version'],source_name=plan['version']+'/card-source.json',source_sha256=sha(outputs['card-source.json']))
    spec['ema_integration']['bound_worldbook']['version']=plan['version'];spec['reviewed_copy']['preserved_worldbook_version']=plan['version']
    spec['bound_worldbook'].update(source='mikage-shrine/releases/'+plan['version']+'/card-source.json',version=plan['version'],entry_sha256=sha(dump(book['entries'])))
    spec['checkpoint'].update(base=plan['base'],plan='mikage-shrine/releases/'+plan['version']+'/plan.json',gate='source_iteration',gameplay='production profit/batches and atomic quest slot release',packaging='not requested')
    spec['production_pacing']={'plan':'mikage-shrine/releases/'+plan['version']+'/plan.json','economy':plan['economy'],'schema':'unchanged','closure':'archive and release in existing closure transaction','real_host':'pending','packaging':'not requested'}
    outputs['manifest.json']=dump(spec)
    return outputs
if __name__=='__main__':
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('--dry-run',action='store_true');args=p.parse_args();outputs=build()
    if not args.dry_run:
        assert not any((OUT/k).exists() for k in outputs),'Fresh output files required'
        for k,v in outputs.items():(OUT/k).write_text(v)
    print(dump({'dry_run':args.dry_run,'outputs':{k:{'bytes':len(v.encode()),'sha256':sha(v)} for k,v in outputs.items()}}))
