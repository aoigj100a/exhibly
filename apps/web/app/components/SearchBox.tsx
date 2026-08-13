"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@exhibly/ui/components/button";

// 展覽名以中文為主，中文輸入法組字過程會一路觸發 onChange，若做即時搜尋
// 會在打字打到一半就送出半成品查詢——實作成本與體驗都不划算，所以刻意
// 包成 <form>，按 Enter 或點按鈕才送出，跟 onChange 即時搜尋是兩種設計。
export default function SearchBox() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const defaultValue = searchParams.get("q") ?? "";

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const q = String(formData.get("q") ?? "").trim();

    // ?tags= 是獨立參數，搜尋不能把它洗掉，原封不動帶著走（比照 TagFilter
    // 保留 ?status= 的寫法）；q 清空後要整個移除 ?q=，不留空字串參數。
    const params = new URLSearchParams();
    if (q) {
      params.set("q", q);
    }
    const tags = searchParams.get("tags");
    if (tags) {
      params.set("tags", tags);
    }

    const query = params.toString();
    router.push(query ? `/list?${query}` : "/list");
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        key={defaultValue}
        name="q"
        type="text"
        defaultValue={defaultValue}
        placeholder="搜尋展覽名稱"
        aria-label="搜尋展覽名稱"
        className="w-full min-w-0 rounded-md border border-border bg-background px-3 py-2 text-sm"
      />
      <Button type="submit" variant="outline" size="sm" className="shrink-0">
        搜尋
      </Button>
    </form>
  );
}
