// 展覽查詢層的唯讀盤點腳本：只查詢、不寫入，可安全重跑。
// 用途：印出目前資料庫依 statusWhere() 分出的三態筆數與名單，並列出
// getRecentExhibitions() 目前實際回傳的六筆 vs 模擬改法（current + startDate desc）
// 會回傳的六筆，方便並排比較。之後只要調整 getRecentExhibitions() 或其他
// 查詢層的排序/篩選邏輯，都可以重跑這支腳本確認「改前 vs 改後」差異。
import {
  prisma,
  taipeiToday,
  getExhibitions,
  getExhibitionStatus,
  getRecentExhibitions,
} from "../src/index";

function fmt(d: Date | null): string {
  return d ? d.toISOString().slice(0, 10) : "null";
}

async function main() {
  const today = taipeiToday();
  console.log("taipeiToday():", fmt(today));
  console.log();

  // A. 總筆數
  const all = await prisma.exhibition.findMany();
  console.log("A. 展覽總筆數:", all.length);
  console.log();

  // B. 依 statusWhere 分三態（沿用 getExhibitions()，它內部就是呼叫 statusWhere）
  const current = await getExhibitions({ status: "current" });
  const upcoming = await getExhibitions({ status: "upcoming" });
  const ended = await getExhibitions({ status: "ended" });

  console.log("B. 三態筆數");
  console.log("  current:", current.length);
  console.log("  upcoming:", upcoming.length);
  console.log("  ended:", ended.length);
  console.log("  三態加總:", current.length + upcoming.length + ended.length);
  console.log();

  console.log("  upcoming 展覽清單:");
  for (const e of upcoming) {
    console.log(`    - ${e.name} | start=${fmt(e.startDate)} end=${fmt(e.endDate)}`);
  }
  console.log("  ended 展覽清單:");
  for (const e of ended) {
    console.log(`    - ${e.name} | start=${fmt(e.startDate)} end=${fmt(e.endDate)}`);
  }
  console.log();

  // C. endDate 為 null
  const nullEnd = all.filter((e) => e.endDate === null);
  console.log("C. endDate 為 null 筆數:", nullEnd.length);
  for (const e of nullEnd) {
    console.log(`    - ${e.name} | start=${fmt(e.startDate)}`);
  }
  console.log();

  // D. 目前 getRecentExhibitions() 實際回傳
  const currentRecent = await getRecentExhibitions();

  // E. 模擬「where=statusWhere('current')、orderBy startDate desc、take 6」
  //    這裡另外組一次查詢，不動 getRecentExhibitions() 本身。
  const simulatedRecent = await prisma.exhibition.findMany({
    where: {
      startDate: { lte: today },
      OR: [{ endDate: null }, { endDate: { gte: today } }],
    },
    orderBy: { startDate: "desc" },
    take: 6,
  });

  console.log("D vs E 並排比較");
  console.log(
    "----------------------------------------------------------------",
  );
  const rows = Math.max(currentRecent.length, simulatedRecent.length);
  for (let i = 0; i < rows; i++) {
    const d = currentRecent[i];
    const e = simulatedRecent[i];
    const dStr = d
      ? `${d.name} | start=${fmt(d.startDate)} end=${fmt(d.endDate)} | status=${getExhibitionStatus(d)}`
      : "(無)";
    const eStr = e
      ? `${e.name} | start=${fmt(e.startDate)} end=${fmt(e.endDate)} | status=${getExhibitionStatus(e)}`
      : "(無)";
    console.log(`[D-${i + 1}] ${dStr}`);
    console.log(`[E-${i + 1}] ${eStr}`);
    console.log();
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
