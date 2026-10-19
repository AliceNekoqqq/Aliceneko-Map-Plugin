# 1.29.1 加载修复候选版

从用户实际导入的 1.29.0 JSON 恢复维护源，不改人物文案、世界书、变量或游戏规则。

已复现的故障：卡内 MVU 模块 VERSION=1.29.0，加载器却校验 1.27.0，因此拒绝调用 start；MVU/panels 的 importWithTimeout 被改成只返回内嵌模块。scene/minigames 优先返回 embedded:copy；第五段巴卫互动还内嵌了13张图片。

修复：5个脚本均用 tools/loader-template.js 生成固定Git提交加载器。MVU保留1.29新增枚举与配置，不能回退到1.27；scene采用Git中已修正立绘边界的1.29模块；其他逻辑保持。巴卫互动原有入口保留，13张图片改为引用已经在Git且SHA256完全一致的文件，不新增Live2D功能。全部模块放在本目录，manifest.json固定内容哈希和各自的模块版本。

构建器：tools/build_release_card.py。读取本目录card-source.json与manifest.json，显式传入完整运行模块提交和新输出路径；--dry-run只报告产物，拒绝覆盖旧文件。既有build_card.py只支持早期三脚本基卡，不能用于1.29恢复。无独立profile/contract格式；本目录manifest和tests/release-loader.test.cjs承担这次范围的依赖及回归约束。

验证：tests/release-loader.test.cjs复现原卡版本拒绝并验证新五入口实际模块导出、备用源、只启动一次、文案/世界书/变量不变、31套衣装字段和13张图片字节一致；tools/loader.test.cjs验证断网重试、启动失败封锁、版本拒绝和iframe隔离；衣装9项、立绘布局、走路预加载/生命周期测试通过。源码语法检查通过。

依赖：卡内嵌入世界书/初始化资料/正则/五段轻量入口；酒馆宿主提供酒馆助手与原有模板运行环境；MVU内部外部依赖和注册链保持原状；Git模块、图片和字体需要联网，模块加载按jsDelivr、testingcf、GitHub Raw顺序回退。无新增安装步骤。

证据边界：加载器测试在Node隔离上下文执行，启动函数用计数替身；这证明版本与分发链，不证明真实酒馆DOM/事件/MVU运行。当前没有用户手机上的SillyTavern可访问地址，实机导入、标题页、状态栏、按钮、切聊天和保存仍为pending。本目录为候选版，不标记driver-accepted。

TavernWeave路由：sillytavern-card-pipeline；快照2026-08-18；读取ST-A0/A2/D1/D4及插件执行合同。修复范围：远程交付与原卡组装；不修改全局规则。
