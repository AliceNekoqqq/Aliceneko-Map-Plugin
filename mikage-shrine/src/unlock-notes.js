const UNLOCK_GROUPS = {
  region: ['地区开放', 'map', '看地图'],
  outfit: ['衣橱新收', 'wardrobe', '看衣橱'],
  feature: ['生活功能', 'life', '看生活'],
  recipe: ['新配方', 'life', '看生活'],
  quest: ['衣装支线', 'wardrobe', '看衣橱'],
  main: ['主线绘马', 'board', '看绘马'],
};
const LIFE_FEATURE_NAMES = {
  decorate: '布置', craft: '手作', grow: '小菜圃', cook: '料理', shop: '生活商店',
  travel: '出行手帐', photos: '记录风景', yokaiGuests: '妖怪来客', festival: '祭典筹备',
};

function unlockSnapshot(state, engine) {
  const config = engine?.config;
  if (!config || !config.stages.some(stage => stage.level === state?.进度?.阶段) ||
      !Array.isArray(state.地图?.开放地区)) return null;

  const groups = {region: new Map(), outfit: null, feature: null, recipe: null, quest: null, main: null};
  const regions = new Set(state.地图.开放地区.map(row => row?.编号));
  for (const {id, name} of config.regions) if (regions.has(id)) groups.region.set(id, name);

  if (Array.isArray(state.衣橱?.已解锁)) {
    const outfits = new Map();
    const owned = new Set(state.衣橱.已解锁.map(row => `${row?.角色}:${row?.衣装}`));
    for (const {outfits: catalog} of [...config.wardrobeRewards, ...config.wardrobeShop.products]) {
      for (const {actor, id, name} of catalog) {
        const key = `${actor}:${id}`;
        if (owned.has(key)) outfits.set(key, `${name}（${actor === 'tomoe' ? '巴卫' : '玩家'}）`);
      }
    }
    groups.outfit = outfits;
  }

  if (state.生活) try {
    const life = engine.life.view(state);
    groups.feature = new Map(Object.entries(LIFE_FEATURE_NAMES).filter(([id]) => life.unlocked.features[id] === true));
    groups.recipe = new Map(life.recipes.map(({id, name}) => [id, name]));
  } catch { /* A legacy snapshot can lack the fields required by the life view. */ }

  if (Array.isArray(state.主线?.已显现)) {
    const revealed = new Set(state.主线.已显现.map(row => row?.编号));
    groups.main = new Map(config.stages.filter(({mainId}) => revealed.has(mainId))
      .map(({mainId, level}) => [mainId, config.mainTitles[level - 1]]));
  }
  if (state.主线 && state.记录 && state.绘马板 && state.神社) try {
    groups.quest = new Map(config.wardrobeQuests.filter(({id}) => engine.wardrobeQuestView(state, id)?.ready)
      .map(({id, title}) => [id, title]));
  } catch { /* Wait for migration before comparing legacy quest records. */ }
  return groups;
}

function newUnlocks(before, after) {
  if (!before || !after) return [];
  return Object.entries(UNLOCK_GROUPS).flatMap(([kind, [label, panel, action]]) => {
    const previous = before[kind], current = after[kind];
    if (!previous || !current) return [];
    const names = [...current].filter(([id]) => !previous.has(id)).map(([, name]) => name);
    return names.length ? [{kind, label, panel, action, names}] : [];
  });
}
