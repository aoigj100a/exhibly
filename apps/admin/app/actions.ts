"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@exhibly/db";

// 最小可寫入版本：只收 name、startDate。endDate 在 schema 是必填，
// 這步還沒有第二個日期欄位，先填成跟 startDate 同一天卡住鏈路，
// 之後補完整表單時再讓使用者自己選 endDate。
export async function createExhibition(formData: FormData) {
  const name = formData.get("name");
  const startDate = formData.get("startDate");
  if (typeof name !== "string" || typeof startDate !== "string") {
    throw new Error("缺少 name 或 startDate");
  }

  await prisma.exhibition.create({
    data: {
      name,
      startDate: new Date(startDate),
      endDate: new Date(startDate),
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
