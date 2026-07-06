# Classic Student Workbench Design

## Goal

Rebuild the student-facing math learning UI into a classic two-column workbench:
left navigation for learning route controls, right content focused on the current
lesson and practice questions.

The default student experience must not show content unrelated to students. This
includes parent tools, paper generation, reports, backup, restore, profile
switching, reward dashboards, and product explanation panels.

## Audience

Students in grade two and above. The interface should feel calm, clear, and
study-oriented rather than playful, promotional, or administrative.

## Recommended Direction

Use a restrained, elegant study-desk visual language:

- Warm paper background and white content surfaces.
- Ink-blue text for primary hierarchy.
- Soft gold or muted blue for active state and progress markers.
- Thin dividers, compact spacing, and moderate radius.
- Large readable question text and direct answer controls.

Avoid oversized hero sections, nested cards, heavy gradients, decorative blobs,
and long explanatory text.

## Layout

Desktop and tablet:

```text
+----------------------+---------------------------------------------+
| Route sidebar        | Current lesson and questions                |
|                      |                                             |
| 二年级以上            | Current module title + progress             |
| 路线                 | Route context                               |
| 当前题目              |                                             |
| 每日练习              | Example                                    |
| 错题复习              |                                             |
|                      | Practice cards with answer inputs           |
+----------------------+---------------------------------------------+
```

Mobile:

- Collapse the sidebar into a compact top segmented navigation.
- Keep current lesson and practice questions above route browsing.
- Preserve large tap targets and readable question text.

## Content Order

Default screen order:

1. Current lesson header.
2. One example.
3. Practice questions.
4. Daily practice.
5. Wrong-book review.
6. Route browser.

Route browsing remains available, but it should not displace the active question
area from the first screen.

## Navigation

The student navigation contains only:

- 路线
- 当前题目
- 每日练习
- 错题复习

Navigation labels should be short and concrete. Do not expose parent-facing
labels in the default UI.

## Existing Functionality

Keep the existing behavior intact:

- Selecting a route module updates the active lesson.
- Answer submission updates progress and wrong-book state.
- Wrong answers open feedback and support.
- Daily practice still renders.
- Wrong-book review still works.
- Parent/admin tools may remain in the DOM for compatibility, but they must be
  hidden from the default student view.

## Testing

Update UI tests to verify:

- The default navigation uses the student-only labels.
- The current lesson panel is visible on first load.
- Parent/admin words are not visible in default body text.
- Route selection still changes the active module.
- Answer submission still records wrong answers.
- Hidden parent/admin tools remain available to tests when explicitly opened by
  script.

Run the existing validation suite after implementation:

- `npm run check`
- `npm run validate:content`
- `npm run check:content-snapshot`
- `npm test`
- `npm run build`
- `npm run check:bundle`
- `npm run smoke`
- `npm run test:ui`
- `npm run audit:ui`

## Out Of Scope

- Rewriting the math content model.
- Adding new learning modules.
- Reintroducing first-grade content.
- Adding new parent-facing workflows.
- Rebuilding route logic from scratch.
