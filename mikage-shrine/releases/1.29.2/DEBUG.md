# 1.29.2 追加调试记录

结论：本轮未发现新的可复现运行代码缺陷，角色卡与运行模块不变，不生成新版本。

冻结运行提交df322df08b6f5ab88f1345d2b913edb6a12b707b；交付卡片SHA256 aef58dcf52faab934e94e3258f3a26b068449f364726c06f76d112138cb63b01，392299字节。

扩展tests/startup-integration.test.cjs：从上一轮复制子文档改为执行实际嵌套iframe中的内联JS，保留frameElement和父子桥接关系。JSDOM模拟环境，不是真实浏览器/酒馆。字体FontFace、远程MVU核心、酒馆助手及MVU读写仍为替身；使用真实Zod4.1.12。

通过的新增检查：

- 点击开场选择DOM按钮，连续点击只提交一次。
- 四面板真正展开：目标dialog/layer不隐藏，父iframe宽高均大于200且非透明；点击子文档关闭按钮移除父iframe。
- 重复更新/扫描不重复挂载；重绘消息正文后重新挂载，不改模拟数据。
- swipe变化使旧桥接失效；新桥接指向当前swipe。
- 再次启动scene模块后只有一个标题页按钮监听和一个当前状态栏。
- 三楼状态只保留最新两个界面；各界面按自身楼层读取不同木材值。
- 移除最新楼层的状态标记后旧界面清理、保留另外两个。
- 原有三开场、玩家宏、重播、切聊天清理继续通过；模拟初始木材13保留；日志无新warning/error。

传输探测：scene的cdn.jsdelivr.net/testingcf；MVU核心固定提交的testingcf/fastly；Zod4.1.12的testingcf/cdn.jsdelivr.net，共六地址均HTTP200并返回JavaScript。网络成功只证明当前环境可下载，不能证明手机可达、模块执行或宿主注册成功。

复现方式沿用README中的npm开发依赖与测试命令。先跑1.29.1 --expect-opening-failure确认旧错误会被捕获，再跑1.29.2。

真实酒馆缺口：当前可用浏览器没有酒馆页面。真实宿主扩展版本、事件时序、移动端CSS布局、图片/字体、用户原存档与模型生成未验收。本记录不能关闭driver-accepted。
