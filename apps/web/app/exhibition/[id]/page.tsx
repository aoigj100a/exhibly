import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getExhibitionById as getExhibitionByIdFromDb,
  getExhibitionStatus,
} from "@exhibly/db";
import { Badge } from "@exhibly/ui/components/badge";
import ExhibitionCover from "../../components/ExhibitionCover";
import { tagToHsl } from "@/lib/tagColor";

// generateMetadata 跟頁面元件在同一次 request 裡都要這筆展覽資料。
// Next.js 只會幫忙合併 fetch() 呼叫，Prisma 查詢不算在內，兩邊各自
// call 會變成同一個 id 查兩次 DB。用 React cache() 包一層，同一次
// render pass 對同個 id 的呼叫共用同一個 promise，第二次不會真的送查詢。
const getExhibitionById = cache(getExhibitionByIdFromDb);

// 日期格式化：明確用 UTC 讀，避免執行環境本地時區把「純日期」往回推一天。
// 存進 SQLite 的是 UTC 午夜（例：2026-08-01T00:00:00Z），
// 用 timeZone:"UTC" 讀出來就會拿回當初寫進去的那一天。
const dateFmt = new Intl.DateTimeFormat("zh-TW", {
  year: "numeric",
  month: "long",
  day: "numeric",
  timeZone: "UTC",
});

// 場館 / 城市可能為 null，過濾掉再用「・」串起來，避免出現「・台北」這種開頭。
// generateMetadata 的 fallback 描述也要組「地點」，抽出來讓兩邊共用同一份邏輯。
function formatPlace(exhibition: { venue: string | null; city: string | null }) {
  return [exhibition.venue, exhibition.city].filter(Boolean).join("・");
}

// 同上，抽出來給 generateMetadata 共用，避免另寫一份日期格式化邏輯。
function formatDateRange(exhibition: { startDate: Date; endDate: Date | null }) {
  return exhibition.endDate
    ? `${dateFmt.format(exhibition.startDate)} – ${dateFmt.format(exhibition.endDate)}`
    : `${dateFmt.format(exhibition.startDate)} 起`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const exhibition = await getExhibitionById(id);

  // 查無展覽：不拋錯、也不特別設定 metadata，把 404 交回頁面元件的
  // notFound() 處理，Next.js 對 404 頁面自己有預設 metadata。
  if (!exhibition) {
    return {};
  }

  const description = exhibition.description
    ? truncateDescription(exhibition.description, 150)
    : fallbackDescription(exhibition);

  return {
    title: `${exhibition.name}｜Exhibly`,
    description,
  };
}

// 簡介換行壓成空白、trim 頭尾，超過 maxLength 字截斷並加「…」。
function truncateDescription(description: string, maxLength: number) {
  const collapsed = description.replace(/\s+/g, " ").trim();
  return collapsed.length > maxLength
    ? `${collapsed.slice(0, maxLength)}…`
    : collapsed;
}

// 簡介為 null 時的 fallback：用展期・地點組一句，不落回全站預設描述。
// place 理論上不會是空字串（dev 庫每一筆都有 venue/city），但這裡仍防一下，
// 避免真的遇到兩者皆空時留下「展期起・」這種孤零零的分隔符。
function fallbackDescription(exhibition: {
  startDate: Date;
  endDate: Date | null;
  venue: string | null;
  city: string | null;
}) {
  const place = formatPlace(exhibition);
  const dateRange = formatDateRange(exhibition);
  return place ? `${dateRange}・${place}` : dateRange;
}

