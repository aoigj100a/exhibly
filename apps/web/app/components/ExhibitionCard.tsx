import Link from "next/link";
import ExhibitionImage from "./ExhibitionImage";

// 展覽卡片：圖／展牌 + 標題，列表頁與首頁「近期展覽」共用同一份，
// 不要各自刻一套——畫廊網格的卡片長相全站只有這一種。
export default function ExhibitionCard({
  id,
  name,
  imageUrl,
  tags,
  sizes = "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw",
}: {
  id: string;
  name: string;
  imageUrl: string | null;
  tags: string[];
  sizes?: string;
}) {
  return (
    <Link href={`/exhibition/${id}`} className="group block">
      <ExhibitionImage
        src={imageUrl}
        alt={name}
        tags={tags}
        className="aspect-[4/3] w-full transition-opacity group-hover:opacity-90"
        sizes={sizes}
      />
      <div className="mt-4 border-t border-border pt-3">
        <h2 className="text-lg leading-snug font-semibold tracking-tight group-hover:underline">
          {name}
        </h2>
      </div>
    </Link>
  );
}
