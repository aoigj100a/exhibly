import Link from "next/link";
import { prisma } from "@exhibly/db";
import { tagToHsl } from "@/lib/tagColor";
import ExhibitionCard from "./components/ExhibitionCard";

// 首頁沒有動態路由參數，Next.js 預設會在 build time 嘗試靜態預產生，
// 但這頁的「近期展覽」要打 DB，build 環境撈不到就整個 export 失敗。
// 強制動態渲染，改成每次 request 時才撈，不在 build time 定死。
export const dynamic = "force-dynamic";

// 精選主題：目前寫死，之後要動態化（例如撈出展覽數最多的標籤）再改成從 db 撈。
const featured = ["動漫", "療癒", "原住民文化", "當代藝術", "沉浸式", "好拍"];

export default async function Home() {
  // 近期展覽：依展期排序撈最近的幾筆真實資料，填補主題入口下方的空白，
  // 用跟列表頁同一顆 ExhibitionCard，不要另外刻一種卡片長相。
  const recentExhibitions = await prisma.exhibition.findMany({
    orderBy: { startDate: "asc" },
    take: 6,
    include: { tags: { include: { tag: true } } },
  });

  return (
    // 內容量小（僅 11 筆展覽、6 個精選主題），刻意不用大留白撐場——
    // 留白靠首屏標題的字級對比撐開，網格本身維持緊湊，避免顯得像沒做完。
    <main className="mx-auto max-w-4xl px-6 py-12 sm:px-8 sm:py-16">
      <header className="mb-10 text-center sm:mb-14">
        {/* 純西文品牌字才用 font-display（Space Grotesk）；
            它沒有中文字符，不能套到其他中文標題上 */}
        <h1 className="font-display text-5xl font-bold tracking-tight sm:text-6xl">
          Exhibly
        </h1>
        <p className="mt-3 text-sm text-muted-foreground sm:text-base">
          用主題逛台灣的展覽
        </p>
      </header>

      {/* 精選主題：背景色改用 tagToHsl（跟展牌、Badge 同一個函式），空白框變成
          一片主題色 + 標題，跟全站的展牌視覺語言同源。深色字沿用展牌的
          text-gray-800，可點提示改用透明度變化（色塊本身已經是視覺重量，
          不需要再疊邊框）。
          中文標籤用 encodeURIComponent 編碼，避免特殊字元把 query string 打亂。 */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6">
        {featured.map((name) => (
          <Link
            key={name}
            href={`/list?tags=${encodeURIComponent(name)}`}
            className="group"
          >
            <div
              className="flex h-20 items-center justify-center p-4 text-center transition-opacity group-hover:opacity-90 sm:h-24"
              style={{ backgroundColor: tagToHsl(name) }}
            >
              <span className="text-lg font-semibold tracking-tight text-gray-800 sm:text-xl">
                {name}
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* 近期展覽：跟列表頁同一套卡片，維持 Swiss 網格、手機收成一欄 */}
      {recentExhibitions.length > 0 && (
        <section className="mt-14 sm:mt-20">
          {/* 字級介於 h1 主標與卡片標題之間，建立清楚的「區塊標題」層級 */}
          <h2 className="text-2xl font-bold tracking-tight text-muted-foreground sm:text-3xl">
            近期展覽
          </h2>
          <div className="mt-8 grid grid-cols-1 gap-x-8 gap-y-12 sm:mt-10 sm:grid-cols-2 sm:gap-y-14 lg:grid-cols-3">
            {recentExhibitions.map((e) => (
              <ExhibitionCard
                key={e.id}
                id={e.id}
                name={e.name}
                imageUrl={e.imageUrl}
                tags={e.tags.map((et) => et.tag.name)}
              />
            ))}
          </div>
        </section>
      )}

      {/* 全站唯一的關鍵 CTA，套品牌橙；hover 加深不是換色，維持橙作為
          點綴、不喧賓奪主的份量。 */}
      <div className="mt-8 text-center sm:mt-10">
        <Link
          href="/list"
          className="text-sm font-medium text-primary underline underline-offset-4 hover:text-primary/80"
        >
          看全部展覽
        </Link>
      </div>
    </main>
  );
}