import { notFound } from "next/navigation";
import Link from "next/link";
import { getExhibitionById } from "@exhibly/db";
import { Button } from "@exhibly/ui/components/button";
import { uploadExhibitionImage } from "../../actions";
import EditExhibitionForm from "./EditExhibitionForm";

// yyyy-MM-dd，跟 <input type="date"> 需要的格式一致。用 toISOString 取
// UTC 日期，跟專案其他地方「存進去的是 UTC 午夜、就要用 UTC 讀出來」
// 的約定一致，避免執行環境時區把日期往回推一天。
function toDateInputValue(date: Date | null): string {
  return date ? date.toISOString().slice(0, 10) : "";
}

export default async function EditExhibitionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const exhibition = await getExhibitionById(id);

  if (!exhibition) {
    notFound();
  }

  const initialValues = {
    name: exhibition.name,
    startDate: toDateInputValue(exhibition.startDate),
    endDate: toDateInputValue(exhibition.endDate),
    description: exhibition.description ?? "",
    city: exhibition.city ?? "",
    venue: exhibition.venue ?? "",
    location: exhibition.location ?? "",
    ticketUrl: exhibition.ticketUrl ?? "",
    officialUrl: exhibition.officialUrl ?? "",
    imageUrl: exhibition.imageUrl ?? "",
    isFree:
      exhibition.isFree === true
        ? "true"
        : exhibition.isFree === false
          ? "false"
          : "",
    price: exhibition.price ?? "",
    openingHours: exhibition.openingHours ?? "",
  };

  return (
    <main className="mx-auto max-w-lg px-6 py-12 sm:px-8">
      <header className="mb-8">
        <Link
          href="/"
          className="text-sm text-muted-foreground hover:underline"
        >
          ← 返回列表
        </Link>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">編輯展覽</h1>
      </header>

      {/* 獨立一張表單、不塞進 EditExhibitionForm：<form> 不能巢狀，
          而且上傳是直接改 imageUrl 的另一個動作，不跟「儲存」綁在一起。 */}
      <form
        action={uploadExhibitionImage.bind(null, exhibition.id)}
        className="mb-8 space-y-1.5"
      >
        <label htmlFor="image" className="text-sm font-medium">
          上傳圖片
        </label>
        <div className="flex items-center gap-3">
          <input
            id="image"
            name="image"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            required
            className="text-sm"
          />
          <Button type="submit" variant="outline">
            上傳
          </Button>
        </div>
      </form>

      {/* key 綁 id：防止之後從某個 /x/edit 直接連到 /y/edit 時，同一個
          client 元件被留用，導致 useActionState 的初始值不會重算成
          新這筆的資料。
          再加上 imageUrl：上傳後頁面會重新渲染但元件不會卸載，
          useActionState 仍拿著舊的圖片網址，接著按「儲存」就會把剛上傳
          的網址蓋回舊值。imageUrl 變了就換 key，讓表單用新值重建。 */}
      <EditExhibitionForm
        key={`${exhibition.id}:${exhibition.imageUrl ?? ""}`}
        exhibitionId={exhibition.id}
        initialValues={initialValues}
      />
    </main>
  );
}
