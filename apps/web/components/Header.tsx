import Link from "next/link";

// 全站共用的品牌列，刻意只有站名、沒有導覽連結——目前只有三頁，
// 列表頁的入口是首頁的主題卡片，Header 上再放一條「所有展覽」只會
// 稀釋核心動線。不 sticky／不 fixed：那會一直佔著垂直空間，
// 跟 ADR-001 的大留白原則相衝。
export default function Header() {
  return (
    <header className="border-b border-border">
      <div className="mx-auto max-w-6xl px-6 py-5 sm:px-8 sm:py-6 lg:px-12">
        <Link
          href="/"
          className="font-display text-lg font-medium tracking-tight transition-opacity hover:opacity-70"
        >
          exhibly
        </Link>
      </div>
    </header>
  );
}
