"use client"

import { useRouter, useSearchParams } from "next/navigation";

export default function TagFilter({
    tags,
}: {
    tags: { id: string; name: string; category: string }[];
}) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const current = searchParams.get("tags");
    const selected = current ? current.split(",") : [];

    // 点一个标签：已选就移除、没选就加入（这就是「可勾可退」的切换逻辑）
    function toggle(name: string) {
        const next = selected.includes(name)
            ? selected.filter((n) => n !== name) // 再点一次 → 取消选取
            : [...selected, name];               // 第一次点 → 加进清单

        // 把新的清单写回网址。有选就 ?tags=a,b，全空就回到乾净网址
        const query = next.length ? `?tags=${next.join(",")}` : "/";
        router.push(query); // ← 改网址。网址一变，Server Component 会重跑、重新查询
    }

    return (
        <div>
            {tags.map((tag) => (
                <button
                    key={tag.id}
                    onClick={() => toggle(tag.name)}
                    // 已选中的标签给个记号，让用户看得出选了哪些
                    style={{
                        fontWeight: selected.includes(tag.name) ? "bold" : "normal",
                    }}
                >
                    {tag.name}
                </button>
            ))}
        </div>
    );
}