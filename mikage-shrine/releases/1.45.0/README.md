## 1.45.0 绘马结缘所候选交付（2026-10-20）

承接已交付1.44地图，增加实绘绘马亭、普通/主线木牌、翻面/拨动、狐铃/樱枝，以及接取/暂停/继续/刷新反馈。保留翻面阅读状态，操作去重、失败可重试；玩具不写正式变量。素材commit 4b2b31cb3efe94fa0853b903ee8dfa9e5458ddf5，发布模块为releases/1.45.0/panels.mjs。

当前交付边界为候选JSON，衣柜新交互尚未制作。37世界书、正则、初始变量、原剧情规则与1.44一致；不混入暂停1.39.1全局游玩修复。浏览器320/375/1000绘马测试与整卡3开场/4面板模拟启动通过；真实酒馆、Android与作者审美待验收。

打包适配器：tools/build_ema_desk.py --asset-commit <40位提交> [--dry-run] 从1.44清单指定模块派生1.45维护输出；tools/build_release_card.py --source releases/1.45.0/card-source.json --manifest releases/1.45.0/manifest.json --commit <源码提交> --output <新JSON路径> [--dry-run] 校验模块哈希并写5个固定提交轻量加载器，拒绝覆盖旧成卡。无PNG交付。依赖与宿主沿用原版酒馆助手/MVU路径。

TW路由：sillytavern-card-pipeline；snapshot 2026-08-18；已读ST-A0/A2/D1/D4及plugin-runtime、tool-adapter-contract、release-gate；无新增设计候选。验收只标候选，未授予driver-accepted。

