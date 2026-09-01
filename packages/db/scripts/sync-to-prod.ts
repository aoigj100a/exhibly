/**
 * 本地 Docker Postgres → 正式 Supabase 的資料同步腳本。
 *
 * 連線：
 * - 本地：packages/db/.env 的 DATABASE_URL
 * - 正式：packages/db/.env.production.local 的 PROD_DATABASE_URL
 *   （刻意用不同變數名，避免兩個 client 誤連到同一個資料庫）
 *
 * 核心約束：
 * - 正式已存在的 Exhibition.id 絕對不可變更（對外網址依賴它）
 * - 兩邊 id 完全不重疊，只能用 name 配對
 *
 * 用法：
 *   tsx scripts/sync-to-prod.ts            # dry-run（預設）
 *   tsx scripts/sync-to-prod.ts --no-dry-run   # 實際寫入正式環境
 */

import path from "node:path";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config({ path: path.resolve(__dirname, "../.env.production.local") });

import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

function parseDryRun(argv: string[]): boolean {
  if (argv.includes("--no-dry-run") || argv.includes("--dry-run=false")) {
    return false;
  }
  return true;
}

const dryRun = parseDryRun(process.argv.slice(2));

if (!process.env.DATABASE_URL) {
  throw new Error("缺少 DATABASE_URL（本地連線），請確認 packages/db/.env");
}
if (!process.env.PROD_DATABASE_URL) {
  throw new Error(
    "缺少 PROD_DATABASE_URL（正式連線），請確認 packages/db/.env.production.local",
  );
}

const localDb = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});
const prodDb = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.PROD_DATABASE_URL }),
});

type ExhibitionFields = {
  name: string;
  startDate: Date;
  endDate: Date | null;
  description: string | null;
  city: string | null;
  venue: string | null;
  location: string | null;
  ticketUrl: string | null;
  officialUrl: string | null;
  imageUrl: string | null;
  isFree: boolean | null;
  price: string | null;
  openingHours: string | null;
};

function exhibitionFields(e: ExhibitionFields): ExhibitionFields {
  return {
    name: e.name,
    startDate: e.startDate,
    endDate: e.endDate,
    description: e.description,
    city: e.city,
    venue: e.venue,
    location: e.location,
    ticketUrl: e.ticketUrl,
    officialUrl: e.officialUrl,
    imageUrl: e.imageUrl,
    isFree: e.isFree,
    price: e.price,
    openingHours: e.openingHours,
  };
}

