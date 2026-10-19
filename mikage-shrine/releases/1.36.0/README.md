# 1.36.0 · R07 龙宫潜行寻宝

第七项小游戏的源实现和开发浏览器候选。固定前版1.35.0。R01–R06源块与CSS、R08–R10处理器逐字节保留；既有三项修复、R03人物显示和当前衣柜接入保留。真实SillyTavern、Android与作者人工验收pending，未授予driver-accepted。

## 本轮玩法

独立临时弹窗中，三段5×5回廊加三环宝匣。每次移动或等待才推进巡灯，没有倒计时和持续动画循环。先找到本段纹片，再带到右上廊门；三段都走完才出现宝匣机关。

- 珊瑚回廊、琉璃水牢、藏潮内阁有独立墙格、珊瑚、纹片和六拍巡灯。玩家可点相邻格、五个方向/等待按钮或方向键与空格；无效移动不耗步，按住键不会连发。墙格不通，珊瑚挡射线；巡灯从当前方向最多照三格。
- 默认同时显示当前灯光红斜纹与下一拍金虚线、巡灯下个落点「次」，箭头表示当前方向。当前或下一拍的灯光照到算本步一次警觉；连续两拍被照则被发现，安全一步下降一级。进入当前/下一拍巡灯格直接被发现，不能靠掩护撞灯。可关闭预告；不只靠颜色，格子的辅助朗读包含状态与坐标。
- 每局两次可选巴卫掩护，每次遮光两步，不自动行走、不耗正式资源、不免巡灯碰撞。无限次数「看看下一步」只指出一条可行路线的下一动作，不推进游戏；有限状态搜索最多5000节点，无外部服务。
- 被发现从当前廊口重试；已带出的纹片保留，本段纹片、步位与警觉重置，已用帮助次数不恢复。每段走出后歇脚，再进入下一段。
- 三枚纹片记外环「月」、中环「珊」、内环「波」。三环原生滑条可键盘微调，转到对应图样并分别扣稳才可开匣；可松开重新调整，错误或未扣稳都不能开。打开后只摹下匣中水纹，不带走藏物，不宣称获得原作龙眼或解决主线恩怨。
- 随时沿来路收步，零段、部分段、三段但未开匣、已查看宝匣分别如实结算。当前纹片没带出不算完成。每局一次结算；自己或请巴卫摹下手记。
- 仅新增本地R07-STEALTH与既有页面手帖回调。旧R07/其他回忆不覆盖，不改正式MVU、资源/好感、背包、解锁、衣柜、世界书、主线与聊天，不调用模型。地图/机关规则是本项目同人玩法，不写成原作事件。
- 页面隐藏/失焦暂停，回来手动继续；关闭取消事件/衣柜订阅、回收导出URL并回焦。图片404仍有珊瑚/灯/匣文字状态，可完成流程。拒绝存储时保留本页结果并导出。

旧R07叶拓处理器从当前入口移除，所有历史版本保留。

## 视觉与素材

继续使用原R07白天/黄昏/夜晚龙宫图，薄雾青绿棋盘、贝色纸片和金色缺口机关。主地图与操纵区紧邻；人物位于地图下方的独立留边，不遮住可点格。图上小人用当前玩家衣装，共享图集逐步更换行走帧与位置过渡；下方64px手机/72px桌面巴卫/玩家订阅衣柜更新。不是重新绘制角色或新增角色。

新assets/activities/stealth-v136-props.webp：内置imagegen原创透明三格道具图，2172×724、367706字节。左珊瑚、中巡灯、右藏潮匣，CSS等分取格，珊瑚/灯显示在对应地图格、宝匣显示于机关页。原PNG只编码WebP，alpha保留；没有画成SVG/占位主体，没有复制参考游戏的图。图集及字体/OFL固定提交635a36c959bd154d90af1bf3c262d63912d73e1c。

生成提示：stylized-concept; one wide transparent three-cell equal-square prop atlas with generous gaps, left pink/ivory branching coral on jade stone, center compact ornate bronze Japanese patrol lantern with warm red glass and short hook, right CLOSED deep-teal lacquer casket with aged-gold trim and mother-of-pearl waves; fully visible, consistent baseline, crisp small-size silhouettes, hand-painted anime/gouache, no floor/environment/people/text/borders/watermark. 原图与预览截图不入卡/仓库。

Noto Serif SC500子集，697字形、239392字节。官方OFL全文4350字节随附；font-manifest.json记录原字体URL/原件SHA与子集SHA。tools/build_stealth_font.py --font-source <原字体>可重建，原字体不发布。只在R07按需注册Mikage Stealth，失败系统字体降级。图集/字体与许可SHA在src/stealth和asset-manifest.json，未嵌入角色卡。

UI采用「棋盘局面→当前/下一拍风险→自主行动」，适合手机停下来思考。公开参考查阅Square Enix作者在PlayStation Blog对Hitman GO回合/立体布景和触屏玩法的说明：https://blog.playstation.com/2016/02/15/hitman-go-definitive-edition-hits-ps4-ps-vita-february-23rd/ 。读取了文字，不声称渲染官方网页或玩过游戏；只借抽象方法，关卡、机制、美术均本项目原创。最终视觉以实际发布模块截图审查。

