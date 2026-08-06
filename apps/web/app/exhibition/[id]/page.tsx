import { notFound } from "next/navigation";
import { prisma } from "@exhibly/db";
import { Card, CardContent, CardHeader, CardTitle } from "@exhibly/ui/components/card";
import { Badge } from "@exhibly/ui/components/badge";
import ExhibitionImage from "../../components/ExhibitionImage";

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
    <main className="mx-auto max-w-2xl px-4 py-8">
      <Card className="overflow-hidden">
        {/* 圖片區：占位邏輯已抽成共用組件，尺寸靠 className 從外部給 */}
        <ExhibitionImage
          src={exhibition.imageUrl}
          alt={exhibition.name}
          tags={exhibition.tags.map((et) => et.tag.name)}
          className="aspect-[16/9] w-full"
          sizes="(min-width: 672px) 672px, 100vw"
        />

        <CardHeader>
          <CardTitle className="text-2xl">{exhibition.name}</CardTitle>

          {/* 標籤：用 Badge 呈現。沒有標籤時整區不渲染，不留空殼 */}
          {exhibition.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {exhibition.tags.map((et) => (
                <Badge key={et.tagId} variant="secondary">
                  {et.tag.name}
                </Badge>
              ))}
            </div>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          {/* 日期一定有值（schema 為必填），直接顯示 */}
          <p className="text-sm text-muted-foreground">{dateRange}</p>

          {/* 以下皆為 nullable，有值才渲染那一行 */}
          {place && <p className="text-sm">{place}</p>}

          {exhibition.isFree !== null && (
            <Badge variant={exhibition.isFree ? "default" : "outline"}>
              {exhibition.isFree ? "免費" : "收費"}
            </Badge>
          )}

          {exhibition.description && (
            <p className="leading-relaxed whitespace-pre-line">
              {exhibition.description}
            </p>
          )}
        </CardContent>
      </Card>
    </main>
  );
}