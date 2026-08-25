# CLAUDE.md

## Project context

- **Monorepo**：Turborepo + pnpm
- **前端**：Next.js（App Router）、React、Tailwind CSS v4、shadcn/ui
- **資料層**：Prisma 7（driver adapter 架構）
- **資料庫**：開發環境 Docker PostgreSQL / 正式環境 Supabase PostgreSQL
- **部署**：Vercel

## Environments

- **Production**：<https://exhibly-web.vercel.app/>
- **Development**：local development

### Domain Rules

- 展覽日期以UTC午夜為單位
- 「結束日期 = null」表示展覽沒有已知的結束日期
- 展期狀態的「今天」以 Asia/Taipei 的 calendar date 判斷，而不是 server local time

## Development Workflow

1. 先確認 task scope
2. 分析現有 implementation
3. 若涉及架構或行為決策，先提出方案
4. 實作最小必要變更
5. 執行相關驗證
6. 回報修改內容與驗收結果
7. 不主動進入下一個 task

## Collaboration Rules

- 一次只處理目前 task，不主動進入後續 task
- 小型、明確、符合既有 pattern 的修改可以直接實作
- 涉及架構、資料模型、API contract、domain behavior 等重要決策時，先提出方案與 trade-off，等待確認後再實作
- 發現原 task scope 不足以安全完成時，先停下來說明
- 不因「順手」進行未要求的 refactor
- 不確定既有設計意圖時，先查專案文件，再提出問題

## Explanation Rules

- 實作完成後，說明「改變了什麼、為什麼、哪些行為保持不變」
- 遇到複雜概念，優先用目前專案的具體程式碼與資料流解釋
- 不需要提前解釋尚未執行的後續設計

## Verification

- 不以「程式碼完成」或「build 成功」視為 task 完成
- 行為變更必須有明確驗收條件
- 修改資料查詢時，驗證正常案例與邊界案例
- 涉及 production 行為時，確認部署後受影響的公開路徑
- Production URL 可作為唯讀驗收環境
- 未經明確要求，不修改 production 資料或執行破壞性操作
- 發現 production 異常時，優先確認影響範圍，再進行修復

## Commit 規範

### 格式

遵循 Conventional Commits：

```
<type>(<scope>): <subject>

<body>
```

### Type

- `feat` 新功能
- `fix` 修 bug
- `chore` 建置、設定、套件相關
- `docs` 文件
- `refactor` 重構（不改行為）
- `style` 純排版

### Scope

對應 monorepo 的套件位置：`db`、`web`、`admin`、`types`、`root`

### Subject

- 用中文
- 祈使句，描述「做了什麼」而非「做過什麼」
- 結尾不加句號
- 50 字以內

### Body

- 只在需要解釋「為什麼」時才寫
- 重點放在決策理由，不是複述改了哪些檔案
- 換行前空一行

### 範例

```text
chore(db): 建立 packages/db 套件並初始化 Prisma

採用本地 SQLite 而非 Supabase，因為 M0 的目標只是打通資料
管線，雲端連線設定屬於維運知識，延後到 M6 一次處理。
```

```text
feat(db): 新增 seed 腳本並塞入五筆真實展覽
```

### 注意事項

- 一次 commit 只做一件事，不要把不相關的改動混在一起
- 不要在 commit message 提到 Claude 或 AI 協作
- 提交前確認 `dev.db`、`generated/`、`.env` 沒有被加入
