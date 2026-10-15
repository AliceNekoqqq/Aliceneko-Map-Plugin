# v1.7.0 重打包卡审计

审计对象：用户提供的《巴卫_御影神社_街区漫游_v1.7.0_重打包.json》。只读原卡，审计副本位于 audit/。

## 结论

暂未复现“重打包后大量损坏”。JSON、3 个酒馆助手脚本、3 个内嵌 HTML 文档中的脚本均可解析，核心页面可在 DOM 宿主模拟中启动。不能据此保证真实酒馆环境全部正常，也没有依据批量重写原功能。

## 已验证

- JSON 完整解析；存在 MVU、绘马与地图、像素游戏开场 3 个启用脚本。
- 3 个顶层脚本及全部内嵌 HTML script 均通过 `node --check`。
- 初始化状态的 15 个根字段通过原规则引擎 `checkFields`。
- 初始地图显示第 1 阶段、开放 2/10 地区；初始绘马板显示 2 枚普通绘马；生活页可显示初始摆设。
- DOM 宿主模拟下 map / wardrobe / board / life 均启动并打开，无运行异常。
- 已拥有衣装 shrine 点击后写入玩家衣装；点击锁定泳装 swim 只预览，保持 shrine。
- 接取初始 EMA-1 成功产生当前委托。
- domain 引擎 travel(R02) 成功生成出行事件；该操作表达移动意图，尚不直接改成已抵达。
- 标题页 OpeningScreen 与状态栏 MikageStatusScene 可独立启动并连接模拟桥接，未捕获运行异常。
- 独立远程模块包装可保留既有协作方式：MVU 通过 parent.MikageShrineRuntime，面板通过 parent.MikageShrinePanels，形象通过 parent.MikageCharacterArt 对外提供 API。未发现跨脚本 lexical 变量依赖或依赖源码字面量检索的逻辑。

## 注意事项（不是已证实的新卡损坏）

- 0.6.0 是当前 3 个脚本内部运行契约版本；面板 script-1.js 的 engine() 会检查该值。对外发布版本可另行更新，但不要只改其中一个内部版本。
- 旧存档升级器 `normalizeWardrobeUpgrade` 仅处理缺少衣橱根字段的旧状态；不会补齐更早版本可能缺失的生活根字段。v1.7.0 新初始化包含生活，验证不受影响。见 script-0.js 391–402、1102–1111。
- 面板找不到状态时仍提示“尚未初始化v0.5变量”，脚本名仍带 0.6 / 1.6.0；属于旧文案，不能据此认定运行的是对应旧功能。
- 当前 initVar 世界书条目 enabled=false，不应为“修复”而盲目启用。此类 InitVar 条目通常由 MVU 专用初始化读取，不是常驻提示词条目。

## 验证局限

- Playwright npm 包存在，但 Chromium 缺失；浏览器下载返回无效归档，无法完成像素级视觉验收。DOM 验证使用 jsdom 与宿主桥接模拟，不覆盖 CSS 布局、图片实际绘制和触屏行为。
- 尚未接入用户真实 SillyTavern / 酒馆助手 / MVU，因此没有验证真实消息事件时序、跨聊天切换、swipe、持久存档或真实模型生成结果。
- 未完成全五章、建设、资源结算及所有生活动作组合的回归。
- CDN 网络可达性和资源解码由发布构建及资源审计另行核验。

复现脚本：dom-test.cjs（地图/衣柜/绘马/生活）、scenes-test.cjs（标题/状态）；需要 /tmp/mikage-audit/node_modules/jsdom。

## 外置迁移版本复测（1.7.1）

复测对象：`mikage-repo/mikage-shrine/runtime/{mvu,panels,scene}.mjs`。

- 独立去除导出 metadata 与 `start()` 包装，将内嵌 data URL 和对应远程 assets URL 归一化后，3 个模块分别与原卡脚本逐字符一致。因此此次迁移未引入功能逻辑改动。
- 原卡共 61 处内嵌资源 URL 被外置。固定 SHA 资源路径不影响原有对象字段、图片尺寸与立绘参数。
- 迁移版本抽出的 3 个脚本及全部内嵌 HTML script 再次通过 `node --check`。
- 对迁移版本重新运行 DOM 模拟：map / wardrobe / board / life 均正常启动；shrine 点选保存成功；swim 锁定预览保持当前穿着；EMA-1 接取成功；标题和状态栏 API 均成功启动；没有捕获运行异常。
- 未修改 runtime 源码。DOM 模拟没有实际下载远程资源，因此 CDN 可达性、缓存和图像完整性仍需独立发布核验；真实浏览器/酒馆验证局限仍如前述。

迁移版本测试副本及脚本：`audit/migrated/`。
