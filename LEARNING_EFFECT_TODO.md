# 学习效果优化 TODO（二年级及以上）

## 目标范围

- [x] 目标学生限定为二年级及以上。
- [x] 不补充一年级内容，不以低幼启蒙为主线。
- [x] 优化目标从“继续堆题”转为“路径清晰、支架有效、错因可修复、迁移能发生”。

## P0：学习地图

- [x] 拆分 `综合拓展` 主线
  - 实现：新增 `learningEffectEnhancements.js`，将扩展模块重新归入数论与整除、计数与组合、数量关系建模、变化与效率、逻辑与策略、图形与空间、观察与周期等主线。
  - 验收：`npm run validate:content` 会阻止 `综合拓展` 再成为主要内容容器。

- [x] 为二年级以上建立主路径
  - 实现：新增 `LEARNING_EFFECT_GRADE_PATH`，覆盖二年级到六年级的主路径建议。
  - 验收：每个模块有 `learningPlan.targetGrades`、目标能力、阶段和下一步能力。

- [x] 给每条主线设置阶段目标
  - 实现：每条主线都有 `phase`，例如“入门模型 -> 标准题型 -> 变式迁移 -> 综合应用”。
  - 验收：内容快照和校验脚本会检查学习计划存在。

## P1：练习支架

- [x] 替换通用提示
  - 实现：按主线生成题型化提示，替换大量“先圈关键词、转化算式”的泛提示。
  - 验收：`validate-content` 检查通用提示复用题数必须不超过 100。

- [x] 为 12 个核心模块补“例题渐隐”
  - 实现：核心模块生成 `exampleFading`，包含完整例题、半完成例题、仿练和迁移提醒。
  - 覆盖模块：找规律、和差倍、归一归总、盈亏、行程、工程、比例、几何计数、枚举、容斥、抽屉、逻辑推理。

- [x] 给模块增加“掌握标准”
  - 实现：每个模块增加 `learningPlan.goals`、`learningPlan.masteryCriteria`、`nextAbility`。
  - UI：模块详情页显示学习目标、过关标准和下一站。

## P1：错因补救闭环

- [x] 为错因标签绑定补救动作
  - 实现：新增 `remediationCatalog`，覆盖 `arithmetic-care`、`missing-cases`、`sum-diff-relation`、`motion-relative`、`work-unit`、`efficiency-sum` 等核心错因。
  - UI：讲解区新增“错因补救”分组。

- [x] 增加错因复盘卡能力
  - 实现：练习数据中增加 `remediationTags`，讲解区能按错因显示补救动作。
  - 验收：`validate-content` 校验补救标签必须存在于补救目录。

- [x] 区分“答案错”和“方法选错”
  - 实现：练习题增加 `methodChoices`；答题记录保存 `methodChoice`、`recommendedMethod`、`methodMatched`。
  - UI：练习卡、每日练习、组卷题卡均显示“先选方法”。

## P1：迁移与混合训练

- [x] 增加主线阶段小测元数据
  - 实现：新增 `LEARNING_EFFECT_REVIEW_SETS`，每条主线生成混合小测配置。
  - 验收：`validate-content` 检查 review sets 必须存在。

- [x] 增加“先选方法再答题”
  - 实现：所有练习卡支持方法选择，答题历史记录方法选择结果。
  - UI 行为测试已覆盖答题流程。

- [x] 增加近似题型辨析基础
  - 实现：每道题增加 `modelType`、`targetSkill`、`transferLevel`、`diagnosticGoal`，为归一 vs 工程、行程 vs 火车过桥、枚举 vs 排列组合等辨析训练提供数据基础。

## P2：内容质量与数据治理

- [x] 为题目增加教学元数据
  - 字段：`targetSkill`、`modelType`、`transferLevel`、`diagnosticGoal`、`remediationTags`、`methodChoices`、`tieredHints`。

- [x] 增加内容质量检查脚本
  - 实现：增强 `scripts/validate-content.js`，检查学习计划、分层提示、方法选择、教学元数据、补救标签、通用提示复用率和主线分布。

- [x] 建立二年级以上内容覆盖矩阵
  - 实现：`content-snapshot.json` 增加主线、计划覆盖、通用提示数、review set 数等快照指标。
  - 命令：`npm run snapshot:content`、`npm run check:content-snapshot`。

## P2：产品呈现优化

- [x] 模块页增加学习目标区
  - 实现：模块详情页的路径区展示当前阶段、学习目标、过关标准和下一站。

- [x] 练习页增加提示分层
  - 实现：讲解区显示“分层提示”，包含题型识别、模型提示、关键步骤。

- [x] 家长报告增加能力画像
  - 实现：导出的学习报告增加 `abilityByStrand`、`methodChoice` 和 `nextStepAdvice`。

## 验收命令

- [x] `npm run check`
- [x] `npm run validate:content`
- [x] `npm run check:content-snapshot`
- [x] `npm test`
- [x] `npm run build`
- [x] `npm run check:bundle`
- [x] `npm run smoke`
- [x] `npm run test:ui`
- [x] `npm run audit:ui`

## 成功指标

- [x] `综合拓展` 不再是主要内容容器。
- [x] 通用提示复用题数下降到 100 以下。
- [x] 每个二年级以上主线都有清晰阶段目标。
- [x] 核心错因有补救动作。
- [x] 核心模块有例题渐隐元数据。
- [x] 家长报告能说明能力主线、方法选择和下一步建议。
