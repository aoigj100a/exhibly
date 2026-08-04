# Exhibly 台灣展覽平台

以主題標籤搜尋台灣各地展覽的平台。使用者可從「題材」與「氛圍」兩種主題入口切入，篩選出感興趣的展覽並查看詳情。

🔗 **Demo**：https://exhibly-web.vercel.app

## 功能

- 首頁精選主題入口，依題材（插畫、科技藝術…）與氛圍（療癒、懷舊…）分類
- 依主題標籤篩選展覽列表
- 展覽詳情頁：日期、地點、售票資訊與主題標籤

## 技術棧

- **Monorepo**：Turborepo + pnpm
- **前端**：Next.js（App Router）、React、Tailwind CSS v4、shadcn/ui
- **資料層**：Prisma 7（driver adapter 架構）
- **資料庫**：本地開發 SQLite → 正式環境 Supabase PostgreSQL
- **部署**：Vercel

## 本地開發

```bash
pnpm install
pnpm dev
```

資料庫設定請參考 `packages/db`。

---

> 仍在開發中。完整的架構說明與技術決策紀錄將於後續補上。