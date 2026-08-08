"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@exhibly/db";

// 表單欄位清單，統一從這裡引用，讀值、回填、型別都靠它保持一致。
const EXHIBITION_FIELDS = [
  "name",
  "startDate",
  "endDate",
  "description",
  "city",
  "venue",
  "location",
  "ticketUrl",
  "imageUrl",
  "isFree",
  "price",
  "openingHours",
] as const;

type ExhibitionField = (typeof EXHIBITION_FIELDS)[number];

export type CreateExhibitionState = {
  errors: Partial<Record<ExhibitionField, string>>;
  values: Record<ExhibitionField, string>;
};

// 只有新增表單同時收標籤，updateExhibition／編輯表單不需要 tagIds，
// 所以另外疊一個型別，不動 CreateExhibitionState 原本的形狀。
export type CreateExhibitionWithTagsState = CreateExhibitionState & {
  tagIds: string[];
};

function readTagIds(formData: FormData): string[] {
  return formData
    .getAll("tagIds")
    .filter((value): value is string => typeof value === "string");
}

function readValues(formData: FormData): Record<ExhibitionField, string> {
  const values = {} as Record<ExhibitionField, string>;
  for (const field of EXHIBITION_FIELDS) {
    const raw = formData.get(field);
    values[field] = typeof raw === "string" ? raw : "";
  }
  return values;
}

// 可空欄位共用的轉換：空字串（含只有空白）一律當成沒填，存 null，
// 不要把 "" 寫進資料庫跟「未知」混在一起。
function optionalString(value: string): string | null {
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

export async function createExhibition(
  _prevState: CreateExhibitionWithTagsState,
  formData: FormData
): Promise<CreateExhibitionWithTagsState> {
  const values = readValues(formData);
  const tagIds = readTagIds(formData);
  const errors: Partial<Record<ExhibitionField, string>> = {};

  if (values.name.trim() === "") {
    errors.name = "請輸入展覽名稱";
  }
  if (values.startDate.trim() === "") {
    errors.startDate = "請選擇開始日期";
  }

  // 驗證一定要在這裡（server action）做：HTML required 只擋得住瀏覽器，
  // 繞過表單直接送 request 就沒有防護，最終還是要以這裡為準。
  if (Object.keys(errors).length > 0) {
    return { errors, values, tagIds };
  }

  const endDate = optionalString(values.endDate);
  const isFree =
    values.isFree === "true" ? true : values.isFree === "false" ? false : null;

  // 用巢狀寫入（而不是 $transaction([create, createMany])）：Prisma 對
  // 巢狀寫入本來就會包成單一交易送出，效果一樣但不用手動組兩個查詢、
  // 也不用先拿到 exhibition.id 才能組第二個查詢。跟 seed.ts 建關聯的
  // 寫法一致。展覽建好、標籤關聯建立失敗都會整個回滾，不會留下一筆
  // 沒有標籤的展覽。
  await prisma.exhibition.create({
    data: {
      name: values.name.trim(),
      startDate: new Date(values.startDate),
      endDate: endDate ? new Date(endDate) : null,
      description: optionalString(values.description),
      city: optionalString(values.city),
      venue: optionalString(values.venue),
      location: optionalString(values.location),
      ticketUrl: optionalString(values.ticketUrl),
      imageUrl: optionalString(values.imageUrl),
      isFree,
      price: optionalString(values.price),
      openingHours: optionalString(values.openingHours),
      tags: {
        create: tagIds.map((tagId) => ({ tag: { connect: { id: tagId } } })),
      },
    },
  });

  revalidatePath("/");
  redirect("/");
}

// 驗證規則與 createExhibition 一致，特意不合併成同一個函式：這個要接
// prisma.exhibition.update，createExhibition 接的是 create，硬抽共用
// 現在言之過早，等表單元件那邊決定怎麼共用後再一併處理。
export async function updateExhibition(
  id: string,
  _prevState: CreateExhibitionState,
  formData: FormData
): Promise<CreateExhibitionState> {
  const values = readValues(formData);
  const errors: Partial<Record<ExhibitionField, string>> = {};

  if (values.name.trim() === "") {
    errors.name = "請輸入展覽名稱";
  }
  if (values.startDate.trim() === "") {
    errors.startDate = "請選擇開始日期";
  }

  if (Object.keys(errors).length > 0) {
    return { errors, values };
  }

  const endDate = optionalString(values.endDate);
  const isFree =
    values.isFree === "true" ? true : values.isFree === "false" ? false : null;

  await prisma.exhibition.update({
    where: { id },
    data: {
      name: values.name.trim(),
      startDate: new Date(values.startDate),
      endDate: endDate ? new Date(endDate) : null,
      description: optionalString(values.description),
      city: optionalString(values.city),
      venue: optionalString(values.venue),
      location: optionalString(values.location),
      ticketUrl: optionalString(values.ticketUrl),
      imageUrl: optionalString(values.imageUrl),
      isFree,
      price: optionalString(values.price),
      openingHours: optionalString(values.openingHours),
    },
  });

  revalidatePath("/");
  redirect("/");
}

// ExhibitionTag 對 Exhibition 的關聯是 onDelete: Cascade（見 schema），
// 刪展覽時資料庫會自動一併清掉關聯列，這裡不用手動先刪 ExhibitionTag。
export async function deleteExhibition(formData: FormData) {
  const id = formData.get("id");
  if (typeof id !== "string" || !id) {
    throw new Error("缺少展覽 id");
  }

  await prisma.exhibition.delete({ where: { id } });
  revalidatePath("/");
}

// 全刪重建：ExhibitionTag 除了兩個外鍵沒有其他欄位，重建不會遺失資訊。
// 刪除與新增包在同一筆交易裡，避免刪完後新增失敗、展覽變成沒有任何標籤。
// 前提：ExhibitionTag 不能有自身欄位。日後若加上 createdAt、order、
// isPrimary 之類的欄位，這裡就不能再整批砍掉重建（會把那些資料一起
// 洗掉），必須改成算差集（比對現有/送出的 tagId，只刪少的、只加多的）。
export async function updateExhibitionTags(
  exhibitionId: string,
  formData: FormData
) {
  const tagIds = readTagIds(formData);

  await prisma.$transaction([
    prisma.exhibitionTag.deleteMany({ where: { exhibitionId } }),
    prisma.exhibitionTag.createMany({
      data: tagIds.map((tagId) => ({ exhibitionId, tagId })),
    }),
  ]);

  revalidatePath("/");
  revalidatePath(`/${exhibitionId}/tags`);
  redirect("/");
}
