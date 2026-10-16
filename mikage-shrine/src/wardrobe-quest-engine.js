  const wardrobeQuests=ShrineConfig.wardrobeQuests||[];
  const wardrobeQuest=id=>wardrobeQuests.find(q=>q.id===id);
  function wardrobeQuestView(s,id){
    const q=wardrobeQuest(id);if(!q)return null;
    const done=s.记录.完成委托.some(x=>x.编号===id&&x.快照.性质==='普通');
    const row=s.绘马板.绘马.find(x=>x.编号===id&&x.状态!=='撤回');
    const paused=s.记录.暂停委托.some(x=>x.编号===id);
    const ready=s.主线.已完成.some(x=>x.编号===q.mainId)&&s.地图.开放地区.some(x=>x.编号===q.region)&&(!q.facility||s.神社[q.facility]===4);
    return {id:q.id,title:q.title,rewardId:q.rewardId,ready,done,status:done?'已完成':paused?'暂停':row?.状态||'未悬挂'};
  }
  function wardrobeQuestItem(s,id){
    const q=wardrobeQuest(id),view=wardrobeQuestView(s,id);
    assert(q&&view.ready,'衣装支线尚未开放');
    assert(!view.done&&view.status==='未悬挂','该衣装支线已在绘马板或已完成');
    const cfg=phase(s),occupied=s.绘马板.绘马.filter(x=>x.性质==='普通'&&['未接','进行','暂停'].includes(x.状态)).length;
    assert(occupied<cfg.boardCap,'绘马板已满，请先处理或暂不接一枚绘马');
    return {...clone(ShrineTemplates['绘马板.绘马']),编号:q.id,标题:q.title,祈愿人:q.person,来客类型:'人类',类型:q.type,地区:q.region,心愿:q.wish,
      补充说明:'衣装支线。'+q.condition+'。'+q.finish+' 结案回礼：'+q.outfits.filter(o=>!o.variantOf).map(o=>o.name).join('、')+'。',
      材料档:cfg.level,性质:'普通',状态:'未接',奖励:clone(cfg.reward),
      幕后:{矛盾:q.wish,线索一:q.clues[0],线索二:q.clues[1],路径一:q.paths[0],路径二:q.paths[1],收束条件:q.finish}};
  }
  function completedRewardIds(s){
    return new Set([...s.主线.已完成.map(x=>x.编号),...s.记录.完成委托.filter(x=>wardrobeQuest(x.编号)&&x.快照.性质==='普通').map(x=>x.编号)]);
  }
