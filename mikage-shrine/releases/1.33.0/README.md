# 1.33.0 · R04 神梅树下·落梅封香

以1.32.0固定维护源码为唯一前版，完成第四项小游戏的源实现与开发浏览器验证。顺带修复R03人物容器零尺寸；其他玩法保持。真实SillyTavern/安卓导入与作者验收pending，未授予driver-accepted。

## 玩法与边界

独立临时弹窗，梅树下的接花台、纸质香方与坛口纸封。保持既有本地回忆册/页面手帖，不写MVU、好感、正式资源、背包、主线或聊天消息，不调用模型。

- 三种香方：月白清香、绯梅柔香、露冷疏香。三阵共18次落物，12份可收材料与6根枯枝；白梅/绯梅/晨露各4份。移动盏身，风在半途改变落点，下一落物与最终接取位置提前提示。
- 两次可选巴卫协助，挡风或挑开枯枝；两次阵间可移近廊内减风，也可留在树下。枯枝会被清理，不抹掉已收材料；没有生命、倒计时或硬失败。
- 自动/逐步、慢速、按钮/方向键/滑条/横拖。后台/离焦暂停，手动恢复；关闭取消RAF、监听与导出URL。横拖区域保留纵向页面滚动。
- 可提前收好转入调配。六份花露可以按香方或自选比例；不足可明确向瑞希补齐目标香方缺料，原接取与借补分别记账。重复补料不重复加量；份数不能负数、超库存或超六份。零接取也有可完成路径。
- 可选择只留香笺，不封坛。封坛需金点对准缺口（±15度容差），用滑条/键盘/按钮转动，可请瑞希示范，再选素纸或竹叶护封。两种结尾均将坛留给瑞希待酿，只带寄存笺或配方。不是即时酿成，不强制饮用/触碰/关系，不把小坛写成正式背包物品。
- 新本地回忆ID R04-PLUM，保留旧R04及其他回忆，不覆盖旧玩家记录；拒绝存储时保留页面数据并可导出。旧的纸舟实现从R04入口移除，历史版本原件保留。

这是虚构神社调香仪式，不是现实饮品配方或制酒教程。规则、世界书与原作正式设定没有新增这套仪式。

## 额外显示修复

R03的共享图集API只设置背景图和裁切，不替调用方设置尺寸。原.mkm-figures>span只有display/flex规则，宽高为0，导致图集URL已加载却看不见人物。补充72×72 CSS容器，R03模型/活动逻辑逐字节不变。新可见尺寸断言对旧1.32.0失败、对1.33.0通过，且对两套当前衣装检查。R04同样明确72×72；已审图确认两个人物实际出现在台边。1.30.1的图集单格裁切未改。

## 构建适配与依赖

源：src/plum/{model.js,activity.js,style.css,font-manifest.json}，src/roam-controller.js，以及R03的src/market/style.css。固定输入releases/1.32.0/{minigames.mjs,scene.mjs,card-source.json,manifest.json}。最新维护快照releases/1.33.0；禁止用历史通用构建器覆盖。

构建：`python mikage-shrine/tools/build_plum_release.py --asset-commit fa5a591f5085508ffade78ae30bc69a0acb5c78b --dry-run` 只报告输出；去掉--dry-run生成1.33.0的scene/minigames/card-source/manifest，并更新R04源码入口。默认拒绝覆盖，--refresh-staging仅供本轮未发布候选重建。R03尺寸也在构建时精确锚点替换，已有维护CSS同步保存。退出0才算成功。

打包沿用已检查的tools/build_release_card.py，显式--source、--manifest、不可变--commit、--output。--dry-run核对模块哈希、路径、脚本身份并报告体积，不写卡；正式输出cards/巴卫_御影神社_v1.33.0_落梅封香版.json，拒绝覆盖旧卡。先提交源码，再用该提交打包，成卡在后续提交入Git。

五段固定Git/CDN轻量脚本ID和启用状态保留。scene/minigames升1.33.0；MVU1.30.1、panels1.27.0、tomoe0.1.0模块路径与哈希不变。37条内嵌世界书、正则、初始化数据/变量以及原载体保留；继续用既有SillyTavern/酒馆助手/MVU环境和MVU原依赖加载路径。无新玩家安装项；Node/Chromium/JSDOM/fontTools只作开发检查，不打包。

## 素材与视觉

