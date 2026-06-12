# 小学奥数学习系统

一个本地可用的静态小学奥数学习系统，覆盖学习地图、模块例题、闯关练习、每日一练、随机组卷、错题本和家长视图。

## 功能

- 支持按年级学习，也支持按知识点主线学习
- 按年级与难度筛选学习模块
- 查看典型例题与解析
- 完成闯关练习并获得即时反馈
- 自动生成每日一练
- 按当前筛选条件随机组卷
- 将错题加入错题本，并支持错题重新组卷
- 在家长视图查看练习次数、正确率、错题数量和模块进度
- 在练习题下展开提示、分步讲解和常见错误提醒
- 提供继续练习、今日任务、错题复习等快捷入口
- 根据错题、最近答错和模块完成度智能推荐每日一练
- 支持多个学生档案，分别保存进度和错题
- 提供练习工具栏，支持只看未完成、跳题和批量展开讲解
- 扩展植树、鸡兔同笼、行程、年龄、平均数等奥数知识点
- 从数学本源出发展示核心模型、表征方式、迁移提醒和本质易错点
- 按知识点内在逻辑组织学习谱系，展示先修知识和后续连接
- 为核心知识点提供可播放的动画讲解，帮助学生看见模型变化过程
- 为每个知识点生成“未开始 / 学习中 / 需复习 / 已掌握”的掌握度状态
- 为题目和错题记录生成错因标签，让错题本升级为错因诊断
- 提供成长值、等级、徽章墙和下一目标，增强学生学习成就感

## 本地运行

这是一个纯静态项目，可以直接打开 `index.html` 使用。

如果需要运行工程检查与测试，请安装 Node.js 20 或以上版本，然后执行：

```bash
npm test
npm run check
```

## 题库结构

题库位于 `data.js`，每个模块包含：

```js
{
  id: "patterns",
  title: "找规律",
  grades: ["一年级", "二年级", "三年级"],
  description: "学会观察数字、图形和排列中的变化规律。",
  examples: [
    {
      title: "数字递增规律",
      difficulty: "基础",
      question: "数列 2，5，8，11，( )，下一项是多少？",
      answer: "14",
      analysis: "每次都增加 3，所以 11 后面是 14。"
    }
  ],
  practices: [
    {
      id: "patterns-1",
      title: "闯关 1",
      difficulty: "基础",
      prompt: "4，7，10，13，( )",
      answer: "16",
      explanation: "每次增加 3。"
    }
  ]
}
```

练习题可以额外提供 `acceptedAnswers`，用于配置更宽容的同义答案：

```js
{
  id: "sum-diff-1",
  answer: "12 和 8",
  acceptedAnswers: ["12,8", "8,12", "8 和 12"]
}
```

练习题也可以直接提供学习支持字段；如果题目没有配置，`learningSupport.js` 会按模块自动补齐默认提示：

```js
{
  id: "patterns-1",
  hints: ["先看每次相邻两项相差多少。"],
  solutionSteps: ["计算相邻差。", "确认规律。", "推出下一项。"],
  commonMistakes: ["只看最后两个数就猜答案。"]
}
```

练习题也可以显式提供 `mistakeTags`，用于标注常见错因；未显式配置时，`mistakeDiagnosis.js` 会按模块和题目关键词自动推断：

```js
{
  id: "tree-planting-1",
  mistakeTags: ["point-interval", "remainder-position"]
}
```

`contentExpansion.js` 会在 `data.js` 加载后追加扩展知识模块，适合继续分批增加题库而不直接改动原始大题库。

`knowledgeContinuityExpansion.js` 会继续追加承上启下的桥梁模块，例如周期、枚举、容斥、归一归总和盈亏问题。

`knowledgeTopology.js` 会为模块补充 `knowledgeTopology` 字段，包含：

- `strand`：所属知识主线
- `stage`：当前学习阶段
- `prerequisiteIds`：先修模块
- `nextIds`：后续模块
- `whyNow`：为什么此时学习
- `continuity`：它如何连接前后知识

`mathEssence.js` 会为模块补充 `mathEssence` 字段，包含：

- `bigIdea`：这个知识点最核心的数学思想
- `essentialQuestion`：学习时最该反复追问的问题
- `coreModels`：可迁移的数学模型
- `representations`：推荐画图、列表、线段图等表征方式
- `transferTips`：迁移到新题时的提醒
- `misconceptions`：本质易错点
- `progression`：从理解到解题的学习路径

`conceptAnimations.js` 会为知识点补充动画讲解脚本，包含动画标题、场景类型、分步旁白和每一步的可视化数据。

`masteryModel.js` 会根据完成率、正确率、错题本、今日待复习错题和最近答错情况，为每个知识点生成掌握度状态和掌握分。

`mistakeDiagnosis.js` 会为题目和错题记录补充错因标签，并按错因汇总错题本，常见标签包括 `point-interval`、`motion-relative`、`overlap`、`average-total`、`assumption-gap` 等。

