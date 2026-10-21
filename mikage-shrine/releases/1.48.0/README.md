# 1.48.0 双画风建设候选

默认沿用现有神社原画，画面下方按钮切到像素模式。共用现有五项设施修缮状态，完工=4；切换只改变视图，不影响任务、材料、环境时间或聊天变量。切换后人物回到所选场地入口。只在R01神社提供画风切换，其他九地区沿用原画。

原画底图及三时段、原始走路范围均保留。完工后独立叠加鸟居注连绳、参道两盏石灯、社务所御守陈列架、拜殿奉纳幡、庭院花坛。像素模式使用同一状态派生基础/完成建筑及附属物，人物与部件按脚点排序，使用不同的安全行走范围及热点。原生活物件保留id、zone、slot、lit，像素模式使用对应世界锚点，不迁移存档。

维护入口：tools/build_shrine_additions.py --asset-commit <固定40位提交> [--dry-run]。发布清单沿用1.47的panels及原MVU/小游戏/巴卫模块，只替换scene。成卡仍用tools/build_release_card.py --source releases/1.48.0/card-source.json --manifest releases/1.48.0/manifest.json --commit <固定源码提交> --output <新JSON>。不覆盖旧卡。

验证：tests/dual-shrine-browser.test.cjs加载实际维护HTML和真实领域初始状态/生活配置，检查320/375/760宽度的默认原画、逐项完工部件独立、两模式共享状态与生活陈设、无资源写入、原导航还原、像素路线可达/障碍、时段切换、R02往返、跨楼层/空快照/释放、焦点与减少动态。experiments/modular-shrine/test.mjs验证3125组合及15625独立变化。startup-integration.test.cjs 1.48.0验证实际5模块、三开场、状态栏、四面板和保存数据。离线模拟不代表真实宿主验收。

模块素材失败会保留原画底图并提供重试；像素素材失败会给出提示，可切回原画。无真实SillyTavern/Android验收声明。像素显示不是自由拖放或无限扩建，现有五项完工后到顶仍需后续独立扩建领域解决。

新增绘画素材为内置image_gen生成，参考本项目r01-day.webp的画风与透视，生成透明独立饰件，而非改写底图；完整美术规格见art-prompt.txt。Pillow仅用于WebP格式压缩，alpha保留。像素素材沿用独立小样图集。未使用已否定的废墟/施工场景。
