import Link from "next/link";
import { Card, CardContent } from "@exhibly/ui/components/card";

// 精選主題：目前寫死，之後要動態化（例如撈出展覽數最多的標籤）再改成從 db 撈。
const featured = ["動漫", "療癒", "原住民文化", "當代藝術", "沉浸式", "好拍"];

export default function Home() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-bold tracking-tight">Exhibly</h1>
        <p className="mt-2 text-muted-foreground">用主題逛台灣的展覽</p>
      </header>

      {/* 精選主題：每格是一張可點的 Card，整張包在 Link 裡。
          Link 會渲染成 <a>，所以整塊都在點擊範圍內，且不需要 "use client"。
          中文標籤用 encodeURIComponent 編碼，避免特殊字元把 query string 打亂。 */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {featured.map((name) => (
          <Link
            key={name}
            href={`/list?tags=${encodeURIComponent(name)}`}
            className="group"
          >
            <Card className="h-full transition-colors group-hover:border-primary">
              <CardContent className="flex h-24 items-center justify-center p-4">
                <span className="text-lg font-medium">{name}</span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mt-10 text-center">
        <Link
          href="/list"
          className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
        >
          看全部展覽
        </Link>
      </div>
    </main>
  );
}