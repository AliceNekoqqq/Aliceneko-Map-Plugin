 function batchSelect(body,id,max,describe,label){
  const caption=make('label','life-note',label);caption.htmlFor=id;
  const choices=max>0?Array.from({length:Math.min(20,max)},(_,i)=>[String(i+1),describe(i+1)]):[['0','当前暂无可用批次']];
  const input=select(id,choices);input.disabled=max<1;body.append(caption,input);return input;
 }
 function craftCard(r){
  const output=Object.keys(r.output||{})[0],{e,body}=card(r.name,'每批需要：'+inventoryText(r.inputs)+' · 制成：'+inventoryText(r.output),output);
  const locked=Number(r.stage)>Number(view.unlocked.stage),max=locked||!r.canMake?0:Math.min(20,...Object.entries(r.inputs).map(([id,n])=>Math.floor((view.items.find(x=>x.id===id)?.count||0)/n)));
  batchSelect(body,'life-craft-quantity-'+r.id,max,q=>q+' 批 · 制成：'+inventoryText(Object.fromEntries(Object.entries(r.output).map(([id,n])=>[id,n*q]))),'制作批数');
  body.append(button(locked?'第'+r.stage+'章开放':'制作所选批次','lifeCraft',r.id,max<1));return e;
 }
 function sellCard(row,trade){
  const {e,body}=card(name(row.item),'库存 '+row.count+' · 每批 '+row.units+' 份 · 可得 '+row.price+' 奉纳',row.item);
  const max=trade.atShop?Math.min(20,Math.floor(row.count/row.units),Math.floor(trade.remaining/row.price)):0;
  batchSelect(body,'life-sell-quantity-'+row.item,max,q=>q+' 批 · 交出 '+(q*row.units)+' 份 · 获得 '+(q*row.price)+' 奉纳','交付批数');
  body.append(button('交付所选批次','lifeSell',row.item,max<1));
  if(max<1)body.append(make('p','',!trade.atShop?'请先抵达妖怪横丁收购摊。':row.count<row.units?'备齐这一批后再来。':'今日收购余款不足，可以留到下次。'));
  return e;
 }
