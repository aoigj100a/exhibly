import { notFound } from "next/navigation";
import Link from "next/link";
import { getAllTags, getExhibitionById } from "@exhibly/db";
import { Button } from "@exhibly/ui/components/button";
import { updateExhibitionTags } from "../../actions";

const CATEGORY_LABEL: Record<string, string> = {
  SUBJECT: "題材",
  MOOD: "氛圍",
};

export default async function ExhibitionTagsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [exhibition, allTags] = await Promise.all([
    getExhibitionById(id),
    getAllTags(),
  ]);

  if (!exhibition) {
    notFound();
  }

  const selectedTagIds = new Set(exhibition.tags.map((et) => et.tagId));

  // 依 category 分組顯示，不要 28 個標籤混在一起
  const groups = new Map<string, typeof allTags>();
  for (const tag of allTags) {
    const group = groups.get(tag.category) ?? [];
    group.push(tag);
    groups.set(tag.category, group);
  }

  const updateTagsForExhibition = updateExhibitionTags.bind(null, id);

  return (
    <main className="mx-auto max-w-2xl px-6 py-12 sm:px-8">
      <header className="mb-8">
        <Link
          href="/"
          className="text-sm text-muted-foreground hover:underline"
        >
          ← 返回列表
        </Link>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">
          {exhibition.name}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">編輯標籤</p>
      </header>

      <form action={updateTagsForExhibition} className="space-y-8">
        {[...groups.entries()].map(([category, tags]) => (
          <fieldset key={category} className="space-y-3">
            <legend className="text-sm font-medium">
              {CATEGORY_LABEL[category] ?? category}
            </legend>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              {tags.map((tag) => (
                <label
                  key={tag.id}
                  className="flex items-center gap-1.5 text-sm"
                >
                  <input
                    type="checkbox"
                    name="tagIds"
                    value={tag.id}
                    defaultChecked={selectedTagIds.has(tag.id)}
                  />
                  {tag.name}
                </label>
              ))}
            </div>
          </fieldset>
        ))}

        <Button type="submit">儲存</Button>
      </form>
    </main>
  );
}
