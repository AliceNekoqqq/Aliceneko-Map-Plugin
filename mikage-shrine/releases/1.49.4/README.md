# 1.49.4 衣装经济整合候选

本轮承接“继续”，将月之森衣装商店、择用后的WQ09幼狐稿与两批经济修正收成可导入JSON候选。当前维护入口为本目录manifest、card-source、life-config与plan；build_economy_candidate.py从1.49.3核验固定输入后派生，历史候选与源文件保留。没有PNG交付。

## 玩家可见变化

日常衣装在月之森和裁舍向素世购买，16商品17外观总价36奉纳，购买仅收录；当前穿着沿玩家选择。纪念装保留主线或对应支线，31套actor+id和原美术保持。幼狐仍是R08/M03之后的WQ09，采用作者回传中的雷童、紫电、旧衣与巴卫反应，并保留已择定的开放处理和既有白底紫缘衣影。

普通绘马回礼与修缮按原配置结算；生活耗材按包交付，购买写负流水并预留未付修缮预算。额外奉纳按实际受领事件，每次1～3、每剧情日总额3。第二章R03收购香草2→1、番茄2→1、鲜花2→2、木制御守3→4奉纳，日总额4，成交同时扣库存、入账和记流水。剧情跨日恢复额度，查看与重读保持额度。番茄料理是米1+番茄1→便当2。完整与基础回礼两路五章通关余额仍8/4。

新增15,176字节的同款Noto Serif SC字体补充，共30字。按当前面板真正引用的TTF重新计数，WQ09有23个缺口；较早记录的19字采用了更宽的全素材集合，不能代表面板已接入覆盖。本轮补充涵盖这23字及7个经济/生活字形，旧字体、77处审定文案和全部图像保持。字体来源、源SHA256、字表及SIL OFL许可位置见assets/ui/economy-kozuchi-v1494-font.json。

## 交付和运行依赖

卡型是chara_card_v3的MVU Zod混合卡。卡内包含配套世界书、初始变量、原3条正则及5个启用的酒馆助手加载入口。世界书以manifest逻辑身份mikage-shrine:character_book绑定/data/character_book，版本与源条目哈希同时校验；无单独伴随世界书，来源和二创说明继续留在模型条目外。

宿主沿用SillyTavern、酒馆助手脚本/API及EJS模板能力。五个运行模块使用实际已公开的40位Git提交，顺序尝试jsdelivr、testingcf与raw源，成功一次后保持单次启动。schema与校验器位于远程mvu模块；该模块沿原testingcf/fastly路径加载固定MagVarUpdate提交，兼容宿主z不存在时沿testingcf/cdn路径加载zod4.1.12。这里没有另装本地Zod的玩家步骤，也没有新增一对需要切换的国内/国际脚本；地区选择实际采用原加载器顺序回退。图片和字体仍是固定提交远程资源。

本地Zod/EJS、模拟宿主、Playwright与截图均为开发验证；独立全解锁测试副本保持隔离。详细能力清单在manifest.runtime_dependencies，实际源码提交、导入文件字节数和哈希见DELIVERY.json。真实酒馆导入、设备、模型实际输出和作者接受仍待验，状态为candidate。

## 已有工具适配与检查

所有命令工作目录为mikage-shrine。源构建显式读取releases/1.49.3/manifest.json、1.49.4/plan.json和补充字体元数据，仅输出新1.49.4六文件，拒绝覆盖；dry-run只校验并列出预期字节和哈希。字体构建从已核验SHA256的既有Noto源输出两份新素材，拒绝覆盖，dry-run支持同样检查。打包器只输出指定的新卡文件，核验模块哈希，拒绝覆盖，实际Git源码提交通过--commit传入。最终文件路径为cards/巴卫_御影神社_v1.49.4_衣装经济整合版.json。

```bash
python -B tools/build_kozuchi_font.py --font-source /tmp/moonforest-NotoSerifSC.ttf --dry-run
python -B tools/build_economy_candidate.py --asset-commit <已公开字体提交> --dry-run
node tests/economy-candidate.test.cjs
MIKAGE_ECONOMY_RELEASE=1.49.4 node tests/economy-income-browser.test.cjs
MIKAGE_ECONOMY_RELEASE=1.49.4 node tests/economy-browser.test.cjs
MIKAGE_ECONOMY_RELEASE=1.49.4 node tests/economy-startup.test.cjs
MIKAGE_SHOP_RELEASE=1.49.4 node tests/moonforest-shop-browser.test.cjs
node tests/kozuchi-font-browser.test.cjs
python -B tools/build_release_card.py --source releases/1.49.4/card-source.json --manifest releases/1.49.4/manifest.json --commit <已公开源码提交> --output cards/巴卫_御影神社_v1.49.4_衣装经济整合版.json --dry-run
node tests/release-loader.test.cjs <实际卡路径> releases/1.49.4/card-source.json 1.49.4
node tests/economy-candidate.test.cjs <实际卡路径> <已公开源码提交>
```

字体及源构建dry-run用于新输出创建之前；实际写入后以逐字重建与哈希验证。离线检查覆盖卡/世界书版本与内容、过期世界书/缺依赖/错误启用与地区策略负例、5加载器真实导出/版本/回退/防重、31映射/13外部立绘/77审定文案、11EJS、全部经济流程与新楼层记账。Chromium153在320/375/1000检查衣装购买、生活采购、收购、幼狐静态预览与绘马背面长文；字体通过FontFace实际加载。自动与模拟结果分别记账，详情见VALIDATION.json。

TW snapshot2026-08-18，路由sillytavern-card-pipeline，ST-A0/A2/D1/D4与适配/发布门已读。范围为26文件/16000文本变更行及一份15,176字节二进制字体；全工作树和跨本轮全部提交的基线差异分别检查，二进制以文件数、字节、哈希和精确字符集单独验收。建设自由扩展和实际组装提示预算仍为独立后续项。
