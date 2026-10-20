# 1.48.3 地点与回忆册接轨候选

本轮仅处理审查中两项已确认断层，不重写审定稿、人设或祭典规则，不新增建设、奖励、材料、MVU字段和自动发送。原画/像素、31衣装、绘马1.48.1原稿与现有美术不变。

## 修复合同与门

地图模块：Local Fix / Local Fix Only。现役R05多满沼与R07龙宫城承载旧站前/林道任务；WQ01/03/05新候选改投R03妖怪横丁，WQ02/07改投R06鞍马山，WQ06/08仍在R09但标明出云大社祭礼处。仅同步配置中的地点名及世界书57同份目录。章结案门槛、奖励、成本与领域代码逐字节不变；已接/暂停/已完成的旧快照不改，不传送。旧未接候选可撤下重挂使用新地点。

回忆册模块：Local Fix / Staged Refactor，仅提取旧showMemoryBook并接到共用弹窗入口，每阶段逻辑预算200行以内，保留十个游戏模型和渲染器字节。旧版19项目录中正常新版路径仅能收录10种，完整旧册入口被十个提前return绕过。新版共用入口恢复收藏卡、短篇、导入、导出、复制；显示10个可得条目并保留已拥有旧藏，不用无法再获得的空格阻塞完成。末篇11件门槛调整为10件；旧存储键和schema1不变。所有短篇及收藏叙事保留。仅功能提示与计数变化。活动正在运行时禁用共用回忆册按钮；玩家暂停后可读，关闭不自动恢复；退出统一清理观察器。拒绝剪贴板时保留可选择的摘要文本。导入异步读文件后再次检查页面仍有效。

授权：作者在批判审查后要求“继续”，沿用交付/Git授权及审定稿保护。禁止范围：暂停的1.39.1 src、历史发布、规则/初始变量/人物示例/绘马原稿/美术字节/自动消息发送。回滚：使用1.48.2固定提交候选。基线 reviewed-copy 与startup 1.48.2通过；新路由回归用1.48.2运行失败R05!=R03，修复版通过。

## 维护与构建

入口releases/1.48.3/manifest.json，仅mvu与minigames派生，其余复用1.48.2 manifest固定路径。tools/repair_integrations.py校验基线哈希，支持--dry-run，默认拒绝覆盖；从现役快照生成版本输出，不读取暂停开发src。

```sh
python mikage-shrine/tools/repair_integrations.py --font-commit a19084cedf3b555f3d88d2e95f391b4c48e86c27 --dry-run
node mikage-shrine/tests/integration-repair.test.cjs
node mikage-shrine/tests/memory-book-browser.test.cjs
node mikage-shrine/tests/startup-integration.test.cjs 1.48.3
python mikage-shrine/tools/build_release_card.py --source mikage-shrine/releases/1.48.3/card-source.json --manifest mikage-shrine/releases/1.48.3/manifest.json --commit <SOURCE_COMMIT> --output <NEW_JSON> --dry-run
```

实际验证结果与成卡身份见DELIVERY.json。真实SillyTavern、Android与模型生成待验。人物示例偏差、祭典提示冲突、建设自由扩展和实际提示预算仍为后续项；本轮没有借修接线改写审定文学稿。

TW路由sillytavern-card-pipeline及sillytavern-embedded-ui，snapshot2026-08-18；A0、A2/D1/D4、C1/D7相关段及plugin-runtime/communication/frontend-design-quality已读。复用已采用的纸木回忆册设计，无新视觉方向；宿主为Codex云端，终端Node/Python、Git连接、Chromium本地测试可用，真实宿主不可据此推定。

恢复回忆册时发现字体遗漏与数字/按钮强制系统字体导致Linux测试环境缺字，新增同一Noto Serif SC 500字形子集并只对回忆册覆盖字体；固定素材提交a19084cedf3b555f3d88d2e95f391b4c48e86c27。字体来源/OFL/哈希见assets/ui/memory-book-v1483-font.json，重建用tools/build_memory_font.py。

全工作树范围检查实际执行后因历史本地Git仍停留1.39时代、186个既有/发布派生文件及二进制产生预算警告，未宣称整体通过；本轮发布采用显式文件白名单，领域代码与玩法模型逐字节不变。暂停src和其他本地改动不会进入提交。
