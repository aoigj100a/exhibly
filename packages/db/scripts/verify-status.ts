import { prisma, taipeiToday, getExhibitions } from "../src/index";

async function main() {
  console.log("taipeiToday():", taipeiToday().toISOString());

  const all = await getExhibitions();
  const current = await getExhibitions({ status: "current" });
  const upcoming = await getExhibitions({ status: "upcoming" });
  const ended = await getExhibitions({ status: "ended" });

  console.log("getExhibitions() 筆數:", all.length);
  console.log("status=current 筆數:", current.length);
  console.log("status=upcoming 筆數:", upcoming.length);
  console.log("status=ended 筆數:", ended.length);

  console.log(
    "三態加總:",
    current.length + upcoming.length + ended.length,
  );

  console.log(
    "upcoming 展覽名稱:",
    upcoming.map((e) => e.name),
  );
  console.log(
    "ended 展覽名稱:",
    ended.map((e) => e.name),
  );

  const emptyTags = await getExhibitions({ tags: [] });
  console.log("getExhibitions({ tags: [] }) 筆數:", emptyTags.length);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
