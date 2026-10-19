# 1.35.0 · R06 鞍马山纸鹤御风

第六项小游戏源实现和开发浏览器检查。唯一前版输入1.34.0；R01–R05源块和CSS、R07–R10处理器逐字节保留。含1.30.1三项修复、R03人物显示修复和此前衣柜接入。真实酒馆/Android与作者验收pending，未授予driver-accepted。

## 玩法与状态

独立临时弹窗。先选「缓翼稳行」或「乘风轻行」，自动向前飞或逐步御风；三段山路，每段两道风门。按住/空格托起，松手下落，风势会影响垂直速度。可点按上下微调、上下拖动风道，或用高度滑条。纸鹤中心的小点对准亮着的通行带，达到风门时判定中心是否在±12高度内；不是按插画外轮廓碰撞。

- 六道风门高度和阵风不同。缓翼的风力系数0.8/速度0.22，轻行1.1/0.28；自动飞行按真实帧时间推进，单帧上限0.1秒。普通风门通过后连续长按不会被意外松开。
- 两道一歇，可选杉影近廊减风或山脊外侧按原风势。两次可选巴卫挡风只消除此门的风势，不自动通过风门、无资源消耗，同门重试保留挡风。
- 偏出通行带后停在当前风门重试，保留已过的门。无生命、倒计时或惩罚。可暂停、慢风或切逐步；逐步模式不运行动画，按「向前一拍」推进1/4门距离并积分0.12秒风力。
- 切到后台、窗口失焦暂停并松开托起，回来需手动继续；pointercancel/失去捕获/全局松手停止长按。开始、重试、继续和下一段均把风道带回视野。
- 随时提前收鹤，选择杉叶/山羽/素面手记与自己/巴卫夹入手帖。零门、部分、六门结果如实区分，每局只结算一次。
- 仅新增本地回忆R06-WIND，旧R06及其他回忆保留；通过既有回调写本页手帖。没有正式飞羽、道具、资源、好感、主线、MVU或聊天写入，不调用模型。存储拒绝时仍保留本页结果并可导出。
- 关闭取消帧循环、事件和衣柜订阅，回收下载URL并回焦。纸鹤图失败显示文字纸鹤，仍可操纵与留记。

原R06明信片处理器从当前入口移除，历史发布原件保留。原背景/世界书称谓延用；山风路线和手记是本项目同人小游戏设定，未写成原作事实。

## 视觉、素材与来源

原R06白天/黄昏/夜晚山门背景保留，纸质苔绿控制区、留白提示和光带风门。提示置于风道上方，风道不与HUD重叠，主要操纵键紧接舞台下方；64px手机/72px桌面玩家与巴卫从当前衣柜共享API绘制，订阅实时变化。只更换本局内容，不改共享图集。

assets/activities/wind-v135-crane.webp：内置imagegen原创透明和纸纸鹤，1280×1280、103378字节，PNG仅编码WebP、alpha保留。象牙色纸翼、青灰折痕及朱点；非SVG或占位主体。生成提示：single right-facing flying origami paper crane, handmade ivory washi paper, subtle fibrous texture, graceful folded wings, muted teal inner folds and one tiny cinnabar seal dot, delicate anime/gouache game sprite, centered generous padding, transparent background, no environment/people/text/watermark. 不用原作图片复刻纸鹤。

Noto Serif SC 500子集，691字形、237672字节，官方OFL全文4350字节随附。原字体URL/原件哈希/子集哈希见src/wind/font-manifest.json，可用tools/build_wind_font.py --font-source <原字体>重建；开发字体原件不发布。R06按需注册Mikage Wind，失败回退系统字体。新图/字库/许可证均固定提交d4fe79994e4d77680d556c03018a619ffd92a942；SHA/字节见src/wind与asset-manifest.json，不内嵌代码或媒体进卡。

