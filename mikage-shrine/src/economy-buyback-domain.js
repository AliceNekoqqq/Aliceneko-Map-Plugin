  function buybackUsed(state) {
    return state.记录.资源流水.filter(x => x.资源 === '奉纳' && x.来源 === '妖怪横丁收购' && x.变动 > 0 && x.天数 === state.环境.天数).reduce((n,x) => n+x.变动,0);
  }
  function buybackView(state) {
    const used=buybackUsed(state),remaining=Math.max(0,config.buyback.perDay-used);
    return {limit:config.buyback.perDay,used,remaining,atShop:state.地图.当前地区==='R03'&&state.进度.阶段>=2,products:config.buyback.products.filter(x=>x.stage<=state.进度.阶段).map(row=>({...clone(row),count:inventoryCount(state.生活,row.item),canSell:state.地图.当前地区==='R03' && inventoryCount(state.生活,row.item)>=row.units && remaining>=row.price}))};
  }
  function sell(state,payload,eventId) {
    if(state.进度.阶段<2 || state.地图.当前地区!=='R03')fail('请先抵达第二章开放的妖怪横丁收购摊');
    if(!Number.isInteger(payload.quantity)||payload.quantity<1||payload.quantity>20)fail('收购批数须为1至20');
    const row=config.buyback.products.find(x=>x.item===payload.item && x.stage<=state.进度.阶段);
    if(!row)fail('请从横丁收购目录选择物品');
    const amount=row.price*payload.quantity,units=row.units*payload.quantity;
    if(inventoryCount(state.生活,row.item)<units)fail('收购所需库存不足');
    if(buybackUsed(state)+amount>config.buyback.perDay)fail('今日横丁收购额度不足');
    const next=clone(state.生活);next.库存[row.item]-=units;
    return {life:next,spend:{},earn:{奉纳:amount},event:{摘要:`向横丁收购摊交出${itemName(row.item)}×${units}，收到${amount}奉纳`,对象:row.item,来源:'妖怪横丁收购',方式:JSON.stringify({kind:'sell',item:row.item,quantity:payload.quantity})}};
  }
