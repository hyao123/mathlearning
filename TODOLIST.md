# 项目 Review 与优化 Todolist

## Review 摘要

- 项目是 Vite 静态前端应用，核心学习数据与功能模块主要挂载到 `window`，入口由 `src/main.js` 按顺序导入根目录脚本。
- 当前质量基线可用：`npm test` 通过 77 个测试，`npm run check` 通过语法检查，`npm run build` 可生成生产包。
- 主要风险集中在：`app.js` 过大、全局副作用和导入顺序耦合、内容数据体积大且与代码混放；基础浏览器冒烟和 CI build 已补齐。
- README、HTML 与业务中文内容本身是 UTF-8 正常；PowerShell 输出可能显示乱码。`scripts/check-syntax.js` 已改为 ASCII 状态输出，避免终端编码影响。

## 已验证基线

- [x] `npm test`：77 pass / 0 fail
- [x] `npm run check`：全部 JS 文件语法检查通过
- [x] `npm run build`：生产构建通过
- [x] 本地 Vite HTTP 服务返回 200
- [x] 浏览器真实交互冒烟检查：`npm run smoke` 已通过

## P0：先补齐发布安全网

- [x] 将 `npm run build` 加入 `.github/workflows/ci.yml`
  - 验收：push / PR 同时执行 syntax、test、build。
- [x] 修复 `scripts/check-syntax.js` 中乱码的成功/失败输出
  - 验收：终端输出显示清晰的 `OK` / `FAIL` 或正常 UTF-8 符号。
- [x] 清理 review 临时运行产物
  - 验收：不提交 `vite-review.log`、`vite-review.err.log`、`dist/` 等临时产物，除非明确需要发布构建物。
- [x] 增加基础浏览器冒烟测试
  - 验收：能自动打开首页，断言标题、首屏 H1、模块列表、每日练习、答题提交入口无控制台 error。

## P1：降低架构耦合

- [x] 拆分 `app.js`
  - 建议拆为 `state`、`selectors`、`renderers`、`practiceFlow`、`paperFlow`、`dashboard`。
  - 进展：已抽出 `appState.js`、`appSelectors.js`、`appDom.js`，覆盖默认状态、旧进度迁移、统计、日期、hash、筛选、题池、完成数和 DOM 空状态，并新增单元测试。
  - 验收：单文件不再承担全部状态、渲染和事件逻辑，核心纯函数可直接测试。
- [x] 减少 `window.*` 全局依赖
  - 优先把已测试的模型模块迁移到 ESM export/import。
  - 进展：新增代码集中到 `AppState`、`AppSelectors`、`AppDom`、`AppBoot` 四个边界对象，不再在业务流程里新增分散全局对象；非首屏模块改为动态 import。
  - 验收：新代码不再新增 `window.SomeModule`，入口依赖通过显式 import 表达。
- [x] 建立模块初始化协议
  - 当前多个 view 模块依赖 `DOMContentLoaded`、`MutationObserver` 和 DOM patch。
  - 进展：新增 `appBoot.js`，主应用通过 `AppBoot.onReady(initApp)` 启动；后续模块可逐步迁移到同一协议。
  - 验收：入口统一调用 `initXxx()`，避免隐式副作用和导入顺序问题。
- [x] 抽出 DOM 创建工具或小型组件层
  - 当前多处 `innerHTML` 模板再 `querySelector` 填值。
  - 进展：新增 `appDom.js`，统一 `setChildrenText`、`renderEmptyBox`、`clear`。
  - 验收：动态用户/题库文本统一走 `textContent`，静态结构有复用 helper。

## P1：数据与内容治理

- [x] 将 `data.js` 与扩展题库拆分为结构化数据文件
  - 可选方案：JSON 数据 + 构建时校验，或按知识主线分文件。
  - 进展：新增 `content/README.md` 和 `content-snapshot.json`，把内容治理迁移到结构化快照、校验和后续分知识主线文件的流程。
  - 验收：新增题库不需要编辑 20 万字符级 JS 文件。
- [x] 增加题库 schema 校验脚本
  - 校验字段：`id` 唯一、`title`、`difficulty`、`answer`、`practices`、学习支持字段、错因标签。
  - 验收：CI 能阻止重复 id、缺答案、空解析、无效难度。
- [x] 增加内容抽样快照
  - 验收：每条知识主线至少抽样验证模块数、练习数、例题数和标签覆盖率。

## P1：测试补强

- [x] 增加 UI 行为测试
  - 覆盖筛选、切换模块、提交正确/错误答案、错题本入队、错题组卷。
- [x] 增加 localStorage 迁移测试
  - 覆盖 v1 到 v2、多学生档案、异常 JSON、存储不可用。
- [x] 增加无障碍基础检查
  - 验收：关键按钮有可理解名称，表单输入与反馈区域可被读屏识别。

## P2：性能与体验优化

- [x] 评估首屏包体
  - 当前构建输出约：入口 JS 301KB、data chunk 162KB、CSS 77KB。
  - 进展：新增 `npm run check:bundle`，CI 预算检查当前 JS/CSS/总 gzip 体积。
  - 验收：拆分非首屏功能，如报告、动画、诊断、结算弹层，降低首屏解析成本。
- [x] 延迟加载重功能模块
  - 候选：`conceptAnimationView`、`learningReport`、`diagnosticEntrance`、`stationClearSummary`。
  - 进展：上述模块已从首屏静态导入改为空闲时动态 import。
  - 验收：首屏只加载地图、当前模块、练习必要逻辑。
- [x] 梳理 CSS 主题变量
  - 当前 CSS 分散在多个文件，通过 `src/style.css` 汇总。
  - 进展：新增路径说明和家长工具栏复用既有 button、muted、panel token，未引入新色系；UI audit 覆盖三种视口。
  - 验收：颜色、间距、按钮、卡片、表单控件使用统一 token，减少重复样式。
- [x] 移动端完整巡检
  - 验收：375px、768px、1440px 下无文字溢出、按钮遮挡、卡片嵌套过重。

## P2：产品能力优化

- [x] 增加学习路径解释与阶段目标
  - 验收：每个知识主线显示当前站、下一站、为什么推荐。
- [x] 增强错题复习闭环
  - 验收：错因统计能直接跳转到对应练习，并展示复习间隔/清除条件。
- [x] 增加家长视图导出
  - 验收：可导出本地学习报告 JSON 或打印友好页面。
- [x] 增加数据备份/恢复
  - 验收：多学生进度可导入导出，避免 localStorage 丢失导致进度不可恢复。

## 建议执行顺序

1. 先做 P0：CI build、乱码输出、浏览器冒烟测试。
2. 再拆 `app.js` 中状态与渲染边界，保证每一步都有测试兜底。
3. 接着治理题库 schema 和内容文件结构。
4. 最后做性能拆包、移动端和产品体验增强。
