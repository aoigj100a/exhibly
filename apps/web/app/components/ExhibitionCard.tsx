import Link from "next/link";
import { getExhibitionStatus } from "@exhibly/db";
import ExhibitionCover from "./ExhibitionCover";

// 展覽卡片：圖／展牌 + 標題，列表頁與首頁「近期展覽」共用同一份，
// 不要各自刻一套——畫廊網格的卡片長相全站只有這一種。
export default function ExhibitionCard({
  id,
  name,
  imageUrl,
  tags,
  startDate,
  endDate,
  sizes = "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw",
}: {
  id: string;
  name: string;
  imageUrl: string | null;
  tags: string[];
  startDate?: Date;
  endDate?: Date | null;
  sizes?: string;
}) {
  // 搜尋結果會混入已結束／即將開展的展覽，卡片必須自己講清楚，不能只靠
  // 列表頁的狀態篩選（搜尋時根本不套用 status）。沒帶 startDate（例如首頁
  // 「近期展覽」目前沒傳）就不判斷，維持原本不顯示狀態的行為。
  // current 不標的規則沿用詳情頁：預設狀態標了是噪音。
  const status = startDate
    ? getExhibitionStatus({ startDate, endDate: endDate ?? null })
    : "current";

  return (
    <Link href={`/exhibition/${id}`} className="group block">
      <ExhibitionCover
        src={imageUrl}
        alt={name}
        tags={tags}
        className="aspect-[4/3] w-full transition-opacity group-hover:opacity-90"
        sizes={sizes}
      />
      <div className="mt-4 border-t border-border pt-3">
        {status !== "current" && (
          <p className="text-sm font-medium text-muted-foreground">
            {status === "ended" ? "本展已結束" : "即將開展"}
          </p>
        )}
        <h2 className="text-lg leading-snug font-semibold tracking-tight group-hover:underline">
          {name}
        </h2>
      </div>
    </Link>
  );
}
