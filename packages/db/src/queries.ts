import { prisma } from "./index";

// 三個查展覽的函式都要帶標籤，兩層 include 統一從這裡引用，不要各自抄一遍
export const exhibitionInclude = {
  tags: { include: { tag: true } },
} as const;

export function getExhibitions(tags?: string[]) {
  return prisma.exhibition.findMany({
    where: tags?.length
      ? { tags: { some: { tag: { name: { in: tags } } } } }
      : undefined,
    include: exhibitionInclude,
  });
}

export async function getExhibitionById(id: string) {
  const exhibition = await prisma.exhibition.findUnique({
    where: { id },
    include: exhibitionInclude,
  });

  return exhibition;
}

export function getRecentExhibitions() {
  return prisma.exhibition.findMany({
    orderBy: { startDate: "asc" },
    take: 6,
    include: exhibitionInclude,
  });
}

export function getAllTags() {
  return prisma.tag.findMany();
}