export default async function ExhibitionDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const exhibition = await getExhibitionById(id);

  if (!exhibition) {
    notFound();
  }

  // 過期展／未開展的頁面照常開得了——不 redirect、不 notFound，
  // 有人存了書籤、搜尋引擎還索引著，從列表消失不代表從系統消失。
  const status = getExhibitionStatus(exhibition);

  const place = formatPlace(exhibition);
  const dateRange = formatDateRange(exhibition);

  return (
    <main className="mx-auto max-w-4xl px-6 py-12 sm:px-8 sm:py-16">
      {/* 圖／展牌是這頁的主視覺，比例維持 16:9 不變 */}
      <ExhibitionCover
        src={exhibition.imageUrl}
        alt={exhibition.name}
        tags={exhibition.tags.map((et) => et.tag)}
        className="aspect-[16/9] w-full"
        sizes="(min-width: 672px) 672px, 100vw"
      />

      {/* current（現正展出）是預設狀態，標了是噪音，所以不顯示任何東西；
          ended／upcoming 才提示，樣式克制（純文字、muted 色），不搶展覽名與主視覺 */}
      {status !== "current" && (
        <p className="mt-8 text-sm font-medium text-muted-foreground sm:mt-12">
          {status === "ended" ? "本展已結束" : "即將開展"}
        </p>
      )}

      {/* 展覽名當大標，是這頁的主角 */}
      <h1
        className={`text-3xl font-bold tracking-tight sm:text-5xl ${
          status !== "current" ? "mt-2" : "mt-8 sm:mt-12"
        }`}
      >
        {exhibition.name}
      </h1>

      {/* 資訊區：label/value 兩欄網格，手機收成上下堆疊。呼應美術館展牌
          說明卡（標題／媒材／年代並列）的排版邏輯，缺值的欄位直接不渲染那一列。 */}
      <dl className="mt-8 grid grid-cols-1 gap-x-8 gap-y-5 border-t border-border pt-8 sm:mt-10 sm:grid-cols-[120px_1fr] sm:gap-y-6 sm:pt-10">
        {/* startDate 一定有值直接顯示；endDate 可能是 null（常設展），
            這組 dt/dd 固定渲染，只是文案跟著 dateRange 換 */}
        <dt className="text-sm font-medium text-muted-foreground">展期</dt>
        <dd className="text-sm">{dateRange}</dd>

        {/* 以下皆為 nullable，有值才渲染那一組 dt/dd */}
        {place && (
          <>
            <dt className="text-sm font-medium text-muted-foreground">地點</dt>
            <dd className="text-sm">{place}</dd>
          </>
        )}

        {exhibition.openingHours && (
          <>
            <dt className="text-sm font-medium text-muted-foreground">
              開放時間
            </dt>
            <dd className="text-sm leading-relaxed whitespace-pre-line">
              {exhibition.openingHours}
            </dd>
          </>
        )}

        {/* isFree 與 price 是兩個獨立欄位，各自判斷是否有值。
            isFree 為 null 的語意是「不知道免不免費」，不是「這筆沒有
            票價資訊」——不能用它的空值去否決 price 已知的事實，
            那樣會把資料庫裡有的資訊藏起來。 */}
        {(exhibition.isFree !== null || exhibition.price) && (
          <>
            <dt className="text-sm font-medium text-muted-foreground">票價</dt>
            <dd>
              {exhibition.isFree !== null && (
                /* 淡彩（tonal）風格：bg-primary/10 淡橘底 + 深字，對比 ~13:1，
                   遠高於實心橘底配深字的 5.1:1，跟旁邊的淡莫蘭迪標籤調性一致。
                   variant 用 outline 當底，不用 default（不然要跟它自帶的
                   bg-primary/text-primary-foreground 打架）。 */
                <Badge
                  variant="outline"
                  className={
                    exhibition.isFree
                      ? "border-transparent bg-primary/10 text-sm font-semibold text-gray-800"
                      : "text-sm font-semibold"
                  }
                >
                  {exhibition.isFree ? "免費" : "收費"}
                </Badge>
              )}
              {exhibition.price && (
                <p
                  className={`text-sm whitespace-pre-line ${
                    exhibition.isFree !== null ? "mt-1.5" : ""
                  }`}
                >
                  {exhibition.price}
                </p>
              )}
            </dd>
          </>
        )}

        {exhibition.tags.length > 0 && (
          <>
            <dt className="text-sm font-medium text-muted-foreground">標籤</dt>
            {/* ADR-003：氛圍(MOOD)維持實心莫蘭迪色塊；題材(SUBJECT)不填色，
                改 #標籤名 的框線樣式——差別在「有沒有填色」，不是配色本身，
                題材不吃色相額度。 */}
            <dd className="flex flex-wrap gap-2">
              {exhibition.tags.map((et) =>
                et.tag.category === "MOOD" ? (
                  <Badge
                    key={et.tagId}
                    variant="secondary"
                    className="text-gray-800"
                    style={{ backgroundColor: tagToHsl(et.tag.name) }}
                  >
                    {et.tag.name}
                  </Badge>
                ) : (
                  <Badge
                    key={et.tagId}
                    variant="outline"
                    className="border-gray-400 text-gray-600"
                  >
                    #{et.tag.name}
                  </Badge>
                ),
              )}
            </dd>
          </>
        )}

        {exhibition.description && (
          <>
            <dt className="text-sm font-medium text-muted-foreground">簡介</dt>
            <dd className="text-sm leading-relaxed whitespace-pre-line">
              {exhibition.description}
            </dd>
          </>
        )}
      </dl>

      {/* 官方連結從 dl 移出來跟提示綁在一起：提示每一頁都有、位置固定，
          連結永遠緊鄰提示，讀到「去確認公告」的人下一眼就看得到能點去哪。
          留在 dl 裡的話，沒有 officialUrl 的頁面提示會孤零零落在別處，
          有的頁面則等於出現兩個官方連結入口。 */}
      <p className="mt-8 text-sm text-muted-foreground sm:mt-10">
        展期與票價可能變動，前往前請先確認官方公告
        {exhibition.officialUrl && (
          <>
            {" "}
            {/* 提示語本身在手機寬度就快占滿一行，連結接在後面一定會換行。
                nowrap 讓它整塊掉到下一行，而不是斷在詞中間、底線也跟著斷兩截。 */}
            <a
              href={exhibition.officialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4 whitespace-nowrap hover:text-foreground"
            >
              前往官方網站
            </a>
          </>
        )}
      </p>
    </main>
  );
}