"""Derive the unpublished 1.49.0 shop candidate from the pinned 1.48.4 manifest."""
import argparse,copy,hashlib,json,re
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
BASE=ROOT/'releases/1.48.4';OUT=ROOT/'releases/1.49.0';VERSION='1.49.0'
dump=lambda x:json.dumps(x,ensure_ascii=False,indent=2)+'\n'
compact=lambda x:json.dumps(x,ensure_ascii=False,separators=(',',':'))
sha=lambda x:hashlib.sha256(x.encode()).hexdigest()
def once(s,a,b):
    assert s.count(a)==1,(a[:90],s.count(a));return s.replace(a,b,1)
def build():
    spec=json.loads((BASE/'manifest.json').read_text());mods={x['module_id']:x for x in spec['modules']}
    def load(id):
        t=(ROOT.parent/mods[id]['path']).read_text();assert sha(t)==mods[id]['sha256'];return t
    mvu=load('mvu');panel=load('panels');card=json.loads((BASE/'card-source.json').read_text());entries=card['data']['character_book']['entries'];entry=lambda id:next(e for e in entries if e['id']==id)
    cfg=json.loads(re.search(r'^const ShrineConfig = (.*);$',mvu,re.M)[1]);oldcfg=copy.deepcopy(cfg)
    baseline={'player':['daily','shrine','work'],'tomoe':['usual','work']}
    sale={'player':['festival','sakura','seabreeze','forest','swim','school','gym'],'tomoe':['festival','aoba','journey','grove','swim','school','city','winter','butler']}
    scene=load('scene');catalog=json.loads(re.search(r'const catalog=(.*);',scene)[1]);names={(a,o['id']):o['name'] for a,v in catalog['actors'].items() for o in v['outfits']}
    scene=once(scene,'e.deriveProgress(s);e.checkFields(s);return s;',"for(const p of e.config.wardrobeShop.products)s.记录.事件.push({编号:'E'+(s.记录.事件.length+1),类型:'衣装购买',摘要:'独立测试副本：商品已收录',对象:p.sku,来源:e.config.wardrobeShop.name,方式:JSON.stringify({sku:p.sku}),资源:'无',数量:0,耗力:0,天数:s.环境.天数});e.deriveProgress(s);e.checkFields(s);return s;")
    products=[]
    for actor,ids in sale.items():
        for id in ids:
            outfits=[{'actor':actor,'id':id,'name':names[actor,id]}]
            if actor=='tomoe' and id=='school':outfits.append({'actor':'tomoe','id':'school-human','name':names[actor,'school-human'],'variantOf':'school'})
            products.append(dict(sku=actor+':'+id,name=names[actor,id],price=3 if id in ['school','city','butler'] else 2,outfits=outfits))
    shop=dict(name='月之森和裁舍',npc='长崎素世',region='R02',location='宇庭老街·月之森和裁舍',products=products)
    cfg['wardrobeShop']=shop
    removed={'WQ01','WQ03','WQ04','WQ05'}
    cfg['wardrobeQuests']=[q for q in cfg['wardrobeQuests'] if q['id'] not in removed]
    cfg['wardrobeRewards']=[r for r in cfg['wardrobeRewards'] if r.get('sideQuest') not in removed]
    for r in cfg['wardrobeRewards']:
        if r['id'] in ['U02','U03','U04']:
            r['outfits']=[];r['narrativeSource']='正文呈现本章真实修缮与往来后开放的地区。生活衣装由月之森和裁舍的目录提供，购买后包装收录，当前穿着依玩家选择。'
    q=next(q for q in cfg['wardrobeQuests'] if q['id']=='WQ07');q['outfits']=[o for o in q['outfits'] if o['id']=='heian-travel'];q.update(wish='鞍马山旧物整理人保存着一套市女笠旅装衣样，希望登记来历并制作可穿用的复原样衣。',clues=['衣样注明平安风格，穿用者一栏留空。','斗笠垂纱与旅装的层次需要分别核对。'],paths=['按衣样登记年代风格与裁片，再与修复师核对复原方案。','以复制件展示古衣层次，原件按保存规程封存。'],finish='完成旅装衣样登记与复原，由整理人确认交付。',delivery='市女笠旅装复原件包装送至神社衣柜；当前身份与时间依实际剧情。')
    r=next(r for r in cfg['wardrobeRewards'] if r['id']=='UW-ANCIENT');r['outfits']=copy.deepcopy(q['outfits']);r['narrativeSource']=q['delivery']
    chibi=dict(id='WQ09',rewardId='UW-KOZUCHI',mainId='M03',region='R08',title='万宝槌的余响',person='鸣神殿旧神具保管人',type='古物',wish='鸣神殿整理万宝槌旧档，想核对缩小术的记载并将封存器具妥善保管。巴卫可依当下意愿确认安全的外观演示方案。',clues=['旧档记着万宝槌曾使巴卫缩小的事件。','器具当前封存，展示用衣物与施术流程分别登记。'],paths=['与保管人核对旧档和封存状态，完成安全展示说明。','请巴卫选择是否提供外观参考，只登记他明确愿意说明的部分。'],finish='完成旧神具登记和展示方案，并由保管人与巴卫确认交付；本次实际形态由当前衣装记录决定。',condition='第三章结案、鸣神殿开放后，完成「万宝槌的余响」',delivery='幼狐巴卫外观收录至衣柜，巴卫主动选择chibi时显示儿童外观，互动采用安全照料与嬉闹。',outfits=[dict(actor='tomoe',id='chibi',name=names['tomoe','chibi'])])
    cfg['wardrobeQuests'].append(chibi);cfg['wardrobeRewards'].append(dict(id='UW-KOZUCHI',mainId='WQ09',stage=4,regions=[],sideQuest='WQ09',condition=chibi['condition'],narrativeSource=chibi['delivery'],outfits=chibi['outfits']))
    # Remaining plot outfits are optional commemorative reconstructions, with their exact existing IDs.
    for q in cfg['wardrobeQuests']:
        if q['id']=='WQ02':q.update(region='R07',person='龙宫旧物保管人',wish='龙宫旧物库清点出与野狐旧事有关的衣纹记录，希望核对旧匣来历并按留存纹样复原一套衣装。',clues=['旧布纹样与巴卫旧衣相近，来历尚待保管人核实。','旧匣的登记与龙王旧事有所关联，具体内容依调查发现。'],paths=['与龙宫保管人核对旧匣登记，再由修复师复原留存衣纹。','请巴卫按当前意愿辨认衣纹，将他愿意说明的部分记入复原说明。'],finish='保管人确认旧物已妥善登记、复原衣样完成；巴卫的记忆与玩家来历各依当前剧情。',condition='第三章结案、龙宫城开放后，完成衣装支线「旧匣中的衣纹」',delivery='保管人确认旧匣登记与复原衣样后，将野狐旧影包装交付。长发与旧装作为当前可选外观，封存记忆依实际剧情逐步探明。')
        if q['id']=='WQ06':q['wish']='出云祭礼处正在整理神乐铃与礼装，邀请协助核对铃具、衣样和祭礼记录，准备一套用于后续自选演出的复原礼装。';q['finish']='完成神乐器具与礼装核对，由保管人确认；学习、演出和神职分别由玩家实际选择。'
        if q['id']=='WQ08':q.update(wish='出云大社祭礼处的民俗礼服展结束，保管人请人核对返还记录，并与素世商议制作两套纪念样衣。',clues=['展柜照片用于核对礼服样式，实际关系采用当前记录。','月之森和裁舍的入库单记着两套展示样衣的衣料与包装。'],paths=['与保管人核对展柜照片，再联系素世确认两套样衣。','清点祭礼处库房和送还单据，补全返还记录后核对复制委托。'],finish='展品登记与样衣委托经保管人和素世确认后结案；婚礼与关系由实际剧情确认。');q['delivery']='月之森和裁舍按礼服展陈的委托交付白无垢与黑纹付羽织袴纪念样衣，包装妥存社务所。婚礼、关系确认与人化各依实际剧情。'
        q['wish']=q['wish'].replace('会所','出云大社祭礼处')
        q['paths']=[p.replace('会所师傅','祭礼处师傅') for p in q['paths']]
        reward=next(r for r in cfg['wardrobeRewards'] if r['id']==q['rewardId']);reward['narrativeSource']=q['delivery'];reward['condition']=q['condition']
    mvu=once(mvu,'const ShrineConfig = '+compact(oldcfg)+';','const ShrineConfig = '+compact(cfg)+';')
    mvu=once(mvu,"const baseline={player:['daily','shrine','work','festival'],tomoe:['usual','work','festival']};",'const baseline='+compact(baseline)+';')
    anchor='  const outfitIdsPlayer=()=>outfitIds.player;'
    mvu=once(mvu,anchor,"  for(const p of ShrineConfig.wardrobeShop.products)for(const o of p.outfits)outfitIds[o.actor].add(o.id);\n"+anchor)
    mvu=once(mvu,'  function deriveWardrobe(s){',(ROOT/'src/wardrobe-shop-domain.js').read_text()+'\n  function deriveWardrobe(s){')
    mvu=once(mvu,'    s.衣橱.已解锁=expected;',"    for(const e of s.记录.事件.filter(x=>x.类型==='衣装购买'))for(const o of purchaseProduct(e).outfits){const id=o.actor+':'+o.id;if(!expected.some(x=>x.编号===id))expected.push({编号:id,角色:o.actor,衣装:o.id});}\n    s.衣橱.已解锁=expected;")
    mvu=once(mvu,"      if(e.类型==='施术'){","      if(e.类型==='衣装购买')applyPurchase(s,p,e);\n      if(e.类型==='施术'){")
    mvu=once(mvu,"    else if(name==='setOutfit'){","    else if(name==='buyOutfit'){\n      const product=shopProduct(payload.sku);assert(product,'请从月之森目录选择商品');e.类型='衣装购买';e.对象=product.sku;e.来源=shopConfig.name;e.方式=JSON.stringify({sku:product.sku});e.摘要='素世将'+product.name+'包装交付，支出'+product.price+'奉纳，收录衣柜；当前穿着保留。';\n    }\n    else if(name==='setOutfit'){")
    mvu=once(mvu,'config:ShrineConfig,wardrobeQuestView,life};','config:ShrineConfig,wardrobeQuestView,shopView,life};')
    fields=json.loads(re.search(r'^const ShrineFieldSpec = (.*);$',mvu,re.M)[1]);oldfields=copy.deepcopy(fields)
    for f in fields:
        if f['path']=='记录.事件.*.类型':f['enum'].append('衣装购买')
        if f['path'].startswith('衣橱'):f['说明']='基础衣装依配置可用；纪念装由剧情结案、生活装由月之森购买事件派生，模型只追加真实事件。'
        if f['path'] in ['衣橱.待呈现.*','衣橱.已呈现.*']:f['enum']=[r['id'] for r in cfg['wardrobeRewards']]
    mvu=once(mvu,'const ShrineFieldSpec = '+compact(oldfields)+';','const ShrineFieldSpec = '+compact(fields)+';')
    for path in ['记录.事件.*.类型','衣橱.待呈现.*']:
        a=next(f['enum'] for f in oldfields if f['path']==path);b=next(f['enum'] for f in fields if f['path']==path)
        assert json.dumps(a,ensure_ascii=False) in mvu;mvu=mvu.replace('z.enum('+json.dumps(a,ensure_ascii=False)+')','z.enum('+json.dumps(b,ensure_ascii=False)+')')
    # UI stays on its established floor/token bridge. Buying uses a new message snapshot.
    match=re.search(r'const MikagePanelHTML=("(?:[^"\\]|\\.)*");',panel);html=json.loads(match[1])
    html=once(html,"const baseOutfitIds = new Set(['daily', 'shrine', 'work', 'festival', 'usual']);","const baseOutfitIds = new Set(['daily', 'shrine', 'work', 'usual']);\n    const shopFor=(actor,id)=>(GAME_CONFIG.wardrobeShop?.products||[]).find(p=>p.outfits.some(o=>o.actor===actor&&o.id===id));")
    html=once(html,"      for (const reward of rewards) {","      const product=shopFor(actor,outfitId);if(product)return {reward:{},condition:'月之森和裁舍 · '+product.price+' 奉纳',narrativeSource:'素世包装交付后收录衣柜',outfit:product.outfits.find(o=>o.actor===actor&&o.id===outfitId)};\n      for (const reward of rewards) {")
    html=once(html,'    renderOutfitMemory(wardrobeActor,preview,lookOwned);',(ROOT/'src/wardrobe-shop-ui.js').read_text()+'\n    renderOutfitMemory(wardrobeActor,preview,lookOwned);')
    html=once(html,"const robeAction=['setOutfit','nameOutfit'].includes(type);","const robeAction=['setOutfit','nameOutfit','buyOutfit'].includes(type);")
    html=once(html,"type==='setOutfit'?'正在更换衣装…':'正在保存纪念名…'","type==='setOutfit'?'正在更换衣装…':type==='buyOutfit'?'素世正在包装衣物…':'正在保存纪念名…'")
    html=once(html,"      else if (type === 'nameOutfit') result = await bridge.act('nameOutfit', payload);","      else if (type === 'nameOutfit') result = await bridge.act('nameOutfit', payload);\n      else if (type === 'buyOutfit' || type === 'shopDraft') result = await bridge.act(type, payload);")
    html='\n'.join(line.rstrip() for line in html.split('\n'))
    html=once(html,'</head>','<style>.moonforest-note{white-space:pre-line;line-height:1.8;font-size:13px;flex:1 1 100%;margin:4px 0}.moonforest-price{align-self:center;font-size:14px}.moonforest-confirm{flex:1 1 100%;padding:12px;border:1px solid #a68c61;border-radius:8px;background:#f2e9d5;color:#403b31}.moonforest-confirm p{font-size:13px;line-height:1.8}.moonforest-confirm button,.moonforest-buy{min-height:44px!important;white-space:normal;overflow-wrap:anywhere}.moonforest-confirm button{margin:4px}</style></head>')
    panel=panel[:match.start(1)]+json.dumps(html,ensure_ascii=False)+panel[match.end(1):]
    panel=once(panel," const base=actor==='player'?['daily','shrine','work','festival']:['usual','work','festival'];"," const base=actor==='player'?['daily','shrine','work']:['usual','work'];")
    panel=once(panel," const owned=reward?(previous.衣橱.已解锁||[]).some(function(x){return x.角色===actor && x.衣装===id;}):base.includes(id);"," const owned=base.includes(id)||(previous.衣橱.已解锁||[]).some(function(x){return x.角色===actor && x.衣装===id;});")
    panel=once(panel,'const v=clone(s);v.衣装记忆=outfitMemory(s);','const v=clone(s);v.衣装商店=engine().shopView(s);v.衣装记忆=outfitMemory(s);')
    panel=once(panel,"      const before=playable(r.table.stat_data);","      if(name==='shopDraft'){await prepareShopDraft(payload.sku);return {ok:true};}\n      const before=playable(r.table.stat_data);")
    panel=once(panel,"const text=name==='life'?","const text=name==='buyOutfit'?(s.记录.事件.at(-1)?.摘要||'衣物已包装收录。')+'\\n\\n<StatusPlaceHolderImpl/>':name==='life'?")
    panel=once(panel,"const visibleSnapshot=name==='life';","const visibleSnapshot=name==='life'||name==='buyOutfit';")
    pos=panel.index('  async function prepareQuiet(id){');panel=panel[:pos]+'''  async function prepareShopDraft(sku){
    const p=engine().config.wardrobeShop.products.find(x=>x.sku===sku);assert(p,'商品目录已变化');
    const input=host.document.querySelector('#send_textarea');assert(input,'聊天输入框暂不可用');
    const text='我想去宇庭老街的月之森和裁舍，向素世看看「'+p.name+'」（'+p.price+'奉纳）。先展开到店与选购，购买由我确认。';
    input.value+=(input.value?'\\n':'')+text;input.dispatchEvent(new host.Event('input',{bubbles:true}));
  }
'''+panel[pos:]
    panel='\n'.join(line.rstrip() for line in panel.split('\n'))
    # Model-facing acquisitions and exact catalog, without touching appearance descriptions.
    old=entry(49)['content'];a=old.index('<outfit_unlocks_and_presentation>');b=old.index('</outfit_unlocks_and_presentation>')+len('</outfit_unlocks_and_presentation>')
    rules='''<outfit_unlocks_and_presentation>
衣装来源以当前ShrineConfig.wardrobeRewards、wardrobeQuests与wardrobeShop为准。基础工作衣装开局可用；神乐、野狐、古衣、幼狐与婚礼风格纪念装沿对应剧情支线收录；日常、校服、季节、浴衣和泳装由R02宇庭老街「月之森和裁舍」出售。
购买前由玩家明确选择商品，并在正文实际抵达店内、核对目录售价。素世奉上红茶、说明剪裁与包装，饮用、试衣与购买各由玩家决定；巴卫同行时按当前关系与衣装反应。成交后衣物包装交付，归社妥存依实际行程描写；购买只收录衣柜，当前穿着保留，换装沿用玩家显式选择。
模型仅向/记录/事件/-追加一次「衣装购买」事件。对象使用目录sku，来源固定「月之森和裁舍」，方式为仅含sku的JSON字符串，资源=无、数量=0、耗力=0，天数按当前剧情日。售价、修缮预留、扣款、流水和actor+id归属由领域脚本一次结算。已拥有商品保持原余额，校服人间伪装与巴卫school共用一次购买。
剧情纪念装按对应支线逐步调查、商议、行动与结案。真实结案当轮呈现配置中的包装交付事实，并沿既有协议追加连续编号的「解锁呈现」事件；其余时候按待呈现队列处理。地区开放说明与服装来源分别呈现。
</outfit_unlocks_and_presentation>'''
    entry(49)['content']=old[:a]+rules+old[b:]
    entry(57)['content']=re.sub(r'var wardrobeQuestCatalog=.*;',lambda _: 'var wardrobeQuestCatalog='+compact(cfg['wardrobeQuests'])+';',entry(57)['content'],count=1)
    entry(58)['content']='作者维护：现行衣装支线以当前配置和动态候选为准；月之森购买目录独立提供生活衣装。'
    entry(26)['keys']=[('月之森和裁舍' if k=='裁衣铺' else k) for k in entry(26)['keys']]
    for id in [1,55]:
        t=entry(id)['content'];t=t.replace("'生活互动']","'生活互动', '衣装购买']").replace("'UW-WEDDING']","'UW-WEDDING', 'UW-KOZUCHI']").replace('/生活互动/解锁呈现','/生活互动/衣装购买/解锁呈现');t=t.replace('基础七套','基础工作衣装').replace('其余衣装由对应主线结案解锁','其余衣装由剧情纪念或月之森购买事件派生')
        t=t.replace('并呈现樱染散策、青岚羽织的谢礼来源；未替玩家换装','并说明生活衣装在月之森和裁舍另行购买，当前穿着保留')
        t+='\n<wardrobe_purchase_protocol>\n生活衣装来源见衣装规则与月之森动态目录。模型只追加玩家实际确认的衣装购买事件。\n购买事件示例：'+compact([dict(op='add',path='/记录/事件/-',value=dict(编号='E1',类型='衣装购买',摘要='玩家确认购买樱染散策，素世包装交付。',对象='player:sakura',来源='月之森和裁舍',方式=compact(dict(sku='player:sakura')),资源='无',数量=0,耗力=0,天数=0))])+'\n事件编号接续当前记录；模型提交意图，运行时核验地点、售价与余额后结算。\n</wardrobe_purchase_protocol>'
        for f in fields:
            if f['path'] in ['衣橱.待呈现.*','衣橱.已呈现.*']:
                t=re.sub(re.escape(f['path'])+r' \|[^\n]*',lambda _:f['path']+' | string '+repr(f['enum'])+' | 插件/领域脚本派生 | '+f['说明'],t)
        entry(id)['content']=t
    npc=copy.deepcopy(entry(82));npc.update(id=83,name='长崎素世',comment='长崎素世｜月之森和裁舍',keys=['长崎素世','素世','Soyorin','月之森','和裁舍','宇庭老街'],insertion_order=115,content='''<npc_soyorin>
长崎素世（Soyorin／素世）经营宇庭町通往御影神社参道坡道旁的「月之森和裁舍」，在地图R02宇庭高校与通学路所连的老街范围。她是名门女子学园的高中生千金，暖栗色微卷长发，举止温婉端庄，常穿素色和服、外系围裙，店里常备大吉岭红茶。
素世待客礼貌周到，手艺精细，展示目录中的和服、浴衣、校园风制服与季节衣物。客人到店时，她会把红茶放到桌边，认真介绍衣料和搭配。偶尔微笑着说「若是一生之选，往后也请好好照料它」。这份认真只作轻度彩蛋，客户按自己的心意挑选。
进店招待依当前场景展开，餐点库存和饮用恢复各走原有生活规则。
巴卫的条件性评价：「衣服剪裁得还算规整，挑不出线头。就是成天端着红茶笑眯眯的，客套得让人嫌烦。」是否说出以及语气依实际交流。
商品、奉纳售价和购买结果以动态目录与有效存档为准；服装外观、玩家身份和关系分别采用当前记录。
</npc_soyorin>''');npc['extensions']['display_index']=21;entries.append(npc)
    dynamic=copy.deepcopy(entry(57));dynamic.update(id=84,name='动态读取｜月之森衣装目录',comment='动态读取｜月之森衣装目录',constant=False,keys=['月之森','素世','Soyorin','买衣服','购买衣装','和裁舍'],insertion_order=180,content='''<% if(typeof runType==='string'&&runType==='generate'){ %>
<% var shopState=getvar('stat_data',{scope:'message',withMsg:{role:'any'},defaults:{},clone:true}); var shopCatalog='''+compact(shop)+'''; %>
[月之森衣装目录]
店铺位于R02宇庭老街·月之森和裁舍。先有实际到店与玩家购买选择，再追加衣装购买事件；当前穿着依玩家换装选择。
<% shopCatalog.products.forEach(function(p){var owned=p.outfits.every(function(o){return (shopState.衣橱?.已解锁||[]).some(function(x){return x.角色===o.actor&&x.衣装===o.id;});}); %>
商品<%-p.sku%>：<%-p.name%>，<%-p.price%>奉纳，<%-owned?'已收录':'可选购'%>。
<% }); %>
<% } %>''');entries.append(dynamic)
    card['character_version']=card['data']['character_version']=VERSION;card['data']['character_book']['description']=card['data']['character_book']['description'].replace('v1.48.4','v'+VERSION)
    card['data']['creator_notes']='【1.49.0 月之森衣装商店候选】面向新聊天；生活衣装以奉纳购买，专属纪念装依剧情收录。配套世界书与五段加载器随卡更新，真实酒馆验收待完成。\n\n'+card['data']['creator_notes']
    outputs={'config.json':dump(cfg),'shop-config.json':dump(shop),'field-spec.json':dump(fields),'card-source.json':dump(card),'wardrobe-panel.html':html}
    for id,text in [('mvu',mvu),('panels',panel),('scene',scene)]:
        text=once(text,"const version = '"+mods[id]['version']+"';","const version = '"+VERSION+"';");outputs[id+'.mjs']=text;mods[id].update(version=VERSION,path='mikage-shrine/releases/'+VERSION+'/'+id+'.mjs',sha256=sha(text))
    spec.update(release=VERSION,source_name=VERSION+'/card-source.json',source_sha256=sha(outputs['card-source.json']),worldbook_policy='New-chat shop acquisition split; actor/outfit IDs and art retained; no old-save migration')
    spec['ema_integration']['bound_worldbook']['version']=VERSION;spec['reviewed_copy']['preserved_worldbook_version']=VERSION
    spec['moonforest_shop']=dict(base='1.48.4',new_chat_only=True,config='mikage-shrine/releases/'+VERSION+'/shop-config.json',purchase_event='衣装购买',ownership_source='记录.事件',currency='神社.奉纳',price_source='wardrobeShop.products',outfit_mapping='unchanged',host_acceptance='pending')
    outputs['manifest.json']=dump(spec)
    return outputs
if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--dry-run',action='store_true');a=p.parse_args();outputs=build()
    if not a.dry_run:
        assert not any((OUT/k).exists() for k in outputs),'Use a new output directory';OUT.mkdir(exist_ok=True)
        for k,v in outputs.items():(OUT/k).write_text(v)
    print(dump(dict(dry_run=a.dry_run,outputs={k:dict(bytes=len(v.encode()),sha256=sha(v)) for k,v in outputs.items()})))
