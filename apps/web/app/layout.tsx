import type { Metadata } from "next";
import { Noto_Sans_TC, Space_Grotesk } from "next/font/google";
import "@exhibly/ui/globals.css";

// 全站中文本文與大部分標題用 Noto Sans TC（思源黑體），字重涵蓋
// 400/500/700/900，對應 codebase 實際用到的 font-medium/semibold/bold。
// 600 沒有對應字重檔，瀏覽器會退而選最近的 700，這是正常字型比對行為。
const notoSansTC = Noto_Sans_TC({
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  variable: "--font-noto-sans-tc",
  display: "swap",
});

// Space Grotesk 沒有中文字符，只給純西文的品牌字（首頁 "Exhibly" 大標）用，
// 透過 globals.css 的 --font-display token 搭配 font-display 這個 utility 套用。
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Exhibly｜用主題逛台灣的展覽",
  description:
    "以主題標籤搜尋台灣各地展覽，從「題材」與「氛圍」兩種入口切入，篩選出感興趣的展覽並查看詳情。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-Hant"
      className={`${notoSansTC.variable} ${spaceGrotesk.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
