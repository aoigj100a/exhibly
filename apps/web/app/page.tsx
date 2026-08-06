import Link from "next/link";
import { tagToHsl } from "@/lib/tagColor";

// 精選主題：目前寫死，之後要動態化（例如撈出展覽數最多的標籤）再改成從 db 撈。
const featured = ["動漫", "療癒", "原住民文化", "當代藝術", "沉浸式", "好拍"];

export default function Home() {
  return (
    // 內容量小（僅 11 筆展覽、6 個精選主題），刻意不用大留白撐場——
    // 留白靠首屏標題的字級對比撐開，網格本身維持緊湊，避免顯得像沒做完。
    <main className="mx-auto max-w-4xl px-6 py-12 sm:px-8 sm:py-16">
      <header className="mb-10 text-center sm:mb-14">
        <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
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

      <div className="mt-8 text-center sm:mt-10">
        <Link
          href="/list"
          className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
        >
          看全部展覽
        </Link>
      </div>
    </main>
  );
}