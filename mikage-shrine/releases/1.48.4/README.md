# 1.48.4 规则一致性候选

从已交付1.48.3继续，修复作者已授权的矛盾文本与玩法提示。变化为8条世界书中的17处有原文保护的替换，正文行级差异45行；完整旧文、新文和理由见changes.json。已审定的77处运行时文案原样保留。

- 契约：统一自愿缔约、神职前提与言灵效力的说明；尚未与玩家缔约时仍保留御影神社神使职责。神职、契约、信任和恋爱各自按事实确认。
- 地区与身份：章节只提供开放地区和调查线索，第一章的缔约、入校与后续剧情结果各自经玩家选择推进；瑞希、鞍马群像素材按玩家实际身份使用。
- 关系：亲近80以上仍可保持无恋爱心动的搭档关系；照料、道谢和涉险例句使用有情境依据的互动，避免示例把强制行为塞回正文。
- 祭典：小型、双人、白昼或提早收场都适用相同结案门槛；人潮、屋台、礼装和神职称呼依实际情况使用。开场/收场/M05仍分轮完成，设施4和实际举办/结束的原结算保持。
- 回忆册：正文门槛从旧11件同步现行3/7/10，旧藏继续保留。历史版本说明只描述当时版本。

## 范围与恢复

Local Fix / Local Fix Only，模块边界为世界书叙事规则。基线源sha256为16e52147fd99b0b681b0a5d9ed6a8c91128187d4578756b1eb627242e82981d4。只替换changes.json中的确切原文，替换次数均为1；反向替换并恢复版本标识后与1.48.3源JSON完全相同。停止条件为原文或次数不符、受保护内容差异或任何检查失败。回滚使用1.48.3历史成卡。

五个远程模块及全部素材哈希、正则、初始化、字段、奖励成本和事件结算保持；未合入暂停1.39.1实验，未新增建设扩展。新版本通过manifest引用现有固定模块，成卡继续使用5个Git固定提交轻量加载器。卡型为MVU/Zod与嵌入界面混合卡；结构/规则/正则和加载入口在卡中，MVU/schema、面板、场景、小游戏及tomoe代码远程加载，图片字体沿用原固定资源。宿主沿用酒馆助手、MVU及原模板/HTML能力；CDN为顺序回退，非新增互斥区域脚本。未新增安装项。

## 验证

1.48.3基线衣装路线、旧暂停档、回忆册实际门槛与77项审定文案检查通过。新源JSON与17处操作反向恢复比较通过，五模块逐字节及sha256相同。10条启用动态模板使用EJS3.1.10编译/渲染通过；关系亲近与心动边界10×10×双方确认2共200组，缺状态及非生成场景通过；旧版高亲近/低心动的爱意冲突可复现，新版已去除。新manifest的三开场、状态栏、四面板、换楼/分支/聊天模拟启动通过，原木材13保留。

普通local-fix文件预算会把整份新发布快照计为新增文件，因此超过2文件/80行；未声称默认预算通过。正文实际变化45行；本次生成物总预算8文件/5000行，全工作树含暂存与未跟踪文件均纳入检查，结果见VALIDATION.json。所有历史版本保留。

## 构建适配器

沿用项目tools/build_release_card.py；其源码已检查，输入为明确source、manifest与40位Git提交，输出为新JSON，支持--dry-run，拒绝覆盖旧输出。它校验5模块哈希并注入固定加载入口，不修改远程模块。没有新增构建引擎。

```sh
python mikage-shrine/tools/build_release_card.py --source mikage-shrine/releases/1.48.4/card-source.json --manifest mikage-shrine/releases/1.48.4/manifest.json --commit 0d00176b6a226f504cb51c7837568fdb017de96d --output <NEW_JSON> --dry-run
python mikage-shrine/tools/build_release_card.py --source mikage-shrine/releases/1.48.4/card-source.json --manifest mikage-shrine/releases/1.48.4/manifest.json --commit 0d00176b6a226f504cb51c7837568fdb017de96d --output <NEW_JSON>
node mikage-shrine/tests/startup-integration.test.cjs 1.48.4
node mikage-shrine/tests/release-loader.test.cjs <NEW_JSON> mikage-shrine/releases/1.48.4/card-source.json 1.48.4
```

TW实际路由已执行：sillytavern-card-pipeline与code-quality-workflow；snapshot2026-08-18；ST-A0/A2/D1/D4及运行、沟通、打包和范围检查指引。无设计候选。宿主为Codex云端。自动与模拟检查不代表真实酒馆、Android或实际模型输出验收；当前仍为candidate。建设自由扩展与实际组装提示预算继续保留后续项。

GitHub上传首次被自动审批阻止，作者随后明确授权同步原仓库新分支。运行模块与1.48.3逐字节相同，成卡固定已公开提交0d00176b6a226f504cb51c7837568fdb017de96d，导入使用不依赖本轮待上传提交。后续上传目标为AliceNekoqqq/Aliceneko-Map-Plugin的codex/rule-consistency-1.48.4分支，本轮已获作者明确授权，最终同步身份以远端核对为准。
