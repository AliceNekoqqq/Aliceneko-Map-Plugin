# 1.32.0 · R03 妖怪横丁暗市鉴宝

以1.31.0固定源码为唯一前版，完成第三项小游戏的源实现和开发浏览器验证。R01茶席、R02拾页及R04–R10原处理器逐字节保留。真实SillyTavern/安卓导入与作者验收仍pending，未授予driver-accepted。

## 玩法与状态

独立临时弹窗，深靛色鉴物台配纸质记录。预绘暗市背景与当前衣柜双人小人；新增原创铜铃/手镜/折扇手绘图集，不用SVG替代器物图。插画为器物示意，底部/来历/狐火线索用文字记录，不把同一示意图宣称为真实多角度模型。

- 选择借面具或沿摊外侧进入，均不写玩家身份或变形。
- 三件器物，四种观察；先看到线索才能勾选，两条依据及关键证据支持判断。铜铃的蜡与金粉覆盖层、手镜逐项匹配的旧账、折扇缺失的来源，分别对应仿品、旧物可信、暂不定论。所有器物和判断均为虚构谜题，并非现实古董鉴定建议或原作新增事实。
- 错误/缺证可复查，没有生命、倒计时、正式资源消耗。每件可直接记为待考；不会把未判定的东西写成鉴定成功。巴卫可提示，不强制触碰、恋爱或亲密。
- 终点选择纸上纹样，或只记结论；可选笹平酒铺酒签拓记。摊货留在原地，无购买/饮酒，也不写入正式背包。再逛一圈轮转摊位顺序，不虚构随机真伪。
- 只通过现有回调写本地旧物回忆册新增ID R03-APPRAISAL和页面散策手帖。保留R03-DANGO、R03-MARBLES旧记录及schema，不迁移/覆盖旧玩家回忆。拒绝存储时本页保留记录并可导出。
- 原生按钮/复选框/选择框，焦点在本轮观察操作后保留，换摊聚焦标题。弹窗沿用既有Escape/关闭回焦与滚动恢复。无新帧循环、外部模型或宿主API；关闭移除监听并回收导出URL。

## 当前来源与构建适配

源：src/market/{model.js,activity.js,style.css,font-manifest.json}；入口src/roam-controller.js；前版releases/1.31.0/{minigames.mjs,scene.mjs,card-source.json,manifest.json}。当前维护快照是releases/1.32.0，不用历史通用构建器覆盖。

`python mikage-shrine/tools/build_market_release.py --asset-commit fabf27a2e6e8540c510db9899fa39802fe95e019 --font-commit a184df0d32f6fb4329d1c843cb48cc7e8287516d --dry-run` 只报告输出；去掉--dry-run写新目录与R03入口。默认拒绝覆盖；--refresh-staging仅供本轮未发布候选重建。工具本体及源码已检查，退出0才算成功。

打包沿用tools/build_release_card.py（--help与源码已核对），显式--source、--manifest、--commit、--output；--dry-run检查固定模块哈希并报告体积，不写卡。正式输出cards/巴卫_御影神社_v1.32.0_暗市鉴宝版.json，拒绝覆盖历史卡。源码先提交，再用不可变提交打包，卡在后续提交入Git。

五段固定Git/CDN轻量脚本身份与启用状态保留。scene/minigames升级1.32.0；MVU1.30.1、panels1.27.0及tomoe0.1.0的既有模块路径与哈希不动。内嵌的37条世界书、正则、初始化变量和原有脚本载体保留；正式schema仍由既有MVU路径提供，继续使用原SillyTavern/酒馆助手/MVU环境，没有新玩家安装项。开发Node、fontTools、Chromium、JSDOM不随卡发布。

## 素材

assets/activities/market-v132-props.webp：内置imagegen原创单张三格图集，PNG仅编码为WebP，2048×683；约135KB。固定提交fabf27a2e6e8540c510db9899fa39802fe95e019。

提示词：stylized-concept；one horizontal three-cell Japanese yokai antique appraisal texture atlas, deep midnight indigo velvet background and amber shop sidelight, painterly gouache anime game props, left verdigris bronze bell with red silk knot and subtle seam, center antique bronze hand mirror with worn reflective face, right pale-gold partly open maple paper fan and bamboo ribs. Exactly three equal cells, same visual size, generous margins, no people/text/logo/watermark, no vector/photoreal3D/neon; original fictional props, do not copy museum objects. 原始生成PNG不打包。

assets/activities/market-v132-font.ttf：802字形、280944字节的Noto Serif SC 500子集，OFL完整许可证同目录；来源与SHA见font-manifest.json，固定提交a184df0d32f6fb4329d1c843cb48cc7e8287516d。仅R03按需加载，字体失败回退系统字体。tools/build_market_font.py --font-source <所记录原字体>可重建，不要求玩家安装字库。

## 证据与限制

market.test.cjs：三种摊位顺序、证据不足/错误结论/不支持的输入拒绝、提示去重、正确与全待考流程、选择与结算唯一性、R01/R02/R04–R10字节保留、旧回忆ID、全卡内容恢复比对、模块哈希；可传最终卡路径检查五段轻量加载及源卡语义一致。

market-browser.test.cjs：开发Chromium153，375×812、1280×900、320×568。真实发布模块与共享角色绘制、全部器物证据/错判/正判/待考、轮转重玩、旧团子记录保留、当前衣柜、键盘Enter、正常与拒绝存储、导出URL回收、关闭后零RAF/回焦/滚动恢复、零横向溢出/JS错误/缺失素材；字库加载后审图通过。环境可用MIKAGE_PLAYWRIGHT、CHROMIUM_PATH、MIKAGE_MARKET_QA配置，测试包独立安装在仓库外。

startup-integration.test.cjs 1.32.0：3开场、状态栏、4面板、消息重绘/swipe/chat切换/重新加载、存档木材13保留通过。portrait-paint.test.cjs 1.32.0：31套非零尺寸立绘通过。后续只补R03字库/控件焦点，没有改这些共享组件。模块node --check通过。

浏览器素材由相同本地文件响应固定URL；不等于公网CDN或真实酒馆验证。真实导入、聊天切换/开场/状态栏到R03的用户实操、安卓WebView滚动/键盘/大字体、衣柜实时变更与旧存档人工确认待验收。没有可连接的真实酒馆，此层不标通过。预览截图只内部审图，未作为交付文件。

TW receipt：2026-08-18快照，embedded-ui/card-pipeline路由，A0、C1、D7、D1及执行/沟通/前端质量标准；项目适配/发布门文档已读。未采用新框架或目录候选。公开参考仅阅读京都国立博物馆器物条目及器物/盒书展览文字，借用“实物细节与来源记录并列”的组织方法，未复制图像/文案/代码或声称浏览器看过该网站：https://www.kyohaku.go.jp/eng/collection/meihin/touji/item10/ 、https://www.kyohaku.go.jp/eng/exhibitions/feature/b/2026_tea/ 。最终视觉来自本项目浏览器截图。

下一项R04夜森神社梅花酿酒。R05梳妆、R06御风、R07潜行、R08守护幼狐、R09红线、R10花火仍待重做。
