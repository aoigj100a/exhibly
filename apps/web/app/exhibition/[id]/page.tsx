import { notFound } from "next/navigation";
import { prisma } from "@exhibly/db";

export default async function ExhibitionDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const exhibition = await prisma.exhibition.findUnique({
    where: { id },
    include: {
      tags: {                   // 第一段：展览 → ExhibitionTag（撈出所有連線）
        include: { tag: true }, // 第二段：每條線 → 它連到的 Tag（撈出標籤本身）
      },
    },
  });


  if (!exhibition) {
    notFound();
  }

  return (
    <div>
      <h1>{exhibition.name}</h1>
      <p>{exhibition.venue}</p>
      <p>{exhibition.city}</p>
      <p>{exhibition.description}</p>
      <div>
        {exhibition.tags.map((et) => (
          <span key={et.tagId}>{et.tag.name}</span>
        ))}
      </div>
    </div>
  );
}