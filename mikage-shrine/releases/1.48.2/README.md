# 1.48.2 审定文案回填候选

仅采用作者返回的已审定 XLSX 中77个修改后的F单元格，69处小游戏、4处面板、4处场景。723个原ID完整，无删除或模板参数变化。copy-edits.json记录原句/审定句与来源；input-check.json记录输入校验。未改动其他agent的绘马稿件、世界书、规则、变量、正则、衣装或玩法。

## 维护与重建

现役入口为本目录manifest.json。三个模块及HTML是冻结发布快照；不要用旧通用构建器或暂停的1.39.1 src覆盖。tools/apply_reviewed_copy.py从1.48.1现役manifest派生，校验唯一匹配及哈希，并把所有操作写入transformations.json；逆向还原必须与原基线逐字节一致。

```sh
python mikage-shrine/tools/apply_reviewed_copy.py --asset-commit b1d93e2a16cf24be9fbdef272d41ee609af328ba --dry-run
node mikage-shrine/tests/reviewed-copy.test.cjs
node mikage-shrine/tests/startup-integration.test.cjs 1.48.2
CHROMIUM_PATH=/tmp/chromium node mikage-shrine/tests/run-reviewed-browser.cjs school
```

浏览器命令支持school、market、plum、dress、wind、stealth、fox、thread、festival。每项执行320/375/1280宽度。字形补充来自OFL许可Noto Serif SC 500，保留原所需字符并补入审定稿字形；素材固定提交b1d93e2a16cf24be9fbdef272d41ee609af328ba，来源/哈希见assets/ui/copy-reviewed-v1482-font.json。字体重建工具为tools/build_reviewed_font.py。

## 验证与边界

已通过：77句唯一回填、三模块逆向逐字节还原、成卡源除版本外语义一致、世界书/正则/初始变量及MVU/tomoe不变；9套实际发布模块模型场景；Zod 4.1.12、三开场/状态栏/四面板、聊天/楼层/重载模拟启动；Chromium153下9个小游戏共27组尺寸场景，含完成路径、旧存档、拒绝存储、清理和布局断言。浏览器适配器只更新旧文案预期，保留行为断言。未重复运行整套历史发布快照断言，当前版本使用严格逆向字节校验。真实SillyTavern、Android设备及实际模型生成待作者导入验收。

成卡沿用五个Git固定提交轻量加载器，完整世界书与原初始变量/正则内嵌。先提交本目录源码，再执行：

```sh
python mikage-shrine/tools/build_release_card.py --source mikage-shrine/releases/1.48.2/card-source.json --manifest mikage-shrine/releases/1.48.2/manifest.json --commit <SOURCE_COMMIT> --output <NEW_JSON> --dry-run
# 检查后去掉 --dry-run 生成新文件
node mikage-shrine/tests/release-loader.test.cjs <NEW_JSON> mikage-shrine/releases/1.48.2/card-source.json 1.48.2
```

最终源码提交、卡片哈希与加载器检查记录见DELIVERY.json。TW路由sillytavern-card-pipeline，snapshot2026-08-18，ST-A0/A2/D1/D4及release-gate已读；候选状态不等于真实宿主验收。
