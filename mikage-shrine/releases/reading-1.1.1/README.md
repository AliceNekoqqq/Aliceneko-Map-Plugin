# 正文美术 1.1.1 · Git 轻量模块

图片独立存于 `assets/reading-v2/`，固定素材提交 `fb8538d08732d8bd0388f268ffdb1b28fd5711f1`。三项素材与原内置卡图片逐字节一致；无须再上传副本。模块只包含代码、CSS与小型程序绘制SVG，不包含Base64图片。

维护源：`src/reading.mjs`、`src/reading.css`、`src/reading-frames.css`、`src/time-scenes.json`；构建器 `tools/build_reading.py`。构建只写显式指定的新输出目录；`--dry-run`只校验并报告。以稳定UUID替换加载器名称/内容，保留作者其他脚本元数据。

本模块从已交付1.1.1候选维护源构建，修正失效素材提交。开场、普通回复、夜读与原四主两次入口布局保持候选行为。原生正文、世界书、MVU和六个功能加载器不改动。

验证：JavaScript语法、可重复构建、正文DOM回归、固定Git加载器回归；打包器验证未知字段保存、重复UUID与Base64阻止写入。最终角色卡须固定到本模块的真实提交，并另行校验线上文本与SHA256。

本发布为候选：真实SillyTavern、手机视觉和触控仍待验收。测试用jsdom/Zod为本地开发依赖，不进入卡片，也不增加用户安装步骤。
