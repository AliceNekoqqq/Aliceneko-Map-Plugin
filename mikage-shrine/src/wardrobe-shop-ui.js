    const shop=currentState().衣装商店;
    const selectedProduct=shop?.products?.find(p=>p.outfits.some(o=>o.actor===wardrobeActor&&o.id===preview));
    if(selectedProduct){
      const owner=selectedProduct.owned;
      const shopNote=make('p','moonforest-note',shop.name+' · 素世\n奉纳 '+shop.balance+' · 可用 '+shop.spendable+(shop.reserve?' · 修缮预留 '+shop.reserve:''));
      questBox.append(shopNote);
      const price=make('span','moonforest-price',owner?'已购收录':selectedProduct.price+' 奉纳');questBox.append(price);
      if(!owner){
        const buy=make('button','secondary-button moonforest-buy',shop.atShop?'确认购买 · '+selectedProduct.price+' 奉纳':'到月之森看衣 · 写入聊天');
        buy.type='button';buy.dataset.shopSku=selectedProduct.sku;buy.disabled=!!outfitApplyPending||(shop.atShop&&!selectedProduct.affordable);
        buy.addEventListener('click',async()=>{
          if(outfitApplyPending)return;
          if(!shop.atShop){await invokeAction('shopDraft',{sku:selectedProduct.sku},'已写入聊天，请按意愿继续行程。',buy);return;}
          const panel=make('div','moonforest-confirm');panel.setAttribute('role','group');panel.setAttribute('aria-label','确认本次衣装购买');
          panel.append(make('p','',selectedProduct.name+' · '+selectedProduct.price+' 奉纳。素世包装后收录衣柜，当前穿着保留。'));
          const yes=make('button','secondary-button','买下并打包'),cancel=make('button','secondary-button','再看看');yes.type=cancel.type='button';
          cancel.addEventListener('click',()=>{panel.remove();buy.disabled=false;buy.focus();});
          yes.addEventListener('click',async()=>{if(outfitApplyPending)return;outfitApplyPending={sku:selectedProduct.sku};renderWardrobe();
            await invokeAction('buyOutfit',{sku:selectedProduct.sku},'素世已包装衣物，衣柜已收录；当前穿着保留。');outfitApplyPending=null;renderWardrobe();});
          panel.append(yes,cancel);questBox.append(panel);buy.disabled=true;yes.focus();
        });questBox.append(buy);
        if(shop.atShop&&!selectedProduct.affordable)questBox.append(make('p','moonforest-note','可用奉纳尚差 '+Math.max(0,selectedProduct.price-shop.spendable)+'，可以先看衣样。'));
      }
    }
