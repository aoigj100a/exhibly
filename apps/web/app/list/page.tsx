import Link from "next/link";
import { prisma } from "@exhibly/db";
import TagFilter from "../TagFilter";

export default async function ListPage({
  searchParams,
}: {
  searchParams: Promise<{ tags?: string }>;
}) {
  const { tags } = await searchParams;
  const selectedTags = tags ? tags.split(",") : [];

  const allTags = await prisma.tag.findMany();

  const exhibitions = await prisma.exhibition.findMany({
    where: selectedTags.length
      ? { tags: { some: { tag: { name: { in: selectedTags } } } } }
      : undefined,
  });

  return (
    <div>
      <TagFilter tags={allTags} />
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