交互继续沿本项目R02对Alto风格「单一升降操作+可选帮助」的抽象参考，不复制关卡或美术。Pointer Events取消、捕获与touch-action的语义参照MDN：https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events 。本轮看的是文档文本，未声称渲染其网页；最终视觉由实际发布模块的开发浏览器截图确认。

## 构建与交付边界

源src/wind/{model.js,activity.js,style.css,font-manifest.json,art-manifest.json}，入口src/roam-controller.js。固定输入releases/1.34.0四快照；维护输出releases/1.35.0。禁止旧通用构建器覆盖。

`python mikage-shrine/tools/build_wind_release.py --asset-commit d4fe79994e4d77680d556c03018a619ffd92a942 --dry-run`仅报告计划，去掉dry-run生成scene/minigames/card-source/manifest并更新R06入口；默认拒绝覆盖，--refresh-staging仅用于未发布候选。已核对参数/返回码，先dry-run再写。

源码先提交，再用tools/build_release_card.py显式--source、--manifest、不可变--commit、--output先dry-run后打包。输出cards/巴卫_御影神社_v1.35.0_纸鹤御风版.json，后续单独提交成卡。五段轻量固定Git/CDN加载，ID/启用状态保留；scene/minigames1.35.0，其余MVU1.30.1、panels1.27.0、tomoe0.1.0路径哈希不变。37条世界书、正则、规则文案、初始化变量与解锁完整保留。

依赖仍为已有SillyTavern/酒馆助手/MVU及其原加载方式；不新增玩家安装项。fontTools/Node/Chromium/JSDOM是仓库外开发工具。

## 验证与待办

- wind.test.cjs：两飞行样式×两选路×两模式全程；上升/下落物理、跨普通风门持续长按、歇脚松开、暂停冻结、慢风/逐步、挡风限制/重试、零/部分/全程如实且只结算一次。R01–R05源/CSS和R07–R10处理器字节一致，旧R06保留，整卡除版本/脚本metadata外恢复比对一致，模块哈希。可传成卡路径验证五段轻量脚本和源卡语义。
- wind-browser.test.cjs：实际1.35.0模块与共享图集/同字节本地素材，375×812/1280×900/320×568，三时景。真实DOM长按/cancel、原生键盘/滑条/风道拖动、自动帧/后台暂停/手动恢复、逐步六门与选路挡风、失败当前门重试、全程/部分/零结算、旧记录、新回忆每局一次、拒绝存储、当前衣柜及实时换装、中文字体、导出URL/回焦/监听/帧循环清理，无横向溢出/JS错误/意外缺失素材。图片404在独立新页面注入，文字降级结算通过。风门位置由实际CSS测量对准，HUD与风道不重叠有断言；手机与桌面截图已审查。
- startup-integration.test.cjs 1.35.0：三开场、状态栏/四面板、消息重绘/swipe/chat切换/重新加载和木材13存档保留通过。scene/minigames语法、模块/素材哈希、CJK覆盖通过。

固定CDN请求由相同本地文件响应，不证明公网CDN或真实酒馆可用。截图仅内部审图。浏览器环境可用MIKAGE_PLAYWRIGHT、CHROMIUM_PATH、MIKAGE_WIND_QA和MIKAGE_DEBUG_DEPS覆盖。

真实宿主待验：五段导入加载/既有MVU重试、开场到状态栏R06入口、旧存档人工确认、后台/聊天切换清理、Android长按/上下拖动与纵滚/大字体、实时衣柜。无可连接真实酒馆，不标此层通过。

TW receipt：沿用2026-08-18 embedded-ui/card-pipeline路线、A0/C1/D7/D1和执行/沟通/前端质量标准、已有工具适配；本轮无新ST函数签名或框架。未请求扩大主线/资源写入权限。

进度6/10。下一项R07龙宫潜行寻宝；R08守护幼狐、R09红线、R10花火仍待重做。R08遵循幼狐意愿，不强制喂食或触碰。
