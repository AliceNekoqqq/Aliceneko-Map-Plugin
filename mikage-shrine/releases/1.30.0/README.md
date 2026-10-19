# 1.30.0 八套重绘接入候选

八套已完成图像原样接入：幼狐巴卫、神乐狩衣、学园祭执事、黑纹付婚礼装、神乐千早、白无垢、体操服、平安旅装。共8张透明立绘、8张四列三行图集（前/右/后/左；站立/迈步一/迈步二）。图片固定提交35ae06bdc5375befe92c25503f165a3579941217。保持其余23套目录、稳定服装ID、解锁、MVU、世界书、文案、存档与1.29.3开场修复。

仅scene模块更新至1.30.0；另外四模块沿用manifest的已验证固定文件与实际版本。五段轻量加载器内嵌；界面与图像从Git/CDN加载。酒馆助手/MVU/EJS宿主要求沿用既有版本，无新增玩家安装项。开发测试依赖不打进卡。

项目构建适配器：tools/register_restyle.py --asset-commit <完整提交>只修改src/scene-host.mjs和本版scene.mjs目录映射，不改像素；tools/build_release_card.py按--source/--manifest/--commit/--output生成卡，支持--dry-run且拒绝覆盖。清单模块SHA256必须匹配源文件；旧版保留。无独立profile/plan/contract引擎，本次使用manifest、维护源与现有回归断言，不虚构配置。

通过：PNG透明度/尺寸/96格主体边界检查；31套非零尺寸立绘；真实模块start的JSDOM模拟（3开场、状态栏、4面板、跨楼层及存档字段保留）；下载/解码失败保持站立姿态。每套四方向三种姿态的实际路由另测。PNG卡不在交付范围。

真实SillyTavern手机加载、CSS视觉与用户存档验收pending；不能标为driver-accepted。无全局配置、规则、剧情改动。

TW receipt：snapshot2026-08-18，sillytavern-card-pipeline，ST-A0/A2/D1/D4；无设计候选；source/offline验证，real-host pending。
