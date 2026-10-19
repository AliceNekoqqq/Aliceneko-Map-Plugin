# 1.29.3 开场巴卫立绘修复候选

用户截图：女主显示，巴卫位置出现alt说明文字。复现：立绘容器有非零宽高时，paintPortrait.update引用未声明的item.imageRendering。开场先设置女主src再调用paintPortrait，抛错后循环中断，巴卫img连src都没有赋值。上一轮JSDOM的clientWidth/clientHeight为0，跳过此分支，造成漏检。

修复src/scene-host.mjs和冻结scene.mjs：update按当前record.actor/outfit获取对应item，保持原比例/脚底/图片资源。新增rendererRevision=1.29.3，避免衣装目录fingerprint没变时复用宿主中旧的有错绘图API；相同修复版本继续复用。卡片仍为五段固定Git加载，其他四模块沿用原路径/哈希。世界书、文案、规则、衣装和存档不变。

新增tests/portrait-paint.test.cjs：带180×340容器逐一绘制31套立绘，验证地址、非零尺寸、定位、渲染参数及metadata；先装旧API，再装新API，验证旧实例会替换、相同新实例复用。旧1.29.2 --expect-failure复现item is not defined；新1.29.3通过。

startup-integration.test.cjs现在也给portrait-frame提供非零尺寸，并断言开场巴卫/女主都有src与布局；原有三开场/面板/生命周期/跨楼层数据模拟测试继续通过。JSDOM仍没有真实图像解码、浏览器CSS布局或手机宿主，不能宣布实机通过。

开发检查依赖与命令沿用1.29.2 README，将版本参数改1.29.3。玩家无新增安装项。真实酒馆待导入此候选、重新加载脚本后检查巴卫/女主与衣橱图片。
