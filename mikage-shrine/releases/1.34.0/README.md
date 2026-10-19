# 1.34.0 · R05 沼皇女梳妆赴约

第五项小游戏的源实现和开发浏览器检查。固定前版1.33.0；R01–R04源块/CSS、R06–R10处理器逐字节保留，含R03的72px人物修复。真实酒馆/安卓与作者验收pending，未授予driver-accepted。

## 玩法与状态

独立临时弹窗。纸质梳妆单、三套预绘衣装的镜前试搭、可调簪饰与三枚绿叶小阵。沼皇女的人形是试搭预览，化形只作用于她；玩家与巴卫仍读取当前衣柜。

- 先听她希望怎样出门：浮桥边走走、沿花径散步、廊下等灯亮。这些是本地试搭情境，不写成原作事件或世界书新事实。
- 三套原创衣样：水纹青衣、绯梅小袖、月白莲衣；四种簪饰状态：点翠叶、绯梅花、月白珠或不戴。点选会实际切换插画或叠加饰物；横拖/两条原生滑条调整簪位，可随时撤下。听取角色意见不打美丑分，不锁定唯一搭配。
- 沼皇女确认试搭后才进入绿叶化形。每片叶尖需对齐目标缺口（±12度），可取下重摆，锁定后不能误转。全部落稳，再把灵力停在所选情境的稳定段（目标±10）。灵力不是越高越好。可请巴卫逐片示范，无正式资源消耗。
- 叶阵或确认页可返回改装；返回会撤销确认、清掉叶阵锁定/稳定状态与灵力，必须重新确认。不会改完衣服仍沿用已完成化形。
- 准备好后选择送至浮桥入口，或写好清单留在廊下；之后的赴约仍由沼皇女决定，不自动记录约会/恋爱结果。任一试搭阶段均可留笺暂缓，只记试搭，不记出门或化形完成。
- 没有倒计时、生命、强制触碰或强制饮用。只通过既有回调记录本地R05-DRESS及页面手帖，不调用模型、不写聊天/MVU/正式资源/好感/衣柜/解锁/背包。
- 旧回忆R05保留，不迁移、覆盖或增加旧plays。新局一次结算；关闭回焦、取消外部监听和回收导出URL。图片失败仍可选择/留笺，存储拒绝时保留本页结果并导出。

R05旧电车旅票处理器从当前入口移除；所有历史发布原件仍保留。

## 视觉与素材

assets/activities/dress-v134-himemiko.webp：内置imagegen生成的一张透明三格同人试搭图，1774×887，约193KB。三套同一姿势、同一体型。保留浅紫半束短发、蓝紫圆眼及椭圆眉特征，衣样是本项目原创，不宣称原作服装。原PNG仅编码为WebP，透明alpha保留，没有绘画式处理。

生成图原始三格横向中心不齐；透明区测量后采用7.934%、50.634%、93.418%的CSS背景位置，使三套可见身体中心对齐；统一镜内1%/4%/7%留边，脚部高于标签，不裁掉鞋。原格alpha边界与SHA见src/dress/art-manifest.json。簪饰用小型CSS叠加绘制，默认镜内横61%、纵11%，上下限避开眼睛；位置可自选。人物主体不是SVG/占位图。

背景继续使用canon-v127/R05白天/黄昏/夜晚对应图；玩家/巴卫用既有共享图集和72×72框，衣柜事件会实时更新小人，不改变沼皇女的衣样。

字库Noto Serif SC 500，753字形、259284字节，OFL全文同目录。src/dress/font-manifest.json记录原字体URL/哈希与子集哈希；build_dress_font.py --font-source <原字体> 可重建。只在R05按需注册Mikage Dress，失败回退系统字体，开发字体原件不发布。

全部新二进制固定提交d26a4eed333cc70e7a9dabc74e752e0b17feadab；参考截图和生成PNG不进入仓库/卡包。图集和字库都是远程资源，不嵌进角色卡。

生成提示词：stylized-concept；one transparent horizontal three-cell wardrobe atlas, Himemiko HUMAN form identity reference only, same youthful fully clothed lavender-haired girl, distinct two oval brows/high forehead, round blue-lavender eyes, half-ponytail, same front-facing full-body pose with hands over obi and identical scale/baseline. Left celadon water-pattern kimono/ivory obi, center dusty-rose plum kimono/burgundy obi, right moon-ivory water-lily kimono/mauve obi. No hairpins/jewelry (interactive overlay), proper covered kimono, no sexualization; delicate painterly anime/gouache, no backgrounds/people/text/watermarks. Atlas positioning corrected in display after generation.

## 来源与设计依据

