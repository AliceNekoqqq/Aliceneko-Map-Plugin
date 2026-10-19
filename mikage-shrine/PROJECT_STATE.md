# 御影神社项目状态

当前候选：1.29.2标题页启动修复。唯一续接：releases/1.29.2/README.md、manifest.json、card-source.json。1.29.1修复了远程加载器，但漏检标题页ready()引用未定义publish；真实执行start的JSDOM联合测试已复现并验证最小修正。维护源src/scene-host.mjs同步修复，旧版本不覆盖。

tests/startup-integration.test.cjs覆盖三开场、内联子JS、状态栏、四面板、重播/聊天切换及测试存档保留。真实酒馆无法连接，验收pending。

运行模块已发布到df322df08b6f5ab88f1345d2b913edb6a12b707b；角色卡：cards/巴卫_御影神社_v1.29.2_标题页启动修复版.json；字节数392299；SHA256 aef58dcf52faab934e94e3258f3a26b068449f364726c06f76d112138cb63b01。最终卡片加载回归通过。下一步：目标酒馆导入与手机界面验收。

追加调试：releases/1.29.2/DEBUG.md。嵌套iframe模拟测试扩展到按钮点击、防连点、面板实际尺寸/关闭、重绘、swipe桥接过期、脚本重载去重、多楼层精确读取；六个CDN依赖地址HTTP200。没有修改卡片或运行模块，继续使用1.29.2；真实酒馆验收仍pending。
