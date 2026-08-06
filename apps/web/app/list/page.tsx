import Link from "next/link";
import { prisma } from "@exhibly/db";
import { Card, CardContent } from "@exhibly/ui/components/card";
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
    <main className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6">
        <TagFilter tags={allTags} />
      </div>

      {exhibitions.length === 0 ? (
        // 篩選後可能一筆都不符合，給明確的空狀態，不要只是空白
        <p className="py-12 text-center text-muted-foreground">
          沒有符合的展覽，試試調整篩選條件。
        </p>
      ) : (
        <div className="space-y-3">
          {exhibitions.map((e) => (
            <Link key={e.id} href={`/exhibition/${e.id}`} className="group block">
              <Card className="overflow-hidden transition-colors group-hover:border-primary">
                <div className="flex items-center gap-4">
                  {/* 列表縮圖：同一個共用組件，換成小方圖尺寸。沒圖一樣顯示占位 */}
                  <ExhibitionImage
                    src={e.imageUrl}
                    alt={e.name}
                    tags={e.tags.map((et) => et.tag.name)}
                    className="h-20 w-20 shrink-0"
                    sizes="80px"
                  />
                  <CardContent className="p-4 pl-0">
                    <span className="font-medium">{e.name}</span>
                  </CardContent>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}