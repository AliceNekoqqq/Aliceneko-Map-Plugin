# 御影神社项目状态

当前版本：1.13.0 第二批小游戏体验升级。小游戏通过第四个轻量酒馆助手入口加载，点击地图互动点后在独立全屏弹窗中游玩；状态栏不承载小游戏的 CSS、脚本或素材。R03、R05、R07、R08、R09、R10各新增专属场景图与多阶段互动；叶拓、太鼓以Canvas呈现核心操作。

- 1.10.0 衣装、立绘与衣柜字体资源提交：`948d6c45abf43f8df982f29235457e99130e2b8c`。
- 1.11.0 场景插画提交：`cec073c4ac5ef62ed0b6795cc7de5ab1f33dfa0c`；地图补充字库提交：`61aca8a99e834190e107431ad212207147e5a012`；十地活动运行时代码提交：`bfe630a510fa490a40e81896b561cde29b20fc38`。
- 1.12.0 散策弹窗运行时代码提交：`7577d4fb0a3de50bdb2141c86e0645f6c387d18c`；含新增字库的代码与资源提交：`b6d0a11791e2b676d0107ee9412ae8fddd7f66ca`。卡片仅使用不可变提交 URL。
- `src/wardrobe-quests.json`定义四条固定支线；`src/wardrobe-config.json`为发布配置。
- `tools/register_wardrobe_art.py --asset-commit <完整提交>`更新共享外观图册与显示定位；`tools/build_roam.py`重建 scene/panels；`tools/build_minigames.py`从活动源码、样式和美术表构建独立小游戏模块。
- `tools/build_card.py`从原1.10.0卡及固定提交生成1.12.0卡；卡片保留角色资料，仅有四个约5KB远程加载器。检查证据与实机待验收项见 `QA-1.12.0.md`。
- `assets/activities/`新增六张第二批专属场景插画；对应玩法与CSS在`src/activities.js`、`src/activities.css`，构建产物为`runtime/minigames.mjs`。测试及当前SillyTavern实机验收状态见`QA-1.13.0.md`。
- 1.13.0六张活动插画固定于素材提交`973b2148fa78fd053a667fd58c74f3e141e085b9`，互动代码提交`05f83324ba9af0060ccbf3d23b803d8291e3e727`。角色卡约295KB，四个加载器各约5.3KB；真实SillyTavern导入待验收。
