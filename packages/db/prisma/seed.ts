import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../generated/prisma/client";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./prisma/dev.db",
});

const prisma = new PrismaClient({ adapter });

// ---------------------------------------------------------------
// 標籤清單
// SUBJECT = 題材（這個展是關於什麼）
// MOOD    = 氛圍（給人什麼感受）
// ---------------------------------------------------------------
const tags = [
  // 題材
  { name: "原住民文化", category: "SUBJECT" },
  { name: "傳統工藝", category: "SUBJECT" },
  { name: "當代藝術", category: "SUBJECT" },
  { name: "客家文化", category: "SUBJECT" },
  { name: "裝置藝術", category: "SUBJECT" },
  { name: "日本當代藝術", category: "SUBJECT" },
  { name: "攝影", category: "SUBJECT" },
  { name: "雕塑", category: "SUBJECT" },
  { name: "部落體驗", category: "SUBJECT" },

  // 氛圍
  { name: "文化傳承", category: "MOOD" },
  { name: "自然共生", category: "MOOD" },
  { name: "永續", category: "MOOD" },
  { name: "創意", category: "MOOD" },
  { name: "匠人精神", category: "MOOD" },
  { name: "絢爛", category: "MOOD" },
  { name: "好拍", category: "MOOD" },
  { name: "震撼", category: "MOOD" },
  { name: "親子", category: "MOOD" },
];

// ---------------------------------------------------------------
// 展覽清單
// tagNames 裡填標籤名稱即可，下面會自動接上關聯
// ---------------------------------------------------------------
const exhibitions = [
  {
    name: "植敘—排灣月桃編織的生命敘事 特展",
    startDate: new Date("2026-04-11"),
    endDate: new Date("2026-08-02"),
    city: "彰化縣",
    venue: "彰化縣原住民生活館（特展室）",
    location: "彰化縣中山路三段266-1號",
    ticketUrl: null,
    imageUrl: "https://event.moc.gov.tw/Public/Data/661210541815.jpg",
    description:
      "以「月桃」為主題，呈現排灣族如何善用山林資源發展傳統編織工藝。內容涵蓋植物知識、採集倫理、材料處理到編織技術，透過圖文展板、照片影像及實體展品，介紹月桃編織的文化脈絡與工藝故事，展現人與自然共生的智慧。",
    tagNames: ["原住民文化", "傳統工藝", "文化傳承", "自然共生"],
  },
  {
    name: "2026物件交換所",
    startDate: new Date("2026-06-07"),
    endDate: new Date("2026-08-09"),
    city: "臺北市",
    venue: "臺北市客家公園",
    location: "臺北市汀州路3段2號",
    ticketUrl: null,
    imageUrl: "https://event.moc.gov.tw/Public/Data/6678502871.jpg",
    description:
      "以「交換」為核心概念，邀請 10 組不同背景領域的藝術家走進客家公園，利用閒置物件進行創作，並交換彼此的創意與想像。藝術家透過解析物件背後的脈絡，拆解、重組與轉化，賦予舊物全新的樣貌與意義，回應客家文化中的惜物精神。",
    tagNames: ["當代藝術", "客家文化", "裝置藝術", "永續", "創意"],
  },
  {
    name: "AI工藝臺灣‧世代智慧",
    startDate: new Date("2026-01-01"),
    endDate: new Date("2026-12-31"),
    city: "臺北市",
    venue: "國立臺灣工藝研發發展中心（台北二樓）",
    location: "臺北市南海路41號二樓",
    ticketUrl: null,
    imageUrl: "https://event.moc.gov.tw/Public/Data/66169562671.jpg",
    description:
      "以「工藝智慧」（Artisanal Intelligence）重新詮釋 AI，強調手工技藝中「人、工具與真實材料」之間無可取代的關係。展覽梳理百年來臺灣工藝的發展，展出王清霜、陳萬能、粘碧華等匠師作品，展現臺灣工藝在多元互動中持續創生的生命力。",
    tagNames: ["傳統工藝", "文化傳承", "匠人精神"],
  },
  {
    name: "「當繁花盛開」日本當代藝術展",
    startDate: new Date("2026-03-28"),
    endDate: new Date("2026-08-30"),
    city: "屏東縣",
    venue: "屏菸1936文化基地",
    location: "屏東縣菸廠路1號",
    ticketUrl: null,
    imageUrl: "https://event.moc.gov.tw/Public/Data/64111559371.jpg",
    description:
      "以花的隱喻為引，呈現日本戰後至當代藝術的精神風貌。集結十六位日本藝術大師，包含井上有一、草間彌生、荒木經惟、奈良美智、村上隆、鹽田千春、名和晃平等，作品橫跨書道、繪畫、攝影、雕塑、裝置與流行視覺等領域。全票 249 元、優惠票 179 元。",
    tagNames: ["日本當代藝術", "當代藝術", "攝影", "雕塑", "絢爛", "好拍", "震撼"],
  },
  {
    name: "115年7月伊達邵地區藝文活動展演",
    startDate: new Date("2026-07-01"),
    endDate: new Date("2026-07-31"),
    city: "南投縣",
    venue: "邵族文化聚會所（日月潭國家風景區伊達邵）",
    location: "南投縣魚池鄉日月村義勇街62號",
    ticketUrl: "https://www.surveycake.com/s/NY8Xe",
    imageUrl: null,
    description:
      "邵族文化發展協會以「Kalapaw」（邵族語「瞭望台」之意）命名教室，帶領旅客用不同視角認識日月潭與邵族原住民文化。包含邵式生活行旅、特有文化導覽與多元體驗學堂三大體驗，手作 DIY 編織結合部落傳統智慧與當代生活。需線上預約。",
    tagNames: ["原住民文化", "部落體驗", "文化傳承", "親子"],
  },
];

async function main() {
  // 每次執行都清空重來，確保結果可預期
  // （Exhibition 的 onDelete: Cascade 會自動清掉 ExhibitionTag，
  //   這裡明確寫出來只是為了看得清楚順序）
  await prisma.exhibitionTag.deleteMany();
  await prisma.exhibition.deleteMany();
  await prisma.tag.deleteMany();

  // 建立標籤
  for (const tag of tags) {
    await prisma.tag.create({ data: tag });
  }
  console.log(`已建立 ${tags.length} 個標籤`);

  // 建立展覽，並接上對應的標籤
  for (const { tagNames, ...exhibition } of exhibitions) {
    await prisma.exhibition.create({
      data: {
        ...exhibition,
        tags: {
          create: tagNames.map((name) => ({
            tag: { connect: { name } },
          })),
        },
      },
    });
  }
  console.log(`已建立 ${exhibitions.length} 筆展覽`);

  // 順手驗證一下關聯有沒有真的接上
  const count = await prisma.exhibitionTag.count();
  console.log(`ExhibitionTag 共 ${count} 筆關聯`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });