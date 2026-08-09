import Link from "next/link";
import { getTagsWithExhibitionCount } from "@exhibly/db";
import NewTagForm from "./NewTagForm";

export const dynamic = "force-dynamic";

const CATEGORY_LABEL: Record<string, string> = {
  SUBJECT: "題材",
  MOOD: "氛圍",
};

export default async function TagsPage() {
  const tags = await getTagsWithExhibitionCount();

  return (
    <main className="mx-auto max-w-5xl px-6 py-12 sm:px-8">
      <header className="mb-8">
        <Link
          href="/"
          className="text-sm text-muted-foreground hover:underline"
        >
          ← 返回列表
        </Link>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">標籤管理</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          共 {tags.length} 個標籤，依展覽數多到少排序。可以新增標籤，開關／改名／刪除都還沒做。
        </p>
      </header>

      <div className="mb-8">
        <NewTagForm />
      </div>

      {/* 單一表格不分區塊：展覽數是這頁的主要排序依據，題材跟氛圍混排
          才看得出「哪個標籤整體用最多」，分類只當一欄輔助資訊即可，
          分組反而會把兩邊各自排序、打散掉數量排名。 */}
      <div className="rounded-lg border border-border">
        <div className="flex items-center gap-4 border-b border-border px-4 py-3 text-sm font-medium text-muted-foreground">
          <div className="min-w-0 flex-1">標籤</div>
          <div className="w-20 shrink-0">分類</div>
          <div className="w-24 shrink-0">選單狀態</div>
          <div className="w-20 shrink-0 text-right">展覽數</div>
        </div>
        <div className="divide-y divide-border">
          {tags.map((tag) => (
            <div key={tag.id} className="flex items-center gap-4 px-4 py-3">
              <div className="min-w-0 flex-1 truncate font-medium">
                {tag.name}
              </div>
              <div className="w-20 shrink-0 text-sm text-muted-foreground">
                {CATEGORY_LABEL[tag.category] ?? tag.category}
              </div>
              <div className="w-24 shrink-0 text-sm text-muted-foreground">
                {tag.isListed ? "顯示中" : "已隱藏"}
              </div>
              <div className="w-20 shrink-0 text-right text-sm text-muted-foreground">
                {tag._count.exhibitions}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
