import { getAllTags, getExhibitions } from "@exhibly/db";
import ExhibitionCard from "../components/ExhibitionCard";
import TagFilter from "../components/TagFilter";

export default async function ListPage({
  searchParams,
}: {
  searchParams: Promise<{ tags?: string }>;
}) {
  const { tags } = await searchParams;
  const selectedTags = tags ? tags.split(",") : [];

  const allTags = await getAllTags();

  const exhibitions = await getExhibitions(selectedTags);

  return (
    <main className="mx-auto max-w-6xl px-6 py-12 sm:px-8 sm:py-16 lg:px-12">
      <div className="mb-10 sm:mb-14">
        <TagFilter tags={allTags} />
      </div>

      {exhibitions.length === 0 ? (
        // 篩選後可能一筆都不符合，給明確的空狀態，不要只是空白
        <p className="py-24 text-center text-muted-foreground">
          沒有符合的展覽，試試調整篩選條件。
        </p>
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