新增assets/activities/plum-v133-table.webp（约289KB）：内置imagegen原创临水梅树酿酒台，1536×1024，PNG仅编码为WebP，不改图像内容。日景用此近景；黄昏/夜景继续使用原canon-v127/R04对应预绘图，加简单木台前景，不以白天调暗代替夜晚。可移动青瓷盏复用tea-v128/cup.webp；落花、露滴和枯枝为轻量CSS交互标记。共享衣柜图集仍沿用其固定资源映射。角色缺依赖、台景/杯图失效时有文字/底色降级。

生成提示词：illustration-story；one landscape 3:2 original painterly anime watercolor/gouache background, tranquil old Japanese shrine veranda beside shallow lake, white plum branches upper left with pale pink buds, misty early light, jade water and weathered wooden workbench, generous quiet empty center/left for movable cup and falling tokens; far-right lower quarter small celadon jar sealed with ivory paper/red cord, bamboo basket of plum petals and covered dew vessel. No people/cup/text/UI/logo/watermark, no neon/plastic/vector appearance, tactile ceramics/wood, fictional scene. 最终素材与SHA见manifest/asset-manifest；PNG不打包。

新增Noto Serif SC 500字库769字形/267820字节，OFL完整许可证同目录，来源及SHA见src/plum/font-manifest.json。只在R04按需注册Mikage Plum，失败回退系统字体。build_plum_font.py --font-source <已记录原字体> 可重建；原字体与开发浏览器不打包。所有新二进制固定资产提交fa5a591f5085508ffade78ae30bc69a0acb5c78b。

使用本项目纸质互动舞台与原创台景。公开参考仅阅读CHOYA官方The Process页面的阶段组织与“待酿”边界：https://www.choya.jp/en/philosophy/umeshuzukuri/ 。未复制图片、文案、代码，也未声称其现实果梅酒工艺等同虚构梅花仪式；只读公开文字，没有实际渲染该网站。最终视觉依据本版浏览器审图。

## 验证与证据边界

- plum.test.cjs：全部三香方×两避风路线，12份全接取/枯枝避让、风向/协助限制、暂停/慢速/逐步、库存/总份数限制、零接取借料且不重复补料、只留香笺/自定义配比、封口角度与容差、非法key/重复结算拒绝、真实来源及待酿文案。R01–R03模型/活动与R05–R10处理器逐字节一致，CSS只加R03尺寸和R04范围，旧R04回忆保留，全卡除版本/脚本metadata外可恢复比对一致，模块哈希通过；传最终卡路径可验证五段轻量脚本与源卡语义一致。
- plum-browser.test.cjs：Chromium153，375×812日景、1280×900黄昏、320×568夜景。实际新模块/共享图集/同字节素材；18落物全流程、三个香方、风/协助、横拖/方向键/原生纸封滑条键盘、未配齐或未对齐阻止提交、零接取补料、只留香笺、正常/拒绝存储、旧R04 plays=2保留、新回忆每局只加一次、72px人物/当前衣柜/中文字形、无横向溢出/JS错误/缺失素材、后台暂停、导出URL回收/回焦/滚动恢复、再打开自动接花时关闭后零RAF。
- market-browser.test.cjs：默认可通过MIKAGE_RELEASE切换，当前默认1.33.0。旧1.32.0对新人物可见尺寸断言失败，当前三尺寸完整鉴宝、旧存档、拒绝存储、导出/关闭回焦通过；人物条截图审查。R03玩法不变。
- startup-integration.test.cjs 1.33.0：3开场、状态栏、4面板、消息重绘/swipe/chat切换/重新加载与存档木材13保留通过。后续只补R03/R04人物容器CSS及作者脚本说明，不改共享启动链。scene/minigames node --check通过；R04字库实际CJK覆盖通过。

浏览器测试中的固定素材URL由相同本地文件响应，不等于公网CDN和真实酒馆验证。可用MIKAGE_PLAYWRIGHT、CHROMIUM_PATH、MIKAGE_PLUM_QA和MIKAGE_DEBUG_DEPS配置独立的测试工具；不写入玩家依赖。截图只内部审图，不作为交付文件保存。

待真实宿主验收：导入五段加载/依赖重试、三个开场与状态栏到R03/R04入口、聊天切换后清理、Android横拖与纵滚/后台/大字体、衣柜实时换装、旧存档人工确认。没有可连接真实酒馆，不标此层通过。

TW receipt：沿用2026-08-18 embedded-ui/card-pipeline路由及A0/C1/D7/D1、执行/沟通/前端质量标准；工具适配与发布门延续1.32.0已验证机制。无新框架、全局设置或目录候选。

下一项R05多满沼·沼皇女梳妆赴约；R06御风、R07潜行、R08守护幼狐、R09红线、R10花火仍待重做。
