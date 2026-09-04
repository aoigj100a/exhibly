import { notFound } from "next/navigation";
import Link from "next/link";
import { getAllTags, getExhibitionById } from "@exhibly/db";
import { Button } from "@exhibly/ui/components/button";
import { updateExhibitionTags } from "../../actions";
import TagCheckboxGroups from "../../components/TagCheckboxGroups";

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
        <TagCheckboxGroups tags={allTags} selectedTagIds={selectedTagIds} />

        <Button type="submit">儲存</Button>
      </form>
    </main>
  );
}
