# 1.49.0 月之森衣装商店候选

承接1.48.4，面向新聊天。统一店名「月之森和裁舍」，由长崎素世经营。店主身份、工坊与本卡购买经济属于作者指定的跨作品改编，原作出处与改编边界仅保留在卡外SOURCES.md，新增模型词条只写世界内事实与操作规则。

## 已实现

基础工作装5套开局可用；生活装改为16件商品（17个外观记录），每件2或3奉纳。巴卫school与school-human共用一次购买；玩家校服独立购买。神域纪念装保留主线/专属支线获取。31个actor+id、全部立绘/行走图及外部角色立绘、衣装记忆和显式换装接口保持。当前运行配置为本目录config.json，购买目录为shop-config.json；历史src/wardrobe-config.json不作为本版加载来源。

世界书49采用双轨获取规则，57同步五条专属支线，83新增素世，84提供按关键词触发的动态商品目录。旧生活装支线WQ01/03/04/05从当前配置移除，U02/U03/U04只提供原地区进度说明。原杂货店浅井千代仍是杂货店街坊，旧服装赠送设定已撤下。

## 商品与来源

| 商品sku | 名称 | 奉纳 | 保留外观ID |
| --- | --- | ---: | --- |
| player:festival | 祭典浴衣 | 2 | player:festival |
| player:sakura | 樱染散策 | 2 | player:sakura |
| player:seabreeze | 潮音夏服 | 2 | player:seabreeze |
| player:forest | 山茶披肩 | 2 | player:forest |
| player:swim | 海盐晴蓝 | 2 | player:swim |
| player:school | 樱坂晴日 | 3 | player:school |
| player:gym | 学园体操服 | 2 | player:gym |
| tomoe:festival | 祭典羽织 | 2 | tomoe:festival |
| tomoe:aoba | 青岚羽织 | 2 | tomoe:aoba |
| tomoe:journey | 潮汐远行 | 2 | tomoe:journey |
| tomoe:grove | 林间行装 | 2 | tomoe:grove |
| tomoe:swim | 晴汐浪纹 | 2 | tomoe:swim |
| tomoe:school | 樱坂薄暮 | 3 | tomoe:school, tomoe:school-human |
| tomoe:city | 绀夜归途 | 3 | tomoe:city |
| tomoe:winter | 檐下薄雪 | 2 | tomoe:winter |
| tomoe:butler | 学园祭执事服 | 3 | tomoe:butler |

| 纪念来源 | 保留衣装 | 条件 |
| --- | --- | --- |
| 主线M05 / UCLEAR | player:ceremony、tomoe:moon | 原终章实际结案 |
| WQ02 / UW-YAKO | tomoe:yako | M03后，R07龙宫旧匣与野狐衣纹复原 |
| WQ06 / UW-KAGURA | player:kagura、tomoe:kariginu | M04后，R09祭礼处整理神乐礼装 |
| WQ07 / UW-ANCIENT | player:heian-travel | M03后，R06古衣样复原 |
| WQ08 / UW-WEDDING | player:shiromuku、tomoe:wedding | M05后，R09礼服样衣委托 |
| WQ09 / UW-KOZUCHI | tomoe:chibi | M03后，R08万宝槌旧档与自愿展示方案 |

衣装收录与神职、记忆、穿越、关系、真实婚礼及形态变化分别采用实际剧情。通用浴衣保留festival ID，本卡没有yukata或独立水手服ID。

## 购买与存档契约

实际货币路径是/神社/奉纳；/衣橱/已解锁为{编号,角色,衣装}对象数组。两者由领域脚本维护。正文模型仅追加/记录/事件/-，类型「衣装购买」，对象为目录sku、来源为「月之森和裁舍」、方式为仅含sku的JSON字符串，资源=无、数量=0、耗力=0。编号接续原事件，天数采用当前日。运行时按固定目录价验证并扣款，追加资源流水，从持久事件重建已解锁对象；模型直接改余额或衣橱会被拒绝。

购买前已有存档地点须为R02月之森店内。正文先完成到店状态，再在后续确认选购；同一次事件夹带传送和购买会被拒绝。已有商品、未知sku、错误来源、篡改售价、余额不足与修缮预留不足均拒绝结算。失败时前态保留。UI沿现有衣柜显示售价和到店意向，店内有明确确认/取消；在途防重，失败可重试。购买在新的可见消息快照落盘，前一楼保留。

成交仅收录，当前穿着保持。正文由素世奉茶、介绍并包装，归社依实际行程；饮茶和试衣由玩家选择。离店状态下按钮只把到店意向写入聊天输入框，发送与行程继续由玩家决定。本版不承担旧存档迁移；开发者独立测试副本同步保留全31套解锁。

## 构建与验证

维护增量：src/wardrobe-shop-domain.js、src/wardrobe-shop-ui.js、tools/build_moonforest_shop.py；从1.48.4固定manifest读取并核验哈希，输出新目录，支持--dry-run并拒绝覆盖已有输出。打包沿用tools/build_release_card.py，五段加载器固定实际Git源码提交；minigames与tomoe模块保持原文件。没有新增宿主安装项或远程服务。

运行三项moonforest测试：领域与Zod、实际模块模拟启动、Chromium实际HTML交互。覆盖全部商品、五条纪念支线、持久恢复、切衣校服变体、防重与失败、前楼保留、三开场/四面板与320/375/1000宽度。77处审定文案、31套映射、衣装形态世界书77与正则保持；11条启用EJS模板检查生成/显示与缺状态。UI新增中文均由原字体覆盖。

发布清单和完整新快照超过默认5文件/200行的staged-refactor预算；使用明确的发布物预算24文件/16000行，并检查全工作树与基线合并差异。结果见VALIDATION.json。范围限于衣装获取的领域/schema、衣柜交互、世界书/配置三个相连边界及对应构建验证文件；原素材和暂停实验隔离。

TW路由：sillytavern-card-pipeline、code-quality-workflow、sillytavern-database-rolecards、worldbook-design-and-writing；snapshot2026-08-18，ST-A0/A2/D1/D4/C4/C7及A3/A4相关设置章节。沿用MVU消息层存储，未引入外部数据库。候选状态：真实SillyTavern导入、Android与实际模型生成仍待验收；离线和模拟结果各按其证据范围记录。