async function main() {
  console.log(`模式：${dryRun ? "dry-run（不會寫入）" : "實際寫入正式環境"}`);
  console.log("");

  const [localTags, prodTags, localExhibitions, prodExhibitions, localExhibitionTags] =
    await Promise.all([
      localDb.tag.findMany(),
      prodDb.tag.findMany(),
      localDb.exhibition.findMany(),
      prodDb.exhibition.findMany(),
      localDb.exhibitionTag.findMany(),
    ]);

  const prodTagByName = new Map(prodTags.map((t) => [t.name, t]));
  const prodExhibitionByName = new Map(prodExhibitions.map((e) => [e.name, e]));

  // ---- 1. Tag：以 name upsert ----
  const tagsToCreate = localTags.filter((t) => !prodTagByName.has(t.name));
  const tagsToUpdate = localTags.filter((t) => prodTagByName.has(t.name));

  // ---- 2. Exhibition：以 name 配對 ----
  const exhibitionsToCreate = localExhibitions.filter(
    (e) => !prodExhibitionByName.has(e.name),
  );
  const exhibitionsToUpdate = localExhibitions.filter((e) =>
    prodExhibitionByName.has(e.name),
  );

  // localExhibitionId -> 最終正式環境 id（沿用本地 id 或保留正式原本 id）
  const exhibitionIdMap = new Map<string, string>();
  for (const e of exhibitionsToCreate) {
    exhibitionIdMap.set(e.id, e.id);
  }
  for (const e of exhibitionsToUpdate) {
    const prodMatch = prodExhibitionByName.get(e.name)!;
    exhibitionIdMap.set(e.id, prodMatch.id);
  }

  console.log("=== Tag ===");
  console.log(`新增：${tagsToCreate.length} 筆`);
  for (const t of tagsToCreate) console.log(`  + ${t.name}`);
  console.log(`更新：${tagsToUpdate.length} 筆`);
  for (const t of tagsToUpdate) console.log(`  ~ ${t.name}`);
  console.log("");

  console.log("=== Exhibition ===");
  console.log(`新增：${exhibitionsToCreate.length} 筆（沿用本地 id）`);
  for (const e of exhibitionsToCreate) console.log(`  + ${e.name} (id=${e.id})`);
  console.log(`更新：${exhibitionsToUpdate.length} 筆（保留正式原本 id）`);
  for (const e of exhibitionsToUpdate) {
    const prodMatch = prodExhibitionByName.get(e.name)!;
    console.log(`  ~ ${e.name} (local id=${e.id} → prod id=${prodMatch.id})`);
  }
  console.log("");

  // ---- 3. ExhibitionTag：用前兩步的 id 對照重建 ----
  const tagsByLocalExhibition = new Map<string, string[]>();
  for (const et of localExhibitionTags) {
    const list = tagsByLocalExhibition.get(et.exhibitionId) ?? [];
    list.push(et.tagId);
    tagsByLocalExhibition.set(et.exhibitionId, list);
  }
  const localTagById = new Map(localTags.map((t) => [t.id, t]));

  console.log("=== ExhibitionTag（依 Exhibition 重建） ===");
  let totalRelations = 0;
  for (const e of localExhibitions) {
    const localTagIds = tagsByLocalExhibition.get(e.id) ?? [];
    const tagNames = localTagIds
      .map((id) => localTagById.get(id)?.name)
      .filter((name): name is string => Boolean(name));
    totalRelations += tagNames.length;
    console.log(`  ${e.name}: [${tagNames.join(", ")}]`);
  }
  console.log(`關聯總數：${totalRelations} 筆`);
  console.log("");

  if (dryRun) {
    console.log("dry-run 完成，未執行任何寫入。加上 --no-dry-run 以實際同步。");
    return;
  }

  // ---- 實際寫入（整包包在單一 transaction，任何一步失敗全部 rollback） ----

  await prodDb.$transaction(
    async (tx) => {
      // 1. Tag upsert（by name，id 由正式環境自行產生，不需保留本地 id）
      const tagIdMap = new Map<string, string>(); // localTagId -> prod tagId
      for (const t of localTags) {
        const prodTag = await tx.tag.upsert({
          where: { name: t.name },
          create: { name: t.name, category: t.category, isListed: t.isListed },
          update: { category: t.category, isListed: t.isListed },
        });
        tagIdMap.set(t.id, prodTag.id);
      }

      // 2. Exhibition：update 保留正式 id，create 沿用本地 id
      for (const e of exhibitionsToUpdate) {
        const prodMatch = prodExhibitionByName.get(e.name)!;
        await tx.exhibition.update({
          where: { id: prodMatch.id },
          data: exhibitionFields(e),
        });
      }
      for (const e of exhibitionsToCreate) {
        await tx.exhibition.create({
          data: { id: e.id, ...exhibitionFields(e) },
        });
      }

      // 3. ExhibitionTag：每個 Exhibition 先清空既有關聯再重建
      for (const e of localExhibitions) {
        const prodExhibitionId = exhibitionIdMap.get(e.id)!;
        const localTagIds = tagsByLocalExhibition.get(e.id) ?? [];
        const prodTagIds = localTagIds
          .map((id) => tagIdMap.get(id))
          .filter((id): id is string => Boolean(id));

        await tx.exhibitionTag.deleteMany({
          where: { exhibitionId: prodExhibitionId },
        });
        if (prodTagIds.length > 0) {
          await tx.exhibitionTag.createMany({
            data: prodTagIds.map((tagId) => ({
              exhibitionId: prodExhibitionId,
              tagId,
            })),
          });
        }
      }
    },
    { timeout: 60_000 },
  );

  console.log("同步完成。");
}

main()
  .then(async () => {
    await localDb.$disconnect();
    await prodDb.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await localDb.$disconnect();
    await prodDb.$disconnect();
    process.exit(1);
  });
