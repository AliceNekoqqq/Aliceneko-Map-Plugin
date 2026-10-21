  const trade=view.buyback;
  if(trade){
   note('横丁收购 · 今日还可收 '+trade.remaining+' 奉纳的货（上限 '+trade.limit+'）。');
   const trades=make('div','life-grid');
   for(const row of trade.products){
    const {e,body}=card(name(row.item),'库存 '+row.count+' · 每批 '+row.units+' 份 · 可得 '+row.price+' 奉纳',row.item);
    body.append(button('交出 '+row.units+' 份 · 获得 '+row.price+' 奉纳','lifeSell',row.item,!row.canSell));
    if(!row.canSell)body.append(make('p','',!trade.atShop?'请先抵达妖怪横丁收购摊。':row.count<row.units?'备齐这一批后再来。':'今日收购余款不足，可以留到下次。'));
    trades.append(e);
   }
   $('#life-content').append(trades);
  }
