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

// 給 web 篩選頁的標籤選單用：isListed=false 只代表「選單挑不到」，
// 不代表這個標籤不能篩。這裡的 where 只影響選單要不要出現這個按鈕，
// getExhibitions() 故意不接手同一個限制——直達連結（?tags=X）不管
// X 有沒有上架都要篩得出來，isListed 不能疊到查詢層上面去，不然
// 之前存的分享連結會突然失效。
export function getListedTags() {
  return prisma.tag.findMany({ where: { isListed: true } });
}

// 給 admin 標籤管理頁用：刻意不加 where 篩 isListed，管理頁必須看得到
// 全部標籤（含關掉的），不然標籤一旦被關掉、選單挑不到，就再也開不回來。
// 排序依展覽數多到少；同數量時退回 name asc，避免同分排序在每次查詢間飄動。
export function getTagsWithExhibitionCount() {
  return prisma.tag.findMany({
    include: { _count: { select: { exhibitions: true } } },
    orderBy: [{ exhibitions: { _count: "desc" } }, { name: "asc" }],
  });
}
