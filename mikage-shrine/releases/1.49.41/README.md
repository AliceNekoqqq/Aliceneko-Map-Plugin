# 巴卫 1.49.41 · 正文美术v2轻量候选

可导入文件：card.json，397234字节，SHA256 `de6fd8c5c5e3326eb926c9829e17d4733a778424137be75224d7220c9f3441f0`。相对5198198字节内置版减少约92.36%。原内置版与历史发布保留。

正文模块：reading-1.1.1，34797字节，固定提交 `f82c888edaa0ad53178fd69d7401226bee7c7ea6`；SHA256 `ff3de2a8a21958cd2f3b8a724f566c26338d22fedb116d8f0b5dfa993acdfe40`。

三张PNG单独存于 `mikage-shrine/assets/reading-v2/`，固定提交 `fb8538d08732d8bd0388f268ffdb1b28fd5711f1`；图片原字节与内置版完全一致，线上下载与SHA256均通过。卡与模块不含Base64图片，运行时按固定Git/CDN地址取图。

## 与作者稿的差异

基准权威卡blob `2b3c010dc46dd8210909be5045540370c44268df`。只修改顶层/data版本号和阅读脚本UUID `942e5145-090d-52b2-8e13-455609375d17` 的名称、content。41条世界书、5条正则、六个旧脚本、阅读组件其他元数据和全部未知字段逐字段保持一致。

## 依赖与验证

继续使用原有SillyTavern和酒馆助手环境，卡内七个原有脚本槽与正则均保留；原MVU/结构与远程依赖选择不变。新版正文只改显示层；没有新增用户安装步骤。开发模拟依赖不进入发布包。

已执行：模块与七个加载器JS语法、重复构建一致性、实际阅读模块DOM、旧模块iframe联合模拟、Git原文校验备用、成卡JSON与字段差异、体积门槛、未知元数据保持、Base64与重复UUID拒绝写入。详细结果见verification.json。

线上线路逐项结果见network-checks.json。主CDN与Fastly线路在本环境返回403；testingcf CDN线路200且SHA256、JavaScript MIME与CORS检查通过，GitHub原文备用下载也成功且SHA256一致。加载器保留三条CDN和经SHA256校验后导入的Git原文备用，不会取消校验。图片使用已验证的独立素材CDN。真实用户网络可能不同。

真实SillyTavern导入执行、手机视觉和触控仍待验收，本包状态为candidate。可回退到历史1.49.40卡；世界书和MVU数据结构不迁移。

## 构建适配记录

在仓库根目录运行 `python3 mikage-shrine/tools/build_reading.py --out <新目录> --dry-run` 后去掉dry-run构建模块。提供 `--commit <已发布模块提交> --card authoring/current-card.json --out <新目录>` 生成组件与成卡；已有输出目录会拒绝写入。构建预检失败时不会创建目录。

成卡执行 `python3 mikage-shrine/tools/audit_card_size.py <卡路径> --strict`。本次模块与成卡分两次提交，固定真实提交后才生成最终卡。
