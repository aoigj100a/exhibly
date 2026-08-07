import { prisma } from "../src/index";

// ---------------------------------------------------------------
// 標籤清單
// SUBJECT = 題材（這個展是關於什麼）→ 放寬，具體且可多
// MOOD    = 氛圍（給人什麼感受）  → 收斂，同義詞合併，篩選才有力
// ---------------------------------------------------------------
const tags = [
  // ---- 題材 SUBJECT ----
  { name: "原住民文化", category: "SUBJECT" },
  { name: "傳統工藝", category: "SUBJECT" },
  { name: "當代藝術", category: "SUBJECT" },
  { name: "客家文化", category: "SUBJECT" },
  { name: "裝置藝術", category: "SUBJECT" },
  { name: "日本當代藝術", category: "SUBJECT" },
  { name: "攝影", category: "SUBJECT" },
  { name: "雕塑", category: "SUBJECT" },
  { name: "繪畫", category: "SUBJECT" },
  { name: "部落體驗", category: "SUBJECT" },
  { name: "動漫", category: "SUBJECT" },
  { name: "插畫", category: "SUBJECT" },
  { name: "童話文學", category: "SUBJECT" },
  { name: "拉丁美洲藝術", category: "SUBJECT" },
  { name: "台灣文化", category: "SUBJECT" },

  // ---- 氛圍 MOOD ----
  { name: "文化傳承", category: "MOOD" },
  { name: "自然共生", category: "MOOD" },
  { name: "永續", category: "MOOD" },
  { name: "創意", category: "MOOD" },
  { name: "匠人精神", category: "MOOD" },
  { name: "絢爛", category: "MOOD" },
  { name: "好拍", category: "MOOD" },
  { name: "震撼", category: "MOOD" },
  { name: "親子", category: "MOOD" },
  { name: "療癒", category: "MOOD" },
  { name: "懷舊", category: "MOOD" }, // 併入「古早味」
  { name: "沉浸式", category: "MOOD" }, // 統一「沈浸式/沈浸式展覽」寫法
  { name: "奇幻", category: "MOOD" }, // 併入「超現實/如夢/探險」
];