审图发现最初mks-前缀与R02旧CSS重名，使棋盘受到旧固定高度影响、人物遮住边缘；已把R07全部改为独立mkr-前缀，按实际格中心定位人物并增加底部留边。加入CSS无重名前缀和人物不遮地图的回归断言，旧R02不作修改。

## 构建适配、内容与依赖

维护源src/stealth/{model.js,activity.js,style.css,font-manifest.json,art-manifest.json}，入口src/roam-controller.js。固定输入releases/1.35.0四快照，输出releases/1.36.0。禁止旧通用构建器覆盖。tools/build_stealth_release.py由已验证的有界构建适配本项，参数/输出/拒绝覆盖行为已检查。

`python mikage-shrine/tools/build_stealth_release.py --asset-commit 635a36c959bd154d90af1bf3c262d63912d73e1c --dry-run`仅报告计划；去掉dry-run创建scene/minigames/card-source/manifest，并只更新维护入口R07一行。默认拒绝覆盖，--refresh-staging仅供未发布候选迭代。写入均在项目目录，失败后按源重新构建；不在成卡里打补丁。

源码先提交，再用现有tools/build_release_card.py显式--source、--manifest、不可变--commit、--output，先dry-run后成卡；输出cards/巴卫_御影神社_v1.36.0_龙宫寻宝版.json，另行提交成卡。五段轻量Git/CDN脚本ID和enabled保留，scene/minigames升1.36.0，MVU1.30.1、panels1.27.0、tomoe0.1.0路径哈希不变。37条绑定世界书、正则、规则文案、初始化变量和解锁保持；整卡恢复对比锁定这些边界。

卡类仍为已有MVU Zod+嵌入界面的混合卡。卡内既有正则、schema/初始化附着载体与五个必需加载器保留；模块/媒体是不可变Git/CDN远程运行资源，MVU与原有依赖仍走既有加载，不增区域脚本或改变选择。宿主仍需已有SillyTavern/酒馆助手/MVU启用；没有要求玩家单装本地Zod。Node、fontTools、Playwright/Chromium和JSDOM只用于开发，不发布。无PNG交付需求，未新增PNG嵌入步骤或通用工程。

## 验证、限制与续接

- stealth.test.cjs：三段完整路线、有/无帮助、两种留记；等待/非法移动/墙/遮挡/碰撞，暂停冻结、掩护两步、已带纹片保留与当前段重试，转环/锁定/未齐拒开，零段/部分/三段未开/全程如实且一次结算。R01–R06源/CSS、R08–R10处理器字节一致；新CSS前缀不与旧CSS冲突，保留旧R07。整卡除版本/脚本metadata外恢复比对、模块哈希通过。可传成卡路径核对五段稳定ID/enabled、<10KB加载器与源卡语义。
- stealth-browser.test.cjs：真实1.36.0模块/共享图集+同字节本地资源，Chromium，375×812/1280×900/320×568三时景。点相邻格、方向键/空格、等待/墙、预告/提示/暂停、切后台后手动恢复、真实巡查发现与本段重试、三纹片/两次掩护、原生机关键盘/锁定/松开/开匣限制、全程/部分/零段结算、旧R07 plays=2保留、新局一次、正常/拒绝存储、衣柜实时变更、人物与地图分离、无横向溢出/JS错误/意外缺失资源，导出回收/关闭回焦/取消订阅通过。图片404在全新独立页面验证文字降级与结算，避免缓存影响故障注入。棋盘、宝匣和三环截图已审查。
- 旧school-browser.test.cjs在内存中将发布输入1.31.0替换为1.36.0执行，未改旧测试文件；375×812/1280×900/320×568的R02完整拾页/整理/衣柜/清理流程通过，验证独立CSS修复没有串扰旧局。
- startup-integration.test.cjs 1.36.0：三个开场、状态栏和四面板、消息重绘/swipe/chat切换/脚本重载、木材13存档保留通过。scene/minigames语法、模块/素材SHA、所有R07 CJK覆盖通过。

CDN URL由相同本地文件响应，不能据此宣称公网CDN或真实酒馆可达。截图仅内部审图。MIKAGE_PLAYWRIGHT、CHROMIUM_PATH、MIKAGE_STEALTH_QA和MIKAGE_DEBUG_DEPS支持替换开发环境。

待真实宿主：导入五段加载/既有MVU重试、开场到状态栏R07入口、旧存档人工核对、Android点格/纵滚/大字体、后台/聊天切换清理、实时衣柜、存储与回忆册。当前无可连接真实酒馆，不能标其通过；作者人工玩法与审美验收也待确认。

TW receipt：snapshot2026-08-18，实际运行embedded-ui/card-pipeline路由，读取A0、C1、D7、D1、执行/沟通/前端质量与工具适配/发布门；候选空，无引入额外设计库。沿用当前授权完整迭代与打包，未改全局规则或扩大资源写入。

进度7/10。唯一下一项R08守护幼狐；尊重幼狐靠近/离开意愿，不强制喂食或触碰。之后R09红线、R10花火，仍属原交接未完成改造。