`rewardSystem.js` 会根据作答、完成、掌握、纠错、连续学习和跨知识主线探索情况计算成长值、等级、徽章和下一目标。

## 第一阶段可用性改进

本版本重点提升基础可用性：

- 新增 `answerMatcher.js`，支持更宽容的答案判定
  - 忽略常见单位，例如 `6` 与 `6 张`
  - 支持中文数字，例如 `十六` 与 `16`
  - 支持小数与分数等价，例如 `0.5` 与 `1/2`
  - 支持判断题近义回答，例如 `对/是`、`错/不是`
  - 支持多答案顺序无关，例如 `8和12` 与 `12 和 8`
- 新增 `answerHistory`，按题记录作答历史，避免单纯依赖旧统计字段
- 答题后只更新相关进度视图，减少不必要的全页重绘
- 新增 Node 内置测试与 GitHub Actions CI

## 第二阶段复习队列 MVP

错题本现在具备轻量级复习队列能力：

- 新增 `reviewScheduler.js`，负责错题复习日期调度
- 新增 `reviewQueueModel.js`，封装错题入队、出队、到期筛选和错题卷状态生成
- `app.js` 直接调用 `reviewQueueModel.js` 维护错题队列，不再依赖页面增强层
- 错题会显示复习状态：`今日待复习`、`下次复习：YYYY-MM-DD`、`已巩固`
- 错题重新组卷会优先抽取“今日待复习”的错题
- 连续答对 2 次后，该题会从复习队列中移出
- 错题再次答错时，会清零连续答对次数，并按 0 / 1 / 3 / 7 天间隔安排复习

## 第三阶段讲题与纠错

练习题现在具备轻量学习支持：

- 新增 `learningSupport.js`，为 practice 自动补齐 `hints`、`solutionSteps`、`commonMistakes`
- 对首批典型题配置了更具体的提示、步骤和易错点
- 新增 `learningSupportView.js`，在闯关练习、每日一练、随机组卷题卡中展示可展开讲解区
- 新增 `learningSupport.css`，单独维护讲解区样式

## 第四阶段产品体验优化

页面体验现在增加了轻量引导与快捷操作：

- 新增 `productExperience.js`，提供继续练习、今日任务、错题复习等快捷入口
- 新增建议学习路径卡片，帮助新用户理解使用顺序
- 支持在答案输入框内按 Enter 直接提交
- 答错后自动展开讲解区，减少用户寻找讲解的成本
- 记录最近浏览位置，方便返回上次学习区域
- 新增 `productExperience.css`，单独维护体验增强样式

## 第五阶段自适应每日一练

每日一练现在会优先根据薄弱点推荐题目：

- 新增 `adaptivePractice.js`，根据错题本、最近答错、题目正确率和模块完成度计算推荐分
- `app.js` 的每日一练改为调用自适应推荐模型，不再单纯按日期随机抽题
- 每日一练题卡会显示推荐原因，例如 `错题回访`、`最近答错`、`薄弱模块`、`新题探索`
- 保留稳定哈希作为同分题目的打散方式，让同一天的推荐结果保持稳定
- 新增 `tests/adaptivePractice.test.js` 覆盖推荐排序与去重逻辑

## 第六阶段多学生档案 MVP

系统现在支持本地多学生学习档案：

- 新增 `studentProfiles.js`，管理学生档案列表和当前学生
- 在 `app.js` 加载前映射 `mathlearning-progress-v2` 到当前学生专属存储 key
- 默认学生会兼容读取旧版全局进度，避免升级后丢失原有记录
- 首页显示当前学生切换器，并支持新增学生
- 不同学生的完成记录、错题本、每日一练、随机组卷状态互相隔离
- 新增 `studentProfiles.css` 和 `tests/studentProfiles.test.js`

## 第七阶段练习过程体验

模块练习区现在增加了更顺手的练习工具：

- 新增 `practiceExperience.js`，在闯关练习区显示练习工具栏
- 支持“只看未完成”，帮助学生集中处理剩余题目
- 支持“跳到下一题”，快速定位下一道未完成题
- 支持一键展开或收起全部讲解区
- 答对后自动聚焦下一题，减少重复滚动和点击
- 新增 `practiceExperience.css` 和 `tests/practiceExperience.test.js`

## 第八阶段题库与知识点扩展

题库新增 5 个常见奥数知识点：

- 植树问题
- 鸡兔同笼
- 行程问题
- 年龄问题
- 平均数问题

本阶段通过 `contentExpansion.js` 追加内容，共新增 15 个例题和 30 道练习题；每道新增练习都配置了 `hints`、`solutionSteps`、`commonMistakes`，并通过 `tests/contentExpansion.test.js` 检查内容结构、题目数量和题目 ID 唯一性。

## 第九阶段数学本源层

知识点质量现在从“会做题”进一步升级到“理解数学本源”：

