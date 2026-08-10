"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@exhibly/ui/components/button";
import { tagToHsl } from "@/lib/tagColor";

export default function TagFilter({
  tags,
}: {
  tags: { id: string; name: string; category: string }[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const current = searchParams.get("tags");
  const selected = current ? current.split(",") : [];

  // 點一個標籤：已選就移除、沒選就加入（可勾可退的切換邏輯）
  function toggle(name: string) {
    const next = selected.includes(name)
      ? selected.filter((n) => n !== name) // 再點一次 → 取消選取
      : [...selected, name];               // 第一次點 → 加進清單

    // 用 URLSearchParams 組網址：它會自動處理中文編碼，跟首頁的 encodeURIComponent 對得起來。
    // ?status= 是獨立的參數，改標籤不能把它洗掉，所以原封不動帶著走；
    // 全空時退回只剩 ?status=（或完全沒有參數的 /list），不是 "/"（那是首頁，會把使用者彈走）。
    const params = new URLSearchParams();
    if (next.length > 0) {
      params.set("tags", next.join(","));
    }
    const status = searchParams.get("status");
    if (status) {
      params.set("status", status);
    }

    const query = params.toString();
    router.push(query ? `/list?${query}` : "/list");
  }

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => {
        const isSelected = selected.includes(tag.name);
        return (
          <Button
            key={tag.id}
            onClick={() => toggle(tag.name)}
            // 選中 = 實心(該標籤的莫蘭迪色)、未選 = 描邊，實心/空心的結構性對比
            // 不會因為色相相近就分不清楚——這是刻意保留 M2 的選中態辨識度。
            variant={isSelected ? "default" : "outline"}
            size="sm"
            className={isSelected ? "border-transparent text-gray-800 hover:opacity-90" : undefined}
            style={isSelected ? { backgroundColor: tagToHsl(tag.name) } : undefined}
          >
            {tag.name}
          </Button>
        );
      })}
    </div>
  );
}