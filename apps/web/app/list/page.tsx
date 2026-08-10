import Link from "next/link";
import { getListedTags, getExhibitions } from "@exhibly/db";
import { Button } from "@exhibly/ui/components/button";
import ExhibitionCard from "../components/ExhibitionCard";
import TagFilter from "../components/TagFilter";

type ExhibitionStatus = "current" | "upcoming" | "ended";

const STATUS_OPTIONS: { value: ExhibitionStatus; label: string }[] = [
  { value: "current", label: "現正展出" },
  { value: "upcoming", label: "即將開展" },
  { value: "ended", label: "已結束" },
];

// ?status= 沒帶、或帶了辨識不出的值（例如 ?status=xyz），一律當成 "current"。
// 這跟 ?tags= 沒帶時是「全部」剛好相反：使用者從外部連結／首頁點進來，
// 預期看到的是現在展出中的展覽，不是把已結束、還沒開展的也混進來。
function parseStatus(raw: string | undefined): ExhibitionStatus {
  if (raw === "upcoming" || raw === "ended" || raw === "current") {
    return raw;
  }
  return "current";
}

export default async function ListPage({
  searchParams,
}: {
  searchParams: Promise<{ tags?: string; status?: string }>;
}) {
  const { tags, status: rawStatus } = await searchParams;
  const selectedTags = tags ? tags.split(",") : [];
  const status = parseStatus(rawStatus);

  const allTags = await getListedTags();
  const exhibitions = await getExhibitions({ tags: selectedTags, status });

  // status 切換要保留現有的 ?tags=（TagFilter 那邊反過來保留 ?status=），
  // 兩個參數各自獨立，切一個不能把另一個洗掉。
  function hrefForStatus(value: ExhibitionStatus) {
    const params = new URLSearchParams();
    params.set("status", value);
    if (tags) params.set("tags", tags);
    return `/list?${params.toString()}`;
  }

  const statusLabel = STATUS_OPTIONS.find((o) => o.value === status)!.label;
  // 空狀態的「切換到其他狀態」連結：current 沒結果就導去 ended（最可能還找得到
  // 展覽），upcoming／ended 沒結果就導回 current（最常見、最有機會有內容的狀態）。
  const fallbackStatus: ExhibitionStatus =
    status === "current" ? "ended" : "current";
  const fallbackLabel = STATUS_OPTIONS.find(
    (o) => o.value === fallbackStatus,
  )!.label;

  return (
    <main className="mx-auto max-w-6xl px-6 py-12 sm:px-8 sm:py-16 lg:px-12">
      <div className="mb-6 flex flex-wrap gap-2 sm:mb-8">
        {STATUS_OPTIONS.map((option) => (
          <Button
            key={option.value}
            asChild
            // 選中態沿用 default/outline 的實心／描邊對比，不用標籤那套雜湊色——
            // 那套色的語意是「主題」，狀態不是主題。
            variant={option.value === status ? "default" : "outline"}
            size="sm"
          >
            <Link href={hrefForStatus(option.value)}>{option.label}</Link>
          </Button>
        ))}
      </div>

      <div className="mb-10 sm:mb-14">
        <TagFilter tags={allTags} />
      </div>

      {exhibitions.length === 0 ? (
        // 零筆不是防禦性補丁：例如首頁「原住民文化」掛的展覽全數已結束，
        // 帶著這個標籤點進「現正展出」就是零筆，這段文字＋連結是唯一的出路。
        <div className="py-24 text-center text-muted-foreground">
          <p>
            {selectedTags.length > 0
              ? `沒有符合「${selectedTags.join("、")}」的「${statusLabel}」展覽。`
              : `目前沒有「${statusLabel}」的展覽。`}
          </p>
          <p className="mt-2">
            <Link
              href={hrefForStatus(fallbackStatus)}
              className="underline underline-offset-4 hover:text-foreground"
            >
              查看{fallbackLabel}的展覽
            </Link>
          </p>
        </div>
      ) : (
        // 畫廊網格：圖片為主視覺、標題退居其下，靠底線分隔而非卡片框線陰影，
        // 呼應「介面克制」；可點性靠 hover 底線 + 圖片微透明變化傳達，不靠色彩。
        <div className="grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {exhibitions.map((e) => (
            <ExhibitionCard
              key={e.id}
              id={e.id}
              name={e.name}
              imageUrl={e.imageUrl}
              tags={e.tags.map((et) => et.tag.name)}
            />
          ))}
        </div>
      )}
    </main>
  );
}
