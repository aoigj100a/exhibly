import Link from "next/link";
import { prisma } from "@exhibly/db";
import TagFilter from "./TagFilter"; // 引入刚做的选单

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ tags?: string }>;
}) {
  const { tags } = await searchParams;
  const selectedTags = tags ? tags.split(",") : [];

  // 撈所有标签，传给选单显示（读资料是 Server Component 的事）
  const allTags = await prisma.tag.findMany();

  // 撈展览：有选标签就 OR 筛选，没选就全部
  const exhibitions = await prisma.exhibition.findMany({
    where: selectedTags.length
      ? { tags: { some: { tag: { name: { in: selectedTags } } } } }
      : undefined,
  });

  return (
    <div>
      {/* 选单：把撈好的标签资料传进去 */}
      <TagFilter tags={allTags} />

      {/* 结果列表 */}
      <ul>
        {exhibitions.map((e) => (
          <li key={e.id}>
            <Link href={`/exhibition/${e.id}`}>{e.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}