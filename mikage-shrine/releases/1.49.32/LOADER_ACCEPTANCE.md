# 1.49.32 加载器浏览器补验

2026-10-31。沿上一轮花笺美化交付，继续检验导入卡里的六个固定 Git 加载器。48 个 Chromium 用例通过，未发现需要修改加载器的问题。本轮仅新增测试与证据；可导入卡仍为 1.49.32，七份界面 GIF 继续对应同一运行源码。

| 检查 | 每个模块的观察结果 |
| --- | --- |
| 首选地址成功 | 启动一次，重复执行引导不重复订阅 |
| 首选失败 | 第二地址成功，按顺序回退 |
| 前两地址失败 | 第三地址成功，按顺序回退 |
| 首选模块版本不符 | 拒绝启动该模块，改用第二地址 |
| 三条地址失败后点重试 | 仅一份故障提示；重试使用新查询参数但固定 Git 提交不变，成功后提示消失 |
| 启动发生未声明可重试的异常 | 停在 blocked；不换地址、不重复启动、不显示可误用的重试按钮 |
| 模块明确声明可重试 | 按钮事件重用已导入模块，不重新拉取，不增加订阅 |
| 首选请求超时且迟到 | 由第二地址启动一次；迟到的首选模块不启动 |

模块包括 mvu、panels、scene、minigames、tomoe、archive；全部使用最终成卡的原始加载器内容，每个用例位于独立的 helper iframe。小游戏共享加载桥也验证了父窗口发布、ensureReady 和 pagehide 清理。

## 证据范围

- Chromium 真实执行动态 ESM 导入。远程模块字节与 manifest SHA256 一致，用于实际读取 VERSION、SCRIPT_ID 和 start 导出。
- 地址响应由测试拦截，用以稳定制造故障；start 由诊断适配器代替。没有声称真实业务模块已在此测试中启动。
- 超时用例只在诊断 iframe 内把生产 15000ms 定时器映射为 80ms，并让首选响应迟到 260ms。最终卡和加载器没有改动。
- 48 用例无未处理页面异常、无非预期 HTTPS 请求、无真实模型调用。预期的网络失败与已捕获启动异常属于测试输入。
- 不计为线上 CDN、真实 SillyTavern、手机或实际模型语义验收。现有项目记录没有目标酒馆地址及版本，后续实机验收需要可访问实例及其 Tavern Helper/MVU 版本。

## 复现

使用项目已有 Playwright/Chromium 环境，设置 CODEX_PRIMARY_RUNTIME_NODE_MODULES、MIKAGE_CHROMIUM_EXECUTABLE、LD_LIBRARY_PATH；可用 MIKAGE_LOADER_EVIDENCE 指定 JSON 证据输出路径。

```sh
node mikage-shrine/tests/packed-loader-browser.test.mjs /absolute/path/to/巴卫_御影神社_v1.49.32_花笺手帖美化版.json
```

逐用例结果见 `LOADER_BROWSER_EVIDENCE.json`。

## 当前卡身份

- 版本：1.49.32
- 卡 SHA256：0405a99739a1d39310e2dca26e847aac80e9ca84ad2d8b3d11cb201234de6581
- 运行源码固定提交：5a5202a04d52009f6712d121c7fd5fb30c960a17
- 原七份界面 GIF 和 39 世界书条目、5 正则、6 加载器保持本轮检验前的内容。
