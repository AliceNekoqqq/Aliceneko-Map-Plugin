# 1.49.28 · 任务档案候选版

作者：红豆粉。承接1.49.27，新增第六个远程酒馆助手脚本“任务档案”。

默认随任务结案正文生成结构化摘要，零额外模型请求。受理、暂停、恢复及结案取自当前分支的既有任务事件；记录双方相关原文，归档最终选择、实际结果、持续影响、未决事项和知情人物。结案阶段才加入归档要求，平时仅提供至多两份相关档案。

右下角或脚本按钮“任务档案”提供查看、编辑、批量补档与设置。独立API可填写OpenAI兼容接口地址、Key与模型；支持结案自动整理，默认关闭。手动整理一批一至五项，只调用一次；输入超限在请求前拦截。失败保留原文范围及待补状态，自动模式同一任务版本只尝试一次；手动按钮可重试。测试连接按钮会调用一次。未提供真实凭证，本轮验证全部使用模拟响应，付费API调用为零。

档案保存在聊天变量的独立命名空间；Key仅保存在本机浏览器设置。专用世界书以“御影任务档案-”开头，作为独立、未绑定的副本，条目保持停用。模块按当前聊天、所选消息页、有效任务来源与人物地点筛选后注入相关事实，因此档案副本不自动挤入所有对话，也不改原角色世界书。

原文修改、重生成或回到结案前时，来源不匹配的档案退出后续提示；返回原分支可以恢复有效档案。手修或额外API补档仍保留原标记来源，以防旧结尾摘要重新为修改后的前文背书。旧聊天缺少任务起止来源时显示记录不足；继续保留既有结案事实。资料的语义准确度仍取决于模型，可在档案面板修改。

本次39条世界书内容、MVU schema及初始数据、经济/设施/章节规则、前五个脚本和原正则、所有美术与衣装保持。新增两条正则只过滤档案控制块的显示与历史提示。新卡仍使用固定Git提交的轻量加载器，代码、图片未嵌入成卡。

## 验证

- `node mikage-shrine/tests/task-archive.test.mjs`：生命周期、暂停范围、选择保留、去重、原文编辑、swipe、回档恢复、非法/提前标记、手修、字数预算与世界书归属。
- `node mikage-shrine/tests/task-archive-engine.test.mjs`：真实既有领域引擎的M01显现、接取、调查、商议、行动、结案接入；领域拒绝的结案保持未归档。
- `node mikage-shrine/tests/event-id-hair.test.cjs`：原有编号、服装、出行、点灯、购买、双事件与EJS发型回归。
- `node mikage-shrine/tests/task-archive-browser.test.mjs`：Chromium模拟宿主，320/375/1000宽度、零调用默认流程、手修/设置、独立API请求、凭证隔离、跨聊天、迟到响应、清理与自动失败仅一次。

Node测试依赖既有zod/ejs；浏览器测试需要Playwright与Chromium，可通过`MIKAGE_CHROMIUM_EXECUTABLE`指定浏览器路径。它们属于开发依赖，玩家无需安装。

构建：`python3 mikage-shrine/tools/build_task_archive.py [--dry-run]`。随后使用原`tools/build_release_card.py`，传入本版card-source、manifest及已同步完整提交SHA，生成新路径成卡。维护来源是src/task-archive-core.mjs与src/task-archive-runtime.mjs；release/archive.mjs由构建器组合。

API基准：Tavern Helper 4.8.19声明，固定提交36d8889a99f1cf09d3d1f8aabd0eba33975dc64d；涉及getChatMessages、getVariables、updateVariablesWith、injectPrompts、generateRaw与worldbook API。运行时会检查关键能力并释放事件与提示。实际用户宿主版本尚未取得，不声称已通过真实酒馆验收。

尚待真实SillyTavern、Android、线上CDN执行与实际模型的摘要语义验收。本版是可导入候选卡，离线及模拟通过不替代实机结果。
