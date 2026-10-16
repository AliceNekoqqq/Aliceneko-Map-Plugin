# 1.11.0 验收记录

## 本版内容

- 十张地图小游戏均加入可影响过程或结局的选择，可重玩且不使用倒计时。散策手帖为每个地区保留当前页面会话内最近一次完成记录；不新增 MVU 根状态、货币或好感奖励。
- 新增神社庭院、住宅庭院、溪流和海滨站台四张 1536×1024 场景插画，以及一张带透明通道的猫咪立绘。图片在打开小游戏后按需载入。
- 手机布局检查宽度为 375px；按钮触控区域不小于 44×44px，键盘操作会保留焦点，关闭小游戏后会清理计时器。系统启用减少动态效果时不播放过渡动画。
- 角色卡共 277,335 字节，包含三个各约 5.3KB 的固定版本加载器；不内嵌图片或字体 Base64。卡片中的性格、场景、开场白等角色资料与 1.9.0 原卡一致。

## 素材和来源

- 图片目录：`assets/activities/`。猫咪图保留透明背景；WebP 图片共约 1.33MB。
- 提示词和绘制记录：`assets/activities/imagegen-brief-v1.json`。
- Noto Serif SC 字体子集由 `tools/build_roam_font.py` 生成，覆盖漫游源码所需汉字；许可和来源记录放在 `assets/opening/roam-glyphs-OFL.txt`、`assets/opening/roam-glyphs-SOURCE.txt`。
- 插画固定于提交 `cec073c4ac5ef62ed0b6795cc7de5ab1f33dfa0c`；补充字库固定于提交 `61aca8a99e834190e107431ad212207147e5a012`。

## 验证

已通过：

- `python3 -m py_compile` 检查漫游、字库和角色卡构建脚本。
- `python3 tools/build_roam.py` 重建状态栏、场景和面板模块。
- `tests/activities.test.cjs`：十地通关、重玩分支、不同线索路线、猫咪相处、路线纠错、明信片上下文、萤火提示、太鼓自由演奏、回调只触发一次、计时器清理、字体加载、手机无横向溢出、键盘操作和触控尺寸。
- `tests/navigation.test.cjs`：479 条路线及 554 条密集采样边均通过。
- `tests/time-of-day.test.cjs`：四项时段与资源回退检查通过。
- `tests/wardrobe-browser.test.cjs`：375px 和 1280px 宽度均无溢出，衣装资源完整。
- `tests/wardrobe-quests.test.cjs`：七项衣装支线、存档和重复奖励检查通过。
- 角色卡构建检查通过：三个脚本、固定提交、无 Base64，原角色资料字段保持一致。

`tests/dev-sandbox.test.cjs` 需要环境变量 `MIKAGE_TEST_KEY`，本次未运行。真实酒馆环境下的脚本加载、消息时序和模型生成仍需实机验收。
