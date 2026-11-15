# v1.49.39 加载修复

针对原仓库快照过大时 jsDelivr 无法稳定取得文件的问题，角色卡改为引用同仓库的轻量快照。原图片、世界书、文案和历史文件保留。权威文件为 `authoring/current-card.json`，本目录的 `card.json` 与其逐字节一致。

## 分发结构

| 内容 | 分支 | 快照文件体积 |
| --- | --- | ---: |
| 六个运行模块 | `cdn-runtime` | 1,569,912 B |
| 资源组 1 | `cdn-assets-01` | 33,553,756 B |
| 资源组 2 | `cdn-assets-02` | 33,547,286 B |
| 资源组 3 | `cdn-assets-03` | 21,590,916 B |

角色卡使用 `delivery.json` 记录的完整不可变 commit，分支只用于维护。174 个原始资源引用映射到 160 个 Git blob；复用原始 blob，图片和字体字节没有变化。`assets-map.json` 保留来源、目标、分组和 blob 的对应关系。

加载器依次尝试三个 jsDelivr 域名，均失败后 fetch 固定 commit 的 GitHub raw。备用脚本经 SHA256 验证，以 JavaScript Blob 导入，避免 raw 的 text/plain MIME 阻止 ESM。备用请求省略凭据、拒绝重定向、限制体积并超时退出；导入后清理 Blob URL。原有单次启动和部分启动失败保护保留。

开场识别兼容 MVU 追加的 `<StatusPlaceHolderImpl/>`，将两种等价开场规范到相同识别值，避免点击故事提示“标题页已过期”；状态栏等待故事选择完成后挂载。除此之外，运行模块只替换资源地址，构建器校验固定源文件哈希并验证改动范围。

## 验证

- 正常 CDN 与人为阻断全部项目脚本 CDN：各 8 组真实酒馆操作通过；项目模块测试镜像关闭。
- 六个加载器 running，新聊天 MVU 初始化、首楼选择及唯一状态栏正常。
- 安装的 EJS 扩展执行 13 条模板，使用实际消息变量，执行前后变量一致。
- 375×812 视口完成幼狐小游戏、一次性结算、关闭恢复滚动、整页刷新后记录保留。
- 绘马动作写入下一楼，先前楼层保持不变；刷新并重新打开聊天后状态保留。
- 六个最终 CDN 模块 GET 内容哈希匹配，160 个资源 HEAD 均返回 200。
- 加载器失败分支和开场标记边界测试通过；整卡打包往返一致；41 条世界书逐字段一致。

环境、传输桥边界及未覆盖范围见 `validation.json`，逐 URL 探测见 `cdn-probes.json`。未声称覆盖用户手机、所有小游戏分支或真实模型生成。

## 更新与维护

用户需要在酒馆中导入 `card.json`，选择替换/更新原角色，已安装的旧卡不会自动获得本次加载器。角色卡依赖的酒馆助手、MVU 和 EJS 插件仍需启用。

后续继续使用轻量发布快照，每组资源留在 35 MB 预算内；新媒体使用新组或重建快照。不要把运行链接改回包含全部历史资料的 main 快照。当前固定 commit 不受后续主仓库增加文件影响；网络本身仍需可达。

重新打包当前版本：

```sh
python mikage-shrine/tools/build_release_card.py \
  --source mikage-shrine/releases/1.49.39/card-source.json \
  --manifest mikage-shrine/releases/1.49.39/manifest.json \
  --commit 99136a2d0b98cf27d1f2f2ebc467b0365741faf0 \
  --output /tmp/Tomoe-v1.49.39.json
node --test mikage-shrine/tests/loader-git.test.cjs mikage-shrine/tests/opening-marker-compat.test.cjs
```

`build_cdn_delivery.py` 可根据固定旧模块、原始清单及已发布的资源映射生成新模块，拒绝未知来源和不在白名单内的代码改动。发布前检查远端权威文件 blob 与分支 head，使用带预期 SHA 的 ref 更新，避免覆盖作者的新修改。
