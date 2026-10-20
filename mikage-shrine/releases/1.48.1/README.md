# 1.48.1 绘马神韵合入候选

作者要求：回传文案不改，主动修复接入错误后合入。输入来自“绘马系统_原著神韵升级交接包_v1.48.1.zip”；仅采用生成提示词、绘马规则正文与章节允许类型。incoming保存实际输入，manifest记录其SHA256；文案逐字相等由测试核对。没有采用回包错误覆盖的玩家边界条目，也没有覆盖历史发布模块。

基线1.48.0。新MVU与panels模块为1.48.1；scene原样复用1.48.0，minigames复用1.39.0，tomoe复用1.29.1。五段固定Git提交轻量加载器不变；主API/独立API设置方式不变。世界书按稳定ID34定位绘马规则，ID5玩家边界完整保留。ID1/55仅同步机器字段枚举，ID56停用的生成提示副本同步当前真实提示词。其他33条世界书、初始状态、31套衣装、正则、建设和小游戏不变。

修复：当前委托、完成/暂停快照、绘马板四处枚举及Zod同步，保留“无”和全部旧类型；新生成候选严格按回传章节列表选择。已有旧绘马及暂停记录无需迁移，普通结案回礼/主线门槛/建设费用未变。卡片与附属世界书版本同步1.48.1；仍绑定原世界书名称。

构建适配器（项目根mikage-shrine）：

- `python tools/merge_ema_return.py --dry-run`：读取1.48.0 manifest精确模块和incoming输入，在内存计算所有目标；不写文件。
- `python tools/merge_ema_return.py`：只新建releases/1.48.1的mvu.mjs、panels.mjs、card-source.json、manifest.json、field-spec.json；拒绝覆盖现有目标。输入由incoming目录维护，重新构建应使用干净目标。
- `python tools/build_release_card.py --source releases/1.48.1/card-source.json --manifest releases/1.48.1/manifest.json --commit <40位源码提交> --output <新JSON路径> [--dry-run]`：验证源哈希，构建五个固定提交加载器，拒绝覆盖。无PNG交付。

验证：`node tests/ema-integration.test.cjs`，实际Zod4.1.12+原领域引擎验证23组章节/类型完整生成→接取→暂停→恢复→查访→商议→行动→结案→休整，回礼一次发放、旧存档/旧暂停兼容、空值保留、未知类型/伪造奖励拒绝、旧schema负例、文案和世界书条目定位、UI/场景/初始变量/正则一致性。`node tests/startup-integration.test.cjs 1.48.1`通过真实模块在模拟宿主的三个开场、状态栏、四面板、重载、楼层/聊天切换；木材13不丢失。`release-loader.test.cjs`在最终卡构建后验证五个加载器版本、回退、只启动一次及源卡语义一致。

依赖边界：这是既有MVU/Zod混合角色卡，内含37条世界书、InitVar、原正则及5个轻量加载脚本。酒馆助手等宿主能力沿用原卡；MVU核心和Zod4.1.12继续原固定Git/CDN路径，不新增宿主扩展或独立Zod安装要求。源码与图片继续外部Git加载；本次没有新素材或国内/全球互斥脚本组。Node/jsdom/Zod仅为离线检查依赖，未打包进卡。

TW记录：route sillytavern-card-pipeline，snapshot 2026-08-18；ST-A0/A2/D1/D4、plugin-runtime、tool-adapter-contract、release-gate；无新设计候选。目标/红线/验收沿用作者本轮指令，无未决产品选择。离线通过属于candidate；真实SillyTavern、Android设备、实际模型生成及作者接受尚未验证，不标driver-accepted。
