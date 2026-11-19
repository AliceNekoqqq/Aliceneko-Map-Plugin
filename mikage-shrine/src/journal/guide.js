const JOURNAL_GUIDES = {
  map: ['走一趟新地方', '点地图区块或下方地名，先看地点详情。', '想动身时，再点「提出前往意图」。实际抵达会在后续对话中确认。'],
  wardrobe: ['在衣橱看新衣', '上方可以切换你和巴卫的衣橱。', '从新笺过来会先展示指定衣装。再点衣装图册里的已收录条目，才会更换。'],
  quest: ['从衣装找到支线', '在这套衣服的详情里点「悬挂衣装支线」。', '支线挂到绘马板后，打开那枚绘马，再决定是否接取。'],
  board: ['怎么接一枚绘马', '点木牌展开来客的心愿，先查看地点和诉求。', '确定接取后，回到对话里走访或商量。结案会按实际完成情况记录。'],
  guests: ['看看妖怪来客的心愿', '到绘马板展开木牌，留意来客类型和所在地区。', '有合适的心愿再接取，也可以在板上等待新的来信。'],
  home: ['在神社住下来', '用上方的生活页签找到布置、手作、菜圃和出行记录。', '主要功能会随进度开放，解锁时可从「神社新笺」直接过去。'],
  quiet: ['在廊下歇一会儿', '挑一个此刻可以聊的话头，或只查看场景。', '话头写入聊天输入框后，可以先修改，再由你决定是否发送。'],
  strange: ['追查一段街区异样', '先在当前地区看看有哪些小插曲。', '选择开始或继续后，去聊天里细看线索。想停时可以先把这段事放下。'],
  decor: ['给物件找个位置', '从已有物件中选一件，再选择区域和摆放位置。', '确认后，布置会留在场景里。已摆好的物件可以收回。'],
  craft: ['做一件手作，或备一份料理', '先看配方材料和可做批数。备齐所需材料后，在御影神社制作。', '做好的食物可在本页摆上茶桌。到出行功能开放后，也可以带在身边。'],
  garden: ['从种子到收成', '在空畦选种子，再确认播种。', '等剧情推进到成熟日，回到小菜圃收取成熟作物。'],
  shop: ['去横丁买卖', '从地图前往妖怪横丁，等对话确认抵达后再来交易。', '买东西用可支配奉纳。收购有每日额度，先看库存和本次能交几批。'],
  album: ['把路上的风景记下来', '在地图提出行程，等对话确认抵达。', '回到出行手帐点「记下当前风景」，可以在同一页回看。'],
  festival: ['筹备神社祭典', '先选主题和屋台，保存筹备方案。', '邀请、开场和收场在对话里确认。这里可以查看已经记录的筹备与进展。'],
};

function createJournalGuide(doc) {
  const key = 'mikage:journal-guide:1';
  const seen = new Set();
  try {
    const saved = JSON.parse(doc.defaultView.localStorage.getItem(key) || '[]');
    if (Array.isArray(saved)) for (const id of saved) if (Object.hasOwn(JOURNAL_GUIDES,id)) seen.add(id);
  } catch { /* Guides are still usable without local storage. */ }
  const element = doc.createElement('details');
  element.className = 'journal-guide';
  const summary = doc.createElement('summary');
  const steps = doc.createElement('ol');
  const actions = doc.createElement('div');
  actions.className = 'journal-guide-actions';
  const close = doc.createElement('button');
  const locate = doc.createElement('button');
  close.type = 'button';
  locate.type = 'button';
  close.textContent = '收起说明';
  locate.textContent = '查看已定位条目';
  locate.hidden = true;
  let linked = null;
  close.addEventListener('click',()=>{element.open=false;summary.focus({preventScroll:true});});
  locate.addEventListener('click',()=>{
    if(!linked?.isConnected)return;
    element.open=false;
    linked.tabIndex=-1;
    linked.focus({preventScroll:true});
    linked.scrollIntoView?.({block:'nearest',behavior:'auto'});
  });
  actions.append(locate,close);
  element.append(summary,steps,actions);
  let topic = '';
  return {
    show(parent,id){
      const entry = Object.hasOwn(JOURNAL_GUIDES,id) && JOURNAL_GUIDES[id];
      if (!parent || !entry) {this.hide();return;}
      if (linked && (!linked.isConnected || topic!==id)) this.point(null);
      if (topic !== id) {
        topic = id;
        summary.textContent = '玩法说明 · ' + entry[0];
        steps.replaceChildren(...entry.slice(1).map(text => {
          const item = doc.createElement('li');item.textContent = text;return item;
        }));
        element.open = !seen.has(id);
        seen.add(id);
        try {doc.defaultView.localStorage.setItem(key,JSON.stringify([...seen]));}catch {}
      }
      if(element.parentElement!==parent)parent.prepend(element);
    },
    point(target){
      linked=target;
      locate.hidden=!target;
      return element.isConnected && element.open && !!target;
    },
    hide(){this.point(null);element.remove();topic='';},
  };
}
