# Commit 規範

## 格式

遵循 Conventional Commits：

\`\`\`
<type>(<scope>): <subject>

<body>
\`\`\`

## Type

- `feat` 新功能
- `fix` 修 bug
- `chore` 建置、設定、套件相關
- `docs` 文件
- `refactor` 重構（不改行為）
- `style` 純排版

## Scope

對應 monorepo 的套件位置：`db`、`web`、`admin`、`types`、`root`

## Subject

- 用中文
- 祈使句，描述「做了什麼」而非「做過什麼」
- 結尾不加句號
- 50 字以內

## Body

- 只在需要解釋「為什麼」時才寫
- 重點放在決策理由，不是複述改了哪些檔案
- 換行前空一行

## 範例

\`\`\`
chore(db): 建立 packages/db 套件並初始化 Prisma

採用本地 SQLite 而非 Supabase，因為 M0 的目標只是打通資料
管線，雲端連線設定屬於維運知識，延後到 M6 一次處理。
\`\`\`

\`\`\`
feat(db): 新增 seed 腳本並塞入五筆真實展覽
\`\`\`

## 注意事項

- 一次 commit 只做一件事，不要把不相關的改動混在一起
- 不要在 commit message 提到 Claude 或 AI 協作
- 提交前確認 `dev.db`、`generated/`、`.env` 沒有被加入