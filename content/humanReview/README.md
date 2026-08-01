# 多章节人工课程审阅

每个启用章节都有独立的发布审阅清单：

- `chapter-01.json`：首章，当前已完成课程审核。
- `chapter-02.json`：深海探测行动，待课程负责人逐题签核。
- `chapter-03.json`：轨道科学计划，待课程负责人逐题签核。

自动校验不能代替课程负责人对儿童可读性、题意准确性、叙事必要性与难度递进的判断。题库调整后，可运行以下命令更新清单；已有同题号审核信息会被保留：

```powershell
node scripts/generate-human-review-template.js --all
```

逐题审阅完成后，将对应章节的 `status` 改为 `approved`，并为该章节全部 120 道题填写一条记录：

```json
{
  "questionId": "patterns-1",
  "reviewer": "课程负责人姓名",
  "reviewedAt": "2026-07-29",
  "scores": {
    "objective": 1,
    "nonTemplate": 1,
    "contextNecessary": 1,
    "progressionClear": 1,
    "reviewExecutable": 1,
    "pitfallReal": 1
  }
}
```

发布前运行严格门禁：

```powershell
$env:REQUIRE_HUMAN_REVIEW='1'; npm run validate:game
```

该命令会拒绝缺失、重复、未签核或任一项未通过的记录；三个已启用章节都必须通过才能发布。
