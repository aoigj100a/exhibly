import type { Metadata } from "next";
import "@exhibly/ui/globals.css";

export const metadata: Metadata = {
  title: "Exhibly Admin",
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