// ---------------------------------------------------------------
// 展覽清單
// tagNames 裡填標籤名稱即可，下面會自動接上關聯
// isFree：true=免費 / false=售票（對應資料收集頁的「是否售票」）
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
    isFree: true,
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
    isFree: true,
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
    isFree: true,
    description:
      "以「工藝智慧」（Artisanal Intelligence）重新詮釋 AI，強調手工技藝中「人、工具與真實材料」之間無可取代的關係。展覽梳理百年來臺灣工藝的發展，展出王清霜、陳萬能、粘碧華等匠師作品，展現臺灣工藝在多元互動中持續創生的生命力。",
    tagNames: ["傳統工藝", "台灣文化", "文化傳承", "匠人精神"],
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
    isFree: false,
    price: "全票 249｜優惠票 179",
    openingHours: "週二至週日 09:00–17:00，週一休館",
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
    isFree: true,
    description:
      "邵族文化發展協會以「Kalapaw」（邵族語「瞭望台」之意）命名教室，帶領旅客用不同視角認識日月潭與邵族原住民文化。包含邵式生活行旅、特有文化導覽與多元體驗學堂三大體驗，手作 DIY 編織結合部落傳統智慧與當代生活。需線上預約。",
    tagNames: ["原住民文化", "部落體驗", "文化傳承", "親子"],
  },
  {
    name: "【櫻桃小丸子原作40週年】特展",
    startDate: new Date("2026-06-18"),
    endDate: new Date("2026-09-28"),
    city: "臺北市",
    venue: "松山文創園區 5號倉庫",
    location: "臺北市信義區光復南路133號",
    ticketUrl: "https://uevent.udnfunlife.com/maruko40tw",
    imageUrl:
      "https://imgs2.utiki.com.tw/Data/UTIKI_UDN//Images/UTK2431/P19BAHLP/202605120250574934%E5%94%AE%E7%A5%A8%E7%B6%B2_1920x1080_300K.jpg",
    isFree: false,
    price: "全票 480｜優待票 430",
    openingHours: "每日 10:00–18:00（17:30停止售票及入場）",
    description:
      "慶祝《櫻桃小丸子》原作誕生40週年，以原作為核心，串聯從漫畫誕生到動畫化的經典歷程。結合漫畫複製原稿展示、沉浸式光影體驗與互動拍照場景，共11個展區。現場設有限定商店販售40週年紀念商品。開放時間：每日10:00-18:00（17:30停止售票及入場）。",
    tagNames: ["動漫", "療癒", "懷舊", "好拍", "沉浸式"],
  },
  {
    name: "圓潤的魔法 波特羅特展",
    startDate: new Date("2026-06-19"),
    endDate: new Date("2026-10-11"),
    city: "臺北市",
    venue: "中正紀念堂 1展廳",
    location: "臺北市中正區中山南路21號",
    ticketUrl: null,
    imageUrl:
      "https://imgs2.utiki.com.tw/Data/UTIKI_UDN//Images/UTK2431/P18UR3V5/202606120453386936BTR_%E5%94%AE%E7%A5%A8%E7%B6%B2_1920x1080.jpg",
    isFree: false,
    price: "全票 380｜優待票 340",
    openingHours: "每日 10:00–18:00（17:30停止售票入場）",
    description:
      "哥倫比亞藝術大師費爾南多・波特羅（Fernando Botero）首度來台大型個展。以飽滿筆觸與誇大體積比例聞名，人物、動物與水果皆呈現圓滾滾姿態，形成獨樹一幟的「膨脹美學」。展出油畫、素描、水彩與立體雕塑共118件作品。營業時間：每日10:00-18:00（17:30停止售票入場）。",
    tagNames: ["當代藝術", "繪畫", "雕塑", "拉丁美洲藝術", "療癒", "好拍"],
  },
  {
    name: "九井諾子展 及 《迷宮飯》迷宮探索展 台灣站",
    startDate: new Date("2026-07-15"),
    endDate: new Date("2026-08-30"),
    city: "臺北市",
    venue: "台北三創生活園區 6樓 INCUBASE Arena Taipei",
    location: "臺北市中正區市民大道三段2號 6樓",
    ticketUrl: null,
    imageUrl:
      "https://res.klook.com/image/upload/v1780539605/admin-markdown/yuzydrni7idhdi9qup8h.jpg",
    isFree: false,
    description:
      "日本海外第三站，合併「九井諾子展」與「《迷宮飯》迷宮探索展」。九井諾子首個個展展出超過150件展品，包含早期作品插圖、複製手稿、首次公開繪畫影片及創作訪談。《迷宮飯》區域還原作品中的地下城場景，設有超大型炎龍、青蛙裝人形立牌等多處拍照景點，以及魔物料理食物模型展示。開放時間：週一至週日 11:00-19:00（18:30 停止售票入場）。",
    tagNames: ["動漫", "插畫", "奇幻", "好拍", "沉浸式"],
  },
  {
    name: "Lines of EVANGELION 新世紀福音戰士展：線 台北站",
    startDate: new Date("2026-08-14"),
    endDate: new Date("2026-10-04"),
    city: "臺北市",
    venue: "新光三越 台北信義新天地 A9 9F 宴會展演館",
    location: "臺北市信義區松壽路9號 9樓",
    ticketUrl: null,
    imageUrl:
      "https://res.klook.com/image/upload/fl_lossy.progressive,q_65/activities/q6pmfvy0h1fd5x7fwtto.webp",
    isFree: false,
    description:
      "以「線」為核心概念，重新解構《新世紀福音戰士》的視覺語言。展出由 Studio khara 提供、超過500件珍貴畫稿、設定資料及動畫製作素材。亮點包含五位駕駛員分類展示的手繪原畫、EVA 機體與使徒設定資料、全球首度公開的初號機 3D 建模裝置作品，以及結合光影與空間演出的沉浸式體驗。開放時間依平假日調整，最晚至 20:00。",
    tagNames: ["動漫", "攝影", "震撼", "沉浸式", "好拍", "懷舊"],
  },
  {
    name: "【亞洲首站】愛麗絲夢遊仙境：兔子洞的秘密｜沈浸式互動故事特展",
    startDate: new Date("2026-05-28"),
    endDate: new Date("2026-09-13"),
    city: "臺北市",
    venue: "松山文創園區 藝巷空間",
    location: "臺北市信義區光復南路133號",
    ticketUrl: null,
    imageUrl:
      "https://res.klook.com/image/upload/v1772613379/admin-markdown/uyllqhl3sn6cabs7bvdx.jpg",
    isFree: false,
    description:
      "小王子75週年策展團隊新作，亞洲首站。以實體裝置藝術、互動故事與五感體驗打造全實景沈浸式情境展，共13大故事展區。三大亮點：巨大古樹下的兔子洞與比例錯視時空廊道；比例崩壞的夢境縮放房間、瘋帽子茶會與會唱歌的花園；紅心審判與鏡像覺醒，最後於無限鏡像空間中由 AI 生成專屬的「全新愛麗絲」形象。展覽時間：11:00-19:00（最後入場 18:30）。",
    tagNames: ["裝置藝術", "童話文學", "奇幻", "好拍", "沉浸式", "親子"],
  },
  {
    name: "好想兔10週年特展【台味萬花筒｜人生百味瞑底加】",
    startDate: new Date("2026-06-06"),
    endDate: new Date("2026-08-30"),
    city: "高雄市",
    venue: "駁二藝術特區 自行車倉庫",
    location: "高雄市駁二藝術特區",
    ticketUrl: null,
    imageUrl:
      "https://res.klook.com/image/upload/fl_lossy.progressive,q_65/activities/xxdugycjmupgurzybtfr.webp",
    isFree: false,
    description:
      "國民 IP「好想兔」10 週年限定特展，在高雄駁二蓋了一座約 250 坪的時光機，帶大家回到 1980-1990 年代的台灣。以台灣味道、台灣記憶為主題的沉浸式特展，六大主題展區：電影院、島嶼居所、寶島曼波大道、冰宮 Disco、未來展望、老郵局。重建了麵店、照相館、冰果室、夜市、檳榔攤，每個場景都藏著台灣人共同的記憶。開放時間依平假日調整，最晚至 22:00。",
    tagNames: ["插畫", "台灣文化", "懷舊", "好拍", "沉浸式"],
  },
];

async function main() {
  // 每次執行都清空重來，確保結果可預期
  // （Exhibition 的 onDelete: Cascade 會自動清掉 ExhibitionTag，
  //   這裡明確寫出來只是為了看得清楚順序）
  await prisma.exhibitionTag.deleteMany();
  await prisma.exhibition.deleteMany();
  await prisma.tag.deleteMany();

  // 保護：展覽用到的標籤，一定要先在 tags 清單裡定義過，
  // 否則 connect 會在執行時才爆、且訊息不直觀。這裡先檢查，錯了立刻講清楚是哪個。
  const tagNameSet = new Set(tags.map((t) => t.name));
  for (const ex of exhibitions) {
    for (const name of ex.tagNames) {
      if (!tagNameSet.has(name)) {
        throw new Error(
          `展覽「${ex.name}」用到未定義的標籤「${name}」，請先加進 tags 清單`
        );
      }
    }
  }

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