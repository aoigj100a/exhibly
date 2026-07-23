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
    </div>
  );
}