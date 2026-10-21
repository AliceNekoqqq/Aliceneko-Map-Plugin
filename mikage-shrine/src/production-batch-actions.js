  // Each explicit batch is one atomic life action on a cloned inventory.
  function craftBatch(state, payload) {
    if (state.进度.阶段 < 2 || state.地图.当前地区 !== 'R01') fail('第二章起请在神社制作');
    const quantity = payload.quantity === undefined ? 1 : payload.quantity;
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 20) fail('制作批数须为1至20');
    const recipe = config.recipes.find(x => x.id === payload.recipe && x.stage <= state.进度.阶段);
    if (!recipe) fail('配方不存在或尚未开放');
    for (const [id, amount] of Object.entries(recipe.inputs)) {
      if (inventoryCount(state.生活, id) < amount * quantity) fail(`${itemName(id)}不足`);
    }
    const next = clone(state.生活);
    for (const [id, amount] of Object.entries(recipe.inputs)) next.库存[id] -= amount * quantity;
    for (const [id, amount] of Object.entries(recipe.output)) next.库存[id] = inventoryCount(next, id) + amount * quantity;
    return {life: next, spend: {}, event: {摘要: `完成制作：${recipe.name}×${quantity}批`, 对象: recipe.id, 来源: '生活配方', 方式: JSON.stringify({kind: 'craft', recipe: recipe.id, quantity})}};
  }
  function harvestBatch(state, payload) {
    if (state.进度.阶段 < 2 || state.地图.当前地区 !== 'R01') fail('第二章起请在神社小菜圃收获');
    const ids = payload.plots === undefined ? [payload.plot] : payload.plots;
    if (!Array.isArray(ids) || ids.length < 1 || ids.length > config.plots.length || new Set(ids).size !== ids.length) fail('请选择已登记且各不重复的菜圃');
    const selected = ids.map(id => {
      const allowed = config.plots.find(x => x.id === id && x.stage <= state.进度.阶段);
      const plot = state.生活.菜圃.find(x => x.id === id), crop = cropById(plot?.crop);
      if (!allowed || !plot || !crop) fail('该菜圃没有可收获的作物');
      if (state.环境.天数 < plot.plantedDay + crop.days) fail('作物尚未成熟');
      return {id, crop};
    });
    const next = clone(state.生活);
    for (const {id, crop} of selected) {
      for (const [item, amount] of Object.entries(crop.yield)) next.库存[item] = inventoryCount(next, item) + amount;
      Object.assign(next.菜圃.find(x => x.id === id), {crop: '', plantedDay: 0});
    }
    return {life: next, spend: {}, event: {摘要: `收获${selected.length}块成熟菜圃`, 对象: ids.length === 1 ? ids[0] : 'garden', 来源: '菜圃收获', 方式: JSON.stringify({kind: 'harvest', plots: ids})}};
  }
