  // Purchase history is the existing append-only event ledger; ownership is derived.
  const shopConfig=ShrineConfig.wardrobeShop;
  const shopProduct=id=>shopConfig.products.find(x=>x.sku===id);
  function shopOwned(s,product){
    return product.outfits.every(o=>baseline[o.actor].includes(o.id)||s.衣橱.已解锁.some(x=>x.角色===o.actor&&x.衣装===o.id));
  }
  function shopView(s){
    const stage=phase(s),reserve=s.神社[stage.facility]<2?(stage.cost.奉纳||0):0;
    const balance=s.神社.奉纳,spendable=Math.max(0,balance-reserve);
    const atShop=s.地图.当前地区===shopConfig.region&&String(s.环境.地点).includes(shopConfig.name);
    return {name:shopConfig.name,npc:shopConfig.npc,region:shopConfig.region,atShop,balance,reserve,spendable,
      products:shopConfig.products.map(p=>({...clone(p),owned:shopOwned(s,p),affordable:spendable>=p.price}))};
  }
  function purchaseProduct(event){
    const product=shopProduct(event.对象);
    assert(product,'衣装商品编号须来自月之森目录');
    let data;try{data=JSON.parse(event.方式);}catch{throw Error('衣装购买方式须为商品JSON');}
    assert(data&&Object.keys(data).length===1&&data.sku===product.sku,'购买数据只包含目录sku');
    assert(event.来源===shopConfig.name,'购买来源须为月之森和裁舍');
    return product;
  }
  function applyPurchase(s,p,event){
    const product=purchaseProduct(event),view=shopView(p);
    assert(event.编号==='E'+(p.记录.事件.length+1),'衣装购买事件编号须连续');
    assert(view.atShop,'请先在正文抵达宇庭老街的月之森和裁舍');
    assert(!shopOwned(p,product),'这套衣装已收录，余额保持原值');
    assert(view.spendable>=product.price,'可用奉纳不足，修缮预留款保持原值');
    assert(s.玩家.衣装===p.玩家.衣装&&s.巴卫.服装===p.巴卫.服装,'购买只收录衣物，换装另由玩家选择');
    s.神社.奉纳-=product.price;
    s.记录.资源流水.push({编号:event.编号+'-奉纳',事件编号:event.编号,资源:'奉纳',变动:-product.price,
      来源:shopConfig.name,方式:'衣装购买:'+product.sku,天数:s.环境.天数});
  }