- 新增 `mathEssence.js`，为知识模块补充核心思想、核心追问、核心模型、表征方式、迁移提醒、本质易错点和学习路径
- 覆盖找规律、和差倍、几何、逻辑，以及植树问题、鸡兔同笼、行程问题、年龄问题、平均数问题
- 对未显式配置的模块提供通用数学建模框架，避免模块缺少本源说明
- 新增 `mathEssenceView.js`，在模块学习页把本源理解展示在例题之前
- 新增 `mathEssence.css` 和 `tests/mathEssence.test.js`

## 第十阶段知识点内在逻辑与连贯性

知识点库现在按内在逻辑继续扩展和重排：

- 新增 `knowledgeContinuityExpansion.js`，补充 5 个承上启下的桥梁知识点：周期问题、有序枚举、容斥初步、归一归总问题、盈亏问题
- 新增 15 个例题和 30 道练习题，每道练习继续配置提示、步骤和易错点
- 新增 `knowledgeTopology.js`，把知识点组织为六条主线：观察与周期、计数与集合、数量关系、变化与效率、空间与离散结构、逻辑推理
- 对模块补充先修知识、后续连接、当前阶段、学习理由和连贯性说明
- 新增 `knowledgeTopologyView.js`，在模块学习页展示“知识谱系”卡片
- 新增 `knowledgeTopology.css`、`tests/knowledgeContinuityExpansion.test.js` 和 `tests/knowledgeTopology.test.js`

## 第十一阶段学习入口双模式

学习地图现在支持两种入口：

- 新增 `learningModes.js`，提供“按年级学习 / 按知识点学习”切换
- 按年级学习时保留原有年级、难度筛选和年级分组路径
- 按知识点学习时自动切换到全部年级，并按知识主线分组展示模块
- 知识点模式会继续尊重当前难度筛选
- 点击知识点卡片会进入同一个模块学习详情，复用原有例题、练习、错题、进度逻辑
- 新增 `learningModes.css` 和 `tests/learningModes.test.js`

## 第十二阶段知识点动画讲解

知识点页现在支持可播放的动画讲解：

- 新增 `conceptAnimations.js`，为核心知识点配置动画脚本、场景类型、步骤旁白和可视化数据
- 覆盖找规律、周期、枚举、容斥、和差倍、归一归总、盈亏、鸡兔同笼、平均数、行程、年龄、植树、几何、逻辑等模块
- 新增 `conceptAnimationView.js`，在模块学习页展示“动画讲解”卡片，支持上一步、下一步和自动播放
- 新增 `conceptAnimations.css`，提供柱状变化、周期节点、枚举树、集合重叠、线段模型、替换模型、运动轨道、点间隔等动效样式
- 对未显式配置动画的模块提供通用“读题—建模—计算”动画兜底
- 新增 `tests/conceptAnimations.test.js` 覆盖动画配置、兜底、步骤索引和数据克隆

## 第十三阶段知识点掌握度模型

系统现在会为每个知识点生成掌握度状态：

- 新增 `masteryModel.js`，根据完成率、正确率、错题本、今日待复习错题和最近答错计算掌握状态
- 状态分为：`未开始`、`学习中`、`需复习`、`已掌握`
- 同时生成掌握分、完成率、正确率、错题数、待复习数和状态原因
- 新增 `masteryView.js`，在按年级学习地图、按知识点学习地图、模块详情页和家长视图展示掌握度
- 新增 `mastery.css` 和 `tests/masteryModel.test.js`

## 第十四阶段错因标签系统

错题本现在从“题目列表”升级为“错因诊断”：

- 新增 `mistakeDiagnosis.js`，定义错因标签字典、模块默认标签、关键词推断和错题汇总逻辑
- 题目会自动补充 `mistakeTags`，也支持在题目数据中显式配置错因标签
- `reviewQueueModel.js` 会在错题入本时写入 `mistakeTags`
- 新增 `mistakeDiagnosisView.js`，在错题本中展示错因诊断、在单个错题上显示“可能错因”、在家长视图展示错因排行
- 新增 `mistakeDiagnosis.css` 和 `tests/mistakeDiagnosis.test.js`

## 第十五阶段成长奖励系统

系统现在提供更强的学习成就感：

- 新增 `rewardSystem.js`，根据作答、答对、完成题数、连续学习、知识点掌握、错题修复和跨知识主线探索计算成长值
- 设计 7 个成长等级，例如“小小探索者”“模型建造师”“思维小达人”“数学小导师”
- 设计徽章墙，包含勇敢开始、首胜达成、三日连学、错题修复、掌握一城、跨域探索等徽章
- 新增 `rewardSystemView.js`，在首页展示等级、成长值、连续学习、下一目标和徽章墙，在家长视图展示成长奖励概览
- 新增升级和新徽章奖励提示，让学生每次进步都有即时反馈
- 新增 `rewardSystem.css` 和 `tests/rewardSystem.test.js`

## 后续方向

- 拆分题库与渲染逻辑，提升维护性
