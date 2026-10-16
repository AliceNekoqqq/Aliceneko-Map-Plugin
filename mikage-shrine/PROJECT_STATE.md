# 御影神社项目状态

当前发布：1.10.0 樱坂衣装版。新增五套衣装与DK人间伪装，十地三时景保留。

- 衣装/字体资源提交：948d6c45abf43f8df982f29235457e99130e2b8c
- 现有素材提交与三时景资源提交保留，新素材同样固定完整提交。
- `src/wardrobe-quests.json`定义四条固定支线；`src/wardrobe-config.json`为发布配置。
- `tools/register_wardrobe_art.py --asset-commit <完整提交>`更新共享外观图册与显示定位；`tools/build_roam.py`重建scene/panels。
- `tools/build_card.py`从原1.9.0卡与固定运行提交生成1.10.0卡；`wardrobe_worldbook.py`更新相关世界书和EJS，其他角色资料不变。
- 检查证据与真实酒馆待验收项见QA-1.10.0.md。
