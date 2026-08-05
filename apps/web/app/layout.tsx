import type { Metadata } from "next";
import "@exhibly/ui/globals.css";

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
    <html lang="zh-Hant">
      <body>{children}</body>
    </html>
  );
}
