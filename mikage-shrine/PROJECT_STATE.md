# 御影神社项目状态

当前发布：1.12.0 独立散策小游戏版。小游戏通过第四个轻量酒馆助手入口加载，点击地图互动点后在独立全屏弹窗中游玩；状态栏不再承载小游戏的 CSS、脚本或素材。R04 纸舟样板增加三道水门的 Canvas 拖动关卡。

- 1.10.0 衣装、立绘与衣柜字体资源提交：`948d6c45abf43f8df982f29235457e99130e2b8c`。
- 1.11.0 场景插画提交：`cec073c4ac5ef62ed0b6795cc7de5ab1f33dfa0c`；地图补充字库提交：`61aca8a99e834190e107431ad212207147e5a012`；十地活动运行时代码提交：`bfe630a510fa490a40e81896b561cde29b20fc38`。
- 1.12.0 散策弹窗运行时代码提交：`7577d4fb0a3de50bdb2141c86e0645f6c387d18c`；含新增字库的代码与资源提交：`b6d0a11791e2b676d0107ee9412ae8fddd7f66ca`。卡片仅使用不可变提交 URL。
- `src/wardrobe-quests.json`定义四条固定支线；`src/wardrobe-config.json`为发布配置。
- `tools/register_wardrobe_art.py --asset-commit <完整提交>`更新共享外观图册与显示定位；`tools/build_roam.py`重建 scene/panels；`tools/build_minigames.py`从活动源码、样式和美术表构建独立小游戏模块。
- `tools/build_card.py`从原1.10.0卡及固定提交生成1.12.0卡；卡片保留角色资料，仅有四个约5KB远程加载器。检查证据与实机待验收项见 `QA-1.12.0.md`。
