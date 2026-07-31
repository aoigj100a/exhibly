import Link from "next/link";
import { prisma } from "@exhibly/db";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ tags?: string }>;
}) {
  const { tags } = await searchParams;
  const selectedTags = tags ? tags.split(",") : [];

  const exhibitions = await prisma.exhibition.findMany({
    where: selectedTags.length
      ? { tags: { some: { tag: { name: { in: selectedTags } } } } }
      : undefined,
  });

  return (
    <ul>
      {exhibitions.map((e) => (
        <li key={e.id}>
          <Link href={`/exhibition/${e.id}`}>{e.name}</Link>
        </li>
      ))}
    </ul>
  );
}