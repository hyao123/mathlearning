# GameApp 模块化拆分计划

## 目标

在不改变游戏状态、存档、奖励、题目提交和 UI 行为的前提下，拆分 `game/gameApp.js`，让入口只负责挂载、状态编排和模块组装。

## 模块边界

- `game/gameAppView.js`：图标、项目视觉、奖励展示、反馈文案和通用 DOM 工具。
- `game/gameAppRenderers.js`：地图、答题、结算、背包、挑战和项目蓝图渲染；通过上下文读取运行时状态。
- `game/gameAppInteractions.js`：答题提交、跳过/重试、章节切换、合成、返回和键盘快捷键。
- `game/gameApp.js`：依赖校验、存档初始化、运行时上下文、持久化、渲染调度和 mount/destroy 生命周期。

## 约束

- 不改变 DOM data 属性、按钮行为、键盘行为和存档字段。
- 不把答案、解析或奖励判定迁移到 UI 模块。
- 新模块使用显式上下文，避免重新引入隐式全局状态。
- 旧入口继续由 `src/game-main.js` 加载，避免影响部署入口。

## 验收

- `npm test`
- `npm run check`
- `npm run validate:release`
- `npm run test:game-ui`
- `npm run test:ui`
- `npm run build`
- `npm run check:bundle`
- `npm run smoke`
