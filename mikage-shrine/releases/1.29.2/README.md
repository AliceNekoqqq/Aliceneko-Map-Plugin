# 1.29.2 标题页启动修复候选

实际执行1.29.1的scene模块后复现：标题页ready()把不存在的publish函数作为mikage:dev-changed监听器，抛出ReferenceError，未运行到scheduleShow()，因此没有自动出现标题页。原加载器检查只替换start计数，未覆盖这个错误。

最小修改：标题页的该事件及卸载回调改为已有的syncAppearance，符合本事件用于刷新测试衣装的职责。修复src/scene-host.mjs及本目录冻结scene.mjs。其余四个模块沿用1.29.1的原路径与哈希；卡片继续五段固定Git入口。人物、世界书、规则及31套衣装未变。

复现与回归（隔离模拟环境）：

```
npm install --prefix /tmp/mikage-debug jsdom@26 zod@4.1.12 --no-audit --no-fund
MIKAGE_DEBUG_DEPS=/tmp/mikage-debug/node_modules node mikage-shrine/tests/startup-integration.test.cjs 1.29.1 --expect-opening-failure
MIKAGE_DEBUG_DEPS=/tmp/mikage-debug/node_modules node mikage-shrine/tests/startup-integration.test.cjs 1.29.2
```

测试实际执行mvu/panels/scene/minigames的start；使用真实Zod4.1.12校验、模拟酒馆助手API及MVU数据读写、JSDOM跨frame宿主结构。子标题页、状态栏、面板内联JS也执行；字库加载由FontFace替身处理，不请求字体/图片。外部MVU bundle导入由替身处理，不能证明其真实网络和运行能力。

通过：MVU ready；三种开场选择；玩家宏展开；状态栏自动挂载及重复扫描不重复；四个面板子JS初始化/各入口/关闭；已开始开场只读重播；换聊天清理旧界面；木材测试值13保留；无新warning/error。三份新建模拟聊天各有一笔原有迁移器补schema的写入；选择开场只改消息文本，测试未涉及用户真实存档。

依赖：与1.29.1相同，无新增玩家安装项。JSDOM/Zod的npm安装仅用于开发测试。没有用户酒馆可连接页面，因此真实SillyTavern/手机DOM、布局、图片加载、MVU事件和模型生成仍pending，不能标记driver-accepted。

TavernWeave：sillytavern-embedded-ui实施；sillytavern-card-pipeline构建；runtime-debug负责实机边界。快照2026-08-18，相关A0、C1/C2/C10已读取，无视觉改版、无全局配置修改。