角色身份核对东京电视台官方角色页：https://www.tv-tokyo.co.jp/anime/kamisama2012/chara/ 。官方沼皇女图片链接返回404，不将其记为看过。人形外貌另看公开图片https://mywaifulist.moe/waifu/numa-no-himemiko 所示截图（仅身份视觉参考，未打包或复制原图）；保留椭圆眉/浅紫发，不根据未验证记忆任画。试搭服饰与小玩法为同人延伸，不把继承卡里的所有背景称谓当成已重新核验的原著结论；本轮未改世界书。

界面延用本项目纸质互动舞台，采用“镜中实物预览+衣簪选择+准备检查”的组织。公开参考是角色资料/截图；没有宣称已渲染官方站或拿网页文本当最终视觉验收。实际图集、三套镜中截图及簪位已在开发浏览器审查。

## 构建适配与依赖

源：src/dress/{model.js,activity.js,style.css,font-manifest.json,art-manifest.json}，入口src/roam-controller.js。固定输入releases/1.33.0/{minigames.mjs,scene.mjs,card-source.json,manifest.json}；最新维护快照releases/1.34.0。禁止用旧通用构建器覆盖。

`python mikage-shrine/tools/build_dress_release.py --asset-commit d26a4eed333cc70e7a9dabc74e752e0b17feadab --dry-run`只报告输出；去掉--dry-run生成1.34.0的scene/minigames/card-source/manifest，并更新R05源码入口。默认拒绝覆盖，--refresh-staging仅供未发布候选重建。源/运行参数/退出码已核对，dry-run成功后才写。

打包沿用tools/build_release_card.py，显式--source、--manifest、不可变--commit、--output。--dry-run核对模块哈希、路径和脚本身份，不写卡；正式输出cards/巴卫_御影神社_v1.34.0_浮桥梳妆版.json，拒绝覆盖旧卡。源码先提交，再用该提交打包，成卡在后续提交入Git。

五段轻量Git/CDN脚本ID/启用状态保留。scene/minigames升1.34.0；MVU1.30.1、panels1.27.0、tomoe0.1.0模块路径与哈希不变。37条世界书、正则、初始化数据/变量及附着载体完整保留。继续用已有SillyTavern/酒馆助手/MVU和原有MVU依赖加载，不新增玩家安装项；fontTools/Node/Chromium/JSDOM为仓库外开发工具。

## 验证与限制

- dress.test.cjs：36种情境/衣装/簪饰组合、坐标边界/不戴、非法key/阶段拒绝、确认前不可结算、叶尖容差/落叶锁定/解锁、灵力区间、可选示范、改装清空稳定、各阶段留笺取消、单次如实结算；R01–R04源/CSS、R06–R10处理器字节一致，保留旧R05，整卡除版本/脚本metadata外恢复比对一致，模块哈希。可传成卡路径核对五段轻量加载与源卡语义一致。
- dress-browser.test.cjs：实际发布模块与共享图集、同字节本地素材，Chromium153；375×812/1280×900/320×568，三个情境/三时景，全部衣样显示与背景定位、发簪拖动/键盘滑条/撤下、叶片与灵力阻止错误提交、返回改装必须重稳、示范完成、准备/取消结局、旧R05 plays=2保留、新记录每局一次、正常/拒绝存储、衣柜实时变更只更新小人、72px可见框、中文字形、无横向溢出/JS错误/意外缺失素材、导出回收/关闭回焦/监听清理。图像404用全新页面隔离验证文字降级与留笺流程；避免缓存命中导致故障注入未发生。无帧循环或持续计时器。
- startup-integration.test.cjs 1.34.0：3开场、状态栏、4面板、消息重绘/swipe/chat切换/重新加载、存档木材13保留通过。模块node --check、字库CJK覆盖和素材哈希通过。最后改动只涉及本局预览/焦点，没有改共享启动链。

浏览器固定素材URL由相同本地文件响应，不等于真实公网CDN/酒馆。MIKAGE_PLAYWRIGHT、CHROMIUM_PATH、MIKAGE_DRESS_QA、MIKAGE_DEBUG_DEPS可配置测试环境。截图仅内部审图，不作为交付文件。

待真实宿主验收：导入五段加载/既有MVU重试、三个开场与状态栏到R05入口、聊天切换后清理、Android横拖与纵滚/大字体、衣柜实时换装、旧存档人工确认。无可连接的真实酒馆，不标此层通过。

TW receipt：沿用2026-08-18 embedded-ui/card-pipeline路线及A0/C1/D7/D1、执行/沟通/前端质量标准与已有项目工具适配。无新框架/全局设置/未采用的目录候选。

下一项R06鞍马山·纸鹤御风；R07潜行、R08守护幼狐、R09红线、R10花火仍待重做。
