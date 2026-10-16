# 御影神社项目状态

当前版本：1.15.0 昭和旧物回忆版。十地互动记录不同旧物；收集3、7、11件依次解锁三段回忆短篇，R03团子小店另有可选玻璃弹珠挑战。旧物册保存在浏览器本地，可导出/导入与主动复制摘要；不增加MVU根状态、资源、好感或模型调用。仍由第四个轻量入口加载独立弹窗。

- 1.10.0 衣装、立绘与衣柜字体资源提交：`948d6c45abf43f8df982f29235457e99130e2b8c`。
- 1.11.0 场景插画提交：`cec073c4ac5ef62ed0b6795cc7de5ab1f33dfa0c`；地图补充字库提交：`61aca8a99e834190e107431ad212207147e5a012`；十地活动运行时代码提交：`bfe630a510fa490a40e81896b561cde29b20fc38`。
- 1.12.0 散策弹窗运行时代码提交：`7577d4fb0a3de50bdb2141c86e0645f6c387d18c`；含新增字库的代码与资源提交：`b6d0a11791e2b676d0107ee9412ae8fddd7f66ca`。卡片仅使用不可变提交 URL。
- `src/wardrobe-quests.json`定义四条固定支线；`src/wardrobe-config.json`为发布配置。
- `tools/register_wardrobe_art.py --asset-commit <完整提交>`更新共享外观图册与显示定位；`tools/build_roam.py`重建 scene/panels；`tools/build_minigames.py`从活动源码、样式和美术表构建独立小游戏模块。
- `tools/build_card.py`从原1.10.0卡及固定提交生成当前发布卡；卡片保留角色资料，仅有四个约5KB远程加载器。检查证据与实机待验收项见 `QA-1.12.0.md`。
- `assets/activities/`新增六张第二批专属场景插画；对应玩法与CSS在`src/activities.js`、`src/activities.css`，构建产物为`runtime/minigames.mjs`。测试及当前SillyTavern实机验收状态见`QA-1.13.0.md`。
- 1.13.0六张活动插画固定于素材提交`f616ec7a3587810407df23f4e8e685786306e8f7`，互动代码提交`1e925c3e56a8b303d0e0134ad2cb5ead65654a06`。角色卡约295KB，四个加载器各约5.3KB；真实SillyTavern导入待验收。

- 1.14.0 双人散策新增活动补充字库固定于素材提交 `1fc823c65cd9cd6093d9a3eb94b2b99f55e91ecc`；三个新流程及独立弹窗已在真实 Chromium 通过测试。角色卡296,186字节，四个加载器尺寸与1.13相同。验收记录见 `QA-1.14.0.md`。

- 1.14.0 互动代码固定提交：`11322ee60e1f88df7a17207f9e83d3e71244c890`。发布卡：`cards/巴卫_御影神社_街区漫游_v1.14.0_双人散策版.json`。

- 1.15.0 运行时代码固定提交：3949835dee62591cdb8ff98477efb786083051fa。发布卡：cards/巴卫_御影神社_街区漫游_v1.15.0_昭和旧物回忆版.json；QA记录见 QA-1.15.0.md。
