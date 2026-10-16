# 御影神社项目状态

当前发布：1.11.0 十地互动升级版。十张地图小游戏均有选择变化，新增五张预绘插画并保留角色卡轻量分发。

- 衣装/字体资源提交：948d6c45abf43f8df982f29235457e99130e2b8c
- 场景插画提交：cec073c4ac5ef62ed0b6795cc7de5ab1f33dfa0c；补充字库提交：61aca8a99e834190e107431ad212207147e5a012。所有资源URL固定到完整不可变提交。
- `src/wardrobe-quests.json`定义四条固定支线；`src/wardrobe-config.json`为发布配置。
- `tools/register_wardrobe_art.py --asset-commit <完整提交>`更新共享外观图册与显示定位；`tools/build_roam.py`重建scene/panels。
- `tools/build_card.py`从原1.9.0卡与固定运行提交生成1.11.0卡；`wardrobe_worldbook.py`更新相关世界书和EJS，其他角色资料不变。卡片仅含三个远程加载入口。
- 检查证据与真实酒馆待验收项见QA-1.11.0.md。
