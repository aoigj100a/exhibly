import { getExhibitions } from "@exhibly/db";
import DeleteButton from "./components/DeleteButton";

export const dynamic = "force-dynamic";

// 日期格式化比照 web 詳情頁：明確用 UTC 讀，避免執行環境本地時區
// 把「純日期」往回推一天。
const dateFmt = new Intl.DateTimeFormat("zh-TW", {
  year: "numeric",
  month: "long",
  day: "numeric",
  timeZone: "UTC",
});

export default async function AdminHome() {
  const exhibitions = await getExhibitions();

  return (
    <main className="mx-auto max-w-5xl px-6 py-12 sm:px-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Exhibly Admin</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          共 {exhibitions.length} 筆展覽
        </p>
      </header>

      {/* 資料列，不是卡片牆：每筆一橫列，靠 divide-y 拉出列與列的分隔線，
          方便一眼掃過很多筆。 */}
      <div className="rounded-lg border border-border">
        <div className="flex items-center gap-4 border-b border-border px-4 py-3 text-sm font-medium text-muted-foreground">
          <div className="min-w-0 flex-1">展覽名稱</div>
          <div className="w-56 shrink-0">日期</div>
          <div className="w-24 shrink-0 text-right">操作</div>
        </div>
        <div className="divide-y divide-border">
          {exhibitions.map((e) => (
            <div key={e.id} className="flex items-center gap-4 px-4 py-3">
              <div className="min-w-0 flex-1 truncate font-medium">
                {e.name}
              </div>
              <div className="w-56 shrink-0 whitespace-nowrap text-sm text-muted-foreground">
                {dateFmt.format(e.startDate)} – {dateFmt.format(e.endDate)}
              </div>
              <div className="w-24 shrink-0 text-right">
                <DeleteButton id={e.id} name={e.name} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
