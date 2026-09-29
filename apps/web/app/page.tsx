import Link from "next/link";
import { getRecentExhibitions } from "@exhibly/db";
import { tagToHsl } from "@/lib/tagColor";
import ExhibitionCard from "./components/ExhibitionCard";
import SearchBox from "./components/SearchBox";

// 首頁沒有動態路由參數，Next.js 預設會在 build time 嘗試靜態預產生，
// 但這頁的「近期展覽」要打 DB，build 環境撈不到就整個 export 失敗。
// 強制動態渲染，改成每次 request 時才撈，不在 build time 定死。
export const dynamic = "force-dynamic";

// 精選主題：目前寫死，之後要動態化（例如撈出展覽數最多的標籤）再改成從 db 撈。
// ADR-003 之後只能挑 MOOD——SUBJECT 已經不上色，混進來會跟詳情頁/篩選頁的
// 「題材不填色」自相矛盾。色塊牆（M6）之前，這四個先頂著當首頁主題入口。
const featured = ["知性", "懷舊", "可愛", "親子"];

// 色塊牆形狀：/lab/homepage-shapes 候選 2（輕微有機）定案的數值，不是
// 這裡另外調的。四塊用同一組 H/V 各自循環位移一格——扭曲量相同、方向
// 不同，不是四組各自的亂數；位移沿用 TL/TR/BR/BL 的角序。
const FEATURED_SHAPE_H: [number, number, number, number] = [38, 24, 34, 28];
const FEATURED_SHAPE_V: [number, number, number, number] = [26, 36, 22, 40];

function rotateCorners(tuple: [number, number, number, number], shift: number) {
  return [0, 1, 2, 3].map((i) => tuple[(i + shift) % 4]);
}

function featuredBorderRadius(index: number): string {
  const h = rotateCorners(FEATURED_SHAPE_H, index);
  const v = rotateCorners(FEATURED_SHAPE_V, index);
  return `${h[0]}% ${h[1]}% ${h[2]}% ${h[3]}% / ${v[0]}% ${v[1]}% ${v[2]}% ${v[3]}%`;
}

// 微浮動：四塊各自不同週期＋不同起始 delay，永遠不會同步（同步的話看起來
// 像整區在抖，不像各自在漂）。動畫本體（transform、暫停、reduced-motion）
// 定義在 packages/ui/src/styles/globals.css 的 .featured-plaque，這裡只
// 決定每一塊的時間參數。
const FEATURED_FLOAT_DURATIONS = ["6s", "6.8s", "7.4s", "8s"];
const FEATURED_FLOAT_DELAYS = ["0s", "0.6s", "1.2s", "1.8s"];

export default async function Home() {
  // 近期展覽：依展期排序撈最近的幾筆真實資料，填補主題入口下方的空白，
  // 用跟列表頁同一顆 ExhibitionCard，不要另外刻一種卡片長相。
  const recentExhibitions = await getRecentExhibitions();

  return (
    // 內容量小（僅 11 筆展覽、4 個精選主題），刻意不用大留白撐場——
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
          中文標籤用 encodeURIComponent 編碼，避免特殊字元把 query string 打亂。
          形狀（有機圓角）跟微浮動是 M6 色塊牆定案的第一步，數值來源見上面
          FEATURED_SHAPE_*／FEATURED_FLOAT_* 的註解。 */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4 sm:gap-6">
        {featured.map((name, i) => (
          <Link
            key={name}
            href={`/list?tags=${encodeURIComponent(name)}`}
            className="group"
          >
            <div
              className="featured-plaque flex h-20 items-center justify-center p-4 text-center transition-opacity group-hover:opacity-90 sm:h-24"
              style={{
                backgroundColor: tagToHsl(name),
                borderRadius: featuredBorderRadius(i),
                animationDuration: FEATURED_FLOAT_DURATIONS[i],
                animationDelay: FEATURED_FLOAT_DELAYS[i],
              }}
            >
              <span className="text-lg font-semibold tracking-tight text-gray-800 sm:text-xl">
                {name}
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* 搜尋入口，放在精選主題色塊之後、近期展覽之前，不是標語正下方——
          擺在標語下面會把搜尋變成主動線，跟「用主題逛台灣的展覽」的定位
          衝突；放在色塊後面才讀作「沒有你要的主題？直接搜展名」，是逛
          主題之外的第二條路，服務的是已經知道要找哪檔展的人。
          直接複用列表頁的 SearchBox，不重寫一份：它送出時本來就是
          router.push 到 /list?q=...，且只有目前網址已帶 ?tags= 才會
          保留，首頁網址不帶 tags，行為天生就是「導到 /list?q=、不帶
          tags」，跟這裡要的一致。細邊框、不上品牌橙，不搶四片色塊的
          視覺重心（ADR-001：介面克制到近乎隱形）。 */}
      <div className="mt-8 sm:mt-10">
        <SearchBox />
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
                tags={e.tags.map((et) => et.tag)}
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