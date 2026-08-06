import Link from "next/link";
import { prisma } from "@exhibly/db";
import ExhibitionImage from "../components/ExhibitionImage";
import TagFilter from "../components/TagFilter";

export default async function ListPage({
  searchParams,
}: {
  searchParams: Promise<{ tags?: string }>;
}) {
  const { tags } = await searchParams;
  const selectedTags = tags ? tags.split(",") : [];

  const allTags = await prisma.tag.findMany();

  // 這句是 M2 早就寫通的多對多篩選 query，篩選條件原封不動，
  // 這次補上 include 是為了讓沒圖的展覽能拿標籤畫展牌。
  const exhibitions = await prisma.exhibition.findMany({
    where: selectedTags.length
      ? { tags: { some: { tag: { name: { in: selectedTags } } } } }
      : undefined,
    include: { tags: { include: { tag: true } } },
  });

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
            <Link key={e.id} href={`/exhibition/${e.id}`} className="group block">
              <ExhibitionImage
                src={e.imageUrl}
                alt={e.name}
                tags={e.tags.map((et) => et.tag.name)}
                className="aspect-[4/3] w-full transition-opacity group-hover:opacity-90"
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              />
              <div className="mt-4 border-t border-border pt-3">
                <h2 className="text-lg leading-snug font-semibold tracking-tight group-hover:underline">
                  {e.name}
                </h2>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}