# 御影神社项目状态

当前候选：1.29.2标题页启动修复。唯一续接：releases/1.29.2/README.md、manifest.json、card-source.json。1.29.1修复了远程加载器，但漏检标题页ready()引用未定义publish；真实执行start的JSDOM联合测试已复现并验证最小修正。维护源src/scene-host.mjs同步修复，旧版本不覆盖。

tests/startup-integration.test.cjs覆盖三开场、内联子JS、状态栏、四面板、重播/聊天切换及测试存档保留。真实酒馆无法连接，验收pending。

下一步：发布本次源码，以不可变提交重新生成1.29.2卡并验证Git/交付文件相同，保存给用户；再等待目标酒馆导入结果。
