import { notFound } from "next/navigation";
import { prisma } from "@exhibly/db";
import { Badge } from "@exhibly/ui/components/badge";
import ExhibitionImage from "../../components/ExhibitionImage";
import { tagToHsl } from "@/lib/tagColor";

// 日期格式化：明確用 UTC 讀，避免執行環境本地時區把「純日期」往回推一天。
// 存進 SQLite 的是 UTC 午夜（例：2026-08-01T00:00:00Z），
// 用 timeZone:"UTC" 讀出來就會拿回當初寫進去的那一天。
const dateFmt = new Intl.DateTimeFormat("zh-TW", {
  year: "numeric",
  month: "long",
  day: "numeric",
  timeZone: "UTC",
});

export default async function ExhibitionDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const exhibition = await prisma.exhibition.findUnique({
    where: { id },
    include: {
      tags: {                   // 第一段：展覽 → ExhibitionTag（撈出所有連線）
        include: { tag: true }, // 第二段：每條線 → 它連到的 Tag（撈出標籤本身）
      },
    },
  });

  if (!exhibition) {
    notFound();
  }

  // 場館 / 城市可能為 null，過濾掉再用「・」串起來，避免出現「・台北」這種開頭
  const place = [exhibition.venue, exhibition.city].filter(Boolean).join("・");

  const dateRange = `${dateFmt.format(exhibition.startDate)} – ${dateFmt.format(
    exhibition.endDate
  )}`;

  return (
    <main className="mx-auto max-w-4xl px-6 py-12 sm:px-8 sm:py-16">
      {/* 圖／展牌是這頁的主視覺，比例維持 16:9 不變 */}
      <ExhibitionImage
        src={exhibition.imageUrl}
        alt={exhibition.name}
        tags={exhibition.tags.map((et) => et.tag.name)}
        className="aspect-[16/9] w-full"
        sizes="(min-width: 672px) 672px, 100vw"
      />

      {/* 展覽名當大標，是這頁的主角 */}
      <h1 className="mt-8 text-3xl font-bold tracking-tight sm:mt-12 sm:text-5xl">
        {exhibition.name}
      </h1>

      {/* 資訊區：label/value 兩欄網格，手機收成上下堆疊。呼應美術館展牌
          說明卡（標題／媒材／年代並列）的排版邏輯，缺值的欄位直接不渲染那一列。 */}
      <dl className="mt-8 grid grid-cols-1 gap-x-8 gap-y-5 border-t border-border pt-8 sm:mt-10 sm:grid-cols-[120px_1fr] sm:gap-y-6 sm:pt-10">
        {/* 日期一定有值（schema 為必填），直接顯示 */}
        <dt className="text-sm font-medium text-muted-foreground">展期</dt>
        <dd className="text-sm">{dateRange}</dd>

        {/* 以下皆為 nullable，有值才渲染那一組 dt/dd */}
        {place && (
          <>
            <dt className="text-sm font-medium text-muted-foreground">地點</dt>
            <dd className="text-sm">{place}</dd>
          </>
        )}

        {exhibition.isFree !== null && (
          <>
            <dt className="text-sm font-medium text-muted-foreground">票價</dt>
            <dd>
              {/* 淡彩（tonal）風格：bg-primary/10 淡橘底 + 深字，對比 ~13:1，
                  遠高於實心橘底配深字的 5.1:1，跟旁邊的淡莫蘭迪標籤調性一致。
                  variant 用 outline 當底，不用 default（不然要跟它自帶的
                  bg-primary/text-primary-foreground 打架）。 */}
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
            </dd>
          </>
        )}

        {exhibition.tags.length > 0 && (
          <>
            <dt className="text-sm font-medium text-muted-foreground">標籤</dt>
            <dd className="flex flex-wrap gap-2">
              {exhibition.tags.map((et) => (
                <Badge
                  key={et.tagId}
                  variant="secondary"
                  className="text-gray-800"
                  style={{ backgroundColor: tagToHsl(et.tag.name) }}
                >
                  {et.tag.name}
                </Badge>
              ))}
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
    </main>
  );
}