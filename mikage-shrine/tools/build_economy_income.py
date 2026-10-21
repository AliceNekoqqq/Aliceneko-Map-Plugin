"""Build bounded donation and production-income sources from the pinned manifest."""
import argparse, copy, hashlib, json, re
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'releases/1.49.3'
dump=lambda x:json.dumps(x,ensure_ascii=False,indent=2)+'\n'
compact=lambda x:json.dumps(x,ensure_ascii=False,separators=(',',':'))
sha=lambda x:hashlib.sha256(x.encode()).hexdigest()
def once(text,old,new):
    assert text.count(old)==1,(old[:90],text.count(old))
    return text.replace(old,new,1)
def build():
    plan=json.loads((OUT/'plan.json').read_text());base=ROOT/'releases'/plan['base']
    spec=json.loads((base/'manifest.json').read_text());mods={m['module_id']:m for m in spec['modules']}
    def load(id):
        text=(ROOT.parent/mods[id]['path']).read_text();assert sha(text)==mods[id]['sha256'];return text
    mvu=load('mvu');panel=load('panels')
    life=json.loads(re.search(r'^  const config = (.*);$',mvu,re.M)[1]);old=copy.deepcopy(life)
    life['donation']=plan['donation'];life['buyback']=plan['buyback'];life['recipes'].append(plan['recipe'])
    assert not set(x['item'] for x in life['buyback']['products']) & set(x['item'] for x in life['shop'])
    mvu=once(mvu,'  const config = '+compact(old)+';','  const config = '+compact(life)+';')
    mvu=once(mvu,'  function reconcileDay(state, previous) {',(ROOT/'src/economy-buyback-domain.js').read_text()+'\n  function reconcileDay(state, previous) {')
    mvu=once(mvu,'recipes, shop, photos, carried','recipes, shop, buyback:buybackView(state), photos, carried')
    mvu=once(mvu,"    if (kind === 'buy') {","    if (kind === 'sell') return sell(state,payload,eventId);\n    if (kind === 'buy') {")
    mvu=once(mvu,'      const amount = expected.spend.奉纳 || 0;',"      const amount = (expected.spend.奉纳 || 0)-(expected.earn?.奉纳 || 0);")
    mvu=once(mvu,"fail('生活操作奉纳扣账须与实际采购一致')","fail('生活操作奉纳扣账须与实际收支一致')")
    mvu=once(mvu,"方式:'生活采购:'+payload.item+'×'+payload.quantity","方式:(payload.kind==='sell'?'生活收购:':'生活采购:')+payload.item+'×'+payload.quantity")
    mvu=once(mvu,'      Object.assign(e,result.event);e.类型=',"      for(const [resource,amount] of Object.entries(result.earn||{}))s.神社[resource]+=amount;\n      Object.assign(e,result.event);e.类型=")
    marker="        s.神社[e.资源]+=e.数量;"
    donation="""        if(e.类型==='奉纳'){
          const cap=ShrineLifeRuntime.config.donation;
          const used=p.记录.事件.filter(x=>x.类型==='奉纳'&&x.天数===s.环境.天数).reduce((n,x)=>n+x.数量,0);
          assert(e.数量<=cap.perEvent,'额外奉纳单次上限为'+cap.perEvent);
          assert(used+e.数量<=cap.perDay,'今日额外奉纳额度不足');
        }
"""
    mvu=once(mvu,marker,donation+marker)
    match=re.search(r'const MikagePanelHTML=("(?:[^"\\]|\\.)*");',panel);html=json.loads(match[1])
    anchor="\n }\n function renderAlbum(){"
    html=once(html,anchor,'\n'+(ROOT/'src/economy-buyback-ui.js').read_text()+anchor)
    html=once(html,'[data-life-buy],[data-life-plant]','[data-life-buy],[data-life-sell],[data-life-plant]')
    anchor="else if(d.lifeBuy)p={kind:'buy',item:d.lifeBuy,quantity:1};"
    html=once(html,anchor,anchor+"else if(d.lifeSell)p={kind:'sell',item:d.lifeSell,quantity:1};")
    html=once(html,"card(r.name,'需要：'+inventoryText(r.inputs),output)","card(r.name,'需要：'+inventoryText(r.inputs)+' · 制成：'+inventoryText(r.output),output)")
    panel=panel[:match.start(1)]+json.dumps(html,ensure_ascii=False)+panel[match.end(1):]
    card=json.loads((base/'card-source.json').read_text());assert sha(dump(card))==spec['source_sha256']
    entries=card['data']['character_book']['entries'];entry=lambda id:next(e for e in entries if e['id']==id)
    rule='额外奉纳采用正文中实际收到的零散香油钱，单次1至'+str(plan['donation']['perEvent'])+'，每剧情日合计至多'+str(plan['donation']['perDay'])+'。事件写真实来源与方式，固定绘马回礼沿结案结算，横丁收购沿生活操作结算。额度依持久事件逐日计算，打开界面保持原额度。'
    entry(1)['content']+='\n<extra_donation_budget>\n'+rule+'\n</extra_donation_budget>'
    entry(11)['content']+='\n<production_income>\n'+rule+'\n第二章起可在实际抵达妖怪横丁后，将库存中的香草、番茄、鲜花或木制御守按收购目录交付，每剧情日收购总额至多'+str(plan['buyback']['perDay'])+'奉纳。批量、库存与收益以当前目录和有效存档为准。成交由玩家显式操作，脚本同步扣库存、入奉纳并记流水。刷新与查看保持原收购额，剧情明确跨日后按新日计算额度。\n番茄饭团便当使用1份米与1份番茄，制成2份既有便当；食物的摆放、携带与实际享用沿原生活规则。\n</production_income>'
    entry(54)['content']+='\n<% if(typeof runType==="string" && runType==="generate" && emaReady){ var donationDay=emaState.环境?.天数; var donationUsed=(emaState.记录?.事件||[]).filter(function(x){return x.类型==="奉纳"&&x.天数===donationDay;}).reduce(function(n,x){return n+x.数量;},0); %>\n【当日额外奉纳】已收<%-donationUsed%>，可入账余量<%-Math.max(0,'+str(plan['donation']['perDay'])+'-donationUsed)%>，单次上限'+str(plan['donation']['perEvent'])+'。按实际受领事实记录；固定绘马回礼与横丁收购各沿原结算。\n<% } %>'
    card['character_version']=card['data']['character_version']=plan['version']
    book=card['data']['character_book'];book['description']=book['description'].replace('v'+plan['base'],'v'+plan['version'])
    outputs={'card-source.json':dump(card),'life-config.json':dump(life),'wardrobe-panel.html':html}
    for id,text in [('mvu',mvu),('panels',panel)]:
        text=once(text,"const version = '"+mods[id]['version']+"';","const version = '"+plan['version']+"';")
        outputs[id+'.mjs']=text;mods[id].update(version=plan['version'],path='mikage-shrine/releases/'+plan['version']+'/'+id+'.mjs',sha256=sha(text))
    spec.update(release=plan['version'],source_name=plan['version']+'/card-source.json',source_sha256=sha(outputs['card-source.json']))
    spec['ema_integration']['bound_worldbook']['version']=plan['version'];spec['reviewed_copy']['preserved_worldbook_version']=plan['version']
    spec['economy_income']={'base':plan['base'],'plan':'mikage-shrine/releases/1.49.3/plan.json','gate':'source_iteration','schema':'unchanged','quota_source':'existing event and resource ledgers','packaging':'not requested'}
    outputs['manifest.json']=dump(spec);return outputs
if __name__=='__main__':
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('--dry-run',action='store_true');a=p.parse_args();outputs=build()
    if not a.dry_run:
        assert not any((OUT/k).exists() for k in outputs),'Use fresh output files'
        for k,v in outputs.items():(OUT/k).write_text(v)
    print(dump({'dry_run':a.dry_run,'outputs':{k:{'bytes':len(v.encode()),'sha256':sha(v)} for k,v in outputs.items()}}))
