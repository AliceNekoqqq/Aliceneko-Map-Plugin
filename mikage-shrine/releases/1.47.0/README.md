## 1.47.0 檐下生活与布置台候选交付（2026-10-20）

范围：神社生活首页与布置页。首页8个生活入口、实际陈设预览和落樱；布置页复用领域配置的回廊/庭院/门前/茶桌四区及槽位坐标，6件实绘透明陈设，选物件/选空位仅本地预览，确认摆放/收起/点灯调用原life领域动作。原其余7个分页内容逻辑保留，仅共享外壳统一纸木风格。本轮不继续料理/菜圃/商店/手帐等独立视觉重做。

新增素材assets/ui/life-v147-scenes.webp（四区日间布置示意，不替代原地图三时段）与life-v147-objects.webp（3×2透明图集），固定提交600cd34997a01b0b2dd708be79705252c56ee119；保留alpha，UI用CSS图集定位，原图未覆盖。生成要求：无人物文字与预摆物的日式回廊/庭院/门前/空茶桌；另生成风铃、坐垫、灯笼、香草盆、花瓶、牵牛花六件透明陈设。

维护src/life-desk.css、src/life-desk.js、tools/build_life_desk.py；从releases/1.46.0/manifest.json指定的面板派生1.47.0。构建支持--asset-commit和--dry-run。轻量成卡使用tools/build_release_card.py --source releases/1.47.0/card-source.json --manifest releases/1.47.0/manifest.json --commit <固定源码提交> --output <新JSON> [--dry-run]。无PNG；已有宿主/脚本/MVU依赖不变。正式写入仅原life动作，未新增规则或变量。

验证：320/375/1000实际Chromium加载维护HTML，使用当前1.30.1真实生活领域runAction/view核对点灯、收起、库存减少/增加、四区合法槽位、未确认不写状态、单次在途、防重复、错误与显式拒绝恢复，原7分页可达、无溢出、键盘焦点、减少动画和清理。地图/绘马/衣柜三尺寸回归通过；整卡3开场/状态栏/4面板/楼层与聊天切换模拟启动通过。真实SillyTavern、Android、作者审美待验收；不标driver-accepted。

修正现有生活UI成功提示：bridge返回ok:false或accepted:false时正确报错，不再显示已记录；领域和剧情规则不变。37条世界书、正则、初始变量和既有5段轻量加载器架构保持。暂停1.39.1全局游玩修复仍不混入。

TW路由sillytavern-embedded-ui / sillytavern-card-pipeline，snapshot2026-08-18；复用ST-A0/C1/C2/C3/D7与共享设计规范。参考https://www.japan.travel/en/see-and-do/japanese-garden/，仅检查其庭院空间说明，未复制馆藏/外站图片，未声称其图片或网站交互已视觉验收。设计由现有已采纳的实绘神社风格延伸。

下一步：神社生活的手作与料理/菜圃/商店/手帐等逐页视觉设计。设置页、开场页和通用控件仍待后续统一。

