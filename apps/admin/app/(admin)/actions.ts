"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma, Prisma } from "@exhibly/db";
import { requireAuth } from "@/lib/auth-guard";

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
  "officialUrl",
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

// 官方網址正規化：故意寫在這裡（寫入端），不是讀取端。讀取端之後只會
// 變多（詳情頁、admin 列表、未來的爬蟲），但寫入端目前只有這兩張表單，
// 在這裡正規化一次，之後所有讀取端都能直接信任這個欄位是完整網址、
// 不用各自再判斷一次有沒有 protocol。
// 只靠 <input type="url"> 不夠：那只是瀏覽器端提示，繞過表單直接送
// request 就沒有防護，一定要在 server action 這層再做一次。
//
// 白名單而非黑名單：只明確認得 http/https 兩種 scheme 該怎麼處理，
// 其他一律拒絕，不是列一份「危險 scheme」清單去擋。曾經的寫法是沒有
// http(s):// 開頭就一律補上 https://，"javascript:alert(1)" 因此被
// 補成 "https://javascript:alert(1)"——結果無害只是巧合（補完就不再是
// 合法的 javascript: URL 了），防禦不能建立在這種巧合上，因為只要
// 換一種 payload 形狀（例如已經帶 "://" 的變形）就可能繞過去。
// href 裡的 javascript: 是真的 XSS 破口（詳情頁會把這個值直接放進
// <a href>），所以規則反過來：先認出「已經是 http(s)://」放行，
// 再認出「完全沒有 scheme」（裸網域/路徑）才補 https://，除此之外
// ——只要偵測到任何其他 scheme（javascript:、data:、file:、mailto:…）
// ——一律存 null，不寫入資料庫，不嘗試修好它。
function normalizeUrl(value: string): string | null {
  const trimmed = value.trim();
  if (trimmed === "") return null;

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  // RFC 3986 的 scheme 語法：一個字母開頭，後面接字母/數字/+/-/.，
  // 再接一個冒號。符合這個形狀就代表「有 scheme」，但不是 http/https，
  // 一律視為不允許（涵蓋 javascript:、data:、file:、mailto: 等）。
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed)) {
    return null;
  }

  // 走到這裡代表完全沒有 scheme（裸網域或裸路徑），才補上 https://
  return `https://${trimmed}`;
}

export async function createExhibition(
  _prevState: CreateExhibitionWithTagsState,
  formData: FormData
): Promise<CreateExhibitionWithTagsState> {
  await requireAuth();

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
      officialUrl: normalizeUrl(values.officialUrl),
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
  await requireAuth();

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
      officialUrl: normalizeUrl(values.officialUrl),
      imageUrl: optionalString(values.imageUrl),
      isFree,
      price: optionalString(values.price),
      openingHours: optionalString(values.openingHours),
    },
  });

  revalidatePath("/");
  redirect("/");
}

const TAG_CATEGORY_VALUES = ["SUBJECT", "MOOD"] as const;

export type CreateTagState = {
  errors: Partial<Record<"name" | "category", string>>;
  values: { name: string; category: string };
};

// isListed 不放表單，靠 schema 的 @default(true)：這支 action 只負責
// 建標籤，開關／改名／刪除是另外的事，不在這裡做。
export async function createTag(
  _prevState: CreateTagState,
  formData: FormData
): Promise<CreateTagState> {
  await requireAuth();

  const name = String(formData.get("name") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const values = { name, category };
  const errors: Partial<Record<"name" | "category", string>> = {};

  if (name === "") {
    errors.name = "請輸入標籤名稱";
  }
  if (
    !TAG_CATEGORY_VALUES.includes(category as (typeof TAG_CATEGORY_VALUES)[number])
  ) {
    errors.category = "請選擇分類";
  }

  if (Object.keys(errors).length > 0) {
    return { errors, values };
  }

  try {
    await prisma.tag.create({ data: { name, category } });
  } catch (error) {
    // name 是 unique，重複時 Prisma 丟 P2002——在這裡接住轉成看得懂的
    // 訊息，不要讓原始錯誤直接噴到畫面上。
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return {
        errors: { name: `標籤「${name}」已存在` },
        values,
      };
    }
    throw error;
  }

  revalidatePath("/tags");
  redirect("/tags");
}

// isListed 只控制篩選頁選單要不要顯示這個標籤，跟這個標籤能不能用
// 是兩件事（詳見 schema 裡 Tag.isListed 的註解）。這裡只切開關，
// 不動 name／category，改名跟刪除都還沒做。
export async function toggleTagListed(formData: FormData) {
  await requireAuth();

  const tagId = formData.get("tagId");
  const nextIsListed = formData.get("nextIsListed");

  if (typeof tagId !== "string" || !tagId) {
    throw new Error("缺少標籤 id");
  }

  await prisma.tag.update({
    where: { id: tagId },
    data: { isListed: nextIsListed === "true" },
  });

  revalidatePath("/tags");
}

// ExhibitionTag 對 Exhibition 的關聯是 onDelete: Cascade（見 schema），
// 刪展覽時資料庫會自動一併清掉關聯列，這裡不用手動先刪 ExhibitionTag。
export async function deleteExhibition(formData: FormData) {
  await requireAuth();

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
  await requireAuth();

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
