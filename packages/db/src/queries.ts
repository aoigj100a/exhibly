import { prisma } from "./index";
import { taipeiToday } from "./date";
import type { Prisma, Exhibition } from "../generated/prisma/client";

// 三個查展覽的函式都要帶標籤，兩層 include 統一從這裡引用，不要各自抄一遍
export const exhibitionInclude = {
  tags: { include: { tag: true } },
} as const;

export type ExhibitionStatus = "current" | "upcoming" | "ended";

export interface GetExhibitionsOptions {
  tags?: string[];
  status?: ExhibitionStatus;
  q?: string;
}

// endDate 可空，null 的語意是「不知道有沒有結束日」而非「已結束」，
// 所以 current 必須用 OR 把 null 納入，不能直接寫 gte（那樣會漏掉
// 沒填 endDate、但已經開展的展覽）。
// ❗ 這份判斷邏輯與 getExhibitionStatus() 是同一套規則的兩種形狀
// （一個是 Prisma where 條件、一個是 JS 判斷），無法直接共用實作。
// 改這裡要記得同步改 getExhibitionStatus()，反之亦然。
function statusWhere(
  status: ExhibitionStatus | undefined,
  today: Date,
): Prisma.ExhibitionWhereInput | undefined {
  switch (status) {
    case "upcoming":
      return { startDate: { gt: today } };
    case "ended":
      return { endDate: { not: null, lt: today } };
    case "current":
      return {
        startDate: { lte: today },
        OR: [{ endDate: null }, { endDate: { gte: today } }],
      };
    default:
      return undefined;
  }
}

// 給詳情頁標示用的純函式版本，判斷邏輯必須跟上面的 statusWhere() 完全一致
// （含 endDate 為 null 視為未知、不算已結束）。改這裡要記得同步改 statusWhere()，
// 反之亦然——兩邊形狀不同（一個是 JS 判斷、一個是 Prisma where 條件），
// 沒辦法直接共用實作，這是已知的重複。
export function getExhibitionStatus(
  exhibition: Pick<Exhibition, "startDate" | "endDate">,
): ExhibitionStatus {
  const today = taipeiToday();

  if (exhibition.startDate > today) {
    return "upcoming";
  }
  if (exhibition.endDate !== null && exhibition.endDate < today) {
    return "ended";
  }
  return "current";
}

export function getExhibitions(options?: GetExhibitionsOptions) {
  const { tags, status, q } = options ?? {};

  const where: Prisma.ExhibitionWhereInput[] = [];
  if (tags?.length) {
    where.push({ tags: { some: { tag: { name: { in: tags } } } } });
  }
  const statusCondition = statusWhere(status, taipeiToday());
  if (statusCondition) {
    where.push(statusCondition);
  }
  const trimmedQ = q?.trim();
  if (trimmedQ) {
    where.push({ name: { contains: trimmedQ, mode: "insensitive" } });
  }

  return prisma.exhibition.findMany({
    where: where.length ? { AND: where } : undefined,
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
