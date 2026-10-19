# 御影神社项目状态

当前候选：1.29.3开场巴卫立绘修复。唯一续接：releases/1.29.3/README.md、manifest.json、card-source.json。

用户截图已定位：paintPortrait非零尺寸分支item未定义；女主src赋值后抛错，阻断巴卫src赋值。src/scene-host.mjs与冻结scene.mjs修复，rendererRevision使旧同目录API不再被复用。新增31套带尺寸绘制测试，联合模拟补上非零尺寸与双人图片断言。旧版错误可复现，新版通过。

待发布源码到Git、用不可变提交构建1.29.3卡并核对最终文件。真实手机酒馆图片解码/布局及用户存档验收pending。旧版卡保留。
