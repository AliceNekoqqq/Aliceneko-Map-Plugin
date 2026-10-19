# 御影神社项目状态

当前候选：1.29.3开场巴卫立绘修复。唯一续接：releases/1.29.3/README.md、manifest.json、card-source.json。

用户截图已定位：paintPortrait非零尺寸分支item未定义；女主src赋值后抛错，阻断巴卫src赋值。src/scene-host.mjs与冻结scene.mjs修复，rendererRevision使旧同目录API不再被复用。新增31套带尺寸绘制测试，联合模拟补上非零尺寸与双人图片断言。旧版错误可复现，新版通过。

运行模块固定提交f3644de071e659f7fb445fce8072abcbb80b10fa；交付卡：cards/巴卫_御影神社_v1.29.3_开场立绘修复版.json，392296字节，SHA256 3cdb4911aaa716cdf8572c3fd9ce6cc26542a5f6e90665da3e5a2ce34486eda9；离线加载/绘制/联合测试通过。真实手机酒馆图片解码/布局及用户存档验收pending。旧版卡保留。
