## 1.46.0 御影更衣间候选交付（2026-10-20）

承接1.45.0绘马与1.44.0地图。新增实绘更衣台、纸衣签选衣回弹、切换人物和衣影展开、香囊金色微光、四方向按钮与行走预览。行走图按需等待真实素材preloadWalk；失败有提示，关闭/切衣/减少动态效果取消预览，延迟完成不重开。图册滚动与键盘焦点在重绘中保留。原31套资源、解锁、校服伪装、纪念名与衣装支线沿用；不改变正式玩法、世界书、正则与初始变量。

实绘素材：assets/ui/wardrobe-v146-room.webp，生成底图经WebP压缩222432字节，固定素材提交3efb8124a1d7fda3e622b34395bd141196301d4e。生成要求：正面日式樱木更衣台、中央留白供原人物素材叠加、梅紫帷幔、漆金狐纹与香囊，无人物/文字。旧图未覆盖。

已验证：320/375/1000真实Chromium维护HTML上的装饰/四向/实际行走帧、只读锁定预览、重复点击/待保存禁用、失败重试、校服伪装、文本惰性渲染、减少动画、无横向溢出与清理；地图和绘马同尺寸回归通过；三开场/状态栏/四面板/楼层与聊天切换模拟启动通过。真实酒馆、Android及作者审美待验收。暂停的1.39.1全局游玩修复仍不混入。

维护入口：src/wardrobe-desk.css、src/wardrobe-desk.js、tools/build_wardrobe_desk.py。构建从releases/1.45.0/manifest.json指定面板派生，输出releases/1.46.0；支持--asset-commit和--dry-run。打包用tools/build_release_card.py，以1.46.0/card-source.json和manifest.json及固定源码commit生成新JSON，拒绝覆盖旧成卡。JSON仍为5段轻量加载器；宿主和远程依赖沿用既有路径。不交付PNG。

TW路由：sillytavern-embedded-ui / sillytavern-card-pipeline；snapshot 2026-08-18；ST-A0/C1/C2/C3/D7与共享设计标准；无新框架、无新状态系统。参考只阅读馆藏说明与页面，未声称实物图片/网站交互视觉验收：
- https://www.metmuseum.org/art/collection/search/58421 （衣桁与屏风的空间组合）
- https://www.metmuseum.org/art/collection/search/40471 （木漆与金色细节材质）
未复制外部馆藏图片。最终候选为人工与真实宿主验收准备，不标driver-accepted。

